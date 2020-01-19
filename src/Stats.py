import os
import glob
import sc2reader
import json

class Stats(object):

    VsZerg = 0
    VsTerran = 0
    VsProtoss = 0
    Config = {}
    Names = []
    
    @staticmethod
    def ConfigData():
        try:
            dir_path = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..'))
            with open(dir_path + '\Config.json') as data_file:
                data = json.load(data_file)
                return data
        except Exception as err:
            print(err)
    
    @staticmethod
    def RecordStats(path):
        try:
            winner = ""
            winnerrace = ""
            loser = ""
            loserrace = ""
            replay = sc2reader.load_replay(path)
            for team in replay.teams:
                for player in team:
                    if player.name in str(replay.winner):
                        winner = player.name
                        winnerrace = player.pick_race
                    else:
                        loser = player.name
                        loserrace = player.pick_race
            
            Stats.FindResult(winner, winnerrace, loser, loserrace)
        
        except Exception as err:
            print(err)
    
    def FindResult(winner, winnerrace, loser, loserrace):
        try:
            print(winner + " (" + winnerrace + ") " + "has beaten " + loser + " (" + loserrace + ") ")
            Config = Stats.ConfigData()
            Names = Config["App"]["Game"]["names"]
            
            if winner in Names or loser in Names:
                if winner in Names:
                    if loserrace == "Terran":
                        Stats.RecordTerranWin()
                    if loserrace == "Zerg":
                        Stats.RecordZergWin()
                    if loserrace == "Protoss": 
                        Stats.RecordProtossWin()   
                if loser in Names:
                    if winnerrace == "Terran":
                        Stats.RecordTerranLoss()
                    if winnerrace == "Zerg":
                        Stats.RecordZergLoss()
                    if winnerrace == "Protoss":
                        Stats.RecordProtossLoss()
            if winner not in Names and loser not in Names:
                print("Names from list are not contained in this replay, thus will not count towards record.")
                
        except Exception as err:
            print(err)
    
    def RecordTerranWin():
        try:
            readVsTerranfile = open("Statistics/VsTerran.txt", "r")
            Stats.VsTerran = readVsTerranfile.read()
            wins = int(Stats.VsTerran.split('-')[0])
            losses = int(Stats.VsTerran.split('-')[1])
            readVsTerranfile.close()
            writeVsTerranfile = open("Statistics/VsTerran.txt", "w")
            wins = wins + 1
            writeVsTerranfile.write(str(wins) + '-' + str(losses))
            print("Record vs Terran: " + str(wins) + '-' + str(losses))
            writeVsTerranfile.close()
        except Exception as err:
            print(err)
    
    def RecordProtossWin():
        try:
            readVsProtossfile = open("Statistics/VsProtoss.txt", "r")
            Stats.VsProtoss = readVsProtossfile.read()
            wins = int(Stats.VsProtoss.split('-')[0])
            losses = int(Stats.VsProtoss.split('-')[1])
            readVsProtossfile.close()
            writeVsProtossfile = open("Statistics/VsProtoss.txt", "w")
            wins = wins + 1
            writeVsProtossfile.write(str(wins) + '-' + str(losses))
            print("Record vs Protoss: " + str(wins) + '-' + str(losses))
            writeVsProtossfile.close()
        except Exception as err:
                print(err)

    def RecordZergWin():
        try:
            readVsZergfile = open("Statistics/VsZerg.txt", "r")
            Stats.VsZerg = readVsZergfile.read()
            wins = int(Stats.VsZerg.split('-')[0])
            losses = int(Stats.VsZerg.split('-')[1])
            readVsZergfile.close()
            writeVsZergfile = open("Statistics/VsZerg.txt", "w")
            wins = wins + 1
            writeVsZergfile.write(str(wins) + '-' + str(losses))
            print("Record vs Zerg: " + str(wins) + '-' + str(losses))
            writeVsZergfile.close()
        except Exception as err:
            print(err)

    def RecordTerranLoss():
        try:
            readVsTerranfile = open("Statistics/VsTerran.txt", "r")
            Stats.VsTerran = readVsTerranfile.read()
            wins = int(Stats.VsTerran.split('-')[0])
            losses = int(Stats.VsTerran.split('-')[1])
            readVsTerranfile.close()
            writeVsTerranfile = open("Statistics/VsTerran.txt", "w")
            losses = losses + 1
            writeVsTerranfile.write(str(wins) + '-' + str(losses))
            print("Record vs Terran: " + str(wins) + '-' + str(losses))
            writeVsTerranfile.close()
        except Exception as err:
            print(err)

    def RecordProtossLoss():
        try:
            readVsProtossfile = open("Statistics/VsProtoss.txt", "r")
            Stats.VsProtoss = readVsProtossfile.read()
            wins = int(Stats.VsProtoss.split('-')[0])
            losses = int(Stats.VsProtoss.split('-')[1])
            readVsProtossfile.close()
            writeVsProtossfile = open("Statistics/VsProtoss.txt", "w")
            losses = losses + 1
            writeVsProtossfile.write(str(wins) + '-' + str(losses))
            print("Record vs Protoss: " + str(wins) + '-' + str(losses))
            writeVsProtossfile.close()
        except Exception as err:
            print(err)

    def RecordZergLoss():
        try:
            readVsZergfile = open("Statistics/VsZerg.txt", "r")
            Stats.VsZerg = readVsZergfile.read()
            wins = int(Stats.VsZerg.split('-')[0])
            losses = int(Stats.VsZerg.split('-')[1])
            readVsZergfile.close()
            writeVsZergfile = open("Statistics/VsZerg.txt", "w")
            losses = losses + 1
            writeVsZergfile.write(str(wins) + '-' + str(losses))
            print("Record vs Zerg: " + str(wins) + '-' + str(losses))
            writeVsZergfile.close()
        except Exception as err:
            print(err)
    
    def CreateDirectory():
        try:
            if (os.path.isdir("Statistics")):
                print("Statistics folder found")
            else:
                os.mkdir("Statistics")
        except Exception as err:
            print(err)

    def ResetStats():
        try:
            writeVsTerranfile = open("Statistics/VsTerran.txt", "w")
            writeVsZergfile = open("Statistics/VsZerg.txt", "w")
            writeVsProtossfile = open("Statistics/VsProtoss.txt", "w")
            writeVsTerranfile.write("0-0")
            writeVsTerranfile.close()
            writeVsZergfile.write("0-0")
            writeVsZergfile.close()
            writeVsProtossfile.write("0-0")
            writeVsProtossfile.close()
            print("Statistics have been reset")
        except Exception as err:
            print(err)

