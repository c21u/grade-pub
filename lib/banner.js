import pMap from "p-map";
import logger from "./logger.js";
import { banner, alwaysSendCurrentGrade } from "../config.js";

const options = {
  method: "POST",
  headers: {
    "CANVAS-BANNER-AUTH": banner.token,
    "Content-Type": "application/json",
  },
};

const url = `${banner.url}/canvas_grade_entry/be/index.php/grade_entry`;

const handleBannerError = async (res) => {
  const bannerBody = await res.text();
  logger.error({bannerBody}, "Error from Banner API");
  return Promise.reject("Error from Bannner API");
}

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
  return result.clone().json().catch(() => handleBannerError(result));
};

export const uploadGrades = async (context, grades, grade_type) => {
  const {
    context: {
      custom: {
        lis_user_username: instructor_username,
        canvas_course_section_sis_source_ids: canvasSections,
      },
    },
  } = context;

  const validSections = canvasSections.split(",");

  return pMap(
    Object.values(
      grades
        .filter((gradeData) => gradeData.sisSectionID)
        .reduce((acc, gradeData) => {
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
            lastAttendanceDate: last_attend_date,
          } = gradeData;
          const term_code = gradeData.sisSectionID.slice(0, 6);
          const crn = gradeData.sisSectionID.slice(7);
          const grade =
            alwaysSendCurrentGrade || grade_type === "M"
              ? currentGrade
              : finalGrade;
          const gradeObj = {
            gtid,
            grade,

            ...(last_attend_date ? { last_attend_date } : null),
            grade_type,
          };
          acc[gradeData.sisSectionID]
            ? acc[gradeData.sisSectionID].grades.push(gradeObj)
            : (acc[gradeData.sisSectionID] = {
                instructor_username,
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
  return result.clone().json().catch(() => handleBannerError(result));
};

export const isGradingOpen = async (term) => {
  const result = await fetch(`${url}/grades_allowed?term=${term}`, {
    ...options,
    method: "GET",
  });
  return result.clone().json().catch(() => handleBannerError(result));
};
