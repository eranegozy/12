# python audio system for *12*

import sys
import traceback
from core import *
from messanger import Messanger
from sound import Sound
from kivy.uix.label import Label
from kivy.graphics.instructions import InstructionGroup, CanvasBase
from kivy.graphics import Color, Ellipse, Rectangle, Line

# -----------------------------------------------------------------
# Aquarius
#

kAqua1a = { 'allow_stop': False, 'sched': 1, 'tempo': (60, 120, 1) }
kAqua1b = { 'allow_stop': True,  'sched': 2, 'tempo': (60, 120, 1) }
kAqua2a = { 'release': 1.0, 'volume': (-18, 0, 1) }

kAqua3 =  { 'axis': 0, 'auto_trigger': True }
kAqua3a = { 'loop':True, 'attack': 0.1, 'release': 0.5, 'volume': (-18, 0, 1) }

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
         'player': ('axispicker', kAqua3, ('sample', kAqua3a, 0), ('sample', kAqua3a, 1))
      },
      )}

# -----------------------------------------------------------------
# Leo
#

kLeo1  = { 'axis': 1, 'auto_trigger': False }
kLeo1a = { 'allow_stop': False, 'sched': 1, 'tempo': 96 }
kLeo2a = { 'release': 10.0, 'volume': (-18, 0, 1) }
kLeo2b = { 'loop':True, 'release': 0.1, 'volume': (-18, 0, 1) }

gLeo = {
   'name':"Leo",
   'instruments': (
      {  'name': 'temple block',
         'synth': ('wavedir', 'leo1'),
         'player': ('multi',
            ('axispicker', kLeo1,
               ('seq', kLeo1a, ((320,0,.95), (320,2,.65), (320,3,.45))),
               ('seq', kLeo1a, ((160,0,.95), (160,2,.65), (160,3,.45))),
               ('seq', kLeo1a, ((80,0,.95), (80,1,.65), (80,2,.45))),
               ('seq', kLeo1a, ((60,0,.95), (60,1,.65), (60,2,.45), (60,3,.25))), ),
            ('axispicker', kLeo1,
               ('seq', kLeo1a, ((320,3,.95), (320,2,.65), (320,0,.45))),
               ('seq', kLeo1a, ((160,3,.95), (160,2,.65), (160,0,.45))),
               ('seq', kLeo1a, ((80,2,.95), (80,1,.65), (80,0,.45))),
               ('seq', kLeo1a, ((60,3,.95), (60,2,.65), (60,1,.45), (60,0,.25))), ))
      }
      ,
      {  'name': 'tambourine',
         'synth': ('wavedir', 'leo2'),
         'player': ('multi', ('sample', kLeo2a, 0), ('sample', kLeo2b, 1))
      }
      ,
      {  'name': 'bass drum',
         'synth': ('wavedir', 'leo2'),
         'player': ('step_player', (0,1))
      })}


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



gConfig = {
  'sections': (gAquarius, gLeo, gTaurus)
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

      self.cur_region = None
      self.cur_section = None
      self.cur_inst = 0

      self.num_regions = 1

      with self.canvas:
         self.display = CanvasBase()


   def on_update(self) :
      if self.messanger:
         self.messanger.on_update()

      self.sound.on_update()

      self.info.text = self.sound.get_info_txt()
      self.info.text += 'cur_inst:' + str(self.cur_inst) + '\n'
      if self.messanger:
         self.info.text += 'server connected:' + str(self.messanger.is_connected()) + '\n'
      else:
         self.info.text += 'no server mode'

   def _setup_inst(self):
      # find number of regions
      self.num_regions = 1

      if self.cur_section != None and self.cur_inst != None:
         player_config = gConfig['sections'][self.cur_section]['instruments'][self.cur_inst]['player']
         if player_config[0] == 'multi':
            self.num_regions = len(player_config) - 1

      self.display.clear()

      x = 0
      w = Window.width / self.num_regions
      for r in range(self.num_regions):
         line = Line(points=(x,0,x,Window.height), width=2)
         self.display.add(line)
         x += w

   def on_key_down(self, keycode, modifiers):
      section = lookup(keycode[1], '1234', (0,1,2,3))
      if section != None:
         self.cur_section = section
         self.sound.set_section(section)

      inst = lookup(keycode[1], 'qwe', (0,1,2))
      if inst != None:
         self.cur_inst = inst

      self._setup_inst()


   def _spos_to_xy(self, spos):
      x = spos[0] * self.num_regions - self.cur_region
      x = min(max(x, 0), 1)
      y = spos[1]
      return x,y

   def on_touch_down(self, touch):
      self.cur_region = int(touch.spos[0] * self.num_regions)
      self.cur_region = min(self.cur_region, self.num_regions-1)
      x, y = self._spos_to_xy(touch.spos)
      msg = (self.cur_inst, self.cur_region, 'play', x, y)
      print msg
      self.sound.on_control(msg)

   def on_touch_up(self, touch):
      x, y = self._spos_to_xy(touch.spos)
      msg = (self.cur_inst, self.cur_region, 'stop', x, y)
      print msg
      self.sound.on_control(msg)
      self.cur_region = None

   def on_touch_move(self, touch):
      if self.cur_region != None:
         x, y = self._spos_to_xy(touch.spos)
         msg = (self.cur_inst, self.cur_region, 'xy', x, y)
         print msg
         self.sound.on_control(msg)
   
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
