const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();
const jwtMiddleware = require("../lib/jwt");
const canvasAPI = require("../lib/canvas");

router.use(jwtMiddleware);

router.get("/test", (req, res) => {
  res.send({ message: "testing works!" });
});

router.get("/grades", (req, res, next) => {
  const canvas = canvasAPI.getCanvasContext(req);
  // getCanvasContext is imported from lib/canvas

  canvas.api
    .get(`courses/${canvas.courseID}/enrollments`, {
      role: ["StudentEnrollment"]
    }) // api call to canvas api, using canvas api documentation under enrollments
    .then(students => {
      return students.filter(s => s.sis_user_id);
    }) // promise statement returns students
    .then(realStudents => {
      // ** override feature ** - checks if override_grade exists, and if so, sets final_grade and current_grade  equal to override_grade
      // if there is override grade, override value is equal to "Y" and if not, null
      return realStudents.map(s => ({
        name: s.user.sortable_name,
        currentGrade: s.grades.override_grade
          ? s.grades.override_grade
          : s.grades.current_grade,
        finalGrade: s.grades.override_grade
          ? s.grades.override_grade
          : s.grades.final_grade,
        unpostedFinalGrade: s.grades.unposted_final_grade,
        unpostedCurrentGrade: s.grades.unposted_current_grade,
        sisSectionID: s.sis_section_id,
        gtID: s.user.sis_user_id,
        course: req.user.custom_canvas_course_name,
        override: s.grades.override_grade ? "Y" : null
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

router.get("/sectionTitles", (req, res, next) => {
  const canvas = canvasAPI.getCanvasContext(req);

  canvas.api
    .get(`courses/${canvas.courseID}/sections`)
    .then(sections => {
      sections = sections.reduce((result, section) => {
        result[section.sis_section_id] = section.name;
        return result;
      }, {});
      return res.send(sections);
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

module.exports = router;
