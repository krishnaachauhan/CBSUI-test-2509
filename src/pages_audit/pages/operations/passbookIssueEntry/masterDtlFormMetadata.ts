import { MasterDetailsMetaData, utilFunction } from "@acuteinfo/common-base";
import {
  handleDisplayMessages,
  validateHOBranch,
} from "components/utilFunction/function";
import { isEmpty } from "lodash";
import { GeneralAPI } from "registry/fns/functions";

export const masterDtlFormMetadata: MasterDetailsMetaData = {
  masterForm: {
    form: {
      name: "lowCodeReportFormConfig",
      label: "New Passbook Issue",
      resetFieldOnUnmount: false,
      validationRun: "onBlur",
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
      },
    },
    fields: [
      {
        render: { componentType: "hidden" },
        name: "TRAN_CD",
      },
      {
        render: {
          componentType: "_accountNumber",
        },
        branchCodeMetadata: {
          required: false,
          schemaValidation: {},
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            authState
          ) => {
            if (formState?.isSubmitting) return {};

            const isHOBranch = await validateHOBranch(
              field,
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
              ACCT_CD: { value: "" },
              CUSTOMER_ID: { value: "" },
              CONTACT2: { value: "" },
              PAN_NO: { value: "" },
            };
          },

          GridProps: { xs: 12, sm: 4, md: 3, lg: 2, xl: 2 },
          runPostValidationHookAlways: true,
        },
        accountTypeMetadata: {
          dependentFields: ["BRANCH_CD"],
          validationRun: "onChange",
          required: false,
          schemaValidation: {},
          isFieldFocused: true,
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            authState,
            dependentFieldValues
          ) => {
            if (formState?.isSubmitting) return {};
            if (field?.value && !dependentFieldValues?.BRANCH_CD?.value) {
              let buttonName = await formState?.MessageBox({
                messageTitle: "ValidationFailed",
                message: "enterBranchCode",
                buttonNames: ["Ok"],
                icon: "ERROR",
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
                  ACCT_CD: { value: "", ignoreUpdate: false },
                };
              }
            }
          },
          runPostValidationHookAlways: true,
          GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 2.5 },
        },
        accountCodeMetadata: {
          name: "ACCT_CD",
          autoComplete: "off",
          dependentFields: ["ACCT_TYPE", "BRANCH_CD", "TRAN_CD"],
          runPostValidationHookAlways: true,
          postValidationSetCrossFieldValues: async (
            currentField,
            formState,
            authState,
            dependentFieldsValues
          ) => {
            if (formState?.isSubmitting) return {};

            if (
              currentField.value &&
              !dependentFieldsValues?.ACCT_TYPE?.value
            ) {
              const btn = await formState?.MessageBox({
                messageTitle: "ValidationFailed",
                message: "enterAccountType",
                buttonNames: ["Ok"],
                icon: "ERROR",
              });

              if (btn === "Ok") {
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
              return {};
            }

            if (
              currentField?.value &&
              dependentFieldsValues?.BRANCH_CD?.value &&
              dependentFieldsValues?.ACCT_TYPE?.value
            ) {
              const reqParams = {
                BRANCH_CD: dependentFieldsValues?.BRANCH_CD?.value,
                COMP_CD: authState?.companyID ?? "",
                ACCT_TYPE: dependentFieldsValues?.ACCT_TYPE?.value,
                ACCT_CD: utilFunction.getPadAccountNumber(
                  currentField?.value,
                  dependentFieldsValues?.ACCT_TYPE?.optionData?.[0] ?? ""
                ),
                GD_TODAY_DT: authState?.workingDate ?? "",
                SCREEN_REF: formState?.docCD ?? "",
              };

              const postData = await GeneralAPI.getAccNoValidation(reqParams);
              const messageResult = await handleDisplayMessages(
                postData?.MSG,
                formState.MessageBox,
                {
                  onNo: () => ({}),
                  onYes: async (obj) => {
                    if (obj?.O_COLUMN_NM === "FREEZE_AC") {
                      const freezeResponse = await GeneralAPI.doAccountFreeze({
                        ENT_COMP_CD: authState?.companyID ?? "",
                        ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
                        COMP_CD: authState?.companyID ?? "",
                        BRANCH_CD:
                          dependentFieldsValues?.BRANCH_CD?.value ?? "",
                        ACCT_TYPE:
                          dependentFieldsValues?.ACCT_TYPE?.value ?? "",
                        ACCT_CD: reqParams.ACCT_CD,
                      });

                      if (freezeResponse?.error) {
                        await formState.MessageBox({
                          messageTitle: "Error",
                          message:
                            freezeResponse?.errorMessage ??
                            "Unknown error occurred",
                          icon: "ERROR",
                          buttonNames: ["Ok"],
                        });
                        return "";
                      }
                      if (freezeResponse) formState.CloseMessageBox();
                    }
                    return obj;
                  },
                }
              );

              if (!isEmpty(messageResult)) {
                return {
                  ACCT_CD: {
                    value: reqParams.ACCT_CD,
                    isFieldFocused: false,
                    ignoreUpdate: true,
                  },
                  ACCT_NM: { value: postData?.ACCT_NM ?? "" },
                  TRAN_BAL: { value: postData?.TRAN_BAL ?? "" },
                };
              }

              return {
                ACCT_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
                ACCT_NM: { value: "" },
                TRAN_BAL: { value: "" },
              };
            }

            if (!currentField?.value) {
              return {
                ACCT_NM: { value: "" },
                TRAN_BAL: { value: "" },
              };
            }

            return {};
          },

          fullWidth: true,
          GridProps: { xs: 12, sm: 4, md: 3, lg: 1.7, xl: 1.7 },
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
          xs: 6,
          sm: 6,
          md: 4,
          lg: 4,
          xl: 4,
        },
      },
    ],
  },
  detailsGrid: {
    gridConfig: {
      dense: true,
      gridLabel: "Details",
      rowIdColumn: "SR_CD",
      defaultColumnConfig: { width: 350, minWidth: 300, maxWidth: 400 },
      allowColumnReordering: true,
      hideHeader: false,
      disableGroupBy: true,
      enablePagination: false,
      containerHeight: { min: "50vh", max: "50vh" },
      allowRowSelection: false,
      disableGlobalFilter: true,
      hiddenFlag: "_hidden",
      disableLoader: true,
    },
    columns: [
      {
        accessor: "NEW_SR_CD",
        columnName: "SrNo",
        componentType: "default",
        sequence: 1,
        alignment: "right",
        width: 60,
        minWidth: 50,
        maxWidth: 120,
        isAutoSequence: true,
      },
      {
        accessor: "ISSUE_DT",
        columnName: "IssueDate",
        componentType: "editableDatePicker",
        alignment: "center",
        dateFormat: "dd/MM/yyyy",
        sequence: 2,
        __VIEW__: { isReadOnly: true },
        width: 210,
        minWidth: 100,
        maxWidth: 300,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["issueDtRequiredMsg"] }],
        },
      },

      {
        columnName: "",
        componentType: "deleteRowCell",
        accessor: "_hidden",
        sequence: 9,
        width: 90,
        maxWidth: 120,
        minWidth: 90,
        // shouldExclude: (initialValue, original, prevRows, nextRows) => {
        //   if (original?.ROW_EXIST === "Y") {
        //     return true;
        //   } else {
        //     return false;
        //   }
        // },
      },
    ],
  },
};
