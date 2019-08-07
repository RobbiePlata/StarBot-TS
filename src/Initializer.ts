import fs from 'fs';
import readline from 'readline';
import opn from 'opn';
import config from './Config.json';

export default class Initializer{

    private _opn: any;
    private _fs: any;
    private _readline: any;
    private _config: any;
    private _apikey: string;
    private _botusername: string;
    private _channelname: string;
    private _clientid: string;
    private _accessToken: string;
    private _replaypath: string;

    constructor(){
        this._opn = new opn();
        this._fs = fs;
        this._readline = readline;
        this._config = config;
        this._apikey = this.GetBotAPI();
        this._botusername = this.GetBotUsername();
        this._channelname = this.GetChannelName();
        this._clientid = this._config.App.Channel.clientid;
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
    var botusername = this._config.App.Bot.name;
    if(botusername !== "" && botusername !== undefined){
        return botusername;
    }
    else{
        var bot = this._readline.question("Bot's Username: ");
        this._config.App.Bot.name = bot;
        this._fs.writeFileSync("./config.json", JSON.stringify(this._config, null, 4), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("Username saved");
            }); 
            try{
                return this._config.App.Bot.name;
            }catch(err){
                console.log(err);
            }
        }
    }

    GetAccessToken(): string {
    var token = this._config.App.Channel.accessToken;
    if(token !== "" && token !== undefined){
        return token;
    }
    else{
        this.OpenAccessTokenWindow(); // Open browser for user to enter token
        this.WriteAccessToken(); // Write access token to accesstoken.txt
            try{
                return token = this._config.App.Channel.accessToken;
            }catch(err){
                console.log(err);
            }
        }
    }

    WriteAccessToken(): void {
    var key = this._readline.question("Check all scopes, generate token, then enter the code here: ");
    this._config.App.Channel.accessToken = key;
    this._fs.writeFileSync("./config.json", JSON.stringify(this._config, null, 4), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("Access Token saved");
        });
        try{
            return this._config.App.Channel.accessToken;
        }catch(err){
            console.log(err);
        }
    }

    GetChannelName(): string {
    var channelname = this._config.App.Channel.name;
    if(channelname !== "" && channelname !== undefined){
        return channelname;
    }
    else{
        var name = this._readline.question("Enter your stream channel: ");
        this._config.App.Channel.name = name;
        this._fs.writeFileSync("./config.json", JSON.stringify(this._config, null, 4), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("Username saved");
            }); 
            try{
                return this._config.App.Channel.name;
            }catch(err){
                console.log(err);
            }
        }
    }

    GetBotAPI(): string{
    var botapi = this._config.App.Bot.apikey;
    if(botapi !== "" && botapi !== undefined){
        return botapi;
    }
    else{
        this.OpenBotAPIWindow();
        var api = this._readline.question("Enter your Bot's Oauth key: ");
        this._config.App.Bot.apikey = api;
        this._fs.writeFileSync("./config.json", JSON.stringify(this._config, null, 4), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("Bot API key saved");
            }); 
            try{
                return this._config.App.Bot.apikey;
            }catch(err){
                console.log(err);
            }
        }
    }

    GetReplayPath(): string {
        var path = this._config.App.Game.path;
        if(path !== "" && path !== undefined){
            return path.replace(/\\/g, "/");
        }
        else{
            path = this._readline.question("What is the path of your Starcraft II replay folder?");
            this._config.App.Game.path = path.replace(/\\/g, "/");
            this._fs.writeFileSync("./config.json", JSON.stringify(this._config, null, 4), function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("Path saved. If you made a mistake, you can change it later in Config.json");
            }); 
            try{
                return this._config.App.Game.path;
            }catch(err){
                console.log(err);
            }
        }
    }

    OpenAccessTokenWindow(): void {
        this._opn("https://www.twitchtokengenerator.com/", {
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
        this._opn("https://twitchapps.com/tmi", {
        wait: true
        }).then(function(cp) {
            //console.log('child process:',cp);
            //console.log('worked');
        }).catch(function(err) {
            //console.error(err);
        });
    }

}