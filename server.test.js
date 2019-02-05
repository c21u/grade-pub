const request = require("supertest");

const app = require("./server");
const fakeAuth = require("./config")["fakeStrategyCredentials"];

test("Can POST to be authenticated", done => {
  // Expect the fake credentials to exist.
  expect(fakeAuth.username).toBeDefined();
  expect(fakeAuth.password).toBeDefined();

  request(app)
    .post("/")
    .send(`username=${fakeAuth.username}`)
    .send(`password=${fakeAuth.password}`)
    .expect(302)
    .expect("Location", /^\/\?token=.+\..+\..+$/)
    .end((err, res) => {
      if (err) throw err;
      done();
    });
});

test("Should not authenticate with bad credentials", done => {
  request(app)
    .post("/")
    .send(`username=incorrect`)
    .send(`password=password`)
    .expect(401)
    .end((err, res) => {
      if (err) throw err;
      done();
    });
});

test("/api routes should be protected", done => {
  request(app)
    .get("/api")
    .expect(401)
    .end((err, res) => {
      if (err) throw err;
      done();
    });
});

test("Health check returns 200", done => {
  request(app)
    .get("/z")
    .expect(200)
    .end((err, res) => {
      if (err) throw err;
      done();
    });
});
