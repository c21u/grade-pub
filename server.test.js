import request from "supertest";

import app from "./server.js";

test("/api routes should be protected", (done) => {
  request(app)
    .get("/api")
    .expect(401)
    .end((err, res) => {
      if (err) throw err;
      done();
    });
});

test("Health check returns 200", (done) => {
  request(app)
    .get("/z")
    .expect(200)
    .end((err, res) => {
      if (err) throw err;
      done();
    });
});
