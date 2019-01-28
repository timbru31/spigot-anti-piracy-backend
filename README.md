# spigot-anti-piracy-backend
[![Build Status](https://travis-ci.org/timbru31/spigot-anti-piracy-backend.svg?branch=master)](https://travis-ci.org/timbru31/spigot-anti-piracy-backend)
[![Circle CI](https://img.shields.io/circleci/project/timbru31/spigot-anti-piracy-backend.svg)](https://circleci.com/gh/timbru31/spigot-anti-piracy-backend)
[![Build status](https://ci.appveyor.com/api/projects/status/asl8iebx2n19kv4y?svg=true)](https://ci.appveyor.com/project/timbru31/spigot-anti-piracy-backend)

[![Dependency Status](https://david-dm.org/timbru31/spigot-anti-piracy-backend.svg)](https://david-dm.org/timbru31/spigot-anti-piracy-backend)
[![devDependency Status](https://david-dm.org/timbru31/spigot-anti-piracy-backend/dev-status.svg)](https://david-dm.org/timbru31/spigot-anti-piracy-backend#info=devDependencies)
[![Test Coverage](https://codeclimate.com/github/timbru31/spigot-anti-piracy-backend/badges/coverage.svg)](https://codeclimate.com/github/timbru31/spigot-anti-piracy-backend/coverage)
[![Coverage Status](https://coveralls.io/repos/github/timbru31/spigot-anti-piracy-backend/badge.svg?branch=master)](https://coveralls.io/github/timbru31/spigot-anti-piracy-backend?branch=master)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/716c0578012b4237844e8ac680e0127c)](https://www.codacy.com/app/timbru31/spigot-anti-piracy-backend?utm_source=github.com&utm_medium=referral&utm_content=timbru31/spigot-anti-piracy-backend&utm_campaign=Badge_Coverage)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/716c0578012b4237844e8ac680e0127c)](https://www.codacy.com/app/timbru31/spigot-anti-piracy-backend?utm_source=github.com&utm_medium=referral&utm_content=timbru31/spigot-anti-piracy-backend&utm_campaign=badger)
[![Code Climate](https://codeclimate.com/github/timbru31/spigot-anti-piracy-backend/badges/gpa.svg)](https://codeclimate.com/github/timbru31/spigot-anti-piracy-backend)
[![Known Vulnerabilities](https://snyk.io/test/github/timbru31/spigot-anti-piracy-backend/badge.svg)](https://snyk.io/test/github/timbru31/spigot-anti-piracy-backend)

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=timbru31/spigot-anti-piracy-backend)](https://dependabot.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/spigot-anti-piracy-backend.svg)](https://www.npmjs.com/package/spigot-anti-piracy-backend)

#### A Koa.js powered Node.js backend to blacklist leaked Spigot Premium plugins

### Motivation

I'm sad that such a project is existing.  
Since 2011 I'm providing the community with a lot of free CraftBukkit plugins.
Over **one and a half million** downloads in total. That is a huge number.
Nevertheless the community is in some points an unkind one.
It does not matter how much spare time you spent, the update was never fast enough. And complaining is always easier than to say "thank you!".

With the premium plugin solution, Spigot offers the developers a way to the get something back for their work.
And in general a lot cheaper than hiring a private plugin developer.
When you see your plugin only one week after the initial release on sites that offer leaked plugins, it's frustrating.

That's why I decided to make my own validation service - to blacklist the leaker is often a lot faster than sending DMCA requests to One-Click-Hosters (OCH).

### Description

The Spigot built in piracy protection is known and easy to remove.
There is a way to receive the user id of the buyer in your code.
Please contact me on SpigotMC, I'd like to make the method not total publicly accessible (although it is when you dig enough).

Once you retrieved the user id you can make a POST request the URL where you service runs.
In the body, include the following information:
```
user_id=foobar
```
(userId works, too)

An example Java implementation can be found in [docs/](docs/).

The service is only accepting POST, no GET.
You receive a JSON with either blacklisted true or false:
```json
{
  "blacklisted": true
}
```

### Installation

Ensure that your server you wish to run the piracy backend with is running at least **Node 8 LTS**


#### Normal Installation

```shell
$ npm install -g spigot-anti-piracy-backend
```

(Optionally without the global flag)

#### Development Installation

```shell
$ git clone https://github.com/timbru31/spigot-anti-piracy-backend.git
$ cd spigot-anti-piracy-backend
$ npm install
$ npm run watch
```

### Usage

You need to manually maintain a blacklisted users file.
I'd recommend a simple text file, with one blacklisted user id per line.

Just use
```shell
$ npm run start
```

Configuration via environment variables

| Environment Variable   | Default            | Description                                                          |
|:---------------------- |:------------------ |:-------------------------------------------------------------------- |
| PORT                   | 3000               | Port to run the app on                                               |
| BLACKLISTED_USERS_FILE | ./banned_users.txt | Blacklist file                                                       |
| LOG_FILE               | ./request.log      | Log file for requests                                                |
| PROXY                  | false              | Tells Koa to run on proxy mode, for support for X-Forwarded Headers  |
| JSON_LOG               | true               | Logs to the file in a JSON format, disable for human readable output |

It's up to you, if you would like to spin the service up with e.g. a linux start script.

For example here is an upstart script which runs the script as a non privileged user.

You can read more about upstart [here](http://upstart.ubuntu.com/cookbook)

(Script was inspired by [http://technosophos.com/2013/03/06/how-use-ubuntus-upstart-control-nodejs-forever.html](http://technosophos.com/2013/03/06/how-use-ubuntus-upstart-control-nodejs-forever.html))

```
description "Spigot Anti-Piracy Backend Server"
author "timbru31"

# Start up when the system hits any normal runlevel, and
# shuts down when the system goes to shutdown or reboot.
start on filesystem or runlevel [2345]
stop on runlevel [06]

setuid example
# The user's home directory
env HOME=/home/example
env PORT=3005
env BLACKLISTED_USERS_FILE=/home/example/banned_users.txt

# automatically respawn
respawn
respawn limit 99 5

# Send error messages to the console. Useful for debugging.
#console output

script
  spigot-anti-piracy-backend
end script
```

### Development

You can watch the `app.js` for file changes via the task
```shell
$ npm run watch
```
It uses [Nodemon](https://nodemon.io) to watch for file changes and re-starts the server if any are found.

Test are run with [Mocha](https://mochajs.org) via
```shell
$ npm run test
```

The code is linted using `ESLint`.  
Keep the warnings to zero. :smile:

Please make sure they all pass and add new ones when you develop new stuff! :smile:

**Please follow the commitizen style when making new commits!**

### Future

Since this is a blacklist solution, a planned future is to validate the supplied user id against the buyers of the premium plugin.
Only when it's on the list, the plugin is allowed to start (as long, as the user is not blacklisted).

The following document query can be used to retrieve an array of all user id's who bought the plugin:
```js
let buyers = Array.from(document.querySelector('.memberList').querySelectorAll('a.username'));
buyers.forEach((elem, index, arr) => {
  arr[index] = parseInt(elem.pathname.replace(/\/members\/[-_a-zA-Z0-9]+\./, '').replace('/', ''));
});
```

---
Built by (c) Tim Brust and contributors. Released under the MIT license.
