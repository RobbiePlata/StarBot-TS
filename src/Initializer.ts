import fs from 'file-system';
import readline from 'file-system';
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
        this._fs = new fs();
        this._readline = new readline();
        this._readline = config;
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
    
    // If botusername is empty, ask user for bot username and write to file
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

    // Get user access token
    GetAccessToken(): string {
    var token = this._config.App.Channel.accessToken;
    // Token is present
    if(token !== "" && token !== undefined){
        return token;
    }
    // Token is not present
    else{
        this.UserTokenRetrieval(); // Open browser for user to enter token
        this.WriteAccessToken(); // Write access token to accesstoken.txt
            try{
                return token = this._config.App.Channel.accessToken;
            }catch(err){
                console.log(err);
            }
        }
    }

    // Open web browser for authentication token retrieval
    UserTokenRetrieval(): void {
        this._opn("https://twitch.center/token", {
        wait: true
        }).then(function(cp) {
            //console.log('child process:',cp);
            //console.log('worked');
        }).catch(function(err) {
            //console.error(err);
        });
    }

    // Write authentication token to file
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

    // If channelname is empty, ask user for channelname & write channelname to file
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

    // Open web browser for user api confirmation and retrieval
    BotAPIRetrieval(): void {
        this._opn("https://twitchapps.com/tmi", {
        wait: true
        }).then(function(cp) {
            //console.log('child process:',cp);
            //console.log('worked');
        }).catch(function(err) {
            //console.error(err);
        });
    }

    // If botapi is empty, ask user for prompt user for bot api and write to file
    GetBotAPI(): string{
    var botapi = this._config.App.Bot.apikey;
    if(botapi !== "" && botapi !== undefined){
        return botapi;
    }
    else{
        this.BotAPIRetrieval();
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

    // If botusername is empty, ask user for bot username and write to file
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
                console.log("Path saved. If you made a mistake, you can change it later in config.json");
            }); 
            try{
                return this._config.App.Game.path;
            }catch(err){
                console.log(err);
            }
        }
    }

}