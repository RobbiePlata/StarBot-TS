export default class BotHelper {
    private _Config;
    private _ClientHolder;
    private _Initializer;
    private _http;
    private _sc2server;
    private _channelname;
    constructor();
    InitializeClient(): Promise<void>;
    IsStreamLive(username: string): Promise<any>;
    GetUptime(callback: any): Promise<void>;
    ConvertUptime(milliseconds: number): Promise<{
        day: number;
        hour: number;
        minutes: number;
        seconds: number;
    }>;
    Shoutout(name: string, callback: any): Promise<void>;
    SearchSC2Unmasked(player1: any, player2: any, callback: any): Promise<void>;
    GetOpponent(callback: any): Promise<void>;
    GetMatchup(race: string): Promise<string>;
    PrintCommands(): Promise<void>;
}
