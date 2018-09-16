const request = require("supertest");

const app = require("./server");
const fakeAuth = require("./config")["fakeStrategyCredentials"];

test("Can POST to be authenticated", () => {
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
    });
});

test("Should not authenticate with bad credentials", () => {
  request(app)
    .post("/")
    .send(`username=incorrect`)
    .send(`password=password`)
    .expect(401)
    .end((err, res) => {
      if (err) throw err;
    });
});

test("GET / should be protected", () => {
  request(app)
    .get("/")
    .expect(401)
    .end((err, res) => {
      if (err) throw err;
    });
});

test("/api routes should be protected", () => {
  request(app)
    .get("/api")
    .expect(401)
    .end((err, res) => {
      if (err) throw err;
    });
});

test("Health check returns 200", () => {
  request(app)
    .get("/z")
    .expect(200)
    .end((err, res) => {
      if (err) throw err;
    });
});
