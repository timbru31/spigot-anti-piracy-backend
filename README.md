# spigot-anti-piracy-backend

[![Linting](https://github.com/timbru31/spigot-anti-piracy-backend/workflows/Linting/badge.svg)](https://github.com/timbru31/spigot-anti-piracy-backend/actions?query=workflow%3ALinting)
[![Run a security audit](https://github.com/timbru31/spigot-anti-piracy-backend/workflows/Run%20a%20security%20audit/badge.svg)](https://github.com/timbru31/spigot-anti-piracy-backend/actions?query=workflow%3A%22Run+a+security+audit%22)
[![Coverage](https://github.com/timbru31/spigot-anti-piracy-backend/workflows/Coverage/badge.svg)](https://github.com/timbru31/spigot-anti-piracy-backend/actions?query=workflow%3ACoverage)
[![Run the testsuite](https://github.com/timbru31/spigot-anti-piracy-backend/workflows/Run%20the%20testsuite/badge.svg)](https://github.com/timbru31/spigot-anti-piracy-backend/actions?query=workflow%3A%22Run+the+testsuite%22)

[![Dependency Status](https://david-dm.org/timbru31/spigot-anti-piracy-backend.svg)](https://david-dm.org/timbru31/spigot-anti-piracy-backend)
[![devDependency Status](https://david-dm.org/timbru31/spigot-anti-piracy-backend/dev-status.svg)](https://david-dm.org/timbru31/spigot-anti-piracy-backend#info=devDependencies)
[![Test Coverage](https://codeclimate.com/github/timbru31/spigot-anti-piracy-backend/badges/coverage.svg)](https://codeclimate.com/github/timbru31/spigot-anti-piracy-backend/coverage)
[![Code Climate](https://codeclimate.com/github/timbru31/spigot-anti-piracy-backend/badges/gpa.svg)](https://codeclimate.com/github/timbru31/spigot-anti-piracy-backend)
[![Known Vulnerabilities](https://snyk.io/test/github/timbru31/spigot-anti-piracy-backend/badge.svg)](https://snyk.io/test/github/timbru31/spigot-anti-piracy-backend)

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](https://commitizen.github.io/cz-cli/)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=timbru31/spigot-anti-piracy-backend)](https://dependabot.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/spigot-anti-piracy-backend.svg)](https://www.npmjs.com/package/spigot-anti-piracy-backend)

#### A Koa.js powered Node.js backend to blacklist leaked Spigot Premium plugins

### Motivation

I'm sad that such a project is existing.  
Since 2011 I have been providing the community with a lot of free CraftBukkit plugins.
Over **one and a half million** downloads in total. That is a huge number.
Nevertheless, at some points, the community is an unkind one.
It does not matter how much spare time you spent working on the new version, the update was never fast enough. And complaining is always easier than saying 'thank you!'.

With the premium plugin solution, Spigot offers developers a way to the get something back for their work.
And in general a lot cheaper than hiring a private plugin developer.
When you see your plugin on sites that offer leaked plugins just one week after the initial release, it's frustrating.

That's why I decided to make my own validation service - blacklisting the leaker is often a lot faster than sending DMCA requests to One-Click-Hosters (OCH).

### Description

The Spigot built in piracy protection is well-known and easy to remove.
There is a way to receive the user id of the buyer in your code.
Please contact me on SpigotMC, I'd prefer not to make the method not easily and publicly accessible (although it is when you dig enough).

Once you retrieved the user id you can make a POST request to the URL where you service runs.
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

Ensure that the server you wish to run the piracy backend with is running at least **Node.js v18 LTS**

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
| :--------------------- | :----------------- | :------------------------------------------------------------------- |
| PORT                   | 3000               | Port to run the app on                                               |
| BLACKLISTED_USERS_FILE | ./banned_users.txt | Blacklist file                                                       |
| LOG_FILE               | ./request.log      | Log file for requests                                                |
| PROXY                  | false              | Tells Koa to run on proxy mode, for support for X-Forwarded Headers  |
| JSON_LOG               | true               | Logs to the file in a JSON format, disable for human readable output |

It's up to you if you would like to start the service on startup e.g. using a linux start script.  
For example, below is a systemd script which runs the script as a non-privileged user.

```
[Unit]
Description=Spigot Anti-Piracy Backend Server
After=network.target

[Service]
Environment=PORT=3005
Environment=BLACKLISTED_USERS_FILE=/home/example/banned_users.txt
Type=simple
User=example
# Assuming a global installation
ExecStart=spigot-anti-piracy-backend
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

### Development

You can watch the `app.ts` for file changes via the task

```shell
$ npm run watch
```

It uses [Nodemon](https://nodemon.io) to watch for file changes and restarts the server if any are found.

Test are run with [Mocha](https://mochajs.org) via

```shell
$ npm run test
```

The code is linted using `TSLint`.  
Keep the warnings to zero. :smile:

Please make sure they all pass and add new ones when you develop new stuff! :smile:

**Please follow the commitizen style when making new commits!**

### Future

Since this is a blacklist solution, the planned future is to validate the supplied user id against the buyers of the premium plugin.
Only when it's on the list, the plugin is allowed to start (as long as the user is not blacklisted).

The following document query can be used to retrieve an array of all user ids who bought the plugin:

```js
let buyers = Array.from(
    document.querySelector('.memberList').querySelectorAll('a.username')
);
buyers.forEach((elem, index, arr) => {
    arr[index] = parseInt(
        elem.pathname
            .replace(/\/members\/[-_a-zA-Z0-9]+\./, '')
            .replace('/', '')
    );
});
```

---

Built by (c) Tim Brust and contributors. Released under the MIT license.
