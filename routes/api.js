const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();
const jwtMiddleware = require("../lib/jwt");
const canvasAPI = require("../lib/canvas");
const logger = require("../lib/logger");

router.use(jwtMiddleware);

router.get("/grades", (req, res, next) => {
  const canvas = canvasAPI.getCanvasContext(req);

  canvas.api
    .get(`courses/${canvas.courseID}/enrollments`, {
      role: ["StudentEnrollment"]
    })
    .then(students => {
      return students.filter(s => s.sis_user_id);
    })
    .then(realStudents => {
      return realStudents.map(s => ({
        name: s.user.sortable_name,
        currentGrade: s.grades.current_grade,
        finalGrade: s.grades.final_grade,
        sisSectionID: s.sis_section_id,
        gtID: s.user.sis_user_id,
        course: req.user.custom_canvas_course_name
      }));
    })
    .then(data => {
      res.send({ data });
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

router.get("/gradeScheme", (req, res, next) => {
  const canvas = canvasAPI.getCanvasContext(req);

  canvas.api
    .get(`courses/${canvas.courseID}`)
    .then(course =>
      canvas.api
        .get(`accounts/self/grading_standards/${course.grading_standard_id}`)
        .catch(err =>
          canvas.api.get(
            `courses/${canvas.courseID}/grading_standards/${
              course.grading_standard_id
            }`
          )
        )
    )
    .then(gs => {
      // Override titles for historic grade modes
      if (gs.id === 40) {
        gs.title = "Final Grade";
      }
      if (gs.id === 56) {
        gs.title = "Midterm Grade";
      }
      return gs;
    })
    .then(gs => res.send(gs))
    .catch(err => {
      res.status(500).send(err);
    });
});

module.exports = router;
