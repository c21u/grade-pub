import React from "react";
import PropTypes from "prop-types";
import { Button } from "@instructure/ui-buttons";

const BannerButton = (props) => {
  return (
    <Button
      disabled={!props.dataReady || props.exportRunning}
      onClick={props.clickHandler}
    >
      {props.dataReady
        ? props.exportRunning
          ? "Exporting Grades..."
          : "Export Grades to Banner"
        : "Preparing Grades for Export..."}
    </Button>
  );
};
BannerButton.propTypes = {
  clickHandler: PropTypes.func,
  dataReady: PropTypes.bool,
  exportRunning: PropTypes.bool,
};

export default BannerButton;
