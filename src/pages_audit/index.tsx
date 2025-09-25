import { Fragment, lazy, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { PagesAudit } from "./pages_audit";
import {
  AuthLoginController,
  AuthProvider,
  ForgotPasswordController,
  ProtectedRoutes,
} from "./auth";
import {
  CustomPropertiesConfigurationProvider,
  ExtendedFieldMetaDataTypeOptional,
} from "@acuteinfo/common-base";
import { BranchSelectionGrid } from "./auth/branchSelection/branchSelectionGrid";
import { GeneralAPI } from "registry/fns/functions";
import TotpEnbaledDisabled from "./pages/profile/totp/totp-enabled-disable";
import { Dialog } from "@mui/material";
import AcctMSTProvider from "./pages/operations/acct-mst/AcctMSTContext";
import AcctMST from "./pages/operations/acct-mst/AcctMST";
import WebSocketProvider from "./pages/profile/chat/socketContext";
import {
  getPersonalizedReportData,
  saveUpdateTemplate,
} from "./pages/reports/staticReports/api";
import { AuthSDK } from "registry/fns/auth";

const EntryPoint = () => {
  const [dialogState, setDialogState] = useState<any>({
    isAcctMstOpen: false,
    isPhotoSignOpen: false,
    acctData: {},
    isAcctDtlOpen: false,
    isSearchAcctOpen: false,
    isJointDtlOpen: false,
    setValueOnDoubleClick: () => {},
  });
  const shouldEnableWebSocket: boolean = AuthSDK?.getWebSocketEnableFlag();

  const meta: ExtendedFieldMetaDataTypeOptional = {
    branchCode: {
      render: {
        componentType: "autocomplete",
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["BranchCodeReqired"] }],
      },
      required: true,
      name: "BRANCH_CD",
      label: "BranchCode",
      placeholder: "BranchCodePlaceHolder",
      // options: [
      //   { label: "1 branch", value: "1" },
      //   { label: "2 branch", value: "2" },
      //   { label: "3 branch", value: "3" },
      // ],
      options: GeneralAPI.getBranchCodeList,
      _optionsKey: "getBranchCodeList",
      GridProps: {
        xs: 3,
        md: 3,
        sm: 3,
        lg: 3,
        xl: 3,
      },
      // NOTE : this props only for set default brranch and only use in branchCode component do not use this key any other place or any component
      defaultBranchTrue: true,
    },
    accountType: {
      render: {
        componentType: "autocomplete",
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["AccountTypeReqired"] }],
      },
      name: "ACCT_TYPE",
      label: "AccountType",
      placeholder: "AccountTypePlaceHolder",
      enableVirtualized: true,
      options: (dependentValue, formState, _, authState) => {
        return GeneralAPI.get_Account_Type({
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: authState?.user?.branchCode ?? "",
          USER_NAME: authState?.user?.id ?? "",
          DOC_CD: formState?.docCD ?? "",
        });
      },
      _optionsKey: "get_Account_Type",
      defaultAcctTypeTrue: true,
      defaultValue: "",
      GridProps: {
        xs: 3,
        md: 3,
        sm: 3,
        lg: 3,
        xl: 3,
      },
    },
    accountCode: {
      render: {
        componentType: "textField",
      },
      label: "AccountNumber",
      name: "ACCT_CD",
      placeholder: "EnterAccountNumber",
      required: true,
      dependentFields: ["ACCT_TYPE", "BRANCH_CD"],
      postValidationSetCrossFieldValues: "retrieveStatementDtlAcctCd",
      schemaValidation: {
        type: "string",
        rules: [
          { name: "required", params: ["AccountNumberRequired"] },
          {
            name: "max",
            params: [20, "Account code should not exceed 20 digits"],
          },
        ],
      },

      inputProps: {
        maxLength: 20,
        onInput: (event) => {
          const allowedKeys = ["j", "J"];
          const isSpecialKey =
            allowedKeys.includes(event.key) || event.ctrlKey || event.shiftKey;

          if (!isSpecialKey) {
            event.target.value = event.target.value.replace(/[^0-9\s]/g, "");
          }
        },
      },
      GridProps: {
        xs: 3,
        md: 3,
        sm: 3,
        lg: 3,
        xl: 3,
      },

      handleKeyDown: (e, dependent, authstate, formstate, setFieldDataFn) => {
        const { acctDtlReqPara } = formstate || {};

        const { value } = e.target || {};
        let fieldName = e?.target?.name;
        fieldName = fieldName.includes(".")
          ? fieldName.split(".").pop()
          : fieldName.includes("/")
          ? fieldName.split("/").pop()
          : fieldName;
        let acctObj = acctDtlReqPara?.[fieldName];
        const payload = {
          BRANCH_CD: dependent?.[acctObj?.BRANCH_CD]?.value ?? "",
          ACCT_TYPE: dependent?.[acctObj?.ACCT_TYPE]?.value ?? "",
          ACCT_CD: value ?? "",
          COMP_CD: authstate?.companyID ?? "",
          SCREEN_REF: acctObj?.SCREEN_REF ?? "",
        };

        const openDialog = (dialogKey) => {
          if (payload?.ACCT_TYPE && value)
            setDialogState((prevState) => ({
              ...prevState,
              acctData: { ...payload },
              [dialogKey]: true,
            }));
        };

        if (e.key === "F6" && payload?.ACCT_CD) {
          e.preventDefault();
          setDialogState((prevState) => ({
            ...prevState,
            isAcctMstOpen: true,
            acctData: { ...payload },
          }));
        } else if (e.key === "F9") {
          e.preventDefault();

          if (payload?.ACCT_TYPE && value) {
            openDialog("isPhotoSignOpen");
          }
        } else if (e.shiftKey && e.key === "F4") {
          e.preventDefault();
          openDialog("isAcctDtlOpen");
        } else if (e.key === "F5" && payload?.ACCT_TYPE) {
          e.preventDefault();

          setDialogState((prevState) => ({
            ...prevState,
            acctData: { ...payload },
            isSearchAcctOpen: true,
            setValueOnDoubleClick: setFieldDataFn,
          }));
        } else if (e.ctrlKey && e.key.toLowerCase() === "j") {
          e.preventDefault();
          openDialog("isJointDtlOpen");
        }
      },
    },

    phoneNumberOptional: {
      render: {
        componentType: "inputMask",
      },
      MaskProps: {
        mask: "0000000000",
        lazy: true,
      },
    },
    contactNumber: {
      render: {
        componentType: "textField",
      },
      autoComplete: "off",
      maxLength: 20,
      type: "text",
      validate: (value) => {
        if (Boolean(value?.value) && value?.value.length < 11) {
          return "PhoneNumberMinimumdigitValidation";
        }
        return "";
      },
    },

    fullAccountNumber: {
      render: {
        componentType: "textField",
      },
      name: "FULL_ACCT_NO",
      label: "Full Account Number",
      postValidationSetCrossFieldValues: "retrieveStatementDtlFullAcctNo",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["Full account No is required"] }],
      },
      GridProps: {
        xs: 12,
        md: 12,
        sm: 12,
        lg: 12,
        xl: 12,
      },
      maxLength: 20,
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: true,
        isAllowed: (values) => {
          if (values?.value?.length > 20) {
            return false;
          }
          return true;
        },
      },
    },
    Remark: {
      render: {
        componentType: "textField",
      },
      maxLength: 100,
    },
  };

  const handleDialogueClose = (screenFlag, data) => {
    localStorage.removeItem("commonClass");
    setDialogState((prevState) => {
      if (prevState.isAcctMstOpen) {
        return { ...prevState, isAcctMstOpen: false };
      } else if (prevState.isPhotoSignOpen) {
        return { ...prevState, isPhotoSignOpen: false };
      } else if (prevState.isAcctDtlOpen) {
        return { ...prevState, isAcctDtlOpen: false };
      } else if (prevState.isSearchAcctOpen) {
        if (screenFlag) {
          prevState?.setValueOnDoubleClick?.(screenFlag);
        }
        return { ...prevState, isSearchAcctOpen: false };
      } else if (prevState.isJointDtlOpen) {
        return { ...prevState, isJointDtlOpen: false };
      }
      return prevState;
    });
  };

  const AppContent = (
    <Routes>
      <Route path="login" element={<AuthLoginController />} />

      <Route path="totp-enable" element={<TotpEnbaledDisabled />} />
      <Route
        path="forgotpassword"
        element={<ForgotPasswordController screenFlag="password" />}
      />
      <Route
        path="forgot-totp"
        element={<ForgotPasswordController screenFlag="totp" />}
      />
      <Route
        path="branch-selection/*"
        element={<BranchSelectionGrid selectionMode={"S"} />}
      />
      <Route
        path="change-branch/*"
        element={<BranchSelectionGrid selectionMode={"C"} />}
      />
      <Route
        path="*"
        element={
          <ProtectedRoutes>
            <PagesAudit
              dialogsState={dialogState}
              handleDialogClose={handleDialogueClose}
              shouldEnableWebSocket={shouldEnableWebSocket}
            />
          </ProtectedRoutes>
        }
      />
    </Routes>
  );

  return (
    <CustomPropertiesConfigurationProvider
      config={{
        customExtendedTypes: meta,
        denoTableType: "dual",
        defaultGridConfig: {
          variant: "contained",
          isContainedActionButton: true,
          enableDoubleSpaceAction: true,
        },
        defaultExportConfig: {
          enablePdfPrint: true,
          getPersonalizedReportData: getPersonalizedReportData,
          saveUpdateTemplateApiFn: saveUpdateTemplate,
        },
      }}
    >
      <AuthProvider>
        {shouldEnableWebSocket ? (
          <WebSocketProvider>{AppContent}</WebSocketProvider>
        ) : (
          AppContent
        )}
      </AuthProvider>
    </CustomPropertiesConfigurationProvider>
  );
};

export default EntryPoint;
