#####################################################################
#
# mixer.py
#
# Copyright (c) 2015, Eran Egozy
#
# Released under the MIT License (http://opensource.org/licenses/MIT)
#
#####################################################################

import numpy as np


class Mixer(object):
   def __init__(self):
      super(Mixer, self).__init__()
      self.generators = []
      self.gain = 0.5
      self.pan  = 0.5

   def add(self, gen) :
      self.generators.append(gen)

   def remove(self, gen) :
      self.generators.remove(gen)
   
   def remove_all(self):
      self.generators = []

   def set_gain(self, gain) :
      self.gain = gain

   def set_pan(self, pan) :
      self.pan = pan

   def get_gain(self) :
      return self.gain

   def get_num_generators(self) :
      return len(self.generators)

   def generate(self, num_frames, num_channels) :
      output = np.zeros(num_frames * num_channels, dtype=np.float32)

      # this calls generate() for each generator. generator must return:
      # (signal, keep_going). If keep_going is True, it means the generator
      # has more to generate. False means generator is done and will be
      # removed from the list. signal must be a numpay array of length
      # num_frames * num_channels (or less)
      kill_list = []
      for g in self.generators:
         (signal, keep_going) = g.generate(num_frames, num_channels)
         # works if returned signal is shorter than output as well.
         output[:len(signal)] += signal
         if not keep_going:
            kill_list.append(g)

      # remove generators that are done
      for g in kill_list:
         self.generators.remove(g)

      output *= self.gain

      if num_channels == 2 and self.pan != 0.5:
         # use "sine panning":
         output[0::2] *= np.sin(self.pan * np.pi * 0.5)
         output[1::2] *= np.cos(self.pan * np.pi * 0.5)


      return (output, True)
