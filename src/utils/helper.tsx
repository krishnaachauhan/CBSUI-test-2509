import { utilFunction } from "@acuteinfo/common-base";
import { lessThanDate } from "components/agGridTable/utils/helper";
import { isValid, parse } from "date-fns";
import { t } from "i18next";

const validateChequeDate = (params) => {
  const { colDef, value } = params;
  const allField = params.context?.gridContext?.dateData?.[0] || {};

  const currentDate = parse(params.value, "dd/MM/yyyy", new Date());
  const rangeDate = new Date(allField?.RANGE_FROM_DT);
  const transDate = new Date(allField?.TRAN_DATE);
  if (Boolean(params?.value) && !isValid(currentDate)) {
    return "Mustbeavaliddate";
  }
  if (!isValid(rangeDate) || !isValid(transDate)) {
    return "";
  }
  if (lessThanDate(value, allField?.authState?.minDate)) {
    return "Date is out of period. Check Global level Parameter 11.";
  }
  if (currentDate < rangeDate || currentDate > transDate) {
    return (
      t("DateShouldBetween") +
      " " +
      rangeDate.toLocaleDateString("en-IN") +
      " " +
      t("To") +
      " " +
      transDate.toLocaleDateString("en-IN")
    );
  }
};
const checkDateGlobalPara = ({ node, api, value, colDef, context }) => {
  const allField =
    context?.gridContext?.dateData?.[0] || context?.gridContext || {};
  //TODO: pending to set validation
  // const currentDate = parse(value, "dd/MM/yyyy", new Date());
  // if (Boolean(value) && !isValid(currentDate)) {
  //   return "Mustbeavaliddate";
  // }

  if (lessThanDate(value, allField?.authState?.minDate, { ignoreTime: true })) {
    node.setData({
      ...node.data,
      [colDef.field]: "",
    });
    // api.setFocusedCell(node.rowIndex, colDef.field);
    // api.startEditingCell({
    //   rowIndex: node.rowIndex,
    //   colKey: colDef.field,
    // });
    return "Date is out of period. Check Global level Parameter 11.";
  }
};

const allowNumberLength = ({ floatValue }, numberLen = 999) => {
  if (floatValue === undefined) return true;
  return floatValue <= numberLen;
};

const commonDateValidator = (
  { value, node, api, colDef, context },
  requireMessage = ""
) => {
  const errorMessage = checkDateGlobalPara({
    node,
    api,
    value,
    colDef,
    context,
  });
  const error =
    !value && requireMessage
      ? requireMessage
      : value && !utilFunction.isValidDate(utilFunction.getParsedDate(value))
      ? "Mustbeavaliddate"
      : errorMessage
      ? errorMessage
      : undefined;
  return error;
};
export {
  validateChequeDate,
  checkDateGlobalPara,
  allowNumberLength,
  commonDateValidator,
};
