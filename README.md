# openhab-streamdeck

> openhab streamdeck is a plug-in for the Elgator stremdeck, with which it is possible to control  openhab via the REST interface.
> The current status of the item is also displayed.

## Quick Start
---
tba

## Features

###  Update Title with Text an current value
The displayed title can be dynamically customized with custom texts and the current value.  wUnfortunately, the "Title" field cannot be used for this. For this reason, the "Title with Values" field under the Item field must be used. Any text and the current value can be displayed here. The placeholder **%VALUE%** must be used for the value. The text style can be edited using the button with the capital "T" at the top of the title field. Example:
```
Kitchen
Light
%VALUE%
```

### Feature 2

### Feature 3

---

## Button Types

### Ready to use:
- Lable
- Switch
- Button (Send custom Data (String, etc.) to a Item


### Next development:
- Windows Status (Show current Contact State)
- Blinds

---

## Important Hints

Since the onboard EventSource class cannot manage direct credentials, the node module [microsoft/fetch-event-source](https://github.com/Azure/fetch-event-source) is used. This is imported via NPM and then built into a bundle with browserify. 
The bundle can be built with ``npi run build`` in the plugin/node folder.

---

## Bekannte Probleme

Das Hintergrund Icon wechselt immer zwischen den zwei defenierten Zuständen, wenn eine taste gedrück wird. Dies kann eventuell über die Key Up Funktion immer mit gewahlt zurück gesetzt werden. (https://www.reddit.com/r/StreamDeckSDK/comments/lvvazi/how_to_disable_the_behavior_that_stream_deck/)

---
When openHAB's REST API is accessed from another domain the following error may be encountered: No 'Access-Control-Allow-Origin' header is present on the requested resource. In this case, it may be necessary to add the line org.eclipse.smarthome.cors:enable=true in the file services/runtime.cfg.
