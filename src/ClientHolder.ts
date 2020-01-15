import TwitchClient from 'twitch';
import fs = require('fs');
import Config from '../Config.json';
export default class ClientHolder {

    private _initialized: any;
    private _client: any;
    private _clientid: string;
    private _accessToken: string;
    private _clientSecret: string;
    private _refreshToken: string;
    private _Config: any;

    constructor(){
        this._initialized = false;
        this._client = null;
        this._clientid = null;
        this._accessToken = null;
        this._clientSecret = null;
        this._refreshToken = null;
    }
    
    async init(clientid: string, accessToken: string, clientSecret: string, refreshToken: string): Promise<any> {
        if (this._initialized) { throw new Error('Trying to initialize again'); }
        this._client = await TwitchClient.withCredentials(clientid, accessToken, undefined, {clientSecret, refreshToken, onRefresh: (token) => {
            this._Config._accessToken = token;
            fs.writeFileSync("../Config.json", JSON.stringify(this._Config, null, 4));
        }});
        this._initialized = true;
        console.log("Client Initialized");
        this._clientid = clientid;
        this._accessToken = accessToken;
        this._clientSecret = clientSecret;
        this._refreshToken = refreshToken;
    }

    GetClient() {
        if (!this._initialized) { throw new Error("Client could not be initialized") }
        return this._client;
    }
}