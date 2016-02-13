# python audio system for *12*

import sys
import traceback
from core import *
from messanger import Messanger
from sound import Sound
from kivy.uix.label import Label


# -----------------------------------------------------------------
# Aquarius
#

kAqua1a = { 'allow_stop': False, 'sched': 1, 'tempo': (60, 120, 1) }
kAqua1b = { 'allow_stop': True,  'sched': 2, 'tempo': (60, 120, 1) }
kAqua2a = { 'allow_stop': True, 'release': 1.0, 'volume': (-12, 0, 1) }
kAqua3a = { 'allow_stop': True, 'loop':True, 'attack': 0.1, 'release': 0.5, 'volume': (-18, 0, 1) }

gAquarius = {
   'name': 'Aquarius',
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
         'synth': ('wavedir', 'aqua2'),
         'player': ('multi',
                     ('cycle', ('sample', kAqua2a, 0),
                               ('sample', kAqua2a, 1), 
                               ('sample', kAqua2a, 2),),
                   ) 
      },
      {  'name': 'toy hose',
         'synth': ('wavedir', 'aqua3'),
         'player': ('axispicker', 0, ('sample', kAqua3a, 0), ('sample', kAqua3a, 1))
      },
      )}

# -----------------------------------------------------------------
# Taurus
#

kTaurus1a = { 'allow_stop': True, 'loop': True, 'sched': 1, 'tempo': 130 }
kPaperSeq = ((720, 0), (480, 0), (240, 0), (720, 0), (480, 0), (240, 0),
   (480, 0), (480, 0), (720, 0),  )

kLogDrumSeq = ((240, 2), (240, 3), (480, 1), (120, 2), (120, 2), (240, 3),
   (480, 1), (120, 2), (360, 3),  )

gTaurus = {
   'name':"Taurus",
   'instruments': (
      {  'name': 'scratchy paper',
         'synth': ('wavedir', 'taurus1'),
         'player': ('seq', kTaurus1a, kPaperSeq) }
      ,
      {  'name': 'maracs',
         'synth': ('waveset', 'woodblock_samples.wav', 5),
         'player': ('step_player', (0,1,4,3,1,2,1,0,0))
      }
      ,
      {  'name': 'log drum',
         'synth': ('waveset', 'woodblock_samples.wav', 5),
         'player': ('seq', kTaurus1a, kLogDrumSeq )
      })}

# -----------------------------------------------------------------
# Scorpio
#

gScorpio = {
   'name':"ScorpioTest 3",
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


# -----------------------------------------------------------------
# Leo
#

gConfig = {
  'sections': (gAquarius, gTaurus, gScorpio)
  }

gEnableOSC = True

class MainWidget(BaseWidget) :
   def __init__(self):
      super(MainWidget, self).__init__()

      self.messanger = None
      callback = None
      if gEnableOSC:
         self.messanger = Messanger(self.on_message)
         callback = self.messanger.send

      self.sound = Sound(gConfig, callback)

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


if 1 < len(sys.argv):
   if sys.argv[1] == 'test':
      global gEnableOSC
      gEnableOSC = False

run(MainWidget)
