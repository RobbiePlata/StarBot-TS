import request from "request";
import Player from './Player';

export default class Sc2ladder{
    
    private site: string;
    private Player: Player;
    private regions: Array<string>;
    private races: Array<string>

    constructor(){
        this.site = "https://www.sc2ladder.com";
        this.regions = ['US', 'EU', 'KR'];
        this.races = ['P', 'Z', 'T'];
    }
      
    // Need to filter Ratings by highest, need to allow callback with less than 4 parameters properly.
    async GetProfile(name, str1, str2, callback){
      try {
        var url = this.site + `/api/player?query=${name}&limit=`;
        request(url, { json: true }, (err, res, body) => {
          if (err) { console.log(err); }
          this.MatchProfile(body, name, str1, str2, (player) => {
            callback(player)
          })
        });
      } catch { }
    }
  
    async MatchProfile(profiles, name, str1, str2, callback) {
      try{
        let region, race;
        if(str1 !== undefined) {
          if(this.races.includes(str1.substring(0,1).toUpperCase())) {
            race = str1.substring(0,1).toUpperCase();
          }
          if(this.regions.includes(str1.toUpperCase())) {
            region = str1;
          }
        }
        if(str2 !== undefined) {
          if(this.races.includes(str2.substring(0,1).toUpperCase())) {
            race = str2.substring(0,1).toUpperCase();
          }
          if(this.regions.includes(str2.toUpperCase())) {
            region = str2;
          }
        }
        for (var profile of profiles) {
          if(race === undefined && region === undefined) {
            if (profile.username.toUpperCase() == name.toUpperCase()) {
              callback(new Player(profile));
              break;
            }
          }
          
          if(race !== undefined && region === undefined) {
            if (profile.username.toUpperCase() == name.toUpperCase() 
            && profile.race.toUpperCase().substring(0,1) == race.toUpperCase()) {
              callback(new Player(profile));
              break;
            }
          }
          
          if(race === undefined && region !== undefined) {
            if (profile.username.toUpperCase() == name.toUpperCase() 
              && profile.region.toUpperCase() == region.toUpperCase()) {
              callback(new Player(profile));
              break;
            }
          }
  
          if(race !== undefined && region !== undefined) {
            if (profile.username.toUpperCase() == name.toUpperCase() 
              && profile.region.toUpperCase() == region.toUpperCase()
              && profile.race.toUpperCase().substring(0,1) == race.toUpperCase()) {
              callback(new Player(profile));
              break;
            }
          }
        }
      } catch { }
    }
}