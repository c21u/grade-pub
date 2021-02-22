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
const getGrademodes = function(students) {
  const keyBy = (arr, element) =>
    arr.reduce((acc, curr) => ({ ...acc, [curr[element]]: curr }), {});
  const studentsById = keyBy(
    students.map(student => ({
      ...student.user,
      section_id: student.sis_section_id
    })),
    "sis_user_id"
  );
  sisIdsChunks = chunk(
    students.map(student => `(gtgtid=${student.user.sis_user_id})`),
    20
  );
  return Promise.all(
    sisIdsChunks.map(sisIds =>
      buzzapi.post("central.iam.gted.people", "search", {
        filter: `(|${sisIds.join("")})`,
        requested_attributes: ["gtCourseInfoDetails1", "gtgtid"]
      })
    )
  )
    .then(responses => responses.reduce((acc, cur) => acc.concat(cur)))
    .then(responses => {
      return responses.map(response => {
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
    })
    .then(results => keyBy(results, "gtgtid"))
    .catch(err => {
      console.log(err);
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
    .then(async realStudents => {
      // ** override feature ** - checks if override_grade exists, and if so, sets final_grade and current_grade  equal to override_grade
      // if there is override grade, override value is equal to "Y" and if not, null
      const gradeModes = await getGrademodes(realStudents);
      return Promise.all(
        realStudents.map(async s => ({
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
          gradeMode: gradeModes[s.user.sis_user_id]
        }))
      );
    })
    .then(data => {
      res.send({ data });
    })
    .catch(err => {
      res.status(500).send(err);
      console.log(JSON.stringify(err));
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
