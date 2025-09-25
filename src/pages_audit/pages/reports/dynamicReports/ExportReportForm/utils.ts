import { isValidDate } from "@acuteinfo/common-base/dist/components/utils/utilFunctions/function";
import { format } from "date-fns";

// get dynamic title including filters and params
export const getTitleFilters = (
  retrievalParams,
  filters,
  globalFilter,
  columnLabel
): string => {
  let fileTitle = "";
  if (retrievalParams.length !== 0) {
    retrievalParams.forEach((param) => {
      if (
        typeof param.value.value !== "undefined" &&
        param.value.value.toString().trim() !== ""
      ) {
        const label =
          typeof param.value.label !== "undefined"
            ? param.value.label
            : param.value.columnName;
        const value = param.value.value;
        fileTitle += label + ": " + value + " | ";
      }
    });
  }

  if (filters.length !== 0) {
    filters.forEach((filter) => {
      if (filter.value.trim() !== "")
        fileTitle += columnLabel[filter.id] + ": " + filter.value + "* | ";
    });
  }

  if (globalFilter) fileTitle += `{${globalFilter}} | `;

  fileTitle = `[${fileTitle.substring(0, fileTitle.length - 2).trim()}]`;

  return fileTitle;
};

// get dynamic rows for export report data
export const getDynamicRow = (rows: Array<object>, columns: Array<object>) => {
  const filteredRows = rows.map((row) => {
    const filteredRow = {};

    columns.forEach((column) => {
      const columnKeys = Object.keys(column);

      columnKeys.forEach((key) => {
        if (key in row) {
          if (column["cellType"] === "DateTimeCell" && isValidDate(row[key])) {
            filteredRow[key] = format(
              new Date(row[key]),
              column["format"] !== "" ? column["format"] : "dd/MM/yyyy HH:mm:ss"
            );
          } else if (
            column["cellType"] === "DateCell" &&
            isValidDate(row[key])
          ) {
            filteredRow[key] = format(
              new Date(row[key]),
              column["format"] !== "" ? column["format"] : "dd/MM/yyyy"
            );
          } else
            filteredRow[key] = typeof row[key] === "undefined" ? "" : row[key];
        } else {
          if (!["id", "cname", "cellType", "format"].includes(key))
            filteredRow[key] = "";
        }
      });
    });
    return filteredRow;
  });
  return filteredRows;
};
