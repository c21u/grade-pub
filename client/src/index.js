import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { theme } from "@instructure/canvas-theme";
import { InstUISettingsProvider } from "@instructure/emotion";
import GradePublisher from "./components/GradePublisher.js";

const App = () => {
  const [fetchOptions, setFetchOptions] = useState({});
  const [filename, setFilename] = useState("");
  const [term, setTerm] = useState();

  useEffect(() => {
    const ltik = new URLSearchParams(window.location.search).get("ltik");
    if (!ltik) throw new Error("Missing lti key.");
    const options = {
      headers: {
        Authorization: `Bearer ${ltik}`,
        "Content-Type": "application/json",
      },
    }
    setFetchOptions(options);
    window
      .fetch("/api/context", options)
      .then(async (response) => {
        const context = (await response.json()).context;
        console.log(context)
        setFilename(
          `grades_${context.context.label.replace(/[^\w.]/g, "_")}_${context.context.title.replace(/[^\w.]/g, "_")}.xlsx`,
        );
        setTerm(
          context.custom.lis_course_offering_sourcedid.slice(0, 6),
        );
      })
      .catch((err) => console.error(`Error fetching context: ${err}`));
  }, []);

  return (
    <GradePublisher
      fetchOptions={fetchOptions}
      filename={filename}
      term={term}
    />
  );
};

const root = createRoot(document.getElementById("lti_root"));
root.render(
  <InstUISettingsProvider theme={theme}>
    <App />
  </InstUISettingsProvider>,
);
