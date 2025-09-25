import { GeneralAPI } from "registry/fns/functions";
import * as API from "./api";

export const lockerAcctAllocationMetadata = {
  form: {
    name: "locker allocation",
    label: "",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 6,
          md: 6,
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
        componentType: "autocomplete",
      },
      name: "ACCT_TYPE",
      label: "AccountType",
      isFieldFocused: true,
      options: (dependentValue, formState, _, authState) => {
        return GeneralAPI.get_Account_Type({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
          USER_NAME: authState?.user?.id,
          DOC_CD: formState?.docCD ?? "",
        });
      },
      _optionsKey: "get_Account_Type",
      required: false,
      schemaValidation: {
        type: "string",
      },

      GridProps: { xs: 10.2, sm: 5.5, md: 7.2 / 2, lg: 5.5 / 2, xl: 4.2 / 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "SIZE_CD",
      label: "Size",
      isFieldFocused: false,
      dependentFields: ["ACCT_TYPE"],
      options: (dependentValue, formState, _, authState) => {
        return API.getLockerSizeList({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        });
      },
      _optionsKey: "getLockerSizeList",
      required: false,
      runPostValidationHookAlways: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        const acctTypeCd = dependentFieldValues?.ACCT_TYPE?.value;
        const sizeCd = currentField?.optionData?.[0]?.value ?? "";
        const compCd = authState?.companyID ?? "";
        const branchCd = authState?.user?.branchCode ?? "";

        if (!sizeCd || !compCd || !branchCd) {
          return { WAITING_LIST_NO: { value: "0" } };
        }

        if (!acctTypeCd) {
          return { WAITING_LIST_NO: { value: "0" } };
        }

        const lockerWaitingList = await API.getLockerWaitingList({
          COMP_CD: compCd,
          BRANCH_CD: branchCd,
          ACCT_TYPE: acctTypeCd,
          LOC_SIZE_CD: sizeCd,
        });

        const waitingListCnt = lockerWaitingList?.[0]?.WAITING_LIST_CNT || "0";
        return { WAITING_LIST_NO: { value: waitingListCnt } };
      },
      GridProps: { xs: 10.2, sm: 5.6, md: 7.5 / 2, lg: 5.7 / 2, xl: 4.3 / 2 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "AVAILABLE",
      label: "Available",
      defaultValue: true,
      dependentFields: ["ACCT_TYPE", "SIZE_CD"],
      runPostValidationHookAlways: false,
      validationRun: "all",
      postValidationSetCrossFieldValues: (
        currentField,
        formState,
        authState,
        dependentFields
      ) => {
        if (
          dependentFields?.ACCT_TYPE?.value &&
          dependentFields?.SIZE_CD?.value
        ) {
          formState.setDataOnFieldChange("AVAILABLE", {
            AVAILABLE: currentField?.value,
            ACCT_TYPE: dependentFields?.ACCT_TYPE?.value,
            SIZE_CD: dependentFields?.SIZE_CD?.value,
          });
        } else if (currentField?.value) {
          formState.setDataOnFieldChange("AVAILABLE", {
            AVAILABLE: currentField?.value,
            ACCT_TYPE: dependentFields?.ACCT_TYPE?.value ?? "",
            SIZE_CD: dependentFields?.SIZE_CD?.value ?? "",
          });
        } else {
          formState.setDataOnFieldChange("AVAILABLE", {
            AVAILABLE: currentField?.value,
            ACCT_TYPE: dependentFields?.ACCT_TYPE?.value ?? "",
            SIZE_CD: dependentFields?.SIZE_CD?.value ?? "",
          });
        }
      },
      setFieldLabel: (dependent, currVal) => ({
        label: currVal ? "Available" : "All",
      }),
      GridProps: {
        style: { paddingTop: "48px" },
        xs: 5.1,
        sm: 1.6,
        md: 2.4 / 2,
        lg: 1.7 / 2,
        xl: 1.5 / 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      dependentFields: ["ACCT_TYPE", "SIZE_CD"],
      name: "WAITING_LIST_NO",
      label: "Waiting List",
      isReadOnly: true,
      GridProps: {
        style: { paddingTop: "8px" },
        xs: 5.1,
        sm: 2.6 / 2,
        md: 2 / 2,
        lg: 1.4 / 2,
        xl: 1.2 / 2,
      },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "RETRIEVE",
      label: "Retrieve",
      dependentFields: ["ACCT_TYPE", "SIZE_CD", "AVAILABLE"],
      GridProps: {
        xs: 5.1,
        sm: 2.8 / 2,
        md: 2 / 2,
        lg: 1.4 / 2,
        xl: 1.2 / 2,
      },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "WAITING_LIST",
      label: "Waiting List",
      dependentFields: ["ACCT_TYPE", "SIZE_CD"],
      GridProps: {
        xs: 5.1,
        sm: 3.5 / 2,
        md: 2.5 / 2,
        lg: 2.3 / 2,
        xl: 1.6 / 2,
      },
    },
  ],
};
