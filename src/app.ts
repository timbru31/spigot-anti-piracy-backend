#!/usr/bin/env node

import { readFile } from 'fs';
import * as Koa from 'koa';
import bodyParser = require('koa-bodyparser');
import * as Router from 'koa-router';

import * as winston from 'winston';

export const app = new Koa();
app.proxy = Boolean(process.env.PROXY) || false;

const router = new Router();

const logger = new winston.Logger();
logger.add(winston.transports.File, {
  filename: process.env.LOG_FILE || `${__dirname}/request.log`,
  json: process.env.JSON_LOG || true,
  maxFiles: 5,
  maxsize: 5000000,
  tailable: true
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

  // tslint:disable:next-line no-floating-promises
  next();
});

async function handleAuthRequest(ctx: Router.IRouterContext) {
  const request = ctx.request;
  const body = request.body;
  const userId: string = body.user_id;
  const ip = request.ip;
  const blacklisted = await isUserBlacklisted(userId);
  const response = {
    blacklisted
  };
  if (blacklisted) {
    ctx.status = 401;
  }
  logger.info('request from %s for user %s --> blacklisted %s', ip, userId, blacklisted, {
    blacklisted,
    ip,
    plugin: body.plugin,
    port: request.headers['bukkit-server-port'] || body.port,
    userId
  });
  ctx.set('Content-Type', 'application/json');
  ctx.body = JSON.stringify(response);
}

async function isUserBlacklisted(userId: string) {
  const bannedUsersFile = await readFileAsync(process.env.BLACKLISTED_USERS_FILE || `${__dirname}/banned_users.txt`);
  if (!bannedUsersFile) {
    return false;
  }
  const bannedUsers = bannedUsersFile.toString().split('\n');
  return bannedUsers.includes(userId);
}

function readFileAsync(file: string) {
  return new Promise(resolve => {
    readFile(file, 'utf8', (err, data) => {
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
