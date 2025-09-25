import { MasterDetailsMetaData } from "@acuteinfo/common-base";

export const commonMSTGridMetaData: MasterDetailsMetaData = {
  masterForm: {
    form: {
      name: "LangMsgConfig",
      label: "common Master Configuration",
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
            spacing: 0,
          },
        },
      },
    },
    fields: [],
  },
  detailsGrid: {
    gridConfig: {
      dense: true,
      gridLabel: "Misc Master Configuration",
      rowIdColumn: "DATA_VALUE",
      searchPlaceholder: "Accounts",
      defaultColumnConfig: {
        width: 150,
        maxWidth: 250,
        minWidth: 100,
      },
      allowColumnReordering: true,
      disableSorting: false,
      hideHeader: true,
      disableGroupBy: true,
      hiddenFlag: "_hidden",
      enablePagination: false,
      pageSizes: [10, 20, 30],
      defaultPageSize: 10,
      containerHeight: {
        min: "62vh",
        max: "62vh",
      },
      allowFilter: false,
      allowColumnHiding: false,
      allowRowSelection: false,
    },
    // filters: [],
    columns: [
      {
        columnName: "Data Value",
        accessor: "DATA_VALUE",
        sequence: 5,
        alignment: "left",
        componentType: "editableTextField",
        // isReadOnly: false,
        width: 400,
        minWidth: 320,
        maxWidth: 540,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["This field is required"] }],
        },
      },
      {
        columnName: "Display Value",
        accessor: "DISPLAY_VALUE",
        sequence: 6,
        alignment: "left",
        componentType: "editableTextField",
        width: 400,
        minWidth: 320,
        maxWidth: 540,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["This field is required"] }],
        },
      },
      {
        columnName: "Remarks",
        accessor: "REMARKS",
        sequence: 7,
        alignment: "left",
        componentType: "editableTextField",
        width: 190,
        minWidth: 150,
        maxWidth: 360,
      },
      {
        columnName: "Action",
        componentType: "deleteRowCell",
        accessor: "_hidden",
        sequence: 9,
        width: 90,
        maxWidth: 120,
        minWidth: 90,
      },
    ],
  },
};

export const addCategoryFormMetadata = {
  form: {
    name: "enterRetrievalParamaters",
    label: "Add New Category",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
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
      render: { componentType: "textField" },
      name: "CATEGORY_CD",
      label: "Category Name",
      placeholder: " ",
      type: "text",
      required: true,
      // isReadOnly: true,
      maxLength: 300,
      showMaxLength: false,
      GridProps: { xs: 12, md: 12, sm: 12, lg: 12 },
      fullWidth: true,
      autoComplete: "off",
      // schemaValidation: {
      //   type: "string",
      //   rules: [
      //     { name: "required", params: ["This field is required"] },
      //     { name: "TEMPLATE_DESC", params: ["Please select Description."] },
      //   ],
      // },
      // __NEW__: { isReadOnly: false },
      // __EDIT__: { isReadOnly: true },
    },
  ],
};
