# python audio system for *12*

import sys
import traceback

# set kivy window width/height
from kivy.config import Config 
Config.set('graphics', 'width', '400') 
Config.set('graphics', 'height', '600')

from core import *
from messanger import Messanger
from sound import Sound

from kivy.uix.label import Label
from kivy.graphics.instructions import InstructionGroup, CanvasBase
from kivy.graphics import Color, Ellipse, Rectangle, Line

# -----------------------------------------------------------------
# Taurus
#

kTaurus1a = { 'allow_stop': True, 'loop': True, 'sched': 1, 'tempo': 130, 'volume': (-18, 0, 1) }
kTaurus1Seq = ((720, 0), (480, 0), (240, 1), (720, 0), (480, 0), (240, 1),
   (480, 0), (480, 0), (720, 0),  )

kTaurus2 = { 'loop':True, 'release': 0.1, 'volume': (-12, 6, 1) }

kTaurus3  = { 'axis': 0, 'auto_trigger': True, 'volume': (-6, 12, 1) }
kTaurus3Seq1 = ((960, 0), (240, 1), )
kTaurus3Seq2 = ((240, 0), (960, 1), )
kTaurus3Seq3 = ((240, 0), (240, 1), (480, 2), (120, 3), (120, 3), (240, 1),
   (480, 2), (120, 3), (360, 1),  )

gTaurus = {
   'name':"Taurus",
   'instruments': (
      {  'name': 'scratchy paper',
         'synth': ('wavedir', 'taurus1'),
         'player': ('seq', kTaurus1a, kTaurus1Seq)
      },
      {  'name': 'maracs',
         'synth': ('wavedir', 'taurus2'),
         'player': ('sample', kTaurus2, 0)
      },
      {  'name': 'log drum',
         'synth': ('wavedir', 'taurus3'),
         'player': ('axispicker', kTaurus3,
                     ('seq', kTaurus1a, kTaurus3Seq1 ), 
                     ('seq', kTaurus1a, kTaurus3Seq2 ), 
                     ('seq', kTaurus1a, kTaurus3Seq3 ), )
      },
   )}


# -----------------------------------------------------------------
# Leo
#

kLeo1  = { 'axis': 0, 'auto_trigger': False }
kLeo1a = { 'allow_stop': False, 'sched': 1, 'tempo': 96, 'volume': (-18, 0, 1) }
kLeo2a = { 'release': 10.0, 'volume': (-18, 0, 1) }
kLeo2b = { 'loop':True, 'release': 0.1, 'volume': (-18, 0, 1) }
kLeo3  = { 'loop':False, 'release': 0.01, 'volume': (-18, 0, 1) }

gLeo = {
   'name':"Leo",
   'instruments': (
      {  'name': 'temple block',
         'synth': ('wavedir', 'leo1'),
         'player': ('multi',
            ('axispicker', kLeo1,
               ('seq', kLeo1a, ((320,0,.5), (320,2,.3), (320,3,.1))),
               ('seq', kLeo1a, ((160,0,.5), (160,2,.3), (160,3,.1))),
               ('seq', kLeo1a, ((80,0,.5), (80,1,.3), (80,2,.1))),
               ('seq', kLeo1a, ((60,0,.5), (60,1,.3), (60,2,.1), (60,3,.1))), ),
            ('axispicker', kLeo1,
               ('seq', kLeo1a, ((320,3,.5), (320,2,.3), (320,0,.1))),
               ('seq', kLeo1a, ((160,3,.5), (160,2,.3), (160,0,.1))),
               ('seq', kLeo1a, ((80,2,.5), (80,1,.3), (80,0,.1))),
               ('seq', kLeo1a, ((60,3,.5), (60,2,.3), (60,1,.1), (60,0,.1))), ))
      },

      {  'name': 'tambourine',
         'synth': ('wavedir', 'leo2'),
         'player': ('multi', ('sample', kLeo2a, 0), ('sample', kLeo2b, 1))
      },

      {  'name': 'guiro',
         'synth': ('wavedir', 'leo3'),
         'player': ('multi',
                     ('sample', kLeo3, 0),
                     ('cycle', ('sample', kLeo3, 1), 
                               ('sample', kLeo3, 2),),
                   )
      },
   )}


# -----------------------------------------------------------------
# Scorpio
#

kScorpio1 = { 'loop':True, 'release': 0.1, 'volume': (-12, 6, 1) }

gScorpio = {
   'name':"Scorpio",
   'instruments': (
      {  'name': 'maracs1',
         'synth': ('wavedir', 'scorpio1'),
         'player': ('sample', kScorpio1, 0)
      },

      {  'name': 'maracs2',
         'synth': ('wavedir', 'scorpio2'),
         'player': ('sample', kScorpio1, 0)
      },

      {  'name': 'maracs3',
         'synth': ('wavedir', 'scorpio3'),
         'player': ('sample', kScorpio1, 0)
      },
   )}


# -----------------------------------------------------------------
# Aquarius
#

kAqua1a = { 'allow_stop': False, 'sched': 1, 'tempo': (60, 120, 0), 'volume': (-18, 0, 1), 'viz':'first' }
kAqua1b = { 'allow_stop': True,  'sched': 2, 'tempo': (60, 120, 0), 'volume': (-18, 0, 1) }

kAqua2a = { 'release': 1.0, 'volume': (-18, 0, 1), 'viz_sus': True }

kAqua3 =  { 'axis': 0, 'auto_trigger': True }
kAqua3a = { 'loop':True, 'attack': 0.1, 'release': 0.5, 'volume': (-18, 0, 1) }

gAquarius = {
   'name': 'Aquarius',
   'instruments': (
      {  'name': 'glockenspiel',
         'synth': ('wavedir', 'aqua1'),
         'player': ('multi', 
                     ('cycle', ('seq', kAqua1a, ((60, 3, .3), (60, 2, .3), (60, 5, .3),)),
                               ('seq', kAqua1a, ((60, 1, .3), (60, 4, .3), (60, 3, .3),)),
                               ('seq', kAqua1a, ((60, 1, .3), (60, 0, .3), (60, 3, .3),)),),

                     ('cycle', ('seq', kAqua1b, ((320, 6, .3), (400, 6, .3), (240, 6, .3),)), 
                               ('seq', kAqua1b, ((320, 7, .3), (400, 7, .3), (240, 7, .3),)),), )
      },
      {  'name': 'rolling pecans and sand',
         'synth': ('wavedir', 'aqua2'),
         'player': ('cycle', ('sample', kAqua2a, 0),
                             ('sample', kAqua2a, 1), 
                             ('sample', kAqua2a, 2),),
      },
      {  'name': 'toy hose',
         'synth': ('wavedir', 'aqua3'),
         'player': ('axispicker', kAqua3, ('sample', kAqua3a, 0), ('sample', kAqua3a, 1))
      },
   )}





gConfig = {
  'sections': (gTaurus, gLeo, gScorpio, gAquarius)
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
      self.cur_inst = None

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

   def _set_section(self, sec_idx):
      self.cur_section = sec_idx
      self.sound.set_section(sec_idx)

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
      sec_idx = lookup(keycode[1], '12340', (0,1,2,3, 'none'))
      if sec_idx != None:
         if sec_idx == 'none':
            sec_idx = None
         self._set_section(sec_idx)

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
      if self.cur_inst != None:
         self.cur_region = int(touch.spos[0] * self.num_regions)
         self.cur_region = min(self.cur_region, self.num_regions-1)
         x, y = self._spos_to_xy(touch.spos)
         msg = (self.cur_inst, self.cur_region, 'play', x, y)
         self.sound.on_control(msg)

   def on_touch_up(self, touch):
      if self.cur_inst != None:
         x, y = self._spos_to_xy(touch.spos)
         msg = (self.cur_inst, self.cur_region, 'stop', x, y)
         self.sound.on_control(msg)
         self.cur_region = None

   def on_touch_move(self, touch):
      if self.cur_inst != None:
         if self.cur_region != None:
            x, y = self._spos_to_xy(touch.spos)
            msg = (self.cur_inst, self.cur_region, 'xy', x, y)
            self.sound.on_control(msg)
   
   def on_message(self, msg, args) :
      try:
         if msg == '/sectionIdx':
            self._set_section(args[0])
         elif msg == '/ctrl':
            self.sound.on_control(args)
      except Exception, e:
         traceback.print_exc()


if 1 < len(sys.argv):
   if sys.argv[1] == 'test':
      global gEnableOSC
      gEnableOSC = False

run(MainWidget)
