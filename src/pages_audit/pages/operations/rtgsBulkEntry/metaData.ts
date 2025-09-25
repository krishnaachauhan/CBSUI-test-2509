import { GridMetaDataType } from "@acuteinfo/common-base";
import { GetBankRTGSImportDdwn } from "./api";

export const BulkAccountDetailMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "BeneficiaryDetail",
    rowIdColumn: "SR_CD",
    defaultColumnConfig: {
      width: 400,
      maxWidth: 450,
      minWidth: 300,
    },
    allowColumnReordering: true,
    allowRowSelection: false,
    disableSorting: false,
    disableGroupBy: true,
    hideHeader: true,
    containerHeight: {
      min: "26vh",
      max: "26vh",
    },
    allowColumnHiding: false,
    isCusrsorFocused: true,
  },
  columns: [
    {
      accessor: "id",
      columnName: "SrNo",
      sequence: 1,
      alignment: "left",
      componentType: "default",
      width: 70,
      minWidth: 60,
      maxWidth: 120,
      isAutoSequence: true,
    },
    {
      accessor: "TO_ACCT_NO",
      columnName: "ACNo",
      sequence: 2,
      alignment: "left",
      componentType: "default",
      width: 150,
      minWidth: 100,
      maxWidth: 190,
    },
    {
      accessor: "TO_ACCT_NM",
      columnName: "Name",
      sequence: 3,
      alignment: "left",
      componentType: "default",
      width: 300,
      minWidth: 300,
      maxWidth: 350,
    },
    {
      accessor: "VERIFY",
      columnName: "",
      buttonLabel: "Verify",
      sequence: 4,
      alignment: "center",
      componentType: "buttonRowCell",
      __VIEW__: {
        isVisible: false,
      },
      width: 90,
      minWidth: 60,
      maxWidth: 130,
    },
    {
      accessor: "TO_ACCT_TYPE",
      columnName: "AccountType",
      sequence: 5,
      alignment: "left",
      componentType: "default",
      width: 150,
      minWidth: 100,
      maxWidth: 190,
    },
    {
      accessor: "CONTACT_NO",
      columnName: "contactNo",
      sequence: 6,
      alignment: "left",
      componentType: "default",
      width: 120,
      minWidth: 100,
      maxWidth: 200,
    },
    {
      accessor: "TO_EMAIL_ID",
      columnName: "EmailID",
      sequence: 7,
      componentType: "default",
      width: 150,
      minWidth: 100,
      maxWidth: 250,
    },
    {
      accessor: "TO_IFSCCODE",
      columnName: "IFSCCode",
      sequence: 8,
      componentType: "default",
      width: 120,
      minWidth: 100,
      maxWidth: 200,
      isVisible: true,
    },
    {
      accessor: "AMOUNT",
      columnName: "Amount",
      sequence: 9,
      alignment: "right",
      componentType: "currency",
      width: 180,
      minWidth: 150,
      maxWidth: 200,
      isTotalWithCurrency: true,
      footerLabel: "Total Amt:",
    },
    {
      accessor: "TO_ADD1",
      columnName: "Address",
      sequence: 10,
      componentType: "default",
      width: 320,
      minWidth: 300,
      maxWidth: 400,
    },
    {
      accessor: "REMARKS",
      columnName: "Remarks",
      sequence: 11,
      alignment: "left",
      componentType: "default",
      width: 300,
      minWidth: 250,
      maxWidth: 350,
      showTooltip: true,
      isTotalWithCurrency: true,
      footerLabel: "Erroneous:",
      setFooterValue(total, rows) {
        const errorCount = rows.filter(
          (row) => row?.original?.ERROR_FLAG === "Y"
        ).length;
        return errorCount;
      },
    },
    {
      columnName: "Action",
      componentType: "buttonRowCell",
      accessor: "ERROR",
      buttonLabel: "Error",
      alignment: "center",
      __VIEW__: {
        isVisible: false,
      },
      shouldExclude: (initialValue, original) => {
        if (original?.ERROR_FLAG === "Y") {
          return false;
        }
        return true;
      },
      sequence: 12,
      width: 100,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      columnName: "",
      buttonLabel: "Delete",
      componentType: "buttonRowCell",
      accessor: "DELETE",
      alignment: "center",
      __VIEW__: {
        isVisible: false,
      },
      shouldExclude: (initialValue, original) => {
        if (original?.ERROR_FLAG === "Y") {
          return false;
        }
        return true;
      },
      sequence: 13,
      width: 100,
      minWidth: 100,
      maxWidth: 150,
    },
  ],
};

export const selectConfigGridMetaData = {
  form: {
    name: "selectConfigGridMetaData",
    label: "Parameters",
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
  },
  fields: [
    {
      render: {
        componentType: "autocomplete",
      },
      name: "DESCRIPTION",
      label: "SelectConfiguration",
      fullWidth: true,
      placeholder: "SelectConfiguration",
      options: (dependentValue, formState, _, authState) => {
        return GetBankRTGSImportDdwn({
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: authState?.user?.branchCode ?? "",
        });
      },
      _optionsKey: "GetBankRTGSImportDdwn",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ThisFieldisrequired"] }],
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
  ],
};
