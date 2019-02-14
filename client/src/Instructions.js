import React from "react";
import Heading from "@instructure/ui-elements/lib/components/Heading";
import Link from "@instructure/ui-elements/lib/components/Link";
import List, { ListItem } from "@instructure/ui-elements/lib/components/List";
import Text from "@instructure/ui-elements/lib/components/Text";
import View from "@instructure/ui-layout/lib/components/View";

const Instructions = () => {
  return (
    <div>
      <Heading>Instructions</Heading>
      <View as="div" maxWidth="80%" margin="medium">
        <Heading level="h3">Step 1: Export your grades from Canvas</Heading>
        <Text weight="bold">
          In order to use the GT Grade Submission tool, you will first need to
          enable and set a grading scheme in Canvas:{" "}
        </Text>
        <List itemSpacing="small" margin="small" as="ol">
          <ListItem>
            <Text>Open your Course in Canvas</Text>
          </ListItem>
          <ListItem>
            <Text>
              Select <Text weight="bold">&quot;Settings&quot;</Text> from the
              course navigation menu on the left.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Under the <Text weight="bold">Course Details</Text> tab, select
              the check box next to &quot;
              <Text weight="bold">Enable Course Grading Scheme</Text>&quot;
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Beneath the check box, click &quot;
              <Text weight="bold">View Grading Scheme</Text>&quot;
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              In the <Text weight="bold">View/Edit Grading Scheme</Text> window,
              click &quot;
              <Text weight="bold">Select Another Scheme</Text>&quot;
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Select either &quot;<Text weight="bold">Midterm Grade</Text>
              &quot; or &quot;<Text weight="bold">Final Grade</Text>&quot;
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Click &quot;
              <Text weight="bold">Use This Grading Standard</Text>&quot;
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Click <Text weight="bold">Done</Text>
            </Text>
          </ListItem>
        </List>
        <Text>
          Click the button below to export a Banner-ready spreadsheet of grades.
          You can use the same spreadsheet file to upload grades for multiple
          sections, using the directions in Step 2 below.{" "}
        </Text>
        <Text>
          If you encounter issues with Step 1 above, please contact the Digital
          Learning Team at{" "}
          <Link href="mailto:canvas@gatech.edu">canvas@gatech.edu</Link>.
        </Text>
      </View>
      <hr />
      <View as="div" maxWidth="80%" margin="medium">
        <Heading level="h3">Step 2: Upload your grades to Banner</Heading>
        <List itemSpacing="small" margin="small" as="ol">
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
              Upload the spreadsheet you just exported from Canvas (see Step 1
              above). If your spreadsheet contains multiple sections, you will
              need to upload the file once for each section. During the upload
              process, you will see error messages about any records in the
              grades spreadsheet which do not match the current section. This is
              expected behavior.{" "}
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
          If you encounter issues with Step 2 above, contact the {"Registrar's"}{" "}
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
