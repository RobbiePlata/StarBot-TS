export default class ClientHolder {
    private _TwitchClient;
    private _initialized;
    private _client;
    private _clientid;
    private _accessToken;
    constructor();
    init(clientid: string, accessToken: string): Promise<any>;
    GetClient(): any;
}
