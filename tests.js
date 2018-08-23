const request = require('supertest');
const test = require('tape');
const fakeAuth = require('./config').auth.fake;

const app = require('./app');

test('Can POST to get authenticated', (assert) => {
  request(app)
  .post('/')
  .send(`username=${fakeAuth.username}`)
  .send(`password=${fakeAuth.password}`)
  .expect(302)
  .expect('Location', /\/secret\?token=.+\..+\..+$/)
  .end((err, res) => {
    assert.error(err, 'No error');
    assert.end();
  });
});

test('GET / should be protected', (assert) => {
  request(app)
  .get('/')
  .expect(401)
  .end((err, res) => {
    assert.error(err, 'No error');
    assert.end();
  });
});
