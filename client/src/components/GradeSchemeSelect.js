import React from "react";
import propTypes from "prop-types";
import { Button } from "@instructure/ui-buttons";
import { Alert } from "@instructure/ui-alerts";

export const schemeMap = {
  1235: "Final",
  1237: "Midterm",
  Final: "1235",
  Midterm: "1237",
};

const GradeSchemeSelect = ({
  schemeUnset,
  gradeScheme,
  clickHandler,
  gradingOpen,
}) => {
  const setGradingScheme = async (scheme) => {
    clickHandler(schemeMap[scheme]);
  };
  if (!gradingOpen) {
    return null;
  }
  return schemeUnset || !schemeMap[gradeScheme.id] ? (
    <>
      <Alert variant="warning">
        This course currently has no grading scheme or is using a custom grading
        scheme.
      </Alert>
      <Button margin="medium" onClick={() => setGradingScheme("Midterm")}>
        Use Midterm Grading Scheme
      </Button>
      <Button margin="medium" onClick={() => setGradingScheme("Final")}>
        Use Final Grading Scheme
      </Button>
    </>
  ) : (
    <>
      {(gradingOpen.final && gradeScheme.id == schemeMap.Final) ||
      (gradingOpen.midterm && gradeScheme.id == schemeMap.Midterm) ? (
        <Alert variant="success">
          This course is currently using the {schemeMap[gradeScheme.id]} Grading
          Scheme
        </Alert>
      ) : (
        <Alert variant="warning">
          This course is currently using the {schemeMap[gradeScheme.id]} Grading
          Scheme, which does not match the Banner grading period.
        </Alert>
      )}
      <Button
        margin="medium"
        onClick={() =>
          setGradingScheme(
            schemeMap[gradeScheme.id] === "Final" ? "Midterm" : "Final",
          )
        }
      >
        Switch to {schemeMap[gradeScheme.id] === "Final" ? "Midterm" : "Final"}{" "}
        Grading Scheme
      </Button>
    </>
  );
};
GradeSchemeSelect.propTypes = {
  schemeUnset: propTypes.bool,
  gradeScheme: propTypes.object,
  clickHandler: propTypes.func,
  gradingOpen: propTypes.object,
};

export default GradeSchemeSelect;
