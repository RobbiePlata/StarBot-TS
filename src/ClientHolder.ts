import TwitchClient from 'twitch';
export default class ClientHolder {

    private _initialized: any;
    private _client: any;
    private _clientid: string;
    private _accessToken: string;

    constructor(){
        this._initialized = false;
        this._client = null;
        this._clientid = null;
        this._accessToken = null;
    }
    
    async init(clientid: string, accessToken: string): Promise<any> {
        if (this._initialized) { throw new Error('Trying to initialize again'); }
        this._client = await TwitchClient.withCredentials(this._clientid, this._accessToken);
        this._initialized = true;
        console.log("Client Initialized");
        this._clientid = clientid;
        this._accessToken = accessToken;
    }

    GetClient() {
        if (!this._initialized) { throw new Error("Client could not be initialized") }
        return this._client;
    }
}