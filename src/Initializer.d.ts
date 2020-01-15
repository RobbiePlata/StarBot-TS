export default class Initializer {
    private _apikey;
    private _botusername;
    private _channelname;
    private _clientid;
    private _accessToken;
    private _replaypath;
    constructor();
    readonly apikey: string;
    readonly botusername: string;
    readonly channelname: string;
    readonly clientid: string;
    readonly accessToken: string;
    readonly replaypath: string;
    GetBotUsername(): string;
    GetAccessToken(): string;
    WriteAccessToken(): string;
    GetChannelName(): string;
    GetBotAPI(): string;
    GetReplayPath(): string;
    OpenAccessTokenWindow(): void;
    OpenBotAPIWindow(): void;
}
