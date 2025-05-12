import React, { useState } from "react";
import PropTypes from "prop-types";
import { FormFieldGroup } from "@instructure/ui-form-field";
import { NumberInput } from "@instructure/ui-number-input";
import { View } from "@instructure/ui-view";

const PassFailCutoff = (props) => {
  const MIN = 1;
  const MAX = 100;

  const [cutoff, setCutoff] = useState(props.gradeSchemeFail);
  const [messages, setMessages] = useState(null);
  const [val, setVal] = useState(props.gradeSchemeFail);

  const handleChange = (event, value) => {
    setMessages(null);
    setCutoff(value ? Number(value) : null);
    setVal(value);
  };

  const handleDecrement = () =>
    setCutoff((cutoff) => {
      if (isNaN(cutoff)) return;
      if (cutoff === null) return updateCutoff(MIN);
      if (Number.isInteger(cutoff)) return updateCutoff(cutoff - 1);
      return updateCutoff(Math.floor(cutoff));
    });

  const handleIncrement = () =>
    setCutoff((cutoff) => {
      if (isNaN(cutoff)) return;
      if (cutoff === null) return updateCutoff(MIN + 1);
      if (Number.isInteger(cutoff)) return updateCutoff(cutoff + 1);
      return updateCutoff(Math.floor(cutoff));
    });

  const handleBlur = () => {
    if (isNaN(cutoff)) {
      return setMessages([
        { text: `'${val}' is not a valid number.`, type: "error" },
      ]);
    }
    if (cutoff === null) {
      return setMessages([{ text: "This is required.", type: "error" }]);
    }
    updateCutoff(Math.round(cutoff));
    return props.changeHandler(Math.round(cutoff));
  };

  const updateCutoff = (n) => {
    const number = bound(n);
    setMessages(null);
    setVal(number);
    setCutoff(number);
    return number;
  };

  const bound = (n) => {
    if (n < MIN) return MIN;
    if (n > MAX) return MAX;
    return n;
  };

  return (
    <View as="div" padding="large">
      <FormFieldGroup description="Pass Fail Cutoff">
        <NumberInput
          renderLabel="Pass/Fail students with a grade below this value will be assigned a 'U'"
          messages={messages}
          onBlur={handleBlur}
          onChange={handleChange}
          onDecrement={handleDecrement}
          onIncrement={handleIncrement}
          placeholder={props.gradeSchemeFail.toString()}
          isRequired
          inputMode="numeric"
          display="inline-block"
          value={val}
        />
      </FormFieldGroup>
      <hr />
    </View>
  );
};
PassFailCutoff.propTypes = {
  changeHandler: PropTypes.func,
  gradeSchemeFail: PropTypes.number,
};

export default PassFailCutoff;
