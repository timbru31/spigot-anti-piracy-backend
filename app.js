import babelpolyfill from 'babel-polyfill';

import Koa from 'koa';
const app = new Koa();

import Router from 'koa-router';
const router = new Router();

import bodyParser from 'koa-bodyparser';
import { readFileSync } from 'fs';

router.post('/',
  async (ctx, next) => {
    console.log(ctx.request.body);
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
  ctx.set('Content-Type', 'application/json');
  ctx.body = JSON.stringify(response);
}

async function isUserBlacklisted(userId) {
  const bannedUsers = readFileSync('file.txt').toString().split('\n');
  return (bannedUsers.indexOf(userId) !== -1);
}

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(process.env.PORT || 3000);
