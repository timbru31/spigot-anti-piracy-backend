/* eslint-disable */
import 'babel-polyfill';
/* eslint-enable */

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
  tailable: true
});
logger.add(winston.transports.Console);

router.post('/',
  async (ctx, next) => {
    if (!ctx.request.body || !ctx.request.body.user_id) {
      return ctx.status = 400;
    }
    await handleAuthRequest(ctx);

    next();
  }
);

async function handleAuthRequest(ctx) {
  const userId = ctx.request.body.user_id;
  const blacklisted = await isUserBlacklisted(userId);
  let response = new Object();
  response.blacklisted = blacklisted;
  if (blacklisted) {
    ctx.status = 401;
  }
  logger.info('request from %s for user %s --> backlisted %s', ctx.request.ip, userId, blacklisted);
  ctx.set('Content-Type', 'application/json');
  ctx.body = JSON.stringify(response);
}

async function readFileAsync(file) {
  return new Promise(resolve => {
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

app.listen(process.env.PORT || 3000);

export default app;
