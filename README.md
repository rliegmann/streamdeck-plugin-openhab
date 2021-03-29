# openhab-streamdeck

## Bekannte Probleme

Das Hintergrund Icon wechselt immer zwischen den zwei defenierten Zuständen, wenn eine taste gedrück wird. Dies kann eventuell über die Key Up Funktion immer mit gewahlt zurück gesetzt werden. (https://www.reddit.com/r/StreamDeckSDK/comments/lvvazi/how_to_disable_the_behavior_that_stream_deck/)

---
When openHAB's REST API is accessed from another domain the following error may be encountered: No 'Access-Control-Allow-Origin' header is present on the requested resource. In this case, it may be necessary to add the line org.eclipse.smarthome.cors:enable=true in the file services/runtime.cfg.