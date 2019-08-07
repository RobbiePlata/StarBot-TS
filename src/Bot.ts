import tmi from 'tmi.js';
import fs from 'file-system';
import Initializer from './Initializer';
import BotHelper from './BotHelper';
import PirateSpeak from 'pirate-speak';
import Config from './Config.json';
import PythonShell from 'python-shell';

export default class Bot{
    
    private _tmi: any;
    private _fs: any;
    private _Initializer: any;
    private _BotHelper: any;
    private _PirateSpeak: any;
    private _Config: any;
    private _options: any;
    private _messageInterval: any;
    private _pythonshell
    private _chat: any;
    private _channelname: string;
    
    constructor(options: object){
        this._tmi = new tmi();
        this._fs = new fs();
        this._Initializer = new Initializer();
        this._BotHelper = new BotHelper();
        this._PirateSpeak = new PirateSpeak();
        this._Config = Config;
        this._channelname = this._Initializer.channelname;
        this._options = options;
        this._messageInterval = { // should put this in config
            time: 900000,
            get interval(){ return this.messageInterval.time; },
            set interval(value) { this.time = value * 60000; }
        };
        this._pythonshell = PythonShell;
        this._chat = new tmi.client(this._options);
    }

    public get tmi(): any { return this._tmi; }
    public get fs(): any { return this._fs; }
    public get Initializer(): any { return this._Initializer; }
    public get BotHelper(): any { return this._BotHelper; }
    public get PirateSpeak(): any  { return this._PirateSpeak; }
    public get MessageInterval(): any { return this._messageInterval; }
    public get chat(): any { return this._chat; }

    Connect(){
        this._chat.connect(this._channelname);
    }
    
    RecordStats(){
        if(true){ // if config has stats recorder enabled
            try{
                this._pythonshell.run('/Stats.py', null, function (err) {
                    console.log("Recording records..")
                    if (err) throw err;
                });
            } catch {  }
        }
    }
    
    Run(){
        this._chat.on('connected', function(address, port) {
            try{
                console.log("Welcome " + this.Initializer.channelname + ", " + this.Initializer.botusername + " is online!\n");
                var welcomemessages = this._Config.Alerts.WelcomeMessages;
                var random = Math.floor(Math.random() * Object.keys(welcomemessages).length);
                var welcomemessage = welcomemessages[random];
                this._chat.action(this._channelname, welcomemessage);
                this.BotHelper.PrintCommands();
            } catch { }
        });
    
        try{
            if(Object.keys(this._Config.Alerts.Messages).length !== 0){
                var count = Math.floor(Math.random() * Object.keys(this._Config.Alerts.Messages).length); // Start count on a random number (So first message is random)
                setInterval(() => {
                    var messages = this._Config.Alerts.Messages // (Allow newly added commands to be recognized every interval)
                    if(count <= Object.keys(messages).length - 1){
                        this._chat.action(this._channelname, this._Config.Alerts.Messages[count]);
                    }
                    else{
                        count = 0;
                        this._chat.action(this._channelname, this._Config.Alerts.Messages[count]);
                    }
                    count = count + 1;
                }, this._messageInterval.interval); 
            }
        } catch { }
    
        this._chat.on("hosted", (channel, username, viewers, autohost) => {
            if(Object.keys(this._Config.Alerts.HostMessages).length !== 0){
                try{
                    var hostmessages = this._Config.Alerts.HostMessages;
                    var random = Math.floor(Math.random() * Object.keys(hostmessages).length);
                    var hostmessage = hostmessages[random];
                    var strArrayMessage = hostmessage.split(" ");
                    for(let index = 0; index < strArrayMessage.length; index ++){
                        if(strArrayMessage[index].toLowerCase() == "user"){
                            strArrayMessage[index] = username;
                        }
                        if(strArrayMessage[index].toLowerCase() == "viewers"){
                            strArrayMessage[index] = viewers;
                        }
                    }
                    strArrayMessage = strArrayMessage.join(" ");
                    this._chat.action(this._channelname, strArrayMessage);
                } catch { }
            }
        });
    
        this._chat.on("subscription", function (channel, username, message, userstate) {
            try{
                var submessages = this._Config.Alerts.Submessages;
                var random = Math.floor(Math.random() * Object.keys(submessages).length);
                var submessage = submessages[random];
                var strArrayMessage = submessage.split(" ");
                //console.log(strArrayMessage);
                for(let index = 0; index < strArrayMessage.length; index ++){
                    if(strArrayMessage[index].toLowerCase() == "user"){
                        strArrayMessage[index] = username;
                    }
                }
                strArrayMessage = strArrayMessage.join(" ");
                this._chat.action(this._channelname, strArrayMessage);
            } catch { }
        });
    
        this._chat.on("resub", function (channel, username, months, message) {
            try{
                var submessages = this._Config.Alerts.Submessages;
                var random = Math.floor(Math.random() * Object.keys(submessages).length);
                var resubmessage = submessages[random];
                var strArrayMessage = resubmessage.split(" ");
                for(let index = 0; index < strArrayMessage.length; index ++){
                    if(strArrayMessage[index].toLowerCase() == "user"){
                        strArrayMessage[index] = username;
                    }
                }
                strArrayMessage = strArrayMessage.join(" ");
                this._chat.action(this._channelname, strArrayMessage);
            } catch { }
        });
    
        this._chat.on("ban", (channel, username, reason) => {
            try{
                var banmessages = this._Config.Alerts.BanMessages;
                var random = Math.floor(Math.random() * Object.keys(banmessages).length);
                var banmessage = banmessages[random];
                var strArrayMessage = banmessage.split(" ");
                for(let index = 0; index < strArrayMessage.length; index ++){
                    if(strArrayMessage[index].toLowerCase() == "user"){
                        strArrayMessage[index] = username;
                    }
                }
                strArrayMessage = strArrayMessage.join(" ");
                this._chat.action(this._channelname, strArrayMessage);    
            } catch { }
        });
    
        this._chat.on('chat', function(channel, user, message, self){   
            
            // Respond to user command using commands
            try{
                if(this._Config.Commands.hasOwnProperty(message)){
                    try{
                        this._chat.action(this._channelname, this._Config.Commands[message]);       
                    }catch(error){
                        console.log(error);
                    }
                }
            } catch { }
            
            // Replace exclamation point and create string array
            try{
                var messageMinusExclamation = message.replace('/!/g','');
                var strArray = messageMinusExclamation.split(" ");
            }catch(err){
                console.log(err);
            }
            
            if(strArray[0] === ("!uptime")){
                try{
                    (async() => {
                        this.BotHelper.GetUptime(function(uptime){
                            this._chat.action(this._channelname, uptime);
                        }); // TODO get object and post uptime to chat
                        
                    })();
                } catch { }
            }
            
            if(strArray[0] === ("!opponent")){  
                (async() => {
                    await this.BotHelper.GetOpponent();
                })();
            }
    
            if(strArray[0] === ("!replaypack")){
                try{
                    if(user.username === this._channelname || user.username === channelname.toLowerCase()){
                        this._chat.action(this._channelname, "Working on it");
                        this._PythonShell.run(this.___dirname + '/Renamer.py', null, function (err) {
                            if (err) throw err;
                            this._chat.action(this._channelname, "Replaypack finished");
                        });
                        }
                } catch { }
            }
    
            if(strArray[0] === ("!add")){
                try{
                    if(user.username === this._channelname || user.username === this._channelname.toLowerCase()){
                        if (strArray.length < 3){
                            this._chat.action(this._channelname, "Command format: \"!add !command message\"");
                        }
                        else if (strArray[1].charAt(0) == "!"){
                            var sentenceArray = strArray.slice(); // Clone array
                            sentenceArray.shift();
                            sentenceArray.shift();
                            this._Config.Commands[strArray[1]] = sentenceArray.join(" ").toString();
                            fs.writeFileSync("./config.json", JSON.stringify(this._Config, null, 4), finished());
                            function finished(error){
                                this._chat.action(this._channelname, "command " + strArray[1] +" added");
                            }
                        }
                        else{
                            this._chat.action(this._channelname, "Use an exclamation point at the start of the command you want to add");
                        }
                    }
                    else{
                        this._chat.action(this._channelname, "You can't tell me what to do");
                    }
                } catch { }
            }
    
            if(strArray[0] === ("!remove")){
                try{
                    if(user.username === this._channelname.user || user.username === this._channelname.toLowerCase()){
                        if(strArray.length < 2 || strArray.length > 2){
                            this._chat.action(this._channelname, "To remove a command, type \"!remove\"");
                        }
                        if(strArray.length === 2){
                            if(strArray[1].charAt(0) == "!"){
                                delete this._Config.Commands[strArray[1]];
                                var strConfig = JSON.stringify(this._Config, null, 4);
                                fs.writeFileSync("./config.json", strConfig, finished());
                                function finished(error){
                                    this._chat.action(this._channelname, "command " + strArray[1] +" removed");
                                }
                            }
                            else{
                                this._chat.action(this._channelname, "Use an exclamation point at the start of the command you want to remove");
                            }
                        }
                    }
                    else{
                        this._chat.action(this._channelname, "You can't tell me what to do");
                    }
                } catch { }
            }
            
            if(strArray[0] === ("!addsub")){
                try{
                    if(user.username === this._channelname || user.username === this._channelname.toLowerCase()){
                        if (strArray.length < 2){
                            this._chat.action(this._channelname, "To add a sub message type \"!addsub message here\"");
                        }
                        else if (strArray.length >= 2){
                            var sentenceArray = strArray.slice(); // Clone array
                            sentenceArray.shift();
                            var keyvalue = Object.keys(this._Config.Alerts.SubMessages).length;
                            this._Config.Alerts.SubMessages[keyvalue] = sentenceArray.join(" ").toString();
                            fs.writeFileSync("./config.json", JSON.stringify(this._Config, null, 4), finished());
                            function finished(error){
                                this._chat.action(this._channelname, sentenceArray.join(" ") + " submessage added!");
                            }
                        }   
                    }
                    else{
                        this._chat.action(this._channelname, "You can't tell me what to do");
                    }
                } catch { }
                
            }
    
            if(strArray[0] === ("!addban")){
                try{
                    if(user.username === this._channelname || user.username === this._channelname.toLowerCase()){
                        if (strArray.length < 2){
                            this._chat.action(this._channelname, "To add a sub message type \"!addsub message here\"");
                        }
                        else if (strArray.length >= 2){
                            var sentenceArray = strArray.slice(); // Clone array
                            sentenceArray.shift();
                            var keyvalue = Object.keys(this._Config.Alerts.BanMessages).length;
                            this._Config.Alerts.BanMessages[keyvalue] = sentenceArray.join(" ").toString();
                            fs.writeFileSync("./config.json", JSON.stringify(this._Config, null, 4), finished());
                            function finished(error){
                                this._chat.action(this._channelname, sentenceArray.join(" ") + " banmessage added!");
                            }
                        }   
                    }
                    else{
                        this._chat.action(this._channelname, "You can't tell me what to do");
                    }
                } catch { }
            }
    
            if(strArray[0] === ("!addmessage")){
                try{
                    if(user.username === this._channelname || user.username === this._channelname.toLowerCase()){
                        if (strArray.length < 2){
                            this._chat.action(this._channelname, "To add a sub message type \"!add message here\"");
                        }
                        else if (strArray.length >= 2){
                            var sentenceArray = strArray.slice(); // Clone array
                            sentenceArray.shift();
                            var keyvalue = Object.keys(this._Config.Alerts.Messages).length;
                            this._Config.Alerts.Messages[keyvalue] = sentenceArray.join(" ").toString();
                            fs.writeFileSync("./config.json", JSON.stringify(this._Config, null, 4), finished());
                            function finished(error){
                                this._chat.action(this._channelname, sentenceArray.join(" ") + " message added!");
                            }
                        }
                    }
                    else{
                        this._chat.action(this._channelname, "You can't tell me what to do");
                    }
                } catch { }
            }
    
            if(strArray[0] === ("!removesub")){
                try{
    
                } catch { }
            }
    
            if(strArray[0] === ("!removeban")){
                try{
    
                } catch { }
            }
    
            if(strArray[0] === ("!removemessage")){
                try{
    
                } catch { }
            }
    
            if(strArray[0] === ("!addwelcome")){
                try{
                    if(user.username === this._channelname || user.username === this._channelname.toLowerCase()){
                        if(strArray.length < 2){
                            this._chat.action(this._channelname, "To change your welcome message, type \"!addwelcome message here\"");
                        }
                        else if(strArray.length >= 2){
                            var sentenceArray = strArray.slice(); // Clone array
                            sentenceArray.shift();
                            keyvalue = Object.keys(this._Config.Alerts.WelcomeMessages).length;
                            this._Config.Alerts.WelcomeMessage[keyvalue] = sentenceArray.join(" ").toString();
                            fs.writeFileSync("./config.json", JSON.stringify(this._Config, null, 4), finished());
                            function finished(error){
                                this._chat.action(this._channelname, sentenceArray.join(" ") + " welcomemessage added!");
                            }
                        }
                    }
                    else{
                        this._chat.action(this._channelname, "You can't tell me what to do");
                    }
                } catch { }
            }
    
            if(strArray[0] === ("!addhostmessage")){
                try{
                    if(user.username === this._channelname || user.username === this._channelname.toLowerCase()){
                        if(strArray.length < 2){
                            this._chat.action(this._channelname, "To add a host message, type \"!addhostmessage message here\"");
                        }
                        else if(strArray.length >= 2){
                            var sentenceArray = strArray.slice(); // Clone array
                            sentenceArray.shift();
                            keyvalue = Object.keys(this._Config.Alerts.HostMessages).length;
                            this._Config.Alerts.HostMessages[keyvalue] = sentenceArray.join(" ").toString();
                            fs.writeFileSync("./config.json", JSON.stringify(this._Config, null, 4), finished());
                            function finished(error){
                                this._chat.action(this._channelname, sentenceArray.join(" ") + " host message added!");
                            }
                        }
                    }
                    else{
                        this._chat.action(this._channelname, "You can't tell me what to do");
                    }
                } catch { }
            }
    
            if(strArray[0] === ("!shoutout")){
                try{
                    if(user.username === this._channelname || user.username === this._channelname.toLowerCase()){
                        if (strArray.length < 2){
                            this._chat.action(this._channelname, "Shoutout who?");
                        }
                        else if (strArray.length == 2){
                            (async() => {
                                BotHelper.Shoutout(strArray[1], function(shoutout){
                                    this._chat.action(this._channelname, shoutout);
                                });
                            })();
                            
                        }
                    }
                } catch { }
                
            }
    
            if(strArray[0] === ("!pirate")){
                try{
                    if (strArray.length < 2){
                        this._chat.action(this._channelname, "To talk like a pirate type \"!pirate message here\"");
                    }
                    else if (strArray.length >= 2){
                        var sentenceArray = strArray.slice(); // Clone array
                        sentenceArray.shift();
                        this._chat.action(this._channelname, PirateSpeak.translate(sentenceArray.join(" ")));
                    }   
                } catch { }
            }
    
        });
    }
}