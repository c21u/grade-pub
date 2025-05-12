import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button } from "@instructure/ui-buttons";
import { List } from "@instructure/ui-list";
import { Modal } from "@instructure/ui-modal";
import { Checkbox } from "@instructure/ui-checkbox";
import { Flex } from "@instructure/ui-flex";
import AttendanceDate from "./AttendanceDate.js";

const AttendanceModal = ({ open, students, onSubmit, onDismiss }) => {
  const [dates, setDates] = useState({});

  students.sort((a, b) => (a.name > b.name ? 1 : -1));

  useEffect(() => {
    students.forEach((student) =>
      updateDate(
        student.gtID,
        student.lastAttendanceDate,
        student.finalGrade === "I",
      ),
    );
  }, [students]);

  const updateDate = (id, date, incomplete) => {
    date = date || "";
    incomplete = !!incomplete;
    setDates((dates) => ({ ...dates, [id]: { date, incomplete } }));
  };

  return Object.keys(dates).length > 0 ? (
    <Modal
      as="form"
      open={open}
      onDismiss={onDismiss}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(dates);
        return false;
      }}
      label="Last attendance dates"
      size="auto"
      shouldCloseOnDocumentClick={false}
    >
      <Modal.Header>
        Please select last dates of attendance for all students receiving grades
        of `I` or `F`.
      </Modal.Header>
      <Modal.Body>
        <List isUnstyled>
          {students.map((student) => (
            <List.Item key={student.gtID} margin="small">
              <Flex>
                <Flex.Item padding="small" shouldGrow>
                  <AttendanceDate
                    name={student.name}
                    onChange={(e, value) => {
                      updateDate(
                        student.gtID,
                        value,
                        dates[student.gtID].incomplete,
                      );
                    }}
                    value={dates[student.gtID].date}
                  />
                </Flex.Item>
                <Flex.Item>
                  <Checkbox
                    label="Send as `I`"
                    variant="toggle"
                    checked={dates[student.gtID].incomplete}
                    onChange={() => {
                      updateDate(
                        student.gtID,
                        dates[student.gtID].date,
                        !dates[student.gtID].incomplete,
                      );
                    }}
                    inline={true}
                    labelPlacement="top"
                  />
                </Flex.Item>
              </Flex>
            </List.Item>
          ))}
        </List>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onDismiss} margin="small">
          Cancel
        </Button>
        <Button
          interaction={
            Object.keys(dates).length === students.length
              ? "enabled"
              : "disabled"
          }
          color="primary"
          type="submit"
        >
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  ) : null;
};
AttendanceModal.propTypes = {
  open: PropTypes.bool,
  students: PropTypes.array,
  onSubmit: PropTypes.func,
  onDismiss: PropTypes.func,
};

export default AttendanceModal;
