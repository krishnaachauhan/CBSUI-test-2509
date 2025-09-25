import { GridMetaDataType } from "@acuteinfo/common-base";
import { isValid } from "date-fns";
export const RetrieveFormConfigMetaData = {
  form: {
    name: "RetrieveFormConfigMetaData",
    label: "",
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
      render: {
        componentType: "datePicker",
      },
      name: "FR_TRAN_DT",
      label: "FromClgDate",
      fullWidth: true,
      format: "dd/MM/yyyy",
      placeholder: "DD/MM/YYYY",
      GridProps: { xs: 12, sm: 1.6, md: 1.6, lg: 1.6, xl: 1.6 },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["FromClgDateRequired"] }],
      },
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TO_TRAN_DT",
      label: "ToClgDate",
      placeholder: "DD/MM/YYYY",
      fullWidth: true,
      format: "dd/MM/yyyy",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ToClgDateRequired"] }],
      },
      validate: (currentField, dependentField) => {
        if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      runValidationOnDependentFieldsChange: true,
      GridProps: { xs: 12, sm: 1.6, md: 1.6, lg: 1.6, xl: 1.6 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "FR_ZONE",
      label: "FromZone",
      defaultValueKey: "getZoneDefaultVal",
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
      skipDefaultOption: true,
      options: "getZoneListData",
      _optionsKey: "getZoneListData",
      disableCaching: true,
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "TO_ZONE",
      label: "ToZone",
      defaultValueKey: "getZoneDefaultVal",
      GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 2 },
      skipDefaultOption: true,
      options: "getZoneListData",
      _optionsKey: "getZoneListData",
      disableCaching: true,
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "FLAG",
      label: "Grouping",
      placeholder: "SelectGrouping",
      defaultValue: "N",
      options: [
        { label: "Normal", value: "N" },
        { label: "Branch Wise", value: "B" },
        { label: "Slip Wise", value: "S" },
      ],
      postValidationSetCrossFieldValues: (field, formState) => {
        if (field?.value) {
          formState.setDataOnFieldChange("FLAG", field?.value);
        }
      },

      GridProps: { xs: 12, sm: 2.5, md: 2.5, lg: 2.5, xl: 2.5 },
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

export const branchClearingDateTransferGridMetaData = {
  gridConfig: {
    dense: true,
    gridLabel: "",
    rowIdColumn: "BANK_CD",
    defaultColumnConfig: {
      width: 400,
      maxWidth: 450,
      minWidth: 300,
    },
    allowColumnReordering: true,
    disableSorting: false,
    hideHeader: true,
    disableGroupBy: true,
    enablePagination: true,
    pageSizes: [15, 25, 50],
    defaultPageSize: 15,
    containerHeight: {
      min: "50vh",
      max: "50vh",
    },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
    isCusrsorFocused: true,
    hiddenFlag: "_hidden",
    // footerNote:"test"
  },
  filters: [],
  columns: [
    {
      accessor: "id",
      columnName: "SrNo",
      sequence: 1,
      alignment: "right",
      componentType: "default",
      width: 90,
      minWidth: 80,
      maxWidth: 100,
      isAutoSequence: true,
    },
    {
      accessor: "BANK_NM",
      columnName: "BranchName",
      sequence: 2,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 160,
      minWidth: 150,
      maxWidth: 250,
    },
    {
      accessor: "AMOUNT",
      columnName: "TotalAmount",
      sequence: 3,
      alignment: "right",
      componentType: "currency",
      placeholder: "",
      isTotalWithCurrency: true,
      footerLabel: "Total Amount:",
      width: 250,
      minWidth: 150,
      maxWidth: 350,
    },
    {
      accessor: "CHECKED",
      columnName: "Yes/No",
      sequence: 4,
      alignment: "center",
      componentType: "editableCheckbox",
      isTotalWithCurrency: true,
      footerLabel: "Selected Amount:",
      setFooterValue(total, rows) {
        const filteredRows = rows?.filter(
          ({ original }) => original.CHECKED === "Y"
        );
        const sum =
          filteredRows?.reduce(
            (acc, { original }) => acc + Number(original.AMOUNT),
            0
          ) ?? 0;
        const formattedSum = sum.toFixed(2);
        return [formattedSum];
      },
      width: 250,
      minWidth: 150,
      maxWidth: 350,
    },
    // {
    //   accessor: "CHECK_BOX",
    //   columnName: "Select",
    //   sequence: 2,
    //   alignment: "left",
    //   dependentOptionField: "VISIBLE_YN",
    //   componentType: "editableCheckbox",
    //   enableColumnSelection: true,
    //   width: 100,
    //   minWidth: 80,
    //   maxWidth: 140,
    //   defaultValue: false,
    //   shouldExclude: (initialValue, original, prevRows, nextRows) => {
    //     if (!Boolean(original?.VISIBLE_YN === false)) {
    //       return false;
    //     }
    //     return true;
    //   },
    // },
    {
      accessor: "ACT_BANK_CD",
      columnName: "Bank",
      sequence: 4,
      alignment: "center",
      componentType: "default",
      placeholder: "",
      width: 100,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "CNT",
      columnName: "Count",
      sequence: 4,
      alignment: "right",
      componentType: "default",
      placeholder: "",
      width: 100,
      minWidth: 100,
      maxWidth: 150,
    },
    // {
    //   accessor: "CHECKED",
    //   columnName: "Yes/No",
    //   sequence: 6,
    //   alignment: "left",
    //   componentType: "editableCheckbox",
    //   // isReadOnly: true,
    //   enableColumnSelection: true,
    //   width: 90,
    //   minWidth: 60,
    //   maxWidth: 120,
    // },
  ],
};
export const clearingDateTransferGridMetaData = {
  gridConfig: {
    dense: true,
    gridLabel: "",
    rowIdColumn: "BANK_CD",
    defaultColumnConfig: {
      width: 400,
      maxWidth: 450,
      minWidth: 300,
    },
    allowColumnReordering: true,
    disableSorting: false,
    hideHeader: true,
    disableGroupBy: true,
    enablePagination: true,
    pageSizes: [15, 25, 50],
    defaultPageSize: 15,
    containerHeight: {
      min: "50vh",
      max: "50vh",
    },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
    isCusrsorFocused: true,
    hiddenFlag: "_hidden",
  },
  filters: [],
  columns: [
    {
      accessor: "id",
      columnName: "SrNo",
      sequence: 1,
      alignment: "right",
      componentType: "default",
      width: 90,
      minWidth: 80,
      maxWidth: 100,
      isAutoSequence: true,
    },
    {
      accessor: "BANK_NM",
      columnName: "BranchName",
      sequence: 2,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 300,
      minWidth: 300,
      maxWidth: 350,
    },
    {
      accessor: "AMOUNT",
      columnName: "TotalAmount",
      sequence: 3,
      alignment: "right",
      componentType: "currency",
      placeholder: "",
      width: 250,
      minWidth: 200,
      maxWidth: 300,
      isTotalWithCurrency: true,
      footerLabel: "Total Amount:",
    },
    {
      accessor: "ACT_BANK_CD",
      columnName: "Bank",
      sequence: 4,
      alignment: "center",
      componentType: "default",
      placeholder: "",
      width: 100,
      minWidth: 100,
      maxWidth: 150,
    },
    {
      accessor: "CNT",
      columnName: "Count",
      sequence: 4,
      alignment: "right",
      componentType: "default",
      placeholder: "",
      width: 100,
      minWidth: 100,
      maxWidth: 150,
    },
  ],
};
export const slipClearingDateTransferGridMetaData = {
  gridConfig: {
    dense: true,
    gridLabel: "",
    rowIdColumn: "TRAN_CD",
    defaultColumnConfig: {
      width: 400,
      maxWidth: 450,
      minWidth: 300,
    },
    allowColumnReordering: true,
    disableSorting: false,
    hideHeader: true,
    disableGroupBy: true,
    enablePagination: true,
    pageSizes: [15, 25, 50],
    defaultPageSize: 15,
    containerHeight: {
      min: "50vh",
      max: "50vh",
    },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
    isCusrsorFocused: true,
    hiddenFlag: "_hidden",
  },
  filters: [],
  columns: [
    {
      accessor: "id",
      columnName: "SrNo",
      sequence: 1,
      alignment: "right",
      componentType: "default",
      width: 90,
      minWidth: 80,
      maxWidth: 100,
      isAutoSequence: true,
    },

    {
      accessor: "SLIP_CD",
      columnName: "SlipNo",
      sequence: 2,
      alignment: "right",
      componentType: "default",
      placeholder: "",
      width: 100,
      minWidth: 80,
      maxWidth: 130,
    },
    {
      accessor: "ACCT_NO",
      columnName: "AccountNo",
      sequence: 3,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 200,
      minWidth: 250,
      maxWidth: 300,
    },

    {
      accessor: "NO_OF_CHEQUES",
      columnName: "NoOfCheques",
      sequence: 4,
      alignment: "right",
      componentType: "default",
      placeholder: "",
      width: 100,
      minWidth: 80,
      maxWidth: 250,
      isTotalWithCurrency: true,
      footerLabel: "Total:",
    },
    {
      accessor: "CNT",
      columnName: "Count",
      sequence: 5,
      alignment: "left",
      componentType: "default",
      placeholder: "",
      width: 100,
      minWidth: 80,
      maxWidth: 150,
      isTotalWithCurrency: true,
      footerLabel: "Selected Total:",
      setFooterValue(total, rows) {
        const filteredRows = rows?.filter(
          ({ original }) => original.CHECKED === "Y"
        );
        const sum =
          filteredRows?.reduce(
            (acc, { original }) => acc + Number(original.CNT),
            0
          ) ?? 0;
        return sum;
      },
    },
    {
      accessor: "AMOUNT",
      columnName: "TotalAmount",
      sequence: 6,
      alignment: "right",
      componentType: "currency",
      placeholder: "",
      width: 250,
      minWidth: 150,
      maxWidth: 350,
      isTotalWithCurrency: true,
      footerLabel: "Total Amount:",
    },

    {
      accessor: "CHECKED",
      columnName: "Yes/No",
      sequence: 7,
      alignment: "center",
      componentType: "editableCheckbox",
      width: 250,
      minWidth: 150,
      maxWidth: 350,
      isTotalWithCurrency: true,
      footerLabel: "Selected Amount:",
      setFooterValue(total, rows) {
        const filteredRows = rows?.filter(
          ({ original }) => original.CHECKED === "Y"
        );
        const sum =
          filteredRows?.reduce(
            (acc, { original }) => acc + Number(original.AMOUNT),
            0
          ) ?? 0;
        const formattedSum = sum.toFixed(2);
        return [formattedSum];
      },
    },
  ],
};
