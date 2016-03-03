# python audio system for *12*

import sys
import traceback
import pickle

# set kivy window width/height
from kivy.config import Config 
Config.set('graphics', 'width', '700') 
Config.set('graphics', 'height', '600')

from core import *
from messanger import Messanger
from sound import Sound

from kivy.uix.label import Label
from kivy.uix.slider import Slider

from kivy.graphics.instructions import InstructionGroup, CanvasBase
from kivy.graphics import Color, Ellipse, Rectangle, Line

# -----------------------------------------------------------------
# Taurus
#

kTaurus1a = { 'allow_stop': True, 'loop': True, 'sched': 1, 'tempo': 105, 'volume': (-18, 0, 0) }
kTaurus1Seq1 = ((480, 0), (720, 1), (240, 2), (240, 3), (120, 4), (240, 5), (360, 3), )
kTaurus1Seq2 = ((240, 2), (480, 3), (480, 0), )
kTaurus1Seq3 = ((720, 0), (480, 1), (240, 2), (720, 0), (480, 1), (240, 2),
   (480, 1), (480, 1), (720, 0), (240, 2), )

kTaurus2a = { 'loop':False, 'release': 10., 'volume': (-18, 0, 0) }
kTaurus2b = { 'loop':True, 'attack': 0.2, 'release': 0.7, 'volume': (-18, 0, 0) }

kTaurus3a = { 'allow_stop': True, 'loop': True, 'sched': 1, 'tempo': 105, 'volume': (-18, 0, 0) }
kTaurus3Seq1 = ((960, 0), (240, 1), )
kTaurus3Seq2 = ((240, 2), (960, 3), )
kTaurus3Seq3 = ((240, 0), (240, 1), (480, 2), (120, 2), (120, 0), (240, 1),
   (480, 2), (120, 2), (360, 3),  )

gTaurus = {
   'name':"Taurus",
   'instruments': (
      {  'name': 'scratchy paper',
         'synth': ('wavedir', 'taurus1'),
         'player': ('multi', ('seq', kTaurus1a, kTaurus1Seq1),
                             ('seq', kTaurus1a, kTaurus1Seq2),
                             ('seq', kTaurus1a, kTaurus1Seq3), )         
      },
      {  'name': 'maracs',
         'synth': ('wavedir', 'taurus2'),
         'player': ('multi', ('cycle', ('sample', kTaurus2a, 0), ('sample', kTaurus2a, 1), ),
                             ('cycle', ('sample', kTaurus2b, 2), ('sample', kTaurus2b, 3), ), )
      },
      {  'name': 'log drum',
         'synth': ('wavedir', 'taurus3'),
         'player': ('multi',
                     ('seq', kTaurus3a, kTaurus3Seq1 ), 
                     ('seq', kTaurus3a, kTaurus3Seq2 ), 
                     ('seq', kTaurus3a, kTaurus3Seq3 ), )
      },
   )}


# -----------------------------------------------------------------
# Leo
#

kLeo1  = { 'axis': 1, 'auto_trigger': False }
kLeo1a = { 'allow_stop': False, 'sched': 1, 'tempo': 96, 'volume': (-18, 0, 0) }
kLeo1b = { 'allow_stop': True, 'sched': 1, 'tempo': 96, 'volume': (-18, 0, 0) }

kLeo2 =  {'axis': 1, 'auto_trigger': False}
kLeo2a = { 'release': 5.0, 'volume': (-24, 0, 0) }
kLeo2c = { 'loop': True, 'release': 0.8, 'volume': (-24, 0, 0) }
kLeo2b = { 'loop': False, 'release': 2.0, 'volume': (-24, 0, 0) }

kLeo3 = { 'axis': 1, 'auto_trigger': True }
kLeo3a  = { 'loop':True, 'attack': 0.25, 'release': 2.5, 'volume': (-22, 0, 0) }

gLeo = {
   'name':"Leo",
   'instruments': (
      {  'name': 'temple block',
         'synth': ('wavedir', 'leo1'),
         'player': ('multi',
            ('axispicker', kLeo1,
               ('seq', kLeo1b, ((320,0,1.0), (320,2,0.7), (320,3,0.5))),
               ('seq', kLeo1a, ((160,0,1.0), (160,2,0.7), (160,3,0.5))),
               ('seq', kLeo1a, ((80,0,1.0), (80,1,0.7), (80,2,0.5))),
               ('seq', kLeo1a, ((60,0,1.0), (60,1,0.7), (60,2,0.5), (60,3,0.5))), ),
            ('axispicker', kLeo1,
               ('seq', kLeo1b, ((320,3,1.0), (320,2,0.7), (320,0,0.5))),
               ('seq', kLeo1a, ((160,3,1.0), (160,2,0.7), (160,0,0.5))),
               ('seq', kLeo1a, ((80,2,1.0), (80,1,0.7), (80,0,0.5))),
               ('seq', kLeo1a, ((60,3,1.0), (60,2,0.7), (60,1,0.5), (60,0,0.5))), ))
      },

      {  'name': 'tambourine guiro',
         'synth': ('wavedir', 'leo2'),
         'player': ('multi', 
            ('cycle', # Tambourine hits
               ('sample', kLeo2a, 4), 
               ('sample', kLeo2a, 6),
               ('sample', kLeo2a, 5)),
            ('sample', kLeo2c, 7), # Tambourine roll
            ('axispicker', kLeo2, #Guiro 
               ('sample', kLeo2b, 2),             
               ('sample', kLeo2b, 0), 
               ('sample', kLeo2b, 3),
               ('sample', kLeo2b, 1)))
      },

      {  'name': 'bass drum',
         'synth': ('wavedir', 'leo3'),
         'player': ('axispicker', kLeo3,
                     ('sample', kLeo3a, 2),
                     ('sample', kLeo3a, 0),
                     ('sample', kLeo3a, 1)
                   )
      },
   )}


# -----------------------------------------------------------------
# Scorpio
#

# crotale:
kScor1  = { 'axis': 1, 'auto_trigger': False,  }
kScor1a = { 'loop':False, 'release': 2.0, 'velocity': (-30, 0, 0), 'volume':(0, 0, 0) }
kScor1b = { 'loop':False, 'release': 2.0, 'volume': (-24, -12, 0)}

# temple blocks:
kScor2 =  { 'axis': 1, 'auto_trigger': False }
kScor2a = { 'allow_stop': False, 'sched': 1, 'tempo': 100, 'volume': (-18, 0, 0) }

# gong
kScor3 = { 'loop':False, 'release': 3.0, 'velocity': (-18, 0, 0), 'volume':(0, 0, 0) }

gScorpio = {
   'name':"Scorpio",
   'instruments': (
      {  'name': 'crotale',
         'synth': ('wavedir', 'scorpio1'),
         'player': ('multi',
            ('axispicker', kScor1, ('sample', kScor1a, 0), ('sample', kScor1a, 2)),
            ('axispicker', kScor1, ('sample', kScor1b, 1), ('sample', kScor1b, 3)),)
      },

      {  'name': 'temple blocks',
         'synth': ('wavedir', 'scorpio2'),
         'player': ('axispicker', kScor2,
                     ('seq', kScor2a, ((120, 2, 1.), (120, 1, .5))),
                     ('seq', kScor2a, ((120, 3, 1.), (120, 1, .7), (120, 2, .5), (120, 0, .3), )),
                     ('seq', kScor2a, ((120, 3, 1.), (120, 2, .7), (120, 1, .5), (120, 0, .3), )),
                     ('seq', kScor2a, ((120, 0, 1.), (120, 1, .7), (120, 2, .5), (120, 3, .3), )), )

      },

      {  'name': 'gong',
         'synth': ('wavedir', 'scorpio3'),
         'player': ('multi', ('cycle', ('sample', kScor3, 0), # tapping gong
                                       ('sample', kScor3, 1), 
                                       ('sample', kScor3, 8), ),
                             ('cycle', ('sample', kScor3, 2),  # single hit 
                                       ('sample', kScor3, 3), ),
                             ('cycle', ('sample', kScor3, 4),  # going in water
                                       ('sample', kScor3, 5), 
                                       ('sample', kScor3, 6), 
                                       ('sample', kScor3, 7), ), )
      },
   )}


# -----------------------------------------------------------------
# Aquarius
#

kAqua1a = { 'allow_stop': False, 'sched': 1, 'tempo': (60, 120, 1), 'velocity': (-30, 0, 0), 'viz':'first' }
kAqua1b = { 'allow_stop': True,  'sched': 2, 'tempo': (60, 120, 1), 'velocity': (-30, 0, 0) }

kAqua2 = {'axis': 1, 'auto_trigger': True}
kAqua2c = {'axis': 1, 'auto_trigger': False}
kAqua2a = { 'release': 3.0, 'volume': (-18, 0, 0), 'loop':False, 'viz_sus': True }
kAqua2b = { 'release': 1.25, 'attack': 0.1, 'volume': (-18, 0, 0), 'loop':True}

kAqua3 =  { 'axis': 1, 'auto_trigger': True }
kAqua3a = { 'loop':True, 'attack': 0.25, 'release': 1.6, 'volume': (-22, 0, 0) }

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
         'player': ('multi',
                     ('cycle', ('sample', kAqua2a, 6), ('sample', kAqua2a, 5), ('sample', kAqua2a, 4),),
                     ('cycle', ('sample', kAqua2b, 0), ('sample', kAqua2b, 1), ('sample', kAqua2b, 2)))
      },
      {  'name': 'toy hose',
         'synth': ('wavedir', 'aqua3'),
         'player': ('axispicker', kAqua3, ('sample', kAqua3a, 0), ('sample', kAqua3a, 1), ('sample', kAqua3a, 2))
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

      self.control_loc = 400

      self.volumes = [[0, 0, 0],  [0, 0, 0], [0, 0, 0], [0, 0, 0], ]
      try:
         self.volumes = pickle.load(open('volumes.pickle'))
         print 'found volumes\n', self.volumes
      except Exception, e:
         pass

      with self.canvas:
         self.display = CanvasBase()
         Line(points=(self.control_loc,0, self.control_loc, Window.height), width=2)


      self.vol_sliders = []
      self.vol_labels = []
      sz = Window.width / 4
      for i in range(3):
         s = Slider(min=-30, max=12, value=0, pos=(self.control_loc + 30, 400 - i*100), size = (sz, 50))
         s.bind(value=self.on_slider_value)
         self.add_widget(s)
         self.vol_sliders.append(s)
         l = Label(text="-", pos=(self.control_loc + 30, 375 - i*100), size = (50, 50))
         self.add_widget(l)
         self.vol_labels.append(l)

   def on_slider_value(self, slider, vol):
      if self.cur_section != None:
         inst = self.vol_sliders.index(slider)
         self.volumes[self.cur_section][inst] = vol
         self.sound.set_master_volume(inst, vol)
         self.vol_labels[inst].text = "%.1fdB" % vol

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
      print self.volumes

      if not isinstance(sec_idx, int):
         sec_idx = None

      self.cur_section = sec_idx
      self.sound.set_section(sec_idx)

      # initialize volume sliders
      if self.cur_section != None:
         vols = self.volumes[self.cur_section]         
         for i in range(3):
            self.vol_sliders[i].value = vols[i]
            self.vol_labels[i].text = "%.1fdB" % vols[i]


   def _setup_inst(self):
      # find number of regions
      self.num_regions = 1

      if self.cur_section != None and self.cur_inst != None:
         player_config = gConfig['sections'][self.cur_section]['instruments'][self.cur_inst]['player']
         if player_config[0] == 'multi':
            self.num_regions = len(player_config) - 1

      self.display.clear()

      y = 0
      h = Window.height / self.num_regions
      for r in range(self.num_regions):
         line = Line(points=(0,y, self.control_loc,y), width=2)
         self.display.add(line)
         y += h

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

   def on_close(self):
      pickle.dump(self.volumes, open('volumes.pickle', 'w'))

   def _spos_to_xy(self, spos):
      y = spos[1] * self.num_regions - self.cur_region
      y = min(max(y, 0), 1)
      x = (spos[0] * Window.width) / self.control_loc
      x = min(max(x, 0), 1)
      return x,y

   def on_touch_down(self, touch):
      if self.cur_inst != None:
         if touch.pos[0] >= self.control_loc:
            self.cur_region = None
         else:
            self.cur_region = int(touch.spos[1] * self.num_regions)
            self.cur_region = min(self.cur_region, self.num_regions-1)
            x, y = self._spos_to_xy(touch.spos)
            msg = (self.cur_inst, self.cur_region, 'play', x, y)
            self.sound.on_control(msg)
      super(MainWidget, self).on_touch_down(touch)

   def on_touch_up(self, touch):
      if self.cur_inst != None:
         if self.cur_region != None:
            x, y = self._spos_to_xy(touch.spos)
            msg = (self.cur_inst, self.cur_region, 'stop', x, y)
            self.sound.on_control(msg)
            self.cur_region = None
      super(MainWidget, self).on_touch_up(touch)

   def on_touch_move(self, touch):
      if self.cur_inst != None:
         if self.cur_region != None:
            x, y = self._spos_to_xy(touch.spos)
            msg = (self.cur_inst, self.cur_region, 'xy', x, y)
            self.sound.on_control(msg)
      super(MainWidget, self).on_touch_move(touch)
   
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
