import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { IconWarningSolid } from "@instructure/ui-icons";
import { Spinner } from "@instructure/ui-spinner";
import { Table } from "@instructure/ui-table";
import { Text } from "@instructure/ui-text";

const SortedTable = (props) => {
  const headers = [
    {
      id: "name",
      text: "Name",
    },
    {
      id: "gtID",
      text: "GTID",
    },
    {
      id: "sisSectionID",
      text: "Section",
    },
    {
      id: "canvasGrade",
      text: "Canvas Grade",
      align: "end",
      renderCell: (grade) =>
        grade ? (
          grade == "loading" ? (
            <Spinner size="x-small" renderTitle="Loading Canvas Grade" />
          ) : (
            <Text>{grade}</Text>
          )
        ) : (
          "-"
        ),
    },
    {
      id: "bannerGrade",
      text: "Banner Grade",
      align: "end",
      renderCell: (grade) => {
        switch (grade) {
          case null:
            return (
              <Spinner size="x-small" renderTitle="Loading Banner Grade" />
            );
          case "?":
            return <IconWarningSolid color="error" />;
          default:
            return <Text>{grade}</Text>;
        }
      },
    },
  ];

  const [sortBy, setSortBy] = useState(headers[0].id);
  const [direction, setDirection] = useState("ascending");

  const renderHeaderRow = (dir) => {
    return (
      <Table.Row>
        {headers.map(({ id, text, align }) => (
          <Table.ColHeader
            key={id}
            id={id}
            textAlign={align || "start"}
            stackedSortByLabel={text}
            onRequestSort={handleSort}
            sortDirection={id === sortBy ? dir : "none"}
          >
            {text}
          </Table.ColHeader>
        ))}
      </Table.Row>
    );
  };

  const handleSort = (event, { id }) => {
    if (id === sortBy) {
      setDirection((cur) => (cur === "ascending" ? "descending" : "ascending"));
    } else {
      setSortBy(id);
      setDirection("ascending");
    }
  };

  const sortedRows = [...(props.rows || [])].sort((a, b) => {
    const [c, d] = direction === "ascending" ? [a, b] : [b, a];
    if (c[sortBy] < d[sortBy]) {
      return -1;
    }
    if (c[sortBy] > d[sortBy]) {
      return 1;
    }
    return 0;
  });

  return (
    <Table layout={props.layout} caption="Grades Table">
      <Table.Head renderSortLabel="Sort by">
        {renderHeaderRow(direction)}
      </Table.Head>
      <Table.Body>
        {sortedRows.map((row) => (
          <Table.Row key={`${row.gtID}/${row.sisSectionID}`}>
            {headers.map(({ id, align, renderCell }) => (
              <Table.Cell key={id} textAlign={align || "start"}>
                {renderCell ? renderCell(row[id]) : row[id]}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};
SortedTable.propTypes = {
  rows: PropTypes.array,
  layout: PropTypes.string,
  gradeMode: PropTypes.string,
};

export default SortedTable;
