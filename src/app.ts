#!/usr/bin/env node

import * as Router from '@koa/router';
import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import { promises } from 'node:fs';
import { AddressInfo } from 'node:net';
import { join } from 'node:path';
import { createLogger, format, transports } from 'winston';

interface IRequestBody {
    user_id?: string;
    userId?: string;
    plugin?: string;
    port?: string;
}

export const app = new Koa();
app.proxy = Boolean(process.env.PROXY) || false;

const router = new Router();

const logger = createLogger({
    format: format.combine(format.timestamp(), format.splat(), format.json()),
});

logger.add(
    new transports.File({
        filename: process.env.LOG_FILE ?? join(__dirname, 'request.log'),
        maxFiles: 5,
        maxsize: 5000000,
        tailable: true,
    }),
);

if (process.env.NODE_ENV !== 'test') {
    logger.add(
        new transports.Console({
            format: format.simple(),
        }),
    );
}

router.post('/', async (ctx, next) => {
    const body = ctx.request.body as IRequestBody;
    if (!ctx.request.body || (!body.user_id && !body.userId)) {
        return (ctx.status = 400);
    }
    await handleAuthRequest(ctx);

    await next();
});

async function handleAuthRequest(ctx: Router.RouterContext) {
    const request = ctx.request;
    const body = request.body as IRequestBody;
    const userId = body.user_id ?? body.userId;
    if (!userId) {
        ctx.status = 400;
        return;
    }
    const ip = request.ip;
    const blacklisted = await isUserBlacklisted(userId);
    const response = {
        blacklisted,
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
            port: request.headers['bukkit-server-port'] ?? body.port,
            userId,
        },
    );
    ctx.set('Content-Type', 'application/json');
    ctx.body = JSON.stringify(response);
}

async function isUserBlacklisted(userId: string) {
    const bannedFileLocation =
        process.env.BLACKLISTED_USERS_FILE ??
        join(__dirname, 'banned_users.txt');
    try {
        const bannedUsersFile = await promises.readFile(
            bannedFileLocation,
            'utf-8',
        );
        if (!bannedUsersFile) {
            return false;
        }
        const bannedUsers = bannedUsersFile
            .toString()
            .match(/[^\r\n]+/g) as string[];
        return bannedUsers.includes(userId);
    } catch {
        return false;
    }
}

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

const server = app.listen(process.env.PORT ?? 3000, () => {
    const loggerFileLocation =
        process.env.LOG_FILE ?? join(__dirname, 'request.log');
    const bannedFileLocation =
        process.env.BLACKLISTED_USERS_FILE ??
        join(__dirname, 'banned_users.txt');
    logger.info(
        'Spigot Anti Piracy Backend listening at http://%s:%s',
        (server.address() as AddressInfo).address,
        (server.address() as AddressInfo).port,
    );
    logger.info('Logging to %s', loggerFileLocation);
    logger.info('Using %s for blacklisted users', bannedFileLocation);
});
