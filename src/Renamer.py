import sc2reader
import os
import requests
import zipfile
import datetime
import sys
import shutil
import datetime as dt
import json

#TODO Create /temp/ folder for replays to process then delete it when finished

if (os.path.isdir("temp") == True):
    shutil.rmtree('temp')
    print("temp folder removed")

os.mkdir('temp')
print("temp folder created")

dir_path = os.path.dirname(os.path.realpath(__file__))
with open(dir_path + '/Config.json') as data_file:
    data = json.load(data_file)

sc2replaypath = data["App"]["Game"]["path"]
path = os.getcwd() + "/temp/"
id = []
id.append(data["App"]["Game"]["scid"])

region = ""
players = []
races = []
ratings = []
uids = []

currentReplay = ""


# Process all replays
def processReplays():
    global currentReplay
    copyRecentReplaysFromSource()
    replayNames = os.listdir(path)
    for index in range(len(replayNames)):
        try:
            currentReplay = replayNames[index]
            replay = sc2reader.load_replay(path + currentReplay)
            getPlayerInfo(replay)
            getRatings(players[0], players[1], races[0], races[1])
            newName = createReplayString(str(replay.date).replace(":", "."), str(replay.map_name))
            print(newName)
            renameFile(newName)
            clear()
        except Exception as err:
            print("A non 1v1 can't be processed.", str(err))
    try:
        zipname = data["App"]["Game"]["names"][0] + "ReplayPack " + str(datetime.datetime.now().month) + '-' + str(datetime.datetime.now().day) + '-' + str(datetime.datetime.now().year) + ".zip";
        zipf = zipfile.ZipFile(zipname, 'w', zipfile.ZIP_DEFLATED)
        zipdir(path, zipf)
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
def getPlayerInfo(replay):
    global players
    global races
    global region
    region = replay.region
    for team in replay.teams:
        for player in team:
            players.append(player.name)
            races.append(player.pick_race[0])
            uids.append(player.detail_data["bnet"]["uid"])
    if uids[0] in id:
        return players
    if uids[0] not in id and uids[1] not in id:
        return players
    else:
        uids[0], uids[1] = uids[1], uids[0]
        players[0], players[1] = players[1], players[0]
        races[0], races[1] = races[1], races[0]
    return players


# Gather Rating information from request
def getRatings(name1, name2, race1, race2):
    global ratings
    player1search = "http://sc2unmasked.com/API/Player?name=" + name1 + "&server=" + region + "&race=" + race1.lower()
    player2search = "http://sc2unmasked.com/API/Player?name=" + name2 + "&server=" + region + "&race=" + race2.lower()
    print("Region: " + region)
    print(player1search)
    print(player2search)
    player1 = getMMR(player1search, name1, race1)
    player2 = getMMR(player2search, name2, race2)
    print("uids: " + str(uids))
    if uids[0] in id:
        ratings.append(player1)
        ratings.append(player2)
    if uids[0] not in id and uids[1] not in id:
        ratings.append(player1)
        ratings.append(player2)
    else:
        ratings.append(player2)
        ratings.append(player1)
    return ratings


# Request data from SC2Unmasked
def getMMR(playersearch, name, race):
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
            if player["acc_name"] == name and player["mmr"] > mmr and player["server"] == region and player["race"].upper() == race:
                mmr = player["mmr"]
        if mmr == 0:
            return 'Unknown'
        else:
            return mmr
    else:
        return 'Unknown'


# Create new Replay String
def createReplayString(datePlayed, mapname):
    print("Map: " + mapname)
    if players[0] == players[1]:
        if players[0] in id:
            return mapname +' (real) ' + players[0] + ' (' + races[0] + '), ' + str(ratings[0]) + ' MMR' + ' vs ' + players[1] + ' (' + races[1] + '), ' + str(ratings[1]) + ' MMR'
        else:
            return mapname +' (real) ' + players[1] + ' (' + races[1] + '), ' + str(ratings[1]) + ' MMR' + ' vs ' + players[0] + ' (' + races[0] + '), ' + str(ratings[0]) + ' MMR'
    if uids[0] in id:
        return mapname + ' ' + players[0] + ' (' + races[0] + '), ' + str(ratings[0]) + ' MMR' + ' vs ' + players[1] + ' (' + races[1] + '), ' + str(ratings[1]) + ' MMR'
    else:
        return mapname + ' ' + players[1] + ' (' + races[1] + '), ' + str(ratings[1]) + ' MMR' + ' vs ' + players[0] + ' (' + races[0] + '), ' + str(ratings[0]) + ' MMR'


def copyRecentReplaysFromSource():
    filelist = [f for f in os.listdir(path) if f.endswith(".SC2Replay")]
    for f in filelist:
        os.remove(os.path.join(path, f))

    now = dt.datetime.now()
    ago = now - dt.timedelta(minutes=10080)
    replayfiles = os.listdir(sc2replaypath)
    for file in replayfiles:
        fullname = os.path.join(sc2replaypath, file)
        st = os.stat(fullname)
        mtime = dt.datetime.fromtimestamp(st.st_mtime)
        if os.path.isfile(fullname) and mtime > ago:
            shutil.copy(fullname, path)


# Rename replay name to new replay string
def renameFile(newname):
    for filename in os.listdir(path):
        if filename == currentReplay:
            try:
                os.rename(os.path.join(path, filename), os.path.join(path, newname + '.SC2Replay'))
            except Exception as ex:
                i = 0
                go = True
                while go:
                    try:
                        i += 1
                        os.rename(os.path.join(path, filename), os.path.join(path, newname + '(' + str(i) + ')' + '.SC2Replay'))
                        print(newname + '(' + str(i) + ')' + '.SC2Replay' + ' created')
                        go = False
                    except Exception as err:
                        print(path, newname + '(' + str(i) + ')' + '.SC2Replay' + ' exists', str(err))


def zipdir(path, ziph):
    abs_src = os.path.abspath(path)
    for root, dirs, files in os.walk(path):
        for file in files:
            absname = os.path.abspath(os.path.join(path, file))
            arcname = absname[len(abs_src) + 1:]
            ziph.write(os.path.join(root, file), arcname)


# Clear current replay information
def clear():
    global players
    global races
    global ratings
    global currentReplay
    global uids
    players = []
    races = []
    ratings = []
    currentReplay = ""
    uids = []


class Logger(object):
    def __init__(self):
        self.terminal = sys.stdout
        self.log = open(str(datetime.datetime.now().month) + '-' + str(datetime.datetime.now().day) + '-' + str(datetime.datetime.now().year) + " log" +".log", "w", encoding="utf-8")

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

# Process Replays
if len(os.listdir(sc2replaypath)) != 0:
    processReplays()
else:
    print("How are there no replays in the sc2 folder?")
