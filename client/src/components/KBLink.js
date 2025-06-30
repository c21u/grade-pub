import React from "react";
import PropTypes from "prop-types";
import { Link } from "@instructure/ui-link";

const KBLink = ({kbid, display="auto", children}) => {
  const href = `https://gatech.service-now.com/continuity?id=kb_article_view&sysparm_article=${kbid}`;
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
