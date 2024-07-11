import pMap from "p-map";
import logger from "./logger.js";
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
const bulkUploadGrades = async (grades) => {
  logger.debug({ grades });
  const result = await fetch(
    `${banner.url}/canvas_grade_entry/be/index.php/grade_entry/bulk_grade`,
    { ...options, body: JSON.stringify(grades) },
  );
  return result.json();
};

export const uploadGrades = (user, grades) => {
  const {
    // eslint-disable-next-line camelcase
    custom_lis_user_username: instructor_username,
    custom_canvas_course_section_sis_source_ids: canvasSections,
  } = user;

  const validSections = canvasSections.split(",");

  return pMap(
    Object.values(
      grades.reduce((acc, gradeData) => {
        logger.debug({ gradeData });
        if (!validSections.includes(gradeData.sisSectionID)) {
          const sectionError =
            "Grade Submitted for a section not associated with this course";
          logger.error(
            { validSections, sectionId: gradeData.sisSectionID },
            sectionError,
          );
          throw new Error(sectionError);
        }
        const { gtID: gtid, currentGrade: grade } = gradeData;
        // eslint-disable-next-line camelcase
        const term_code = gradeData.sisSectionID.slice(0, 6);
        const crn = gradeData.sisSectionID.slice(7);
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
