const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();
const jwtMiddleware = require("../lib/jwt");
const canvasAPI = require("../lib/canvas");

const BuzzApi = require('buzzapi');
const buzzappid = require("../config")["buzzAPI"].appID;
const buzzapipassword = require("../config")["buzzAPI"].password;
const buzzapi = new BuzzApi({'apiUser': buzzappid, 'apiPassword': buzzapipassword});

router.use(jwtMiddleware);

router.get("/test", (req, res) => {
  res.send({ message: "testing works!" });
});

const getGradeMode = (sisId, sectionId) => {
  return buzzapi.post("central.iam.gted.people", "search", {
    filter: `(gtgtid=${sisId})`,
    requested_attributes: ["gtCourseInfoDetails1"]
  }).then(response => {
    // console.log(response[0].gtCourseInfoDetails1);
    const courseInfoDetails = response[0].gtCourseInfoDetails1;
    let gradeMode;
    if (courseInfoDetails) {
     for (let i = 0; i < courseInfoDetails.length; i ++) {
       const courseInfoDetailsArray = courseInfoDetails[i].split("|");
       if (sectionId.includes(courseInfoDetailsArray[1]) && sectionId.includes(courseInfoDetailsArray[2])) {
         const modeCode = courseInfoDetailsArray.slice(-1).pop();
         if (modeCode == "l") {
           gradeMode = "Letter Grade";
         }
         if (modeCode == "p") {
           gradeMode = "Pass / Fail";
         }
         if (modeCode == "a") {
           gradeMode = "Audit";
         }
         if (courseInfoDetailsArray[3] == "instructor") {
           gradeMode = "Not available";
         }
         break;
       }
     }
     return gradeMode || "Not available";
   } else {
     return "Not available"
   }
  }).catch(err => {
    console.log(err);
    return "Not available"
  });
};

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
        override: s.grades.override_grade ? "Y" : null,
        gradeMode: getGradeMode(s.user.sis_user_id, s.sis_section_id)
      }));
    })
    .then(data => {
      console.log(data);
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
