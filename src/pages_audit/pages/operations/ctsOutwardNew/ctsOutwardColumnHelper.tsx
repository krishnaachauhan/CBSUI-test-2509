import { BankMasterValidate, getBankChequeAlert } from "./api";
import * as API from "../ctsOutwardNew/api";
import { GeneralAPI } from "registry/fns/functions";

export const handleBlurBankCode = async (
  value,
  node,
  api,
  field,
  onValueChange,
  context,
  dependentFieldsValues,
  formState,
  auth,
  setOpenAddBankForm,
  setBankData,
  setCurrentRowIndex
) => {
  if (formState?.isSubmitting) return {};
  const res = await formState.current.getFieldData();
  if (value) {
    let formData = {
      A_ENT_COMP_CD: auth.companyID ?? "",
      A_ENT_BRANCH_CD: auth.user.baseBranchCode ?? "",
      A_BANK_CD:
        value && Number.isNaN(Number(value)) ? "" : value.padEnd(10, " "),
      A_SCREEN_REF: "TRN/559",
      USERROLE: auth?.role ?? "",
    };
    let postData = await BankMasterValidate(formData);
    let btn99, returnVal;
    setCurrentRowIndex(node.rowIndex);
    const getButtonName = async (obj) => {
      let btnName = await context.MessageBox(obj);
      return { btnName, obj };
    };

    for (let i = 0; i < postData.length; i++) {
      if (postData[i]?.O_STATUS === "999") {
        const { btnName, obj } = await getButtonName({
          messageTitle: postData[i]?.O_MSG_TITLE,
          message: postData[i]?.O_MESSAGE,
          icon: "ERROR",
        });
        returnVal = "";
        node.setDataValue("BANK_CD", "");
        await api.setFocusedCell(node.rowIndex, "BANK_CD");
      } else if (postData[i]?.O_STATUS === "9") {
        if (btn99 !== "No") {
          const { btnName, obj } = await getButtonName({
            messageTitle: postData[i]?.O_MSG_TITLE,
            message: postData[i]?.O_MESSAGE,
            icon: "WARNING",
          });
        }
        returnVal = "";
      } else if (postData[i]?.O_STATUS === "99") {
        const { btnName, obj } = await getButtonName({
          messageTitle: postData[i]?.O_MSG_TITLE,
          message: postData[i]?.O_MESSAGE,
          icon: "CONFIRM",
          buttonNames: ["Yes", "No"],
        });
        btn99 = btnName;
        if (btnName === "No") {
          returnVal = "";
          node.setDataValue("BANK_CD", "");
          await api.setFocusedCell(node.rowIndex, "BANK_CD");
        } else {
          setOpenAddBankForm(true);
          setBankData(postData[i]);
        }
      } else if (postData[i]?.O_STATUS === "0") {
        // if (btn99 !== "No") {
        returnVal = postData[i];
        // } else {
        //   returnVal = "";
        // }
        if (node.data?.["CHEQUE_NO"] && value) {
          let data = await getBankChequeAlert({
            ENTERED_COMP_CD: auth.companyID ?? "",
            ENTERED_BRANCH_CD:
              res?.REQ_DATA?.BRANCH_CD ?? auth.user.branchCode ?? "",
            BANK_CD:
              value && Number.isNaN(Number(value)) ? "" : value.padEnd(10, " "),
            TRAN_TYPE: res?.ZONE_TRAN_TYPE,
            TRAN_DT: dependentFieldsValues?.TRAN_DT?.value ?? "",
            CHEQUE_NO: node.data?.["CHEQUE_NO"],
          });
          if (data?.[0]?.O_STATUS === "99") {
            let buttonNames = await context?.MessageBox({
              messageTitle: "Confirmation",
              message: data?.[0]?.O_MESSAGE,
              buttonNames: ["Yes", "No"],
              icon: "CONFIRM",
            });
            if (buttonNames === "Yes") {
              node.setData({ ...node.data, BANK_NM: returnVal?.BANK_NM ?? "" });
              await api.setFocusedCell(node.rowIndex, "BANK_CD");
              await api.startEditingCell({
                rowIndex: node.rowIndex,
                colKey: "BANK_CD",
              });
            } else {
              node.setDataValue("BANK_CD", "");
              node.setDataValue("BANK_NM", "");

              await api.setFocusedCell(node.rowIndex, "BANK_CD");
            }
          }
        }
      }
    }
    btn99 = 0;
    return node.setData({ ...node.data, BANK_NM: returnVal?.BANK_NM ?? "" });
  } else if (!value) {
    return node.setDataValue("BANK_NM", "");
  }
};

export const handleBlurPayee = (
  value,
  node,
  api,
  field,
  onValueChange,
  context,
  dependentFieldsValues
) => {
  if (value?.length > 0) {
    node.setDataValue(field, value.padStart(6, "0"));
    onValueChange(value.padStart(6, "0"));
  }
};

export const getReasonOptions = (authState) => {
  let ApiReq = {
    BRANCH_CD: authState?.user?.branchCode,
    COMP_CD: authState?.companyID,
    RETURN_TYPE: "CLG",
  };
  return API.getInwardReasonTypeList(ApiReq);
};

export const handleBlurCheckNo = async (
  value,
  node,
  api,
  field,
  onValueChange,
  context,

  dependentFieldsValues,
  formState,
  auth,
  setOpenAddBankForm,
  setBankData,
  setCurrentRowIndex
) => {
  const res = await formState.current.getFieldData();
  const REQ_DATA = context?.gridContext?.chequeReqData;

  if (
    value &&
    Object.entries(context?.gridContext?.chequeReqData)?.length === 0
  ) {
    let buttonName = await context?.MessageBox({
      messageTitle: "Information",
      message: "Enter Account Information",
      buttonNames: ["Ok"],
    });

    if (buttonName === "Ok") {
      let continueButtonName = await context?.MessageBox({
        messageTitle: "Confirmation",
        message: "AreYouSureContinue",
        buttonNames: ["Yes", "No"],
        icon: "CONFIRM",
      });

      if (continueButtonName === "Yes") {
        return node.setDataValue("CHEQUE_DATE", node.data?.TRAN_DT);
      }
    } else {
      return node.setDataValue("CHEQUE_DATE", "");
    }
  } else if (node.data?.["BANK_CD"] && value) {
    let postData = await getBankChequeAlert({
      ENTERED_COMP_CD: auth.companyID ?? "",
      ENTERED_BRANCH_CD:
        context?.gridContext?.chequeReqData?.BRANCH_CD ??
        auth.user.branchCode ??
        "",
      CHEQUE_NO:
        value && Number.isNaN(Number(value)) ? "" : value.padEnd(10, " "),
      TRAN_TYPE: res?.ZONE_TRAN_TYPE,
      TRAN_DT: node.data?.TRAN_DT ?? "",
      BANK_CD: node.data?.["BANK_CD"],
    });

    let btn99, returnVal;

    const getButtonName = async (obj) => {
      let btnName = await context.MessageBox(obj);
      return { btnName, obj };
    };
    async function handleChequeValidationAndMessages(formState, field) {
      let postData = await GeneralAPI.getChequeNoValidation({
        COMP_CD: REQ_DATA?.COMP_CD,
        BRANCH_CD: REQ_DATA?.BRANCH_CD,
        ACCT_TYPE: REQ_DATA?.ACCT_TYPE,
        ACCT_CD: REQ_DATA?.ACCT_CD,
        CHEQUE_NO: value,
        SCREEN_REF: REQ_DATA?.SCREEN_REF,
        TYPE_CD: REQ_DATA?.[0]?.TYPE_CD,
      });
      if (postData?.[0]?.ERR_MSG) {
        const buttonName = await context?.MessageBox({
          messageTitle: "Information",
          message: postData?.[0]?.ERR_MSG,
          buttonNames: ["Ok"],
          icon: "INFO",
        });
        if (buttonName === "Ok") {
          let continueButtonName = await context?.MessageBox({
            messageTitle: "Confirmation",
            message: "AreYouSureContinue",
            buttonNames: ["Yes", "No"],
            icon: "CONFIRM",
          });
          if (continueButtonName === "Yes") {
            return node.setDataValue("CHEQUE_DATE", node.data?.TRAN_DT);
          } else {
            return node.setDataValue("CHEQUE_DATE", "");
          }
        }
      } else {
        return node.setDataValue("CHEQUE_DATE", node.data?.TRAN_DT);
      }
    }
    for (let i = 0; i < postData.length; i++) {
      if (postData[i]?.O_STATUS === "999") {
        const { btnName, obj } = await getButtonName({
          messageTitle: "ValidationFailed",
          message: postData[i]?.O_MESSAGE,
          icon: "ERROR",
        });
        returnVal = "";
      } else if (postData[i]?.O_STATUS === "9") {
        if (btn99 !== "No") {
          const { btnName, obj } = await getButtonName({
            messageTitle: "Alert",
            message: postData[i]?.O_MESSAGE,
            icon: "WARNING",
          });
        }
        returnVal = "";
      } else if (postData[i]?.O_STATUS === "99") {
        const { btnName, obj } = await getButtonName({
          messageTitle: "Confirmation",
          message: postData[i]?.O_MESSAGE,
          buttonNames: ["Yes", "No"],
          icon: "CONFIRM",
        });

        btn99 = btnName;
        if (btnName === "Yes") {
          return await handleChequeValidationAndMessages(res, field);
        }
      } else if (postData[i]?.O_STATUS === "0") {
        return node.setDataValue("CHEQUE_DATE", node.data?.TRAN_DT);
      }
    }
  }
};
