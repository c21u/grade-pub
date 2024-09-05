import React from "react";
import PropTypes from "prop-types";
import { IconWarningSolid } from "@instructure/ui-icons";
import { Text } from "@instructure/ui-text";

const Warning = ({ color, children }) => {
  color = color ? color : "warning";
  return (
    <Text as="div">
      <IconWarningSolid color={color} /> {children}
    </Text>
  );
};
Warning.propTypes = {
  color: PropTypes.string,
  children: PropTypes.children,
};

export default Warning;
