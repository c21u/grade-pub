const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();
const jwtMiddleware = require("../lib/jwt");
const canvasAPI = require("../lib/canvas");

router.use(jwtMiddleware);

router.get("/grades", (req, res, next) => {
  const canvas = canvasAPI.getCanvasContext(req);

  canvas.api
    .get(`courses/${canvas.courseID}/enrollments`, {
      role: ["StudentEnrollment"]
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
