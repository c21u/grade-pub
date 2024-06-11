import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { IconWarningSolid } from "@instructure/ui-icons";
import { View } from "@instructure/ui-view";
import { Spinner } from "@instructure/ui-spinner";
import spreadsheet from "../spreadsheet.js";
import BannerButton from "./BannerButton.js";
import Instructions from "./Instructions.js";
import GradesList from "./GradesList.js";

const GradePublisher = (props) => {
  const [dataReady, setDataReady] = useState(false);
  const [schemeUnset, setSchemeUnset] = useState(null);
  const [popOverOpen, setPopoverOpen] = useState(false);
  const [dataError, setDataError] = useState(false);
  const [grades, setGrades] = useState({});
  const [gradeScheme, setGradeScheme] = useState({});
  const [sectionTitles, setSectionTitles] = useState({});

  const { fetchOptions, filename } = props;

  /**
   * Fetch initial data
   */
  useEffect(() => {
    if (
      fetchOptions &&
      fetchOptions.headers &&
      fetchOptions.headers.Authorization
    ) {
      Promise.all([
        window.fetch("/api/grades", fetchOptions),
        window.fetch("/api/gradeScheme", fetchOptions),
        window.fetch("/api/sectionTitles", fetchOptions),
      ])
        .then(
          async ([
            gradeResponse,
            gradeSchemeResponse,
            sectionTitlesResponse,
          ]) => {
            try {
              checkResponseStatus(gradeResponse);
              setGrades(await gradeResponse.json());
              gradeSchemeResponse.status === 500
                ? setSchemeUnset(true)
                : setGradeScheme(await gradeSchemeResponse.json());
              checkResponseStatus(sectionTitlesResponse);
              setSectionTitles(await sectionTitlesResponse.json());
              setDataReady(true);
            } catch (err) {
              setDataError(true);
            }
          },
        )
        .catch(() => setDataError(true));
    }
  }, [fetchOptions]);

  /**
   * Export the spreadsheet
   * changed hasMuted to hasHidden (canvas updated wording from mute to hide)
   * @return {Promise}
   **/
  const sheetHandler = () => {
    let hasOverride;
    const gradeData = grades.data;
    const hasHidden = gradeData.reduce(
      (result, grade) =>
        result || grade.currentGrade !== grade.unpostedCurrentGrade,
      false,
    );
    // loops through grade data array of objects to see if any student has an overriden grade
    for (let i = 0; i < gradeData.length; i++) {
      if (gradeData[i].override == "Y") {
        hasOverride = true;
        break;
      }
    }
    // if gradebook has either an overriden grade or hidden grade, then it will alert user
    if (hasOverride || hasHidden) {
      alert(
        "You either have hidden, unposted, or overridden gradebook entries that will impact the Final Grade column in your export. This affects the grade of at least one student in your course.",
      );
    }

    return spreadsheet(gradeScheme.title, grades, sectionTitles, filename);
  };

  const handlePopOver = () => {
    setPopoverOpen(!popOverOpen);
  };

  const bannerHandler = () => {
    window.fetch("api/publish", {
      ...fetchOptions,
      headers: {
        ...fetchOptions.headers,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(grades.data),
    });
  };

  /**
   * @return {Object} Render the Gradepub component
   */
  return (
    <div>
      <View as="div" padding="large">
        <Instructions />
      </View>
      <View as="div" textAlign="center">
        <span style={{ display: schemeUnset ? "inline" : "none" }}>
          <IconWarningSolid color="warning" />
          You have not set a grading scheme for this course, please read the
          instructions above.
        </span>
      </View>
      <View as="div" textAlign="center">
        {dataError ? (
          <span>
            <IconWarningSolid color="error" /> There was a problem loading the
            grade data for this course, please refresh the page to try again. If
            the issue persists please contact{" "}
            <a href="mailto:canvas@gatech.edu">canvas@gatech.edu</a>.
          </span>
        ) : (
          <>
            <BannerButton
              clickHandler={bannerHandler}
              dataReady={dataReady && !schemeUnset}
            />
            {dataReady ? <GradesList grades={grades.data} /> : ""}
          </>
        )}
        {dataReady || schemeUnset || dataError ? (
          ""
        ) : (
          <View as="div">
            <Spinner renderTitle="Loading" size="x-small" margin="small" />
          </View>
        )}
      </View>
    </div>
  );
};
GradePublisher.propTypes = {
  fetchOptions: PropTypes.object,
  filename: PropTypes.string,
};

/**
 * Check for 200 OK status from response
 * @param {Object} response
 * @return {(Object|error)}
 */
const checkResponseStatus = (response) => {
  if (response.status === 200) {
    return response;
  } else {
    const err = new Error(response.statusText);
    err.response = response;
    throw err;
  }
};

export default GradePublisher;
