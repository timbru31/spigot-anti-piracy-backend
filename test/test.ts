import * as supertest from 'supertest';

import { join } from 'path';
import { app } from '../src/app';

process.env.BLACKLISTED_USERS_FILE = join(__dirname, 'blacklisted_users.txt');
process.env.NODE_ENV = 'test';

const request = supertest.agent(app.listen());

describe('Using PUT', () => {
    it('should return a 405 (Method not allowed)', async () => {
        await request.put('/').expect(405);
    });
});

describe('Using DELETE', () => {
    it('should return a 405 (Method not allowed)', async () => {
        await request.delete('/').expect(405);
    });
});

describe('Using HEAD', () => {
    it('should return a 405 (Method not allowed)', async () => {
        await request.head('/').expect(405);
    });
});

describe('Using GET', () => {
    it('should return a 405 (Method not allowed)', async () => {
        await request.get('/').expect(405);
    });
});

describe('Using PATCH', () => {
    it('should return a 405 (Method not allowed)', async () => {
        await request.patch('/').expect(405);
    });
});

describe('Using HEAD', () => {
    it('should return a 405 (Method not allowed)', async () => {
        await request.head('/').expect(405);
    });
});

describe('Using OPTIONS', () => {
    it('should return a 200 (OK)', async () => {
        await request.options('/').expect(200);
    });
});

describe('Using POST', () => {
    it('should return a 400 (Bad Request) with no parameters', async () => {
        await request.post('/').expect(400);
    });

    it('should return a 400 (Bad Request) if no user id was supplied', async () => {
        await request.post('/').send({ foo: 'bar' }).expect(400);
    });

    it('should return a 400 (Bad Request) for an empty user id', async () => {
        await request.post('/').send({ user_id: '' }).expect(400);
    });

    it('should return a 401 (Unauthorized) for a blacklisted user id (123)', async () => {
        await request
            .post('/')
            .send({ user_id: '123' })
            .expect(401, {
                blacklisted: true,
            })
            .expect('Content-Type', /json/);
    });

    it('should return a 401 (Unauthorized) for a blacklisted user id (abc)', async () => {
        await request
            .post('/')
            .send({ user_id: 'abc' })
            .expect(401, {
                blacklisted: true,
            })
            .expect('Content-Type', /json/);
    });

    it('should return a 200 (OK) for a non blacklisted user id', async () => {
        await request
            .post('/')
            .send({ user_id: 'not-banned' })
            .expect(200, {
                blacklisted: false,
            })
            .expect('Content-Type', /json/);
    });

    it('should return a 200 (OK) for a non blacklisted user id with userId payload', async () => {
        await request
            .post('/')
            .send({ userId: 'not-banned' })
            .expect(200, {
                blacklisted: false,
            })
            .expect('Content-Type', /json/);
    });

    it('should accept application/x-www-form-urlencoded', async () => {
        await request
            .post('/')
            .type('form')
            .send({
                bar: true,
                user_id: '123',
            })
            .expect(401, {
                blacklisted: true,
            })
            .expect('Content-Type', /json/);
    });

    it('should return a 200 (OK) if the banned users file is not found', async () => {
        process.env.BLACKLISTED_USERS_FILE = `${__dirname}/not-existing.txt`;
        await request
            .post('/')
            .send({ user_id: '123' })
            .expect(200, {
                blacklisted: false,
            })
            .expect('Content-Type', /json/);
    });

    it('should ignore other parameters', async () => {
        await request
            .post('/')
            .send({
                example: true,
                foo: 'bar',
                user_id: '123',
            })
            .expect(200, {
                blacklisted: false,
            })
            .expect('Content-Type', /json/);
    });
});

describe('Defaulting to banned_users.txt', () => {
    it('when no process.env.BLACKLISTED_USERS_FILE is defined', async () => {
        delete process.env.BLACKLISTED_USERS_FILE;
        await request
            .post('/')
            .send({ user_id: 'foo' })
            .expect(200, {
                blacklisted: false,
            })
            .expect('Content-Type', /json/);
    });
});
