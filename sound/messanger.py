#####################################################################
#
# kinect.py
#
# Copyright (c) 2015, Eran Egozy
#
# Released under the MIT License (http://opensource.org/licenses/MIT)
#
#####################################################################


# from OSC import OSCServer, ThreadingOSCServer, OSCClient, OSCMessage
from pythonosc import osc_server, dispatcher, udp_client

import time
import threading
import core
import socket
import queue


# This class assumes that Synapse is running.
# It handles communications with Synapse and presents joint data to
# the app.
class Messanger(threading.Thread):
   def __init__(self, cb_func, remote_ip = None):
      super(Messanger, self).__init__()

      self.cb_func = cb_func
      # 12-Server is running on a remote machine:
      if remote_ip:
         self.listen_ip = socket.gethostbyname(socket.gethostname())
         self.listen_port = 12345

         send_ip = remote_ip
         send_port = 12346

      # 12-Server is running locally on this machine, using localhost
      else:
         self.listen_ip = '0.0.0.0'
         self.listen_port = 12345

         send_ip = '0.0.0.0'
         send_port = 12346

      # create a dispatcher and server, which handles incoming messages from Synapse
      self.dispatcher = dispatcher.Dispatcher()
      self.dispatcher.map( '/heart', self.cb_heartbeat )
      self.dispatcher.map( '/sectionIdx', self.cb_section_idx )
      self.dispatcher.map( '/ctrl', self.cb_ctrl )
      self.server = osc_server.ThreadingOSCUDPServer( (self.listen_ip, self.listen_port), self.dispatcher)

      # create the client, which sends control messages to 12-Server
      print('creating client with', send_ip, send_port)
      self.client = udp_client.SimpleUDPClient(send_ip, send_port)

      # member vars
      self.heartbeat_time = 0
      self.server_retry = 0

      self.queue = queue.Queue()

      # start the server listening for messages
      self.start()

      core.register_terminate_func(self.close)

   # close must be called before app termination or the app might hang
   def close(self):
      msg = ('/max', ('bye'))
      print('sending', msg)
      self.client.send_message(*msg)

      self.server.shutdown()
      self.server.server_close()

   def run(self):
      print("Worker thread entry point")
      self.server.serve_forever()

   def on_update(self):
      now = time.time()
      if not self.is_connected() and self.server_retry < now:
         # try to connect to condcutor
         try:
            msg = ('/max', ('hello', self.listen_ip, self.listen_port))
            print('sending', msg)
            self.client.send_message(*msg)
         except Exception:
            pass
         self.server_retry = now + 1.0

      while not self.queue.empty():
         addr, args = self.queue.get()
         self.cb_func(addr, args)

   def send(self, args):
      msg = ('/max', ('note',) + args)
      # print('sending', msg);
      self.client.send_message(*msg)

   def is_connected(self):
      now = time.time()      
      return self.heartbeat_time + 2.0 > now

   def cb_heartbeat(self, addr):
      # print('cb_heartbeat', addr)
      self.heartbeat_time = time.time()

   def cb_section_idx(self, addr, args):
      # print('cb_section_idx', addr, args)
      self.queue.put((addr, args))

   def cb_ctrl(self, addr, *args):
      # print('cb_ctrl', addr, args)
      self.queue.put((addr, args))

