process.env.BLACKLISTED_USERS_FILE = `${__dirname}/blacklisted_users.txt`;

import app from '../app';
import supertest from 'supertest';

const request = supertest.agent(app.listen());

describe('Using GET',() => {
  it('should return a 405 (Method not allowed)', done => {
    request
      .get('/')
      .expect(405)
      .end(done);
  });
});

describe('Using POST',() => {
  it('should return a 400 (Bad Request) with no parameters', done => {
    request
      .post('/')
      .expect(400)
      .end(done);
  });

  it('should return a 401 (Bad Request) for a blacklisted user id', done => {
    request
      .post('/')
      .send({ user_id: '123'})
      .expect(401)
      .end(done);
  });

  it('should return a 200 (OK) for a non blacklisted user id', done => {
    request
      .post('/')
      .send({ user_id: 'not-banned'})
      .expect(200)
      .end(done);
  });
});
