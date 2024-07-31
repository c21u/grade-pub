import React from "react";
import { Heading } from "@instructure/ui-heading";
import { Link } from "@instructure/ui-link";
import { Text } from "@instructure/ui-text";
import { View } from "@instructure/ui-view";
import { List } from "@instructure/ui-list";

const Instructions = () => {
  return (
    <div>
      <Heading>Instructions</Heading>
      <View as="div" maxWidth="80%" margin="medium">
        <Heading level="h3">Step 1: Export your grades from Canvas</Heading>
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
          <List.Item>
            <Text>
              Go to the Banner Faculty Grade Entry (FGE) module at{" "}
              <Link
                href="https://fge.sis.gatech.edu/FacultySelfService"
                target="_blank"
              >
                https://fge.sis.gatech.edu/FacultySelfService
              </Link>{" "}
              (
              <Text weight="bold" fontStyle="italic">
                Requires
                <Link
                  href="https://gatech.service-now.com/continuity?id=kb_article_view&sysparm_article=KB0026837"
                  target="_blank"
                >
                  {" "}
                  VPN{" "}
                </Link>
                when accessed from off-campus
              </Text>
              )
            </Text>
          </List.Item>
          <List.Item>
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
          </List.Item>
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
