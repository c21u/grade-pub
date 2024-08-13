import React from "react";
import { Text } from "@instructure/ui-text";
import { View } from "@instructure/ui-view";
import { List } from "@instructure/ui-list";
import KBLink from "./KBLink.js";

const Instructions = () => {
  return (
    <div>
      <View as="div" maxWidth="80%" margin="medium">
        <Text>
          This tool will export your grades directly to Banner. You should
          ensure that the final grades in Canvas reflect the students&apos; true
          final grades before exporting.
        </Text>
      </View>
      <View as="div" maxWidth="80%" margin="medium">
        <Text>
          The Canvas grade book supports a number of common grading scenarios:
        </Text>
        <List itemSpacing="small" margin="small" as="ol">
          <List.Item>
            <Text>
              If you need to override grades see the instructions at{" "}
              <KBLink kbid="KB0026837">VPN</KBLink>
            </Text>
          </List.Item>
        </List>
      </View>
    </div>
  );
};

export default Instructions;
