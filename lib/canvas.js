const Canvas = require("canvas-lms-api");
const canvasToken = require("../config")["canvasToken"];

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
    return c;
  }
};
