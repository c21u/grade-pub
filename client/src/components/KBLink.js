import React from "react";
import PropTypes from "prop-types";
import { Link } from "@instructure/ui-link";

const KBLink = ({kbid, display="auto", children}) => {
  const href = `https://gatech.service-now.com/kb_view.do?sys_kb_id=${kbid}`;
  return (
    <Link href={href} target="_blank" display={display}>
      {children}
    </Link>
  );
};
KBLink.propTypes = {
  kbid: PropTypes.string,
  display: PropTypes.oneOf([
    "auto",
    "block",
    "inline-block",
    "flex",
    "inline-flex",
  ]),
  children: PropTypes.node,
};

export default KBLink;
