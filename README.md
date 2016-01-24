# spigot-anti-piracy-backend
[![Build Status](https://travis-ci.org/timbru31/spigot-anti-piracy-backend.svg?branch=master)](https://travis-ci.org/timbru31/spigot-anti-piracy-backend)
[![Dependency Status](https://david-dm.org/timbru31/spigot-anti-piracy-backend.svg)](https://david-dm.org/timbru31/spigot-anti-piracy-backend)
[![devDependency Status](https://david-dm.org/timbru31/spigot-anti-piracy-backend/dev-status.svg)](https://david-dm.org/timbru31/spigot-anti-piracy-backend#info=devDependencies)
[![Code Climate](https://codeclimate.com/github/timbru31/spigot-anti-piracy-backend/badges/gpa.svg)](https://codeclimate.com/github/timbru31/spigot-anti-piracy-backend)
[![Test Coverage](https://codeclimate.com/github/timbru31/spigot-anti-piracy-backend/badges/coverage.svg)](https://codeclimate.com/github/timbru31/spigot-anti-piracy-backend/coverage)
[![Coverage Status](https://coveralls.io/repos/github/timbru31/spigot-anti-piracy-backend/badge.svg?branch=master)](https://coveralls.io/github/timbru31/spigot-anti-piracy-backend?branch=master)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

#### A Koa.js powered Node.js backend to blacklist leaked Spigot Premium plugins

### Motivation

I'm sad that such a project is existing.
Since 2011 I'm providing the community with a lot of free CraftBukkit plugins.
Over a **million** downloads in total. That is a huge number.
Nevertheless the community is in some points an unkind one.
It does not matter how much spare time you spent, the update was never fast enough. And complaining is always easier than to say "thank you!".

With the premium plugin solution, Spigot offers the developers a way to the get something back for their work.
And in general a lot cheaper than hiring a private plugin developer.
When you see your plugin only one week after the inital release on sites that offer leaked plugins, it's frustrating.

That's why I decided to make my own validation service, to blacklist the leaker a lot faster than sending DMCA request to OCH's.

### Description

The Spigot built in piracy protection is known and easy to remove.
There is a way to receive the user id of the buyer in your code.
Please contact me on SpigotMC, I'd like to make the method not total publicly accessible.

Once you retrieved the user id you can make a POST request the URL where you service runs.
In the body, include the following information:
````
user_id=foobar
````

Example Java implementation
````java
String rawData = "user_id=";
String userId = someObject().getUserID();
String encodedData = null;
try {
    encodedData = rawData + URLEncoder.encode(userId, "UTF-8");
} catch (UnsupportedEncodingException e) {
    // catch error or not. up to you
    return;
}
````

That's it.

The service is only accepting POST, no GET.
You recieve a JSON with either blacklisted true or false:
````json
{
  "blacklisted": true
}
````

### Installation

Ensure that your server you wish to run the piracy backend with is running at least **Node 4.2**
(TravisCI is testing against 4.2 and 5.5)

````shell
$ git clone https://github.com/timbru31/spigot-anti-piracy-backend.git
$ cd spigot-anti-piracy-backend
$ npm install
````

For the first install, we need Babel to compile the code.

````shell
$ npm run build
````

### Usage

You need to manually maintain a blacklisted users file.
I'd recommend a simple text file, with one blacklisted user id per line.

Just use
````shell
$ npm run start
````

You can supply the ``port`` you want to use via the ``PORT`` env variable and the blacklist via the ``BLACKLISTED_USERS_FILE`` env variable.
Per default the app starts on port 3000 and looks for a banned_users.txt in the same folder.

It's up to you, if you would like to spin the service up with e.g. a linux start script.

### Development

You can watch the ``app.js`` for file changes via the task
````shell
$ npm run watch
````
It uses [Nodemon](http://nodemon.io) to watch for file changes and re-starts the server using ``babel-node`` instead of ``node``.

Test are run via
````shell
$ npm run test
````

The code is linted using ``ESLint`` using the ``babel-eslint`` parser.
Keep the warnin to zero. :smile:

Please make sure they all pass and add new ones when you develop new stuff! :smile:

**Please follow the commitizen style when making new commits!**

### Future

Since this is a blacklist solution, a planned future is to validate the supplied user id against the buyers of the premium plugin.
Only when it's on the list, the plugin is allowed to start (as long, as the user is not blacklisted).

The project is written using bleeding edge software. I'm trying my best to keep it updated.
[Greenkeeper](http://greenkeeper.io) is helping me to do so, by making pull request for dependency updates. Thanks for this great service! :rocket:

When Node is ready for async/await, I'm planning to remove all the Babel stuff again. (as soon as Koa 2.0 becomes stable)
