import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Table } from "@instructure/ui-table";
import canvasLTIFixHeight from "../canvasLTIFixHeight.js";

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
      id: "currentGrade",
      text: "Canvas Grade",
      align: "end",
    },
    {
      id: "bannerGrade",
      text: "Banner Grade",
      align: "end",
    },
  ];

  useEffect(() => {
    canvasLTIFixHeight(50);
  });

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
    <Table layout={props.layout}>
      <Table.Head renderSortLabel="Sort by">
        {renderHeaderRow(direction)}
      </Table.Head>
      <Table.Body>
        {sortedRows.map((row) => (
          <Table.Row
            key={`${row.gtID}/${row.sisSectionID}`}
            background={row.bannerGrade === "?" ? "warning" : "white"}
          >
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
};

export default SortedTable;
