import { utilFunction } from "@acuteinfo/common-base";
import { updateNodeDataAndFocus } from "components/agGridTable/utils/helper";
import {
  handleDisplayMessages,
  validateHOBranch,
} from "components/utilFunction/function";
import { isEmpty } from "lodash";
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
  if (value && dependentValue?.TO_ACCT_TYPE) {
    let otherAPIRequestPara = {
      COMP_CD: authState?.companyID,
      ACCT_CD: utilFunction.getPadAccountNumber(
        value,
        dependentValue?.TO_ACCT_TYPE_OPT?.[0]
      ),
      ACCT_TYPE: dependentValue?.TO_ACCT_TYPE,
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
                TO_ACCT_CD: "",
                ACCT_NM: "",
              },
              api,
              { focusedAccessor: "TO_ACCT_CD", isFieldFocused: true }
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
        TO_ACCT_CD: utilFunction.getPadAccountNumber(
          value,
          dependentValue?.TO_ACCT_TYPE_OPT?.[0]
        ),

        ACCT_CD_COPY: value,

        ACCT_NM: postData?.ACCT_NM ?? "",
      });
    }
  } else if (!value) {
    node.setData({
      ...node.data,
      TO_ACCT_CD: "",
      ACCT_NM: "",
    });
  }
  return {};
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
  const currentField = { value: value?.value };

  const isHOBranch = await validateHOBranch(
    currentField,
    context?.MessageBox,
    authState
  );
  if (isHOBranch) {
    updateNodeDataAndFocus(
      node,
      {
        TO_BRANCH_CD: "",
        DISPLAY_TO_BRANCH_CD: "",
        TO_BRANCH_CD_OPT: "",
      },
      api,
      { focusedAccessor: accessor, isFieldFocused: true }
    );
  }
};
