import * as supertest from 'supertest';

import { join } from 'path';
import { app } from '../src/app';

process.env.BLACKLISTED_USERS_FILE = join(__dirname, 'blacklisted_users.txt');
process.env.NODE_ENV = 'test';

const request = supertest.agent(app.listen());

describe('Using PUT', () => {
    it('should return a 405 (Method not allowed)', done => {
        request
            .put('/')
            .expect(405)
            .end(done);
    });
});

describe('Using DELETE', () => {
    it('should return a 405 (Method not allowed)', done => {
        request
            .delete('/')
            .expect(405)
            .end(done);
    });
});

describe('Using HEAD', () => {
    it('should return a 405 (Method not allowed)', done => {
        request
            .head('/')
            .expect(405)
            .end(done);
    });
});

describe('Using GET', () => {
    it('should return a 405 (Method not allowed)', done => {
        request
            .get('/')
            .expect(405)
            .end(done);
    });
});

describe('Using PATCH', () => {
    it('should return a 405 (Method not allowed)', done => {
        request
            .patch('/')
            .expect(405)
            .end(done);
    });
});

describe('Using HEAD', () => {
    it('should return a 405 (Method not allowed)', done => {
        request
            .head('/')
            .expect(405)
            .end(done);
    });
});

describe('Using OPTIONS', () => {
    it('should return a 200 (OK)', done => {
        request
            .options('/')
            .expect(200)
            .end(done);
    });
});

describe('Using POST', () => {
    it('should return a 400 (Bad Request) with no parameters', done => {
        request
            .post('/')
            .expect(400)
            .end(done);
    });

    it('should return a 400 (Bad Request) if no user id was supplied', done => {
        request
            .post('/')
            .send({ foo: 'bar' })
            .expect(400)
            .end(done);
    });

    it('should return a 400 (Bad Request) for an empty user id', done => {
        request
            .post('/')
            .send({ user_id: '' })
            .expect(400)
            .end(done);
    });

    it('should return a 401 (Unauthorized) for a blacklisted user id (123)', done => {
        request
            .post('/')
            .send({ user_id: '123' })
            .expect(401, {
                blacklisted: true
            })
            .expect('Content-Type', /json/)
            .end(done);
    });

    it('should return a 401 (Unauthorized) for a blacklisted user id (abc)', done => {
        request
            .post('/')
            .send({ user_id: 'abc' })
            .expect(401, {
                blacklisted: true
            })
            .expect('Content-Type', /json/)
            .end(done);
    });

    it('should return a 200 (OK) for a non blacklisted user id', done => {
        request
            .post('/')
            .send({ user_id: 'not-banned' })
            .expect(200, {
                blacklisted: false
            })
            .expect('Content-Type', /json/)
            .end(done);
    });

    it('should return a 200 (OK) for a non blacklisted user id with userId payload', done => {
        request
            .post('/')
            .send({ userId: 'not-banned' })
            .expect(200, {
                blacklisted: false
            })
            .expect('Content-Type', /json/)
            .end(done);
    });

    it('should accept application/x-www-form-urlencoded', done => {
        request
            .post('/')
            .type('form')
            .send({
                bar: true,
                user_id: '123'
            })
            .expect(401, {
                blacklisted: true
            })
            .expect('Content-Type', /json/)
            .end(done);
    });

    it('should return a 200 (OK) if the banned users file is not found', done => {
        process.env.BLACKLISTED_USERS_FILE = `${__dirname}/not-existing.txt`;
        request
            .post('/')
            .send({ user_id: '123' })
            .expect(200, {
                blacklisted: false
            })
            .expect('Content-Type', /json/)
            .end(done);
    });

    it('should ignore other parameters', done => {
        request
            .post('/')
            .send({
                example: true,
                foo: 'bar',
                user_id: '123'
            })
            .expect(200, {
                blacklisted: false
            })
            .expect('Content-Type', /json/)
            .end(done);
    });
});

describe('Defaulting to banned_users.txt', () => {
    it('when no process.env.BLACKLISTED_USERS_FILE is defined', done => {
        delete process.env.BLACKLISTED_USERS_FILE;
        request
            .post('/')
            .send({ user_id: 'foo' })
            .expect(200, {
                blacklisted: false
            })
            .expect('Content-Type', /json/)
            .end(done);
    });
});
