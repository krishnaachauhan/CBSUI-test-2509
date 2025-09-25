//@ts-nocheck
export const exportToHtml = ({
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

  let fileTitle: string = getTitleFilters(
    retrievalParams,
    filters,
    globalFilter,
    columnLabel
  );

  const headers = columns.map((d: { cname: any }) => d.cname);
  const filteredRows = getDynamicRow(rows, columns);

  let html = `
    <header>
      ${data.show_header ? `<h1>${auth?.companyName}</h1>` : ""}
      <p class="report-title">${title} ${fileTitle}</p>
    </header>
    <table><thead><tr>`;

  headers.forEach((header: string) => {
    html += `<th>${header}</th>`;
  });

  html += `</tr></thead><tbody>`;

  filteredRows.forEach((json) => {
    const rows = Object.values(json);
    html += `<tr>`;
    rows.forEach((data) => {
      if (typeof data === "undefined") {
        data = "";
      }
      html += `<td>${data}</td>`;
    });
    html += `</tr>`;
  });

  html += `</tbody></table></div>`;

  html =
    `
    <style>
      body {
        font-family: sans-serif;
        overflow-x: auto
      }
      header {
        text-align: center
      }
      h1 {
        color: #800000;
      }
      .report-title {
        max-width: 100%;
        word-wrap: break-word;
      }
      table {
        border-collapse: collapse;
        width: 100%;
      }
      th, td {
        white-space: nowrap;
        padding: 8px;
        text-align: left;
        border: 1px solid #ddd;
      }
      th {
        background-color: #800000;
        color: #fff;
      }
      tr:nth-child(even) {
        background-color: #f1f1f1
      }
    </style>
    ` + html;

  const blob = new Blob([html], { type: "text/html" });

  return { downloadTitle: `${title} ${fromDt}-${toDt}.html`, blob };
};
