import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import theme from "@instructure/ui-themes/lib/canvas";
import Button from "@instructure/ui-buttons/lib/components/Button";
import View from "@instructure/ui-layout/lib/components/View";
import jwtDecode from "jwt-decode";
import qs from "qs";
import xlsx from "xlsx";
import "whatwg-fetch";
import Instructions from "./Instructions";
import spreadsheetInstructions from "./spreadsheetInstructions";

theme.use();

let context = {};

let updateContext = () => {
  let params = window.location.search;
  try {
    let jwt = qs.parse(params, { ignoreQueryPrefix: true }).token;
    jwtDecode(jwt);
    context.fetchOptions = {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    };
    context.data = [
      [
        "Term Code",
        "CRN",
        "Full Name",
        "Student ID",
        "Confidential",
        "Course",
        "Grade",
        "Last Attended Date"
      ]
    ];
  } catch (err) {
    console.error(`updating context failed: ${err}`);
  }
};

let ProtectedRoute = ({ component: Component, ...rest }) => (
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

let GradesButton = props => {
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

/** Main app component */
class GradePublisher extends React.Component {
  /**
   * @param {Object} props
   */
  constructor(props) {
    super(props);
    this.state = {
      dataReady: false
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
      .then(response => response.json())
      .then(json => this.setState({ grades: json }))
      .then(() => this.setState({ dataReady: true }))
      .catch(err => console.error(`fetch failed: ${err}`));
  }

  /** Export the spreadsheet */
  exportHandler() {
    let courseID = this.state.grades.data[0].sisSectionID;
    let courseName = this.state.grades.data[0].course;
    this.state.grades.data.forEach(item => {
      const termCode = item.sisSectionID.slice(0, 6);
      const crn = item.sisSectionID.slice(7);
      const confidential = item.name === "Confidential" ? "Yes" : "No";
      const lastAttended = ""; // data is in SIS, so punt here
      context.data.push([
        termCode,
        crn,
        item.name,
        item.gtID,
        confidential,
        item.course,
        item.currentGrade, // TODO make it dynamic for miterms and finals
        lastAttended
      ]);
    });

    const instructionSheet = xlsx.utils.aoa_to_sheet(spreadsheetInstructions);
    const workSheet = xlsx.utils.aoa_to_sheet(context.data);
    const workBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workBook, workSheet, "Grades");
    xlsx.utils.book_append_sheet(workBook, instructionSheet, "Instructions");

    courseID = courseID.replace(/[^\w.]/g, "_");
    courseName = courseName.replace(/[^\w. ]/g, "").replace(/ /g, "_");
    let filename = `grades_${courseID}_${courseName}.xlsx`;
    xlsx.writeFile(workBook, filename);
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
          <GradesButton
            clickHandler={this.exportHandler}
            dataReady={this.state.dataReady}
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

let defaultRoute = () => <h1>Default unprotected route</h1>;

/**
 * Check for 200 OK status from response
 * @param {Object} response
 * @return {(Object|error)}
 */
let checkResponseStatus = response => {
  if (response.status === 200) {
    return response;
  } else {
    let err = new Error(response.statusText);
    err.response = response;
    throw err;
  }
};

ReactDOM.render(<App />, document.getElementById("lti_root"));
