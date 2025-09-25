import { handleDisplayMessages } from "components/utilFunction/function";
import {
  BankMasterValidate,
  getBankChequeAlert,
  validateApplicationData,
} from "../api";

export const handleBlurBankCode = async (
  currentField,
  formState,
  auth,
  dependentFieldValues
) => {
  if (formState?.isSubmitting) return {};
  //   const res = await formState.current.getFieldData();
  const value = currentField?.value;
  if (value) {
    let formData = {
      A_ENT_COMP_CD: auth.companyID ?? "",
      A_ENT_BRANCH_CD: auth.user.baseBranchCode ?? "",
      A_BANK_CD:
        value && Number.isNaN(Number(value)) ? "" : value.padEnd(10, " "),
      A_SCREEN_REF: formState?.docCD,
      USERROLE: auth?.role ?? "",
    };
    let postData = await BankMasterValidate(formData);
    let btn99, returnVal;
    const getButtonName = async (obj) => {
      let btnName = await formState.MessageBox(obj);
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
        return {
          BANK_CD: {
            value: "",
            isFieldFocused: true,
            ignoreUpdate: false,
          },
        };
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
          return {
            BANK_CD: {
              value: "",
              isFieldFocused: true,
              ignoreUpdate: false,
            },
          };
        } else {
          formState?.setOpenAddBankForm(true);
          formState?.setBankData(postData[i]);
        }
      } else if (postData[i]?.O_STATUS === "0") {
        returnVal = postData[i];

        if (dependentFieldValues?.["CHEQUE_NO"]?.value && value) {
          let data = await getBankChequeAlert({
            ENTERED_COMP_CD: auth.companyID ?? "",
            ENTERED_BRANCH_CD: auth.user.branchCode ?? "",
            BANK_CD:
              value && Number.isNaN(Number(value)) ? "" : value.padEnd(10, " "),
            CHEQUE_NO: dependentFieldValues?.["CHEQUE_NO"]?.value ?? "",
          });
          if (data?.[0]?.O_STATUS === "99") {
            let buttonNames = await formState?.MessageBox({
              messageTitle: "Confirmation",
              message: data?.[0]?.O_MESSAGE ?? "",
              buttonNames: ["Yes", "No"],
              icon: "CONFIRM",
            });
            if (buttonNames === "Yes") {
              return {
                BANK_NM: {
                  value: returnVal?.BANK_NM ?? "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
              };
            } else {
              return {
                BANK_NM: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
                BANK_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
              };
            }
          }
        }
      }
    }
    btn99 = 0;
    return {
      BANK_NM: {
        value: returnVal?.BANK_NM ?? "",
        isFieldFocused: false,
        ignoreUpdate: false,
      },
    };
  } else if (!value) {
    return {
      BANK_NM: {
        value: "",
        isFieldFocused: false,
        ignoreUpdate: false,
      },
    };
  }
};

export const handleBlurAppOrMemAcct = async (
  currentField,
  formState,
  authState,
  dependentFieldValues
) => {
  const accessor = currentField?.name?.split("/")?.[1];
  if (formState?.isSubmitting) return {};
  if (currentField?.value) {
    let data = await validateApplicationData({
      COMP_CD: authState.companyID ?? "",
      BRANCH_CD: authState.user.branchCode ?? "",
      BASE_BRANCH_CD: authState.user.baseBranchCode ?? "",
      APP_TYPE:
        accessor === "APP_TYPE"
          ? currentField?.value ?? ""
          : dependentFieldValues?.["APP_TYPE"]?.value ?? "",
      MEM_TYPE:
        accessor === "MEM_TYPE"
          ? currentField?.value ?? ""
          : dependentFieldValues?.["MEM_TYPE"]?.value ?? "",
      CALL_FROM: accessor === "APP_TYPE" ? "A" : "M",
      WORKING_DATE: authState.workingDate ?? "",
      USERNAME: authState.user.id ?? "",
      USERROLE: authState.role ?? "",
      SCREEN_REF: formState?.docCD,
    });

    if (data?.[0]?.status === "0") {
      const transformed: any = {};
      Object.keys(data?.[0]?.data?.[0]).forEach((key) => {
        transformed[key] = {
          value: data?.[0]?.data?.[0]?.[key],
          isFieldFocused: false,
          ignoreUpdate: true,
        };
      });

      return {
        ...transformed,
        DIV_MODE_OF_PAY: transformed?.DEFAULT_DIV_MODE ?? {},
        STNRY_FEES_AMT: {
          ...transformed?.STNRY_FEES_AMT,
          ignoreUpdate: false,
        },
        HIDDEN_SHARE_TYPE: transformed?.SHARE_TYPE,
      };
    }
  }
};
