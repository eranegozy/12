# \*12\*
Technology Setup for Eun Young Lee's \*12\*

See [NIME Paper](http://www.nime.org/proceedings/2018/nime2018_paper0002.pdf) describing this project. 

## Hardware needs

You will need two computers: one for running the server and audio engine (PC1), the other for displaying graphics (PC2). All software described here should installed on PC1. PC2 just needs to run a web browser, and thus does not need any special installation.

You will also need a Wifi router. I have successfully used an [Apple AirPort Extreme](https://support.apple.com/airport) but I am sure any will do. Make sure the router has at least 2 Ethernet ports. The two computers should be connected via Ethernet wire to ensure a low latency connection. The mobile phones used by the audience will connect over Wifi.

Set up the Wifi router so that PC1 has a known IP address that is easy to remember and type. I suggest `1.1.1.1` or something like that.

PC1 will produce the sound for the show and should be connected to stage speakers. PC2 will produce the graphics (via web browser) and should be connected to a projector (via HDMI). The browser should be enlarged to full-screen so that no menu bars appear. 

## Requirements

- [node](https://nodejs.org/en/)
- python 2.7. I recommend installing from [miniconda](https://conda.io/miniconda.html) since it will create an isolated environment. Make sure the correct version is in your PATH after installation

## Setup

For python:
- `python --version`. Make sure this prints `Python 2.7.x`. You probably want the latest (2.7.15 as of this writing)
- `pip install -r requirements.txt`

For node:
- `npm --version`. Probably good to have version >= `6.x.x`
- `npm install`


## Running

On PC1:

- In a new terminal window
  - `node app.js`

- In a new terminal window
  - `cd sound`
  - `python main.py`
  

## Operating

The node app creates a http server on port 80 (though this can be configured in `app.js`) as well as an OSC server. There are four types of clients that should connect:

### Conductor
In a browser, use the URL `http://localhost/cond`. The conductor's main job is to select which movement is currently active (Taurus, Leo, Scorpio, Aquarius, or None). When a movement is active, the phones that are set up to control that movement become enabled. 

### Sound

This is the python app, also running locally. It establishes an OSC connection with the server. This connection is automatically made when the python app starts. 

The python app has a simple GUI for testing the sounds and adjusting volume levels. 

- To choose a movement, either select the movement from the Conductor or press the keys `1`, `2`, `3`, or `4` in the python app (or press `0` to choose no movement)

- To choose the instrument, press `q`, `w`, or `e`. This will set up the GUI as a "fake mobile phone" which lets you control the particular instrument.

- To play an instrument, use the mouse in the designated areas (mouse down and mouse drag). This should not be used in the live concert, but is useful to test both the sound and the graphics.

- When a movement is chosen, use the sliders to change the volume levels for the three instruments of each movement. These settings are automatically saved / loaded to a local preferences file.

### Graphics

On PC2, use the URL `http://<hostip>/viz` to connect. This shows the animated graphics associated with the various movements. `<hostip>` is PC1's IP address (for example, `1.1.1.1`). Of course, you can test locally on PC1 with the URL `http://localhost/viz`.

### Mobile Phones

The phones should connect to PC1 over Wifi. Simply type the IP address of PC1 in the phone browser (for example `1.1.1.1`). Phones have a very simple UI: The player enters their name, chooses a movement, and then chooses an instrument. There should be agreement amongst the phone players ahead of time as to which part / instrument each person is playing.

Note: there a good chance that players' phones will go to sleep in the middle of a concert. If this happens, the mobile phone players should simply refresh (ie reload) the web page (the choice movement/instrument choices are saved).

It is also a good idea to have a dress rehearsal, or at the very least, to let each audience player try out their instrument before the performance.

