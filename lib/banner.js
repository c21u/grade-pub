import pMap from "p-map";
import { banner } from "../config.js";

const options = {
  method: "POST",
  headers: {
    "CANVAS-BANNER-AUTH": banner.token,
    "Content-Type": "application/json",
  },
};

/* The bulk_grade endpoint takes grades for a single crn in this format:
  {
    termcode: "202402",
    crn: "35364",
    instructor_username: "dsantos36",
    grades: [
      {gtid: "901833061", grade":"A"}
    ]
  }
*/
const bulkUploadGrades = (grade) => {
  return fetch(
    `${banner.url}/canvas_grade_entry/be/index.php/grade_entry/bulk_grade`,
    { ...options, body: JSON.stringify(grade) },
  );
};

export const uploadGrades = (user, grades) => {
  const {
    // eslint-disable-next-line camelcase
    custom_lis_user_username: instructor_username,
    canvas_course_section_sis_source_ids: canvasSections,
  } = user;

  const validTerms = new Set();
  const validCRNs = new Set();

  canvasSections.forEach((sectionId) => {
    const [term, crn] = sectionId.split("/");
    validTerms.add(term);
    validCRNs.add(crn);
  });

  return pMap(
    Object.values(
      grades.reduce((acc, gradeData) => {
        if (!validTerms.has(gradeData.term_code)) {
          throw new Error(
            "Grade submitted for a term not associated with this course.",
          );
        }
        if (!validTerms.has(gradeData.crn)) {
          throw new Error(
            "Grade submitted for a section not associated with this course.",
          );
        }
        const {
          gtID: gtid,
          currentGrade: grade,
          // eslint-disable-next-line camelcase
          termCode: term_code,
          crn,
        } = gradeData;
        acc[grade.term_code]
          ? acc[grade.term_code].grades.push({ gtid, grade })
          : (acc[grade.term_code] = {
              // eslint-disable-next-line camelcase
              instructor_username,
              // eslint-disable-next-line camelcase
              term_code,
              crn,
              grades: [{ gtid, grade }],
            });
        return acc;
      }, {}),
    ),
    bulkUploadGrades,
    { concurrency: 5 },
  );
};
