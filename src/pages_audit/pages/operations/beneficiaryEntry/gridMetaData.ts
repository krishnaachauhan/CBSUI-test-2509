import { GridMetaDataType, utilFunction } from "@acuteinfo/common-base";
import { GeneralAPI } from "registry/fns/functions";
import * as API from "./api";
import { getIfscBenDetail } from "./api";
import { textTransform } from "@mui/system";

export const accountFindmetaData = {
  form: {
    name: "accountNumber",
    label: "",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
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
      _accountNumber: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "_accountNumber",
      },
      branchCodeMetadata: {
        name: "BRANCH_CD",
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          return {
            ACCT_NM: { value: "" },
            ACCT_TYPE: { value: "" },
            ACCT_CD: { value: "" },
          };
        },
        GridProps: { xs: 12, sm: 2.5, md: 2.5, lg: 2.5, xl: 2.5 },
      },

      accountTypeMetadata: {
        name: "ACCT_TYPE",
        GridProps: { xs: 12, sm: 2.5, md: 2.5, lg: 2.5, xl: 2.5 },
        isFieldFocused: true,
        defaultfocus: true,
        defaultValue: "",
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            currentField?.value &&
            dependentFieldValues?.BRANCH_CD?.value?.length === 0
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "Alert",
              message: "Enter Account Branch.",
              buttonNames: ["Ok"],
              icon: "WARNING",
            });

            if (buttonName === "Ok") {
              return {
                BRANCH_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
                ACCT_TYPE: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
                ACCT_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
                ACCT_NM: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
              };
            }
          }
          formState.setDataOnFieldChange("GRID_DETAIL", []);
          return {
            ACCT_CD: { value: "" },
            ACCT_NM: { value: "" },
            TRAN_BAL: { value: "" },
          };
        },
      },
      accountCodeMetadata: {
        name: "ACCT_CD",
        fullWidth: true,
        FormatProps: {
          allowNegative: false,
          isAllowed: (values) => {
            if (values?.value?.length > 6) {
              return false;
            }
            return true;
          },
        },
        dependentFields: ["ACCT_TYPE", "BRANCH_CD"],
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          auth,
          dependentFieldsValues
        ) => {
          if (
            field.value &&
            dependentFieldsValues?.["ACCT_TYPE"]?.value &&
            dependentFieldsValues?.["BRANCH_CD"]?.value
          ) {
            if (formState?.isSubmitting) return {};
            let Apireq = {
              COMP_CD: auth?.companyID,
              ACCT_CD: utilFunction.getPadAccountNumber(
                field?.value,
                dependentFieldsValues?.["ACCT_TYPE"]?.optionData
              ),
              ACCT_TYPE: dependentFieldsValues?.["ACCT_TYPE"]?.value,
              BRANCH_CD: dependentFieldsValues?.["BRANCH_CD"]?.value,
              SCREEN_REF: "MST/604",
              GD_TODAY_DT: auth?.workingDate,
            };
            let postData = await GeneralAPI.getAccNoValidation(Apireq);
            let btn99, returnVal;
            const getButtonName = async (obj) => {
              let btnName = await formState.MessageBox(obj);
              return { btnName, obj };
            };
            for (let i = 0; i < postData?.MSG?.length; i++) {
              if (postData?.MSG?.[i]?.O_STATUS === "999") {
                formState.setDataOnFieldChange("GRID_DETAIL", []);
                const { btnName, obj } = await getButtonName({
                  messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE,
                  message: postData?.MSG?.[i]?.O_MESSAGE,
                  icon: "ERROR",
                });
                returnVal = "";
              } else if (postData?.MSG?.[i]?.O_STATUS === "9") {
                if (btn99 !== "No") {
                  const { btnName, obj } = await getButtonName({
                    messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE,
                    message: postData?.MSG?.[i]?.O_MESSAGE,
                    icon: "WARNING",
                  });
                }
                returnVal = postData;
              } else if (postData?.MSG?.[i]?.O_STATUS === "99") {
                const { btnName, obj } = await getButtonName({
                  messageTitle: postData?.MSG?.[i]?.O_MSG_TITLE,
                  message: postData?.MSG?.[i]?.O_MESSAGE,
                  buttonNames: ["Yes", "No"],
                  icon: "CONFIRM",
                });

                btn99 = btnName;
                if (btnName === "No") {
                  returnVal = "";
                }
              } else if (postData?.MSG?.[i]?.O_STATUS === "0") {
                if (btn99 !== "No") {
                  returnVal = postData;
                } else {
                  returnVal = "";
                }
                formState.setDataOnFieldChange("API_REQ", Apireq);
              }
            }
            btn99 = 0;
            return {
              FROM_ACCT_CD:
                returnVal !== ""
                  ? {
                      value: utilFunction.getPadAccountNumber(
                        field?.value,
                        dependentFieldsValues?.ACCT_TYPE?.optionData
                      ),
                      isFieldFocused: false,
                      ignoreUpdate: true,
                    }
                  : {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
              ACCT_NM: {
                value: returnVal?.ACCT_NM ?? "",
              },
            };
          } else {
            formState.setDataOnFieldChange("GRID_DETAIL", []);
            return {
              ACCT_NM: { value: "" },
            };
          }
        },
        runPostValidationHookAlways: true,
        GridProps: { xs: 12, sm: 2.5, md: 2.5, lg: 2.5, xl: 2.5 },
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "AccountName",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4.5, md: 4.5, lg: 4.5, xl: 4.5 },
    },
  ],
};

export const AddNewBenfiDetailGridMetadata: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "BeneficiaryAccountDetails",
    rowIdColumn: "TRAN_CD",
    defaultColumnConfig: {
      width: 150,
      maxWidth: 250,
      minWidth: 100,
    },
    allowColumnReordering: true,
    disableSorting: false,
    disableGroupBy: true,
    enablePagination: false,
    disableGlobalFilter: true,
    hideFooter: false,
    hideHeader: false,
    pageSizes: [10, 20, 30],
    defaultPageSize: 10,
    containerHeight: {
      min: "44vh",
      max: "44vh",
    },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
  },
  filters: [],
  columns: [
    {
      accessor: "SR_CD",
      columnName: "SrNo",
      sequence: 1,
      componentType: "default",
      width: 70,
      minWidth: 60,
      maxWidth: 120,
      isAutoSequence: true,
    },

    {
      accessor: "TO_IFSCCODE",
      columnName: "IFSCCode",
      sequence: 2,
      componentType: "default",
      width: 120,
      minWidth: 100,
      maxWidth: 200,
      isVisible: true,
    },
    {
      accessor: "TO_ACCT_TYPE",
      columnName: "AcctType",
      sequence: 3,
      componentType: "default",
      width: 110,
      minWidth: 100,
      maxWidth: 150,
      isVisible: true,
    },

    {
      accessor: "TO_ACCT_NO",
      columnName: "ACNo",
      sequence: 4,
      componentType: "default",
      width: 160,
      minWidth: 150,
      maxWidth: 300,
    },
    {
      accessor: "TO_ACCT_NM",
      columnName: "Account_Name",
      sequence: 5,
      componentType: "default",
      width: 180,
      minWidth: 150,
      maxWidth: 250,
    },

    {
      accessor: "TO_ADD1",
      columnName: "Address",
      sequence: 6,
      componentType: "default",
      width: 320,
      minWidth: 300,
      maxWidth: 400,
    },
    {
      accessor: "TO_CONTACT_NO",
      columnName: "MobileNo",
      sequence: 7,
      componentType: "default",
      width: 120,
      minWidth: 100,
      maxWidth: 200,
    },
    {
      accessor: "TO_EMAIL_ID",
      columnName: "EmailID",
      sequence: 8,
      componentType: "default",
      width: 150,
      minWidth: 100,
      maxWidth: 250,
    },
    {
      accessor: "ACTIVE_FLAG",
      columnName: "Active",
      sequence: 9,
      componentType: "default",
      width: 100,
      minWidth: 90,
      maxWidth: 120,
    },
    {
      accessor: "REMARKS",
      columnName: "Remarks",
      sequence: 10,
      componentType: "default",
      width: 260,
      minWidth: 200,
      maxWidth: 300,
    },
    {
      accessor: "TO_LEI_NO",
      columnName: "LEI No.",
      sequence: 11,
      componentType: "default",
      width: 260,
      minWidth: 200,
      maxWidth: 300,
    },
  ],
};
export const AuditBenfiDetailFormMetadata = {
  form: {
    name: "BeneficiaryAccountAuditTrail",
    label: "BeneficiaryAccountDetails",
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
      name: "TO_IFSCCODE",
      label: "IFSCCode",
      type: "text",
      placeholder: "EnterIFSCCode",
      maxLength: 11,
      handleKeyDown: (e, dependenet, authstate, formstate) => {
        if (e.key === "F5") {
          e.preventDefault();
          formstate.setDataOnFieldChange("F5");
        }
      },
      txtTransform: "uppercase",
      __EDIT__: {
        isReadOnly: true,
      },
      __NEW__: {
        required: true,
        schemaValidation: {
          type: "string",
          rules: [
            { name: "required", params: ["PleaseEnterTheBeneficiaryIFSCCode"] },
          ],
        },
        runPostValidationHookAlways: true,
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          auth,
          dependentFieldsValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (field?.value) {
            let postData = await getIfscBenDetail({
              IFSC_CODE: field?.value ?? "",
              ENTRY_TYPE: "",
              USERNAME: auth?.user?.id ?? "",
              USERROLE: auth?.role ?? "",
            });
            let btn99, returnVal;

            const getButtonName = async (obj) => {
              let btnName = await formState.MessageBox(obj);
              return { btnName, obj };
            };
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
                if (btnName === "No") {
                  returnVal = "";
                }
              } else if (postData[i]?.O_STATUS === "0") {
                if (btn99 !== "No") {
                  returnVal = postData[i];
                } else {
                  returnVal = "";
                }
              }
            }
            btn99 = 0;

            return {
              TO_IFSCCODE:
                returnVal !== ""
                  ? {
                      value: field?.value,
                      ignoreUpdate: true,
                      isFieldFocused: false,
                    }
                  : {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
              BANK_NM: { value: returnVal.BANK_NM ?? "" },
              BRANCH_NM: { value: returnVal.BRANCH_NM ?? "" },
              CONTACT_DTL: { value: returnVal.CONTACT_DTL ?? "" },
              CENTRE_NM: { value: returnVal.CENTRE_NM ?? "" },
              ADDR: { value: returnVal.ADDR ?? "" },
              DISTRICT_NM: { value: returnVal.DISTRICT_NM ?? "" },
              STATE_NM: { value: returnVal.STATE_NM ?? "" },
              MICR_CODE: { value: returnVal.MICR_CODE ?? "" },
              PARA_162: { value: returnVal.PARA_162 ?? "" },
            };
          } else if (!field?.value) {
            return {
              MICR_CODE: { value: "" },
              BANK_NM: { value: "" },
              BRANCH_NM: { value: "" },
              CONTACT_DTL: { value: "" },
              CENTRE_NM: { value: "" },
              ADDR: { value: "" },
              DISTRICT_NM: { value: "" },
              STATE_NM: { value: "" },
              PARA_162: { value: "" },
            };
          }
        },
      },
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PARA_162",
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "TO_ACCT_TYPE",
      label: "AcctType",
      placeholder: "AccountTypePlaceHolder",
      type: "text",
      txtTransform: "uppercase",
      options: () => {
        return API.getAcctTypeData();
      },
      _optionsKey: "getAcctTypeData",
      __EDIT__: {
        isReadOnly: true,
      },
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TO_ACCT_NO",
      label: "ACNumber",
      placeholder: "AccountNumberPlaceHolder",
      type: "text",
      maxLength: 35,
      txtTransform: "uppercase",
      __NEW__: {
        required: true,
        schemaValidation: {
          type: "string",
          rules: [
            { name: "required", params: ["PleaseEnterTheBeneficiaryAcNumber"] },
          ],
        },
        validate: (columnValue, allField, flag) => {
          let regex = /^[a-zA-Z0-9 ]*$/;
          // special-character not allowed
          if (columnValue.value) {
            if (!regex.test(columnValue.value)) {
              return "PleaseEnterAlphanumericValue";
            }
          }
          return "";
        },
      },
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
      __EDIT__: {
        isReadOnly: true,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TO_ACCT_NM",
      label: "Account_Name",
      placeholder: "EnterAcName",
      txtTransform: "uppercase",
      type: "text",
      required: true,
      __NEW__: {
        schemaValidation: {
          type: "string",
          rules: [
            { name: "required", params: ["PleaseEnterTheBeneficiaryAcName"] },
          ],
        },
      },
      __EDIT__: {
        isReadOnly: true,
      },
      GridProps: { xs: 12, sm: 5, md: 5, lg: 5, xl: 5 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "Verify_ignoreField",
      label: "Verify",
      type: "text",
      dependentFields: ["TO_ACCT_NO", "TO_IFSCCODE", "ACTIVE_FLAG", "FLAG"],
      GridProps: { xs: 12, sm: 1, md: 1, lg: 1, xl: 1 },
      isReadOnly: (fieldValue, dependentFields) => {
        console.log("dependentFields: ", dependentFields);
        if (
          dependentFields?.TO_ACCT_NO?.value &&
          dependentFields?.TO_IFSCCODE?.value
        ) {
          return false;
        } else {
          return true;
        }
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TO_ADD1",
      label: "Address",
      placeholder: "EnterAddress",
      type: "text",
      txtTransform: "uppercase",
      required: true,
      __NEW__: {
        schemaValidation: {
          type: "string",
          rules: [
            {
              name: "required",
              params: ["PleaseEnterTheBeneficiaryAcAddress"],
            },
          ],
        },
      },
      __EDIT__: {
        isReadOnly: true,
      },
      GridProps: { xs: 12, sm: 4.9, md: 4.9, lg: 4.9, xl: 4.9 },
    },

    {
      render: {
        componentType: "phoneNumberOptional",
      },
      name: "TO_CONTACT_NO",
      label: "MobileNo",
      placeholder: "EnterMobileNo",
      type: "text",
      startsIcon: "PhoneAndroidSharp",
      iconStyle: {
        color: "var(--theme-color3)",
        height: 20,
        width: 20,
      },
      maxLength: 10,
      __NEW__: {
        runValidationOnDependentFieldsChange: true,
        dependentFields: ["PARA_162"],
        validate: (currentField, dependentFields) => {
          if (
            dependentFields?.PARA_162?.value === "Y" &&
            !currentField?.value.trim()
          ) {
            return "PleaseEnterBeneficiaryMobileNo";
          }
          if (currentField?.value.trim()) {
            if (currentField.value.length >= 11) {
              return "MobileNumberGreaterThanValidation";
            } else if (currentField.value.length <= 9) {
              return "MobileNumberLessThanValidation";
            }
            return "";
          }
          return "";
        },
      },
      __EDIT__: {
        isReadOnly: true,
        render: {
          componentType: "textField",
        },
      },
      GridProps: { xs: 12, sm: 2.2, md: 2.2, lg: 2.2, xl: 2.2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TO_EMAIL_ID",
      label: "EmailID",
      placeholder: "EnterEmailID",
      type: "text",
      __EDIT__: {
        isReadOnly: true,
      },
      __NEW__: {
        runValidationOnDependentFieldsChange: true,
        dependentFields: ["PARA_162"],
        validate: (currentField, dependentFields) => {
          let emailRegex =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if (
            dependentFields?.PARA_162?.value === "Y" &&
            !currentField?.value.trim()
          ) {
            return "PleaseEnterTheBeneficiaryAcEmailID";
          } else if (
            currentField.value &&
            !emailRegex.test(currentField.value)
          ) {
            return "PleaseEnterValidEmailID";
          }
          return "";
        },
      },
      GridProps: { xs: 12, sm: 4.9, md: 4.9, lg: 4.9, xl: 4.9 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REMARKS",
      label: "Remarks",
      placeholder: "EnterRemark",
      type: "text",
      txtTransform: "uppercase",
      validate: (columnValue, allField, flag) => {
        let regex = /^[a-zA-Z0-9 ]*$/;
        // special-character not allowed
        if (columnValue.value) {
          if (!regex.test(columnValue.value)) {
            return "PleaseEnterAlphanumericValue";
          }
        }
        return "";
      },
      __EDIT__: {
        isReadOnly: true,
      },
      GridProps: { xs: 12, sm: 4.9, md: 4.9, lg: 4.9, xl: 4.9 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TO_LEI_NO",
      label: "LEINo",
      placeholder: "EnterTheLEINo",
      type: "text",
      maxLength: 20,
      FormatProps: {
        isAllowed: (values) => {
          if (values?.value?.length > 20) {
            return false;
          }
          return true;
        },
      },
      __EDIT__: {
        isReadOnly: true,
      },
      txtTransform: "uppercase",
      __NEW__: {
        validate: (columnValue, allField, flag) => {
          let regex = /^[a-zA-Z0-9]*$/;
          if (!regex.test(columnValue.value)) {
            return "LEINoShouldBeAlphaNumeric";
          } else if (columnValue?.value && columnValue?.value?.length < 20) {
            return "LEINoShouldBeExactlyCharacters";
          } else {
            return "";
          }
        },
      },
      GridProps: { xs: 12, sm: 4.9, md: 4.9, lg: 4.9, xl: 4.9 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "INACTIVE",
    },

    {
      render: {
        componentType: "hidden",
      },
      defaultValue: true,
      name: "FLAG",
      label: "Flag",
      __NEW__: {
        render: {
          componentType: "checkbox",
        },
      },
      postValidationSetCrossFieldValues: (
        field,
        formState,
        auth,
        dependentFieldsValues
      ) => {
        if (field.value === false) {
          formState?.MessageBox({
            messageTitle: "Alert",
            message: "ThisRecordWillNotSaveBeneficiaryMaster",
            icon: "WARNING",
          });
        }
        return {};
      },
      runPostValidationHookAlways: true,
      GridProps: { xs: 12, sm: 1, md: 1, lg: 1, xl: 1 },
    },
    {
      render: { componentType: "spacer" },
      defaultValue: true,
      name: "ACTIVE_FLAG",
      label: "Active",
      __EDIT__: {
        render: {
          componentType: "checkbox",
        },
        dependentFields: ["INACTIVE"],
        isReadOnly(fieldData, dependentFieldsValues, formState) {
          if (dependentFieldsValues?.INACTIVE?.value === "Y") {
            return false;
          } else {
            return true;
          }
        },
      },
      GridProps: { xs: 12, sm: 1, md: 1, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "divider",
      },
      dividerText: "IFSC Bank Detail",
      name: "Address",
      label: "IFSCBankDetail",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BANK_NM",
      label: "Bank",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4.5, md: 4.5, lg: 4.5, xl: 4.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ADDR",
      label: "Address",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4.6, md: 4.6, lg: 4.6, xl: 4.6 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BRANCH_NM",
      label: "Branch",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 2.9, md: 2.9, lg: 2.9, xl: 2.9 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "STATE_NM",
      label: "State",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 2.2, md: 2.2, lg: 2.2, xl: 2.2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DISTRICT_NM",
      label: "District",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 2.2, md: 2.2, lg: 2.2, xl: 2.2 },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "CENTRE_NM",
      label: "Center",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 2.2, md: 2.2, lg: 2.2, xl: 2.2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "MICR_CODE",
      label: "MICRCode",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 2.2, md: 2.2, lg: 2.2, xl: 2.2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CONTACT_DTL",
      label: "Contact",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 3.2, md: 3.2, lg: 3.2, xl: 3.2 },
    },
  ],
};
