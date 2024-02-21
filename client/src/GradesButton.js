import React from "react";
import PropTypes from "prop-types";
import { Button } from "@instructure/ui-buttons";
import { Popover } from "@instructure/ui-popover";
import { View } from "@instructure/ui-view";

const GradesButton = (props) => {
  return (
    <View>
      <Popover
        renderTrigger={
          <Button disabled={!props.dataReady}>
            {props.dataReady
              ? "Export Grades Spreadsheet"
              : "Preparing export..."}
          </Button>
        }
        isShowingContent={props.popOverOpen}
        onShowContent={props.handlePopOver}
        onHideContent={props.handlePopOver}
        on="click"
        screenReaderLabel="Export Grades"
        shouldContainFocus
        shouldReturnFocus
        shouldCloseOnDocumentClick
        offsetY="16px"
      >
        <View padding="medium" display="block" as="form" width="600px">
          <p>
            You are downloading FERPA protected data. Storage and sharing of
            protected data must follow Georgia Tech data safeguard policies and
            protocols described at{" "}
            <a
              href="https://b.gatech.edu/datasecurity"
              target="_blank"
              rel="noreferrer"
            >
              b.gatech.edu/datasecurity
            </a>
            .
          </p>
          <Button onClick={props.clickHandler}>
            Export Grades Spreadsheet
          </Button>
        </View>
      </Popover>
    </View>
  );
};
GradesButton.propTypes = {
  handlePopOver: PropTypes.func,
  clickHandler: PropTypes.func,
  popOverOpen: PropTypes.bool,
  dataReady: PropTypes.bool,
};
