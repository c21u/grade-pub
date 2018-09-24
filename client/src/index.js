import React from "react";
import ReactDOM from "react-dom";
import theme from "@instructure/ui-themes/lib/canvas";
import Heading from "@instructure/ui-elements/lib/components/Heading";

theme.use();

let Greeting = () => {
  return (
    <div>
      <Heading>Hello world3</Heading>
    </div>
  );
};

ReactDOM.render(<Greeting />, document.body);
