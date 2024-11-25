import React from "react";
import PropTypes from "prop-types";
import { Button } from "@instructure/ui-buttons";
import { Alert } from "@instructure/ui-alerts";

const BannerButton = ({
  dataReady,
  exportRunning,
  needsAttendanceDates,
  clickHandler,
  published,
}) => {
  return published ? (
    <Alert variant="success">Grades successfully published to Banner.</Alert>
  ) : (
    <Button
      disabled={!dataReady || needsAttendanceDates || exportRunning}
      onClick={clickHandler}
    >
      {dataReady
        ? exportRunning
          ? "Sending Grades..."
          : "Send Grades to Banner"
        : needsAttendanceDates
          ? "Attendance Dates Needed"
          : "Preparing Grades..."}
    </Button>
  );
};
BannerButton.propTypes = {
  clickHandler: PropTypes.func,
  dataReady: PropTypes.bool,
  needsAttendanceDates: PropTypes.bool,
  exportRunning: PropTypes.bool,
  published: PropTypes.bool,
};

export default BannerButton;
