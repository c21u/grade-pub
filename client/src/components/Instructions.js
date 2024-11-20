import React from "react";
import { Text } from "@instructure/ui-text";
import { View } from "@instructure/ui-view";
import { InlineList } from "@instructure/ui-list";
import { Link } from "@instructure/ui-link";
import KBLink from "./KBLink.js";

const Instructions = () => {
  return (
    <View>
      <View as="div" maxWidth="80%" margin="medium">
        <Text>
          <Text weight="bold">GradePub</Text> will allow you to{" "}
          <Text weight="bold">manually export grades</Text> or{" "}
          <Text weight="bold">directly send grades to Banner</Text>.
        </Text>
      </View>
      <View as="div" maxWidth="80%" margin="medium">
        <Text>
          Enable <Text weight="bold">GradePub</Text> and select the{" "}
          <Text weight="bold">Grading Scheme (Midterm/Final)</Text> to get
          started!
        </Text>
      </View>
      <View as="div" maxWidth="80%" margin="medium">
        <Text>
          <Text weight="bold" as="div" size="large">
            Instructions:
          </Text>{" "}
          <KBLink kbid="" display="block">
            Enable GradePub
          </KBLink>
          <KBLink kbid="" display="block">
            Manually Export Grades From Canvas To Banner (Enable GradePub
            Prerequisite)
          </KBLink>
          <KBLink kbid="" display="block">
            Send Grades From Canvas To Banner (New Tool - Enable GradePub
            Prerequisite)
          </KBLink>
        </Text>
      </View>
      <View as="div" maxWidth="80%" margin="medium">
        <Text as="div" weight="bold" size="large">
          Additional Resources:
        </Text>
        <InlineList delimiter="pipe" margin="large 0">
          <InlineList.Item>
            <KBLink kbid="KB0026837">VPN</KBLink>
          </InlineList.Item>

          <InlineList.Item>
            <Link
              href="https://registrar.gatech.edu/faculty-and-staff/grading-and-grade-entry"
              target="_blank"
            >
              Grading and Grade Entry
            </Link>
          </InlineList.Item>
          <InlineList.Item>
            <KBLink kbid="KB0042717">Incomplete Section</KBLink>
          </InlineList.Item>
          <InlineList.Item>
            <Link
              href="https://registrar.gatech.edu/info/importing-grades"
              target="_blank"
            >
              Importing Grades
            </Link>
          </InlineList.Item>
          <InlineList.Item>
            <KBLink kbid="KB0026508">Canvas Grade Submission</KBLink>
          </InlineList.Item>
          <InlineList.Item>
            <Link
              href="https://community.canvaslms.com/t5/Instructor-Guide/How-do-I-override-a-student-s-final-grade-in-the-Gradebook/ta-p/946"
              target="_blank"
            >
              Grade Override
            </Link>
          </InlineList.Item>
        </InlineList>
      </View>
    </View>
  );
};

export default Instructions;
