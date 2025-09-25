import {
  addDays,
  addMonths,
  addYears,
  differenceInDays,
  format,
} from "date-fns";
import * as API from "./api";
import { utilFunction } from "@acuteinfo/common-base";
import { es } from "date-fns/locale";
export const metaData = {
  form: {
    name: "",
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
          sm: 12,
          md: 12,
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
        componentType: "radio",
      },
      name: "CALCSWITCH",
      label: "",
      RadioGroupProps: { row: true },
      options: [
        {
          label: "Date",
          value: "D",
        },
        {
          label: "Period",
          value: "P",
        },
        {
          label: "Compare Sheet",
          value: "S",
        },
        {
          label: "Recurring To FD",
          value: "F",
        },
      ],
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "COMP_CD",
      label: "",
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "BRANCH_CD",
      label: "",
    },
    // ------------Date-----------------//
    {
      render: {
        componentType: "hidden",
      },
      label: "",
      name: "COMMON",
      dependentFields: [
        "FLAG",
        "PERIOD_CD_D",
        "PERIOD_NO_D",
        "MATURITY_DT_D",
        "CATEG_CD_D",
        "ACCT_TYPE_D",
        "TRAN_DT_D",
        "COMP_CD",
        "BRANCH_CD",
        "PRE_INT_FLG_D",
        "PRINCIPAL_AMT_D",
      ],
      validationRun: "onChange",
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        if (
          dependentFields.PERIOD_NO_D?.value &&
          dependentFields.PERIOD_CD_D?.value &&
          dependentFields.PRE_INT_FLG_D?.value &&
          dependentFields.PRINCIPAL_AMT_D?.value &&
          dependentFields.ACCT_TYPE_D?.value &&
          dependentFields.BRANCH_CD?.value &&
          dependentFields.COMP_CD?.value &&
          dependentFields.TRAN_DT_D?.value &&
          dependentFields.CATEG_CD_D?.value
        ) {
          const requestData = {
            COMP_CD: dependentFields.COMP_CD?.value,
            BRANCH_CD: dependentFields.BRANCH_CD?.value,
            ACCT_TYPE: dependentFields.ACCT_TYPE_D?.value,
            CATEG_CD: dependentFields.CATEG_CD_D?.value,

            MATURITY_DT: null,
            TRAN_DT: dependentFields.TRAN_DT_D?.value
              ? format(
                  new Date(dependentFields.TRAN_DT_D?.value),
                  "dd/MMM/yyyy"
                )
              : "",
            PERIOD_CD: dependentFields.PERIOD_CD_D?.value,
            PERIOD_NO: dependentFields.PERIOD_NO_D?.value,
            PRE_INT_FLAG: dependentFields.PRE_INT_FLG_D?.value,
            PRINCIPAL_AMT: dependentFields.PRINCIPAL_AMT_D?.value,
          };

          const postData = await API.getFdinterest(requestData);

          return {
            INT_RATE_D: {
              value: postData[0]?.INT_RATE,
              isFieldFocused: false,
              ignoreUpdate: true,
            },
            MATURITY_DT_D: {
              value: postData[0]?.MATURITY_DT,
              isFieldFocused: false,
              ignoreUpdate: true,
            },
          };
        }
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      label: "",
      name: "COMMONAMT",
      dependentFields: [
        "CALCSWITCH",
        "PERIOD_CD_D",
        "PERIOD_NO_D",
        "MATURITY_DT_D",
        "CATEG_CD_D",
        "ACCT_TYPE_D",
        "TRAN_DT_D",
        "COMP_CD",
        "BRANCH_CD",
        "PRE_INT_FLG_D",
        "PRINCIPAL_AMT_D",
        "INT_RATE_D",
        "TERM_CD_D",
      ],
      validationRun: "onChange",
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        auth,
        dependentFields
      ) => {
        const postData = await API.getFdMaturityAmount({
          COMP_CD: dependentFields?.COMP_CD?.value ?? "",
          BRANCH_CD: dependentFields?.BRANCH_CD?.value ?? "",
          ACCT_TYPE: dependentFields?.ACCT_TYPE_D?.value ?? "",
          CATEG_CD: dependentFields?.CATEG_CD_D?.value ?? "",
          MATURITY_DT:
            dependentFields?.MATURITY_DT_D?.value ?? ""
              ? format(
                  new Date(dependentFields?.MATURITY_DT_D?.value),
                  "dd/MMM/yyyy"
                )
              : "",
          TRAN_DT: dependentFields?.TRAN_DT_D?.value
            ? format(new Date(dependentFields?.TRAN_DT_D?.value), "dd/MMM/yyyy")
            : "",
          PERIOD_CD: dependentFields?.PERIOD_CD_D?.value ?? "",
          PERIOD_NO: dependentFields?.PERIOD_NO_D?.value ?? "",
          PRE_INT_FLAG: dependentFields?.PRE_INT_FLG_D?.value ?? "",
          PRINCIPAL_AMT: dependentFields?.PRINCIPAL_AMT_D?.value ?? "",
          INT_RATE: dependentFields?.INT_RATE_D?.value ?? "",
          TERM_CD: dependentFields?.INT_RATE_D?.value ?? "",
        });

        return postData?.[0]?.MATURITY_AMT
          ? {
              MATURITY_AMT_D: {
                value: postData[0].MATURITY_AMT,
                isFieldFocused: false,
                ignoreUpdate: true,
              },
            }
          : {};
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      label: "",
      name: "PERIODRATEAPI",
      validationRun: "onChange",
      dependentFields: [
        "CALCSWITCH",
        "PERIOD_CD_P",
        "PERIOD_NO_P",
        "MATURITY_DT_P",
        "CATEG_CD_P",
        "ACCT_TYPE_P",
        "TRAN_DT_P",
        "COMP_CD",
        "BRANCH_CD",
        "PRE_INT_FLG_P",
        "PRINCIPAL_AMT_P",
      ],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        auth,
        dependentFields
      ) => {
        if (
          dependentFields?.COMP_CD?.value &&
          dependentFields?.BRANCH_CD?.value &&
          dependentFields?.CATEG_CD_P?.value &&
          dependentFields?.MATURITY_DT_P?.value &&
          dependentFields?.TRAN_DT_P?.value &&
          dependentFields?.PERIOD_NO_P?.value &&
          dependentFields?.PRE_INT_FLG_P?.value &&
          dependentFields?.PRINCIPAL_AMT_P?.value &&
          dependentFields?.ACCT_TYPE_P?.value
        ) {
          const {
            COMP_CD,
            BRANCH_CD,
            CATEG_CD_P,
            MATURITY_DT_P,
            TRAN_DT_P,
            PERIOD_NO_P,
            PRE_INT_FLG_P,
            PRINCIPAL_AMT_P,
            ACCT_TYPE_P,
          } = dependentFields;

          const params = {
            COMP_CD: COMP_CD?.value,
            BRANCH_CD: BRANCH_CD?.value,
            ACCT_TYPE: ACCT_TYPE_P?.value,
            CATEG_CD: CATEG_CD_P?.value,
            MATURITY_DT: MATURITY_DT_P?.value
              ? format(new Date(MATURITY_DT_P?.value), "dd/MMM/yyyy")
              : "",
            TRAN_DT: TRAN_DT_P?.value
              ? format(new Date(TRAN_DT_P?.value), "dd/MMM/yyyy")
              : "",
            PERIOD_CD: "D",
            PERIOD_NO: `${PERIOD_NO_P?.value}`,
            PRE_INT_FLAG: PRE_INT_FLG_P?.value,
            PRINCIPAL_AMT: PRINCIPAL_AMT_P?.value,
          };

          const postData = await API.getFdinterest(params);

          return {
            INT_RATE_P: {
              value: postData[0]?.INT_RATE,
              isFieldFocused: false,
              ignoreUpdate: true,
            },
          };
        }
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      label: "",
      name: "PERIODAMTAPI",
      validationRun: "onChange",
      dependentFields: [
        "CALCSWITCH",
        "PERIOD_CD_P",
        "PERIOD_NO_P",
        "MATURITY_DT_P",
        "CATEG_CD_P",
        "ACCT_TYPE_P",
        "TRAN_DT_P",
        "COMP_CD",
        "BRANCH_CD",
        "PRE_INT_FLG_P",
        "PRINCIPAL_AMT_P",
        "INT_RATE_P",
        "TERM_CD_P",
      ],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        auth,
        dependentFields
      ) => {
        if (
          dependentFields?.COMP_CD?.value &&
          dependentFields?.BRANCH_CD?.value &&
          dependentFields?.CATEG_CD_P?.value &&
          dependentFields?.MATURITY_DT_P?.value &&
          dependentFields?.TRAN_DT_P?.value &&
          dependentFields?.PERIOD_NO_P?.value &&
          dependentFields?.PRE_INT_FLG_P?.value &&
          dependentFields?.PRINCIPAL_AMT_P?.value &&
          dependentFields?.TERM_CD_P?.value &&
          dependentFields?.INT_RATE_P?.value
        ) {
          const postData = await API.getFdMaturityAmount({
            COMP_CD: dependentFields?.COMP_CD?.value,
            BRANCH_CD: dependentFields?.BRANCH_CD?.value,
            ACCT_TYPE: dependentFields?.ACCT_TYPE_P?.value,
            CATEG_CD: dependentFields?.CATEG_CD_P?.value,
            MATURITY_DT: dependentFields?.MATURITY_DT_P?.value
              ? format(
                  new Date(dependentFields?.MATURITY_DT_P?.value),
                  "dd/MMM/yyyy"
                )
              : "",
            TRAN_DT: dependentFields?.TRAN_DT_P?.value
              ? format(
                  new Date(dependentFields?.TRAN_DT_P?.value),
                  "dd/MMM/yyyy"
                )
              : "",
            PERIOD_CD: "D",
            PERIOD_NO: `${dependentFields?.PERIOD_NO_P?.value}`,
            PRE_INT_FLAG: dependentFields?.PRE_INT_FLG_P?.value,
            PRINCIPAL_AMT: dependentFields?.PRINCIPAL_AMT_P?.value,
            INT_RATE: dependentFields?.INT_RATE_P?.value,
            TERM_CD: dependentFields?.TERM_CD_P?.value,
          });

          return {
            MATURITY_AMT_P: {
              value: postData[0]?.MATURITY_AMT,
              isFieldFocused: false,
              ignoreUpdate: true,
            },
          };
        }
      },
    },
    {
      render: { componentType: "autocomplete" },
      name: "PRE_INT_FLG_D",
      label: "normalPremature",
      _optionsKey: "getFDtype",
      options: (dependentValue, formState, _, authState) => {
        return API.getFDtype({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        });
      },
      defaultValue: "I",
      fullWidth: true,
      dependentFields: ["CALCSWITCH"],
      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "D") {
          return false;
        }
        return true;
      },
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
    },
    {
      render: { componentType: "autocomplete" },
      name: "ACCT_TYPE_D",
      label: "Type",
      _optionsKey: "gettypeDDWdata",
      placeholder: "enterType",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["typeRequired"] }],
      },
      options: (dependentValue, formState, _, authState) => {
        return API.gettypeDDWdata({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
          USER_NAME: authState?.user?.id,
          DOC_CD: formState?.docCD,
        });
      },
      fullWidth: true,
      dependentFields: ["CALCSWITCH"],
      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "D") {
          return false;
        }
        return true;
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        return {
          COMMON: { value: Date.now() },
        };
      },
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
    },
    {
      render: { componentType: "autocomplete" },
      name: "CATEG_CD_D",
      label: "Category",
      placeholder: "selectCategory",
      _optionsKey: "getCategoryDDWdata",
      options: (dependentValue, formState, _, authState) => {
        return API.getCategoryDDWdata({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        });
      },
      fullWidth: true,
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
      dependentFields: ["CALCSWITCH"],

      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "D") {
          return false;
        }
        return true;
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        return {
          COMMON: { value: Date.now() },
        };
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TRAN_DT_D",
      label: "asonDate",
      required: true,
      defaultValue: new Date(),
      fullWidth: true,
      format: "dd/MM/yyyy",
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
      dependentFields: ["CALCSWITCH"],

      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "D") {
          return false;
        }
        return true;
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        return {
          COMMON: { value: Date.now() },
        };
      },
    },
    {
      render: { componentType: "autocomplete" },
      name: "PERIOD_CD_D",
      required: true,
      label: "Period",
      options: [
        { label: "Day(s)", value: "D" },
        { label: "Month(s)", value: "M" },
        { label: "Year(s)", value: "Y" },
      ],
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ThisFieldisrequired"] }],
      },
      defaultValue: "D",
      fullWidth: true,
      GridProps: { xs: 3, sm: 3, md: 3, lg: 1, xl: 1 },
      dependentFields: ["CALCSWITCH"],

      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "D") {
          return false;
        }
        return true;
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        return {
          COMMON: { value: Date.now() },
        };
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "PERIOD_NO_D",
      label: "",
      required: true,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },

      GridProps: { xs: 1.5, sm: 1.5, md: 1.5, lg: 1, xl: 1 },
      dependentFields: ["CALCSWITCH", "PERIOD_CD_D"],
      FormatProps: {
        allowNegative: false,
        decimalScale: 0,
        isAllowed: (values) => {
          if (values?.value?.length > 10) {
            return false;
          }
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },

      setFieldLabel: (dependentFields, currVal) => {
        let duration = dependentFields.PERIOD_CD_D?.value;

        return duration === "D"
          ? { label: "Day(s)", placeholder: "enterDays" }
          : duration === "M"
          ? { label: "Month(s)", placeholder: "enterMonths" }
          : duration === "Y"
          ? { label: "Year(s)", placeholder: "enterYears" }
          : { label: "Day(s)", placeholder: "enterDays" };
      },
      validate: (columnValue, dependentFields, flag) => {
        let duration = dependentFields.PERIOD_CD_D?.value;

        if (duration === "D" && columnValue.value.length > 10) {
          return "Only 10 digits allowed for Days";
        } else if (duration === "M" && columnValue.value.length > 2) {
          return "Only 2 digits allowed for Months";
        } else if (duration === "Y" && columnValue.value.length > 4) {
          return "Only 4 digits allowed for years";
        }
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        return {
          COMMON: { value: Date.now() },
        };
      },
      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "D") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "PRINCIPAL_AMT_D",
      required: true,
      label: "PrincipalAmount",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["principleAmtrequire"] }],
      },
      placeholder: "enterPrincipalAmount",
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
      dependentFields: ["CALCSWITCH"],
      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "D") {
          return false;
        }
        return true;
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        return {
          COMMON: { value: Date.now() },
        };
      },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "INT_RATE_D",
      label: "rateWithSign",
      placeholder: "enterRate",
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["rateRequired"] }],
      },

      dependentFields: ["CALCSWITCH"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        return {
          COMMONAMT: { value: Date.now() },
        };
      },
      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "D") {
          return false;
        }
        return true;
      },
    },
    {
      render: { componentType: "autocomplete" },
      name: "TERM_CD_D",
      label: "term",
      placeholder: "selectTerm",
      options: [
        { label: "Monthly", value: "M" },
        { label: "Quarterly", value: "Q" },
        { label: "Half-Yearly", value: "H" },
        { label: "Yearly", value: "Y" },
      ],
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["termrequire"] }],
      },
      defaultValue: "M",
      fullWidth: true,
      required: true,
      GridProps: { xs: 1.5, sm: 1.5, md: 2, lg: 2, xl: 2 },
      dependentFields: ["CALCSWITCH"],

      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "D") {
          return false;
        }
        return true;
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        return {
          COMMONAMT: { value: Date.now() },
        };
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "MATURITY_DT_D",
      label: "maturityDate",
      isReadOnly: true,
      fullWidth: true,
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
      dependentFields: [
        "CALCSWITCH",
        "TRAN_DT_D",
        "PERIOD_CD_D",
        "PERIOD_NO_D",
      ],
      // setValueOnDependentFieldsChange: (dependentFields) => {
      //   const duration = dependentFields.PERIOD_CD_D?.value;
      //   const periodNumber = parseInt(
      //     dependentFields.PERIOD_NO_D?.value ?? "",
      //     10
      //   );
      //   const tranDateValue = dependentFields.TRAN_DT_D?.value;
      //   if (!tranDateValue || isNaN(periodNumber) || !duration) {
      //     return undefined;
      //   }

      //   const tranDate = utilFunction?.getParsedDate(tranDateValue);

      //   if (isNaN(tranDate.getTime())) {
      //     return "";
      //   }

      //   switch (duration) {
      //     case "D":
      //       return format(addDays(tranDate, periodNumber), "dd/MMM/yyyy");
      //     case "M":
      //       return format(addMonths(tranDate, periodNumber), "dd/MMM/yyyy");
      //     case "Y":
      //       return format(addYears(tranDate, periodNumber), "dd/MMM/yyyy");
      //     default:
      //       console.error("Invalid duration:", duration);
      //       return undefined;
      //   }
      // },

      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "D") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "INTEREST_RUPEES_D",
      isReadOnly: true,
      label: "interestRs",
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
      dependentFields: ["CALCSWITCH", "PRINCIPAL_AMT_D", "MATURITY_AMT_D"],
      setValueOnDependentFieldsChange: (dependentFields) => {
        let principalAmount = dependentFields.PRINCIPAL_AMT_D?.value;
        let maturityAmount = dependentFields.MATURITY_AMT_D?.value;
        let interestRupees;
        if (principalAmount !== "" && maturityAmount !== "") {
          interestRupees = maturityAmount - principalAmount;
          return interestRupees;
        }
      },
      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "D") {
          return false;
        }
        return true;
      },
    },

    {
      render: {
        componentType: "amountField",
      },
      name: "MATURITY_AMT_D",
      isReadOnly: true,
      label: "MaturityAmount",
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
      dependentFields: ["CALCSWITCH"],

      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "D") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "NEW_DATE_BTN",
      label: "New",
      type: "text",
      GridProps: { lg: 1, xl: 1 },
      dependentFields: ["CALCSWITCH"],
      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "D") {
          return false;
        }
        return true;
      },
    },
    // ------------Period---------------//
    {
      render: { componentType: "autocomplete" },
      name: "PRE_INT_FLG_P",
      label: "normalPremature",
      _optionsKey: "getFDtype",
      options: (dependentValue, formState, _, authState) => {
        return API.getFDtype({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        });
      },
      defaultValue: "I",
      fullWidth: true,
      dependentFields: ["CALCSWITCH"],
      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "P") {
          return false;
        }
        return true;
      },

      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
    },
    {
      render: { componentType: "autocomplete" },
      name: "ACCT_TYPE_P",
      label: "Type",
      placeholder: "enterType",
      validationRun: "onBlur",
      required: true,
      _optionsKey: "gettypeDDWdata",
      options: (dependentValue, formState, _, authState) => {
        return API.gettypeDDWdata({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
          USER_NAME: authState?.user?.id ?? "",
          DOC_CD: formState?.docCD,
        });
      },
      fullWidth: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["typeRequired"] }],
      },
      dependentFields: ["CALCSWITCH"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        return {
          PERIODRATEAPI: { value: Date.now() },
        };
      },
      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "P") {
          return false;
        }
        return true;
      },
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
    },
    {
      render: { componentType: "autocomplete" },
      name: "CATEG_CD_P",
      label: "Category",
      placeholder: "selectCategory",
      _optionsKey: "getCategoryDDWdata",
      options: (dependentValue, formState, _, authState) => {
        return API.getCategoryDDWdata({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        });
      },
      fullWidth: true,
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
      dependentFields: ["CALCSWITCH"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        return {
          PERIODRATEAPI: { value: Date.now() },
        };
      },
      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "P") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TRAN_DT_P",
      label: "asonDate",
      required: true,
      defaultValue: new Date(),
      fullWidth: true,
      format: "dd/MM/yyyy",
      placeholder: "selectAsOnDate",
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
      dependentFields: ["CALCSWITCH"],
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["asOnDateRequired"] }],
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        return {
          PERIODRATEAPI: { value: Date.now() },
        };
      },

      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "P") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "MATURITY_DT_P",
      label: "maturityDate",
      placeholder: "selectMaturityDate",
      required: true,
      fullWidth: true,

      format: "dd/MM/yyyy",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["maturityDateRequired"] }],
      },
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
      dependentFields: ["CALCSWITCH", "TRAN_DT_P"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        return {
          PERIODRATEAPI: { value: Date.now() },
        };
      },
      validate: (currentField, dependentField) => {
        if (
          new Date(currentField?.value) <
          new Date(dependentField?.TRAN_DT_P?.value)
        ) {
          return "maturityDateValidationMsg";
        }
        return "";
      },

      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "P") {
          return false;
        }
        return true;
      },
    },
    {
      render: { componentType: "textField" },
      name: "PERIOD_NO_DISP_P",
      label: "Period",
      defaultValue: "Day",
      fullWidth: true,
      isReadOnly: true,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
      dependentFields: ["CALCSWITCH"],

      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "P") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PERIOD_NO_P",
      label: "NoOfDays",
      isReadOnly: true,
      GridProps: { xs: 1.5, sm: 1.5, md: 1.5, lg: 1, xl: 1 },
      dependentFields: [
        "CALCSWITCH",
        "PERIOD_CD_P",
        "PERIOD_NO_P",
        "MATURITY_DT_P",
        "CATEG_CD_P",
        "ACCT_TYPE_P",
        "TRAN_DT_P",
        "COMP_CD",
        "BRANCH_CD",
        "PRE_INT_FLG_P",
        "PRINCIPAL_AMT_P",
      ],
      setValueOnDependentFieldsChange: (dependentFields) => {
        let duration = dependentFields.PERIOD_CD_D?.value;
        let startDate = dependentFields?.TRAN_DT_P?.value;
        let endDate = dependentFields?.MATURITY_DT_P?.value;

        if (
          startDate &&
          endDate &&
          utilFunction.isValidDate(startDate) &&
          utilFunction.isValidDate(endDate)
        ) {
          const formattedInitialDate = format(startDate, "yyyy-MM-dd");
          const start = new Date(formattedInitialDate);
          const end = new Date(endDate);

          const days = differenceInDays(end, start) + 1;
          //07/03/2025
          //10/03/2025
          // getting result =2
          // expecting =3
          return days;
        }
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        return {
          PERIODRATEAPI: { value: Date.now() },
        };
      },
      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "P") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "PRINCIPAL_AMT_P",
      required: true,
      label: "PrincipalAmount",
      placeholder: "enterPrincipalAmount",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["principleAmtrequire"] }],
      },
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
      dependentFields: ["CALCSWITCH"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        return {
          PERIODRATEAPI: { value: Date.now() },
        };
      },
      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "P") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "rateOfInt",
      },
      name: "INT_RATE_P",
      label: "rateWithSign",
      placeholder: "0.00",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["rateRequired"] }],
      },
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
      dependentFields: ["CALCSWITCH"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        return {
          PERIODAMTAPI: { value: Date.now() },
        };
      },

      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "P") {
          return false;
        }
        return true;
      },
    },
    {
      render: { componentType: "autocomplete" },
      name: "TERM_CD_P",
      label: "term",
      required: true,
      placeholder: "selectTerm",
      options: [
        { label: "Monthly", value: "M" },
        { label: "Quarterly", value: "Q" },
        { label: "Half-Yearly", value: "H" },
        { label: "Yearly", value: "Y" },
      ],
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["termrequire"] }],
      },
      fullWidth: true,
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
      dependentFields: ["CALCSWITCH"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        _,
        dependentFields
      ) => {
        return {
          PERIODAMTAPI: { value: Date.now() },
        };
      },
      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "P") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "INTEREST_RUPEES_P",
      isReadOnly: true,
      label: "interestRs",
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
      dependentFields: ["CALCSWITCH", "PRINCIPAL_AMT_P", "MATURITY_AMT_P"],
      setValueOnDependentFieldsChange: (dependentFields) => {
        let principalAmount = dependentFields.PRINCIPAL_AMT_P?.value;
        let maturityAmount = dependentFields.MATURITY_AMT_P?.value;
        let interestRupees;
        if (principalAmount !== "" && maturityAmount !== "") {
          interestRupees = maturityAmount - principalAmount;
          return interestRupees;
        }
      },
      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "P") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "MATURITY_AMT_P",
      isReadOnly: true,
      label: "MaturityAmount",
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
      dependentFields: ["CALCSWITCH"],

      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "P") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "NEW_PERIOD_BTN",
      label: "New",
      type: "text",
      GridProps: { lg: 1, xl: 1 },
      dependentFields: ["CALCSWITCH"],
      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "P") {
          return false;
        }
        return true;
      },
    },
    //---------------Compare Sheet ----------------//
    {
      render: {
        componentType: "datePicker",
      },
      name: "TRAN_DT_S",
      label: "asonDate",
      defaultValue: new Date(),
      fullWidth: true,
      required: true,
      format: "dd/MM/yyyy",
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
      dependentFields: ["CALCSWITCH"],
      placeholder: "selectAsOnDate",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["asOnDateRequired"] }],
      },
      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "S") {
          return false;
        }
        return true;
      },
    },
    {
      render: { componentType: "autocomplete" },
      name: "PERIOD_NO_DISP_S",
      label: "Period",
      options: [
        { label: "Day(s)", value: "D" },
        { label: "Month(s)", value: "M" },
        { label: "Year(s)", value: "Y" },
      ],
      defaultValue: "D",
      fullWidth: true,
      required: true,
      GridProps: { xs: 3, sm: 3, md: 2, lg: 2, xl: 2 },
      dependentFields: ["CALCSWITCH"],
      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "S") {
          return false;
        }
        return true;
      },
    },

    {
      render: {
        componentType: "numberFormat",
      },
      name: "PERIOD_NO_S",
      label: "",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["periodNumberRequired"] }],
      },
      GridProps: { xs: 1.5, sm: 1.5, md: 1.5, lg: 1, xl: 1 },
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      dependentFields: ["CALCSWITCH", "PERIOD_NO_DISP_S"],
      setFieldLabel: (dependentFields, currVal) => {
        let duration = dependentFields.PERIOD_NO_DISP_S?.value;

        return duration === "D"
          ? { label: "Day(s)", placeholder: "enterDays" }
          : duration === "M"
          ? { label: "Month(s)", placeholder: "enterMonths" }
          : duration === "Y"
          ? { label: "Year(s)", placeholder: "enterYears" }
          : { label: "Day(s)", placeholder: "enterDays" };
      },
      validate: (columnValue, dependentFields, flag) => {
        let duration = dependentFields.PERIOD_NO_DISP_S?.value;

        if (duration === "D" && columnValue.value.length > 10) {
          return "Only 10 digits allowed for Days";
        } else if (duration === "M" && columnValue.value.length > 2) {
          return "Only 2 digits allowed for Months";
        } else if (duration === "Y" && columnValue.value.length > 4) {
          return "Only 4 digits allowed for years";
        }
      },
      FormatProps: {
        allowNegative: false,
        decimalScale: 0,
        isAllowed: (values) => {
          if (values?.value?.length > 10) {
            return false;
          }
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "S") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "PRINCIPAL_AMT_S",
      label: "PrincipalAmount",
      required: true,
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
      dependentFields: ["CALCSWITCH"],
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["principleAmtrequire"] }],
      },
      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "S") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "MATURITY_DT_S",
      label: "maturityDate",
      isReadOnly: true,
      defaultValue: new Date(),
      fullWidth: true,
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
      dependentFields: [
        "CALCSWITCH",
        "TRAN_DT_S",
        "PERIOD_NO_DISP_S",
        "PERIOD_NO_S",
      ],
      setValueOnDependentFieldsChange: (dependentFields) => {
        let duration = dependentFields.PERIOD_NO_DISP_S?.value;
        let periodNumber = parseInt(dependentFields.PERIOD_NO_S?.value, 10);
        let tranDateValue = dependentFields?.TRAN_DT_S?.value;
        let newDate = "";

        if (utilFunction.isValidDate(tranDateValue)) {
          const tranDate = new Date(tranDateValue);

          if (utilFunction.isValidDate(tranDate)) {
            let manipulatedDate;

            switch (duration) {
              case "D":
                manipulatedDate = addDays(tranDate, periodNumber);
                break;
              case "M":
                manipulatedDate = addMonths(tranDate, periodNumber);
                break;
              case "Y":
                manipulatedDate = addYears(tranDate, periodNumber);
                break;
              default:
                break;
            }

            if (utilFunction.isValidDate(manipulatedDate)) {
              newDate = format(manipulatedDate, "dd/MMM/yyyy");
            }
          }
        }
        if (utilFunction.isValidDate(newDate)) {
          return newDate;
        } else return "";
      },

      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "S") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "RATE_DEFINATION_S",
      label: "rateDefination",
      _optionsKey: "getFdRateDefination",
      placeholder: "selectRateDefination",
      options: (dependentValue, formState, _, authState) => {
        return API.getFdRateDefination({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
          BASE_BRANCH: authState?.user?.baseBranchCode,
        });
      },
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
      dependentFields: ["CALCSWITCH"],
      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "S") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "CAL_FD_REPORT__BTN",
      label: "Calculate",
      type: "text",
      GridProps: { xs: 2, sm: 2, md: 1, lg: 1, xl: 1 },
      dependentFields: ["CALCSWITCH"],
      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "S") {
          return false;
        }
        return true;
      },
    },
    //-------------- Recurring To FD -----------------//
    {
      render: { componentType: "autocomplete" },
      name: "CATEG_CD_F",
      label: "Category",
      _optionsKey: "getCategoryDDWdata",
      placeholder: "selectCategory",
      options: (dependentValue, formState, _, authState) => {
        return API.getCategoryDDWdata({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        });
      },
      fullWidth: true,
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
      dependentFields: ["CALCSWITCH"],
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["categCdRequired"] }],
      },
      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "F") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TRAN_DT_F",
      label: "asonDate",
      defaultValue: new Date(),
      fullWidth: true,
      required: true,
      format: "dd/MM/yyyy",
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
      dependentFields: ["CALCSWITCH"],
      placeholder: "selectAsOnDate",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["asOnDateRequired"] }],
      },
      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "F") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "RATE_DEFINATION_F",
      label: "Defination",
      placeholder: "selectDefination",
      _optionsKey: "getFdDefinationDdw",
      options: (dependentValue, formState, _, authState) => {
        return API.getFdDefinationDdw({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        });
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["definationRequired"] }],
      },
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
      dependentFields: ["CALCSWITCH"],
      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "F") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REMARK_F",
      defaultValue: "Customer",
      label: "proposedto",
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
      dependentFields: ["CALCSWITCH"],
      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "F") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "CAL_COMPARE_SHEET_BTN",
      label: "Calculate",
      type: "text",
      GridProps: { xs: 2, sm: 2, md: 1, lg: 1, xl: 1 },
      dependentFields: ["CALCSWITCH"],
      shouldExclude: (val1, dependent) => {
        if (dependent?.CALCSWITCH?.value === "F") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "INT_SCHEDULE",
      label: "Int. Schedule",
      dependentFields: [
        "CALCSWITCH",
        "BRANCH_CD",
        "ACCT_TYPE_P",
        "MATURITY_DT_P",
        "INT_RATE_P",
        "TRAN_DT_P",
        "PERIOD_NO_P",
        "PERIOD_NO_DISP_P",
        "TERM_CD_P",
        "PRINCIPAL_AMT_P",
        "TRAN_DT_P",
        "PERIOD_CD_P",

        "ACCT_TYPE_D",
        "MATURITY_DT_D",
        "INT_RATE_D",
        "TRAN_DT_D",
        "PERIOD_NO_D",
        "PERIOD_CD_D",
        "TERM_CD_D",
        "PRINCIPAL_AMT_D",
        "TRAN_DT_D",
      ],
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        const calcSwitch = dependentFieldsValues?.CALCSWITCH?.value ?? "P";
        const suffix = calcSwitch === "D" ? "_D" : "_P";

        const getVal = (key) =>
          dependentFieldsValues?.[`${key}${suffix}`]?.value;

        const isValid =
          dependentFieldsValues?.BRANCH_CD?.value &&
          getVal("ACCT_TYPE") &&
          getVal("MATURITY_DT") &&
          Number(getVal("INT_RATE")) > 0 &&
          getVal("TRAN_DT") &&
          getVal("PERIOD_NO") &&
          (calcSwitch === "P"
            ? dependentFieldsValues?.PERIOD_NO_DISP_P?.value
            : getVal("PERIOD_CD")) &&
          getVal("TERM_CD") &&
          getVal("PRINCIPAL_AMT");

        return !Boolean(isValid);
      },
      shouldExclude: (_, dependentFieldsValues, formState) => {
        const calcSwitch = dependentFieldsValues?.CALCSWITCH?.value;
        return !(calcSwitch === "P" || calcSwitch === "D");
      },
      ignoreInSubmit: true,
      GridProps: {
        xs: 12,
        sm: 3,
        md: 2,
        lg: 1.5,
        xl: 1,
      },
    },
  ],
};
