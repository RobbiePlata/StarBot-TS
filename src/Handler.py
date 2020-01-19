from Stats import Stats
from watchdog.events import FileSystemEventHandler
import time
import os

class Handler(FileSystemEventHandler):
    
    @staticmethod
    def on_any_event(event):
        try:
            if event.is_directory:
                return None

            # Take any action here when a file is first created.
            elif event.event_type == 'created':
                if event.src_path.endswith(".SC2Replay"):
                    print (os.path.basename(event.src_path).split('.')[0] + "Detected")
                    historicalSize = 0
                    
                    # Validate file is finished creation
                    while (historicalSize != os.path.getsize(event.src_path)):
                        historicalSize = os.path.getsize(event.src_path)
                        time.sleep(1)
                    Stats.RecordStats(event.src_path)

        except Exception as err:
            print(err)