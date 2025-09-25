// check valid date
const isValidDate = (dat) => {
  try {
    if (!dat) {
      return false;
    } else {
      let dt = new Date(dat);

      if (!isNaN(dt) && dt < new Date("1900/01/01")) {
        return false;
      } else if (!isNaN(dt)) {
        return true;
      }
      return false;
    }
  } catch (error) {
    return false;
  }
};

// get retrieval param dates
const getRetrievalParaDate = (retrievalParams) => {
  const from_to_date = retrievalParams.filter(
    (item) => item.id === "A_FROM_DT" || item.id === "A_TO_DT"
  );
  const fromDt = from_to_date[0]?.value?.value ?? "";
  const toDt = from_to_date[1]?.value?.value ?? "";

  return { fromDt, toDt };
};

// get title for report file
const getTitleFilters = (
  retrievalParams,
  filters,
  globalFilter,
  columnLabel
) => {
  let fileTitle = "";
  if (retrievalParams.length !== 0) {
    retrievalParams.forEach((param) => {
      if (
        typeof param.value.value !== "undefined" &&
        param.value.value.toString().trim() !== ""
      ) {
        const label = Boolean(param.value?.label)
          ? param.value.label
          : param.value.columnName;
        let value = Boolean(param.value?.displayValue)
          ? param.value.displayValue
          : param.value.value;
        if (param.value?.type === "date") {
          if (Array.isArray(value)) {
            value = value.map((date) => {
              return isValidDate(date)
                ? dateFns.format(new Date(date), "DD/MM/YYYY")
                : date;
            });
          } else {
            if (isValidDate(value)) {
              value = dateFns.format(new Date(value), "DD/MM/YYYY");
            }
          }
        }
        fileTitle += label + ": " + value + " | ";
      }
    });
  }

  if (filters.length !== 0) {
    filters.forEach((filter) => {
      if (filter?.value?.type !== "multi-select") {
        let filterValue = filter.value.label
          ? filter.value.label
          : typeof filter.value === "object"
          ? filter.value.value
          : filter.value;
        if (filterValue instanceof Date) {
          filterValue = dateFns.format(filterValue, "DD/MM/YYYY HH:mm:ss");
        }
        if (Array.isArray(filterValue)) {
          fileTitle +=
            (columnLabel[filter.id] ?? filter?.value?.columnName) +
            " " +
            (filter.value?.condition ?? "") +
            ": ";
          filterValue.forEach((value, index) => {
            //check if string is date
            let updatedValue =
              isNaN(Number(value)) && !isNaN(new Date(value).getTime())
                ? dateFns.format(new Date(value), "DD/MM/YYYY")
                : value;
            if (updatedValue instanceof Date)
              updatedValue = dateFns.format(updatedValue, "DD/MM/YYYY");
            fileTitle += updatedValue;
            fileTitle += index !== filterValue.length - 1 ? ", " : "";
          });
          fileTitle += " | ";
        } else {
          if (filterValue.trim() !== "")
            fileTitle +=
              columnLabel[filter.id] +
              " " +
              (!filter?.value?.showType ? filter.value?.condition ?? "" : "") +
              ": " +
              filterValue +
              "* | ";
        }
      }
    });
  }

  if (globalFilter) fileTitle += `{${globalFilter}} | `;

  fileTitle = `[${fileTitle.substring(0, fileTitle.length - 2).trim()}]`;

  return fileTitle === "[]" ? "" : fileTitle;
};

// get dynmaic row mapping columns and rows
const getDynamicRow = (rows, columns, exportType) => {
  const filteredRows = rows.map((row) => {
    const filteredRow = {};

    columns.forEach((column) => {
      const columnKeys = Object.keys(column);

      columnKeys.forEach((key) => {
        if (key in row) {
          if (column["cellType"] === "DateTimeCell" && isValidDate(row[key])) {
            filteredRow[key] = dateFns.format(
              new Date(row[key]),
              column.format !== ""
                ? getUcaseDateFormats(column.format)
                : "DD/MM/YYYY HH:mm:ss"
            );
          } else if (
            column["cellType"] === "DateCell" &&
            isValidDate(row[key])
          ) {
            filteredRow[key] = dateFns.format(
              new Date(row[key]),
              column.format !== ""
                ? getUcaseDateFormats(column.format)
                : "DD/MM/YYYY"
            );
          } else if (
            column["cellType"] === "TimeCell" &&
            isValidDate(row[key])
          ) {
            filteredRow[key] = dateFns.format(new Date(row[key]), "HH:mm:ss");
          } else if (
            column["cellType"] === "currency" &&
            exportType !== "PDF" &&
            exportType !== "CSV"
          ) {
            filteredRow[key] =
              column.format +
              " " +
              new Intl.NumberFormat("en-IN").format(row[key]);
          } else
            filteredRow[key] = typeof row[key] === "undefined" ? "" : row[key];
        } else {
          if (
            ![
              "id",
              "__srno__",
              "cname",
              "cellType",
              "format",
              "isAutoSequence",
            ].includes(key)
          )
            filteredRow[key] = "";
        }
      });
    });
    return filteredRow;
  });
  return filteredRows;
};

const getUcaseDateFormats = (format) => {
  const pattern = /.*[dDMyY].*/;

  if (!pattern.test(format)) return format;

  const formatArr = format.split(" ");
  formatArr[0] = formatArr[0].toUpperCase();

  return formatArr.join(" ");
};
