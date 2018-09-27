let express = require("express");
// eslint-disable-next-line new-cap
let router = express.Router();
let jwtMiddleware = require("../lib/jwt");
let Canvas = require("canvas-lms-api");
let canvasToken = require("../config")["canvas"]["token"];

router.use(jwtMiddleware);

router.get("/grades", (req, res, next) => {
  let canvas = new Canvas(req.user.custom_canvas_api_baseurl, {
    accessToken: canvasToken
  });

  canvas
    .get(`courses/${req.user.custom_canvas_course_id}/enrollments`)
    .then(users => {
      return users.filter(u => u.role === "StudentEnrollment");
    })
    .then(students => {
      return students.filter(s => s.user.sortable_name !== "Student, Test");
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
    .then(studentGrades => {
      res.send({ data: studentGrades });
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

module.exports = router;
