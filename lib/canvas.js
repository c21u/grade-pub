import Canvas from "canvas-lms-api";
import parseLinkHeader from "parse-link-header";
import { canvasToken } from "../config.js";

const options = {
  headers: {
    Authorization: `Bearer ${canvasToken}`,
    "Content-Type": "application/json",
  },
};

export default {
  /**
   * Given a request object, return the Canvas API object or error
   * @param {Object} context LTI context
   * @return {Object} Canvas context
   */
  getCanvasContext: (context) => {
    const c = {};

    if (!context) throw new Error("Request has no user.");
    if (!context.context.launchPresentation?.return_url) {
      throw new Error("Request has no Canvas API base URL.");
    } else {
      c.baseURL = new URL(context.context.launchPresentation.return_url).origin;
    }
    if (!context.context.custom.canvas_course_id) {
      throw new Error("Request has no Canvas course ID.");
    } else {
      c.courseID = context.context.custom.canvas_course_id;
    }

    c.api = new Canvas(c.baseURL, { accessToken: canvasToken });
    c.rawReq = {
      get: async (url) => {
        const res = await fetch(`${c.baseURL}/${url}`, options);
        return res.json();
      },
      post: async (url, data) => {
        const res = await fetch(`${c.baseURL}/${url}`, {
          ...options,
          method: "POST",
          body: JSON.stringify(data),
        });
        return res.json();
      },
    };
    return c;
  },
};
