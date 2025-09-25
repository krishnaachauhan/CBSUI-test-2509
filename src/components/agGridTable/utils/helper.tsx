import { format, isBefore, isValid, parse, startOfDay } from "date-fns";
import { isEmpty } from "lodash";
import { t } from "i18next";

const getAgGridSRNo = ({ node, api, column }) => {
  if (node.rowPinned) return "";

  //TODO : Show Arrow on current editable row
  // const focusedCell = api.getFocusedCell();
  // const isFocused = focusedCell?.rowIndex === node.rowIndex;

  // return isFocused ? (
  //   <span>
  //     <strong>{">>>"}</strong>
  //   </span>
  // ) : (
  return <div style={{ textAlign: "center" }}> {node.rowIndex + 1}</div>;
  // );
};

const float = (value: string | number): number => {
  let val: number;

  if (typeof value === "string") {
    val = Number(value?.replace(/,/g, "")); // Remove commas and convert to number
  } else {
    val = value; // Already a number
  }

  return !Number.isNaN(val)
    ? parseFloat(val?.toFixed(Number(process.env.SYSTEM_DECIMAL_LENGTH) || 3))
    : 0;
};

const customCellAggFunc = (params) => {
  let sum = params?.values?.reduce((a, b) => (a += float(b)), 0);

  return float(sum);
};

const parseDate = (dateValue: any): Date | null => {
  if (!dateValue) return null;

  if (typeof dateValue === "string") {
    // Try 'dd/MMM/yyyy' first
    let parsed = parse(dateValue, "dd/MMM/yyyy", new Date());
    if (isValid(parsed)) return parsed;

    // Fallback to 'dd/MM/yyyy'
    parsed = parse(dateValue, "dd/MM/yyyy", new Date());
    if (isValid(parsed)) return parsed;

    parsed = parse(dateValue, "yyyy-MM-dd HH:mm:ss.S", new Date());
    if (isValid(parsed)) return parsed;

    return null;
  }

  const parsedDate = new Date(dateValue);
  return isValid(parsedDate) ? parsedDate : null;
};

const findLastDisplayColumn = (gridApi, params) => {
  if (gridApi) {
    const displayedColumns = gridApi?.current
      ?.getAllDisplayedColumns()
      ?.filter((col) => {
        const { editable } = col?.colDef;
        if (typeof editable === "function") {
          return editable(params);
        }
        return editable === true;
      });

    if (!displayedColumns?.length) return;

    // Return the last displayed editable column
    return displayedColumns[displayedColumns?.length - 1];
  }
};

const findFirstDisplayColumn = (gridApi, params) => {
  if (gridApi) {
    const displayedColumns = gridApi?.current
      ?.getAllDisplayedColumns()
      ?.filter((col) => {
        const { editable } = col?.colDef;
        if (typeof editable === "function") {
          return editable(params);
        }
        return editable === true;
      });

    if (!displayedColumns?.length) return;
    return displayedColumns?.[0];
  }
};

const getGridRowData = (gridApi): any[] => {
  if (!gridApi?.current) return [];

  const rowData: any[] = [];
  gridApi?.current?.forEachNode((node) => {
    const { loader, ...rest } = node?.data || {};
    rowData.push(rest);
  });

  return rowData;
};

const removeExistingRowData = async (gridApi) => {
  const rowData = getGridRowData(gridApi);
  if (rowData.length > 0) {
    await gridApi.current.applyTransaction({ remove: rowData });
  }
};

const dynamicRowHeight = (errors, params) => {
  if (errors?.length > 0 && errors?.some((item) => item?.touched === true)) {
    params.api?.getRowNode(params.node?.id)?.setRowHeight(45);
    params.api?.onRowHeightChanged();
  } else {
    params.api?.getRowNode(params.node?.id)?.setRowHeight(30);
    params.api?.onRowHeightChanged();
  }
};

const displayNumber = (num) => {
  return !isNaN(num) ? `₹ ${num.toFixed(2)}` : 0.0;
};

const lessThanDate = (
  factValue,
  jsonValue,
  options?: { ignoreTime: boolean }
) => {
  if (typeof factValue === "string") {
    factValue = parse(factValue, "dd/MM/yyyy", new Date());
  }
  if (typeof jsonValue === "string") {
    jsonValue = parse(jsonValue, "dd/MMM/yyyy", new Date());
  }
  if (options?.ignoreTime) {
    factValue = startOfDay(factValue);
    jsonValue = startOfDay(jsonValue);
  }
  return isBefore(factValue, jsonValue);
};

const setErrorMessage = (node, field, message = "") => {
  const existingErrors = node.data?.errors || [];

  const updatedErrors = [
    ...existingErrors.filter((err) => err?.field !== field),
    {
      field,
      message: message,
    },
  ];

  node.setData({
    ...node.data,
    errors: updatedErrors,
  });
};

const handleDeleteButtonClick = async (params) => {
  const {
    context,
    node,
    api,
    colDef: { keepOneRowOnDelete = true },
  } = params;

  const rowData: any[] = [];
  api.forEachNode((node) => rowData.push(node.data));

  if (rowData.length === 1 && keepOneRowOnDelete) {
    await context.MessageBox({
      messageTitle: "Delete Row",
      message: "You can not delete last row.",
      icon: "ERROR",
      buttonNames: ["Ok"],
    });
  } else {
    let res = await context.MessageBox({
      messageTitle: "confirmation",
      message: "Are you sure want to delete row ?",
      buttonNames: ["Yes", "No"],
      defFocusBtnName: "Yes",
      icon: "CONFIRM",
    });
    if (res === "Yes") {
      api.applyTransaction({ remove: [node.data] });
      context.updatePinnedBottomRow();
    }
  }
};
type UpdateNodeOptions = {
  isFieldFocused?: boolean;
  focusedAccessor?: string;
};

const updateNodeDataAndFocus = async (
  node: any,
  updatedData: Record<string, any>,
  api?: any,
  options: UpdateNodeOptions = {}
) => {
  node.setData({ ...node.data, ...updatedData });

  if (options.isFieldFocused && options.focusedAccessor) {
    await api.setFocusedCell(node.rowIndex, options.focusedAccessor);
    await api.startEditingCell({
      rowIndex: node.rowIndex,
      colKey: options.focusedAccessor,
    });
  }
};

const knownFormats = [
  "dd/MM/yyyy",
  "yyyy-MM-dd",
  "yyyy-MM-dd HH:mm:ss.S",
  "yyyy-MM-dd HH:mm:ss",
  "MM/dd/yyyy",
  "dd-MM-yyyy",
];

const getFormattedDate = (value, displayFormat = "dd/MM/yyyy") => {
  if (!value || typeof value !== "string" || isEmpty(value)) return null;

  let parsedDate;

  for (const fmt of knownFormats) {
    parsedDate = parse(value, fmt, new Date());
    if (isValid(parsedDate)) break;
  }

  // Fallback to native parser if none of the formats matched
  if (!isValid(parsedDate)) {
    const nativeDate = new Date(value);
    parsedDate = isValid(nativeDate) ? nativeDate : null;
  }

  return parsedDate ? format(parsedDate, displayFormat) : value;
};

//* Display Error and Focus on First error cell
const displayCommonErrorOnSubmit = async (gridRef, MessageBox) => {
  const buttonName = await MessageBox({
    message: t("PleaseFillInAllRequiredFieldsWithValidInformationToProceed"),
    messageTitle: t("ValidationFailed"),
    icon: "ERROR",
  });
  if (buttonName === "Ok") {
    let rowErrors: any[] = [];
    gridRef.current?.forEachNode((node, index) => {
      const { errors = [] } = node.data || {};
      errors?.forEach((error) => {
        rowErrors.push({
          ...error,
          rowIndex: node?.rowIndex,
        });
      });
    });

    const firstError = rowErrors[0];
    if (firstError) {
      const rowIndex = firstError?.rowIndex;

      const colKey = firstError?.field;

      //* Focus the first error cell and start editing
      gridRef.current?.setFocusedCell(rowIndex, colKey);
      gridRef.current?.startEditingCell({
        rowIndex,
        colKey,
      });
    }
  }
};

const trimString = (val) => {
  return val.replace("*", "").trim();
};

const validateGridRow = async (
  payloadArray,
  requiredFields,
  MessageBox,
  gridApiRef
) => {
  const missingFieldsWithIndex: any = [];

  payloadArray?.forEach((payload, index) => {
    const missingField = requiredFields.find(
      (field) =>
        !(field in payload) ||
        payload[field] === null ||
        payload[field] === undefined ||
        (typeof payload[field] === "string" && payload[field].trim() === "") ||
        (typeof payload[field] === "number" && isNaN(payload[field]))
    );

    if (missingField) {
      missingFieldsWithIndex.push({ index, missingField });
    }
  });
  if (missingFieldsWithIndex?.length > 0) {
    const buttonName = await MessageBox({
      message: t("PleaseFillInAllRequiredFieldsWithValidInformationToProceed"),
      messageTitle: t("ValidationFailed"),
      icon: "ERROR",
    });
    if (buttonName === "Ok") {
      const firstError = missingFieldsWithIndex[0];
      if (firstError) {
        const rowIndex = firstError?.index;

        const colKey = firstError?.missingField;

        //* Focus the first error cell and start editing
        gridApiRef.current?.setFocusedCell(rowIndex, colKey);
        gridApiRef.current?.startEditingCell({
          rowIndex,
          colKey,
        });
      }
      return missingFieldsWithIndex;
    }
    return missingFieldsWithIndex;
  }
};

const validateGridAndGetData = (
  gridApi
): { rowData: any[]; isError: boolean } | null => {
  if (!gridApi.current) return { rowData: [], isError: false };

  const rowData: any[] = [];
  let hasErrors = false;

  gridApi.current?.forEachNode((node) => {
    const filterError =
      node.data?.errors?.length > 0
        ? node.data?.errors.filter((err) => {
            const val = node?.data[err?.field];
            return val === null || val === undefined || val === "";
          })
        : [];
    // mark all errors as touched
    if (filterError?.length > 0) {
      node.data.errors = filterError?.map((err) => ({
        ...err,
        touched: true,
      }));

      node.setDataValue("errors", node.data?.errors);

      hasErrors = true;
    }

    const { loader, ...rest } = node.data || {};
    rowData.push(rest);
  });
  gridApi.current?.refreshCells({ force: true });

  return { rowData: rowData, isError: hasErrors };
};

const generateInitialErrors = (columnDefs: any[]): any[] => {
  const errors: any[] = [];

  columnDefs?.forEach((col) => {
    if (col?.schemaValidation && Array.isArray(col?.schemaValidation?.rules)) {
      col.schemaValidation?.rules?.forEach((rule) => {
        errors.push({
          field: col?.field,
          message: rule.params?.[0] || "ValidationError",
          touched: false,
        });
      });
    }
  });

  return errors;
};

const setAgGridRowData = (gridApiRef, rowData) => {
  const allColumns = gridApiRef.current?.getColumnDefs();
  let errors = generateInitialErrors(allColumns);

  const formattedRowData = rowData?.map((rest) => {
    const matchedErrors: any[] = [];

    errors?.forEach((err) => {
      const val = rest[err?.field];
      const isMissing =
        !rest.hasOwnProperty(err?.field) ||
        val === null ||
        val === undefined ||
        val === "";

      if (isMissing) {
        matchedErrors.push(err);
      }
    });

    return {
      ...rest,
      errors: matchedErrors,
    };
  });

  gridApiRef?.current?.setGridOption("rowData", formattedRowData);
};

export {
  getAgGridSRNo,
  customCellAggFunc,
  parseDate,
  findLastDisplayColumn,
  findFirstDisplayColumn,
  getGridRowData,
  removeExistingRowData,
  dynamicRowHeight,
  displayNumber,
  lessThanDate,
  setErrorMessage,
  handleDeleteButtonClick,
  updateNodeDataAndFocus,
  getFormattedDate,
  displayCommonErrorOnSubmit,
  trimString,
  validateGridRow,
  validateGridAndGetData,
  generateInitialErrors,
  setAgGridRowData,
};
