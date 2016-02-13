#####################################################################
#
# kinect.py
#
# Copyright (c) 2015, Eran Egozy
#
# Released under the MIT License (http://opensource.org/licenses/MIT)
#
#####################################################################


from OSC import OSCServer, ThreadingOSCServer, OSCClient, OSCMessage
import time
import threading
import core
import socket
import Queue


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
         send_port = 12321

      # 12-Server is running locally on this machine, using localhost
      else:
         self.listen_ip = 'localhost'
         self.listen_port = 12345

         send_ip = 'localhost'
         send_port = 12346

      self.server = OSCServer( (self.listen_ip, self.listen_port) )

      self.server.addMsgHandler( '/heart', self.cb_heartbeat )
      self.server.addMsgHandler( '/sectionIdx', self.cb_section_idx )
      self.server.addMsgHandler( '/ctrl', self.cb_ctrl )
      self.server.addMsgHandler( 'default', self.cb_ignore )

      # create the client, which sends control messages to 12-Server
      self.client = OSCClient()
      self.client.connect( (send_ip, send_port) )

      # member vars
      # self.last_heartbeat_time = 0
      self.server_connected = False
      self.server_retry = 0
      self.done_running = False

      self.queue = Queue.Queue()

      # start the server listening for messages
      self.start()

      core.register_terminate_func(self.close)

   # close must be called before app termination or the app might hang
   def close(self):
      msg = OSCMessage('/max', ('bye'))
      print 'sending', msg
      self.client.send(msg)

      # this is a workaround of a bug in the OSC server
      # we have to stop the thread first, make sure it is done,
      # and only then class server.close()
      self.server.running = False
      while not self.done_running:
         time.sleep(.01)
      self.server.close()

   def run(self):
      print "Worker thread entry point"
      self.server.serve_forever()
      self.done_running = True

   def on_update(self):
      now = time.time()
      if not self.server_connected and self.server_retry < now:
         # try to connect to condcutor
         try:
            msg = OSCMessage('/max', ('hello', self.listen_ip, self.listen_port))
            print 'sending', msg
            self.client.send(msg)
         except Exception:
            pass
         self.server_retry = now + 1.0

      while not self.queue.empty():
         path, args = self.queue.get()
         self.cb_func(path, args)

   def send(self, player_idx, note):
      osc_msg = OSCMessage('/max', ('note', player_idx, note))
      self.client.send(osc_msg)


   def is_connected(self):
      return self.server_connected

      # now = time.time()
      # send_heartbeat = now - self.last_heartbeat_time > 3.0
      # if send_heartbeat:
      #    self.last_heartbeat_time = now

      # try:
      #    for j in self.active_joints:
      #       if send_heartbeat:
      #          #print 'heartbeat:', j
      #          self.client.send( OSCMessage(j + "_trackjointpos", 1) )
      # except Exception as x:
      #    print x, 'sending to', self.client.client_address

   def cb_heartbeat(self, path, tags, args, source):
      # print 'got ', path, tags, args
      self.server_connected = True 

   def cb_section_idx(self, path, tags, args, source):
      self.queue.put((path, args))

   def cb_ctrl(self, path, tags, args, source):
      self.queue.put((path, args))

   def cb_ignore(self, path, tags, args, source):
      print 'ignoring ', path, tags, args 

