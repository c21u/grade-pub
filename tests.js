const request = require('supertest');
const test = require('tape');

const app = require('./server');
const fakeAuth = require('./config').auth.fake;

test('Can POST to be authenticated', (assert) => {
  if (!fakeAuth.username || !fakeAuth.password) {
    assert.comment('Fake testing credentials were not found.');
  }

  request(app)
    .post('/')
    .send(`username=${fakeAuth.username}`)
    .send(`password=${fakeAuth.password}`)
    .expect(302)
    .expect('Location', /^\/\?token=.+\..+\..+$/)
    .end((err, res) => {
      assert.error(err, 'No error');
      assert.end();
    });
});

test('Should not authenticate with bad credentials', (assert) => {
  request(app)
    .post('/')
    .send(`username=incorrect`)
    .send(`password=password`)
    .expect(401)
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

test('/api routes should be protected', (assert) => {
  assert.plan(1);
  request(app)
    .get('/api')
    .expect(401)
    .end((err, res) => {
      assert.error(err, 'No error');
    });
});

test('Health check returns 200', (assert) => {
  assert.plan(1);
  request(app)
  .get('/z')
  .expect(200)
  .end((err, res) => assert.error(err, 'No error'));
});
