import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { IconWarningSolid } from "@instructure/ui-icons";
import { View } from "@instructure/ui-view";
import { Spinner } from "@instructure/ui-spinner";
import { Text } from "@instructure/ui-text";
import BannerButton from "./BannerButton.js";
import GradesList from "./GradesList.js";
import GradeSchemeSelect from "./GradeSchemeSelect.js";

const GradePublisher = (props) => {
  const [schemeUnset, setSchemeUnset] = useState(null);
  // const [popOverOpen, setPopoverOpen] = useState(false);
  const [dataError, setDataError] = useState(false);
  const [grades, setGrades] = useState(null);
  const [gradeScheme, setGradeScheme] = useState({});
  // const [sectionTitles, setSectionTitles] = useState({});
  const [exportRunning, setExportRunning] = useState(false);
  const [exportError, setExportError] = useState(false);
  const [bannerGrades, setBannerGrades] = useState([]);
  const [overrideWarningShown, setOverrideWarningShown] = useState(false);

  const { fetchOptions /* , filename */ } = props;

  /**
   * Fetch initial data
   */
  useEffect(() => {
    if (
      fetchOptions &&
      fetchOptions.headers &&
      fetchOptions.headers.Authorization
    ) {
      window
        .fetch("/api/sectionTitles", fetchOptions)
        .then(async (sectionTitlesResponse) => {
          try {
            checkResponseStatus(sectionTitlesResponse);
            // setSectionTitles(await sectionTitlesResponse.json());
          } catch (err) {
            setDataError(true);
          }
        })
        .catch(() => setDataError(true));
    }
  }, [fetchOptions]);

  useEffect(() => {
    if (
      fetchOptions &&
      fetchOptions.headers &&
      fetchOptions.headers.Authorization &&
      gradeScheme
    ) {
      window
        .fetch("/api/grades", fetchOptions)
        .then(async (gradeResponse) => {
          try {
            checkResponseStatus(gradeResponse);
            setGrades(await gradeResponse.json());
          } catch (err) {
            setDataError(true);
          }
        })
        .catch(() => setDataError(true));
    }
  }, [fetchOptions, gradeScheme]);

  useEffect(() => {
    if (
      fetchOptions &&
      fetchOptions.headers &&
      fetchOptions.headers.Authorization &&
      schemeUnset === null
    ) {
      window
        .fetch("/api/gradeScheme", fetchOptions)
        .then(async (gradeSchemeResponse) => {
          try {
            gradeSchemeResponse.status === 500
              ? setSchemeUnset(true)
              : setGradeScheme(await gradeSchemeResponse.json()),
              setSchemeUnset(false);
          } catch (err) {
            setDataError(true);
          }
        })
        .catch(() => setDataError(true));
    }
  }, [fetchOptions, schemeUnset]);

  useEffect(() => {
    setExportError(bannerGrades.filter((grade) => !grade.success).length > 0);
  }, [bannerGrades]);

  useEffect(() => {
    let hasOverride;
    if (grades && grades.data && !overrideWarningShown) {
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
      setOverrideWarningShown(true);
    }
  }, [grades, overrideWarningShown]);

  /**
   * Export the spreadsheet
   * @return {Promise}
   **/
  /*
    const sheetHandler = () =>
    spreadsheet(gradeScheme.title, grades, sectionTitles, filename);

    const handlePopOver = () => setPopoverOpen(!popOverOpen);
  */

  const bannerHandler = async () => {
    setExportRunning(true);
    const bannerResult = await window.fetch("api/publish", {
      ...fetchOptions,
      headers: {
        ...fetchOptions.headers,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(grades.data),
    });
    setExportRunning(false);
    setBannerGrades(
      (await bannerResult.json())
        .map((section) => section.students_grades)
        .flat(),
    );
  };

  const handleGradeSchemeSelected = async (scheme) => {
    await window.fetch("/api/gradeScheme", {
      ...fetchOptions,
      method: "POST",
      body: JSON.stringify({ scheme }),
    });
    setGrades({
      ...grades,
      data: grades.data.map((datum) => ({ ...datum, currentGrade: null })),
    });
    setSchemeUnset(null);
  };

  const LargeClassWarning = (props) => {
    if (grades !== null && grades.data.length > 999) {
      return (
        <Text as="div">
          <IconWarningSolid color="warning" /> Exporting grades on large courses
          may take up to a minute.
        </Text>
      );
    }
  };

  /**
   * @return {Object} Render the Gradepub component
   */
  return (
    <div>
      <View as="div" padding="large">
        {schemeUnset !== null ? (
          <GradeSchemeSelect
            gradeScheme={gradeScheme}
            schemeUnset={schemeUnset}
            clickHandler={handleGradeSchemeSelected}
          />
        ) : (
          <Spinner size="x-small" margin="small" />
        )}
        <hr />
      </View>
      <View as="div" textAlign="center">
        {schemeUnset ? (
          <Text>
            <IconWarningSolid color="warning" />
            You have not set a grading scheme for this course, select one above
            to procede.
          </Text>
        ) : null}
      </View>
      <View as="div" textAlign="center">
        {exportError ? (
          <Text as="div">
            <IconWarningSolid color="error" /> There was a problem sending some
            grades to Banner. If the issue persists please contact{" "}
            <a href="mailto:canvas@gatech.edu">canvas@gatech.edu</a>.
          </Text>
        ) : null}
        {dataError ? (
          <Text>
            <IconWarningSolid color="error" /> There was a problem loading the
            grade data for this course, please refresh the page to try again. If
            the issue persists please contact{" "}
            <a href="mailto:canvas@gatech.edu">canvas@gatech.edu</a>.
          </Text>
        ) : (
          <>
            <BannerButton
              clickHandler={bannerHandler}
              dataReady={
                grades && grades.data[0].currentGrade !== null && !schemeUnset
              }
              exportRunning={exportRunning}
            />
            <LargeClassWarning />
            {grades ? (
              <GradesList grades={grades.data} bannerGrades={bannerGrades} />
            ) : null}
          </>
        )}
        {grades || schemeUnset || dataError ? (
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
