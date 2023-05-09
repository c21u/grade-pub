const Canvas = require("canvas-lms-api");
const superagent = require("superagent");
const parseLinkHeader = require("parse-link-header");
const canvasToken = require("../config")["canvasToken"];

const handleErrors = err => {
  return err;
};

const tokenPlugin = req => {
  req.set("Authorization", `Bearer ${canvasToken}`);
};

const responseBodyAndLinks = res => {
  const linkHeader = res.header.link;
  const links = parseLinkHeader(linkHeader);
  return {
    body: res.body,
    links
  };
};

module.exports = {
  /**
   * Given a request object, return the Canvas API object or error
   * @param {Request} req request with context info set in user property
   * @return {Object} Canvas context
   */
  getCanvasContext: req => {
    const c = {};

    if (!req.user) throw new Error("Request has no user.");
    if (!req.user.custom_canvas_api_baseurl) {
      throw new Error("Request has no Canvas API base URL.");
    } else {
      c.baseURL = req.user.custom_canvas_api_baseurl;
    }
    if (!req.user.custom_canvas_course_id) {
      throw new Error("Request has no Canvas course ID.");
    } else {
      c.courseID = req.user.custom_canvas_course_id;
    }

    c.api = new Canvas(c.baseURL, { accessToken: canvasToken });
    c.rawReq = {
      get: url =>
        superagent
          .get(`${c.baseURL}/${url}`)
          .use(tokenPlugin)
          .then(handleErrors)
          .then(responseBodyAndLinks),
      post: (url, data) =>
        superagent
          .post(`${c.baseURL}/${url}`)
          .send(data)
          .use(tokenPlugin)
          .then(handleErrors)
          .then(responseBodyAndLinks)
    };
    return c;
  }
};
