import express from "express";
// eslint-disable-next-line new-cap
const router = express.Router();
import jwtMiddleware from "../lib/jwt.js";
import canvasAPI from "../lib/canvas.js";
import logger from "../lib/logger.js";
import { uploadGrades, getGrades, isGradingOpen } from "../lib/banner.js";
import { getGrademodes } from "../lib/buzzapi.js";

router.use(jwtMiddleware);

router.get("/test", (req, res) => {
  res.send({ message: "testing works!" });
});

router.get("/grades", async (req, res) => {
  const canvas = canvasAPI.getCanvasContext(req);
  // getCanvasContext is imported from lib/canvas

  try {
    const query =
      "query ($courseId: ID) { course(id: $courseId) { enrollmentsConnection(filter: {types: StudentEnrollment}) { nodes { user { sisId sortableName } grades { overrideGrade currentGrade finalGrade unpostedCurrentGrade unpostedFinalGrade } section { sisId } } } } }";
    const variables = { courseId: canvas.courseID };
    const students = await canvas.rawReq.post("api/graphql", {
      query,
      variables,
    });

    const realStudents =
      students.body.data.course.enrollmentsConnection.nodes.filter(
        (s) => s.user.sisId,
      );
    // ** override feature ** - checks if override_grade exists, and if so, sets final_grade and current_grade equal to override_grade
    // if there is override grade, override value is equal to "Y" and if not, null
    const gradeModes = await getGrademodes(realStudents);
    const data = realStudents.map((s) => ({
      name: s.user.sortableName,
      currentGrade: s.grades.overrideGrade
        ? s.grades.overrideGrade
        : s.grades.currentGrade,
      finalGrade: s.grades.overrideGrade
        ? s.grades.overrideGrade
        : s.grades.finalGrade,
      unpostedFinalGrade: s.grades.unpostedFinalGrade,
      unpostedCurrentGrade: s.grades.unpostedCurrentGrade,
      sisSectionID: s.section.sisId,
      gtID: s.user.sisId,
      course: req.auth.custom_canvas_course_name,
      override: s.grades.overrideGrade ? "Y" : null,
      gradeMode: gradeModes[s.user.sisId].gradeMode,
    }));
    return res.send({ data });
  } catch (err) {
    logger.error(err);
    return res.status(500).send(err);
  }
});

router.get("/gradeScheme", async (req, res) => {
  const canvas = canvasAPI.getCanvasContext(req);

  try {
    const course = await canvas.api.get(`courses/${canvas.courseID}`);
    let gs = {};

    try {
      gs = await canvas.api.get(
        `accounts/self/grading_standards/${course.grading_standard_id}`,
      );
    } catch (err) {
      gs = await canvas.api.get(
        `courses/${canvas.courseID}/grading_standards/${course.grading_standard_id}`,
      );
    }
    // Override titles for historic grade modes
    if (gs.id === 40) {
      gs.title = "Final Grade";
    }
    if (gs.id === 56) {
      gs.title = "Midterm Grade";
    }
    return res.send(gs);
  } catch (err) {
    logger.error(err);
    return res.status(500).send(err);
  }
});

router.post("/gradeScheme", async (req, res) => {
  const canvas = canvasAPI.getCanvasContext(req);

  try {
    return res.send(
      await canvas.api.put(`courses/${canvas.courseID}`, null, {
        course: { grading_standard_id: parseInt(req.body.scheme, 10) },
      }),
    );
  } catch (err) {
    logger.error(err);
    return res.status(500).send(err);
  }
});

router.get("/sectionTitles", async (req, res) => {
  const canvas = canvasAPI.getCanvasContext(req);

  try {
    const sections = await canvas.api.get(
      `courses/${canvas.courseID}/sections`,
    );
    return res.send(
      sections.reduce((result, section) => {
        result[section.sis_section_id] = section.name;
        return result;
      }, {}),
    );
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.post("/publish", async (req, res) => {
  if (!req.auth || !req.auth.roles.includes("Instructor")) {
    return res
      .status(403)
      .send("You must be logged in as a course instructor to publish grades!");
  }
  logger.info({ user: req.auth }, "Requested publication of grades to banner");
  try {
    const result = await uploadGrades(req.auth, req.body);
    return res.send(result);
  } catch (err) {
    logger.error(err);
    return res.status(500).send("Error sending grades to Banner");
  }
});

router.get("/sheet", async (req, res) => {
  logger.info({ user: req.auth }, "User requested spreadsheet export");
  return res.send();
});

router.post("/bannerInitial", async (req, res) => {
  if (!req.auth || !req.auth.roles.includes("Instructor")) {
    return res
      .status(403)
      .send(
        "You must be logged in as a course instructor to get grades from Banner!",
      );
  }
  try {
    const result = await getGrades(req.body);
    return res.send(result);
  } catch (err) {
    logger.error(err);
    return res.status(500).send("Error fetching grades from Banner");
  }
});

router.get("/isGradingOpen", async (req, res) => {
  try {
    const result = await isGradingOpen(req.query.term);
    return res.send(result);
  } catch (err) {
    logger.error(err);
    return res.status(500).send("Error getting Banner grade period status");
  }
});

export default router;
