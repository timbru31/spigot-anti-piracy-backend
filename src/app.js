#!/usr/bin/env node

const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const fs = require('fs');
const winston = require('winston');

const app = new Koa();
app.proxy = process.env.PROXY || false;

const router = new Router();

const logger = new winston.Logger();
logger.add(winston.transports.File, {
  filename: process.env.LOG_FILE || `${__dirname}/request.log`,
  maxFiles: 5,
  maxsize: 5000000,
  tailable: true,
  json: process.env.JSON_LOG || true
});

if (process.env.NODE_ENV !== 'test') {
  logger.add(winston.transports.Console);
}

router.post('/',  async (ctx, next) => {
  const body = ctx.request.body;
  if (!ctx.request.body || !body.user_id) {
    return ctx.status = 400;
  }
  await handleAuthRequest(ctx);

  next();
});

async function handleAuthRequest(ctx) {
  const request = ctx.request;
  const body = request.body;
  const userId = body.user_id;
  const ip = request.ip;
  const blacklisted = await isUserBlacklisted(userId);
  const response = {
    blacklisted
  };
  if (blacklisted) {
    ctx.status = 401;
  }
  logger.info('request from %s for user %s --> blacklisted %s', ip, userId, blacklisted, {
    userId,
    ip,
    port: request.headers['bukkit-server-port'] || body.port,
    plugin: body.plugin,
    blacklisted
  });
  ctx.set('Content-Type', 'application/json');
  ctx.body = JSON.stringify(response);
}

async function isUserBlacklisted(userId) {
  const bannedUsersFile = await readFileAsync(process.env.BLACKLISTED_USERS_FILE || `${__dirname}/banned_users.txt`);
  if (!bannedUsersFile) {
    return false;
  }
  const bannedUsers = bannedUsersFile.toString().split('\n');
  return bannedUsers.includes(userId);
}

function readFileAsync(file) {
  return new Promise(resolve => {
    fs.readFile(file, 'utf8', (err, data) => {
      resolve(data);
    });
  });
}

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

const server = app.listen(process.env.PORT || 3000, () => {
  logger.info('Spigot Anti Piracy Backend listening at http://%s:%s', server.address().address, server.address().port);
  logger.info('Logging to %s', process.env.LOG_FILE || `${__dirname}/request.log`);
  logger.info('Using %s for blacklisted users', process.env.BLACKLISTED_USERS_FILE || `${__dirname}/banned_users.txt`);
});

module.exports = app;
