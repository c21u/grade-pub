import React from "react";
import PropTypes from "prop-types";
import { Link } from "@instructure/ui-link";

const KBLink = (props) => {
  const href = `https://gatech.service-now.com/continuity?id=kb_article_view&sysparm_article=${props.kbid}`;
  return (
    <Link href={href} target="_blank">
      {props.children}
    </Link>
  );
};
KBLink.propTypes = {
  kbid: PropTypes.string,
};

export default KBLink;
