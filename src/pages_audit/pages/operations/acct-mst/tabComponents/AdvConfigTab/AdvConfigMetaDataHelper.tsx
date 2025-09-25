import { getGridRowData } from "components/agGridTable/utils/helper";
import { t } from "i18next";

export const handleBlurCode = async (
  value,
  node,
  api,
  accessor,
  onValueChange,
  context,
  oldValue,
  gridApiRef
) => {
  const rowData = getGridRowData(gridApiRef);
  await context.updateState("DEF_TRAN_CD", []);
  if (oldValue !== value?.value) {
    await node.setData({
      ...node.data,
      DEF_DESC: "",
      DEF_TRAN_CD: "",
      AMOUNT_UPTO: 0,
      TO_EFF_DATE: null,
      FROM_EFF_DATE: context?.gridContext?.authState?.workingDate ?? "",
    });
  }
  const currentIndex = node.rowIndex;
  const inputValue = node.data[accessor];
  let buttonName;
  // Check if the value exists in any other row (skip current row)
  const duplicateIndex = rowData.findIndex(
    (item, index) =>
      item.CODE === inputValue &&
      index !== currentIndex &&
      item.CODE !== undefined &&
      (Boolean(item?.FLAG) || item?.FLAG === "Y")
  );

  if (node.data?.CODE_OPT?.ALLOW_NEW_ENTRY === "N") {
    buttonName = await context.MessageBox({
      messageTitle: "ValidationFailed",
      message: `${node.data?.CODE_OPT?.DISPLAY_VALUE} ${t(
        "ParameterMappingIsNotAllowedFromHere"
      )}`,
      buttonNames: ["Ok"],
      icon: "ERROR",
    });
  } else if (
    node.data?.CODE_OPT?.ALLOW_DUPLICATE === "N" &&
    duplicateIndex !== -1
  ) {
    buttonName = await context.MessageBox({
      messageTitle: "ValidationFailed",
      message: `'${
        node.data?.CODE_OPT?.DISPLAY_VALUE
      }' Parameter is already mapped at Row:${duplicateIndex + 1}.`,
      buttonNames: ["Ok"],
      icon: "ERROR",
    });
  }
  if (buttonName === "Ok") {
    await node.setData({
      ...node.data,
      CODE: "",
      DISPLAY_CODE: "",
      CODE_OPT: "",
      DEF_DESC: "",
      DEF_TRAN_CD: "",
      AMOUNT_UPTO: 0,
      TO_EFF_DATE: null,
    });
    await onValueChange("");
    await api.setFocusedCell(node.rowIndex, accessor);
    await api.startEditingCell({
      rowIndex: node.rowIndex,
      colKey: accessor,
    });
  }
};

export const handleBlurFlag = async ({
  newValue,
  node,
  api,
  colDef,
  onValueChange,
  context,
  oldValue,
  gridApiRef,
}) => {
  const rowData = getGridRowData(gridApiRef);

  const currentIndex = node.rowIndex;
  const inputValue = node.data["CODE"];

  let buttonName;
  // Check if the value exists in any other row (skip current row)
  const duplicateIndex = rowData.findIndex(
    (item, index) =>
      item.CODE === inputValue &&
      index !== currentIndex &&
      item.CODE !== undefined &&
      (Boolean(item?.FLAG) || item?.FLAG === "Y")
  );

  // If duplicate found, show alert and set FLAG to false
  if (
    node.data?.CODE_OPT?.ALLOW_DUPLICATE === "N" &&
    duplicateIndex !== -1 &&
    newValue
  ) {
    buttonName = await context.MessageBox({
      messageTitle: "ValidationFailed",
      message: `'${node.data?.CODE_OPT?.DISPLAY_VALUE}' ${t(
        "ParameterIsAlreadyMappedAtRow"
      )}:${duplicateIndex + 1}.`,
      buttonNames: ["Ok"],
      icon: "ERROR",
    });
    node.setDataValue("FLAG", false);
    if (buttonName === "Ok") {
    }
  }
};
