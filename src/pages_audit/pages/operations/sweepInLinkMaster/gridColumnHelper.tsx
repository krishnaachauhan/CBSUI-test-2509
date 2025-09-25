import {
  handleDisplayMessages,
  validateHOBranch,
} from "components/utilFunction/function";
import { getGridRowData, utilFunction } from "@acuteinfo/common-base";
import * as API from "./api";

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
        ACCT_NM: "",
        C_ACCT_TYPE: "",
        C_ACCT_CD: "",
        C_BRANCH_CD: {
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
  const formdata = await context?.gridContext?.formRef?.current?.getFieldData();

  const allRows = getGridRowData(context?.gridContext?.gridApiRef);
  const currentIndex = node?.rowIndex;
  const aboveRows = allRows.slice(0, currentIndex);
  const cleanedAboveRows = aboveRows.map(
    ({
      errors,
      loader,
      ACCT_FLAG_OPT,
      FD_SWEEP_IN_DEF_TRAN_CD_OPT,
      C_BRANCH_CD_ID,
      C_ACCT_TYPE_ID,
      C_ACCT_CD,
      ...rest
    }) => {
      return {
        ...rest,
        C_ACCT_CD: C_ACCT_CD ?? "",
        C_COMP_CD: authState?.companyID ?? "",
        ACTIVE_STATUS:
          rest.ACTIVE_STATUS === true
            ? "Y"
            : rest.ACTIVE_STATUS === false
            ? "N"
            : rest.ACTIVE_STATUS,
      };
    }
  );

  if (!value) {
    return node.setData({
      ...node.data,
      ACCT_NM: "",
    });
  } else if (value && !node.data?.C_ACCT_TYPE) {
    let buttonName = await context?.MessageBox({
      messageTitle: "ValidationFailed",
      message: "Enter Account Type",
      buttonNames: ["Ok"],
      icon: "ERROR",
    });

    if (buttonName === "Ok") {
      return node.setData({
        ...node.data,
        C_ACCT_CD: "",
        C_ACCT_TYPE: "",
      });
    }
  } else if (value && node.data?.C_BRANCH_CD && node.data?.C_ACCT_TYPE) {
    const reqParameters = {
      C_BRANCH_CD: node?.data?.C_BRANCH_CD,
      C_COMP_CD: authState?.companyID ?? "",
      C_ACCT_TYPE: node?.data?.C_ACCT_TYPE,
      C_ACCT_CD: utilFunction.getPadAccountNumber(
        value,
        node.data?.C_ACCT_TYPE?.optionData?.[0] ?? ""
      ),
      WORKING_DATE: authState?.workingDate,
      USERNAME: authState?.user?.id ?? "",
      USERROLE: authState?.role ?? "",
      SCREEN_REF: context?.gridContext?.screenRef ?? "",
      FLAG: "D",
      P_COMP_CD: authState?.companyID,
      P_ACCT_CD: formdata?.ACCT_CD ?? "",
      P_ACCT_TYPE: formdata?.ACCT_TYPE ?? "",
      P_BRANCH_CD: formdata?.BRANCH_CD ?? "",
      SWEEP_DTL: [...cleanedAboveRows],
    };

    const postData = await API.validateDisAcct(reqParameters);

    let returnValue;
    if (postData?.length > 0) {
      const response = await handleDisplayMessages(
        postData,
        context?.MessageBox
      );
      if (Object.keys(response).length > 0) {
        returnValue = postData;
      } else {
        returnValue = "";
      }
    }

    node.setData({
      ...node.data,
      C_ACCT_CD: returnValue
        ? utilFunction.getPadAccountNumber(
            value,
            node.data?.C_ACCT_TYPE?.optionData?.[0] ?? ""
          )
        : "",
      ACCT_NM: returnValue?.[0]?.ACCT_NM ?? "",
    });
    api.refreshCells({ rowNodes: [node], columns: ["ACCT_NM"] });
  } else if (!value) {
    return node.setData({
      ...node.data,
      ACCT_NM: "",
    });
  }
  return;
};

export const handleButtonClick = async (
  { context, api, node },
  confirmOrReject,
  CloseMessageBox
) => {
  let res = await context.MessageBox({
    messageTitle: "confirmation",
    message: "Are you sure want to delete row ?",
    buttonNames: ["Yes", "No"],
    defFocusBtnName: "Yes",
    icon: "CONFIRM",
    loadingBtnName: ["Yes"],
  });
  if (res === "Yes") {
    if (node?.data?.TRAN_CD) {
      const data = await confirmOrReject({
        TRAN_CD: node?.data?.TRAN_CD,
        FLAG: "R",
        SR_CD: node?.data?.SR_CD ?? "",
      });
      if (data?.[0]?.O_STATUS === "0") {
        const rowNode = api.getRowNode(node.id);
        api?.applyTransaction({ remove: [rowNode?.data] });
      }
      CloseMessageBox();
    } else {
      api.applyTransaction({ remove: [node?.data] });
      CloseMessageBox();
    }
  }
};
