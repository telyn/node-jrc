Hi there!
=========

![](https://build.aetheria.co.uk/buildStatus/icon?job=node-jrc)

**node-jrc** is an open-source (probably MIT license) JavaScript implementation of [JRChat](http://creatures.wikia.com/wiki/JRChat) for Node.

![JRNet Screenshot](http://i.imgur.com/P9Rwcin.png)
You can try it out today; there's a node-jrc server running at aetheria.co.uk:41528.

In time it will come to include both a server and client library, with samples and API documentation.


Usage
=====

Alright, so you want to set up your own server? Great! It's as simple as

    npm install jrc
    cd node_modules/jrc
    npm start

or, for the braver:

    git clone git://github.com/nornalbion/node-jrc.git
    cd node-jrc
    bin/jrc-server

Take a look at the file config.json.sample if you want to configure things such as masters.
