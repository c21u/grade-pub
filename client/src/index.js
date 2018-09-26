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

let App = () => {
  grabJWT();
  if (!!context.jwt) {
    fetch("/api/demo", {
      headers: {
        Authorization: `Bearer ${context.jwt}`
      }
    })
      .then(response => {
        console.log(response);
      })
      .catch(err => {
        console.error(err);
      });
  }

  return (
    <Router>
      <div>
        <Route path="/default" component={defaultRoute} />
        <ProtectedRoute exact path="/" component={appRoute} />
      </div>
    </Router>
  );
};

let defaultRoute = () => <h1>Default unprotected route</h1>;
let appRoute = () => <h1>Protected app route</h1>;

ReactDOM.render(<App />, document.getElementById("lti_root"));
