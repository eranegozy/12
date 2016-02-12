# python audio system for *12*

import sys
import os.path
import traceback

from core import *
from audio import *
from mixer import *
from wavegen import *
from wavesrc import *
from clock import *

from messanger import Messanger
from kivy.uix.label import Label


kAqua1a = { 'allow_stop': False,
            'sched' : 1,
            'tempo': (60, 120, 1) }

kAqua1b = { 'allow_stop': True,
            'sched' : 2,
            'tempo': (60, 120, 1) }


gConfig = {
  'sections': (
    { 'name': 'Aquarius',
      'instruments': (
         {  'name': 'glockenspiel',
            'synth': ('wavedir', 'aqua1'),
            'player': ('multi', 
                        ('cycle', ('seq', kAqua1a, ((60, 0), (60, 1), (60, 2))),
                                  ('seq', kAqua1a, ((60, 0), (60, 2), (60, 1))),
                                  ('seq', kAqua1a, ((60, 4), (60, 3), (60, 2))),),

                        ('cycle', ('seq', kAqua1b, ((360, 10), (420, 10), (240, 10))), 
                                  ('seq', kAqua1b, ((360, 14), (420, 14), (240, 14))),), )
         },
         {  'name': 'rolling pecans and sand',
            'synth': ('waveset', 'woodblock_samples.wav', 5),
            'player': ('index_player',) 
         },
         {  'name': 'toy hose',
            'synth': ('waveset', 'woodblock_samples.wav', 5),
            'player': ('index_player',) 
         },
         )},

    { 'name':"Scorpio",
      'instruments': (
         {  'name': 'woodblock1',
            'synth': ('waveset', 'woodblock_samples.wav', 5),
            'player': ('index_player',) }
         ,
         {  'name': 'woodblock2',
            'synth': ('waveset', 'woodblock_samples.wav', 5),
            'player': ('step_player', (0,1,4,3,1,2,1,0,0))
         }
         ,
         {  'name': 'woodblock3',
            'synth': ('waveset', 'woodblock_samples.wav', 5),
            'player': ('auto_player', ((200, 0, 1), (200, 1, 1), (200, 4, 1), (200, 3, 1), (200, 1, 1), (200, 2, 1), (400, None, 0))) }
         )},

    { 'name':"ScorpioTest 3",
      'instruments': (
         {  'name': 'woodblock3',
            'synth': ('waveset', 'woodblock_samples.wav', 5),
            'player': ('auto_player', ((0, 1, 200), (1, 1, 200), (4, 1, 200), (3, 1, 200), (1, 1, 200), (2, 1, 200))) }
         ,
         {  'name': 'woodblock1',
            'synth': ('waveset', 'woodblock_samples.wav', 5),
            'player': ('index_player',) }
         ,
         {  'name': 'woodblock2',
            'synth': ('waveset', 'woodblock_samples.wav', 5),
            'player': ('step_player', (0,1,4,3,1,2,1,0,0)) }
         )}
  )
}


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
      self.mixer = mixer

      self.buffers = []
      dirpath = os.path.join("data", dirname)
      for f in os.listdir(dirpath):
         filepath = os.path.join(dirpath, f)
         if os.path.splitext(filepath)[1] == '.wav':
            b = WaveBuffer(filepath)
            self.buffers.append(b)

   def play(self, idx, gain) :
      print 'play', idx, gain
      buf = self.buffers[idx]
      gen = WaveGenerator(buf)
      gen.set_gain(gain)
      self.mixer.add(gen)

   def stop(self, idx) :
      pass


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
         self.input_axis = params[2]

   def control(self, msg):
      if self.sched and msg[2] == 'xy':
         bpm = np.interp(msg[3+self.input_axis], self.input_range, self.tempo_range)
         now_time = self.sched.get_time()
         self.sched.tempo_map.set_tempo(bpm, now_time)

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
      print msg
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


class IndexPlayer(object):
   def __init__(self, synth):
      super(IndexPlayer, self).__init__()
      self.synth = synth

   def control(self, msg):
      self.synth.play(msg[2], 1.0)


class StepPlayer(object):
   def __init__(self, sequence, synth):
      super(StepPlayer, self).__init__()
      self.sequence = sequence
      self.synth = synth
      self.idx = 0

   def control(self, msg):
      note = self.sequence[self.idx]
      self.synth.play(note, 1.0)
      self.idx = (self.idx + 1) % len(self.sequence)


class SequencePlayer(object):
   def __init__(self, params, sequence, synth, sound):
      super(SequencePlayer, self).__init__()
      self.sequence = sequence
      self.synth = synth
      
      self.loop       = getParam(params, 'loop', False)
      self.allow_stop = getParam(params, 'allow_stop', False)

      self.sched = None
      schednum = getParam(params, 'sched', None)
      if schednum == 1:
         self.sched = sound.sched1
      elif schednum == 2:
         self.sched = sound.sched2

      self.tempo_ctrl = TempoController(getParam(params, 'tempo', 60), self.sched)

      self.playing = False
      self.cmd = None


   def control(self, msg):
      if msg[2] == 'play' and not self.playing:
         self.playing = True
         now = self.sched.get_tick()
         self._play(now, 0)

      elif msg[2] == 'stop' and self.allow_stop and self.playing:
         self.playing = False
         self.sched.remove(self.cmd)

      elif msg[2] == 'xy':
         self.tempo_ctrl.control(msg)

   def _play(self, now, idx):
      # print 'play', now, idx
      dur = self.sequence[idx][0]
      note = self.sequence[idx][1]
      gain = 1.0
      if 2 < len(self.sequence[idx]):
         gain = self.sequence[idx][2]

      if note != None:
         self.synth.play(note, gain)

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
def make_player(config, synth, sound):
   if config[0] == 'multi':
      player = MultiPlayer()
      for c in config[1:]:
         player.add(make_player(c, synth, sound))

   elif config[0] == 'cycle':
      player = CyclePlayer()
      for c in config[1:]:
         player.add(make_player(c, synth, sound))

   elif config[0] == 'seq':
      player = SequencePlayer(config[1], config[2], synth, sound)

   elif config[0] == 'index_player':
      player = IndexPlayer(synth)

   elif config[0] == 'step_player':
      player = StepPlayer(config[1], synth)

   elif config[0] == 'auto_player':
      player = AutoPlayer(config[1], synth, self.sched)

   else:
      raise Exception('unknown player config:' + str(config[0]))
   return player



# ---------------------------------------------------
# Sound
#
class Sound(object):
   def __init__(self, config):
      super(Sound, self).__init__()
      self.config = config

      self.audio = Audio(2)
      self.mixer = Mixer()      
      self.sched1 = AudioScheduler(SimpleTempoMap(60))
      self.sched2 = AudioScheduler(SimpleTempoMap(120))

      self.audio.set_generator(self.sched1)
      self.sched1.set_generator(self.sched2)
      self.sched2.set_generator(self.mixer)

      self.instruments = None

   def _make_instrument(self, config) :
      print '\nmake inst'
      print config

      synth_config = config['synth']
      if synth_config[0] == 'waveset':
         synth = WaveSetSynth(synth_config[1], synth_config[2], self.mixer)
      elif synth_config[0] == 'wavedir':
         synth = WaveDirSynth(synth_config[1], self.mixer)
      else:
         raise Exception('unknown synth config:' + str(synth_config[0]))

      player_config = config['player']
      player = make_player(player_config, synth, self)
      return player

   def set_section(self, idx) :
      print 'setSection:', idx
      section_config = self.config['sections'][idx]
      inst_configs   = section_config['instruments']
      self.instruments = [self._make_instrument(c) for c in inst_configs]

   def on_control(self, msg):
      if self.instruments == None:
         return
      self.instruments[msg[0]].control(msg)

   def on_update(self):
      self.audio.on_update()

   def get_info_txt(self):
      text = 'load:%.2f\n' % self.audio.get_cpu_load()
      text += 'gain:%.2f\n' % self.mixer.get_gain()
      return text


class MainWidget(BaseWidget) :
   def __init__(self):
      super(MainWidget, self).__init__()

      self.messanger = None
      # self.messanger = Messanger(self.on_message)

      self.sound = Sound(gConfig)      

      self.info = Label(text = "text", pos=(200, 300), text_size=(400,400), valign='top')
      self.add_widget(self.info)

      self.cur_inst = 0
      self.cur_btn = 0
      self.last_x = 0
      self.last_y = 0

   def on_update(self) :
      if self.messanger:
         self.messanger.on_update()

      self._touch_move()
      self.sound.on_update()

      self.info.text = self.sound.get_info_txt()
      self.info.text += 'cur_inst:' + str(self.cur_inst) + '\n'
      if self.messanger:
         self.info.text += 'server connected:' + str(self.messanger.is_connected()) + '\n'
      else:
         self.info.text += 'no server mode'

   def on_key_down(self, keycode, modifiers):
      section = lookup(keycode[1], '1234', (0,1,2,3))
      if section != None:
         self.sound.set_section(section)

      inst = lookup(keycode[1], 'qwe', (0,1,2))
      if inst != None:
         self.cur_inst = inst

      btn = lookup(keycode[1], 'asd', (0,1,2))
      if btn != None:
         self.cur_btn = btn
         args = (self.cur_inst, btn, 'play')
         self.sound.on_control(args)

   def on_key_up(self, keycode):
      btn = lookup(keycode[1], 'asd', (0,1,2))
      if btn != None:
         args = (self.cur_inst, btn, 'stop')
         self.sound.on_control(args)

   def _touch_move(self):
      x, y = Window.mouse_pos
      x = float(x) / Window.width
      y = float(y) / Window.height

      if len(self.down_keys) and (self.last_x != x or self.last_y != y):
         args = (self.cur_inst, self.cur_btn, 'xy', x, y)
         self.sound.on_control(args)
         self.last_x = x
         self.last_y = y

   def on_message(self, msg, args) :
      try:
         if msg == '/sectionIdx':
            self.sound.set_section(args[0])
         elif msg == '/ctrl':
            self.sound.on_control(args)
      except Exception, e:
         traceback.print_exc()



run(MainWidget)
