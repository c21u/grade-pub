import React from "react";
import PropTypes from "prop-types";
import { Alert } from "@instructure/ui-alerts";

const PublisherErrors = ({ exportError, dataError }) => {
  return (
    <>
      {exportError ? (
        <Alert variant="error">
          There was a problem sending some grades to Banner. If the issue
          persists please contact{" "}
          <a href="mailto:canvas@gatech.edu">canvas@gatech.edu</a>.
        </Alert>
      ) : null}
      {dataError ? (
        <Alert variant="error">
          There was a problem loading the grade data for this course, please
          refresh the page to try again. If the issue persists please contact{" "}
          <a href="mailto:canvas@gatech.edu">canvas@gatech.edu</a>.
        </Alert>
      ) : null}
    </>
  );
};
PublisherErrors.propTypes = {
  exportError: PropTypes.bool,
  dataError: PropTypes.bool,
};

export default PublisherErrors;
