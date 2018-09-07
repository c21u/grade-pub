let React = require('react');
let ReactDOM = require('react-dom');

let Greeting = () => {
  return (
    <div>
      <h1>Hello world</h1>
    </div>
  );
};

ReactDOM.render(<Greeting />, document.body);
