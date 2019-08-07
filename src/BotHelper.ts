import Initializer from './Initializer';
import ClientHolder from './ClientHolder';
import http from 'http';
import Config from './Config.json';
export default class BotHelper{
    
    private _Config;
    private _ClientHolder;
    private _Initializer;
    private _http;
    private _sc2server;
    private _channelname;

    constructor(){
        this._Initializer = Initializer;
        this._ClientHolder = ClientHolder;
        this._http = http;
        this._Config = Config;
        this.sc2server = this._Config.App.Game.region;
        this.InitializeClient();
        this._channelname = this._Initializer.channelname;
    }
    sc2server = this._Config.App.Game.region; // Sets a constraint on the selectable sc2unmasked accounts

    async InitializeClient(){
        await this._ClientHolder.init(this._Initializer.clientid, this._Initializer.accessToken);
    }

    async IsStreamLive(username: string) {
        var client = this._ClientHolder.GetClient();
        const user = await client.helix.users.getUserByName(username);
        if (!user) {
            return false;
        }
        return user.getStream();
    }

    async GetUptime(callback){
        if (await this.IsStreamLive(this._channelname)){
            var client = this._ClientHolder.GetClient();
            const user = await client.helix.users.getUserByName(this._channelname);
            const stream = user.getStream();
            var start = stream.startDate; // Start date
            var currentTime = new Date(); // Current time
            var msdifference = (currentTime - start); // Difference
            var output = await this.ConvertUptime(msdifference);
            if(output.day === 0 && output.hour === 0 && output.minutes === 0){
                callback(this._channelname + " has been live for " + output.seconds + " seconds");
            }
            else if(output.day === 0 && output.hour === 0){
                callback(this._channelname + " has been live for " + output.minutes + " minutes " + output.seconds + " seconds");
            }
            else if(output.day === 0){
                callback(this._channelname + " has been live for " + output.hour + " hours " + output.minutes + " minutes " + output.seconds + " seconds");
            }
            else if(output.day === 1){
                callback(this._channelname + " has been live for " + output.day + " day " + output.hour + " hours " + output.minutes + " minutes " + output.seconds + " seconds");
            }
            else{
                callback(this._channelname + " has been live for " + output.day + " days" + output.hour + " hours " + output.minutes + " minutes " + output.seconds + " seconds");
            }
        }
        else{
            callback("Stream is not live");
        }
    }

    async ConvertUptime(milliseconds: number){
        var day: number; 
        var hour: number;
        var minutes: number;
        var seconds: number;
        seconds = Math.floor(milliseconds / 1000);
        minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;
        hour = Math.floor(minutes / 60);
        minutes = minutes % 60;
        day = Math.floor(hour / 24);
        hour = hour % 24;
        return {
            day: day,
            hour: hour,
            minutes: minutes,
            seconds: seconds
        };
    }

    async Shoutout(name: string, callback){
        try{
            if(await this.IsStreamLive(name)){
                var client = this._ClientHolder.GetClient();
                const user = await client.helix.users.getUserByName(name);
                const channel = await user.getChannel(); ///////////////////////////////
                callback("Give " + channel.displayName + " a follow at twitch.tv/" + channel.displayName + " They're live right now playing " + channel.game).tost;
            }
            else{
                callback("Give " + name + " a follow at twitch.tv/" + name);
            }
        } catch (err) { console.log(err); }
    }

    async SearchSC2Unmasked(player1: any, player2: any, callback){
        var player1search = "http://sc2unmasked.com/API/Player?name=" + player1.name + "&server=" + this.sc2server + "&race=" + this.GetMatchup(player1.race);
        var player2search = "http://sc2unmasked.com/API/Player?name=" + player2.name + "&server=" + this.sc2server + "&race=" + this.GetMatchup(player2.race);
        
        async function getMMR(playerdata, player, callback){
            var mmr = 0;
            for (let i = 0; i < playerdata.players.length; i++){
                if(playerdata.players[i].acc_name == player.name && playerdata.players[i].server == this.sc2server && playerdata.players[i].mmr > mmr){
                    mmr = playerdata.players[i].mmr;
                }
            }
            callback(mmr);
        }

        async function requestSC2Unmasked(playersearch, player, callback){
            this._http.get(playersearch, (resp) => {
                var playerdatastr ="";
                resp.on('data', (chunk) => {
                    playerdatastr += chunk;
                });
                
                resp.on('end', () => {
                    if(playerdatastr != ""){
                        var playerdata = JSON.parse(playerdatastr);
                        getMMR(playerdata, player, function(mmr){
                            callback(mmr);
                        })
                    }
                    else{
                        callback("?","?");
                    }
                });
        
                }).on("error", (err) => {
                    //console.log(err);
                    var mmr = "?";
                    callback(mmr);
                });
        }

        requestSC2Unmasked(player1search, player1, function(mmr1){
            requestSC2Unmasked(player2search, player2, function(mmr2){
                callback(mmr1, mmr2);
            })
        })
    }

    async GetOpponent(callback) {
        var gameurl = "http://localhost:6119/game"; //StarCraft 2 Port
        this._http.get(gameurl, (resp) => {
            resp.on('data', (chunk) => {
                var data = JSON.parse(chunk);
            });
            resp.on('end', () => {
                //console.log(data);
                this.SearchSC2Unmasked(data.players[0], data.players[1], function(mmr1, mmr2){
                    if(data.isReplay == false){
                        //console.log(mmr1, mmr2);
                        var players = data.players;
                        var player1 = players[0];
                        var player1race = this.GetMatchup(player1.race);
                        var player2 = players[1];
                        var player2race = this.GetMatchup(player2.race);
                        callback(player1.name + " (" + player1race + "), " + mmr1 + " MMR" + " VS " + player2.name + " (" + player2race  + "), " + mmr2 + " MMR");
                    }
                    else{
                        callback(this._channelname + " is in not in a game, or is in a replay");
                    }
                });
            });
            
        }).on("error", (err) => {
            console.log("Starcraft needs to be open");
            callback("StarCraft II must be open");
        });
    }

    async GetMatchup(race: string): Promise<string> {
        if(race == "Prot"){
            race = 'p';
        }
        if(race == "Zerg"){
            race = 'z';
        }
        if(race == "Terr"){
            race = 't';
        }
        return race;
    }

    async PrintCommands(){
        try{
            var commands = this._Config.Commands;
            console.log("\nCurrent Commands:");
            console.log("!shoutout twitchname");
            console.log("!add !command message");
            console.log("!remove !command");
            console.log("!addmessage message")
            console.log("!addsub message");
            console.log("!addban message");
            console.log("!uptime");
            console.log("!addhostmessage");
            console.log("!addwelcome");
            console.log("");
            Object.keys(commands).forEach(function(key) {
                console.log(key + ': ' + commands[key])
            })
        } catch { }
    };
}