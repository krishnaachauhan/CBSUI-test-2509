import { MasterDetailsMetaData } from "@acuteinfo/common-base";
import { t } from "i18next";

export const DynamicReportConfigMetaData: MasterDetailsMetaData = {
  masterForm: {
    form: {
      name: "addDynamicRptConfig",
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
        render: { componentType: "hidden" },
        name: "TRAN_CD",
      },
      {
        render: {
          componentType: "textField",
        },
        name: "TITLE",
        label: "Title",
        placeholder: "EnterTitle",
        type: "text",
        fullWidth: true,
        required: true,
        schemaValidation: {
          type: "string",
          rules: [
            { name: "required", params: ["ThisFieldisrequired"] },
            { name: "TITLE", params: ["PleaseEnterTitle"] },
          ],
        },
        GridProps: {
          xs: 12,
          md: 6,
          sm: 6,
        },
        __VIEW__: {
          GridProps: {
            xs: 12,
            md: 5,
            sm: 5,
          },
        },
        __EDIT__: {
          GridProps: {
            xs: 12,
            md: 5,
            sm: 5,
          },
        },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "DESCRIPTION",
        label: "Description",
        placeholder: "EnterDescription",
        type: "text",
        fullWidth: true,
        required: true,
        schemaValidation: {
          type: "string",
          rules: [
            { name: "required", params: ["ThisFieldisrequired"] },
            { name: "DESCRIPTION", params: ["PleaseEnterDescription"] },
          ],
        },
        GridProps: {
          xs: 12,
          md: 6,
          sm: 6,
        },
        __VIEW__: {
          GridProps: {
            xs: 12,
            md: 5,
            sm: 5,
          },
        },
        __EDIT__: {
          GridProps: {
            xs: 12,
            md: 5,
            sm: 5,
          },
        },
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "ACTIVE",
        label: "Active",
        __VIEW__: { render: { componentType: "checkbox" } },
        __EDIT__: { render: { componentType: "checkbox" } },
        GridProps: {
          xs: 12,
          md: 2,
          sm: 2,
        },
      },
      {
        render: {
          componentType: "checkbox",
        },
        name: "DISABLE_GROUP_BY",
        label: "DisableGroupBy",
        defaultValue: true,
        GridProps: {
          xs: 12,
          md: 3,
          sm: 3,
        },
      },
      {
        render: {
          componentType: "checkbox",
        },
        name: "HIDE_AMOUNT_IN",
        label: "HideAmountIn",
        defaultValue: true,
        GridProps: {
          xs: 12,
          md: 3,
          sm: 3,
        },
      },
      {
        render: {
          componentType: "checkbox",
        },
        name: "HIDE_FOOTER",
        label: "HideFooter",
        defaultValue: true,
        GridProps: {
          xs: 12,
          md: 3,
          sm: 3,
        },
      },
      // {
      //   render: {
      //     componentType: "checkbox",
      //   },
      //   name: "ENABLE_PAGINATION",
      //   label: "Pagination",
      //   defaultValue: false,
      //   GridProps: {
      //     xs: 12,
      //     md: 2,
      //     sm: 3,
      //   },
      // },
      {
        render: {
          componentType: "select",
        },
        name: "RETRIEVAL_TYPE",
        label: "RetrievalType",
        placeholder: "",
        type: "text",
        fullWidth: true,
        defaultValue: "CUSTOM",
        required: true,
        dependentFields: ["ENABLE_PAGINATION"],
        shouldExclude: (_, dependentFieldsValues, __) => {
          const { value } = dependentFieldsValues?.ENABLE_PAGINATION;
          return Boolean(value);
        },
        options: [
          {
            label: "FromAndToDate",
            value: "DATE",
          },
          {
            label: "DateAndServiceList",
            value: "DATESERVICE",
          },
          {
            label: "AsonDateAndServiceList",
            value: "ASONDATESERVICE",
          },
          {
            label: "BalanceReportDateAndService",
            value: "BALANCEREPORT",
          },
          {
            label: "CreditBalanceReportDateAndService",
            value: "CREDITBALANCEREPORT",
          },
          {
            label: "GLAndPLClosingRegisterDateAndService",
            value: "GLPLCLOSINGREGISTER",
          },
          {
            label: "DateAndUserLoginID",
            value: "DATELOGINID",
          },
          {
            label: "DateUserLoginIDRequired",
            value: "DATELOGINIDREQ",
          },
          {
            label: "CustomAsPerQuery",
            value: "CUSTOM",
          },
          {
            label: "DateRangeAndBranchList",
            value: "DATERANGEWITHBRANCH",
          },
          {
            label: "DateRangeAndAccountTypeList",
            value: "DATERANGEWITHACCTTYPE",
          },
          {
            label: "AsonDateAndBranchList",
            value: "ASONDATEWITHBRANCH",
          },
          {
            label: "AsonDateAndAccountTypeList",
            value: "ASONDATEWITHACCTTYPE",
          },
          {
            label: "BranchWise",
            value: "BRANCHWISE",
          },
          {
            label: "AccountTypeWise",
            value: "ACCTTYPEWISE",
          },
          {
            label: "AsonDate",
            value: "ASONDATE",
          },
        ],
        schemaValidation: {
          type: "string",
          rules: [
            { name: "required", params: ["RetrievalTypeRequired"] },
            {
              name: "RETRIEVAL_TYPE",
              params: ["PleaseEnterRetrievalType"],
            },
          ],
        },
        GridProps: {
          xs: 12,
          md: 3,
          sm: 4,
        },
      },
    ],
  },
  detailsGrid: {
    gridConfig: {
      dense: true,
      gridLabel: "Details",
      rowIdColumn: "NEW_SR_CD",
      defaultColumnConfig: { width: 150, maxWidth: 250, minWidth: 100 },
      allowColumnReordering: true,
      hideHeader: true,
      disableGroupBy: true,
      enablePagination: false,
      containerHeight: { min: "50vh", max: "50vh" },
      allowRowSelection: false,
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
        isAutoSequence: true,
        width: 70,
        maxWidth: 120,
        minWidth: 60,
      },
      {
        accessor: "SR_CD",
        columnName: "SrNo",
        componentType: "default",
        isVisible: false,
        sequence: 1,
      },
      {
        accessor: "COLUMN_ACCESSOR",
        columnName: "ColumnAccessor",
        componentType: "default",
        required: true,
        validation: (value, data) => {
          if (!Boolean(value)) {
            return t("ThisFieldisrequired");
          }
          return "";
        },
        sequence: 2,
        width: 160,
        maxWidth: 300,
        minWidth: 120,
      },
      {
        accessor: "COLUMN_NAME",
        columnName: "ColumnName",
        componentType: "editableTextField",
        placeholder: "EnterColumnName",
        required: true,
        validation: (value, data) => {
          if (!Boolean(value)) {
            return t("ThisFieldisrequired");
          }
          return "";
        },
        sequence: 2,
        width: 200,
        maxWidth: 300,
        minWidth: 150,
      },
      {
        accessor: "COLUMN_WIDTH",
        columnName: "ColumnWidth",
        componentType: "editableTextField",
        required: true,
        placeholder: "EnterColumnWidth",
        validation: (value, data) => {
          if (!Boolean(value)) {
            return t("ThisFieldisrequired");
          }
          return "";
        },
        alignment: "right",
        sequence: 2,
        width: 100,
        maxWidth: 180,
        minWidth: 80,
      },
      {
        accessor: "COLUMN_TYPE",
        columnName: "ColumnType",
        componentType: "editableSelect",
        defaultOptionLabel: "EnterColumnType",
        options: [
          { label: "Default", value: "default" },
          { label: "Date", value: "DATE" },
          { label: "DateTime", value: "DATETIME" },
          { label: "Amount", value: "AMOUNT" },
          { label: "Number", value: "NUMBER" },
        ],
        required: true,
        validation: (value, data) => {
          if (!Boolean(value)) {
            return t("ThisFieldisrequired");
          }
          return "";
        },
        sequence: 2,
        width: 170,
        maxWidth: 350,
        minWidth: 150,
      },
      // {
      //   accessor: "COLUMN_FORMAT",
      //   columnName: "Column Format",
      //   componentType: "editableTextField",
      //   sequence: 2,
      //   width: 160,
      //   maxWidth: 300,
      //   minWidth: 120,
      // },
      {
        accessor: "COLUMN_FILTER_TYPE",
        columnName: "ColumnFilterType",
        componentType: "editableSelect",
        defaultOptionLabel: "Enter Filter Type",
        options: [
          { label: "select", value: "SELECT" },
          { label: "slider", value: "SLIDER" },
          { label: "default", value: "DEFAULT" },
        ],
        sequence: 2,
        width: 160,
        maxWidth: 300,
        minWidth: 120,
      },
      {
        accessor: "IS_VISIBLE",
        columnName: "IsVisible",
        componentType: "editableCheckbox",
        sequence: 6,
        alignment: "left",
        defaultValue: true,
        placeholder: "",
        width: 80,
        minWidth: 50,
        maxWidth: 100,
        setValueFUNC: (checked) => {
          if (typeof checked === "boolean") {
            if (checked) {
              return "Y";
            }
            return "N";
          }
          return checked;
        },
      },
      {
        accessor: "IS_DISP_TOTAL",
        columnName: "IsTotalWithoutCurrency",
        componentType: "editableCheckbox",
        sequence: 7,
        alignment: "left",
        defaultValue: false,
        placeholder: "",
        width: 150,
        minWidth: 100,
        maxWidth: 200,
      },
      {
        accessor: "IS_TOTAL_WITH_CURR",
        columnName: "IsTotalWithCurrency",
        componentType: "editableCheckbox",
        dependentFields: ["COLUMN_TYPE"],
        isReadOnly: (_, dependentFieldsValues, formState) => {
          return Boolean(dependentFieldsValues?.COLUMN_TYPE !== "AMOUNT");
        },
        sequence: 7,
        alignment: "left",
        defaultValue: false,
        placeholder: "",
        width: 150,
        minWidth: 100,
        maxWidth: 200,
      },
      {
        accessor: "IS_VISIBLE_CURR_SYMBOL",
        columnName: "IsVisibleCurrencySymbol",
        componentType: "editableCheckbox",
        dependentFields: ["COLUMN_TYPE"],
        isReadOnly: (_, dependentFieldsValues, formState) => {
          return Boolean(dependentFieldsValues?.COLUMN_TYPE !== "AMOUNT");
        },
        sequence: 7,
        alignment: "left",
        defaultValue: false,
        placeholder: "",
        width: 150,
        minWidth: 100,
        maxWidth: 200,
      },
      {
        accessor: "IS_CURRENCY_CODE",
        columnName: "IsCurrencyCode",
        componentType: "editableCheckbox",
        dependentFields: ["COLUMN_TYPE"],
        isReadOnly: (_, dependentFieldsValues, formState) => {
          return Boolean(dependentFieldsValues?.COLUMN_TYPE !== "AMOUNT");
        },
        sequence: 7,
        alignment: "left",
        defaultValue: false,
        placeholder: "",
        width: 150,
        minWidth: 100,
        maxWidth: 200,
      },
      {
        accessor: "CURRENCY_REF_COLUMN",
        columnName: "CurrencyReferenceColumn",
        componentType: "editableTextField",
        placeholder: "EnterCurrencyReferenceColumn",
        maxLength: 10,
        sequence: 8,
        width: 180,
        minWidth: 80,
        maxWidth: 300,
      },
    ],
  },
};
