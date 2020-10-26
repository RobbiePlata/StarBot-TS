import ClientHolder from './ClientHolder';
import http from 'http'; 
import request from 'request';
import Config from '../Config.json';
import Player from './Player';
import Sc2ladder from './Sc2ladder';

export default class BotHelper{
    
    private _sc2ladder;
    private _request;
    private _Config;
    private _ClientHolder;
    private _http;
    private _sc2server;
    private _channelname;

    constructor(){
        this._sc2ladder = new Sc2ladder();
        this._request = request;
        this._ClientHolder = new ClientHolder();
        this._http = http;
        this._Config = Config;
        this._sc2server = this._Config.App.Game.region;
        this.InitializeClient();
        this._channelname = this._Config.App.Channel.name;
    }

    async InitializeClient(){
        await this._ClientHolder.init(this._Config.App.Channel.clientid, this._Config.App.Channel.accessToken,
             this._Config.App.Channel.clientSecret, this._Config.App.Channel.refreshToken);
    }

    async GetUptime(callback){
        const client = this._ClientHolder.GetClient();
        const user = await client.helix.users.getUserByName(this._channelname);
        const stream = await user.getStream();
        if (!user) {
            return false;
        }
        else if(stream !== null){
            var start = stream.startDate; // Start date
            var currentTime = new Date(); // Current time
            var msdifference = (currentTime.getTime() - start); // Difference
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

    async Shoutout(name: string, hosting: boolean, callback){
        try{
            const client = this._ClientHolder.GetClient();
            const user = await client.helix.users.getUserByName(name);
            const stream = await user.getStream();
            if(stream !== null){
                const game = await stream.getGame();
                if(hosting){
                    callback("I'm hosting " + user.name + " at twitch.tv/" + user.name + " They're live playing " + game.name + " with " + stream.viewers + " viewers " + '"' + stream.title + '"');
                }
                else{
                    callback("Give " + user.name + " a follow at twitch.tv/" + user.name + " They're live playing " + game.name + " with " + stream.viewers + " viewers " + '"' + stream.title + '"');
                }
            }
            else{
                if(hosting){
                    callback("I'm hosting " + name + " at twitch.tv/" + name);
                }
                else{
                    callback("Give " + name + " a follow at twitch.tv/" + name);
                }
            }
        } catch (err) { console.log(err); }
    }


    async GetOpponent(callback) {
        var gameurl = "http://localhost:6119/game"; //StarCraft 2 Port
        var data;
        this._http.get(gameurl, (resp) => {
            resp.on('data', (chunk) => {
                data = JSON.parse(chunk);
            });
            resp.on('end', () => {
                if(data.players.length !== 0
                && data.players[0].result === 'Undecided' 
                && data.isReplay !== true){
                    var opponent = this._Config.App.Game.names.includes(data.players[0].name) ? data.players[1].name : data.players[0].name;
                    this._sc2ladder.GetProfile(opponent, (result) => {
                        callback(result.mmr);
                    });
                }
            });
            
        }).on("error", (err) => {
            console.log("Starcraft needs to be open");
            callback("StarCraft II must be open");
        });
    }

    GetMatchup(race: string) {
        if(race == "Prot"){
            race = 'P';
        }
        if(race == "Zerg"){
            race = 'Z';
        }
        if(race == "Terr"){
            race = 'T';
        }
        return race;
    }

    async PrintCommands(){
        try{
            var commands = this._Config.Commands;
            console.log("\nCurrent Commands:");
            console.log("!add !command {message}");
            console.log("!remove {!command}");
            console.log("!addmessage {message}")
            console.log("!addsub {message}");
            console.log("!addban {message}");
            console.log("!addwelcome {message}");
            console.log("!uptime");
            console.log("!addhost {message}");
            console.log("!shoutout {twitchname}");
            console.log("!mmr");
            console.log("!search {profile}");
            console.log("!vt");
            console.log("!vz");
            console.log("!vp");
            console.log("!record")
            console.log("!replaypack")
            console.log("");
            Object.keys(commands).forEach(function(key) {
                console.log(key + ': ' + commands[key])
            })
        } catch { }
    };
}