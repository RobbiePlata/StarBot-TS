export default class ClientHolder {
    private _initialized;
    private _client;
    private _clientid;
    private _accessToken;
    private _clientSecret;
    private _refreshToken;
    private _Config;
    constructor();
    init(clientid: string, accessToken: string, clientSecret: string, refreshToken: string): Promise<any>;
    GetClient(): any;
}
