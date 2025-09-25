import {
  components,
  GridMetaDataType,
  utilFunction,
} from "@acuteinfo/common-base";
import { getPassBookTemplate } from "./api";
import { GeneralAPI } from "registry/fns/functions";
import { format, isValid } from "date-fns";
import { t } from "i18next";
import { validateHOBranch } from "components/utilFunction/function";
import { PREVENT_SPECIAL_CHAR, REGEX } from "components/utilFunction/constant";

export const AccountInquiryMetadata = {
  form: {
    name: "AccountInquiry895", //Please do not change this name, as there is a condition based on it in the TSX file.
    label: " ",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    // allowColumnHiding: true,
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 4,
          md: 4,
        },
        container: {
          direction: "row",
          spacing: 0.5,
        },
      },
    },
    componentProps: {
      textField: {
        fullWidth: true,
      },
      select: {
        fullWidth: true,
      },
      datePicker: {
        fullWidth: true,
      },
      numberFormat: {
        fullWidth: true,
      },
      inputMask: {
        fullWidth: true,
      },
      datetimePicker: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        name: "BRANCH_CD",
        runPostValidationHookAlways: true,
        isFieldFocused: true,
        required: false,
        schemaValidation: {},
        placeholder: "EnterAccountBranch",
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          const isHOBranch = await validateHOBranch(
            currentField,
            formState?.MessageBox,
            authState
          );
          if (isHOBranch) {
            return {
              BRANCH_CD: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          }
          return {
            ACCT_TYPE: { value: "" },
            ACCT_CD: { value: "", ignoreUpdate: false },
          };
        },
        GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
      },
      accountTypeMetadata: {
        name: "ACCT_TYPE",
        dependentFields: ["BRANCH_CD"],
        runPostValidationHookAlways: true,
        required: false,
        placeholder: "EnterAccountType",
        schemaValidation: {},
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (currentField?.displayValue !== currentField?.value) {
            return {};
          }
          if (
            currentField?.value &&
            dependentFieldValues?.BRANCH_CD?.value?.length === 0
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "Alert",
              message: "EnterAccountBranch",
              buttonNames: ["Ok"],
              icon: "WARNING",
            });

            if (buttonName === "Ok") {
              return {
                ACCT_TYPE: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
                BRANCH_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          } else {
            return {
              ACCT_CD: { value: "", ignoreUpdate: false },
            };
          }
        },
        GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
      },
      accountCodeMetadata: {
        name: "ACCT_CD",
        autoComplete: "off",
        dependentFields: [
          "ACCT_TYPE",
          "BRANCH_CD",
          "UNIQUE_ID",
          "CONTACT2",
          "PAN_NO",
          "ACCT_NM",
          "PASSPORT_NO",
          "ELECTION_CARD_NO",
          "DRIVING_LICENSE_NO",
          "CUSTOMER_ID",
        ],
        runPostValidationHookAlways: true,
        required: false,
        maxLength: 20,
        placeholder: "AccountNumberPlaceHolder",
        schemaValidation: {},
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (currentField?.displayValue === "") {
            return {};
          } else if (
            currentField.value &&
            dependentFieldValues?.ACCT_TYPE?.value?.length === 0
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "Alert",
              message: "EnterAccountType",
              buttonNames: ["Ok"],
              icon: "WARNING",
            });
            if (buttonName === "Ok") {
              return {
                ACCT_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
                ACCT_TYPE: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          } else if (
            currentField?.value &&
            dependentFieldValues?.BRANCH_CD?.value &&
            dependentFieldValues?.ACCT_TYPE?.value
          ) {
            const reqParameters = {
              BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value ?? "",
              COMP_CD: authState?.companyID ?? "",
              ACCT_TYPE: dependentFieldValues?.ACCT_TYPE?.value ?? "",
              ACCT_CD:
                utilFunction.getPadAccountNumber(
                  currentField?.value,
                  dependentFieldValues?.ACCT_TYPE?.optionData?.[0] ?? ""
                ) ?? "",
              SCREEN_REF: formState?.docCD ?? "",
            };
            const postData = await GeneralAPI.getAccNoValidation(reqParameters);
            let btn99, returnVal;
            const getButtonName = async (obj) => {
              let btnName = await formState.MessageBox(obj);
              return { btnName, obj };
            };
            for (let i = 0; i < postData?.MSG?.length; i++) {
              if (postData?.MSG?.[i]?.O_STATUS === "999") {
                await getButtonName({
                  messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE
                    ? postData?.MSG?.[i]?.O_MSG_TITLE
                    : "ValidationFailed",
                  message: postData?.MSG?.[i]?.O_MESSAGE,
                  icon: "ERROR",
                });
                returnVal = "";
              } else if (postData?.MSG?.[i]?.O_STATUS === "9") {
                if (btn99 !== "No") {
                  await getButtonName({
                    messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE
                      ? postData?.MSG?.[i]?.O_MSG_TITLE
                      : "Alert",
                    message: postData?.MSG?.[i]?.O_MESSAGE,
                    icon: "WARNING",
                  });
                }
                returnVal = postData;
              } else if (postData?.MSG?.[i]?.O_STATUS === "99") {
                const { btnName } = await getButtonName({
                  messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE
                    ? postData?.MSG?.[i]?.O_MSG_TITLE
                    : "Confirmation",
                  message: postData?.MSG?.[i]?.O_MESSAGE,
                  buttonNames: ["Yes", "No"],
                  icon: "CONFIRM",
                });

                btn99 = btnName;
                if (btnName === "No") {
                  returnVal = "";
                  break;
                }
              } else if (postData?.MSG?.[i]?.O_STATUS === "0") {
                if (btn99 !== "No") {
                  returnVal = postData;
                  formState?.setSearchPara({});
                  formState?.endSubmitRef.current?.(true);
                  formState.setSearchPara({
                    COMP_CD: authState?.companyID ?? "",
                    SELECT_COLUMN: {
                      ACCT_TYPE: dependentFieldValues?.ACCT_TYPE?.value ?? "",
                      BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value ?? "",
                      ACCT_CD: utilFunction.getPadAccountNumber(
                        currentField?.value,
                        dependentFieldValues?.ACCT_TYPE?.optionData?.[0] ?? {}
                      ),
                    },
                  });
                  const fieldData = {
                    ACCT_TYPE: dependentFieldValues?.ACCT_TYPE?.value ?? "",
                    BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value ?? "",
                    ACCT_CD: utilFunction.getPadAccountNumber(
                      currentField?.value,
                      dependentFieldValues?.ACCT_TYPE?.optionData?.[0] ?? {}
                    ),
                    CUSTOMER_ID: dependentFieldValues?.CUSTOMER_ID?.value ?? "",
                    CONTACT2: dependentFieldValues?.CONTACT2?.value ?? "",
                    PAN_NO: dependentFieldValues?.PAN_NO?.value ?? "",
                    ACCT_NM: dependentFieldValues?.ACCT_NM?.value ?? "",
                    PASSPORT_NO: dependentFieldValues?.PASSPORT_NO?.value ?? "",
                    ELECTION_CARD_NO:
                      dependentFieldValues?.ELECTION_CARD_NO?.value ?? "",
                    DRIVING_LICENSE_NO:
                      dependentFieldValues?.DRIVING_LICENSE_NO?.value ?? "",
                    UNIQUE_ID: dependentFieldValues?.UNIQUE_ID?.value ?? "",
                  };
                  const payload = {
                    COMP_CD: authState?.companyID,
                    ACCT_TYPE: dependentFieldValues?.ACCT_TYPE?.value ?? "",
                    BRANCH_CD: dependentFieldValues?.BRANCH_CD?.value ?? "",
                    ACCT_CD: utilFunction.getPadAccountNumber(
                      currentField?.value,
                      dependentFieldValues?.ACCT_TYPE?.optionData?.[0] ?? {}
                    ),
                    CUSTOMER_ID: dependentFieldValues?.CUSTOMER_ID?.value ?? "",
                    CONTACT2: dependentFieldValues?.CONTACT2?.value ?? "",
                    PAN_NO: dependentFieldValues?.PAN_NO?.value ?? "",
                    ACCT_NM: dependentFieldValues?.ACCT_NM?.value ?? "",
                    PASSPORT_NO: dependentFieldValues?.PASSPORT_NO?.value ?? "",
                    ELECTION_CARD_NO:
                      dependentFieldValues?.ELECTION_CARD_NO?.value ?? "",
                    DRIVING_LICENSE_NO:
                      dependentFieldValues?.DRIVING_LICENSE_NO?.value ?? "",
                    UNIQUE_ID: dependentFieldValues?.UNIQUE_ID?.value ?? "",
                    SELECT_COLUMN: {},
                  };
                  Object.keys(fieldData)?.forEach((key) => {
                    if (fieldData[key]) {
                      payload["SELECT_COLUMN"][key] = fieldData?.[key];
                    }
                  });
                  formState?.sevrerGridRef?.current?.fetchData();
                } else {
                  returnVal = "";
                }
              }
            }

            return {
              ACCT_CD:
                returnVal !== ""
                  ? {
                      value: utilFunction.getPadAccountNumber(
                        currentField?.value,
                        dependentFieldValues?.ACCT_TYPE?.optionData?.[0]
                      ),
                      ignoreUpdate: true,
                      isFieldFocused: false,
                    }
                  : {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: false,
                    },
            };
          }
          return {};
        },
        fullWidth: true,
        GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PADDINGNUMBER",
      dependentFields: ["ACCT_TYPE"],
      setValueOnDependentFieldsChange: (dependentFields) => {
        const optionData = dependentFields.ACCT_TYPE.optionData;
        if (optionData && optionData.length > 0) {
          return optionData[0]?.PADDING_NUMBER;
        } else return "";
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "CUSTOMER_ID",
      label: "CustomerId",
      maxLength: 12,
      autoComplete: "off",
      schemaValidation: {
        type: "string",
      },
      placeholder: "EnterCustomerId",
      type: "text",
      startsIcon: "PortraitSharp",
      iconStyle: {
        height: 20,
        color: "var(--theme-color3)",
        width: 20,
      },
      GridProps: {
        xs: 12,
        sm: 6,
        md: 4,
        lg: 2,
        xl: 2,
      },
      FormatProps: {
        isAllowed: (values) => {
          if (values?.value?.length > 12) {
            return false;
          }
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
    },
    {
      render: {
        componentType: "phoneNumberOptional",
      },
      name: "CONTACT2",
      label: "MobileNo",
      maxLength: 10,
      placeholder: "EnterMobileNo",
      type: "string",
      // startsIcon: Mobile_Number_Svg,
      startsIcon: "PhoneAndroidSharp",
      iconStyle: {
        color: "var(--theme-color3)",
        height: 20,
        width: 20,
      },
      GridProps: {
        xs: 12,
        sm: 6,
        md: 4,
        lg: 2,
        xl: 2,
      },
      validate: (columnValue, allField, flag) => {
        if (columnValue.value.length <= 0) {
          return "";
        } else if (columnValue.value.length >= 11) {
          return "The length of your Mobile Number is greater than 10 character";
        } else if (columnValue.value.length <= 9) {
          return "The length of your Mobile Number is less than 10 character";
        }
        return "";
      },
    },
    {
      render: {
        componentType: "panCardOptional",
      },
      name: "PAN_NO",
      label: "PAN_NO",
      placeholder: "EnterPAN",
      maxLength: 10,
      type: "text",
      schemaValidation: {
        type: "string",
      },
      startsIcon: "PaymentRounded",
      iconStyle: {
        height: 25,
        color: "var(--theme-color3)",
        width: 25,
      },
      GridProps: {
        xs: 12,
        sm: 6,
        md: 4,
        lg: 2,
        xl: 2,
      },
      validate: (columnValue, allField, flag) => {
        let regex = /^([A-Z]){5}([0-9]){4}([A-Z]){1}?$/;

        if (columnValue.value.length <= 0) {
          return "";
        } else if (/[a-z]/.test(columnValue.value)) {
          return "Please enter uppercase letters only";
        } else if (!regex.test(columnValue.value)) {
          return "Please Enter Valid Format";
        }
        return "";
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "Account_Name",
      placeholder: "EnterAccountName",
      type: "text",
      maxLength: 100,
      validate: (columnValue, allField, flag) => {
        if (columnValue.value && columnValue.value?.length < 3) {
          return "Please enter at least 3 characters.";
        }
        return "";
      },
      GridProps: {
        xs: 12,
        sm: 6,
        md: 4,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PASSPORT_NO",
      label: "PassportNo",
      type: "text",
      maxLength: 20,
      autoComplete: "off",
      showMaxLength: false,
      txtTransform: "uppercase",
      placeholder: "EnterPassportNo",
      // ignoreInSubmit: true,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      validate: (columnValue) => {
        if (columnValue?.value?.includes(" ")) {
          return "SpaceNotAllowed";
        }
        if (columnValue?.value) {
          if (!REGEX?.ALPHA_NUMERIC?.test(columnValue?.value)) {
            return "PleaseEnterAlphanumericValue";
          }
        }
      },
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ELECTION_CARD_NO",
      label: "VoterId",
      placeholder: "VoterId",
      maxLength: 20,
      type: "text",
      txtTransform: "uppercase",
      preventSpecialChars: PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER,
      validate: (columnValue) => {
        if (columnValue?.value?.includes(" ")) {
          return "SpaceNotAllowed";
        }
        if (columnValue?.value) {
          if (!REGEX?.ALPHA_NUMERIC?.test(columnValue?.value)) {
            return "PleaseEnterAlphanumericValue";
          }
        }
      },
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DRIVING_LICENSE_NO",
      label: "drivingLiceneceNo",
      placeholder: "drivingLiceneceNo",
      maxLength: 20,
      preventSpecialChars: PREVENT_SPECIAL_CHAR.SPECIAL_CHARACTER,
      validate: (columnValue) => {
        if (columnValue?.value?.includes(" ")) {
          return "SpaceNotAllowed";
        }
        if (columnValue?.value) {
          if (!REGEX?.ALPHA_NUMERIC?.test(columnValue?.value)) {
            return "PleaseEnterAlphanumericValue";
          }
        }
      },
      type: "text",
      txtTransform: "uppercase",
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "UNIQUE_ID",
      label: "UIDAadhaar",
      placeholder: "EnterAadhaarNo",
      type: "text",
      maxLength: 12,
      validate: (columnValue, allField, flag) => {
        if (columnValue.value && columnValue.value?.length < 4) {
          return "Please enter at least 4 digits.";
        }
        return "";
      },
      txtTransform: "uppercase",
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "PID_DESCRIPTION",
      label: "Retrieve",
      endsIcon: "YoutubeSearchedFor",
      rotateIcon: "scale(1.5)",
      placeholder: "",
      ignoreInSubmit: true,
      type: "text",
      GridProps: {
        xs: 12,
        sm: 3,
        md: 1,
        lg: 1,
        xl: 1,
      },
    },
    // {
    //   render: {
    //     componentType: "accountCode",
    //   },
    //   // acctTypeCustomAPI: GeneralAPI.getBranchCodeList,
    //   // branchCodeCustomAPI: GeneralAPI.getAccountTypeList,
    //   // branchCode_optionsKey: "getAccountTypeList",
    //   // acctType_optionsKey: "getBranchCodeList",
    //   // options: getBranchCodeList,
    //   // _optionsKey: "justForTestings",
    //   // name: "TEST",
    //   // label: "test",
    // },
    // {
    //   render: {
    //     componentType: "accountType",
    //   },
    //   // acctTypeCustomAPI: GeneralAPI.getBranchCodeList,
    //   // branchCodeCustomAPI: GeneralAPI.getAccountTypeList,
    //   // branchCode_optionsKey: "getAccountTypeList",
    //   // acctType_optionsKey: "getBranchCodeList",
    //   // options: getBranchCodeList,
    //   // _optionsKey: "justForTestings",
    //   // name: "TEST",
    //   // label: "test",
    // },
    // {
    //   render: {
    //     componentType: "branchCode",
    //   },
    //   // acctTypeCustomAPI: GeneralAPI.getBranchCodeList,
    //   // branchCodeCustomAPI: GeneralAPI.getAccountTypeList,
    //   // branchCode_optionsKey: "getAccountTypeList",
    //   // acctType_optionsKey: "getBranchCodeList",
    //   // options: getBranchCodeList,
    //   // _optionsKey: "justForTestings",
    //   // name: "TEST",
    //   // label: "test",
    // },
  ],
};
export const AccountInquiryGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "SearchCriteriaData",
    rowIdColumn: "U_ID",
    searchPlaceholder: "Accounts",
    defaultColumnConfig: {
      width: 150,
      maxWidth: 250,
      minWidth: 100,
    },
    allowColumnReordering: true,
    disableSorting: false,
    hideHeader: false,
    disableGroupBy: true,
    enablePagination: true,
    pageSizes: [20, 30, 50],
    defaultPageSize: 20,
    containerHeight: {
      min: "100vh",
      max: "100vh",
    },
    occupiedHeight: {
      min: "420px",
      max: "420px",
    },
    allowFilter: false,
    allowColumnHiding: false,
    isCusrsorFocused: true,
    allowRowSelection: false,
  },
  // filters: [],
  columns: [
    {
      columnName: "AcctHolderType",
      accessor: "ACCT_STATUS",
      sequence: 1,
      componentType: "default",
      width: 120,
      minWidth: 120,
      maxWidth: 160,
      alignment: "left",
    },
    {
      columnName: "AcctType",
      accessor: "TYPE_NM",
      sequence: 1,
      componentType: "default",
      width: 120,
      minWidth: 120,
      maxWidth: 160,
      alignment: "left",
    },
    {
      accessor: "ACCT_NO",
      columnName: "AccountNo",
      sequence: 2,
      alignment: "left",
      componentType: "default",
      width: 140,
      minWidth: 140,
      maxWidth: 180,
    },
    {
      accessor: "ACCT_NM",
      columnName: "Account_Name",
      sequence: 3,
      alignment: "left",
      componentType: "default",
      width: 280,
      minWidth: 180,
      isReadOnly: true,
      maxWidth: 300,
    },
    {
      accessor: "CUSTOMER_ID",
      columnName: "CustomerId",
      sequence: 4,
      alignment: "left",
      componentType: "default",
      width: 100,
      minWidth: 60,
      maxWidth: 120,
    },
    {
      accessor: "CONTACT2",
      columnName: "MobileNo",
      sequence: 5,
      alignment: "left",
      componentType: "default",
      width: 140,
      minWidth: 140,
      maxWidth: 180,
    },
    {
      accessor: "PAN_NO",
      columnName: "PAN_NO",
      sequence: 6,
      alignment: "left",
      componentType: "default",
      width: 140,
      minWidth: 140,
      maxWidth: 180,
    },
    {
      accessor: "WITHDRAW_BAL",
      columnName: "WithdrawBalance",
      sequence: 7,
      color: "red",
      alignment: "left",
      componentType: "currency",
      width: 140,
      minWidth: 140,
      maxWidth: 180,
    },
    {
      accessor: "E_MAIL_ID",
      columnName: "EmailID",
      sequence: 8,
      alignment: "left",
      componentType: "default",
      width: 140,
      minWidth: 140,
      maxWidth: 180,
    },

    {
      accessor: "OP_DATE",
      columnName: "OpeningDate",
      sequence: 9,
      alignment: "left",
      componentType: "date",
      dateFormat: "dd/MM/yyyy",
      isReadOnly: true,
      width: 140,
      minWidth: 140,
      maxWidth: 140,
    },
    {
      accessor: "DISPLAY_STATUS",
      columnName: "STATUS",
      sequence: 10,
      alignment: "left",
      componentType: "default",
      isReadOnly: true,
      width: 100,
      minWidth: 100,
      maxWidth: 100,
    },
    {
      accessor: "CLOSE_DT",
      columnName: "CloseDate",
      sequence: 11,
      alignment: "left",
      componentType: "date",
      dateFormat: "dd/MM/yyyy",
      isReadOnly: true,
      width: 140,
      minWidth: 140,
      maxWidth: 170,
    },
  ],
};
export const DependenciesData = {
  title: "Dependencies Other Accounts",
  disableGroupBy: true,
  hideFooter: false,
  hideAmountIn: true,
  retrievalType: "DATE",
  sequenceColumnConfig: {
    width: 80,
  },
  containerHeight: {
    min: "82vh",
    max: "82vh",
  },
  occupiedHeight: {
    min: "190px",
    max: "190px",
  },
  // filters: [
  //   {
  //     accessor: "FROM_DT",
  //     columnName: "From Date",
  //     filterComponentType: "valueDateFilter",
  //     gridProps: {
  //       xs: 12,
  //       md: 12,
  //       sm: 12,
  //     },
  //   },
  //   {
  //     accessor: "TO_DT",
  //     columnName: "To Date",
  //     filterComponentType: "valueDateFilter",
  //     gridProps: {
  //       xs: 12,
  //       md: 12,
  //       sm: 12,
  //     },
  //   },
  // ],
  columns: [
    {
      columnName: "Assets_Liabilities",
      accessor: "ASS_LIB",
      width: 180,
    },
    {
      columnName: "Account_Status",
      accessor: "ACCT_STATUS",
      width: 140,
    },
    {
      columnName: "AccountNo",
      accessor: "AC_CD",
      width: 160,
    },
    {
      columnName: "Account_Name",
      accessor: "ACCT_NM",
      width: 360,
    },
    {
      columnName: "OpeningDate",
      accessor: "OP_DATE",
      alignment: "center",
      Cell: components.DateCell,
      format: "dd/MM/yyyy",
      width: 140,
    },
    {
      columnName: "Status",
      accessor: "STATUS",
      width: 100,
    },
  ],
};
export const PassbookStatement: any = {
  form: {
    name: "passbookstatement",
    label: "Retrieve Account Statement",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 4,
          md: 4,
        },
        container: {
          direction: "row",
          spacing: 0.5,
        },
      },
    },
    componentProps: {
      textField: {
        fullWidth: true,
      },
      select: {
        fullWidth: true,
      },
      datePicker: {
        fullWidth: true,
      },
      numberFormat: {
        fullWidth: true,
      },
      inputMask: {
        fullWidth: true,
      },
      datetimePicker: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "_accountNumber",
      },
      // acctFieldPara: "1",
      // postValidationSetCrossFieldValues: "testingFn",
      name: "ACCT_CD",
    },
    // {
    //   render: {
    //     componentType: "reportAccountType",
    //   },
    //   // acctFieldPara: "1",
    //   // postValidationSetCrossFieldValues: "testingFn",
    //   name: "ACCT_CD",
    // },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "AccountHolder",
      placeholder: "AccountHolder",
      type: "text",
      isReadOnly: true,
      fullWidth: true,

      GridProps: {
        xs: 12,
        md: 12,
        sm: 12,
        lg: 12,
        xl: 12,
      },
    },

    {
      render: {
        componentType: "datePicker",
      },
      name: "STMT_FROM_DATE",
      label: "From Date :-",
      // format: "dd/MM/yyyy hh",
      placeholder: "",
      GridProps: {
        xs: 12,
        md: 6,
        sm: 6,
        lg: 6,
        xl: 6,
      },
      schemaValidation: {
        type: "string",
        rules: [
          { name: "required", params: ["From Date is required."] },
          { name: "typeError", params: ["Must be a valid date"] },
        ],
      },
      validate: (value, data, others) => {
        if (!value) {
          return "Must be a valid date.";
        }
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "WK_STMT_TO_DATE",
      label: "ToDate",
      placeholder: "",
      // format: "dd/MM/yyyy",
      schemaValidation: {
        type: "string",
        rules: [
          { name: "required", params: [" To date is required."] },
          { name: "typeError", params: ["Must be a valid date"] },
        ],
      },
      dependentFields: ["STMT_FROM_DATE"],
      runValidationOnDependentFieldsChange: true,
      // },
      // validate: (value, data, others) => {
      //   if (!Boolean(value)) {
      //     return "This field is required.";
      //   }
      //   let toDate = new Date(value?.value);
      //   let fromDate = new Date(data?.STMT_FROM_DATE?.value);
      //   if (!greaterThanInclusiveDate(toDate, fromDate)) {
      //     return `To Date should be greater than or equal to From Date.`;
      //   }
      //   return "";
      // },
      validate: {
        conditions: {
          all: [
            {
              fact: "dependentFields",
              path: "$.STMT_FROM_DATE.value",
              operator: "lessThanInclusiveDate",
              value: { fact: "currentField", path: "$.value" },
            },
          ],
        },
        success: "",
        failure: "To Date should be greater than or equal to From Date.",
      },
      GridProps: {
        xs: 12,
        md: 6,
        sm: 6,
        lg: 6,
        xl: 6,
      },
    },
    // {
    //   render: {
    //     componentType: "currency",
    //   },
    //   label: "Amount",
    //   placeholder: "Enter Minimum Amount",
    //   required: true,
    //   GridProps: { xs: 12, sm: 6, md: 6 },
    //   // isCurrencyCode: true,
    //   // FormatProps: {
    //   //   thousandsGroupStyle: "lakh",
    //   //   decimalScale: 1,
    //   // },
    //   enableNumWords: false,
    //   // StartAdornment: "BDT",
    // },

    // {
    //   render: {
    //     componentType: "amountField",
    //   },
    //   // options: getBranchCodeList,
    //   // _optionsKey: "justForTestings",
    //   // name: "TEST",
    //   // label: "test",
    // },
  ],
};
export const AccountInquiry = {
  form: {
    name: "AccountInquiry",
    label: "PassbookStatementPrintOption",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    // submitAction: "home",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 4,
          md: 4,
        },
        container: {
          direction: "row",
          spacing: 0.5,
        },
      },
    },
    componentProps: {
      textField: {
        fullWidth: true,
      },
      select: {
        fullWidth: true,
      },
      datePicker: {
        fullWidth: true,
      },
      numberFormat: {
        fullWidth: true,
      },
      inputMask: {
        fullWidth: true,
      },
      datetimePicker: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "numberFormat",
      },
      name: "ACCT_NO",
      label: "AccountNo",
      placeholder: "AccountNo",
      defaultValue: "",
      type: "text",
      isReadOnly: true,
      fullWidth: true,
      autoComplete: false,
      schemaValidation: {
        type: "string",
      },
      GridProps: {
        xs: 12,
        sm: 6,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "AccountHolder",
      placeholder: "AccountHolder",
      type: "text",
      isReadOnly: true,
      fullWidth: true,
      GridProps: {
        xs: 12,
        sm: 6,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },

    {
      render: {
        componentType: "radio",
      },
      name: "PD_DESTION",
      label: "",
      RadioGroupProps: { row: true },
      defaultValue: (formState, authState) => {
        return formState?.rowsData?.PARENT_CODE === "SB01" ? "P" : "S";
      },
      options: [
        { label: "Statement ", value: "S" },
        {
          label: "Passbook",
          value: "P",
        },
      ],

      GridProps: {
        xs: 12,
        md: 11,
        sm: 11,
        lg: 11,
        xl: 11,
      },
    },
    {
      render: {
        componentType: "radio",
      },
      name: "PID_DESCRIPION",
      label: "",
      RadioGroupProps: { row: true },
      defaultValue: "D",
      options: [
        {
          label: "FrontPage",
          value: "F",
        },
        { label: "FirstPage", value: "A" },
        { label: "Detail", value: "D" },
      ],
      dependentFields: ["PD_DESTION", "TRAN_CD"],
      validationRun: "onChange",
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};

        if (currentField?.value) {
          return {
            TRAN_CD: {
              value: "",
              isFieldFocused: true,
              ignoreUpdate: false,
            },
          };
        }
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.PD_DESTION?.value === "P") {
          return false;
        } else {
          return true;
        }
      },

      GridProps: {
        xs: 12,
        md: 12,
        sm: 12,
        lg: 12,
        xl: 12,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "TRAN_CD",
      label: "Template",
      defaultValueKey: "defaultValue",
      dependentFields: ["PD_DESTION", "PID_DESCRIPION"],
      fullWidth: true,
      disableCaching: true,
      options: async (dependentValue, formState, _, authState) => {
        if (
          dependentValue?.PID_DESCRIPION?.value &&
          dependentValue?.PD_DESTION?.value === "P"
        ) {
          // handleButonDisable use for disable "Ok" button while getPassBookTemplate api call
          formState.handleButonDisable(true);
          try {
            const data = await getPassBookTemplate({
              COMP_CD: authState?.companyID,
              BRANCH_CD: authState?.user?.branchCode,
              ACCT_TYPE: formState?.rowsData?.ACCT_TYPE,
              FLAG: "PAS" + dependentValue?.PID_DESCRIPION?.value,
            });
            return data;
          } catch (err) {
            console.log("err", err);
            return [];
          } finally {
            formState.handleButonDisable(false);
          }
        } else {
          return [];
        }
      },
      postValidationSetCrossFieldValues: (curr, formState) => {
        if (formState?.isSubmitting) return {};
        if (curr?.optionData?.length > 0) {
          return {
            LINE_PER_PAGE: {
              value: curr?.optionData?.[0]?.LINE_PER_PAGE ?? "",
              isFieldFocused: false,
              ignoreUpdate: false,
            },
          };
        }
        if (!curr?.optionData) {
          return {
            LINE_PER_PAGE: {
              value: "",
              isFieldFocused: false,
              ignoreUpdate: false,
            },
          };
        }
      },
      _optionsKey: "getPassBookTemplate",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["TemplateRequired"] }],
      },
      GridProps: {
        xs: 12,
        sm: 6,
        md: 6,
        lg: 6,
        xl: 6,
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.PD_DESTION?.value === "P") {
          return false;
        } else {
          return true;
        }
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "LINE_PER_PAGE",
    },

    {
      render: {
        componentType: "numberFormat",
      },
      name: "PASS_BOOK_LINE",
      label: "LineNo",
      type: "text",
      fullWidth: true,
      autoComplete: false,
      GridProps: {
        xs: 6,
        sm: 3,
        md: 3,
        lg: 3,
        xl: 3,
      },
      dependentFields: ["PD_DESTION", "PID_DESCRIPION", "TRAN_CD", "REPRINT"],
      runValidationOnDependentFieldsChange: true,
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (
          dependentFieldsValues?.PD_DESTION?.value === "P" &&
          (!dependentFieldsValues?.REPRINT?.value ||
            dependentFieldsValues?.REPRINT?.value === "")
        ) {
          return true;
        } else {
          return false;
        }
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        authState,
        dependentValue
      ) => {
        if (formState?.isSubmitting) return {};

        if (field?.value === "0" || field?.value === "") {
          return {
            PASS_BOOK_LINE: {
              value: dependentValue?.TRAN_CD?.optionData?.[0]?.DEFAULT_LINE
                ? Number(dependentValue?.TRAN_CD?.optionData?.[0]?.DEFAULT_LINE)
                : "",

              ignoreUpdate: true,
            },
          };
        }
      },

      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          dependentFieldsValues?.PD_DESTION?.value === "P" &&
          dependentFieldsValues?.PID_DESCRIPION?.value === "D"
        ) {
          return false;
        } else {
          return true;
        }
      },
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: true,
        isAllowed: (values) => {
          if (values?.value?.length > 2) {
            return false;
          }
          return true;
        },
      },
      validate: (columnValue, dependentFields) => {
        if (
          dependentFields?.TRAN_CD?.optionData?.[0]?.DEFAULT_LINE &&
          Boolean(columnValue?.value)
        ) {
          if (
            Number(columnValue?.value) >=
              Number(dependentFields?.TRAN_CD?.optionData?.[0]?.DEFAULT_LINE) &&
            Number(columnValue?.value) <=
              Number(dependentFields?.TRAN_CD?.optionData?.[0]?.LINE_PER_PAGE)
          ) {
            return "";
          } else {
            return `${t(`LineNoValidation`, {
              from: dependentFields?.TRAN_CD?.optionData?.[0]?.DEFAULT_LINE,
              to: dependentFields?.TRAN_CD?.optionData?.[0]?.LINE_PER_PAGE,
            })}`;
          }
        }
      },
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "REPRINT_VALUE",
      dependentFields: ["REPRINT"],
      setValueOnDependentFieldsChange: (dependentFieldsValues) => {
        let value = Number(dependentFieldsValues?.REPRINT?.value);
        return value === 1 ? "Y" : "N";
      },
    },

    {
      render: {
        componentType: "formbutton",
      },
      name: "REPRINT",
      label: "Reprint",
      endsIcon: "Print",
      rotateIcon: "scale(1.4)",
      type: "text",
      // isReadOnly: true,
      fullWidth: true,
      autoComplete: false,
      dependentFields: ["PD_DESTION", "PID_DESCRIPION"],
      GridProps: {
        xs: 6,
        sm: 3,
        md: 3,
        lg: 3,
        xl: 3,
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          dependentFieldsValues?.PID_DESCRIPION?.value !== "D" ||
          (dependentFieldsValues?.PD_DESTION?.value === "P" &&
            fieldData?.value !== "")
        ) {
          return true;
        } else if (dependentFieldsValues?.PD_DESTION?.value === "S") {
          return true;
        } else {
          return false;
        }
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "LINE_NO_SPACER",
      GridProps: {
        xs: 12,
        sm: 6,
        md: 6,
        lg: 6,
        xl: 6,
      },
      dependentFields: ["PD_DESTION", "PID_DESCRIPION"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          dependentFieldsValues?.PD_DESTION?.value === "P" &&
          dependentFieldsValues?.PID_DESCRIPION?.value !== "D"
        ) {
          return false;
        } else {
          return true;
        }
      },
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "OP_DATE",
      format: "dd/MM/yyyy",
    },

    {
      render: {
        componentType: "datePicker",
      },
      name: "PASS_BOOK_DT",
      label: "FromDate",
      placeholder: "DD/MM/YYYY",
      type: "text",
      maxDate: new Date(),
      dependentFields: ["PD_DESTION", "REPRINT", "PID_DESCRIPION", "OP_DATE"],
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (
          dependentFieldsValues?.PD_DESTION?.value === "P" &&
          (!dependentFieldsValues?.REPRINT?.value ||
            dependentFieldsValues?.REPRINT?.value === "")
        ) {
          return true;
        } else if (
          dependentFieldsValues?.PD_DESTION?.value === "P" &&
          dependentFieldsValues?.PID_DESCRIPION?.value !== "D"
        ) {
          return true;
        } else {
          return false;
        }
      },

      onFocus: (date) => {
        date.target.select();
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.PD_DESTION?.value === "P") {
          return false;
        } else {
          return true;
        }
      },

      validate: (columnValue, dependentFields) => {
        if (Boolean(columnValue?.value) && !isValid(columnValue?.value)) {
          return "Mustbeavaliddate";
        } else if (
          new Date(columnValue?.value) <
          new Date(dependentFields?.OP_DATE?.value)
        ) {
          return `${t(`DateValidation`, {
            date: format(
              new Date(dependentFields?.OP_DATE?.value),
              "dd-MM-yyyy"
            ),
          })}`;
        } else {
          return "";
        }
      },

      GridProps: {
        xs: 12,
        sm: 6,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "PASS_BOOK_TO_DT",
      label: "ToDate",
      placeholder: "DD/MM/YYYY",
      defaultValue: new Date(),
      dependentFields: ["PD_DESTION"],
      isReadOnly: true,
      onFocus: (date) => {
        date.target.select();
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.PD_DESTION?.value === "P") {
          return false;
        } else {
          return true;
        }
      },

      GridProps: {
        xs: 12,
        sm: 6,
        md: 6,
        lg: 6,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "STMT_FROM_DATE",
      label: "FromDate",
      // format: "dd/MM/yyyy",
      placeholder: "",
      type: "text",
      dependentFields: ["PD_DESTION"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.PD_DESTION?.value === "S") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: {
        xs: 12,
        sm: 6,
        md: 6,
        lg: 6,
        xl: 6,
      },
      defaultValue: new Date(),
      // onFocus: (date) => {
      //   date.target.select();
      // },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["From Date is required."] }],
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "WK_STMT_TO_DATE",
      label: "ToDate",
      placeholder: "",
      // format: "dd/MM/yyyy",
      onFocus: (date) => {
        date.target.select();
      },
      dependentFields: ["PD_DESTION", "STMT_FROM_DATE"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.PD_DESTION?.value === "S") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: {
        xs: 12,
        sm: 6,
        md: 6,
        lg: 6,
        xl: 6,
      },
      defaultValue: new Date(),
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["Effective To is required."] }],
      },
      runValidationOnDependentFieldsChange: true,
      validate: {
        conditions: {
          all: [
            {
              fact: "dependentFields",
              path: "$.STMT_FROM_DATE.value",
              operator: "lessThanInclusiveDate",
              value: { fact: "currentField", path: "$.value" },
            },
          ],
        },
        success: "",
        failure: "To Date should be greater than or equal to From Date.",
      },
    },
  ],
};
export const ViewDetailMetadata = {
  form: {
    name: "ViewDetailMetadata",
    label: "Account Detail",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 4,
          md: 4,
        },
        container: {
          direction: "row",
          spacing: 0.5,
        },
      },
    },
    componentProps: {
      textField: {
        fullWidth: true,
      },
      select: {
        fullWidth: true,
      },
      datePicker: {
        fullWidth: true,
      },
      numberFormat: {
        fullWidth: true,
      },
      inputMask: {
        fullWidth: true,
      },
      datetimePicker: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NO",
      label: "AccountNo",
      placeholder: "AccountNo",
      defaultValue: "",
      type: "text",
      isReadOnly: true,
      fullWidth: true,
      autoComplete: false,
      schemaValidation: {
        type: "string",
      },
      GridProps: {
        xs: 12,
        md: 4,
        sm: 4,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      isReadOnly: true,
      name: "ACCT_NM",
      label: "AccountHolder",
      placeholder: "AccountHolder",
      type: "text",
      GridProps: {
        xs: 12,
        md: 4,
        sm: 4,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CUSTOMER_ID",
      label: "Customer Id",
      placeholder: "Customer Id",
      isReadOnly: true,
      type: "text",
      GridProps: {
        xs: 12,
        md: 4,
        sm: 4,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CONTACT2",
      label: "Mobile No.",
      placeholder: "Mobile Number",
      isReadOnly: true,
      type: "text",
      isrequired: true,
      GridProps: {
        xs: 12,
        md: 4,
        sm: 4,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PAN_NO",
      label: "Pan No.",
      isReadOnly: true,
      placeholder: "Pan Number",
      type: "text",
      GridProps: {
        xs: 12,
        md: 4,
        sm: 4,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DISPLAY_STATUS",
      isReadOnly: true,
      label: "Status",
      placeholder: "Status",
      type: "text",
      GridProps: {
        xs: 12,
        md: 4,
        sm: 4,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "OP_DATE",
      label: "Opening Date",
      isReadOnly: true,
      placeholder: "Opening Date",
      type: "text",
      GridProps: {
        xs: 12,
        md: 4,
        sm: 4,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CLOSE_DT",
      label: "Close Date",
      placeholder: "Close Date",
      isReadOnly: true,
      type: "text",
      GridProps: {
        xs: 12,
        md: 4,
        sm: 4,
      },
    },
  ],
};
