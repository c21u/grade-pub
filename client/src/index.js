import React from "react";
import ReactDOM from "react-dom";
import theme from "@instructure/ui-themes/lib/canvas";
import Heading from "@instructure/ui-elements/lib/components/Heading";
import Link from "@instructure/ui-elements/lib/components/Link";
import List, { ListItem } from "@instructure/ui-elements/lib/components/List";
import Text from "@instructure/ui-elements/lib/components/Text";
import View from "@instructure/ui-layout/lib/components/View";
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

let Instructions = () => {
  return (
    <View as="div" padding="large">
      <Heading>Instructions</Heading>
      <View as="div" maxWidth="80%" margin="medium">
        <Text>
          <strong>Step 1:</strong> Export your grades from Canvas. If you
          encounter issues with this step, contact the Digital Learning Team at{" "}
          <Link href="mailto:canvas@gatech.edu">canvas@gatech.edu</Link>.
        </Text>
        <List itemSpacing="small" margin="small">
          <ListItem>
            <Text>
              In order to use this tool, you will first need to enable and set a
              grading scheme for the final course grade in Canvas.{" "}
              <Link
                href="http://canvas.gatech.edu/set-canvas-final-grade-reporting"
                target="_blank"
              >
                Click here to find the grading scheme instructions.
              </Link>
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Click the button below to export a Banner-ready spreadsheet of
              grades and save the file to your computer. Please note: You can
              reuse the same spreadsheet file to upload grades for multiple
              sections in Step 2.
            </Text>
          </ListItem>
        </List>
      </View>
      <View as="div" maxWidth="80%" margin="medium">
        <Text>
          <strong>Step 2:</strong> Upload your grades to Banner. If you
          encounter issues with this step, contact the {"Registrar's"} Office.
          (see{" "}
          <Link
            href="https://registrar.gatech.edu/faculty-and-staff/grading-and-grade-entry"
            target="_blank"
          >
            Grading and Grade Entry Information
          </Link>
          )
        </Text>
        <List itemSpacing="small" margin="small">
          <ListItem>
            <Text>
              Go to{" "}
              <Link href="https://buzzport.gatech.edu/" target="_blank">
                BuzzPort
              </Link>{" "}
              and login using your GT Account.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Click {"Registration - OSCAR"} in the{" "}
              {"Registration and Student Services"} section.
            </Text>
          </ListItem>
          <ListItem>
            <Text>Click {"Faculty Services."}</Text>
          </ListItem>
          <ListItem>
            <Text>Select the new Faculty Grade Entry option.</Text>
          </ListItem>
          <ListItem>
            <Text>
              Upload the grades spreadsheet (see Step 1) to Banner. If your
              spreadsheet contains multiple sections, you will need to upload it
              one time for each section. During the upload process, there will
              be errors about any records in the grades spreadsheet which do not
              match the current section. This is expected behavior.
            </Text>
          </ListItem>
        </List>
      </View>
    </View>
  );
};

/** App component */
class App extends React.Component {
  /**
   * App component constructor
   * @param {Object} props
   */
  constructor(props) {
    super(props);
    // can grab the jwt from window.location.search here,
    // why it is not present in componentDidMount(), idk
    grabJWT();
    // TODO maybe want to fire off the data request here in constructor, too.
  }

  /** Send initial data request */
  componentDidMount() {
    if (!!context.jwt) {
      window
        .fetch("/api/grades", {
          headers: {
            Authorization: `Bearer ${context.jwt}`
          }
        })
        .then(checkResponseStatus)
        .then(response => {
          return response.json();
        })
        .then(json => console.log(json)) // TODO something else.
        .catch(err => {
          console.error(`request failed: ${err}`);
        });
    }
  }

  /**
   * Render the app component with react-router
   * @return {Object} App component
   */
  render() {
    return (
      <Router>
        <div>
          <Route path="/default" component={defaultRoute} />
          <ProtectedRoute exact path="/" component={Instructions} />
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
