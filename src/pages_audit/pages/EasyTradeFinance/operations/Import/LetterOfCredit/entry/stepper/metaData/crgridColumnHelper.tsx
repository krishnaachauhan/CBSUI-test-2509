import { validateHOBranch } from "components/utilFunction/function";
import { utilFunction } from "@acuteinfo/common-base";
import * as API from "../../api";
import { handleDisplayMessages } from "./metaDataGrid";

export const handleBlurAccountType = async (
  value,
  node,
  api,
  field,
  onValueChange,
  context,
  authState
) => {
  if (!value) return;

  if (context?.isSubmitting) return;

  const isHOBranch = await validateHOBranch(
    value,
    context?.MessageBox,
    authState
  );

  if (!isHOBranch) {
    let buttonName = await context?.MessageBox({
      messageTitle: "ValidationFailed",
      message: "enterBranchCode",
      buttonNames: ["Ok"],
      icon: "ERROR",
    });

    if (buttonName === "Ok") {
      return node.setData({
        ...node.data,
        CR_ACCT_NM: "",
        CR_ACCT_TYPE: "",
        CR_ACCT_CD: "",
        BRANCH_CD: {
          value: "",
          isFieldFocused: true,
        },
      });
    }
  }

  return onValueChange(value?.value);
};

export const handleBlurAccCode = async (
  value,
  node,
  api,
  field,
  onValueChange,
  context,
  authState
) => {
  if (!value) {
    return node.setData({
      ...node.data,
      CR_ACCT_NM: "",
    });
  } else if (value && !node.data?.CR_ACCT_TYPE) {
    let buttonName = await context?.MessageBox({
      messageTitle: "ValidationFailed",
      message: "enterAccountType",
      buttonNames: ["Ok"],
      icon: "ERROR",
    });

    if (buttonName === "Ok") {
      return node.setData({
        ...node.data,
        CR_ACCT_CD: "",
        CR_ACCT_TYPE: "",
      });
    }
  } else if (value && node.data?.CR_BRANCH_CD && node.data?.CR_ACCT_TYPE) {
    const reqParameters = {
      BRANCH_CD: node.data?.CR_BRANCH_CD,
      COMP_CD: authState?.companyID ?? "",
      ACCT_TYPE: node.data?.CR_ACCT_TYPE,
      ACCT_CD: utilFunction.getPadAccountNumber(
        value,
        node.data?.CR_ACCT_TYPE?.optionData?.[0] ?? ""
      ),
      USERNAME: authState?.user?.id,
      USERROLE: authState?.role,
      WORKING_DATE: authState?.workingDate ?? "",
    };

    const postData = await API.validateDisAcct(reqParameters);
    const returnValue = await handleDisplayMessages(postData?.[0], context);

    node.setData({
      ...node.data,
      CR_ACCT_CD: returnValue
        ? utilFunction.getPadAccountNumber(
            value,
            node.data?.CR_ACCT_TYPE?.optionData?.[0] ?? ""
          )
        : "",
      CR_ACCT_NM: returnValue?.ACCT_NM ?? "",
    });
    api.refreshCells({ rowNodes: [node], columns: ["CR_ACCT_NM"] });
  } else if (!value) {
    return node.setData({
      ...node.data,
      CR_ACCT_NM: "",
    });
  }
  return;
};

export const handleBlurService = async (value, data, context) => {
  const authState = context?.gridContext?.authState;

  const apiReq = {
    A_COMP_CD: authState?.companyID ?? "",
    A_BRANCH_CD: authState?.user?.branchCode ?? "",
    A_BRANCH_BASE: authState?.user?.baseBranchCode,
    A_ASON_DT: authState?.workingDate ?? "",
    A_AMOUNT: data?.AMOUNT ?? "",
    A_CONV_AMT: 0,
    A_BRANCH_CODE: "",
    A_ACCT_TYPE: "",
    A_ACCT_CD: "",
  };

  const serviceTaxData = await API.getTFServiceTax(apiReq);

  if (serviceTaxData) {
    return {
      CR_BRANCH_CD: serviceTaxData?.CR_BRANCH_CD,
      CR_ACCT_TYPE: serviceTaxData?.CR_ACCT_TYPE,
      CR_ACCT_CD: serviceTaxData?.CR_ACCT_CD,
    };
  }
};
