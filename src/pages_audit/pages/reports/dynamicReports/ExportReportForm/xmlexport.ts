//@ts-nocheck
export const exportToXml = ({
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

  const filteredRows = getDynamicRow(rows, columns);

  // const xmlString = js2xmlparser(
  //   "XmlData_root",
  //   { XmlData_row: filteredRows },
  //   {
  //     declaration: { encoding: "UTF-8" },
  //   }
  // );

  const xmlString = jstoxml.toXML(
    { XmlData_root: filteredRows.map((d) => ({ XmlData_row: d })) },
    {
      header: true,
    }
  );

  const blob = new Blob([xmlString], { type: "application/xml" });

  return { downloadTitle: `${title} ${fromDt}-${toDt}.xml`, blob };
};
