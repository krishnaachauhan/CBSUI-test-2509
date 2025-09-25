import { getGridRowData } from "components/agGridTable/utils/helper";
import { t } from "i18next";

const handleBlurDocument = async (
  value,
  node,
  api,
  accessor,
  onValueChange,
  context,
  gridApiRef
) => {
  const rowData = getGridRowData(gridApiRef);
  const currentIndex = node.rowIndex;
  const inputValue = node.data[accessor];

  // Check if the value exists in any other row (skip current row)
  const duplicateIndex = rowData.findIndex(
    (item, index) =>
      item.TEMPLATE_CD === inputValue &&
      index !== currentIndex &&
      item.TEMPLATE_CD !== undefined
  );

  if (duplicateIndex !== -1) {
    const buttonName = await context.MessageBox({
      messageTitle: "Alert",
      message: `${t("DocumentIsAlreadyEnteredAtRow")}:${
        duplicateIndex + 1
      }. ${t("PleaseEnterAnotherValue")}.`,
      buttonNames: ["Ok"],
      icon: "WARNING",
    });

    if (buttonName === "Ok") {
      await node.setData({
        ...node.data,
        DOCUMENT_TYPE: "",
        TEMPLATE_CD: "",
        DISPLAY_TEMPLATE_CD: "",
        TEMPLATE_CD_OPT: "",
      });
      await onValueChange("");
      await api.setFocusedCell(node.rowIndex, accessor);
      await api.startEditingCell({
        rowIndex: node.rowIndex,
        colKey: accessor,
      });
    }
  } else {
    node.setData({
      ...node.data,
      DOCUMENT_TYPE: node?.data?.TEMPLATE_CD_OPT?.DOC_TYPE ?? "",
      DISPLAY_DOCUMENT_TYPE:
        node?.data?.TEMPLATE_CD_OPT?.DOC_TYPE_DESC ||
        node?.data?.TEMPLATE_CD_OPT?.DOC_TYPE ||
        "",
    });
  }
};

const handleValidateDocNo = ({ node, api, value, colDef }) => {
  let regex = /^[^~`!@#$%^&*()\-+_=\\"';:?/<>,.{}[\]|]+$/;
  if (value && !regex.test(value)) {
    node.setData({
      ...node.data,
      DOC_NO: "",
    });
    api.setFocusedCell(node.rowIndex, colDef.field);
    api.startEditingCell({
      rowIndex: node.rowIndex,
      colKey: colDef.field,
    });
    return `${t(`SpecialCharacterNotAllowed`)}`;
  }
  return "";
};

const handleUploadButtonClick = async (
  params,
  setIsFileViewOpen,
  setCurrentRowDatas,
  setOpenImage
) => {
  if (
    params?.buttonName(params) === "Upload Document" &&
    params.node?.data?.DOC_TYPE !== "KYC"
  ) {
    setIsFileViewOpen(true);
    setCurrentRowDatas(params);
  } else if (params?.buttonName(params) === "View Document") {
    let buttonNames =
      params.node?.data?.DOC_TYPE === "KYC" ||
      params.context?.gridContext?.mode === "view"
        ? ["View"]
        : ["View", "Re-Upload"];
    const ShowMess = await params.context.MessageBox({
      messageTitle: "Confirmation",
      message: "DidYouWantToUploadViewDocument",
      buttonNames: buttonNames,
      icon: "CONFIRM",
    });
    if (ShowMess === "View") {
      setOpenImage(true);
      setCurrentRowDatas(params);
    } else {
      setIsFileViewOpen(true);
      setCurrentRowDatas(params);
    }
  } else {
    setOpenImage(true);
    setCurrentRowDatas(params);
  }
};

export { handleBlurDocument, handleValidateDocNo, handleUploadButtonClick };
