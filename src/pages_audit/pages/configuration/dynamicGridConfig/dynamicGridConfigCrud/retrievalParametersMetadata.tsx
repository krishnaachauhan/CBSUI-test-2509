import { GridMetaDataType } from "@acuteinfo/common-base";
export const RetrievalParametersGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "Amount Label Mapping",
    rowIdColumn: "SR_CD",
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
    pageSizes: [10, 20, 30],
    defaultPageSize: 10,
    containerHeight: {
      min: "40vh",
      max: "50vh",
    },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
    isCusrsorFocused: true,
    hiddenFlag: "_hidden",
  },
  filters: [
    {
      accessor: "SR_CD",
      columnName: "Sr. No.",
      filterComponentType: "valueFilter",
      gridProps: {
        xs: 12,
        md: 12,
        sm: 12,
      },
    },
  ],
  columns: [
    {
      accessor: "SR_CD",
      columnName: "Sr. No.",
      sequence: 1,
      alignment: "left",
      componentType: "default",
      width: 80,
      minWidth: 80,
      maxWidth: 120,
      isAutoSequence: true,
    },
    {
      accessor: "COLUMN_ACCESSOR",
      columnName: "Column Accessor",
      sequence: 6,
      componentType: "default",
      placeholder: "0.00",
      width: 180,
      minWidth: 150,
      maxWidth: 250,
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["This field is required"] }],
      },
    },
    {
      accessor: "COLUMN_NAME",
      columnName: "Column Name",
      sequence: 6,
      componentType: "editableTextField",
      placeholder: "0.00",
      width: 180,
      minWidth: 150,
      maxWidth: 250,
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["This field is required"] }],
      },
    },
    {
      accessor: "COMPONENT_TYPE",
      columnName: "Column Type",
      sequence: 6,
      componentType: "editableTextField",
      placeholder: "0.00",
      width: 150,
      minWidth: 180,
      maxWidth: 250,
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["This field is required"] }],
      },
    },

    {
      accessor: "WHERE_SEQ_ID",
      columnName: "Where Sequence",
      sequence: 6,
      alignment: "right",
      componentType: "editableNumberFormat",
      placeholder: "0.00",
      width: 130,
      minWidth: 80,
      maxWidth: 150,
      className: "textInputFromRight",
      FormatProps: {
        isAllowed: (values) => {
          if (values?.value?.length > 5) {
            return false;
          }
          if (values.floatValue === 0) {
            return false;
          }
          return true;
        },
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["This field is required"] }],
      },
    },
  ],
};
