import pMap from "p-map";
import { banner } from "../config.js";

const options = {
  method: "POST",
  headers: {
    "CANVAS-BANNER-AUTH": banner.token,
    "Content-Type": "application/json",
  },
};

const uploadGrade = (grade) => {
  return fetch(
    `${banner.url}/canvas_grade_entry/be/index.php/grade_entry/single_grade`,
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
    grades.map((grade) => {
      if (!validTerms.has(grade.term_code)) {
        throw new Error(
          "Grade submitted for a term not associated with this course.",
        );
      }
      if (!validTerms.has(grade.crn)) {
        throw new Error(
          "Grade submitted for a section not associated with this course.",
        );
      }
      // eslint-disable-next-line camelcase
      return { ...grade, instructor_username };
    }),
    uploadGrade,
    { concurrency: 5 },
  );
};
