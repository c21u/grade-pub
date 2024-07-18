import React from "react";
import propTypes from "prop-types";
import { Button } from "@instructure/ui-buttons";
import { Text } from "@instructure/ui-text";

const GradeSchemeSelect = (props) => {
  const schemeMap = {
    1235: "Final",
    1237: "Midterm",
    Final: "1235",
    Midterm: "1237",
  };

  const setGradingScheme = async (scheme) => {
    props.clickHandler(schemeMap[scheme]);
  };

  return props.schemeUnset || !schemeMap[props.gradeScheme.id] ? (
    <>
      <Text as="div">
        This course currently has no grading scheme or is using a custom grading
        scheme.
      </Text>
      <Button margin="medium" onClick={() => setGradingScheme("Midterm")}>
        Use Midterm Grading Scheme
      </Button>
      <Button margin="medium" onClick={() => setGradingScheme("Final")}>
        Use Final Grading Scheme
      </Button>
    </>
  ) : (
    <>
      <Text as="div">
        This course is currently using the {schemeMap[props.gradeScheme.id]}{" "}
        Grading Scheme
      </Text>
      <Button
        margin="medium"
        onClick={() =>
          setGradingScheme(
            schemeMap[props.gradeScheme.id] === "Final" ? "Midterm" : "Final",
          )
        }
      >
        Switch to{" "}
        {schemeMap[props.gradeScheme.id] === "Final" ? "Midterm" : "Final"}{" "}
        Grading Scheme
      </Button>
    </>
  );
};
GradeSchemeSelect.propTypes = {
  schemeUnset: propTypes.bool,
  gradeScheme: propTypes.object,
  clickHandler: propTypes.func,
};

export default GradeSchemeSelect;
