import React from "react";
import PropTypes from "prop-types";
import { Link } from "@instructure/ui-link";

const RegistrarLink = ({rid, display="auto", children}) => {
  const href = `https://registrar.gatech.edu/info/${rid}`;
  return (
    <Link href={href} target="_blank" display={display}>
      {children}
    </Link>
  );
};
RegistrarLink.propTypes = {
  rid: PropTypes.string,
  display: PropTypes.oneOf([
    "auto",
    "block",
    "inline-block",
    "flex",
    "inline-flex",
  ]),
  children: PropTypes.node,
};

export default RegistrarLink;
