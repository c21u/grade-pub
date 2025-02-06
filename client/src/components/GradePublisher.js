import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { View } from "@instructure/ui-view";
import { Spinner } from "@instructure/ui-spinner";
import { useBeforeunload } from "react-beforeunload";
import { Button } from "@instructure/ui-buttons";
import { Alert } from "@instructure/ui-alerts";
import { FormFieldGroup } from "@instructure/ui-form-field";
import { Checkbox } from "@instructure/ui-checkbox";
import { ScreenReaderContent } from "@instructure/ui-a11y-content";
import { Flex } from "@instructure/ui-flex";
import { Heading } from "@instructure/ui-heading";

import spreadsheet from "../spreadsheet.js";
import BannerButton from "./BannerButton.js";
import SheetButton from "./SheetButton.js";
import GradesList from "./GradesList.js";
import GradeSchemeSelect from "./GradeSchemeSelect.js";
import Instructions from "./Instructions.js";
import PublisherErrors from "./PublisherErrors.js";
import AttendanceModal from "./AttendanceModal.js";
import PassFailCutoff from "./PassFailCutoff.js";

const GradePublisher = (props) => {
  const [schemeUnset, setSchemeUnset] = useState(null);
  const [dataError, setDataError] = useState(false);
  const [canvasGrades, setCanvasGrades] = useState(null);
  const [gradeScheme, setGradeScheme] = useState(null);
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
  const [loadedAttendanceDates, setLoadedAttendanceDates] = useState(false);
  const [useLegacy, setUseLegacy] = useState(false);
  const [alwaysSendCurrentGrade, setAlwaysSendCurrentGrade] = useState(false);
  const [passFailCutoff, setPassFailCutoff] = useState(null);

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
            console.error(err);
            setDataError(true);
          }
        })
        .catch((err) => {
          console.error(err);
          setDataError(true);
        });
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
      passFailCutoff &&
      gradeMode &&
      gradeScheme
    ) {
      window
        .fetch(
          `/api/grades?passFailCutoff=${passFailCutoff}&mode=${gradeMode}`,
          fetchOptions,
        )
        .then(async (gradeResponse) => {
          try {
            checkResponseStatus(gradeResponse);
            const gradeResponseJson = await gradeResponse.json();
            setCanvasGrades(gradeResponseJson.data);
            setAlwaysSendCurrentGrade(
              "true" ==
                gradeResponseJson.config.alwaysSendCurrentGrade.toLowerCase(),
            );
            setLoadedAttendanceDates(false);
          } catch (err) {
            console.error(err);
            setDataError(true);
          }
        })
        .catch((err) => {
          console.error(err);
          setDataError(true);
        });
    }
  }, [fetchOptions, gradeScheme, passFailCutoff, gradeMode]);

  useEffect(() => {
    if (
      fetchOptions &&
      fetchOptions.headers &&
      fetchOptions.headers.Authorization &&
      canvasGrades &&
      !loadedAttendanceDates
    ) {
      window
        .fetch("/api/attendanceDates", fetchOptions)
        .then(async (dateResponse) => {
          try {
            checkResponseStatus(dateResponse);
            const dates = await dateResponse.json();
            const updatedCanvasGrades = canvasGrades.map((grade) => {
              if (needsAttendanceDate(grade) && dates[grade.gtID]) {
                grade.lastAttendanceDate = dates[grade.gtID].date;
                grade.finalGrade = dates[grade.gtID].incomplete
                  ? "I"
                  : grade.finalGrade;
                grade.currentGrade = dates[grade.gtID].incomplete
                  ? "I"
                  : grade.currentGrade;
              } else {
                delete grade.lastAttendanceDate;
              }
              return grade;
            });
            setLoadedAttendanceDates(true);
            setCanvasGrades(updatedCanvasGrades);
          } catch (err) {
            console.error(err);
            setDataError(true);
          }
        })
        .catch((err) => {
          console.error(err);
          setDataError(true);
        });
    }
  }, [fetchOptions, canvasGrades, loadedAttendanceDates, needsAttendanceDate]);

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
              setPassFailCutoff(
                gs.grading_scheme.find(({ name }) => name === "D")
                  ?.calculated_value,
              );
              setSchemeUnset(false);
            }
          } catch (err) {
            console.error(err);
            setDataError(true);
          }
        })
        .catch((err) => {
          console.error(err);
          setDataError(true);
        });
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
        setBannerInitial([]);
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
          })
          .catch(() => {
            setBannerInitial([]);
            setBannerGrades([]);
          });
      } catch (err) {
        setBannerInitial([]);
        setBannerGrades([]);
      }
    }
  }, [canvasGrades, hasOverride, bannerInitial, fetchOptions]);

  useEffect(() => {
    if (bannerInitial) {
      setBannerGrades(
        bannerInitial.map((grade) => {
          return {
            success: true,
            gtid: grade.gtid,
            grade:
              gradeMode === "F"
                ? grade.grade_code || "-"
                : grade.grade_code_mid || "-",
          };
        }),
      );
    }
  }, [gradeMode, bannerInitial]);

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
          return isGradingOpen.success
            ? setGradingOpen({
                final: isGradingOpen.payload.final_grades_allowed == "open",
                midterm: isGradingOpen.payload.midterm_grades_allowed == "open",
              })
            : (console.error("isGradingOpen has no `success` element"),
              setDataError(true));
        })
        .catch((err) => {
          console.error(err);
          setDataError(true);
        });
    }
  }, [fetchOptions, gradingOpen, term]);

  useEffect(() => {
    if (gradingOpen?.final) setGradeMode("F");
    if (gradingOpen?.midterm) setGradeMode("M");
  }, [gradingOpen]);

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
      alwaysSendCurrentGrade,
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
      canvasGrades
        ? canvasGrades.map((datum) => ({
            ...datum,
            currentGrade: "loading",
            finalGrade: "loading",
          }))
        : canvasGrades,
    );
    setSchemeUnset(null);
  };

  const persistAttendanceDates = async (dates) => {
    return await window.fetch("/api/attendanceDates", {
      ...fetchOptions,
      method: "POST",
      body: JSON.stringify(dates),
    });
  };

  const updateAttendanceDates = async (dates) => {
    await persistAttendanceDates(dates);
    setAttendanceModalOpen(false);
    const updatedCanvasGrades = canvasGrades.map((grade) => {
      if (needsAttendanceDate(grade)) {
        grade.lastAttendanceDate = dates[grade.gtID].date;
        grade.finalGrade = dates[grade.gtID].incomplete
          ? "I"
          : grade.finalGrade;
        grade.currentGrade = dates[grade.gtID].incomplete
          ? "I"
          : grade.currentGrade;
      } else {
        delete grade.lastAttendanceDate;
      }
      return grade;
    });
    setCanvasGrades(updatedCanvasGrades);
  };

  const needsAttendanceDate = useCallback(
    (student) =>
      ["F", "I"].includes(
        alwaysSendCurrentGrade ? student.currentGrade : student.finalGrade,
      ),
    [alwaysSendCurrentGrade],
  );

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

  const LoadingSpinner = (props) => {
    return canvasGrades ||
      schemeUnset ||
      dataError ||
      (gradingOpen &&
        gradingOpen.final === false &&
        gradingOpen.midterm === false) ? null : (
      <View as="div">
        <Spinner renderTitle="Loading" size="x-small" margin="small" />
      </View>
    );
  };

  return (
    <div>
      <Flex>
        <Flex.Item shouldGrow shouldShrink padding="none medium none none">
          <Heading>Grade Publisher</Heading>
        </Flex.Item>
        <Flex.Item>
          <FormFieldGroup
            description={
              <ScreenReaderContent>
                Legacy functionality toggle
              </ScreenReaderContent>
            }
          >
            <Checkbox
              label="Manual Export"
              variant="toggle"
              checked={useLegacy}
              onChange={() => setUseLegacy(!useLegacy)}
            />
          </FormFieldGroup>
        </Flex.Item>
      </Flex>
      <Instructions />
      <GradeSchemeSelect
        gradeScheme={gradeScheme}
        schemeUnset={schemeUnset}
        clickHandler={handleGradeSchemeSelected}
        fetchOptions={fetchOptions}
      />
      {hasOverride ? (
        <Alert variant="warning">
          You either have hidden, unposted, or overridden gradebook entries that
          will impact the Final Grade. This affects the grade of at least one
          student in the course.
        </Alert>
      ) : null}
      {gradeScheme ? (
        <PassFailCutoff
          changeHandler={(cutoff) => {
            setPassFailCutoff(cutoff);
          }}
          gradeSchemeFail={
            gradeScheme.grading_scheme.find(({ name }) => name === "D")
              ?.calculated_value || 60
          }
        />
      ) : null}
      <View as="div" textAlign="center">
        {schemeUnset ? (
          <Alert variant="warning">
            You have not set a grading scheme for this course, select one above
            to procede.
          </Alert>
        ) : needsAttendanceDates(true) ? (
          <Alert variant="warning">
            A last attendance date is needed for students with an I or an F
          </Alert>
        ) : canvasGrades &&
          canvasGrades[0] &&
          canvasGrades[0].currentGrade !== "loading" &&
          gradingOpen &&
          (gradingOpen.final || gradingOpen.midterm) ? (
          <Alert variant="success">
            Grades Ready To Submit! Click Send Grades To Banner
          </Alert>
        ) : null}
      </View>
      {useLegacy ? (
        <Flex justifyItems="center">
          <Flex.Item align="center" textAlign="center">
            <SheetButton
              clickHandler={sheetHandler}
              dataReady={
                canvasGrades &&
                canvasGrades[0] &&
                canvasGrades[0].currentGrade !== null &&
                !schemeUnset
              }
            />
            <LoadingSpinner />
          </Flex.Item>
        </Flex>
      ) : (
        <>
          <AttendanceModal
            open={attendanceModalOpen}
            students={
              canvasGrades
                ? Object.values(
                    canvasGrades
                      .filter((student) => needsAttendanceDate(student))
                      .reduce((acc, cur) => {
                        acc[cur.gtID] ? null : (acc[cur.gtID] = cur);
                        return acc;
                      }, {}),
                  )
                : []
            }
            onDismiss={() => setAttendanceModalOpen(false)}
            onSubmit={updateAttendanceDates}
          />
          <View as="div" textAlign="center">
            {gradingOpen?.final && gradingOpen?.midterm ? (
              <View as="div" padding="large">
                Banner appears to be accepting both midterm and final grades,
                which would you like to send?
                <Checkbox
                  variant="toggle"
                  label="Send grades as Final"
                  checked={gradeMode === "F"}
                  onChange={() => {
                    gradeMode === "F" ? setGradeMode("M") : setGradeMode("F");
                  }}
                />
              </View>
            ) : null}
            <PublisherErrors exportError={exportError} dataError={dataError} />
            {gradingOpen &&
            (gradingOpen.final || gradingOpen.midterm) &&
            !dataError &&
            !exportError ? (
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
            {gradingOpen &&
            (gradingOpen.final || gradingOpen.midterm) &&
            !dataError ? (
              <GradesList
                canvasGrades={canvasGrades}
                bannerGrades={bannerGrades}
                gradeMode={gradeMode}
                alwaysSendCurrentGrade={alwaysSendCurrentGrade}
              />
            ) : null}
            {gradingOpen &&
            gradingOpen.final === false &&
            gradingOpen.midterm === false ? (
              <Alert variant="warning">
                Grading is currently closed for this term in Banner
              </Alert>
            ) : (
              ""
            )}
            <LoadingSpinner />
          </View>
        </>
      )}
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
