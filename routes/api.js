const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();
const jwtMiddleware = require("../lib/jwt");
const canvasAPI = require("../lib/canvas");

const BuzzApi = require("buzzapi");
const buzzappid = require("../config")["buzzAPI"].appID;
const buzzapipassword = require("../config")["buzzAPI"].password;
const buzzapi = new BuzzApi({
  apiUser: buzzappid,
  apiPassword: buzzapipassword
});
const logger = require("../lib/logger");

router.use(jwtMiddleware);

router.get("/test", (req, res) => {
  res.send({ message: "testing works!" });
});

/**
 * Turn an array into an array of arrays each with a maximum size
 *
 * @param {Array}       arr               The array to split into chunks
 * @param {int}         size              The size of the array chunks that should be returned
 * @return {Array}
 */
const chunk = function(arr, size) {
  const chunks = [];
  const n = arr.length;
  let i = 0;

  while (i < n) {
    chunks.push(arr.slice(i, (i += size)));
  }
  return chunks;
};

const getGrademodes = async students => {
  const keyBy = (arr, element) =>
    arr.reduce((acc, curr) => ({ ...acc, [curr[element]]: curr }), {});

  const studentsById = keyBy(
    students.map(student => ({
      ...student.user,
      section_id: student.section.sisId
    })),
    "sisId"
  );
  sisIdsChunks = chunk(
    students.map(student => `(gtgtid=${student.user.sisId})`),
    20
  );
  try {
    const responses = await Promise.all(
      sisIdsChunks.map(sisIds =>
        buzzapi.post("central.iam.gted.people", "search", {
          filter: `(|${sisIds.join("")})`,
          requested_attributes: ["gtCourseInfoDetails1", "gtgtid"]
        })
      )
    );
    const flatResponses = responses.reduce((acc, cur) => acc.concat(cur));
    const results = flatResponses.map(response => {
      const courseInfoDetails = response.gtCourseInfoDetails1;
      let gradeMode;
      if (courseInfoDetails) {
        for (let i = 0; i < courseInfoDetails.length; i++) {
          const courseInfoDetailsArray = courseInfoDetails[i].split("|");
          const sectionId = `${courseInfoDetailsArray[1]}/${
            courseInfoDetailsArray[2]
          }`;
          if (
            studentsById[response.gtgtid].section_id &&
            studentsById[response.gtgtid].section_id === sectionId
          ) {
            const modeCode = courseInfoDetailsArray.slice(-1).pop();
            const modeMap = {
              l: "Letter Grade",
              p: "Pass / Fail",
              a: "Audit"
            };
            gradeMode =
              courseInfoDetailsArray[3] == "instructor"
                ? "Not available"
                : modeMap[modeCode] || "Not available";
            break;
          }
        }
        return {
          gtgtid: response.gtgtid,
          gradeMode: gradeMode ? gradeMode : "Not available"
        };
      } else {
        return {
          gtgtid: response.gtgtid,
          gradeMode: "Not available"
        };
      }
    });
    return keyBy(results, "gtgtid");
  } catch (err) {
    logger.error(err);
  }
};

router.get("/grades", async (req, res) => {
  const canvas = canvasAPI.getCanvasContext(req);
  // getCanvasContext is imported from lib/canvas

  try {
    const query =
      "query ($courseId: ID) { course(id: $courseId) { enrollmentsConnection(filter: {types: StudentEnrollment}) { nodes { user { sisId sortableName } grades { overrideGrade currentGrade finalGrade unpostedCurrentGrade unpostedFinalGrade } section { sisId } } } } }";
    const variables = { courseId: canvas.courseID };
    const students = await canvas.rawReq.post("api/graphql", {
      query,
      variables
    });

    const realStudents = students.body.data.course.enrollmentsConnection.nodes.filter(
      s => s.user.sisId
    );
    // ** override feature ** - checks if override_grade exists, and if so, sets final_grade and current_grade equal to override_grade
    // if there is override grade, override value is equal to "Y" and if not, null
    const gradeModes = await getGrademodes(realStudents);
    const data = realStudents.map(s => ({
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
      course: req.user.custom_canvas_course_name,
      override: s.grades.overrideGrade ? "Y" : null,
      gradeMode: gradeModes[s.user.sisId]
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
        `accounts/self/grading_standards/${course.grading_standard_id}`
      );
    } catch (err) {
      gs = await canvas.api.get(
        `courses/${canvas.courseID}/grading_standards/${
          course.grading_standard_id
        }`
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

router.get("/sectionTitles", async (req, res) => {
  const canvas = canvasAPI.getCanvasContext(req);

  try {
    const sections = await canvas.api.get(
      `courses/${canvas.courseID}/sections`
    );
    return res.send(
      sections.reduce((result, section) => {
        result[section.sis_section_id] = section.name;
        return result;
      }, {})
    );
  } catch (err) {
    return res.status(500).send(err);
  }
});

module.exports = router;
