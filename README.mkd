Hi there!
=========

[![Build Status](https://secure.travis-ci.org/nornalbion/node-jrc.png?branch=master)](http://travis-ci.org/nornalbion/node-jrc)

**node-jrc** is an open-source (probably MIT license) JavaScript implementation of [JRChat](http://creatures.wikia.com/wiki/JRChat) for Node.

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
