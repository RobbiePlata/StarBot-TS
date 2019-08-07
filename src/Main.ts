import Bot from "./Bot";

var options = {
    options: { debug: true },
    connection: { reconnect: true },
    identity: { username: this._Initializer.botusername, password: this._Initializer.apikey },
    channels: [ this._Initializer.channelname ]
}

var StarBot = new Bot(options);
StarBot.Connect();
StarBot.RecordStats();
StarBot.Run();