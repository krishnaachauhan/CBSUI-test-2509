import { validateHOBranch } from "components/utilFunction/function";
import { utilFunction } from "@acuteinfo/common-base";
import * as API from "../api";
import { handleDisplayMessages } from "../DisburseEntryMetaData";

// This is for postValidationSetCrossAccessorValues, which is used in TransactionDetailsMetaData
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
        OPP_ACCT_NM: "",
        OPP_ACCT_TYPE: "",
        OPP_ACCT_CD: "",
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
      OPP_ACCT_NM: "",
    });
  } else if (value && !node.data?.OPP_ACCT_TYPE) {
    let buttonName = await context?.MessageBox({
      messageTitle: "ValidationFailed",
      message: "enterAccountType",
      buttonNames: ["Ok"],
      icon: "ERROR",
    });

    if (buttonName === "Ok") {
      return node.setData({
        ...node.data,
        OPP_ACCT_CD: "",
        OPP_ACCT_TYPE: "",
      });
    }
  } else if (value && node.data?.OPP_BRANCH_CD && node.data?.OPP_ACCT_TYPE) {
    const reqParameters = {
      BRANCH_CD: node.data?.OPP_BRANCH_CD,
      COMP_CD: authState?.companyID ?? "",
      ACCT_TYPE: node.data?.OPP_ACCT_TYPE,
      ACCT_CD: utilFunction.getPadAccountNumber(
        value,
        node.data?.OPP_ACCT_TYPE?.optionData?.[0] ?? ""
      ),
      USERNAME: authState?.user?.id,
      USERROLE: authState?.role,
      WORKING_DATE: authState?.workingDate ?? "",
    };

    const postData = await API.validateDisAcct(reqParameters);
    const returnValue = await handleDisplayMessages(postData?.[0], context);

    node.setData({
      ...node.data,
      OPP_ACCT_CD: returnValue
        ? utilFunction.getPadAccountNumber(
            value,
            node.data?.OPP_ACCT_TYPE?.optionData?.[0] ?? ""
          )
        : "",
      OPP_ACCT_NM: returnValue?.ACCT_NM ?? "",
    });
    api.refreshCells({ rowNodes: [node], columns: ["OPP_ACCT_NM"] });
  } else if (!value) {
    return node.setData({
      ...node.data,
      OPP_ACCT_NM: "",
    });
  }
  return;
};
