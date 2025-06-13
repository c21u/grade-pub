import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { createRoot } from "react-dom/client";
import { theme } from "@instructure/canvas-theme";
import { InstUISettingsProvider } from "@instructure/emotion";
import GradePublisher from "./components/GradePublisher.js";

const App = () => {
  const [fetchOptions, setFetchOptions] = useState({});
  const [filename, setFilename] = useState("");
  const [term, setTerm] = useState();

  useEffect(() => {
    /**
     * Get the JWT from the `token` query parameter. The jwtDecode() will throw
     * InvalidTokenError if it cannot decode the JWT
     */
    try {
      const params = window.location.search;
      const jwt = qs.parse(params, { ignoreQueryPrefix: true }).token;
      const lti = jwtDecode(jwt);
      const fetchOptions = {
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      };
      setFetchOptions(fetchOptions);
      setFilename(
        `grades_${lti.context_label.replace(/[^\w.]/g, "_")}_${lti.context_title.replace(/[^\w.]/g, "_")}.xlsx`,
      );
      setTerm(lti.custom_lis_course_offering_sourcedid.slice(0, 6));
    } catch (err) {
      console.error(`updating context failed: ${err}`);
    }
  }, []);

  return <GradePublisher fetchOptions={fetchOptions} filename={filename} term={term} />
};

const root = createRoot(document.getElementById("lti_root"));
root.render(
  <InstUISettingsProvider theme={theme}>
    <App />
  </InstUISettingsProvider>,
);
