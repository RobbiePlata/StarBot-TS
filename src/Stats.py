import os
import time
import glob
import sc2reader
import json

dir_path = os.path.dirname(os.path.realpath(__file__))
with open(dir_path + '/Config.json') as data_file:
    data = json.load(data_file)

path = os.getcwd() + "/replays/"

names = data["App"]["Game"]["names"]
VsZerg = 0
VsTerran = 0
VsProtoss = 0

go = True
sc2replaypath = data["App"]["Game"]["path"]

def process(replay):
    winner = ""
    winnerrace = ""
    loser = ""
    loserrace = ""
    for team in replay.teams:
        for player in team:
            if player.name in str(replay.winner):
                winner = player.name
                winnerrace = player.pick_race
            else:
                loser = player.name
                loserrace = player.pick_race
    try:
        if winner in names:
            if loserrace == "Terran":
                readVsTerranfile = open("../Statistics/VsTerran.txt", "r")
                VsTerran = readVsTerranfile.read()
                wins = int(VsTerran.split('-')[0])
                losses = int(VsTerran.split('-')[1])
                readVsTerranfile.close()
                writeVsTerranfile = open("../Statistics/VsTerran.txt", "w")
                wins = wins + 1
                writeVsTerranfile.write(str(wins) + '-' + str(losses))
                print(str(wins) + '-' + str(losses))
                writeVsTerranfile.close()

            if loserrace == "Zerg":
                readVsZergfile = open("../Statistics/VsZerg.txt", "r")
                VsZerg = readVsZergfile.read()
                wins = int(VsZerg.split('-')[0])
                losses = int(VsZerg.split('-')[1])
                readVsZergfile.close()
                writeVsZergfile = open("../Statistics/VsZerg.txt", "w")
                wins = wins + 1
                writeVsZergfile.write(str(wins) + '-' + str(losses))
                print(str(wins) + '-' + str(losses))
                writeVsZergfile.close()

            if loserrace == "Protoss":
                readVsProtossfile = open("../Statistics/VsProtoss.txt", "r")
                VsProtoss = readVsProtossfile.read()
                wins = int(VsProtoss.split('-')[0])
                losses = int(VsProtoss.split('-')[1])
                readVsProtossfile.close()
                writeVsProtossfile = open("../Statistics/VsProtoss.txt", "w")
                wins = wins + 1
                writeVsProtossfile.write(str(wins) + '-' + str(losses))
                print(str(wins) + '-' + str(losses))
                writeVsProtossfile.close()

        else:
            if winnerrace == "Terran":
                readVsTerranfile = open("../Statistics/VsTerran.txt", "r")
                VsTerran = readVsTerranfile.read()
                wins = int(VsTerran.split('-')[0])
                losses = int(VsTerran.split('-')[1])
                readVsTerranfile.close()
                writeVsTerranfile = open("../Statistics/VsTerran.txt", "w")
                losses = losses + 1
                writeVsTerranfile.write(str(wins) + '-' + str(losses))
                print(str(wins) + '-' + str(losses))
                writeVsTerranfile.close()

            if winnerrace == "Zerg":
                readVsZergfile = open("../Statistics/VsZerg.txt", "r")
                VsZerg = readVsZergfile.read()
                wins = int(VsZerg.split('-')[0])
                losses = int(VsZerg.split('-')[1])
                readVsZergfile.close()
                writeVsZergfile = open("../Statistics/VsZerg.txt", "w")
                losses = losses + 1
                writeVsZergfile.write(str(wins) + '-' + str(losses))
                print(str(wins) + '-' + str(losses))
                writeVsZergfile.close()

            if winnerrace == "Protoss":
                readVsProtossfile = open("../Statistics/VsProtoss.txt", "r")
                VsProtoss = readVsProtossfile.read()
                wins = int(VsProtoss.split('-')[0])
                losses = int(VsProtoss.split('-')[1])
                readVsProtossfile.close()
                writeVsProtossfile = open("../Statistics/VsProtoss.txt", "w")
                losses = losses + 1
                writeVsProtossfile.write(str(wins) + '-' + str(losses))
                print(str(wins) + '-' + str(losses))
                writeVsProtossfile.close()

    except Exception as err:
        print(err)

if (os.path.isdir("../Statistics")):
    print("Statistics folder exists")
else:
    os.mkdir("Statistics")
    
writeVsTerranfile = open("../Statistics/VsTerran.txt", "w")
writeVsZergfile = open("../Statistics/VsZerg.txt", "w")
writeVsProtossfile = open("../Statistics/VsProtoss.txt", "w")
writeVsTerranfile.write("0-0")
writeVsZergfile.write("0-0")
writeVsProtossfile.write("0-0")
writeVsTerranfile.close()
writeVsZergfile.close()
writeVsProtossfile.close()

while(go):
    path, dirs, files = next(os.walk(sc2replaypath))
    file_count = len(files)
    print("file count: ", file_count)

    time.sleep(5)
    path, dirs, files = next(os.walk(sc2replaypath))
    newfile_count = len(files)
    print("new file count: " , newfile_count)

    if newfile_count > file_count:
        files = [os.path.join(sc2replaypath, x) for x in os.listdir(sc2replaypath) if x.endswith(".SC2Replay")]
        newest = max(files, key=os.path.getctime)
        print("newest ", newest)
        currentReplayPath = newest
        replay = sc2reader.load_replay(currentReplayPath)
        process(replay)


