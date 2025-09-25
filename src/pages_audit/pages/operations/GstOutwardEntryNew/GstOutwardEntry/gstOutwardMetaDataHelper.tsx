import { GeneralAPI } from "registry/fns/functions";
import * as API from "../../gstOutwardEntry/api";

export const getTemplateOptions = async (formState, authState) => {
  const res = await formState?.current?.getFieldData();
  if (res?.MODE) {
    const APIrequest = await API.getGstOtwardTemplateDdw({
      BASE_COMP_CD: authState?.baseCompanyID,
      BASE_BRANCH_CD: authState?.user?.baseBranchCode,
      TEMPLATE_TYPE: "OUT",
      GSTMODE: res?.MODE,
    });
    return APIrequest;
  }
  return [];
};

export const handleBlurChargeAmount = async (
  value,
  node,
  api,
  field,
  onValueChange,
  formState,
  authState
) => {
  try {
    const res = await formState?.current?.getFieldData();
    const postData = await GeneralAPI.getCalGstAmountData({
      BRANCH_CD: res.BRANCH_CD ?? "",
      ACCT_TYPE: res.ACCT_TYPE ?? "",
      ACCT_CD: res.ACCT_CD ?? "",
      AMOUNT: value,
      MODULE: "",
      ENT_BRANCH_CD: authState?.user?.branchCode,
      ASON_DT: authState?.workingDate,
      COMP_CD: authState?.companyID,
    });

    node.setData({
      ...node.data,
      TAX_AMOUNT: postData?.[0]?.TAX_AMOUNT,
    });
    api.refreshCells({ rowNodes: [node], columns: ["TAX_AMOUNT"] });
  } catch (error) {
    console.error("Error fetching TAX_AMOUNT:", error);
  }
};

export const handleBlurCheckNo = async (
  value,
  node,
  api,
  field,
  onValueChange,
  context,
  formState,
  authState
) => {
  if (formState?.isSubmitting) return {};

  node.setDataValue("loader", true);
  const res = await formState?.current?.getFieldData();
  if (value?.length > 0) {
    if (
      res?.BRANCH_CD?.length === 0 ||
      res?.ACCT_TYPE?.length === 0 ||
      res?.ACCT_CD?.length === 0
    ) {
      context.MessageBox({
        messageTitle: "Cheque Book",
        message: "Enter Account Information",
      });
      api.tabToNextCell();
    } else if (value?.length > 0) {
      const postData = await GeneralAPI.getChequeNoValidation({
        COMP_CD: authState?.companyID,
        BRANCH_CD: res?.BRANCH_CD,
        ACCT_TYPE: res?.ACCT_TYPE,
        ACCT_CD: res?.ACCT_CD,
        CHEQUE_NO: value,
        SCREEN_REF: "TRN/658",
        TYPE_CD: res?.MODE,
      });

      for (let i = 0; i < postData?.length; i++) {
        const status = postData?.[i]?.O_STATUS;
        const message = postData?.[i]?.O_MESSAGE;
        if (status === "999") {
          node.setDataValue("disableChequeDate", false);
          await context.MessageBox({
            messageTitle: postData[i]?.O_MSG_TITLE || "Validation Failed",
            message: message,
            buttonNames: ["OK"],
            icon: "ERROR",
          });

          node.setDataValue("CHEQUE_NO", "");
          await onValueChange("");
          await api.setFocusedCell(node.rowIndex, "CHEQUE_NO");
          await api.startEditingCell({
            rowIndex: node.rowIndex,
            colKey: "CHEQUE_NO",
          });
          return postData;
        } else if (status === "99") {
          context.MessageBox({
            messageTitle: postData?.[i]?.O_MSG_TITLE?.length
              ? postData?.[i]?.O_MSG_TITLE
              : "Confirmation",
            message: message,
            buttonNames: ["OK"],
            icon: "CONFIRM",
          });
        } else if (status === "9") {
          context.MessageBox({
            messageTitle: postData?.[i]?.O_MSG_TITLE?.length
              ? postData?.[i]?.O_MSG_TITLE
              : "Alert",
            message: message,
            buttonNames: ["OK"],
            icon: "WARNING",
          });
        } else if (status === "0") {
          node.setDataValue("disableChequeDate", true);

          api.setFocusedCell(node.rowIndex, "CHEQUE_DT");
          await api.startEditingCell({
            rowIndex: node.rowIndex,
            colKey: "CHEQUE_DT",
          });
        }
      }
    }
  } else {
    node.setDataValue("CHEQUE_DT", "");
    node.setDataValue("disableChequeDate", false);
  }
};
