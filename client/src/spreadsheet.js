import spreadsheetInstructions from "./spreadsheetInstructions.js";

export default async (title, grades, sectionTitles, gradeMode, filename) => {
  const sheet = [];

  // Add the "header" row to the sheet
  sheet.push([
    "Term Code",
    "CRN",
    "Full Name",
    "Student ID",
    "Confidential",
    "Course",
    "Section",
    title,
    "Last Attended Date",
    "Override",
    "Narrative Grade Comment",
  ]);

  // Add a row for each student
  grades.forEach((item) => {
    const termCode = item.sisSectionID ? item.sisSectionID.slice(0, 6) : null;
    const crn = item.sisSectionID ? item.sisSectionID.slice(7) : null;
    const confidential = item.name === "Confidential" ? "Yes" : "No";
    const lastAttended = ""; // data is in SIS, so punt here
    const override = item.override;
    sheet.push([
      termCode,
      crn,
      item.name,
      { v: item.gtID, t: "s" },
      confidential,
      item.course,
      sectionTitles[item.sisSectionID],
      gradeMode === "M" ? item.currentGrade : item.finalGrade,
      lastAttended,
      override,
      null,
    ]);
  });

  // Add the instruction sheet
  const { default: xlsx } = await import(
    /* webpackChunkName: "xlsx" */ "xlsx/dist/xlsx.full.min.js"
  );
  const instructionSheet = xlsx.utils.aoa_to_sheet(spreadsheetInstructions);
  const workSheet = xlsx.utils.aoa_to_sheet(sheet);
  const workBook = xlsx.utils.book_new();
  if (!workBook.Props) workBook.Props = {};
  workBook.Props.Title = "PROTECTEDFERPA2rsPUvcxswWAgYKkKoIwCA";
  xlsx.utils.book_append_sheet(workBook, workSheet, "Grades");
  xlsx.utils.book_append_sheet(workBook, instructionSheet, "Instructions");

  xlsx.writeFile(workBook, filename);
};
