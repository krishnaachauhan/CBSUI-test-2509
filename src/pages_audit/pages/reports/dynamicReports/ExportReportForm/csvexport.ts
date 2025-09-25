//@ts-nocheck
export const exportToCsv = ({
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
  let output = "";
  //  filter columns based on selected column names
  columns = columns.filter((column: { id: number }) =>
    columnsSelected.includes(column.id)
  );

  // get filter date [from/to]
  const { fromDt, toDt } = getRetrievalParaDate(retrievalParams);

  // get all applied filters/params for title
  let fileTitle = getTitleFilters(
    retrievalParams,
    filters,
    globalFilter,
    columnLabel
  );

  const headers = columns.map((d: { cname: any }) => d.cname);

  // get dynamic row w.r.t column selected
  const filteredRows = getDynamicRow(rows, columns);

  const csvTitle = Papa.unparse([[`${title} ${fileTitle}`]]);
  const csvHeader = Papa.unparse([headers]);
  const csvData = Papa.unparse(filteredRows, { header: false });

  // output += `${title} ${fileTitle}\r\n`;

  output += csvTitle + "\r\n" + csvHeader + "\r\n" + csvData;

  const csvBlob = new Blob([output], { type: "text/csv" });

  return { downloadTitle: `${title} ${fromDt}-${toDt}.csv`, blob: csvBlob };
};
