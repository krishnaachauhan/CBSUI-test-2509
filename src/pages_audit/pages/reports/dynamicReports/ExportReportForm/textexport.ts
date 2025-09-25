//@ts-nocheck
export const exportToText = ({
  title,
  columns,
  rows,
  columnsSelected,
  data,
  auth,
  retrievalParams,
  filters,
  globalFilter,
  columnLabel,
}) => {
  //  filter columns based on selected column names
  columns = columns.filter((column: { id: number }) =>
    columnsSelected.includes(column.id)
  );

  // get filter date [from/to]
  const { fromDt, toDt } = getRetrievalParaDate(retrievalParams);

  const headers = columns.map((d: { cname: any }) => d.cname);
  const filteredRows = getDynamicRow(rows, columns);

  let textString = "";

  headers.forEach((header: string) => {
    textString += `${header}\t`;
  });
  textString += `\n`;

  filteredRows.forEach((json) => {
    const rows = Object.values(json);
    rows.forEach((data) => {
      textString += `${data}\t`;
    });
    textString += `\n`;
  });

  const blob = new Blob([textString], { type: "text/plain" });
  return { downloadTitle: `${title} ${fromDt}-${toDt}.txt`, blob };
};
