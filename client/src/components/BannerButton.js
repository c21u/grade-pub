import React from "react";
import PropTypes from "prop-types";
import { Button } from "@instructure/ui-buttons";

const BannerButton = (props) => {
  return (
    <Button disabled={!props.dataReady} onClick={props.clickHandler}>
      {props.dataReady ? "Export Grades to Banner" : "Preparing export..."}
    </Button>
  );
};
BannerButton.propTypes = {
  clickHandler: PropTypes.func,
  dataReady: PropTypes.bool,
};

export default BannerButton;
