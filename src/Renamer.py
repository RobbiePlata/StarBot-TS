import sc2reader
import os
import requests
import zipfile
import datetime
import sys
import shutil
import datetime as dt
import json
from multiprocessing import Queue

#TODO Create /temp/ folder for replays to process then delete it when finished

class Renamer(object):

    def __init__(self):
        self.Config = self.ConfigData()
        self.sc2replaypath = self.Config["App"]["Game"]["path"]
        self.path = os.getcwd() + "/temp/"
        self.id = []
        if(len(self.Config["App"]["Game"]["scid"]) > 0):
            self.id.append(self.Config["App"]["Game"]["scid"])
        self.region = ""
        self.players = []
        self.races = []
        self.ratings = []
        self.uids = []
        self.currentReplay = ""

    def ConfigData(self):
        dir_path = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..'))
        with open(dir_path + '\Config.json') as data_file:
            data = json.load(data_file)
            return data

    def TempExists(self):
        if (os.path.isdir("temp") == True):
            return True
        else:
            return False
    
    def CreateTemp(self):
        os.mkdir('temp')
        print("temp folder created")
    
    # Process all replays
    def ProcessReplays(self):
        self.CopyRecentReplaysFromSource()
        replayNames = os.listdir(self.path)
        for index in range(len(replayNames)):
            try:
                self.currentReplay = replayNames[index]
                replay = sc2reader.load_replay(self.path + self.currentReplay)
                self.GetPlayerInfo(replay)
                if(len(self.ratings) == 0):
                    self.GetUnmaskedRatings(self.players[0], self.players[1], self.races[0], self.races[1])
                newName = self.CreateReplayString(str(replay.date).replace(":", "."), str(replay.map_name))
                print(newName)
                self.RenameFile(newName)
                self.Clear()
            except Exception as err:
                print("A non 1v1 can't be processed.", str(err))
        try:
            zipname = self.Config["App"]["Game"]["names"][0] + " ReplayPack " + str(datetime.datetime.now().month) + '-' + str(datetime.datetime.now().day) + '-' + str(datetime.datetime.now().year) + ".zip";
            zipf = zipfile.ZipFile(zipname, 'w', zipfile.ZIP_DEFLATED)
            self.ZipDirectory(self.path, zipf)
            zipf.close()
            print('Zipped')
            shutil.rmtree('temp')   
            if(os.path.isfile(os.environ['USERPROFILE'] + '\Desktop' + "\\" + zipname)):
                os.remove(os.environ['USERPROFILE'] + '\Desktop' + "\\" + zipname)
                print("Replacing file that already exists in the target directory")
            #print(os.getcwd() + '/' + zipname)
            shutil.move(os.getcwd() + "\\" + zipname, os.environ['USERPROFILE'] + '\Desktop')
            print("Creation Successful")
            
        except Exception as err:
            print(err)


    # Player Name and Race gathered
    def GetPlayerInfo(self, replay):
        self.region = replay.region
        for team in replay.teams:
            for player in team:
                if player.init_data['scaled_rating']:
                    self.ratings.append(player.init_data['scaled_rating'])
                self.players.append(player.name)
                self.races.append(player.pick_race[0])
                self.uids.append(player.detail_data["bnet"]["uid"])
        if self.uids[0] in self.id:
            return self.players
        if self.uids[0] not in self.id and self.uids[1] not in self.id:
            return self.players
        else:
            self.uids[0], self.uids[1] = self.uids[1], self.uids[0]
            self.players[0], self.players[1] = self.players[1], self.players[0]
            self.races[0], self.races[1] = self.races[1], self.races[0]
        return self.players

    # Gather Rating information from request
    def GetUnmaskedRatings(self, name1, name2, race1, race2):
        player1search = "http://sc2unmasked.com/API/Player?name=" + name1 + "&server=" + self.region + "&race=" + race1.lower()
        player2search = "http://sc2unmasked.com/API/Player?name=" + name2 + "&server=" + self.region + "&race=" + race2.lower()
        print("Region: " + self.region)
        print(player1search)
        print(player2search)
        player1 = self.GetMMR(player1search, name1, race1)
        player2 = self.GetMMR(player2search, name2, race2)
        print("uids: " + str(self.uids))
        if self.uids[0] in self.id:
            self.ratings.append(player1)
            self.ratings.append(player2)
        if self.uids[0] not in self.id and self.uids[1] not in self.id:
            self.ratings.append(player1)
            self.ratings.append(player2)
        else:
            self.ratings.append(player2)
            self.ratings.append(player1)
        return self.ratings

    # Request data from SC2Unmasked
    def GetMMR(self, playersearch, name, race):
        request = requests.get(playersearch)
        try:
            playerdata = request.json()
        except Exception as ex:
            print("This one doesn't exist or they are a dirty barcode player")
            print(ex)
            return 'Unknown'
        if playerdata:
            mmr = 0
            for player in playerdata["players"]:
                if player["acc_name"] == name and player["mmr"] > mmr and player["server"] == self.region and player["race"].upper() == race:
                    mmr = player["mmr"]
            if mmr == 0:
                return 'Unknown'
            else:
                return mmr
        else:
            return 'Unknown'

    # Create new Replay String
    def CreateReplayString(self, datePlayed, mapname):
        print("Map: " + mapname)
        if len(self.players) == 2:
            if self.players[0] == self.players[1]:
                if self.players[0] in self.id:
                    return ' (real) ' + self.players[0] + ' (' + self.races[0] + '), ' + str(self.ratings[0]) + ' MMR' + ' vs ' + self.players[1] + ' (' + self.races[1] + '), ' + str(self.ratings[1]) + ' MMR' + ' ' + self.region.upper()
                else:
                    return ' (real) ' + self.players[1] + ' (' + self.races[1] + '), ' + str(self.ratings[1]) + ' MMR' + ' vs ' + self.players[0] + ' (' + self.races[0] + '), ' + str(self.ratings[0]) + ' MMR' + ' ' + self.region.upper()
            if self.uids[0] in self.id:
                return self.players[0] + ' (' + self.races[0] + '), ' + str(self.ratings[0]) + ' MMR' + ' vs ' + self.players[1] + ' (' + self.races[1] + '), ' + str(self.ratings[1]) + ' MMR' + ' ' + self.region.upper()
            else:
                return self.players[1] + ' (' + self.races[1] + '), ' + str(self.ratings[1]) + ' MMR' + ' vs ' + self.players[0] + ' (' + self.races[0] + '), ' + str(self.ratings[0]) + ' MMR' + ' ' + self.region.upper()
        else:
            return mapname

    def CopyRecentReplaysFromSource(self):
        filelist = [f for f in os.listdir(self.path) if f.endswith(".SC2Replay")]
        for f in filelist:
            os.remove(os.path.join(self.path, f))

        now = dt.datetime.now()
        ago = now - dt.timedelta(minutes=10080)
        replayfiles = []
        for r, d, f in os.walk(self.sc2replaypath):
            for file in f:
                if '.SC2Replay' in file:
                    replayfiles.append(os.path.join(r, file))
        for file in replayfiles:
            fullname = os.path.join(self.sc2replaypath, file)
            st = os.stat(fullname)
            mtime = dt.datetime.fromtimestamp(st.st_mtime)
            if os.path.isfile(fullname) and mtime > ago:
                shutil.copy(fullname, self.path)

    # Rename replay name to new replay string
    def RenameFile(self, newname):
        for filename in os.listdir(self.path):
            if filename == self.currentReplay:
                try:
                    os.rename(os.path.join(self.path, filename), os.path.join(self.path, newname + '.SC2Replay'))
                except Exception as ex:
                    i = 0
                    go = True
                    while go:
                        try:
                            i += 1
                            os.rename(os.path.join(self.path, filename), os.path.join(self.path, newname + '(' + str(i) + ')' + '.SC2Replay'))
                            print(newname + '(' + str(i) + ')' + '.SC2Replay' + ' created')
                            go = False
                        except Exception as err:
                            print(self.path, newname + '(' + str(i) + ')' + '.SC2Replay' + ' exists', str(err))

    def ZipDirectory(self, path, ziph):
        abs_src = os.path.abspath(path)
        for root, dirs, files in os.walk(path):
            for file in files:
                absname = os.path.abspath(os.path.join(path, file))
                arcname = absname[len(abs_src) + 1:]
                ziph.write(os.path.join(root, file), arcname)

    # Clear current replay information
    def Clear(self):
        self.ratings = []
        self.currentReplay = ""
        self.players = []
        self.races = []
        self.uids = []

    class Logger(object):
        def __init__(self):
            self.terminal = sys.stdout
            self.log = open(str(datetime.datetime.now().month) + '-' + str(datetime.datetime.now().day) + '-' + str(datetime.datetime.now().year) + " log" +".log", "w", encoding = "ISO-8859-1")

        def write(self, message):
            self.terminal.write(message)
            self.log.write(message)

        def flush(self):
            # this flush method is needed for python 3 compatibility.
            # this handles the flush command by doing nothing.
            pass

    # Log in console and create log file (if something isn't working as it should,
    # this is good to enable, to see what is wrong)
    # sys.stdout = Logger()

    def main(self):
        if self.TempExists():
            shutil.rmtree('temp')
            print("temp folder removed")
        self.CreateTemp()
        if len(os.listdir(self.sc2replaypath)) != 0:
            self.ProcessReplays()
        else:
            print("How are there no replays in the sc2 folder?")

if __name__ == "__main__":
    Renamer = Renamer()
    Renamer.main()
    
