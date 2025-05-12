import React from "react";
import PropTypes from "prop-types";
import { DateInput2 } from "@instructure/ui-date-input";

const AttendanceDate = ({ name, onChange, value }) => {
  const months = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];

  return (
    <DateInput2
      onChange={onChange}
      renderLabel={name}
      screenReaderLabels={{
        calendarIcon: "Calendar",
        nextMonthButton: "Next month",
        prevMonthButton: "Previous month",
      }}
      value={value}
      invalidDateErrorMessage="Invalid date"
      isRequired={true}
      dateFormat={{
        parser: (input) => {
          if (input === "") {
            return "";
          }
          const [day, month, year] = input.split(/[,.\s/.-]+/);
          if (!month) {
            return "";
          }
          const newDate = new Date(
            year,
            months.indexOf(month.toLowerCase()),
            day,
          );
          return isNaN(newDate) ? "" : newDate;
        },
        formatter: (date) => {
          const year = date.getFullYear();
          const month = months[date.getMonth()];
          const day = `${date.getDate()}`.padStart(2, "0");
          return `${day}-${month}-${year}`;
        },
      }}
    />
  );
};
AttendanceDate.propTypes = {
  name: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
};

export default AttendanceDate;
