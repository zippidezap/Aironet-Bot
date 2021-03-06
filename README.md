# Aironet-Bot

This is the Aironet Bot, developed and maintained by Jordan Hobday johobday@cisco.com

This bot controls and monitors various sensors connected to a 3800 AP via the developer board in the Cisco Green Park Lab.
Use it to control the LED on the AP, take temperature readings, directly SSH to the Raspberry Pi on the developer
board etc.

Please reach out if you need any help or assistance.

To see a demo of this bot please check out the video link here: https://youtu.be/Z2S06CpOErM

Implementation:

The code is run using Node JS and BotKit. So these will both need installing first (recommend the latest versions of both). We also use NGROK such that we can host the bot locally rather than using AWS or the like, however this is your choice whether you wish to use this.

https://github.com/howdyai/botkit-starter-ciscospark

https://nodejs.org/en/

https://ngrok.com

There is one more dependancy that needs installing and that is simple-ssh. This can be easily installed by navigating in terminal to the code directory and running the command 'npm install simple-ssh'.

https://www.npmjs.com/package/simple-ssh

You will also need to change a few variables within the AironetBot.js file. In order to point the code to not just ngrok but for the your bot instance and the password for the lab!

Change 'public_address' line 17: to the web address the bot will be hosted on, so your AWS deployment or your NGROK IP.

Change 'ciscospark_access_token' line 18: to the Access Token of the bot you have made to tie to the two together.

Change The SSH connection details to your Raspberry Pi on attached to the Developer Board lines 61-63: Change to the IP, User and Password for your Raspberry Pi

Once you have installed the relevant files and changed the variables, navigate to your relevant directory in the command line. Then execute the main application by executing

'node AironetBot.js' this will spin up the bot and should be running.
