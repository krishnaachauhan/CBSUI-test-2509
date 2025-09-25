import { utilFunction } from "@acuteinfo/common-base";
import { updateNodeDataAndFocus } from "components/agGridTable/utils/helper";
import { GeneralAPI } from "registry/fns/functions";

export const handleBlurAcctCode = async (
  value: any,
  node: any,
  api: any,
  accessor: any,
  onValueChange: any,
  context: any,
  oldValue: any,
  authState: any
) => {
  const dependentValue = node.data;
  if (value && dependentValue?.FROM_ACCT_TYPE) {
    let otherAPIRequestPara = {
      COMP_CD: authState?.companyID,
      ACCT_CD: utilFunction.getPadAccountNumber(
        value,
        dependentValue?.FROM_ACCT_TYPE_OPT?.[0]
      ),
      ACCT_TYPE: dependentValue?.FROM_ACCT_TYPE,
      BRANCH_CD: authState?.user?.branchCode,
      GD_TODAY_DT: authState?.workingDate,
      SCREEN_REF: context.gridContext?.docCD,
    };
    let postData = await GeneralAPI.getAccNoValidation(otherAPIRequestPara);

    let apiRespMSGdata = postData?.MSG;
    let isReturn;
    const messagebox = async (msgTitle, msg, buttonNames, status, icon) => {
      let buttonName = await context.MessageBox({
        messageTitle: msgTitle,
        message: msg,
        buttonNames: buttonNames,
        icon: icon,
      });
      return { buttonName, status };
    };
    if (apiRespMSGdata?.length) {
      for (let i = 0; i < apiRespMSGdata?.length; i++) {
        if (apiRespMSGdata[i]?.O_STATUS !== "0") {
          let btnName = await messagebox(
            apiRespMSGdata[i]?.O_MSG_TITLE
              ? apiRespMSGdata[i]?.O_MSG_TITLE
              : apiRespMSGdata[i]?.O_STATUS === "999"
              ? "ValidationFailed"
              : apiRespMSGdata[i]?.O_STATUS === "99"
              ? "confirmation"
              : "ALert",
            apiRespMSGdata[i]?.O_MESSAGE,
            apiRespMSGdata[i]?.O_STATUS === "99" ? ["Yes", "No"] : ["Ok"],
            apiRespMSGdata[i]?.O_STATUS,
            apiRespMSGdata[i]?.O_STATUS === "999"
              ? "ERROR"
              : apiRespMSGdata[i]?.O_STATUS === "99"
              ? "CONFIRM"
              : "WARNING"
          );

          if (btnName.buttonName === "No" || btnName.status === "999") {
            updateNodeDataAndFocus(
              node,
              {
                FROM_ACCT_CD: "",
                ACCT_NM: "",
              },
              api,
              { focusedAccessor: "FROM_ACCT_CD", isFieldFocused: true }
            );
            onValueChange("");
            isReturn = false;
          } else {
            isReturn = true;
          }
        } else {
          isReturn = true;
        }
      }
    }

    if (Boolean(isReturn)) {
      node.setData({
        ...node.data,
        FROM_ACCT_CD: utilFunction.getPadAccountNumber(
          value,
          dependentValue?.FROM_ACCT_TYPE_OPT?.[0]
        ),

        ACCT_CD_COPY: value,

        ACCT_NM: postData?.ACCT_NM ?? "",
      });
    }
  } else if (!value) {
    node.setData({
      ...node.data,
      FROM_ACCT_CD: "",
      ACCT_NM: "",
    });
  }
  return {};
};

export const handleBlurAmount = async (
  value: any,
  node: any,
  api: any,
  accessor: any,
  onValueChange: any,
  context: any,
  oldValue: any,
  currentRowData,
  setIsOpenDenomination,
  setRemainingAmt,
  getData,
  authState,
  setDenoDisplayMode
) => {
  if (
    value &&
    node.data.DENO_FLAG === "Y" &&
    !currentRowData?.current?.node?.data?.DENO_DTL
  ) {
    const existingLoaders = node.data.loader || [];

    const updatedLoader = [
      ...existingLoaders.filter((err) => err.field !== accessor),
    ];

    node.setData({
      ...node.data,
      loader: [...updatedLoader, { accessor, loader: false }],
    });
    currentRowData.current = { node, api };
    setDenoDisplayMode("new");
    setIsOpenDenomination(true);
    setRemainingAmt(value);
    await getData({
      BRANCH_CD: authState?.user?.branchCode ?? "",
      COMP_CD: authState?.companyID ?? "",
      TRAN_DT: authState?.workingDate ?? "",
      USER_NAME: authState?.user?.id ?? "",
    });
  }
};

export const handleBlurToBranch = async (
  value,
  node,
  api,
  accessor,
  onValueChange,
  context,
  oldValue,
  authState
) => {
  if (value?.value === authState?.user?.branchCode) {
    let res = await context.MessageBox({
      messageTitle: "confirmation",
      message: "To branch can't be same as From Branch",
      buttonNames: ["Ok"],
      icon: "ERROR",
    });
    if (res === "Ok") {
      updateNodeDataAndFocus(
        node,
        {
          TO_BRANCH: "",
          DISPLAY_TO_BRANCH: "",
          TO_BRANCH_OPT: "",
        },
        api,
        { focusedAccessor: accessor, isFieldFocused: true }
      );
    }
  }
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
    if (node.data?.TRAN_CD) {
      const data = await confirmOrReject({
        TRAN_CD: node.data?.TRAN_CD,
        FLAG: "R",
        SR_CD: node.data?.SR_CD ?? "",
        BRANCH_CD: node.data?.BRANCH_CD ?? "",
      });
      if (data?.[0]?.O_STATUS === "0") {
        api?.applyTransaction({ remove: [node.data] });
      }
      CloseMessageBox();
    } else {
      api.applyTransaction({ remove: [node.data] });
      CloseMessageBox();
    }
  }
};
