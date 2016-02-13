#####################################################################
#
# plot.py
# 
# Copyright (c) 2015, Eran Egozy
#
# Released under the MIT License (http://opensource.org/licenses/MIT)
#
#####################################################################

# $ python plot.py <filename>
# tell matplotlib to plot the data in <filename>. File should be a numpy array that 
# was saved with np.save() - creating a .npy file.

import sys
import numpy as np
from matplotlib import pyplot as plt

filename = sys.argv[1]
data = np.load(filename)
if 2 < len(sys.argv):
   data = data[int(sys.argv[2]):]
plt.plot(data)
plt.show()
