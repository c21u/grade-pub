import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { View } from "@instructure/ui-view";
import { Spinner } from "@instructure/ui-spinner";
import { Text } from "@instructure/ui-text";
import { useBeforeunload } from "react-beforeunload";
import spreadsheet from "../spreadsheet.js";
import BannerButton from "./BannerButton.js";
import SheetButton from "./SheetButton.js";
import GradesList from "./GradesList.js";
import GradeSchemeSelect, { schemeMap } from "./GradeSchemeSelect.js";
import Instructions from "./Instructions.js";
import PublisherErrors from "./PublisherErrors.js";
import AttendanceModal from "./AttendanceModal.js";
import { Button } from "@instructure/ui-buttons";
import { Alert } from "@instructure/ui-alerts";

const GradePublisher = (props) => {
  const [schemeUnset, setSchemeUnset] = useState(null);
  const [dataError, setDataError] = useState(false);
  const [canvasGrades, setCanvasGrades] = useState(null);
  const [gradeScheme, setGradeScheme] = useState({});
  const [sectionTitles, setSectionTitles] = useState({});
  const [exportRunning, setExportRunning] = useState(false);
  const [exportError, setExportError] = useState(false);
  const [bannerGrades, setBannerGrades] = useState([]);
  const [published, setPublished] = useState(false);
  const [bannerInitial, setBannerInitial] = useState(false);
  const [gradingOpen, setGradingOpen] = useState(null);
  const [gradeMode, setGradeMode] = useState(null);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [hasOverride, setHasOverride] = useState(false);

  const { fetchOptions, filename, term } = props;

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
            setSectionTitles(await sectionTitlesResponse.json());
          } catch (err) {
            setDataError(true);
          }
        })
        .catch(() => setDataError(true));
    }
  }, [fetchOptions]);

  /**
   * Fetch grades from Canvas
   */
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
            setCanvasGrades((await gradeResponse.json()).data);
          } catch (err) {
            setDataError(true);
          }
        })
        .catch(() => setDataError(true));
    }
  }, [fetchOptions, gradeScheme]);

  /**
   * Fetch grade scheme from Canvas
   */
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
            if (gradeSchemeResponse.status === 500) {
              setSchemeUnset(true);
            } else {
              const gs = await gradeSchemeResponse.json();
              setGradeScheme(gs);
              setSchemeUnset(false);
              setGradeMode(gs.id.toString() === schemeMap.Midterm ? "M" : "F");
            }
          } catch (err) {
            setDataError(true);
          }
        })
        .catch(() => setDataError(true));
    }
  }, [fetchOptions, schemeUnset]);

  /**
   * Check results of Banner publish for Errors
   */
  useEffect(() => {
    bannerGrades
      ? setExportError(
          bannerGrades.filter((grade) => !grade.success).length > 0,
        )
      : null;
  }, [bannerGrades]);

  /**
   * Check for Overridden grades
   */
  useEffect(() => {
    if (canvasGrades && !hasOverride) {
      // loops through grade data array of objects to see if any student has an overriden grade
      for (let i = 0; i < canvasGrades.length; i++) {
        if (canvasGrades[i].override == "Y") {
          setHasOverride(true);
          break;
        }
      }
    }
    if (canvasGrades && !bannerInitial) {
      try {
        setBannerInitial({});
        setBannerGrades(null);
        window
          .fetch("/api/bannerInitial", {
            ...fetchOptions,
            method: "POST",
            body: JSON.stringify({
              enrollments: canvasGrades.map(({ sisSectionID, gtID }) => {
                const crn = sisSectionID.slice(7);
                const termCode = sisSectionID.slice(0, 6);
                return { crn, term_code: termCode, gtid: gtID };
              }),
            }),
          })
          .then(async (result) => {
            const initial = await result.json();
            setBannerInitial(initial);
            setBannerGrades(
              initial.map((grade) => {
                return {
                  success: true,
                  gtid: grade.gtid,
                  grade: grade.grade_code,
                };
              }),
            );
          })
          .catch(() => {
            setBannerInitial({});
            setBannerGrades([]);
          });
      } catch (err) {
        setBannerInitial({});
        setBannerGrades([]);
      }
    }
  }, [canvasGrades, hasOverride, bannerInitial, fetchOptions]);

  useEffect(() => {
    if (
      fetchOptions &&
      fetchOptions.headers &&
      fetchOptions.headers.Authorization &&
      gradingOpen === null &&
      term
    ) {
      window
        .fetch(`/api/isGradingOpen?term=${term}`, fetchOptions)
        .then(async (isGradingOpen) => {
          isGradingOpen = await isGradingOpen.json();
          setGradingOpen(
            isGradingOpen.success &&
              isGradingOpen.payload.grades_allowed == "open",
          );
        })
        .catch((err) => setDataError(true));
    }
  }, [fetchOptions, gradingOpen, term]);

  useBeforeunload(
    exportRunning
      ? () =>
          "The data export to Banner is still in progress, please stay on the page until it is complete."
      : null,
  );

  /**
   * Export the spreadsheet
   * @return {Promise}
   **/
  const sheetHandler = async () => {
    await window.fetch("/api/sheet", fetchOptions);
    spreadsheet(
      gradeScheme.title,
      canvasGrades,
      sectionTitles,
      gradeMode,
      filename,
    );
  };

  const bannerHandler = async () => {
    setExportRunning(true);
    setBannerGrades(null);
    try {
      const bannerResult = await window.fetch("api/publish", {
        ...fetchOptions,
        headers: {
          ...fetchOptions.headers,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ grades: canvasGrades, mode: gradeMode }),
      });
      setExportRunning(false);
      setBannerGrades(
        (await bannerResult.json())
          .map((section) => section.students_grades)
          .flat(),
      );
      setPublished(true);
    } catch (err) {
      setBannerGrades(
        canvasGrades.map((grade) => ({ success: false, gtid: grade.gtID })),
      );
      setExportRunning(false);
    }
  };

  const handleGradeSchemeSelected = async (scheme) => {
    await window.fetch("/api/gradeScheme", {
      ...fetchOptions,
      method: "POST",
      body: JSON.stringify({ scheme }),
    });
    setCanvasGrades(
      canvasGrades.map((datum) => ({
        ...datum,
        currentGrade: "loading",
        finalGrade: "loading",
      })),
    );
    setSchemeUnset(null);
  };

  const updateAttendanceDates = (dates) => {
    setAttendanceModalOpen(false);
    const updatedCanvasGrades = canvasGrades.map((grade) => {
      if (needsAttendanceDate(grade)) {
        grade.lastAttendanceDate = dates[grade.gtID];
      } else {
        delete grade.lastAttendanceDate;
      }
      return grade;
    });
    setCanvasGrades(updatedCanvasGrades);
  };

  const needsAttendanceDate = (student) =>
    ["F", "I"].includes(student.finalGrade);

  const needsAttendanceDates = (strict) => {
    if (canvasGrades) {
      return (
        canvasGrades.filter(
          (grade) =>
            needsAttendanceDate(grade) &&
            (!strict || !grade.lastAttendanceDate),
        ).length !== 0
      );
    }
    return false;
  };

  const LargeClassWarning = (props) => {
    if (canvasGrades !== null && canvasGrades.length > 999) {
      return (
        <Alert variant="warning">
          Exporting grades on large courses may take up to a minute.
        </Alert>
      );
    }
  };

  return (
    <div>
      <Instructions />
      <Text>
        An Excel file export of these grades for use with FGE is available:{" "}
        <SheetButton
          clickHandler={sheetHandler}
          dataReady={
            canvasGrades &&
            canvasGrades[0] &&
            canvasGrades[0].currentGrade !== null &&
            !schemeUnset
          }
        />
      </Text>
      <View as="div" padding="large">
        {schemeUnset !== null ? (
          <GradeSchemeSelect
            gradeScheme={gradeScheme}
            schemeUnset={schemeUnset}
            clickHandler={handleGradeSchemeSelected}
          />
        ) : (
          <Spinner
            renderTitle="Loading grade scheme"
            size="x-small"
            margin="small"
          />
        )}
        <hr />
      </View>
      {hasOverride ? (
        <Alert variant="warning">
          You either have hidden, unposted, or overridden gradebook entries that
          will impact the Final Grade column in your export. This affects the
          grade of at least one student in your course.
        </Alert>
      ) : null}

      <View as="div" textAlign="center">
        {schemeUnset ? (
          <Alert variant="warning">
            You have not set a grading scheme for this course, select one above
            to procede.
          </Alert>
        ) : null}
      </View>
      {canvasGrades ? (
        <AttendanceModal
          open={attendanceModalOpen}
          students={canvasGrades.filter((student) =>
            needsAttendanceDate(student),
          )}
          onDismiss={() => setAttendanceModalOpen(false)}
          onSubmit={updateAttendanceDates}
        />
      ) : null}
      <View as="div" textAlign="center">
        <PublisherErrors exportError={exportError} dataError={dataError} />
        {gradingOpen && !dataError && !exportError ? (
          <>
            {gradeMode === "F" && needsAttendanceDates() ? (
              <Button
                margin="small"
                onClick={() => {
                  setAttendanceModalOpen(true);
                }}
              >
                Edit Last Attendance Dates
              </Button>
            ) : null}
            <BannerButton
              clickHandler={bannerHandler}
              dataReady={
                canvasGrades &&
                canvasGrades[0].currentGrade !== "loading" &&
                !needsAttendanceDates(true) &&
                !schemeUnset
              }
              needsAttendanceDates={needsAttendanceDates(true)}
              exportRunning={exportRunning}
              published={published}
            />
            <LargeClassWarning />
          </>
        ) : null}
        {gradingOpen && !dataError ? (
          <GradesList
            canvasGrades={canvasGrades}
            bannerGrades={bannerGrades}
            gradeMode={gradeMode}
          />
        ) : null}
        {gradingOpen === false ? (
          <Alert variant="warning">
            Grading is currently closed for this term in Banner
          </Alert>
        ) : (
          ""
        )}
        {canvasGrades || schemeUnset || dataError || gradingOpen === false ? (
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
  term: PropTypes.string,
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
