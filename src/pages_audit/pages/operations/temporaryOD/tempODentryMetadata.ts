import * as API from "./api";
import { GeneralAPI } from "registry/fns/functions";
import { t } from "i18next";
import { lessThanDate, utilFunction } from "@acuteinfo/common-base";
import { isValid } from "date-fns";
import { validateHOBranch } from "components/utilFunction/function";
export const temporaryODentryMetadata = {
  masterForm: {
    form: {
      name: "temporaryOD-entryMetadata",
      label: "",
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
    },
    fields: [
      {
        render: {
          componentType: "_accountNumber",
        },
        name: "",
        branchCodeMetadata: {
          isReadOnly: true,
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            authState
          ) => {
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
            if (field?.value) {
              return {
                ACCT_TYPE: { value: "" },
                ACCT_CD: { value: "" },
              };
            } else if (!field.value) {
              formState.setDataOnFieldChange("IS_VISIBLE", {
                IS_VISIBLE: false,
              });
              return {
                ACCT_TYPE: { value: "" },
                ACCT_CD: { value: "" },
              };
            }
          },
          runPostValidationHookAlways: true,
          GridProps: {
            xs: 12,
            sm: 3.5,
            md: 2.5,
            lg: 1,
            xl: 1,
          },
        },
        accountTypeMetadata: {
          isFieldFocused: true,
          validationRun: "all",
          options: (dependentValue, formState, _, authState) => {
            return GeneralAPI.get_Account_Type({
              COMP_CD: authState?.companyID,
              BRANCH_CD: authState?.user?.branchCode,
              USER_NAME: authState?.user?.id,
              DOC_CD: formState?.docCD,
            });
          },
          _optionsKey: "get_Account_Type",
          postValidationSetCrossFieldValues: async (field, formState) => {
            formState.setDataOnFieldChange("IS_VISIBLE", {
              IS_VISIBLE: false,
            });
            if (field?.value) {
              return {
                ACCT_CD: { value: "" },
              };
            }
          },
          runPostValidationHookAlways: true,
          GridProps: {
            xs: 12,
            sm: 3.5,
            md: 2.5,
            lg: 1,
            xl: 1,
          },
        },

        accountCodeMetadata: {
          render: {
            componentType: "textField",
          },
          GridProps: {
            xs: 12,
            sm: 5,
            md: 3,
            lg: 2,
            xl: 2,
          },

          validate: (columnValue) => {
            let regex = /^[^!&]*$/;
            if (!regex.test(columnValue.value)) {
              return "Special Characters (!, &) not Allowed";
            }
            return "";
          },
          postValidationSetCrossFieldValues: async (
            field,
            formState,
            authState,
            dependentValue
          ) => {
            if (
              field?.value &&
              dependentValue?.BRANCH_CD?.value &&
              dependentValue?.ACCT_TYPE?.value
            ) {
              let otherAPIRequestPara = {
                COMP_CD: authState?.companyID,
                ACCT_CD: utilFunction.getPadAccountNumber(
                  field?.value,
                  dependentValue?.ACCT_TYPE?.optionData?.[0]
                ),
                ACCT_TYPE: dependentValue?.ACCT_TYPE?.value,
                BRANCH_CD: dependentValue?.BRANCH_CD?.value,
                GD_TODAY_DT: authState?.workingDate,
                SCREEN_REF: formState?.docCD,
              };
              let postData = await GeneralAPI.getAccNoValidation(
                otherAPIRequestPara
              );
              let apiRespMSGdata = postData?.MSG;
              let isReturn;
              const messagebox = async (
                msgTitle,
                msg,
                buttonNames,
                status,
                icon
              ) => {
                let buttonName = await formState.MessageBox({
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
                      apiRespMSGdata[i]?.O_STATUS === "99"
                        ? ["Yes", "No"]
                        : ["Ok"],
                      apiRespMSGdata[i]?.O_STATUS,
                      apiRespMSGdata[i]?.O_STATUS === "999"
                        ? "ERROR"
                        : apiRespMSGdata[i]?.O_STATUS === "99"
                        ? "CONFIRM"
                        : "WARNING"
                    );

                    if (
                      btnName.buttonName === "No" ||
                      btnName.status === "999"
                    ) {
                      formState.setDataOnFieldChange("IS_VISIBLE", {
                        IS_VISIBLE: false,
                      });
                      return {
                        ACCT_CD: {
                          value: "",
                          isFieldFocused: true,
                          ignoreUpdate: true,
                        },
                        ACCT_NM: { value: "" },
                      };
                    }
                  } else {
                    formState.cardData.mutate({
                      reqData: {
                        COMP_CD: authState?.companyID,
                        ACCT_CD: utilFunction.getPadAccountNumber(
                          field?.value,
                          dependentValue?.ACCT_TYPE?.optionData?.[0]
                        ),
                        ACCT_TYPE: dependentValue?.ACCT_TYPE?.value,
                        BRANCH_CD: dependentValue?.BRANCH_CD?.value,
                        PARENT_TYPE:
                          dependentValue?.ACCT_TYPE?.optionData?.[0]
                            ?.PARENT_TYPE ?? "",
                      },
                    });
                    formState.setDataOnFieldChange("IS_VISIBLE", {
                      IS_VISIBLE: true,
                    });
                    isReturn = true;
                  }
                }
              }
              if (Boolean(isReturn)) {
                return {
                  ACCT_CD: {
                    value: utilFunction.getPadAccountNumber(
                      field?.value,
                      dependentValue?.ACCT_TYPE?.optionData?.[0]
                    ),
                    ignoreUpdate: true,
                    isFieldFocused: false,
                  },
                  ACCT_CD_COPY: { value: field?.value },
                  ACCT_NM: { value: postData?.ACCT_NM },
                };
              }
            } else if (!field.value) {
              formState.setDataOnFieldChange("IS_VISIBLE", {
                IS_VISIBLE: false,
              });
              return {
                AMOUNT_UPTO: { value: "" },
                ACCT_NM: { value: "" },
                FROM_EFF_DATE: { value: authState?.workingDate },
                TO_EFF_DATE: { value: authState?.workingDate },
              };
            }
            return {};
          },
          runPostValidationHookAlways: true,
          fullWidth: true,
        },
      },
      {
        render: {
          componentType: "autocomplete",
        },
        name: "CODE",
        label: "Parameters",
        required: true,
        fullWidth: true,
        placeholder: "SelectParameters",
        disableCaching: true,
        dependentFields: ["ACCT_TYPE"],
        options: (dependentFields) => {
          if (dependentFields?.ACCT_TYPE?.optionData?.[0]?.PARENT_TYPE) {
            return API.parametersListDD(
              dependentFields?.ACCT_TYPE?.optionData?.[0]?.PARENT_TYPE
            );
          }
          return [];
        },
        _optionsKey: "parametersListDD",
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["Parametersrequired"] }],
        },
        GridProps: {
          xs: 12,
          sm: 5,
          md: 4,
          lg: 2.5,
          xl: 2.5,
        },
      },

      {
        render: {
          componentType: "datePicker",
        },
        name: "FROM_EFF_DATE",
        fullWidth: true,
        isWorkingDate: true,
        required: true,
        isMinWorkingDate: true,
        validate: (currentField, dependentField, formState) => {
          let formatdate = new Date(currentField?.value);
          if (!currentField?.value) {
            return "PleaseEnterFromEffDate";
          } else if (Boolean(formatdate) && !isValid(formatdate)) {
            return t("Mustbeavaliddate");
          } else if (
            lessThanDate(
              currentField?.value,
              new Date(formState?.WORKING_DATE),
              {
                ignoreTime: true,
              }
            )
          ) {
            return t("FromDateGreaterThanOrEqualToWorkingDate");
          }
          return "";
        },

        label: "EffectiveFromDate",
        GridProps: {
          xs: 12,
          sm: 3.5,
          md: 2.5,
          lg: 1.5,
          xl: 1.5,
        },
      },
      {
        render: {
          componentType: "datePicker",
        },
        name: "TO_EFF_DATE",
        fullWidth: true,
        required: true,
        isWorkingDate: true,
        validate: (currentField, dependentField) => {
          let formatdate = new Date(currentField?.value);
          if (!currentField?.value) {
            return "PleaseEnterToEffDate";
          } else if (Boolean(formatdate) && !isValid(formatdate)) {
            return t("Mustbeavaliddate");
          } else if (
            lessThanDate(
              currentField?.value,
              dependentField?.FROM_EFF_DATE?.value,
              {
                ignoreTime: true,
              }
            )
          ) {
            return t("ToDateGreaterThanOrEqualToFromDate");
          }
          return "";
        },

        onFocus: (date) => {
          date.target.select();
        },
        dependentFields: ["FROM_EFF_DATE"],
        runValidationOnDependentFieldsChange: true,
        label: "EffectiveToDate",
        GridProps: {
          xs: 12,
          sm: 3.5,
          md: 2.5,
          lg: 1.5,
          xl: 1.5,
        },
      },

      {
        render: {
          componentType: "amountField",
        },
        name: "AMOUNT_UPTO",
        label: "AmountUpTo",
        required: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["AmountUpToRequired"] }],
        },
        FormatProps: {
          allowNegative: true,
        },
        fullWidth: true,
        GridProps: {
          xs: 12,
          sm: 3.5,
          md: 3,
          lg: 1.5,
          xl: 1.5,
        },
      },
      {
        render: {
          componentType: "checkbox",
        },
        name: "FLAG",
        label: "Flag",
        fullWidth: true,
        defaultValue: "Y",
        GridProps: {
          style: { paddingTop: "40px" },
          xs: 12,
          sm: 2,
          md: 2,
          lg: 1,
          xl: 1,
        },
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "ACCT_CD_COPY",
      },

      {
        render: {
          componentType: "hidden",
        },
        name: "TEMP",
        dependentFields: ["ACCT_CD", "ACCT_TYPE", "ACCT_CD_COPY"],
        setValueOnDependentFieldsChange: (dependentFields) => {
          return dependentFields?.ACCT_CD?.value;
        },
        validationRun: "all",
        postValidationSetCrossFieldValues: (
          field,
          formState,
          auth,
          dependentFields
        ) => {
          let acctNo = utilFunction.getPadAccountNumber(
            dependentFields?.ACCT_CD_COPY?.value,
            dependentFields?.ACCT_TYPE?.optionData?.[0]
          );
          if (
            dependentFields?.ACCT_CD?.value &&
            acctNo &&
            acctNo != dependentFields?.ACCT_CD?.value
          ) {
            formState.setDataOnFieldChange("IS_VISIBLE", { IS_VISIBLE: false });
          } else if (acctNo == dependentFields?.ACCT_CD?.value) {
            formState.setDataOnFieldChange("IS_VISIBLE", { IS_VISIBLE: true });
          }
        },
      },
    ],
  },
  detailsGrid: {
    gridConfig: {
      dense: true,
      gridLabel: "Documents",
      rowIdColumn: "SR_CD",
      defaultColumnConfig: { width: 150, maxWidth: 250, minWidth: 100 },
      allowColumnReordering: true,
      hideHeader: false,
      disableGroupBy: true,
      enablePagination: false,
      disableGlobalFilter: true,
      containerHeight: { min: "11vh", max: "calc(43vh - 200px)" },
      allowRowSelection: false,
      hiddenFlag: "_hidden",
      disableLoader: true,
      hideFooter: true,
      // paginationText: "Configured Messages",
    },
    columns: [
      {
        accessor: "TEMPLATE_CD",
        columnName: "Documents",
        componentType: "editableAutocomplete",
        placeholder: "SelectDocument",
        options: (_, auth) => {
          return API.documentsListDD({
            COMP_CD: auth?.companyID,
            BRANCH_CD: auth?.user?.branchCode,
            CUSTOMER_TYPE: "A",
          });
        },
        // _optionsKey: "documentsListDD",
        required: true,
        sequence: 2,
        isAutoFocus: true,
        alignment: "left",
        width: 350,
        minWidth: 200,
        maxWidth: 400,
        // validation: (value, data, prev, next) => {
        //   let concatenatedArray = [prev, next].flat();
        //   let nextMsg: any = concatenatedArray?.some((item) => {
        //     if (value) {
        //       return value === item?.TEMPLATE_CD;
        //     }
        //     return false;
        //   });

        //   if (!value) {
        //     return t("ThisFieldisrequired");
        //   } else if (nextMsg) {
        //     return t("OptionIsAlreadyEntered");
        //   }
        //   return "";
        // },
      },
      {
        accessor: "SUBMIT",
        columnName: "Submit",
        componentType: "editableCheckbox",
        alignment: "center",
        // defaultValue: "Y",
        sequence: 2,
        width: 85,
        minWidth: 70,
        maxWidth: 120,
      },

      {
        accessor: "VALID_UPTO",
        columnName: "ValidTillDate",
        componentType: "editableDatePicker",
        alignment: "center",
        validation: (value, data, prev, next, auth) => {
          let inputDate = new Date(value);
          let workingDate = new Date(auth.workingDate);
          if (!Boolean(value)) {
            return t("ValidTillDateisrequired");
          } else if (!isValid(inputDate)) {
            return t("Mustbeavaliddate");
          } else if (inputDate < workingDate) {
            return t("Valid Till date should not be less than Working Date");
          }
        },
        sequence: 2,
        width: 210,
        minWidth: 100,
        maxWidth: 300,
      },
      {
        columnName: "Action",
        componentType: "deleteRowCell",
        accessor: "_hidden",
        sequence: 3,
        width: 90,
        alignment: "center",
        maxWidth: 120,
        minWidth: 90,
        shouldExclude: (initialValue, original) => {
          if (Boolean(original?._isNewRow)) {
            return false;
          }
          return true;
        },
      },
    ],
  },
};
