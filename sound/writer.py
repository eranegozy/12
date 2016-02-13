#####################################################################
#
# writer.py
# 
# Copyright (c) 2015, Eran Egozy
#
# Released under the MIT License (http://opensource.org/licenses/MIT)
#
#####################################################################

import numpy as np
import os.path

class AudioWriter(object):
   def __init__(self, filebase):
      super(AudioWriter, self).__init__()
      self.active = False
      self.buffers = []
      self.filebase = filebase

   def add_audio(self, data, num_channels) :
      if self.active:
         # only use a single channel if we are in stereo
         if num_channels == 2:
            data = data[0::2] 
         self.buffers.append(data)

   def toggle(self) :
      if self.active:
         self.stop()
      else:
         self.start()

   def start(self) :
      if not self.active:
         print 'AudioWriter: start capture'
         self.active = True
         self.buffers = []

   def stop(self) :
      if self.active:
         print 'AudioWriter: stop capture'
         self.active = False

         output = combine_buffers(self.buffers)
         if len(output) == 0:
            print 'AudioWriter: empty buffers. Nothing to write'
            return

         filename = self._get_filename()
         print 'AudioWriter: saving', len(output), 'samples in', filename
         np.save(filename, output)

   # look for a filename that does not exist yet.
   def _get_filename(self) :
      suffix = 1
      while(True) :
         filename = '%s%d.npy' % (self.filebase, suffix)
         if not os.path.exists(filename) :
            return filename
         else:
            suffix += 1


# create single buffer from an array of buffers:
def combine_buffers(buffers):
   size = 0
   for b in buffers:
      size += len(b)
   
   # create a single output buffer of the right size
   output = np.empty( size, dtype=np.float32 )
   f = 0
   for b in buffers:
      output[f:f+len(b)] = b
      f += len(b)
   return output

