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

/**
 * Get the JWT from the `token` query parameter. The jwtDecode() will throw
 * InvalidTokenError if it cannot decode the JWT, otherwise we copy the token
 * and decoded values into the context object.
 */
let grabJWT = () => {
  try {
    let jwt = qs.parse(window.location.search, {
      ignoreQueryPrefix: true
    }).token;
    context.lti = jwtDecode(jwt);
    context.jwt = jwt;
  } catch (err) {
    console.error(err);
  }
};

let ProtectedRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      !!context.jwt ? (
        <Component {...props} />
      ) : (
        <Redirect to={{ pathname: "/default" }} />
      )
    }
  />
);

let GradesButton = () => {
  return <Button>Export grades spreadsheet</Button>;
};

let GradePublisher = () => {
  return <div>
      <View as="div" padding="large">
        <Instructions />
      </View>
      <View as="div" textAlign="center">
        <GradesButton />
      </View>
    </div>;
};

/** App component */
class App extends React.Component {
  /**
   * App component constructor.
   * @param {Object} props
   */
  constructor(props) {
    super(props);

    grabJWT();
    if (!!context.jwt) {
      window
        .fetch("/api/grades", {
          headers: {
            Authorization: `Bearer ${context.jwt}`
          }
        })
        .then(checkResponseStatus)
        .then(response => response.json())
        .then(json => console.log(json))
        .catch(err => console.error(`fetch failed: ${err}`));
    }
  }

  /**
   * Render App component with react-router
   * @return {Object}
   */
  render() {
    return <Router>
        <div>
          <Route path="/default" component={defaultRoute} />
          <ProtectedRoute exact path="/" component={GradePublisher} />
        </div>
      </Router>;
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
