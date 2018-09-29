import React from "react";
import ReactDOM from "react-dom";
import theme from "@instructure/ui-themes/lib/canvas";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import qs from "qs";
import jwtDecode from "jwt-decode";
import "whatwg-fetch";

theme.use();

let context = {};

/**
 * Get the JWT from the `token` query parameter. The jwtDecode() will throw
 * InvalidTokenError if it cannot decode the JWT, otherwise we copy the token
 * and decoded values into the context object.
 */
let updateContext = () => {
  try {
    let params = window.location.search;
    let jwt = qs.parse(params, { ignoreQueryPrefix: true }).token;
    context.lti = jwtDecode(jwt);
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
   * Fetch initial data
   */
  componentDidMount() {
    if (!context.fetchOptions)
      throw new Error("mounting App failed: no fetchOptions");

    window
      .fetch("/api/demo", context.fetchOptions)
      .then(checkResponseStatus)
      .then(response => response.json())
      .then(json => console.log(json))
      .catch(err => console.error(`fetch failed: ${err}`));
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
          <ProtectedRoute exact path="/" component={appRoute} />
        </div>
      </Router>
    );
  }
}

let defaultRoute = () => <h1>Default unprotected route</h1>;
let appRoute = () => <h1>Protected app route</h1>;

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
