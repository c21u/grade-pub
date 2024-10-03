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

const url = `${banner.url}/canvas_grade_entry/be/index.php/grade_entry`;

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
  const result = await fetch(`${url}/bulk_grade`, {
    ...options,
    body: JSON.stringify(grades),
  });
  return result.json();
};

// eslint-disable-next-line camelcase
export const uploadGrades = async (user, grades, grade_type) => {
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
        const {
          gtID: gtid,
          currentGrade,
          finalGrade,
          // eslint-disable-next-line camelcase
          lastAttendanceDate: last_attend_date,
        } = gradeData;
        // eslint-disable-next-line camelcase
        const term_code = gradeData.sisSectionID.slice(0, 6);
        const crn = gradeData.sisSectionID.slice(7);
        // eslint-disable-next-line camelcase
        const grade = grade_type === "M" ? currentGrade : finalGrade;
        const gradeObj = {
          gtid,
          grade,

          // eslint-disable-next-line camelcase
          ...(last_attend_date ? { last_attend_date } : null),
          // eslint-disable-next-line camelcase
          grade_type,
        };
        acc[gradeData.sisSectionID]
          ? acc[gradeData.sisSectionID].grades.push(gradeObj)
          : (acc[gradeData.sisSectionID] = {
              // eslint-disable-next-line camelcase
              instructor_username,
              // eslint-disable-next-line camelcase
              term_code,
              crn,
              grades: [gradeObj],
            });
        return acc;
      }, {}),
    ),
    bulkUploadGrades,
    { concurrency: 5 },
  );
};

export const getGrades = async (users) => {
  logger.debug({ users });
  const result = await fetch(`${url}/get_enrollments_data`, {
    ...options,
    body: JSON.stringify(users),
  });
  return result.json();
};

export const isGradingOpen = async (term) => {
  const result = await fetch(`${url}/grades_allowed?term=${term}`, {
    ...options,
    method: "GET",
  });
  return result.json();
};
