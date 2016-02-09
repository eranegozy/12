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



gConfig = {
  'sections': [
    { 'name': "ScorpioTest 1",
      'instruments': [
         {  'name': 'woodblock2',
            'synth': ('waveset', 'woodblock_samples.wav', 5),
            'player': ('step_player', (0,1,4,3,1,2,1,0,0)) }
         ,
         {  'name': 'woodblock1',
            'synth': ('waveset', 'woodblock_samples.wav', 5),
            'player': ('index_player',) }
         ,
         {  'name': 'woodblock3',
            'synth': ('waveset', 'woodblock_samples.wav', 5),
            'player': ('auto_player', ((200, 0, 1), (200, 1, 1), (200, 4, 1), (200, 3, 1), (200, 1, 1), (200, 2, 1), (400, None, 0))) }
         ]},

    { 'name':"ScorpioTest 2",
      'instruments': [
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
         ]},

    { 'name':"ScorpioTest 3",
      'instruments': [
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
         ]}
  ]
}


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

# --------------------------------------------------
# Players:
#
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


class AutoPlayer(object):
   def __init__(self, sequence, synth, sched):
      super(AutoPlayer, self).__init__()
      self.sequence = sequence
      self.synth = synth
      self.sched = sched

      self.playing = False
      self.cmd = None

   def control(self, msg):
      if msg[1] == 'play' and msg[2] == 1 and not self.playing:
         self.playing = True
         now = self.sched.get_tick()
         self._play(now, 0)

      elif msg[1] == 'play' and msg[2] == 0 and self.playing:
         self.playing = False
         self.sched.remove(self.cmd)

   def _play(self, now, idx):
      # print 'play', now, idx
      note = self.sequence[idx][0]
      gain = self.sequence[idx][1]
      dur  = self.sequence[idx][2]
      if note != None:
         self.synth.play(note, gain)

      idx = (idx + 1) % len(self.sequence)

      next = now + dur
      self.cmd = self.sched.post_at_tick(next, self._play, idx)


# ---------------------------------------------------
# Sound
#
class Sound(object):
   def __init__(self, config):
      super(Sound, self).__init__()
      self.config = config

      self.audio = Audio(2)
      self.mixer = Mixer()
      self.sched = AudioScheduler(SimpleTempoMap(260))

      self.audio.set_generator(self.sched)
      self.sched.set_generator(self.mixer)

      self.instruments = None

   def _make_instrument(self, config) :
      print '\nmake inst'
      print config

      synth_config = config['synth']
      if synth_config[0] == 'waveset':
         synth = WaveSetSynth(synth_config[1], synth_config[2], self.mixer)
      else:
         raise Exception('unknown synth config:' + str(synth_config[0]))

      player_config = config['player']
      if player_config[0] == 'index_player':
         player = IndexPlayer(synth)

      elif player_config[0] == 'step_player':
         player = StepPlayer(player_config[1], synth)

      elif player_config[0] == 'auto_player':
         player = AutoPlayer(player_config[1], synth, self.sched)

      else:
         raise Exception('unknown player config:' + str(player_config[0]))

      return player

   def set_section(self, idx) :
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

      self.messanger = Messanger(self.on_message)

      self.sound = Sound(gConfig)      

      self.info = Label(text = "text", pos=(200, 300), text_size=(400,400), valign='top')
      self.add_widget(self.info)

   def on_update(self) :
      self.messanger.on_update()
      self.sound.on_update()

      self.info.text = self.sound.get_info_txt()
      self.info.text += 'server connected:' + str(self.messanger.is_connected())

   # def on_key_down(self, keycode, modifiers):
   #    buf = lookup(keycode[1], '12345', self.buffers)
   #    if buf:
   #       gen = WaveGenerator(buf)
   #       self.mixer.add(gen)

   #    gain = lookup(keycode[1], ('up', 'down'), (0.05, -0.05))
   #    if gain:
   #       self.mixer.set_gain(self.mixer.get_gain() + gain)

   def on_message(self, msg, args) :
      try:
         if msg == '/sectionIdx':
            self.sound.set_section(args[0])
         elif msg == '/ctrl':
            self.sound.on_control(args)
      except Exception, e:
         traceback.print_exc()



run(MainWidget)
