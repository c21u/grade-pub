import React from "react";
import PropTypes from "prop-types";
import Warning from "./Warning.js";

const PublisherErrors = ({ exportError, dataError }) => {
  return (
    <>
      {exportError ? (
        <Warning color="error">
          There was a problem sending some grades to Banner. If the issue
          persists please contact{" "}
          <a href="mailto:canvas@gatech.edu">canvas@gatech.edu</a>.
        </Warning>
      ) : null}
      {dataError ? (
        <Warning color="error">
          There was a problem loading the grade data for this course, please
          refresh the page to try again. If the issue persists please contact{" "}
          <a href="mailto:canvas@gatech.edu">canvas@gatech.edu</a>.
        </Warning>
      ) : null}
    </>
  );
};
PublisherErrors.propTypes = {
  exportError: PropTypes.bool,
  dataError: PropTypes.bool,
};

export default PublisherErrors;
