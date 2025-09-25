import { components, filters } from "@acuteinfo/common-base";
import { format } from "date-fns";

export const parseAndReplaceComponents = (jsonString) => {
  try {
    // Parse the JSON string into a JavaScript object
    const metadata = jsonString;

    // Map the full component paths to the actual imported components
    const componentMap = {
      "components.DateTimeCell": components.DateTimeCell,
      "components.DateCell": components.DateCell,
      "components.NumberCell": components.NumberCell,
      "components.ButtonRowCell": components.ButtonRowCell,
    };

    const filterMap = {
      "filters.DefaultColumnFilter": filters.DefaultColumnFilter,
      "filters.NumberRangeColumnFilter": filters.NumberRangeColumnFilter,
      "filters.SelectColumnFilter": filters.SelectColumnFilter,
      "filters.SliderColumnFilter": filters.SliderColumnFilter,
    };

    // Replace string component references with actual component imports
    if (Array.isArray(metadata.columns)) {
      metadata.columns = metadata.columns.map((column) => {
        if (
          column.Cell === "components.DateTimeCell" &&
          !Boolean(column?.format)
        ) {
          column["format"] = "dd/MM/yyyy HH:mm:ss";
        }
        if (column.Cell && typeof column.Cell === "string") {
          // Replace with actual component from the map if it exists
          column.Cell = componentMap[column.Cell] || column.Cell;
        }
        if (column.Filter && typeof column.Filter === "string") {
          // Replace with actual component from the map if it exists
          column.Filter = filterMap[column.Filter] || column.Filter;
        }

        if (typeof column.shouldExclude === "string") {
          // Convert the string into an actual function
          column.shouldExclude = new Function(
            "...arg", // Spread operator for flexible argument length
            `
                return (${column.shouldExclude})(...arg);
              `
          );
        }
        return column;
      });
    }

    return metadata;
  } catch (error) {
    console.error("Error parsing JSON string or replacing components:", error);
    return null; // Return null or handle error as needed
  }
};

export const parseAndReplaceDefaultFilter = (jsonArray) => {
  return jsonArray.map((item) => {
    // Iterate through each object and its nested 'value' property
    if (item.value) {
      for (let key in item.value) {
        if (item.value.hasOwnProperty(key)) {
          let value = item.value[key];

          // Check and convert string booleans to actual boolean
          if (typeof value === "string" && value.toLowerCase() === "true") {
            item.value[key] = true;
          } else if (
            typeof value === "string" &&
            value.toLowerCase() === "false"
          ) {
            item.value[key] = false;
          }

          // Check for "new Date()" string and replace it with actual Date object
          if (value === "new Date()") {
            item.value[key] = new Date().toString();
          }
        }
      }
    }
    return item;
  });
};

export const convertBooleanStrings = (obj) => {
  if (typeof obj !== "object" || obj === null) return obj;
  const convertedObj = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (typeof value === "object") {
        // Recursively convert nested objects or arrays
        convertedObj[key] = convertBooleanStrings(value);
      } else if (value === "true") {
        convertedObj[key] = true;
      } else if (value === "false") {
        convertedObj[key] = false;
      } else {
        convertedObj[key] = value;
      }
    }
  }
  return convertedObj;
};

export function normalizeAndFormatDates(obj) {
  const rawFrom = obj.FROM_DT || obj.A_FROM_DT;
  const rawTo = obj.TO_DT || obj.A_TO_DT;

  const normalized = {
    ...obj,
  };

  if (rawFrom) {
    normalized.A_FROM_DT = format(new Date(rawFrom), "dd/MMM/yyyy");
  } else {
    delete normalized.FROM_DT;
  }

  if (rawTo) {
    normalized.A_TO_DT = format(new Date(rawTo), "dd/MMM/yyyy");
  } else {
    delete normalized.TO_DT;
  }

  // delete normalized.A_FROM_DT;
  // delete normalized.A_TO_DT;

  return normalized;
}

export const getFilteredDataByScroll = (data, flag = "VT") => {
  const scrollGroups: Record<string, any> = {};
  const matchingEntries: any[] = [];
  const nonMatchingEntries: any[] = [];

  if (Array.isArray(data) && data.length) {
    data.forEach((row) => {
      const scrollKey = row.SCROLL1?.trim?.() || "";

      if (!scrollGroups[scrollKey]) {
        scrollGroups[scrollKey] = {
          rows: [],
          totalDR: 0,
          totalCR: 0,
        };
      }

      const dr = parseFloat(row.DR_AMT);
      const cr = parseFloat(row.CR_AMT);

      scrollGroups[scrollKey].rows.push(row);
      scrollGroups[scrollKey].totalDR += dr;
      scrollGroups[scrollKey].totalCR += cr;
    });

    Object.values(scrollGroups).forEach((group: any) => {
      if (group.totalDR === group.totalCR) {
        matchingEntries.push(...group.rows);
      } else {
        nonMatchingEntries.push(...group.rows);
      }
    });
  }

  return flag === "VT" ? matchingEntries : nonMatchingEntries;
};

export const getFilteredData1234 = (data, flag = "ALL") => {
  const matchingEntries: any[] = [];

  if (Array.isArray(data) && data.length) {
    data.forEach((row) => {
      row?.NPA_CD.trim() !== row?.ELIGIBLE_NPA_CD?.trim() &&
        matchingEntries.push(row);
    });

    return flag === "ALL" ? matchingEntries : data;
  }
};
