from Stats import Stats
from watchdog.events import FileSystemEventHandler

class Handler(FileSystemEventHandler):
    
    @staticmethod
    def on_any_event(event):
        try:
            if event.is_directory:
                return None

            elif event.event_type == 'created':
                # Take any action here when a file is first created.
                if event.src_path.endswith(".SC2Replay"):
                    print ("Received created event - %s." % event.src_path)
                    Stats.RecordStats(event.src_path)
        except Exception as err:
            print(err)