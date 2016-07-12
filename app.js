#!/usr/bin/env node

import Koa from 'koa';
const app = new Koa();
app.proxy = process.env.PROXY || false;

import Router from 'koa-router';
const router = new Router();

import bodyParser from 'koa-bodyparser';
import { readFile } from 'fs';

import * as winston from 'winston';

const logger = new winston.Logger();
logger.add(winston.transports.File, {
  filename: process.env.LOG_FILE || `${__dirname}/request.log`,
  maxFiles: 5,
  maxsize: 5000000,
  tailable: true,
  json: process.env.JSON_LOG || true
});
logger.add(winston.transports.Console);

router.post('/', async (ctx, next) => {
  if (!ctx.request.body || !ctx.request.body.user_id) {
    return ctx.status = 400;
  }
  await handleAuthRequest(ctx);

  next();
});

async function handleAuthRequest(ctx) {
  const userId = ctx.request.body.user_id;
  const blacklisted = await isUserBlacklisted(userId);
  const response = {
    blacklisted: blacklisted
  };
  if (blacklisted) {
    ctx.status = 401;
  }
  logger.info('request from %s for user %s --> blacklisted %s', ctx.request.ip, userId, blacklisted, {
    userId: userId,
    ip: ctx.request.ip,
    port: ctx.request.headers['bukkit-server-port'],
    blacklisted: blacklisted
  });
  ctx.set('Content-Type', 'application/json');
  ctx.body = JSON.stringify(response);
}

async function readFileAsync(file) {
  return await new Promise(resolve => {
    readFile(file, 'utf8', (err, data) => {
      resolve(data);
    });
  });
}

async function isUserBlacklisted(userId) {
  const bannedUsersFile = await readFileAsync(process.env.BLACKLISTED_USERS_FILE || `${__dirname}/banned_users.txt`);
  if (!bannedUsersFile) {
    return false;
  }
  const bannedUsers = bannedUsersFile.toString().split('\n');
  return (bannedUsers.indexOf(userId) !== -1);
}

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

const server = app.listen(process.env.PORT || 3000, () => {
  logger.info('Spigot Anti Piracy Backend listening at http://%s:%s', server.address().address, server.address().port);
  logger.info('Logging to %s', process.env.LOG_FILE || `${__dirname}/request.log`);
  logger.info('Using %s for blacklisted users', process.env.BLACKLISTED_USERS_FILE || `${__dirname}/banned_users.txt`);
});

export default app;
