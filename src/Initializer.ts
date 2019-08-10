import fs = require('fs');
import readline = require('readline-sync');
import open = require('open');
import Config = require('./Config.json');

export default class Initializer{

    private _apikey: string;
    private _botusername: string;
    private _channelname: string;
    private _clientid: string;
    private _accessToken: string;
    private _replaypath: string;

    constructor(){
        this._apikey = this.GetBotAPI();
        this._botusername = this.GetBotUsername();
        this._channelname = this.GetChannelName();
        this._clientid = Config.App.Channel.clientid;
        this._accessToken = this.GetAccessToken();
        this._replaypath = this.GetReplayPath();
    }

    public get apikey(): string { return this._apikey; }
    public get botusername(): string { return this._botusername; }
    public get channelname(): string { return this._channelname; }
    public get clientid(): string { return this._clientid; }
    public get accessToken(): string  { return this._accessToken; }
    public get replaypath(): string { return this._replaypath; }
    
    GetBotUsername(): string {
        var botusername = Config.App.Bot.name;
        if(botusername !== "" && botusername !== undefined){
            return botusername;
        }
        else{
            var bot = readline.question("Bot's Username: ");
            Config.App.Bot.name = bot;
            fs.writeFileSync("./config.json", JSON.stringify(Config, null, 4));
            console.log("Username saved");
            try{
                return Config.App.Bot.name;
            }catch(err){
                console.log(err);
            }
        }
    }

    GetAccessToken(): string {
        var token = Config.App.Channel.accessToken;
        if(token !== "" && token !== undefined){
            return token;
        }
        else{
            this.OpenAccessTokenWindow(); // Open browser for user to enter token
            this.WriteAccessToken(); // Write access token to accesstoken.txt
            try{
                return token = Config.App.Channel.accessToken;
            }catch(err){
                console.log(err);
            }
        }
    }

    WriteAccessToken(): string {
        var key = readline.question("Check all scopes, generate token, then enter the code here: ");
        Config.App.Channel.accessToken = key;
        fs.writeFileSync("./config.json", JSON.stringify(Config, null, 4));
        console.log("Access Token saved");
        try{
            return Config.App.Channel.accessToken;
        }catch(err){
            console.log(err);
        }
    }

    GetChannelName(): string {
        var channelname = Config.App.Channel.name;
        if(channelname !== "" && channelname !== undefined){
            return channelname;
        }
        else{
            var name = readline.question("Enter your stream channel: ");
            Config.App.Channel.name = name;
            fs.writeFileSync("./config.json", JSON.stringify(Config, null, 4));
            console.log("Username saved");
            try{
                return Config.App.Channel.name;
            }catch(err){
                console.log(err);
            }
        }
    }

    GetBotAPI(): string{
        var botapi = Config.App.Bot.apikey;
        if(botapi !== "" && botapi !== undefined){
            return botapi;
        }
        else{
            this.OpenBotAPIWindow();
            var api = readline.question("Enter your Bot's Oauth key: ");
            Config.App.Bot.apikey = api;
            fs.writeFileSync("./config.json", JSON.stringify(Config, null, 4));
            console.log("Bot API key saved");
            try{
                return Config.App.Bot.apikey;
            }catch(err){
                console.log(err);
            }
        }
    }

    GetReplayPath(): string {
        var path = Config.App.Game.path;
        if(path !== "" && path !== undefined){
            return path.replace(/\\/g, "/");
        }
        else{
            path = readline.question("What is the path of your Starcraft II replay folder?");
            Config.App.Game.path = path.replace(/\\/g, "/");
            fs.writeFileSync("./config.json", JSON.stringify(Config, null, 4));
            console.log("Path saved. If you made a mistake, you can change it later in Config.json");
            try{
                return Config.App.Game.path;
            }catch(err){
                console.log(err);
            }
        }
    }

    OpenAccessTokenWindow(): void {
        open("https://www.twitchtokengenerator.com/", {
        wait: true
        }).then(function(cp) {
            //console.log('child process:',cp);
            //console.log('worked');
        }).catch(function(err) {
            //console.error(err);
        });
    }

    // Open web browser for user api confirmation and retrieval
    OpenBotAPIWindow(): void {
        open("https://twitchapps.com/tmi", {
        wait: true
        }).then(function(cp) {
            //console.log('child process:',cp);
            //console.log('worked');
        }).catch(function(err) {
            //console.error(err);
        });
    }

}