import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import { theme } from '@instructure/canvas-theme'
import { Button } from '@instructure/ui-buttons';
import { IconWarningSolid } from '@instructure/ui-icons'
import { View } from '@instructure/ui-view';
import jwtDecode from "jwt-decode";
import qs from "qs";
import "whatwg-fetch";
import Instructions from "./Instructions";
import spreadsheetInstructions from "./spreadsheetInstructions";

theme.use();

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
        Authorization: `Bearer ${jwt}`
      }
    };
    context.data = [];
  } catch (err) {
    console.error(`updating context failed: ${err}`);
  }
};

const ProtectedRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      !!context.fetchOptions ? (
        <Component {...props} />
      ) : (
        <Redirect to={{ pathname: "/default" }} />
      )
    }
  />
);
ProtectedRoute.propTypes = {
  component: PropTypes.func
};

const GradesButton = props => {
  return (
    <Button
      onClick={props.clickHandler}
      disabled={!props.dataReady}
      size="large"
    >
      {props.dataReady ? "Export grades spreadsheet" : "Preparing export..."}
    </Button>
  );
};
GradesButton.propTypes = {
  clickHandler: PropTypes.func,
  dataReady: PropTypes.bool
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
      schemaUnset: null
    };
    this.exportHandler = this.exportHandler.bind(this);
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
      .then(grades => this.setState({ grades }))
      .then(() => window.fetch("/api/gradeScheme", context.fetchOptions))
      .then(res => {
        if (res.status === 500) {
          this.setState({ schemaUnset: true });
          return { status: 200, json: () => ({}) };
        }
        return res;
      })
      .then(checkResponseStatus)
      .then(responseJson)
      .then(gradeScheme => this.setState({ gradeScheme }))
      .then(() => window.fetch("/api/sectionTitles", context.fetchOptions))
      .then(checkResponseStatus)
      .then(responseJson)
      .then(sectionTitles => this.setState({ sectionTitles }))
      .then(() => this.setState({ dataReady: true }))
      .catch(err => console.error(`fetch failed: ${err}`));
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
      false
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
        "You either have hidden, unposted, or overridden gradebook entries that will impact the Final Grade column in your exported spreadsheet. This affects the grade of at least one student in your course."
      );
    }

    context.data = [];

    // Add the "header" row to the sheet
    context.data.push([
      "Term Code",
      "CRN",
      "Full Name",
      "Student ID",
      "Confidential",
      "Course",
      "Section",
      this.state.gradeScheme.title,
      "Last Attended Date",
      "Override"
    ]);

    // Add a row for each student
    this.state.grades.data.forEach(item => {
      const termCode = item.sisSectionID ? item.sisSectionID.slice(0, 6) : null;
      const crn = item.sisSectionID ? item.sisSectionID.slice(7) : null;
      const confidential = item.name === "Confidential" ? "Yes" : "No";
      const lastAttended = ""; // data is in SIS, so punt here
      const override = item.override;
      context.data.push([
        termCode,
        crn,
        item.name,
        { v: item.gtID, t: "s" },
        confidential,
        item.course,
        this.state.sectionTitles[item.sisSectionID],
        item.currentGrade, // TODO make it dynamic for miterms and finals
        lastAttended,
        override
      ]);
    });

    // Add the instruction sheet

    return import(/* webpackChunkName: "xlsx" */ "xlsx/dist/xlsx.full.min.js").then(
      ({ default: xlsx }) => {
        const instructionSheet = xlsx.utils.aoa_to_sheet(
          spreadsheetInstructions
        );
        const workSheet = xlsx.utils.aoa_to_sheet(context.data);
        const workBook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workBook, workSheet, "Grades");
        xlsx.utils.book_append_sheet(
          workBook,
          instructionSheet,
          "Instructions"
        );

        const courseID = this.state.grades.data[0].sisSectionID
          ? this.state.grades.data[0].sisSectionID.replace(/[^\w.]/g, "_")
          : null;
        const courseName = this.state.grades.data[0].course
          .replace(/[^\w. ]/g, "")
          .replace(/ /g, "_");
        const filename = `grades_${courseID}_${courseName}.xlsx`;
        xlsx.writeFile(workBook, filename);
      }
    );
  }

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
          <GradesButton
            clickHandler={this.exportHandler}
            dataReady={this.state.dataReady && !this.state.schemaUnset}
          />
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
const checkResponseStatus = response => {
  if (response.status === 200) {
    return response;
  } else {
    const err = new Error(response.statusText);
    err.response = response;
    throw err;
  }
};

const responseJson = response => response.json();

ReactDOM.render(<App />, document.getElementById("lti_root"));
