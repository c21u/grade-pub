import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import theme from "@instructure/ui-themes/lib/canvas";
import Button from "@instructure/ui-buttons/lib/components/Button";
import View from "@instructure/ui-layout/lib/components/View";
import jwtDecode from "jwt-decode";
import qs from "qs";
import "whatwg-fetch";
import Instructions from "./Instructions";

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
    <Button disabled={!props.dataReady} size="large">
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
      .then(json => console.log(json))
      .then(() => this.setState({ dataReady: true }))
      .catch(err => console.error(`fetch failed: ${err}`));
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
          <GradesButton dataReady={this.state.dataReady} />
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
