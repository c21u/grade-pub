import React from "react";
import Heading from "@instructure/ui-elements/lib/components/Heading";
import Link from "@instructure/ui-elements/lib/components/Link";
import List, { ListItem } from "@instructure/ui-elements/lib/components/List";
import Text from "@instructure/ui-elements/lib/components/Text";
import View from "@instructure/ui-layout/lib/components/View";

let Instructions = () => {
  return (
    <div>
      <Heading>Instructions</Heading>
      <View as="div" maxWidth="80%" margin="medium">
        <Text>
          <strong>Step 1:</strong> Export your grades from Canvas.
        </Text>
        <List itemSpacing="small" margin="small">
          <ListItem>
            <Text>
              In order to use this tool, you will first need to enable and set a
              grading scheme for the final course grade in Canvas.{" "}
              <Link
                href="http://canvas.gatech.edu/grade-submission"
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
        <Text>
          If you encounter issues with this step, contact the Digital Learning{" "}
          Team at <Link href="mailto:canvas@gatech.edu">canvas@gatech.edu</Link>
          .
        </Text>
      </View>
      <View as="div" maxWidth="80%" margin="medium">
        <Text>
          <strong>Step 2:</strong> Upload your grades to Banner.
        </Text>
        <List itemSpacing="small" margin="small">
          <ListItem>
            <Text>
              Go to the Banner Faculty Grade Entry (FGE) module at{" "}
              <Link
                href="https://fge.sis.gatech.edu/StudentFacultyGradeEntry"
                target="_blank"
              >
                https://fge.sis.gatech.edu/StudentFacultyGradeEntry
              </Link>
              .
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Upload the Canvas export grades spreadsheet (see Step 1) to
              Banner. If your spreadsheet contains multiple sections, you will
              need to upload it one time for each section. During the upload
              process, there will be errors about any records in the grades
              spreadsheet which do not match the current section. This is
              expected behavior.
            </Text>
            <Text>
              More information on this step is available at{" "}
              <Link
                href="https://registrar.gatech.edu/info/importing-grades"
                target="_blank"
              >
                https://registrar.gatech.edu/info/importing-grades
              </Link>
              .
            </Text>
          </ListItem>
        </List>
        <Text>
          If you encounter issues with this step, contact the {"Registrar's"}{" "}
          Office at{" "}
          <Link href="mailto:comments@registrar.gatech.edu">
            comments@registrar.gatech.edu
          </Link>
          . For additional information from the Registrar, see{" "}
          <Link
            href="https://registrar.gatech.edu/faculty-and-staff/grading-and-grade-entry"
            target="_blank"
          >
            Grading and Grade Entry Information
          </Link>
          .
        </Text>
      </View>
    </div>
  );
};

export default Instructions;
