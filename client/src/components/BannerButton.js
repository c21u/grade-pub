import React from "react";
import PropTypes from "prop-types";
import { Button } from "@instructure/ui-buttons";
import { Text } from "@instructure/ui-text";
import { IconCompleteSolid } from "@instructure/ui-icons";

const BannerButton = (props) => {
  return props.published ? (
    <Text>
      <IconCompleteSolid color="success" /> Grades successfully published to
      Banner.
    </Text>
  ) : (
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
  published: PropTypes.bool,
};

export default BannerButton;
