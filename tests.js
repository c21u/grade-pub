const request = require('supertest');
const test = require('tape');

const app = require('./app');

test('First test', (assert) => {
  request(app)
  .get('/')
  .expect(401)
  .end((err, res) => {
    assert.error(err, 'No error');
    assert.end();
  });
});
