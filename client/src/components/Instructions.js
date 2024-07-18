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
        <Heading level="h3">Export your grades from Canvas</Heading>
        <Text weight="bold">
          In order to use the GT Grade Submission tool, you will first need to
          enable and set a grading scheme in Canvas:{" "}
        </Text>
        <List itemSpacing="small" margin="small" as="ol">
          <List.Item>
            <Text>Open your Course in Canvas</Text>
          </List.Item>
          <List.Item>
            <Text>
              Select <Text weight="bold">&quot;Settings&quot;</Text> from the
              course navigation menu on the left.
            </Text>
          </List.Item>
          <List.Item>
            <Text>
              Under the <Text weight="bold">Course Details</Text> tab, select
              the check box next to &quot;
              <Text weight="bold">Enable Course Grading Scheme</Text>&quot;
            </Text>
          </List.Item>
          <List.Item>
            <Text>
              Beneath the check box, click &quot;
              <Text weight="bold">View Grading Scheme</Text>&quot;
            </Text>
          </List.Item>
          <List.Item>
            <Text>
              In the <Text weight="bold">View/Edit Grading Scheme</Text> window,
              click &quot;
              <Text weight="bold">Select Another Scheme</Text>&quot;
            </Text>
          </List.Item>
          <List.Item>
            <Text>
              Select either &quot;<Text weight="bold">Midterm Grade</Text>
              &quot; or &quot;<Text weight="bold">Final Grade</Text>&quot;
            </Text>
          </List.Item>
          <List.Item>
            <Text>
              Click &quot;
              <Text weight="bold">Use This Grading Standard</Text>&quot;
            </Text>
          </List.Item>
          <List.Item>
            <Text>
              Click <Text weight="bold">Done</Text>
            </Text>
          </List.Item>
        </List>
        <Text>
          Click the button below to export your grades directly to Banner
        </Text>
        <Text>
          If you encounter issues with the steps above, please contact the
          Digital Learning Team at{" "}
          <Link href="mailto:canvas@gatech.edu">canvas@gatech.edu</Link>.
        </Text>
      </View>
      <hr />
    </div>
  );
};

export default Instructions;
