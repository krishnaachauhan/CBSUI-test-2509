import { GridMetaDataType, utilFunction } from "@acuteinfo/common-base";
import { getCalculateGstComm, getRetrievalType, geTrxDdw } from "../api";
import { GeneralAPI } from "registry/fns/functions";
import {
  getGstCalcAmount,
  getStopPaymentReasonData,
  validatePayslipTranType,
} from "./api";
import { t } from "i18next";
import { icon } from "@fortawesome/fontawesome-svg-core";
import i18n from "components/multiLanguage/languagesConfiguration";
import { format } from "date-fns";
import {
  handleDisplayMessages,
  validateHOBranch,
} from "components/utilFunction/function";
import { isEmpty } from "lodash";

export const RetrieveFormConfigMetaData = {
  form: {
    name: "RetrieveFormConfigMetaData",
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
        componentType: "autocomplete",
      },
      name: "BRANCH_CD",
      label: "Branch",
      placeholder: "BranchCodePlaceHolder",
      options: "getBranchCodeList",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["BranchCodeReqired"] }],
      },
      dependentFields: ["SCREEN_REF"],

      GridProps: { xs: 3, sm: 4, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "DEF_TRAN_CD",
      label: "Type",
      isFieldFocused: true,
      placeholder: "Select Bill Type",
      required: true,
      fullWidth: true,
      dependentFields: ["BRANCH_CD"],
      options: (dependentValue, formState, _, authState) => {
        return getRetrievalType({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
          CODE: "DD",
        });
      },
      _optionsKey: "getCommonTypeList",
      setValueOnDependentFieldsChange: (dependentFields) => {
        let value = dependentFields?.DESCRIPTION?.value;

        return value;
      },
      GridProps: { xs: 3, sm: 4, md: 2, lg: 2, xl: 2 },

      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["billtypeRequired"] }],
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "PAYSLIP_NO",
      label: "payslipNumber",
      placeholder: "enterPayslipToretrive",
      type: "number",
      fullWidth: true,
      dependentFields: ["SCREEN_REF"],
      shouldExclude: (val1, dependent) => {
        if (
          dependent?.SCREEN_REF?.value === "CANCELCONFIRM" ||
          dependent?.SCREEN_REF?.value === "REALIZECONFIRM"
        ) {
          return true;
        }
        return false;
      },
      FormatProps: {
        allowLeadingZeros: true,
        isAllowed: (values) => {
          //@ts-ignore
          if (values?.value?.length > 14) {
            return false;
          }
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
      GridProps: { xs: 3, sm: 4, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "SCREEN_REF",
    },
    {
      render: {
        componentType: "radio",
      },
      name: "CANCEL",
      label: "",
      defaultValue: "E",
      RadioGroupProps: { row: true },
      options: [
        {
          label: "cancelReturnPending",
          value: "E",
        },
        {
          label: "confirmPending",
          value: "P",
        },
        {
          label: "todayTrns",
          value: "V",
        },
        {
          label: "Revalidate",
          value: "D",
        },
      ],
      dependentFields: ["SCREEN_REF"],
      shouldExclude: (val1, dependentFields) => {
        if (dependentFields?.SCREEN_REF?.value === "CANCELENTRY") {
          return false;
        }
        return true;
      },
      GridProps: { xs: 12, sm: 6, md: 3.5, lg: 3.5, xl: 3.5 },
    },
    {
      render: {
        componentType: "radio",
      },
      name: "REALIZE",
      label: "",
      defaultValue: "E",
      RadioGroupProps: { row: true },
      options: [
        {
          label: "realizePending",
          value: "E",
        },
        {
          label: "confirmPending",
          value: "P",
        },
        {
          label: "todayTrns",
          value: "V",
        },
      ],
      dependentFields: ["SCREEN_REF"],
      shouldExclude: (val1, dependentFields) => {
        if (dependentFields?.SCREEN_REF?.value === "REALIZEENTRY") {
          return false;
        }
        return true;
      },
      GridProps: { xs: 12, sm: 6, md: 3.5, lg: 3.5, xl: 3.5 },
    },
    {
      render: {
        componentType: "radio",
      },
      name: "REALIZECONF",
      label: "",
      defaultValue: "P",
      RadioGroupProps: { row: true },
      options: [
        {
          label: "confirmPending",
          value: "P",
        },
        {
          label: "todayTrns",
          value: "V",
        },
      ],
      dependentFields: ["SCREEN_REF"],
      shouldExclude: (val1, dependentFields) => {
        if (dependentFields?.SCREEN_REF?.value === "REALIZECONFIRM") {
          return false;
        }
        return true;
      },
      GridProps: { xs: 12, sm: 6, md: 3.5, lg: 3.5, xl: 3.5 },
    },
    {
      render: {
        componentType: "radio",
      },
      name: "STOPPAYMENT",
      label: "",
      defaultValue: "S",
      RadioGroupProps: { row: true },
      options: [
        {
          label: "stopPayment",
          value: "S",
        },
        {
          label: "realseStoppedPayslip",
          value: "R",
        },
      ],
      dependentFields: ["SCREEN_REF"],
      shouldExclude: (val1, dependentFields) => {
        if (dependentFields?.SCREEN_REF?.value === "STOPPAYMENT") {
          return false;
        }
        return true;
      },
      GridProps: { xs: 12, sm: 6, md: 3.5, lg: 3.5, xl: 3.5 },
    },
    {
      render: {
        componentType: "radio",
      },
      name: "CANCELCONFRM",
      label: "",
      defaultValue: "P",
      RadioGroupProps: { row: true },
      options: [
        {
          label: "confirmPending",
          value: "P",
        },
        {
          label: "todayTrns",
          value: "V",
        },
        {
          label: "RevalidateConfPending",
          value: "D",
        },
      ],
      dependentFields: ["SCREEN_REF"],
      shouldExclude: (val1, dependentFields) => {
        if (dependentFields?.SCREEN_REF?.value === "CANCELCONFIRM") {
          return false;
        }
        return true;
      },
      GridProps: { xs: 12, sm: 6, md: 3.5, lg: 3.5, xl: 3.5 },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "RETRIEVE",
      label: "Retrieve",
      endsIcon: "YoutubeSearchedFor",
      rotateIcon: "scale(1.5)",
      placeholder: "",
      type: "text",
      GridProps: { xs: 1.2, sm: 1.2, md: 1.2, lg: 1, xl: 1 },
    },
  ],
};
export const RetrieveGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "",
    rowIdColumn: "INDEX",
    defaultColumnConfig: {
      width: 400,
      maxWidth: 450,
      minWidth: 300,
    },
    allowColumnReordering: false,
    disableSorting: false,
    disableGroupBy: true,
    containerHeight: {
      min: "64vh",
      max: "65vh",
    },
    allowFilter: false,
    enablePagination: true,
    pageSizes: [50, 100, 150],
    defaultPageSize: 100,
    allowColumnHiding: false,
    allowRowSelection: false,
    isCusrsorFocused: true,
  },
  filters: [],
  columns: [
    {
      accessor: "ENTERED_BRANCH_CD",
      columnName: "issueBranch",
      sequence: 2,
      componentType: "default",
      alignment: "right",
      width: 115,
      maxWidth: 150,
      minWidth: 80,
    },
    {
      accessor: "PAYSLIP_NO",
      columnName: "payslipNumber",
      sequence: 3,
      componentType: "default",
      width: 100,
      maxWidth: 220,
      minWidth: 100,
      alignment: "right",
    },
    {
      accessor: "PENDING_FLAG_DISP",
      columnName: "entryStatus",
      sequence: 3,
      componentType: "default",
      width: 100,
      maxWidth: 220,
      minWidth: 100,
      alignment: "left",
      color: (val, data) => {
        let PENDING_FLAG = data?.original?.PENDING_FLAG_DISP ?? "";
        return PENDING_FLAG === "Pending" ? "red" : "green";
      },
    },
    {
      accessor: "REALIZE_FLAG_DISP",
      columnName: "confirmStatus",
      sequence: 4,
      componentType: "default",
      width: 150,
      maxWidth: 250,
      minWidth: 150,
      alignment: "left",
      color: (val, data) => {
        let REALIZE_FLAG = data?.original?.REALIZE_FLAG_DISP ?? "";
        return REALIZE_FLAG === "Pending" ? "red" : "green";
      },
    },
    {
      accessor: "TRAN_DT",
      columnName: "issueDate",
      sequence: 6,
      componentType: "date",
      width: 150,
      maxWidth: 220,
      minWidth: 150,
      alignment: "left",
    },
    {
      accessor: "AMOUNT",
      columnName: "amount",
      sequence: 6,
      componentType: "currency",
      width: 130,
      maxWidth: 150,
      minWidth: 100,
      alignment: "right",
    },

    {
      accessor: "ACCT_NO",
      columnName: "AccountNum",
      sequence: 7,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 200,
      minWidth: 100,
      maxWidth: 250,
    },
    {
      accessor: "INFAVOUR_OF",
      columnName: "SelectInfavourOf",
      sequence: 8,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 260,
      minWidth: 260,
      maxWidth: 260,
    },

    {
      accessor: "REVALID_DT",
      columnName: "reValidDate",
      sequence: 9,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 170,
      minWidth: 150,
      maxWidth: 220,
    },
  ],
};
export const reasonGridMetadata: any = {
  gridConfig: {
    dense: true,
    gridLabel: "",
    rowIdColumn: "REASON_CD",
    defaultColumnConfig: {
      width: 400,
      maxWidth: 450,
      minWidth: 300,
    },
    allowColumnReordering: true,
    disableSorting: false,
    hideHeader: false,
    disableGroupBy: true,
    disableGlobalFilter: true,
    enablePagination: true,
    pageSizes: [15, 30, 50],
    defaultPageSize: 20,
    containerHeight: {
      min: "50vh",
      max: "50vh",
    },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
    isCusrsorFocused: true,
    allowGlobalFilter: false,
  },
  filters: [],
  columns: [
    {
      accessor: "DISLAY_REASON",
      columnName: "Reason",
      sequence: 1,
      componentType: "default",
      alignment: "left",
      width: 520,
      maxWidth: 550,
      minWidth: 400,
    },
  ],
};
export const ddTransactionFormMetaData = {
  form: {
    name: "ddtransaction",
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
        componentType: "hidden",
      },
      name: "SCREENFLAG",
      label: "billType",
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "COMM_DISCRIPTION",
      label: "billType",
      isFieldFocused: true,
      placeholder: "Select Bill Type",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 4, xl: 4 },
    },
    {
      render: { componentType: "textField" },
      name: "INFAVOUR_OF",
      placeholder: "Select Infavour of",
      label: "inFavourOf",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ADDRESS",
      label: "address",
      placeholder: "address",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "INSTRUCTION_REMARKS",
      label: "instRemarks",
      placeholder: "instRemarks",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CCTFLAG",
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: { componentType: "textField" },
      name: "C_C_T",
      placeholder: "byTransfer",
      label: "",
      isReadOnly: true,
      fullWidth: true,
      type: "text",
      dependentFields: ["CCTFLAG"],
      setFieldLabel: (dependenet, currVal) => {
        let cct = dependenet?.CCTFLAG?.value;

        return cct === "C"
          ? { label: "By Cash" }
          : cct === "T"
          ? { label: "By Trf" }
          : cct === "R"
          ? { label: "By Cr. Trf" }
          : cct === "G"
          ? { label: "By CLG" }
          : null;
      },

      setValueOnDependentFieldsChange: (dependentFields) => {
        let cct = dependentFields?.CCTFLAG?.value;

        return cct === "C"
          ? "Cash"
          : cct === "T"
          ? "Transfer"
          : cct === "G"
          ? "Clearing"
          : cct === "R"
          ? "Transfer"
          : null;
      },
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: { componentType: "textField" },
      name: "REGION_NM",
      placeholder: "region",
      label: "region",
      isReadOnly: true,
      type: "text",
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
      fullWidth: true,
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SIGNATURE1_NM",
      label: "signature1",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SIGNATURE2_NM",
      label: "signature2",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "REVALID_DT",
      label: "reValidDate",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REVALID_BY",
      label: "reValidBy",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ISSUE_BRANCH",
      label: "payslipIsuueBranch",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "COL_BANK_CD",
      label: "bankCode",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BANK_NM",
      label: "bankName",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PARTY_NAME",
      label: "partyName",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PARTY_ADDRESS",
      label: "partyAddress",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "DOC_DATE",
      label: "documentDate",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TRAN_DT",
      label: "issueDate",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PAYSLIP_NO",
      label: "payslipNumber",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "AMOUNT",
      label: "amount",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "COMMISSION",
      label: "Commision",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "OTHER_COMISSION",
      label: "otherComm",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SERVICE_CHARGE",
      label: "GST",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BRANCH_NM",
      label: "branch",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "KYC_DOC_DISP",
      label: "kycDocument",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "KYC_DOC_NO",
      label: "kycDocumentNo",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "divider",
      },
      name: "DEVIDER",
      label: "Realization Pending",
      dependentFields: ["SCREENFLAG"],
      shouldExclude: (val1, dependentFields) => {
        if (
          dependentFields?.SCREENFLAG?.value === "REALIZEENTRY" ||
          dependentFields?.SCREENFLAG?.value === "CANCELENTRY"
        ) {
          return false;
        }
        return true;
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "divider",
      },
      name: "DEVIDER6",
      label: "Realized but Confirmation Pending",
      dependentFields: ["SCREENFLAG"],
      shouldExclude: (val1, dependentFields) => {
        if (dependentFields?.SCREENFLAG?.value === "REALIZECONFIRM") {
          return false;
        }
        return true;
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "divider",
      },
      name: "DEVIDER7",
      label: "Cancelled but Confirmation Pending",
      dependentFields: ["SCREENFLAG"],
      shouldExclude: (val1, dependentFields) => {
        if (dependentFields?.SCREENFLAG?.value === "CANCELCONFIRM") {
          return false;
        }
        return true;
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "REALIZE_DATE_DISP",
      label: "realizeDate",
      dependentFields: ["SCREENFLAG"],
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (
          dependentFields?.SCREENFLAG?.value === "REALIZECONFIRM" ||
          dependentFields?.SCREENFLAG?.value === "CANCELCONFIRM"
        ) {
          return true;
        } else return false;
      },
      shouldExclude: (val1, dependentFields) => {
        if (
          dependentFields?.SCREENFLAG?.value === "REALIZEENTRY" ||
          dependentFields?.SCREENFLAG?.value === "CANCELENTRY" ||
          dependentFields?.SCREENFLAG?.value === "REALIZECONFIRM" ||
          dependentFields?.SCREENFLAG?.value === "CANCELCONFIRM"
        ) {
          return false;
        }
        return true;
      },
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "REALIZE_AMT",
      label: "amount",
      dependentFields: ["CCTFLAG", "SCREENFLAG", "AMOUNT"],
      thousandsGroupStyle: "lakh",
      required: true,
      allowNegative: false,
      allowLeadingZeros: false,
      decimalScale: 2,
      fixedDecimalScale: true,
      enableNumWords: false,
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (
          dependentFields?.SCREENFLAG?.value === "REALIZECONFIRM" ||
          dependentFields?.SCREENFLAG?.value === "CANCELCONFIRM"
        ) {
          return true;
        } else return false;
      },
      shouldExclude: (val1, dependentFields) => {
        if (
          dependentFields?.SCREENFLAG?.value === "REALIZEENTRY" ||
          dependentFields?.SCREENFLAG?.value === "CANCELENTRY" ||
          dependentFields?.SCREENFLAG?.value === "REALIZECONFIRM" ||
          dependentFields?.SCREENFLAG?.value === "CANCELCONFIRM"
        ) {
          return false;
        }
        return true;
      },
      AlwaysRunPostValidationSetCrossFieldValues: {
        alwaysRun: true,
        touchAndValidate: false,
      },
      setValueOnDependentFieldsChange: (dependentFields) => {
        return dependentFields?.AMOUNT?.value;
      },

      postValidationSetCrossFieldValues: async (
        field,
        formState,
        auth,
        dependentFieldsValues
      ) => {
        if (field.value !== dependentFieldsValues?.AMOUNT?.value) {
          let buttonName = await formState?.MessageBox({
            messageTitle: t("ValidationFailed"),
            message: t("realizedAmountValidationMsg"),
            icon: "ERROR",
            buttonNames: ["Ok"],
          });

          if (buttonName === "Ok") {
            return {
              REALIZE_AMT: {
                value: "",
                isFieldFocused: false,
                ignoreUpdate: true,
              },
            };
          }
        }
      },

      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TRAN_DT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ENTERED_BRANCH_CD",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "ISSUE_DT",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "TRAN_TYPE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "SCREEN_CODE",
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "C_C_T_SP_C",
      options: [
        { label: "Cash", value: "C" },
        { label: "Clearing", value: "G" },
        { label: "Transfer", value: "T" },
      ],
      required: true,
      label: "",
      placeholder: "selectTrxType",
      validationRun: "all",
      dependentFields: [
        "CCTFLAG",
        "SCREENFLAG",
        "TRAN_DT",
        "ISSUE_DT",
        "ENTERED_BRANCH_CD",
        "REVALID_DT",
        "SCREEN_CODE",
        "TRAN_TYPE",
      ],
      setFieldLabel: (dependenet, currVal) => {
        return currVal === "C"
          ? { label: "By Cash" }
          : currVal === "T"
          ? { label: "By Transfer" }
          : currVal === "G"
          ? { label: "By Clearing" }
          : { label: "By" };
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFields
      ) => {
        if (
          dependentFields?.SCREENFLAG?.value === "REALIZEENTRY" ||
          dependentFields?.SCREENFLAG?.value === "CANCELENTRY"
        ) {
          let postData = await validatePayslipTranType({
            A_COMP_CD: authState?.companyID ?? "",
            A_ENT_BRANCH_CD: dependentFields?.ENTERED_BRANCH_CD?.value ?? "",
            A_TRAN_DT:
              dependentFields?.TRAN_DT?.value ?? ""
                ? format(
                    new Date(dependentFields?.TRAN_DT?.value),
                    "dd/MMM/yyyy"
                  )
                : "",

            A_ISSUE_DT: dependentFields?.ISSUE_DT?.value
              ? format(
                  new Date(dependentFields?.ISSUE_DT?.value),
                  "dd/MMM/yyyy"
                )
              : "",
            A_REVALID_DT: dependentFields?.REVALID_DT?.value
              ? format(
                  new Date(dependentFields?.REVALID_DT?.value),
                  "dd/MMM/yyyy"
                )
              : "",
            A_C_C_T_SP_C: currentField.value ?? "",
            A_TRAN_TYPE: dependentFields?.TRAN_TYPE?.value ?? "",
            A_GD_DATE: authState?.workingDate ?? "",
            A_USER: authState?.user?.id ?? "",
            A_USER_LEVEL: authState?.role ?? "",
            A_SCREEN_REF: dependentFields?.SCREEN_CODE?.value ?? "",
            A_LANG: i18n.resolvedLanguage ?? "",
          });
          const msgDtl = await handleDisplayMessages(
            postData,
            formState?.MessageBox
          );

          if (isEmpty(msgDtl)) {
            return {
              C_C_T_SP_C: {
                value: "",
                ignoreUpdate: false,
              },
            };
          }
        }
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["selectTransactionMode"] }],
      },
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (
          dependentFields?.SCREENFLAG?.value === "REALIZECONFIRM" ||
          dependentFields?.SCREENFLAG?.value === "CANCELCONFIRM"
        ) {
          return true;
        } else return false;
      },
      shouldExclude: (val1, dependentFields) => {
        if (
          dependentFields?.SCREENFLAG?.value === "REALIZEENTRY" ||
          dependentFields?.SCREENFLAG?.value === "CANCELENTRY" ||
          dependentFields?.SCREENFLAG?.value === "REALIZECONFIRM" ||
          dependentFields?.SCREENFLAG?.value === "CANCELCONFIRM"
        ) {
          return false;
        }
        return true;
      },
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "COLLECT_COMISSION_CHARGE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "COLLECT_COMISSION_FLAGE",
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "COL_SER_CANCEL_CHARGE",
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "COLLECT_COMISSION",
      label: "colComm",
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
      dependentFields: [
        "SCREENFLAG",
        "REALIZE_AMT",
        "COLLECT_COMISSION_CHARGE",
        "COLLECT_COMISSION_FLAGE",
        "PAYSLIP_MST_DTL",
        "TRF_COMP_CD_DISP",
        "TRF_BRANCH_CD",
        "TRF_ACCT_TYPE",
        "TRF_ACCT_CD",
      ],
      setValueOnDependentFieldsChange: (field, dependentFields) => {
        if (field?.value) {
          return field?.value;
        }
        return dependentFields?.COLLECT_COMISSION_CHARGE?.value;
      },
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (
          dependentFields?.SCREENFLAG?.value === "REALIZECONFIRM" ||
          dependentFields?.SCREENFLAG?.value === "CANCELCONFIRM" ||
          dependentFields?.COLLECT_COMISSION_FLAGE?.value === "Y"
        ) {
          return true;
        } else return false;
      },
      shouldExclude: (val1, dependentFields) => {
        if (
          dependentFields?.SCREENFLAG?.value === "REALIZEENTRY" ||
          dependentFields?.SCREENFLAG?.value === "CANCELENTRY" ||
          dependentFields?.SCREENFLAG?.value === "REALIZECONFIRM" ||
          dependentFields?.SCREENFLAG?.value === "CANCELCONFIRM"
        ) {
          return false;
        }
        return true;
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (formState.isSubmitting) {
          return {};
        }

        const reqParams = {
          COMP_CD:
            dependentFieldsValues?.TRF_COMP_CD_DISP?.value ??
            authState?.companyID,
          BRANCH_CD: dependentFieldsValues?.TRF_BRANCH_CD?.value ?? "",
          ACCT_TYPE: dependentFieldsValues?.TRF_ACCT_TYPE?.value ?? "",
          ACCT_CD: dependentFieldsValues?.TRF_ACCT_CD?.value ?? "",

          AMOUNT: currentField?.value ?? "",
          ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
          MODULE: "",
          ASON_DT: authState?.workingDate ?? "",
        };

        if (
          reqParams.AMOUNT !== "" &&
          dependentFieldsValues?.SCREENFLAG?.value === "CANCELENTRY"
        ) {
          const gstApiData = await getGstCalcAmount(reqParams);

          return isEmpty(gstApiData)
            ? {
                TRF_ACCT_CD: {
                  value: "",
                  ignoreUpdate: false,
                  isFieldFocused: true,
                },
                TRF_NAME: { value: "" },
              }
            : {
                COL_SER_CHARGE: {
                  value: gstApiData?.[0]?.TAX_AMOUNT ?? "",
                  ignoreUpdate: true,
                },
              };
        } else {
          return {};
        }
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "COL_SER_CHARGE",
      label: "colGst",
      isReadOnly: true,
      dependentFields: ["SCREENFLAG", "COL_SER_CANCEL_CHARGE"],
      shouldExclude: (val1, dependentFields) => {
        if (
          dependentFields?.SCREENFLAG?.value === "REALIZEENTRY" ||
          dependentFields?.SCREENFLAG?.value === "CANCELENTRY" ||
          dependentFields?.SCREENFLAG?.value === "REALIZECONFIRM" ||
          dependentFields?.SCREENFLAG?.value === "CANCELCONFIRM"
        ) {
          return false;
        }
        return true;
      },
      setValueOnDependentFieldsChange: (field, dependentFields) => {
        if (field?.value) {
          return field?.value;
        }
        return dependentFields?.COL_SER_CANCEL_CHARGE?.value;
      },
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TRF_COMP_CD_DISP",
      label: "",
      isReadOnly: true,
      GridProps: { xs: 1, sm: 1, md: 1, lg: 1, xl: 1 },
      dependentFields: ["C_C_T_SP_C", "SCREENFLAG"],
      shouldExclude: (val1, dependent) => {
        if (
          dependent?.C_C_T_SP_C?.value === "T" &&
          (dependent?.SCREENFLAG?.value === "REALIZEENTRY" ||
            dependent?.SCREENFLAG?.value === "CANCELENTRY" ||
            dependent?.SCREENFLAG?.value === "REALIZECONF")
        ) {
          return false;
        }
        return true;
      },
    },
    {
      render: { componentType: "_accountNumber" },

      branchCodeMetadata: {
        name: "TRF_BRANCH_CD",
        label: "transferBranchCd",
        dependentFields: ["C_C_T_SP_C", "SCREENFLAG"],
        isReadOnly: (fieldValue, dependentFields, formState) => {
          if (
            dependentFields?.SCREENFLAG?.value === "REALIZECONFIRM" ||
            dependentFields?.SCREENFLAG?.value === "CANCELCONFIRM"
          ) {
            return true;
          } else return false;
        },
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};

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
            ACCT_NM: { value: "" },
          };
        },
        shouldExclude: (val1, dependent) => {
          if (
            dependent?.C_C_T_SP_C?.value === "T" &&
            (dependent?.SCREENFLAG?.value === "REALIZEENTRY" ||
              dependent?.SCREENFLAG?.value === "CANCELENTRY" ||
              dependent?.SCREENFLAG?.value === "CANCELCONFIRM" ||
              dependent?.SCREENFLAG?.value === "REALIZECONFIRM")
          ) {
            return false;
          }
          return true;
        },
        GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
      },
      accountTypeMetadata: {
        name: "TRF_ACCT_TYPE",
        label: "transferAcctType",
        GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
        dependentFields: ["C_C_T_SP_C", "SCREENFLAG", "TRF_BRANCH_CD"],
        isReadOnly: (fieldValue, dependentFields, formState) => {
          if (
            dependentFields?.SCREENFLAG?.value === "REALIZECONFIRM" ||
            dependentFields?.SCREENFLAG?.value === "CANCELCONFIRM"
          ) {
            return true;
          } else return false;
        },
        shouldExclude: (val1, dependent) => {
          if (
            dependent?.C_C_T_SP_C?.value === "T" &&
            (dependent?.SCREENFLAG?.value === "REALIZEENTRY" ||
              dependent?.SCREENFLAG?.value === "CANCELENTRY" ||
              dependent?.SCREENFLAG?.value === "CANCELCONFIRM" ||
              dependent?.SCREENFLAG?.value === "REALIZECONFIRM")
          ) {
            return false;
          }
          return true;
        },
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            currentField?.value &&
            dependentFieldValues?.TRF_BRANCH_CD?.value?.length === 0
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("enterBranchCode"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                TRF_ACCT_TYPE: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },
                TRF_BRANCH_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          }
          return {
            TRF_ACCT_CD: { value: "", ignoreUpdate: false },
            TRF_NAME: { value: "" },
          };
        },
      },
      accountCodeMetadata: {
        name: "TRF_ACCT_CD",
        label: "transferAccNo",
        autoComplete: "off",
        maxLength: 20,
        dependentFields: [
          "TRF_ACCT_TYPE",
          "TRF_BRANCH_CD",
          "C_C_T_SP_C",
          "SCREENFLAG",
        ],
        isReadOnly: (fieldValue, dependentFields, formState) => {
          if (dependentFields?.SCREENFLAG?.value === "REALIZECONFIRM") {
            return true;
          } else return false;
        },
        shouldExclude: (val1, dependent) => {
          if (
            dependent?.C_C_T_SP_C?.value === "T" &&
            (dependent?.SCREENFLAG?.value === "REALIZEENTRY" ||
              dependent?.SCREENFLAG?.value === "CANCELCONFIRM" ||
              dependent?.SCREENFLAG?.value === "CANCELENTRY" ||
              dependent?.SCREENFLAG?.value === "REALIZECONFIRM")
          ) {
            return false;
          }
          return true;
        },
        runPostValidationHookAlways: true,
        AlwaysRunPostValidationSetCrossFieldValues: {
          alwaysRun: true,
          touchAndValidate: true,
        },
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          const acctType = dependentFieldValues?.TRF_ACCT_TYPE?.value;
          const branchCd = dependentFieldValues?.TRF_BRANCH_CD?.value;
          const acctCd = utilFunction.getPadAccountNumber(
            currentField?.value,
            dependentFieldValues?.TRF_ACCT_TYPE?.optionData?.[0] ?? {}
          );
          if (currentField?.value && !acctType) {
            const buttonName = await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("enterAccountType"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                TRF_ACCT_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
                TRF_ACCT_TYPE: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
            return {};
          }

          if (currentField?.value && branchCd && acctType) {
            const reqParameters = {
              BRANCH_CD: branchCd,
              COMP_CD: authState?.companyID,
              ACCT_TYPE: acctType,
              ACCT_CD: acctCd,
              SCREEN_REF:
                dependentFieldValues?.SCREENFLAG?.value === "REALIZEENTRY"
                  ? "RPT/17"
                  : dependentFieldValues?.SCREENFLAG?.value === "CANCELENTRY"
                  ? "RPT/20"
                  : "RPT/22",
            };

            const postData = await GeneralAPI.getAccNoValidation(reqParameters);
            console.log(postData?.MSG, "message");

            const msgDtl = await handleDisplayMessages(
              postData?.MSG,
              formState?.MessageBox
            );

            console.log("msgDtl: ", msgDtl);
            return isEmpty(msgDtl)
              ? {
                  TRF_ACCT_CD: {
                    value: "",
                    ignoreUpdate: true,
                    isFieldFocused: false,
                  },
                  TRF_NAME: { value: "" },
                }
              : {
                  TRF_ACCT_CD: {
                    value: acctCd,
                    ignoreUpdate: true,
                    isFieldFocused: false,
                  },
                  TRF_NAME: { value: postData?.ACCT_NM ?? "" },
                };
          }

          if (!currentField?.value) {
            return { TRF_NAME: { value: "" } };
          }

          return {};
        },

        fullWidth: true,
        GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TRF_NAME",
      label: "transfeAcName",
      isReadOnly: true,
      dependentFields: ["C_C_T_SP_C", "SCREENFLAG"],
      shouldExclude: (val1, dependent) => {
        if (
          dependent?.C_C_T_SP_C?.value === "T" &&
          (dependent?.SCREENFLAG?.value === "REALIZEENTRY" ||
            dependent?.SCREENFLAG?.value === "CANCELENTRY" ||
            dependent?.SCREENFLAG?.value === "CANCELCONFIRM" ||
            dependent?.SCREENFLAG?.value === "REALIZECONFIRM")
        ) {
          return false;
        }
        return true;
      },
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "REALIZE_FLAG",
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "TOKEN_NO",
      label: "TokenNo",
      placeholder: "TokenNo",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["tokenNumberValidationMsg"] }],
      },
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
      dependentFields: ["C_C_T_SP_C", "SCREENFLAG"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        auth,
        dependentFieldsValues
      ) => {
        if (field.value === "") {
          let buttonName = await formState?.MessageBox({
            messageTitle: t("ValidationFailed"),
            message: t("tokenNumberValidationMsg"),
            icon: "ERROR",
            buttonNames: ["Ok"],
          });

          if (buttonName === "Ok") {
            return {
              TOKEN_NO: {
                isFieldFocused: true,
              },
            };
          }
        }
      },
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (
          dependentFields?.SCREENFLAG?.value === "REALIZECONFIRM" ||
          dependentFields?.SCREENFLAG?.value === "CANCELCONFIRM"
        ) {
          return true;
        } else return false;
      },
      shouldExclude: (val1, dependent) => {
        if (
          dependent?.C_C_T_SP_C?.value === "C" &&
          (dependent?.SCREENFLAG?.value === "REALIZEENTRY" ||
            dependent?.SCREENFLAG?.value === "CANCELENTRY" ||
            dependent?.SCREENFLAG?.value === "CANCELCONFIRM" ||
            dependent?.SCREENFLAG?.value === "REALIZECONFIRM")
        ) {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "divider",
      },
      name: "DEVIDER3",
      label: "Stop Payment",
      dependentFields: ["SCREENFLAG"],
      shouldExclude: (val1, dependentFields) => {
        if (dependentFields?.SCREENFLAG?.value === "STOPPAYMENT") {
          return false;
        }
        return true;
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "STOP_PAY_DATE",
      label: "stopDate",
      dependentFields: ["SCREENFLAG"],
      shouldExclude: (val1, dependentFields) => {
        if (dependentFields?.SCREENFLAG?.value === "STOPPAYMENT") {
          return false;
        }
        return true;
      },
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "REALEASE_DATE",
      label: "realeaseDate",
      dependentFields: ["SCREENFLAG"],
      placeholder: "DD/MM/YYYY",
      shouldExclude: (val1, dependentFields) => {
        if (dependentFields?.SCREENFLAG?.value === "STOPPAYMENT") {
          return false;
        }
        return true;
      },
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "STOP_REMARKS",
      label: "Reason",
      type: "text",
      dependentFields: ["SCREENFLAG"],
      required: "true",
      placeholder: "enterReason",
      preventSpecialChars: localStorage.getItem("specialChar") || "",

      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["stopRemarksRequired"] }],
      },
      shouldExclude: (val1, dependentFields) => {
        if (dependentFields?.SCREENFLAG?.value === "STOPPAYMENT") {
          return false;
        }
        return true;
      },
      fullWidth: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "REALIZE_BY",
      label: "realizedBy",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "divider",
      },
      name: "DEVIDER2",
      label: "Account Details",
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "arrayField",
      },
      name: "PAYSLIP_MST_DTL",

      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },

      _fields: [
        {
          render: {
            componentType: "textField",
          },
          name: "BRANCH_CD",
          label: "branch",
          isReadOnly: true,
          GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ACCT_TYPE",
          isReadOnly: true,
          label: "AccountType",
          GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ACCT_CD",
          label: "AccountNo",
          isReadOnly: true,
          GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "REMARKS",
          label: "narration",
          isReadOnly: true,
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "TRAN_BAL",
          label: "balance",
          isReadOnly: true,
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
        },
        {
          render: { componentType: "textField" },
          name: "C_C_T",
          placeholder: "",
          label: "byTrf",
          fullWidth: true,
          isReadOnly: true,
          setFieldLabel: (dependenet, currVal) => {
            return currVal === "C"
              ? { label: "By Cash" }
              : currVal === "T"
              ? { label: "By Trf" }
              : currVal === "R"
              ? { label: "By Cr. Trf" }
              : currVal === "G"
              ? { label: "By CLG" }
              : null;
          },
          setValueOnDependentFieldsChange: (
            dependentFields,
            _,
            currentField
          ) => {
            let cct = currentField?.value;

            return cct === "C"
              ? "Cash"
              : cct === "T"
              ? "Transfer"
              : cct === "G"
              ? "Clearing"
              : cct === "R"
              ? "Transfer"
              : null;
          },

          GridProps: { xs: 12, sm: 6, md: 4, lg: 1, xl: 1 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "CHEQUE_NO_DISP",
          label: "chequeNo",
          dependentFields: ["CCTFLAG"],
          isReadOnly: true,
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "CHEQUE_DATE",
          label: "chequeDate",
          isReadOnly: true,
          format: "dd/MM/yyyy",
          type: "text",
          fullWidth: true,
          GridProps: { xs: 12, sm: 6, md: 4, lg: 1.5, xl: 1.5 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "AMOUNT",
          label: "amount",
          fullWidth: true,
          isReadOnly: true,
          type: "text",
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2, xl: 2 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "COMMISSION",
          label: "Comm.",
          fullWidth: true,
          isReadOnly: true,
          type: "text",
          GridProps: { xs: 12, sm: 6, md: 4, lg: 1, xl: 1 },
        },
        {
          render: {
            componentType: "amountField",
          },
          name: "SERVICE_CHARGE",
          label: "GST",
          isReadOnly: true,
          type: "text",
          fullWidth: true,
          GridProps: { xs: 12, sm: 6, md: 4, lg: 1, xl: 1 },
        },
        {
          render: {
            componentType: "textField",
          },
          name: "ACCT_NM",
          label: "accountName",
          isReadOnly: true,
          type: "text",
          fullWidth: true,
          GridProps: { xs: 12, sm: 6, md: 4, lg: 2.5, xl: 2.5 },
        },
      ],
    },

    {
      render: {
        componentType: "divider",
      },
      name: "DEVIDER5",
      label: "Stop Payment Reason",
      dependentFields: ["SCREENFLAG"],
      shouldExclude: (val1, dependentFields) => {
        if (dependentFields?.SCREENFLAG?.value === "STOPPAYMENT") {
          return false;
        }
        return true;
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "divider",
      },
      name: "DEVIDER9",
      label: "Cancel/Return/Revalidate Reason",
      dependentFields: ["SCREENFLAG"],
      shouldExclude: (val1, dependentFields) => {
        if (
          dependentFields?.SCREENFLAG?.value === "CANCELENTRY" ||
          dependentFields?.SCREENFLAG?.value === "CANCELCONFIRM"
        ) {
          return false;
        }
        return true;
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },

    {
      render: {
        componentType: "arrayField",
      },
      name: "CANCEL_REASON",
      __EDIT__: {
        fixedRows: true,
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 6, xl: 6 },
      dependentFields: ["SCREENFLAG"],
      shouldExclude: (val1, dependentFields) => {
        if (
          dependentFields?.SCREENFLAG?.value === "CANCELENTRY" ||
          dependentFields?.SCREENFLAG?.value === "STOPPAYMENT" ||
          dependentFields?.SCREENFLAG?.value === "CANCELCONFIRM"
        ) {
          return false;
        }
        return true;
      },
      _fields: [
        {
          render: {
            componentType: "autocomplete",
          },
          name: "REASON_CD",
          label: "Reason",
          placeholder: "SelectReason",
          isFieldFocused: true,
          dependentFields: ["SCREENFLAG"],
          options: (dependentValue, formState, _, authState) => {
            return getStopPaymentReasonData({
              COMP_CD: authState?.companyID,
              BRANCH_CD: authState?.user?.branchCode,
            });
          },
          _optionsKey: "getStopPaymentReason",
          isReadOnly: (fieldValue, dependentFields, formState) => {
            if (
              dependentFields?.SCREENFLAG?.value === "CANCELCONFIRM" ||
              dependentFields?.SCREENFLAG?.value === "STOPPAYMENT"
            ) {
              return true;
            } else return false;
          },

          GridProps: { xs: 12, sm: 6, md: 7, lg: 7, xl: 7 },
        },
      ],
    },
  ],
};
