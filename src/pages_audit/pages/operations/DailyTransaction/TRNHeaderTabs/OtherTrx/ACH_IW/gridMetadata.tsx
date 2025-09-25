import { GridMetaDataType } from "@acuteinfo/common-base";
export const ACH_IWGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "ACHIW",
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
  },
  filters: [],
  columns: [
    {
      columnName: "SrNo",
      accessor: "sr",
      sequence: 1,
      componentType: "default",
      alignment: "right",
      width: 80,
      maxWidth: 100,
      minWidth: 50,
    },
    {
      columnName: "Type",
      accessor: "TRN_TYPE_DISP",
      sequence: 2,
      componentType: "default",
      width: 100,
    },
    {
      columnName: "OrderingIFSC",
      accessor: "ORD_BANK_IFSC",
      sequence: 3,
      componentType: "default",
      width: 130,
    },
    {
      columnName: "BenfcIFSC",
      accessor: "BEF_BANK_IFSC",
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
      accessor: "MNDT_ID",
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
      accessor: "REJECT_REASON_CD",
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

export const ach_IW_dtlmetaData = {
  form: {
    name: "IW_DtlFormData",
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
        componentType: "textField",
      },
      name: "MSG_ID",
      label: "MessageId",
      type: "text",
      GridProps: { xs: 2.5, sm: 2.5, md: 2.5, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CRT_DTTM",
      label: "CreateDateTime",
      type: "text",
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "ORD_BANK_REG_ID",
      label: "CorporateRegId",
      type: "text",
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ORD_BANK_IFSC",
      label: "OrderingBankIFSC",
      type: "text",
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ORD_BANK_NM",
      label: "OrderingBankNM",
      type: "text",
      GridProps: { xs: 3.5, sm: 3.5, md: 3.5, lg: 3.5, xl: 3.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BEF_BANK_IFSC",
      label: "BeneficiaryBankIFSC",
      type: "text",
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BEF_BANK_NM",
      label: "BeneficiaryBankNM",
      type: "text",
      GridProps: { xs: 3.5, sm: 3.5, md: 3.5, lg: 3.5, xl: 3.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "MNDT_REQ_ID",
      label: "MandateRegId",
      type: "text",
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "MNDT_ID",
      label: "MandateUMRNNo",
      type: "text",
      GridProps: { xs: 3, sm: 3, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "MNDT_CATEGORY",
      label: "MandateCategory",
      type: "text",
      GridProps: { xs: 1.5, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "MNDT_TYPE",
      label: "MandateType",
      type: "text",
      GridProps: { xs: 1.5, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "MNDT_FILE_NM",
      label: "FileName",
      type: "text",
      GridProps: { xs: 3.5, sm: 3.5, md: 3.5, lg: 3.5, xl: 3.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SEQ_TYPE_DISP",
      label: "TRNSequence",
      type: "text",
      GridProps: { xs: 1.5, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "FRQCY_DISP",
      label: "MandateFreq",
      type: "text",
      GridProps: { xs: 1.5, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "FRST_COLLTN_DT",
      label: "StartDate",
      format: "yyyy-MM-dd",
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "FNL_COLLTN_DT",
      label: "EndDate",
      format: "yyyy-MM-dd",
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      dependentFields: ["TRN_ACCT_TYPE"],
      StartAdornment: (dependentFields) => {
        return (
          dependentFields?.TRN_ACCT_TYPE?.optionData?.[0]?.CURRENCY_CD ?? ""
        );
      },
      name: "COLLTN_AMT",
      label: "amount",
      type: "text",
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CR_NM",
      label: "CreditorNM",
      type: "text",
      GridProps: { xs: 3, sm: 3, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CR_ACCT_NO",
      label: "CrAcNo",
      type: "text",
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CR_AGT_IFSC",
      label: "CreditAgentIFSC",
      type: "text",
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CR_AGT_NM",
      label: "CreditAgentNM",
      type: "text",
      GridProps: { xs: 3, sm: 3, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DR_NM",
      label: "DebitorNM",
      type: "text",
      GridProps: { xs: 3, sm: 3, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DR_ACCT_NO",
      label: "DrAcNo",
      type: "text",
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DR_AGT_IFSC",
      label: "DebitAgentIFSC",
      type: "text",
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DR_AGT_NM",
      label: "DebitAgentNM",
      type: "text",
      GridProps: { xs: 3, sm: 3, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DR_ACCT_TYPE",
      label: "DrType",
      type: "text",
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DR_SCHEME",
      label: "DrScheme",
      type: "text",
      GridProps: { xs: 1.5, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DR_REF_NO",
      label: "DebitrefNo",
      type: "text",
      GridProps: { xs: 1.5, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DR_PHNO",
      label: "DebitorPhoneNo",
      type: "text",
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DR_MOBNO",
      label: "MobileNo",
      type: "text",
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DR_EMAIL",
      label: "EmailID",
      type: "text",
      GridProps: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DR_OTHER",
      label: "Other",
      type: "text",
      GridProps: { xs: 3, sm: 3, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "divider",
      },
      label: "AcFound",
      name: "AcFound",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TRN_COMP_CD",
      label: "CompanyCode",
      type: "text",
      GridProps: { xs: 1.5, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "_accountNumber",
      },
      branchCodeMetadata: {
        name: "TRN_BRANCH_CD",
        GridProps: { xs: 1.5, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
      },
      accountTypeMetadata: {
        name: "TRN_ACCT_TYPE",
        GridProps: { xs: 1.5, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
      },
      accountCodeMetadata: {
        name: "TRN_ACCT_CD",
        GridProps: { xs: 1.5, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "AccountName",
      type: "text",
      GridProps: { xs: 6, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "STATUS_DISP",
      label: "Status",
      type: "text",
      textFieldStyle: {
        "& .MuiInputBase-root": {
          color: "red !important",
        },
        "& .MuiInputBase-input": {
          color: "red !important",
          "&.Mui-disabled": {
            color: "red !important",
            "-webkit-text-fill-color": "red !important",
          },
        },
      },
      GridProps: { xs: 1.5, sm: 1.5, md: 1.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REJECT_REASON_CD",
      label: "Reason",
      type: "text",
      textFieldStyle: {
        "& .MuiInputBase-root": {
          color: "red !important",
        },
        "& .MuiInputBase-input": {
          color: "red !important",
          "&.Mui-disabled": {
            color: "red !important",
            "-webkit-text-fill-color": "red !important",
          },
        },
      },
      GridProps: { xs: 3, sm: 3, md: 3, lg: 3, xl: 3 },
    },
  ],
};
