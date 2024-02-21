import React from "react";
import PropTypes from "prop-types";
import { createRoot } from "react-dom";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import { theme } from "@instructure/canvas-theme";
import { IconWarningSolid } from "@instructure/ui-icons";
import { View } from "@instructure/ui-view";
import { Spinner } from "@instructure/ui-spinner";
import { EmotionThemeProvider } from "@instructure/emotion";
import { jwtDecode } from "jwt-decode";
import qs from "qs";
import "whatwg-fetch";
import spreadsheet from "./spreadsheet.js";
import GradesButton from "./GradesButton.js";
import Instructions from "./Instructions.js";

const context = {};

/**
 * Get the JWT from the `token` query parameter. The jwtDecode() will throw
 * InvalidTokenError if it cannot decode the JWT, otherwise we copy the token
 * and decoded values into the context object.
 */
const updateContext = () => {
  try {
    const params = window.location.search;
    const jwt = qs.parse(params, { ignoreQueryPrefix: true }).token;
    context.lti = jwtDecode(jwt);
    context.fetchOptions = {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    };
    context.data = [];
  } catch (err) {
    console.error(`updating context failed: ${err}`);
  }
};

const ProtectedRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      !!context.fetchOptions ? (
        <Component {...props} />
      ) : (
        <Redirect to={{ pathname: "/default" }} />
      )
    }
  />
);
ProtectedRoute.propTypes = {
  component: PropTypes.func,
};

/** Main app component */
class GradePublisher extends React.Component {
  /**
   * @param {Object} props
   */
  constructor(props) {
    super(props);
    this.state = {
      dataReady: false,
      schemaUnset: null,
      popOverOpen: false,
      dataError: false,
    };
    this.exportHandler = this.exportHandler.bind(this);
    this.handlePopOver = this.handlePopOver.bind(this);
  }

  /**
   * Fetch initial data
   */
  componentDidMount() {
    if (!context.fetchOptions)
      throw new Error("mounting App failed: no fetchOptions");
    window
      .fetch("/api/grades", context.fetchOptions)
      .then(checkResponseStatus)
      .then(responseJson)
      .then((grades) => this.setState({ grades }))
      .then(() => window.fetch("/api/gradeScheme", context.fetchOptions))
      .then((res) => {
        if (res.status === 500) {
          this.setState({ schemaUnset: true });
          return { status: 200, json: () => ({}) };
        }
        return res;
      })
      .then(checkResponseStatus)
      .then(responseJson)
      .then((gradeScheme) => this.setState({ gradeScheme }))
      .then(() => window.fetch("/api/sectionTitles", context.fetchOptions))
      .then(checkResponseStatus)
      .then(responseJson)
      .then((sectionTitles) => this.setState({ sectionTitles }))
      .then(() => this.setState({ dataReady: true }))
      .catch((err) => this.setState({ dataError: true }));
  }

  /**
   * Export the spreadsheet
   * changed hasMuted to hasHidden (canvas updated wording from mute to hide)
   * @return {Promise}
   **/
  exportHandler() {
    let hasOverride;
    const gradeData = this.state.grades.data;
    const hasHidden = gradeData.reduce(
      (result, grade) =>
        result || grade.currentGrade !== grade.unpostedCurrentGrade,
      false,
    );
    // loops through grade data array of objects to see if any student has an overriden grade
    for (let i = 0; i < gradeData.length; i++) {
      if (gradeData[i].override == "Y") {
        hasOverride = true;
        break;
      }
    }
    // if gradebook has either an overriden grade or hidden grade, then it will alert user
    if (hasOverride || hasHidden) {
      alert(
        "You either have hidden, unposted, or overridden gradebook entries that will impact the Final Grade column in your exported spreadsheet. This affects the grade of at least one student in your course.",
      );
    }

    const courseID = context.lti.context_label.replace(/[^\w.]/g, "_");
    const courseName = context.lti.context_title.replace(/[^\w.]/g, "_");
    const filename = `grades_${courseID}_${courseName}.xlsx`;

    return spreadsheet(
      this.state.gradeScheme.title,
      this.state.grades,
      this.state.sectionTitles,
      filename,
    );
  }

  handlePopOver = () => {
    this.setState(function (state) {
      return { popOverOpen: !state.popOverOpen };
    });
  };

  /**
   * @return {Object} Render the Gradepub component
   */
  render() {
    return (
      <div>
        <View as="div" padding="large">
          <Instructions />
        </View>
        <View as="div" textAlign="center">
          <span style={{ display: this.state.schemaUnset ? "inline" : "none" }}>
            <IconWarningSolid color="warning" />
            You have not set a grading schema for this course, please read the
            instructions above.
          </span>
        </View>
        <View as="div" textAlign="center">
          {this.state.dataError ? (
            <span>
              <IconWarningSolid color="error" /> There was a problem loading the
              grade data for this course, please refresh the page to try again.
              If the issue persists please contact{" "}
              <a href="mailto:canvas@gatech.edu">canvas@gatech.edu</a>.
            </span>
          ) : (
            <GradesButton
              popOverOpen={this.state.popOverOpen}
              handlePopOver={this.handlePopOver}
              clickHandler={this.exportHandler}
              dataReady={this.state.dataReady && !this.state.schemaUnset}
            />
          )}
          {this.state.dataReady ||
          this.state.schemaUnset ||
          this.state.dataError ? (
            ""
          ) : (
            <View as="div">
              <Spinner renderTitle="Loading" size="x-small" margin="small" />
            </View>
          )}
        </View>
      </div>
    );
  }
}

/** App component */
class App extends React.Component {
  /**
   * App component constructor.
   * @param {Object} props
   */
  constructor(props) {
    super(props);
    updateContext();
  }

  /**
   * Render App component with react-router
   * @return {Object}
   */
  render() {
    return (
      <Router>
        <div>
          <Route path="/default" component={defaultRoute} />
          <ProtectedRoute exact path="/" component={GradePublisher} />
        </div>
      </Router>
    );
  }
}

const defaultRoute = () => <h1>Default unprotected route</h1>;

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

const responseJson = (response) => response.json();

const root = createRoot(document.getElementById("lti_root"));
root.render(
  <EmotionThemeProvider theme={theme}>
    <App />
  </EmotionThemeProvider>,
);
