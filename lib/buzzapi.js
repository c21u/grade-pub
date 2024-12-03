import BuzzApi from "buzzapi";
import logger from "./logger.js";
import { chunk } from "./util.js";
import { buzzAPI as buzzConf } from "../config.js";

const buzzapi = new BuzzApi(buzzConf);

export const getGrademodes = async (students) => {
  const keyBy = (arr, element) =>
    arr.reduce((acc, curr) => ({ ...acc, [curr[element]]: curr }), {});

  const studentsById = keyBy(
    students.map((student) => ({
      ...student.user,
      section_id: student.section.sisId,
    })),
    "sisId",
  );
  const sisIdsChunks = chunk(
    students.map((student) => `(gtgtid=${student.user.sisId})`),
    20,
  );
  const responses = await Promise.all(
    sisIdsChunks.map((sisIds) =>
      buzzapi.post("central.iam.gted.people", "search", {
        filter: `(|${sisIds.join("")})`,
        requested_attributes: ["gtCourseInfoDetails1", "gtgtid"],
      }),
    ),
  );
  const flatResponses = responses.reduce((acc, cur) => acc.concat(cur), []);
  const results = flatResponses.map((response) => {
    const courseInfoDetails = response.gtCourseInfoDetails1;
    let gradeMode;
    if (courseInfoDetails) {
      for (let i = 0; i < courseInfoDetails.length; i++) {
        const courseInfoDetailsArray = courseInfoDetails[i].split("|");
        const sectionId = `${courseInfoDetailsArray[1]}/${courseInfoDetailsArray[2]}`;
        if (
          studentsById[response.gtgtid].section_id &&
          studentsById[response.gtgtid].section_id === sectionId
        ) {
          const modeCode = courseInfoDetailsArray.slice(-1).pop();
          const modeMap = {
            l: "Letter Grade",
            p: "Pass / Fail",
            a: "Audit",
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
        gradeMode: gradeMode ? gradeMode : "Not available",
      };
    } else {
      return {
        gtgtid: response.gtgtid,
        gradeMode: "Not available",
      };
    }
  });
  return keyBy(results, "gtgtid");
};
