#####################################################################
#
# wavegen.py
#
# Copyright (c) 2016, Eran Egozy
#
# Released under the MIT License (http://opensource.org/licenses/MIT)
#
#####################################################################


import numpy as np
from audio import kSampleRate

# generates audio data by asking an audio-source (ie, WaveFile) for that data.
class WaveGenerator(object):
   def __init__(self, wave_source, loop=False):
      super(WaveGenerator, self).__init__()
      self.source = wave_source
      self.loop = loop
      self.frame = 0
      self.paused = False
      self._release = None
      self.gain = 1.0

   def reset(self):
      self.paused = True
      self.frame = 0

   def play_toggle(self):
      self.paused = not self.paused

   def play(self):
      self.paused = False

   def pause(self):
      self.paused = True

   def release(self, time = 0):
      if time == 0:
         time = 0.001

      self._release = ReleaseEnvelope(time)

   def set_gain(self, g):
      self.gain = g

   def get_gain(self):
      return self.gain

   def generate(self, num_frames, num_channels) :
      if self.paused:
         output = np.zeros(num_frames * num_channels)
         return (output, True)

      # get data based on our position and requested # of frames
      output = self.source.get_frames(self.frame, self.frame + num_frames)
      output *= self.gain

      # check for end-of-buffer condition:
      actual_num_frames = len(output) / self.source.num_channels
      continue_flag = actual_num_frames == num_frames

      # advance current-frame
      self.frame += actual_num_frames

      # looping. If we got to the end of the buffer, don't actually end.
      # Instead, read some more from the beginning
      if self.loop and not continue_flag:
         continue_flag = True
         remainder = num_frames - actual_num_frames
         output = np.append(output, self.source.get_frames(0, remainder))
         actual_num_frames += remainder
         self.frame = remainder

      # release envelope
      if self._release:
         env = self._release.generate(actual_num_frames, self.source.num_channels)
         env_frames = len(env) / self.source.num_channels
         if env_frames < actual_num_frames:
            actual_num_frames = env_frames
            continue_flag = False
            output = env * output[:env_frames * self.source.num_channels]
         else:
            output *= env

      # convert mono to stereo:
      if self.source.num_channels == 1 and num_channels == 2:
         output = mono_to_stereo(output)

      # convert stereo to mono
      if self.source.num_channels == 2 and num_channels == 1:
         output = stereo_to_mono(output)

      # return
      return (output, continue_flag)



class ReleaseEnvelope(object):
   def __init__(self, release_time):
      super(ReleaseEnvelope, self).__init__()
      self.relase = release_time * kSampleRate
      self.frame = 0

   # linear decay
   def generate(self, num_frames, num_channels):
      m = -1.0 / (self.relase)
      if self.frame + num_frames > self.relase:
         num_frames = self.relase - self.frame
      end_frame = self.frame + num_frames
      x = np.arange(self.frame, end_frame)
      y = m * x + 1.0
      self.frame = end_frame

      if num_channels == 2:
         return mono_to_stereo(y)
      else:
         return y

class SpeedModulator(object):
   def __init__(self, generator, speed = 1.0):
      super(SpeedModulator, self).__init__()
      self.generator = generator
      self.speed = speed
   
   def set_speed(self, speed) :
      self.speed = speed

   def generate(self, num_frames, num_channels) :
      # optimization if speed is 1.0
      if self.speed == 1.0:
         return self.generator.generate(num_frames, num_channels)

      # otherwise, we need to ask self.generator for a number of frames that is
      # larger or smaller than num_frames, depending on self.speed
      adj_frames = int(round(num_frames * self.speed))

      # get data from generator
      data, continue_flag = self.generator.generate(adj_frames, num_channels)

      # split into multi-channels:
      data_chans = [ data[n::num_channels] for n in range(num_channels) ]

      # stretch or squash data to fit exactly into num_frames
      from_range = np.arange(adj_frames)
      to_range = np.arange(num_frames) * (float(adj_frames) / num_frames)
      resampled = [ np.interp(to_range, from_range, data_chans[n]) for n in range(num_channels) ]

      # convert back by interleaving into a single buffer
      output = np.empty(num_channels * num_frames, dtype=np.float32)
      for n in range(num_channels) :
         output[n::num_channels] = resampled[n]

      return (output, continue_flag)


# Some utitlity functions

def mono_to_stereo(buf):
   sz = len(buf)
   stereo = np.empty(sz * 2)
   stereo[0::2] = buf
   stereo[1::2] = buf
   return stereo

