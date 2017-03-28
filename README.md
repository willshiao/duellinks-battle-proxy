Duel Links Battle Proxy
======

## Disclaimer
This application was created as a proof-of-concept and is intended for **educational use only**. I contacted KONAMI on Feburary 21, 2017 and I have not received a reply, so I am releasing the source code of the tool.

I am not reponsible for accounts being banned or any other consequences of misusing this tool.


## Description
This application is a proof-of-concept application that allows users to intercept and modify server responses from the YuGiOh! Duel Links mobile game by acting as a intercepting HTTPS proxy.

This allows you to view and modify the decks of NPCs (non-playing characters) and view the decks of other players in multiplayer.

It does not require you to jailbreak or root your device.

`cardmap.js` maps the card ID to the corresponding card. It contains a few cards to show that the application works.

`responses.txt` contains a log of server responses to assist with debugging of the application.


## Usage
```
npm install
node duel-proxy.js
```

You also have to trust the generated SSL certificate (`.http-mitm-proxy/certs/ca.pem`) on the target device and forward traffic to the HTTPS proxy server (port `8000` by default).


## Possible Fixes
One way to fix this vulnerbility is to use a [HMAC](https://en.wikipedia.org/wiki/Hash-based_message_authentication_code) to verify the contents of the server response (it seems like client requests already use some sort of MAC, but not server responses).

Another, easier way to fix the vulnerbility on a majority of devices would be to use [HPKG](https://en.wikipedia.org/wiki/HTTP_Public_Key_Pinning), which would stop the application from trusting other public keys. However, this could be circumvented on jailbroken or root devices with applications that disable certificate pinning.
