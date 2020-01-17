from Stats import Stats
from Handler import Handler
from watchdog.observers import Observer
import time

class Watcher:
    
    Config = Stats.ConfigData()
    DIRECTORY_TO_WATCH = Config["App"]["Game"]["path"]

    def __init__(self):
        Stats.CreateDirectory()
        Stats.ResetStats()
        print("Listening for games..")
        self.observer = Observer()

    def run(self):
        event_handler = Handler()
        self.observer.schedule(event_handler, self.DIRECTORY_TO_WATCH, recursive=True)
        self.observer.start()
        try:
            while True:
                time.sleep(5)
        except Exception as err:
            self.observer.stop()
            print (err)

        self.observer.join()

if __name__ == '__main__':
    try:
        w = Watcher()
        w.run()
    except Exception as err:
        print(err)
        print("Stats will be disabled for the remainder of this session.")