#!/usr/bin/env node

import { promises } from 'fs';
import { join } from 'path';

import * as Koa from 'koa';
import bodyParser = require('koa-bodyparser');
import * as Router from '@koa/router';

import * as winston from 'winston';
import { AddressInfo } from 'net';

interface IRequestBody {
    user_id?: string;
    userId?: string;
    plugin?: string;
    port?: string;
}

export const app = new Koa();
app.proxy = Boolean(process.env.PROXY) || false;

const router = new Router();

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.json()
    )
});
logger.add(
    new winston.transports.File({
        filename: process.env.LOG_FILE || join(__dirname, 'request.log'),
        maxFiles: 5,
        maxsize: 5000000,
        tailable: true
    })
);

if (process.env.NODE_ENV !== 'test') {
    logger.add(
        new winston.transports.Console({
            format: winston.format.simple()
        })
    );
}

router.post('/', async (ctx, next) => {
    const body = ctx.request.body as IRequestBody;
    if (!ctx.request.body || (!body.user_id && !body.userId)) {
        return (ctx.status = 400);
    }
    await handleAuthRequest(ctx);

    // tslint:disable:next-line no-floating-promises
    next();
});

async function handleAuthRequest(ctx: Router.RouterContext) {
    const request = ctx.request;
    const body = request.body as IRequestBody;
    const userId = body.user_id! || body.userId!;
    const ip = request.ip;
    const blacklisted = await isUserBlacklisted(userId);
    const response = {
        blacklisted
    };
    if (blacklisted) {
        ctx.status = 401;
    }
    logger.info(
        'request from %s for user %s --> blacklisted %s',
        ip,
        userId,
        blacklisted,
        {
            blacklisted,
            ip,
            plugin: body.plugin,
            port: request.headers['bukkit-server-port'] || body.port,
            userId
        }
    );
    ctx.set('Content-Type', 'application/json');
    ctx.body = JSON.stringify(response);
}

async function isUserBlacklisted(userId: string) {
    const bannedFileLocation =
        process.env.BLACKLISTED_USERS_FILE ||
        join(__dirname, 'banned_users.txt');
    try {
        const bannedUsersFile = await promises.readFile(
            bannedFileLocation,
            'utf-8'
        );
        if (!bannedUsersFile) {
            return false;
        }
        const bannedUsers = bannedUsersFile.toString().match(/[^\r\n]+/g) || [];
        return bannedUsers.includes(userId);
    } catch {
        return false;
    }
}

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

const server = app.listen(process.env.PORT || 3000, () => {
    const loggerFileLocation =
        process.env.LOG_FILE || join(__dirname, 'request.log');
    const bannedFileLocation =
        process.env.BLACKLISTED_USERS_FILE ||
        join(__dirname, 'banned_users.txt');
    logger.info(
        'Spigot Anti Piracy Backend listening at http://%s:%s',
        (server.address() as AddressInfo).address,
        (server.address() as AddressInfo).port
    );
    logger.info('Logging to %s', loggerFileLocation);
    logger.info('Using %s for blacklisted users', bannedFileLocation);
});
