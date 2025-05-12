import React from "react";
import PropTypes from "prop-types";
import { Responsive } from "@instructure/ui-responsive";
import SortedTable from "./SortedTable.js";

const GradesList = ({
  canvasGrades,
  bannerGrades,
  gradeMode,
  alwaysSendCurrentGrade,
}) => {
  if (canvasGrades === null) {
    return null;
  }
  const bannerGradesByID = bannerGrades
    ? bannerGrades.reduce((acc, cur) => {
        if (cur) {
          acc[`${cur.gtid}`] = cur;
        }
        return acc;
      }, {})
    : null;

  const rows = canvasGrades.map((grade) => ({
    ...grade,
    canvasGrade:
      alwaysSendCurrentGrade || gradeMode === "M"
        ? grade.currentGrade
        : grade.finalGrade,
    bannerGrade: bannerGradesByID
      ? bannerGradesByID[grade.gtID]
        ? bannerGradesByID[grade.gtID].success === true
          ? bannerGradesByID[grade.gtID].grade
          : "?"
        : "-"
      : null,
  }));

  return (
    <Responsive
      query={{
        small: { maxWidth: "40rem" },
        large: { minWidth: "41rem" },
      }}
      props={{
        small: { layout: "stacked" },
        large: { layout: "auto" },
      }}
      render={(p) => <SortedTable {...p} rows={rows} />}
    />
  );
};
GradesList.propTypes = {
  canvasGrades: PropTypes.array,
  bannerGrades: PropTypes.array,
  gradeMode: PropTypes.string,
  alwaysSendCurrentGrade: PropTypes.bool,
};

export default GradesList;
