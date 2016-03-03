# python audio system for *12*

import sys
import os.path
import traceback

from audio import *
from mixer import *
from wavegen import *
from wavesrc import *
from clock import *
from writer import *




def getParam(params, key, default):
   if not params.has_key(key):
      return default
   return params[key]


# --------------------------------------------------
# Synth types
#
class WaveSetSynth(object):
   def __init__(self, filename, num, mixer):
      super(WaveSetSynth, self).__init__()
      self.mixer = mixer

      self.buffers = []
      path = os.path.join("data", filename)
      for n in range(num):
         b = WaveBuffer(path, int(kSampleRate * n), int(kSampleRate))
         self.buffers.append(b)

   def play(self, idx, gain) :
      buf = self.buffers[idx]
      gen = WaveGenerator(buf)
      gen.set_gain(gain)
      self.mixer.add(gen)

   def stop(self, idx) :
      pass


class WaveDirSynth(object):
   def __init__(self, dirname, mixer):
      super(WaveDirSynth, self).__init__()
      self.mixer = Mixer()
      mixer.add(self.mixer)

      self.buffers = []
      dirpath = os.path.join("data", dirname)
      for f in os.listdir(dirpath):
         filepath = os.path.join(dirpath, f)
         if os.path.splitext(filepath)[1] == '.wav':
            b = WaveBuffer(filepath)
            self.buffers.append(b)

      self.notes_on = []
      self.gain = 1.0
      self.m_gain = 1.0

   # adjust gain of all currenlty playing notes
   def set_volume(self, vol):
      self.gain = 10.0 ** (vol/20.0)
      self.mixer.set_gain(self.gain * self.m_gain)

   def set_master_volume(self, vol):
      self.m_gain = 10.0 ** (vol/20.0)
      self.mixer.set_gain(self.gain * self.m_gain)

   def play(self, idx, gain, loop = False, atime = 0) :
      buf = self.buffers[idx]
      gen = WaveGenerator(buf, loop, atime)
      gen.set_gain(gain)
      self.mixer.add(gen)
      self.notes_on.append((idx, gain, gen))

   def stop(self, idx, rtime = 0) :
      for n in self.notes_on:
         if n[0] == idx:
            n[2].release(rtime)
            self.notes_on.remove(n)
            return

# -----------------------------------------------
# Controllers
#
class TempoController(object):
   def __init__(self, params, sched):
      super(TempoController, self).__init__()

      # if params is just a fixed tempo, set it now and we're done
      if isinstance(params, (int, float, long)):
         self.sched = None
         now_time = sched.get_time()
         sched.tempo_map.set_tempo(params, now_time)
      else:
         self.sched = sched
         self.tempo_range = np.array((params[0], params[1]))
         self.input_range = np.array((0, 1))
         self.axis_num = params[2]

   def control(self, msg):
      if self.sched:
         bpm = np.interp(msg[3+self.axis_num], self.input_range, self.tempo_range)
         now_time = self.sched.get_time()
         self.sched.tempo_map.set_tempo(bpm, now_time)


class VolumeController(object):
   def __init__(self, params, synth):
      super(VolumeController, self).__init__()
      self.synth = synth
      self.volume_range = np.array((params[0], params[1]))
      self.input_range = np.array((0, 1))
      self.axis_num = params[2]
   
   def control(self, msg):
      vol = np.interp(msg[3+self.axis_num], self.input_range, self.volume_range)
      self.synth.set_volume(vol)


class VelocityController(object):
   def __init__(self, params):
      super(VelocityController, self).__init__()
      self.volume_range = np.array((params[0], params[1]))
      self.input_range = np.array((0, 1))
      self.axis_num = params[2]
      self.gain = 1

   def control(self, msg):
      vol = np.interp(msg[3+self.axis_num], self.input_range, self.volume_range)
      gain = 10.0 ** (vol/20.0)
      self.gain = gain


   def get_gain(self):
      return self.gain

# --------------------------------------------------
# Players:
#
class MultiPlayer(object):
   def __init__(self):
      super(MultiPlayer, self).__init__()
      self.players = []

   def add(self, p):
      self.players.append(p)

   # dispatch to correct sub-player
   def control(self, msg):
      btn = msg[1]
      self.players[btn].control(msg)


class CyclePlayer(object):
   def __init__(self):
      super(CyclePlayer, self).__init__()
      self.players = []
      self.idx = 0

   def add(self, p):
      self.players.append(p)

   # dispatch to correct player. advance index after 'stop' cmd is seend
   def control(self, msg):
      self.players[self.idx].control(msg)
      cmd = msg[2]
      if cmd == 'stop':
         self.idx = (self.idx + 1) % len(self.players)


class AxisPickerPlayer(object):
   def __init__(self, params):
      super(AxisPickerPlayer, self).__init__()
      self.players = []
      self.axis_num     = getParam(params, 'axis', 0)
      self.auto_trigger = getParam(params, 'auto_trigger', False)
      self.cur_player = None

      self.play_idx = 0

   def add(self, p):
      self.players.append(p)

   def control(self, msg):

      # find new play_idx
      # TODO - hysteresis
      old_idx = self.play_idx
      x = msg[3+self.axis_num]
      num = len(self.players)
      self.play_idx = min(num-1, int(x * num))

      if msg[2] == 'play':
         self._start_player(self.play_idx, msg)

      elif msg[2] == 'stop':
         self._stop_player(msg)

      elif msg[2] == 'xy':
         if self.auto_trigger and old_idx != self.play_idx:
            self._start_player(self.play_idx, msg)
         if self.cur_player:
            self.cur_player.control(msg)

   def _start_player(self, p, msg):
      if self.cur_player:
         self._stop_player(msg)
      new_msg = (msg[0], msg[1], 'play', msg[3], msg[4])
      self.cur_player = self.players[p]
      self.cur_player.control(new_msg)
      
   def _stop_player(self, msg):
      if self.cur_player:
         new_msg = (msg[0], msg[1], 'stop', msg[3], msg[4])
         self.cur_player.control(new_msg)
         self.cur_player = None


class SamplePlayer(object):
   def __init__(self, params, note, idx, synth, cb_func):
      super(SamplePlayer, self).__init__()
      self.note = note
      self.synth = synth
      self.inst_id = idx      
      self.cb_func = cb_func
      self.release_time = getParam(params, 'release', 0)
      self.attack_time  = getParam(params, 'attack', 0)
      self.loop         = getParam(params, 'loop', False)
      self.viz_sus      = getParam(params, 'viz_sus', self.loop)

      self.volume_ctrl = None
      vp = getParam(params, 'volume', None)
      if vp:
         self.volume_ctrl = VolumeController(vp, synth)

      self.velocity_ctrl = None
      vp = getParam(params, 'velocity', None)
      if vp:
         self.velocity_ctrl = VelocityController(vp)

   def control(self, msg):
      if self.volume_ctrl:
         self.volume_ctrl.control(msg)

      if self.velocity_ctrl:
         self.velocity_ctrl.control(msg)

      if msg[2] == 'play':
         if self.velocity_ctrl:
            gain = self.velocity_ctrl.get_gain()
         else:
            gain = 1.0
         self.synth.play(self.note, gain, self.loop, self.attack_time)
         if self.viz_sus:
            self.cb_func(self.inst_id, 'on')
         else:
            self.cb_func(self.inst_id, 'hit')

      elif msg[2] == 'stop':
         self.synth.stop(self.note, self.release_time)
         if self.viz_sus:
            self.cb_func(self.inst_id, 'off')


class SequencePlayer(object):
   def __init__(self, params, sequence, idx, synth, sound, cb_func):
      super(SequencePlayer, self).__init__()
      self.sequence = sequence
      self.synth = synth
      self.cb_func = cb_func
      self.inst_id = idx

      self.loop       = getParam(params, 'loop', False)
      self.allow_stop = getParam(params, 'allow_stop', False)
      self.viz_type   = getParam(params, 'viz', 'all');

      self.sched = None
      schednum = getParam(params, 'sched', None)
      if schednum == 1:
         self.sched = sound.sched1
      elif schednum == 2:
         self.sched = sound.sched2

      self.tempo_ctrl = TempoController(getParam(params, 'tempo', 60), self.sched)

      self.volume_ctrl = None
      vp = getParam(params, 'volume', None)
      if vp:
         self.volume_ctrl = VolumeController(vp, synth)

      self.playing = False
      self.cmd = None

   def control(self, msg):
      self.tempo_ctrl.control(msg)
      if self.volume_ctrl:
         self.volume_ctrl.control(msg)
         
      if msg[2] == 'play' and not self.playing:
         self.playing = True
         now = self.sched.get_tick()
         self._play(now, 0)

      elif msg[2] == 'stop' and self.allow_stop and self.playing:
         self.playing = False
         self.sched.remove(self.cmd)


   def _play(self, now, idx):
      # print 'play', now, idx
      dur = self.sequence[idx][0]
      note = self.sequence[idx][1]
      gain = 1.0
      if 2 < len(self.sequence[idx]):
         gain = self.sequence[idx][2]

      # play the note
      if note != None:
         self.synth.play(note, gain)
         # viz callback: either first note or all notes:
         if idx==0 or self.viz_type=='all':
            self.cb_func(self.inst_id, 'hit')

      # advance idx and possibly loop back to start
      idx += 1
      if idx == len(self.sequence) and self.loop:
         idx = 0

      # play next if we can
      if idx < len(self.sequence):
         next = now + dur
         self.cmd = self.sched.post_at_tick(next, self._play, idx)
      else:
         self.playing = False


# player factory
def make_player(config, idx, synth, sound):

   if config[0] == 'multi':
      player = MultiPlayer()
      for c in config[1:]:
         player.add(make_player(c, idx, synth, sound))

   elif config[0] == 'cycle':
      player = CyclePlayer()
      for c in config[1:]:
         player.add(make_player(c, idx, synth, sound))

   elif config[0] == 'axispicker':
      player = AxisPickerPlayer(config[1])
      for c in config[2:]:
         player.add(make_player(c, idx, synth, sound))

   elif config[0] == 'seq':
      player = SequencePlayer(config[1], config[2], idx, synth, sound, sound.viz_cb)

   elif config[0] == 'sample':
      player = SamplePlayer(config[1], config[2], idx, synth, sound.viz_cb)

   else:
      raise Exception('unknown player config:' + str(config[0]))
   return player



# ---------------------------------------------------
# Sound
#
class Sound(object):
   def __init__(self, config, cb_func= None):
      super(Sound, self).__init__()
      self.config = config
      self.cb_func = cb_func

      self.writer = AudioWriter('data')
      self.audio = Audio(2, self.writer.add_audio)
      self.mixer = Mixer()      
      self.sched1 = AudioScheduler(SimpleTempoMap(60))
      self.sched2 = AudioScheduler(SimpleTempoMap(120))

      self.audio.set_generator(self.sched1)
      self.sched1.set_generator(self.sched2)
      self.sched2.set_generator(self.mixer)

      self.section_name = 'None'
      self.instruments = None

   def _make_instrument(self, config, idx) :
      # print '\nmake inst'
      # print config


      synth_config = config['synth']
      if synth_config[0] == 'waveset':
         synth = WaveSetSynth(synth_config[1], synth_config[2], self.mixer)
      elif synth_config[0] == 'wavedir':
         synth = WaveDirSynth(synth_config[1], self.mixer)
      else:
         raise Exception('unknown synth config:' + str(synth_config[0]))

      player_config = config['player']
      player = make_player(player_config, idx, synth, self)
      return player, synth

   def _clear_instruments(self):
      # clear current mixer:
      self.mixer.remove_all()
      self.sched1.remove_all()
      self.sched2.remove_all()

   def set_section(self, idx) :
      print 'setSection:', idx
      self._clear_instruments()

      if isinstance(idx, int):
         section_config = self.config['sections'][idx]
         self.section_name = section_config['name']
         inst_configs   = section_config['instruments']
         self.instruments = [self._make_instrument(c, idx) for idx, c in enumerate(inst_configs)]
      else:
         self.instruments = None
         self.section_name = 'None'
      # self.writer.toggle()

   # msg = (player_idx, subinst_id, cmd, param)
   def on_control(self, msg):
      if self.instruments == None:
         return
      player_idx = msg[0]
      self.instruments[player_idx][0].control(msg)

   # set the master volume of an instrment for the currently active section
   def set_master_volume(self, idx, vol):
      if self.instruments == None:
         return
      self.instruments[idx][1].set_master_volume(vol)

   def viz_cb(self, inst_id, msg):
      print inst_id, msg
      if self.cb_func:
         self.cb_func((inst_id, msg))

   def on_update(self):
      self.audio.on_update()

   def get_info_txt(self):
      text = 'load:%.2f\n' % self.audio.get_cpu_load()
      text += 'gain:%.2f\n' % self.mixer.get_gain()
      text += 'gens:%s\n' % [m.get_num_generators() for m in self.mixer.generators]
      text += 'cur_section: %s\n' % self.section_name
      return text

