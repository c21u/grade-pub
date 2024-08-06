import React from "react";
import PropTypes from "prop-types";
import { Responsive } from "@instructure/ui-responsive";
import SortedTable from "./SortedTable.js";

const GradesList = (props) => {
  const bannerGradesByID = props.bannerGrades
    ? props.bannerGrades.reduce((acc, cur) => {
        acc[`${cur.gtid}`] = cur;
        return acc;
      }, {})
    : null;

  const rows = props.grades.map((grade) => ({
    ...grade,
    currentGrade: grade.gradeMode === "Audit" ? "V" : grade.currentGrade,
    bannerGrade: bannerGradesByID
      ? bannerGradesByID[grade.gtID]
        ? bannerGradesByID[grade.gtID].success
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
  grades: PropTypes.array,
  bannerGrades: PropTypes.array,
};

export default GradesList;
