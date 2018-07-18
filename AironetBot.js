/*
This is the Aironet Bot Source Code, developed and maintained by Jordan Hobday johobday@cisco.com

This bot controls and monitors various sensors attached to a 3800 AP in the Cisco Green Park Lab.
Use it to control the LED on the AP, take temperature readings, directly SSH to the Raspberry Pi on the developer
board etc.

Please reach out if you need any help or assistance.

*/

var Botkit = require('./lib/Botkit.js');

var controller = Botkit.sparkbot({
    debug: false,
    log: false,
    public_address:  "***********", //NGROK Pulbic Address for testing
    ciscospark_access_token: "************", //Spark Access Token for Bot
    studio_token: process.env.studio_token, // get one from studio.botkit.ai to enable content management, stats, message console and more
    secret: process.env.secret, // this is an RECOMMENDED but optional setting that enables validation of incoming webhooks
    webhook_name: 'Cisco Spark bot created with Botkit, override me before going to production',
});

//Set up the global variables to keep track of objects
var bot = controller.spawn({});
var http = require("https");
var sshEnabled = false;
var sshReturn;

//Define BotKit to listen on port 3000 on a local machine
controller.setupWebserver(process.env.PORT || 3000, function(err, webserver) {
    controller.createWebhookEndpoints(webserver, bot, function() {
        console.log("Cisco Spark: Webhooks set up!");
    });
});

controller.middleware.receive.use(function(bot, message, next) {
  console.log(message);
  next();
});


//Default actions for if a user joins a room or if the bot is added
controller.on('user_room_join', function(bot, message) {
    reply("Hi there, I'm Aironet Bot, developed by Jordan Hobday as part of the Aironet Developer Program. If you want to know more about me just mention me and type 'Help'.");
});

controller.on('bot_space_join', function(bot, message) {
    reply("Hi there, I'm Aironet Bot, developed by Jordan Hobday as part of the Aironet Developer Program. If you want to know more about me just mention me and type 'Help'.");
});


controller.on('direct_message', function(bot, message) {


    //PROBABLY MASSIVELY INEFFICIENT ON MEMORY AND CONNECTIONS :/
    var SSH = require('simple-ssh');
    var ssh = new SSH({
        host: '10.52.79.214',
        user: 'pi',
        pass: '************' //Insert Password
    });

    //Check if we need to send an SSH Command
    if(!sshEnabled){

        //Help message catch
        if(message.text == "help" || message.text == "Help" || message.text == "HELP"){
            bot.startConversation(message,function(err,convo){

                convo.say("Hi there!");
                convo.say("I'm Aironet Bot.");
                convo.say({text: "I was developed by Jordan Hobday (johobday@cisco.com) as part of the Aironet Developer Program.", delay: 2000});
                convo.say({text: "I'm directly connected to a lab in the Cisco Green Park offices where there is a 3800 AP with the developer module attached. Connected to this is a raspberry pie where I can run scripts to interact with the AP!", delay: 4500});
                convo.say({text: "To get started try typing *Command List*, to see what you can ask me to do! Give it a go!", delay: 4500});
                return;

            });
            return;
        }

        //Command List catch
        if(message.text == "commandlist" || message.text == "Command List" || message.text == "command list" || message.text == "Command list"){

            bot.reply(message, "Here is the list of Commands you can ask me:      \n\n"
            + "***Command*    |   Description**       \n\n"
            + "*BlinkLED*   |   Runs the script to flash the LED's on the AP.       \n"
            + "*ResetLED*   | If the LED is flashing this script will Stop it.       \n"
            + "*ShowTemp*   |   Displays the current temperature of the sensor at the AP.       \n"
            + "*ShowHumidity*   |   Displays the current humidity of the sensor at the AP.      \n"
            + "*ShowHumidity*   |   Displays the current humidity of the sensor at the AP.      \n"
            + "*LightsOn*    |   Runs the script that switches the light in the lab on.       \n"
            + "*LightsOff*    |  Runs the script that switches the light in the lab off.       \n"
            + "*StopSSH* |   Terminates the SSH Session if there is one running.       \n"
            + "*Help*   |   Displays The About Me info for the Bot.       \n\n"
            + "Please not that all commands are Case Sensitive!\n");
            return;

        }

        //Switching on the various commands intergrated into the Bot
        switch(message.text) {

            case "ShowTemp":

                    //Run the script
                    ssh.exec("cd /home/pi");
                    ssh.exec("python hdc1008.py", {
                        out: function(stdout){
                            setTimeout(function() {
                                stdout = stdout.substring(0, 15);
                                assignLog(stdout);
                            }, 1500)
                        }
                    }).start();

                    console.log("Temperature!");
                    reply("Checking...");
            break;

            case "ShowHumidity":

                    //Run the script
                    ssh.exec("cd /home/pi");
                    ssh.exec("python hdc1008.py", {
                        out: function(stdout){
                            setTimeout(function() {
                                stdout = stdout.substring(15, 35);
                                assignLog(stdout);
                            }, 1500)
                        }
                    }).start();

                    console.log("Humidity!");
                    reply("Checking...");

            break;

            case "BlinkLED":

                //Run the script
                ssh.exec("cd /home/cisco");
                ssh.exec("python ap-led-blink.py", {
                    out: function(stdout){
                        setTimeout(function() {
                            assignLog(stdout);
                        }, 1500)
                    }
                }).start();

                console.log("Blinking!");
                reply("No problem, let me send the commands to the raspberry Pi! Sit tight and I'll let you know when I have.");
            break;

            case "ResetLED":

                //Run the script
                ssh.exec("cd /home/cisco");
                ssh.exec("python ap-led-on.py", {
                    out: function(stdout){
                        setTimeout(function() {
                            assignLog(stdout);
                        }, 1500)
                    }
                }).start();

                console.log("Stop Blinking!");
                reply("No problem, let me send the commands to the raspberry Pi! Sit tight and I'll let you know when I have.");
            break;

            case "LightsOn":

                //Run the script
                ssh.exec("cd /home/pi");
                ssh.exec("./LightsOn.sh").start();

                console.log("Lights On");
                reply("Let me hit the lights for you!");
            break;

            case "LightsOff":

                //Run the script
                ssh.exec("cd /home/pi");
                ssh.exec("./LightsOff.sh").start();

                console.log("Lights Off");
                reply("Just turning off the lights now.");
            break;

            case "SSH":
                //Checking for password using a convo tree

                bot.createConversation(message, function(err, convo) {
                    convo.addMessage({
                        text: 'Connected.',
                    },'connect');


                    convo.addMessage({
                        text: 'Sorry, that was the incorrect password. Please type *SSH* again to retry!',
                    },'incorrect');

                    convo.addQuestion('Please enter the password for additional security', [
                        {
                            pattern: 'hello',  //NEEDS HASHING
                            callback: function(response, convo) {
                                convo.gotoThread('connect');
                                sshStateChange(true);

                            },
                        },
                        {
                            default: true,
                            callback: function(response, convo) {
                                convo.gotoThread('incorrect');
                            },
                        }
                    ],{},'default');

                    convo.activate();

                });

            break;

            //If the bot sees anything else other than the caught expressions or switch commands then default this response
            default:
                reply("Sorry, I don't understand what you just said? To see my available commands type, '*Command List*'. For info about me type, '*Help*'.");
            return;
        }

    //We need to send an SSH Command directly
    } else {

        //Catch the termination case (in the else) rather than a command in order to exit SSH mode
        if(message.text != "StopSSH"){

            ssh.exec(message.text, {
                out: function(stdout){
                    setTimeout(function() {
                        assignLog(stdout);
                    }, 1500)
                }
            }).start();

        } else {
            sshStateChange(false);
        }
    }


    //Bot reply function
    function reply(speech) {

        bot.reply(message, speech);

    }

    //To return the SSH CLI response to the spark bot
    function assignLog(log){

        sshReturn = log;
        console.log(sshReturn);
        reply(sshReturn);

    }

    //Moving in and out of SSH mode to change how th bot interprets commands
    function sshStateChange(newState){
        sshEnabled = newState;

        if(sshEnabled){
            reply("Entering SSH mode, all commands typed now will be sent 'as typed' to the Raspberry Pi command line. To exit type '*StopSSH*'");
        } else {
           ssh.reset();
           ssh.end();
           reply("Leaving SSH mode, all commands typed now will be abstracted commands to the Bot. To resume the session type '*SSH*'");
        }
    }
});

//Default BotKit method to instanciate everything
if (process.env.studio_token) {
    controller.on('direct_message,direct_mention', function(bot, message) {
        controller.studio.runTrigger(bot, message.text, message.user, message.channel).then(function(convo) {
            if (!convo) {
                 console.log('NO STUDIO MATCH');
            }
        }).catch(function(err) {
            console.error('Error with Botkit Studio: ', err);
        });
    });
}
