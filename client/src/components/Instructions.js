import React from "react";
import { Text } from "@instructure/ui-text";
import { View } from "@instructure/ui-view";
import { InlineList } from "@instructure/ui-list";
import { Link } from "@instructure/ui-link";
import KBLink from "./KBLink.js";
import RegistrarLink from "./RegistrarLink.js";

const Instructions = () => {
  return (
    <View>
      <View as="div" maxWidth="80%" margin="medium">
        <Text>
          GradePub allows you to manually export grades or directly send grades
          to Banner.
        </Text>
      </View>
      <View as="div" maxWidth="80%" margin="medium">
        <Text>
          For more information and step-by-step instructions, please refer to
          the <KBLink kbid="KB0026508">Canvas Grade Submission</KBLink>{" "}
          knowledge article.
        </Text>
      </View>
      <View as="div" maxWidth="80%" margin="medium">
        <Text>
          If you experience any issues with GradePub, please reach out to the
          Digital Learning Team at{" "}
          <Link href="mailto:canvas@gatech.edu" target="_blank" />.
        </Text>
      </View>

      <View as="div" maxWidth="80%" margin="medium">
        <Text as="div" weight="bold" size="large">
          Additional Resources:
        </Text>
        <InlineList delimiter="pipe" margin="large 0">
          <InlineList.Item>
            <KBLink kbid="KB0026837">Georgia Tech's VPN</KBLink>
          </InlineList.Item>

          <InlineList.Item>
            <Link
              href="https://fge.sis.gatech.edu/FacultySelfService"
              target="_blank"
            >
              Faculty Grade Entry - FGE (Requires VPN)
            </Link>
          </InlineList.Item>

          <InlineList.Item>
            <RegistrarLink rid="grade-entry-faq">Grade Entry FAQ</RegistrarLink>
          </InlineList.Item>

          <InlineList.Item>
            <RegistrarLink rid="incomplete-grades">
              Incomplete Grades
            </RegistrarLink>
          </InlineList.Item>

          <InlineList.Item>
            <RegistrarLink rid="grade-changes">Grade Changes</RegistrarLink>
          </InlineList.Item>
        </InlineList>
      </View>
    </View>
  );
};

export default Instructions;
