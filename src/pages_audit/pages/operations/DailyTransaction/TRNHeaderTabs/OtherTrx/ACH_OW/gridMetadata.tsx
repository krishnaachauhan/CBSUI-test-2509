import { GridMetaDataType } from "@acuteinfo/common-base";
export const ACH_OWGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "ACHOW",
    rowIdColumn: "index",
    defaultColumnConfig: {
      width: 150,
      maxWidth: 250,
      minWidth: 120,
    },
    allowColumnReordering: true,
    disableSorting: false,
    disableGroupBy: true,
    enablePagination: true,
    hideFooter: false,
    pageSizes: [10, 20, 30],
    defaultPageSize: 10,
    containerHeight: {
      min: "33.7vh",
      max: "29vh",
    },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
    isCusrsorFocused: true,
  },
  filters: [],
  columns: [
    {
      columnName: "SrNo",
      accessor: "sr",
      sequence: 1,
      componentType: "default",
      width: 80,
      maxWidth: 100,
      minWidth: 50,
    },
    {
      columnName: "Type",
      accessor: "NACH_TRN_TYPE",
      sequence: 2,
      componentType: "default",
      width: 100,
    },
    {
      columnName: "BranchIfscCode",
      accessor: "IFSC_CD",
      sequence: 3,
      componentType: "default",
      width: 130,
    },
    {
      columnName: "ReceiverIfscCode",
      accessor: "DEST_BANK_IIN",
      sequence: 4,
      componentType: "default",
      width: 170,
      maxWidth: 200,
      minWidth: 150,
      footerIsMultivalue: true,
      isTotalWithCurrency: true,
      footerLabel: `Accepted Mandate: {0}`,
      setFooterValue: (_, rows) => {
        const AcceptedCount = rows.filter(
          (item) => item?.original?.["STATUS"] === "A"
        ).length;

        return [AcceptedCount || "0"];
      },
    },
    {
      columnName: "MandateUMRNNo",
      accessor: "UMRN",
      sequence: 5,
      componentType: "default",
      width: 200,
      maxWidth: 250,
      minWidth: 150,
      footerIsMultivalue: true,
      isTotalWithCurrency: true,
      footerLabel: `Pending Mandate: {0}`,
      setFooterValue: (_, rows) => {
        const PendingCount = rows.filter(
          (item) => item?.original?.["STATUS"] === "P"
        ).length;

        return [PendingCount || "0"];
      },
    },
    {
      columnName: "Status",
      accessor: "STATUS_DISP",
      sequence: 6,
      componentType: "default",
      width: 170,
      maxWidth: 200,
      minWidth: 150,
      footerIsMultivalue: true,
      isTotalWithCurrency: true,
      footerLabel: `Rejected Mandate: {0}`,
      setFooterValue: (_, rows) => {
        const RejectedCount = rows.filter(
          (item) => item?.original?.["STATUS"] === "R"
        ).length;

        return [RejectedCount || "0"];
      },
    },
    {
      columnName: "ReasonCode",
      accessor: "REASON_CD",
      sequence: 7,
      componentType: "default",
      width: 170,
      maxWidth: 200,
      minWidth: 150,
      footerIsMultivalue: true,
      isTotalWithCurrency: true,
      footerLabel: `Cancel Mandate: {0}`,
      setFooterValue: (_, rows) => {
        const CancelCount = rows.filter(
          (item) => item?.original?.["STATUS"] === "C"
        ).length;

        return [CancelCount || "0"];
      },
    },
    {
      accessor: "VIEW_DTL",
      columnName: "",
      sequence: 12,
      alignment: "center",
      componentType: "buttonRowCell",
      buttonLabel: "ViewDetails",
      width: 80,
    },
  ],
};

export const ach_OW_dtlmetaData = {
  form: {
    name: "OW_DtlFormData",
    label: "ACH O/W Details",
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
        componentType: "textField",
      },
      name: "NACH_TRN_TYPE",
      label: "ACHType",
      required: true,
      GridProps: { xs: 4, sm: 4, md: 4, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "MSG_ID",
      label: "MandateIdentifier",
      dependentFields: ["STATUS"],
      required: true,
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.rowDetails?.STATUS === "P") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: { xs: 4, sm: 4, md: 4, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "MSG_ID_SPACER",
      dependentFields: ["STATUS"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.rowDetails?.STATUS === "P") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 4, sm: 4, md: 4, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TRAN_DT",
      label: "RegisterDate",
      format: "dd/MM/yyyy",
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "divider",
      },
      label: "OrderingAccountNumber",
      name: "OrderingAccountNumber",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "COMP_CD",
      label: "CompanyCode",
      required: true,
      GridProps: { xs: 1.5, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "_accountNumber",
      },
      branchCodeMetadata: {
        GridProps: { xs: 1.5, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
      },
      accountTypeMetadata: {
        GridProps: { xs: 1.5, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
      },
      accountCodeMetadata: {
        GridProps: { xs: 1.5, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "AccountName",
      GridProps: { xs: 3, sm: 3, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "UMRN",
      label: "UMRN",
      GridProps: { xs: 3, sm: 3, md: 3, lg: 3, xl: 3 },
    },

    {
      render: {
        componentType: "divider",
      },
      label: "NACHDtl",
      name: "NACHDtl",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "EXEC_TYPE_DISP",
      label: "ProcessingType",
      GridProps: { xs: 1.5, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "FEQ_TYPE_DISP",
      label: "Frequency",
      required: true,
      dependentFields: ["EXEC_TYPE"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.rowDetails?.EXEC_TYPE === "RCUR") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 1.5, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "FEQ_TYPE_SPACER",
      dependentFields: ["EXEC_TYPE"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.rowDetails?.EXEC_TYPE === "RCUR") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: { xs: 1.5, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "START_DT",
      label: "StartDate",
      format: "dd/MM/yyyy",
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "VALID_UPTO",
      label: "ValidUpto",
      required: true,
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.rowDetails?.VALID_UPTO_CNCL === "Y") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "VALID_UPTO_SPACER",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.rowDetails?.VALID_UPTO_CNCL === "Y") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "AMOUNT",
      label: "amount",
      dependentFields: ["ACCT_TYPE"],
      StartAdornment: (dependentFields) => {
        return dependentFields?.ACCT_TYPE?.optionData?.[0]?.CURRENCY_CD ?? "";
      },
      required: true,
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CATEGORY_CD",
      label: "MandateCategory",
      GridProps: { xs: 3, sm: 3, md: 3, lg: 3, xl: 3 },
    },

    {
      render: {
        componentType: "divider",
      },
      label: "ReceiverBank",
      name: "ReceiverBank",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "DEST_BANK_IIN",
      label: "MICRIFSCIIN",
      required: true,
      GridProps: { xs: 3.5, sm: 3.5, md: 3.5, lg: 3.5, xl: 3.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DEST_ACCT_NO",
      label: "ACNo",
      required: true,
      GridProps: { xs: 2.5, sm: 2.5, md: 2.5, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DEST_ACCT_NM",
      label: "Name",
      required: true,
      GridProps: { xs: 3.5, sm: 3.5, md: 3.5, lg: 3.5, xl: 3.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DEST_ACCT_TYPE",
      label: "AccType",
      required: true,
      GridProps: { xs: 2.5, sm: 2.5, md: 2.5, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SCHEME_TYPE",
      label: "Scheme",
      required: true,
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DEST_PHNO",
      label: "PhoneNo",
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DEST_MOBNO",
      label: "MobileNo",
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DEST_EMAIL_ID",
      label: "EmailID",
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DEST_OTHER_DTL",
      label: "PanNoOther",
      GridProps: { xs: 4, sm: 4, md: 4, lg: 4, xl: 4 },
    },

    {
      render: {
        componentType: "divider",
      },
      label: "Other",
      name: "Other",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REMARKS",
      label: "Remarks",
      GridProps: { xs: 2.5, sm: 2.5, md: 2.5, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "FILE_NM",
      label: "FileName",
      dependentFields: ["STATUS"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.rowDetails?.STATUS === "P") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: { xs: 2.5, sm: 2.5, md: 2.5, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "FILE_NM_SPACER",
      label: "FileName",
      dependentFields: ["STATUS"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.rowDetails?.STATUS === "P") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 2.5, sm: 2.5, md: 2.5, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "STATUS_DISP",
      label: "Status",
      required: true,
      GridProps: { xs: 1.5, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "DEACTIVE_DT",
      label: "Date",
      format: "dd/MM/yyyy",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          formState?.rowDetails?.STATUS === "P" ||
          formState?.rowDetails?.STATUS === "A"
        ) {
          return true;
        } else {
          return false;
        }
      },
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "DEACTIVE_DT_SPACER",
      label: "Date",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          formState?.rowDetails?.STATUS === "P" ||
          formState?.rowDetails?.STATUS === "A"
        ) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CANCEL_REASON_CD",
      label: "CancelReason",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.rowDetails?.STATUS === "C") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 1.5, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "CANCEL_REASON_CD_SPACER",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.rowDetails?.STATUS === "C") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: { xs: 1.5, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCEPTED",
      label: "Accepted",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.rowDetails?.STATUS === "P") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: { xs: 1, sm: 1, md: 1, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "ACCEPTED_SPACER",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.rowDetails?.STATUS === "P") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 1, sm: 1, md: 1, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REASON_CD",
      label: "ReasonCode",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.rowDetails?.STATUS === "P") {
          return true;
        } else {
          return false;
        }
      },
      GridProps: { xs: 1, sm: 1, md: 1, lg: 1, xl: 1 },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "REASON_CD_)SPACER",
      label: "ReasonCode",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.rowDetails?.STATUS === "P") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 1, sm: 1, md: 1, lg: 1, xl: 1 },
    },

    {
      render: {
        componentType: "divider",
      },
      label: "Amendment",
      name: "Amendment",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "AMEND",
      label: "Amend",
      GridProps: { xs: 1.5, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "AMEND_DT",
      label: "AmendDate",
      format: "dd/MM/yyyy",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.rowDetails?.AMEND) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "AMEND_DT_SPACER",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.rowDetails?.AMEND) {
          return true;
        } else {
          return false;
        }
      },
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "AMEND_REASON_CD",
      label: "AmendmentReason",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.rowDetails?.AMEND) {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "AMEND_REASON_CD_SPACER",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.rowDetails?.AMEND) {
          return true;
        } else {
          return false;
        }
      },
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
  ],
};
