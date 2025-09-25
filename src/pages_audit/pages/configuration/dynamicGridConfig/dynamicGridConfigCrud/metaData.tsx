// import { MasterDetailsMetaData } from "components/formcomponent/masterDetails/types";
import { GeneralAPI } from "registry/fns/functions";
import { getProMiscData, getMenulistData, getDynamicOwnerList } from "../api";
export const DynamicGridConfigMetaData = {
  masterForm: {
    form: {
      name: "DynamicGridConfig",
      label: "Dynamic Grid Configure",
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
        render: {
          componentType: "autocomplete",
        },
        name: "DOC_TYPE",
        label: "Menulist Group",
        fullWidth: true,
        options: () => getMenulistData(),
        _optionsKey: "getMenulistData",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
        required: true,
        __EDIT__: { isReadOnly: true },
        schemaValidation: {
          type: "string",
          rules: [
            { name: "required", params: ["Menulist Group is required."] },
            { name: "DOC_TYPE", params: ["Please enter Menulist Group."] },
          ],
        },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "DOC_CD",
        label: "Document Code",
        placeholder: "",
        type: "text",
        fullWidth: true,
        maxLength: 12,
        showMaxLength: false,
        required: true,
        __EDIT__: { isReadOnly: true },
        schemaValidation: {
          type: "string",
          rules: [
            { name: "required", params: ["Document Code is required."] },
            { name: "DOC_CD", params: [12, "Please enter Document Code."] },
          ],
        },
        GridProps: { xs: 6, sm: 2, md: 2, lg: 1.5, xl: 1.5 },
      },
      {
        render: {
          componentType: "autocomplete",
        },
        name: "DOC_ICON",
        label: "Doc Icon",
        placeholder: "",
        type: "text",
        fullWidth: true,
        required: true,
        options: () => getProMiscData("menu_icon"),
        _optionsKey: "getproMiscDataMenuIcon",
        // GridProps: { xs: 12, sm: 3, md: 3, lg: 2.5, xl: 1.5 },
        GridProps: { xs: 6, sm: 2, md: 2, lg: 1.8, xl: 1.5 },
        schemaValidation: {
          type: "string",
          rules: [
            { name: "required", params: ["Doc Icon is required."] },
            { name: "DOC_ICON", params: ["Please enter Doc Icon."] },
          ],
        },
      },

      {
        render: {
          componentType: "textField",
        },
        name: "DESCRIPTION",
        label: "Document Title",
        placeholder: "",
        type: "text",
        maxLength: 40,
        fullWidth: true,
        required: true,
        schemaValidation: {
          type: "string",
          rules: [
            { name: "required", params: ["Description is required."] },
            { name: "DESCRIPTION", params: ["Please enter Description."] },
          ],
        },

        GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 2.5 },
      },
      // {
      //   render: {
      //     componentType: "autocomplete",
      //   },
      //   name: "RETRIEVAL_TYPE",
      //   label: "Retrieval Type",
      //   placeholder: "",
      //   type: "text",
      //   fullWidth: true,
      //   defaultValue: "CUSTOM",
      //   required: true,
      //   options: [
      //     {
      //       label: "From And TO Date",
      //       value: "DATE",
      //     },
      //     {
      //       label: "Date And Customer List",
      //       value: "CUSTOMERLIMIT",
      //     },
      //     {
      //       label: "Date And User Name",
      //       value: "DATEUSERNM",
      //     },
      //     {
      //       label: "Custom As Per Query",
      //       value: "CUSTOM",
      //     },
      //   ],
      //   schemaValidation: {
      //     type: "string",
      //     rules: [
      //       { name: "required", params: ["Retrieval Type is required."] },
      //       {
      //         name: "RETRIEVAL_TYPE",
      //         params: ["Please enter Retrieval Type."],
      //       },
      //     ],
      //   },
      //   GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
      // },
      {
        render: {
          componentType: "autocomplete",
        },
        name: "DML_ACTION",
        label: "DML Action",
        // defaultValue: "M",
        options: [
          { label: "Master", value: "M" },
          { label: "Detail", value: "D" },
          { label: "Master Detail", value: "MD" },
        ],
        _optionKey: "DMLAction",
        GridProps: { xs: 12, sm: 3, md: 3, lg: 2.5, xl: 1.5 },
      },
      {
        render: {
          componentType: "autocomplete",
        },
        name: "OWNER_NM",
        label: "Table owner Name",
        // defaultValue: true,
        options: () => getDynamicOwnerList(),
        _optionsKey: "getDynamicOwnerList",
        __EDIT__: { isReadOnly: true },
        schemaValidation: {
          type: "string",
          rules: [
            { name: "required", params: ["Table owner Name is required."] },
            { name: "OWNER_NM", params: ["Please enter Table owner Name."] },
          ],
        },
        // postValidationSetCrossFieldValues: "getTabelListData",
        GridProps: { xs: 12, sm: 3, md: 3, lg: 2.5, xl: 1.5 },
      },
      {
        render: {
          componentType: "autocomplete",
        },
        name: "MST_TABLE_NM",
        label: "Master Table Name",
        __EDIT__: { isReadOnly: true },
        validate: (currentField, value) => {
          if (currentField?.value) {
            return;
          }
        },
        options: (value) => {
          if (value?.OWNER_NM?.value) {
            return GeneralAPI.getTabelListData(value?.OWNER_NM?.value);
          }
          return [];
        },
        disableCaching: true,
        _optionsKey: "getTabelListData",
        runValidationOnDependentFieldsChange: true,
        dependentFields: ["DML_ACTION", "OWNER_NM"],
        shouldExclude: (val1, dependent) => {
          if (dependent["DML_ACTION"]?.value === "M") {
            return false;
          } else if (dependent["DML_ACTION"]?.value === "MD") {
            return false;
          }
          return true;
        },
        GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 1.5 },
      },
      {
        render: {
          componentType: "autocomplete",
        },
        name: "DET_TABLE_NM",
        label: "Detail Table Name",
        __EDIT__: { isReadOnly: true },
        options: (value) => {
          if (value?.OWNER_NM?.value) {
            return GeneralAPI.getTabelListData(value?.OWNER_NM?.value);
          }
          return [];
        },
        disableCaching: true,
        _optionsKey: "getTabelListData",
        runValidationOnDependentFieldsChange: true,
        dependentFields: ["DML_ACTION", "OWNER_NM", "MST_TABLE_NM"],
        validate: (currentField, dependentFields) => {
          if (dependentFields?.MST_TABLE_NM?.value === currentField?.value) {
            return "Table Name are not the same";
          } else {
            return "";
          }
        },
        shouldExclude: (val1, dependent) => {
          if (dependent["DML_ACTION"]?.value === "D") {
            return false;
          } else if (dependent["DML_ACTION"]?.value === "MD") {
            return false;
          }
          return true;
        },
        GridProps: { xs: 12, sm: 3, md: 3, lg: 3, xl: 1.5 },
      },

      {
        render: {
          componentType: "autocomplete",
        },
        name: "SEQ_PARA",
        label: "Seq. Parameter",
        // defaultValue: true,
        // defaultValue: "M",
        __EDIT__: { isReadOnly: true },
        options: [
          { label: "0", value: "0" },
          { label: "1", value: "1" },
          { label: "2", value: "2" },
        ],
        _optionKey: "SeqParameter",
        schemaValidation: {
          type: "string",
          rules: [
            { name: "required", params: ["Seq. Parameter is required."] },
            { name: "SEQ_PARA", params: ["Please enter Seq. Parameter."] },
          ],
        },
        GridProps: { xs: 12, sm: 3, md: 3, lg: 1.2, xl: 1.5 },
      },

      {
        render: {
          componentType: "textField",
        },
        name: "SEQ_NM",
        label: "Seq. Name",
        __EDIT__: { isReadOnly: true },
        runValidationOnDependentFieldsChange: true,
        dependentFields: ["SEQ_PARA"],
        shouldExclude: (val1, dependent) => {
          if (dependent["SEQ_PARA"]?.value === "0") {
            return false;
          }
          return true;
        },
        GridProps: { xs: 12, sm: 3, md: 3, lg: 2, xl: 1.2 },
        maxLength: 40,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["Seq. Name is required."] }],
        },
      },
      {
        render: {
          componentType: "autocomplete",
        },
        name: "USER_ACC_INS",
        label: "Add For User",
        type: "text",
        required: true,
        // defaultValue: true,
        GridProps: { xs: 12, sm: 3, md: 3, lg: 1.2, xl: 1.5 },
        maxLength: 5,
        options: [
          { label: "1", value: "1" },
          { label: "2", value: "2" },
          { label: "3", value: "3" },
          { label: "4", value: "4" },
          { label: "5", value: "5" },
          { label: "-2", value: "-2" },
        ],
        _optionsKey: "GetUserLevel",
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["Add For User is required."] }],
        },
      },
      {
        render: {
          componentType: "autocomplete",
        },
        name: "USER_ACC_UPD",
        label: "View-Detail for User",
        // defaultValue: true,
        GridProps: { xs: 12, sm: 3, md: 3, lg: 1.2, xl: 1.5 },
        maxLength: 5,
        options: [
          { label: "1", value: "1" },
          { label: "2", value: "2" },
          { label: "3", value: "3" },
          { label: "4", value: "4" },
          { label: "5", value: "5" },
          { label: "-2", value: "-2" },
        ],
        _optionsKey: "GetUserLevel",
        schemaValidation: {
          type: "string",
          rules: [
            { name: "required", params: ["View-Detail for User is required."] },
          ],
        },
      },
      {
        render: {
          componentType: "autocomplete",
        },
        name: "USER_ACC_DEL",
        label: "Delete for User",
        // defaultValue: true,
        options: [
          { label: "1", value: "1" },
          { label: "2", value: "2" },
          { label: "3", value: "3" },
          { label: "4", value: "4" },
          { label: "5", value: "5" },
          { label: "-2", value: "-2" },
        ],
        _optionsKey: "GetUserLevel",
        GridProps: { xs: 12, sm: 3, md: 3, lg: 1.2, xl: 1.5 },
        maxLength: 5,
        schemaValidation: {
          type: "string",
          rules: [
            { name: "required", params: ["Delete for User is required."] },
          ],
        },
      },

      {
        render: {
          componentType: "textField",
        },
        name: "DEFAULT_PAGE_SIZE",
        label: "Default PageSize",
        // defaultValue: true,
        GridProps: { xs: 12, sm: 3, md: 3, lg: 1.5, xl: 1.5 },
        maxLength: 5,
        schemaValidation: {
          type: "string",
          rules: [
            { name: "required", params: ["Default PageSize is required."] },
          ],
        },
      },
      {
        render: {
          // componentType: "autocomplete",
          componentType: "select",
        },
        name: "PAGE_SIZES",
        label: "Page Sizes",
        placeholder: "",
        options: () => getProMiscData("pageSizes"),
        _optionsKey: "getproMiscDataPageSize",
        defaultValue: "",
        type: "text",
        multiple: true,
        showCheckbox: true,
        skipDefaultOption: true,
        fullWidth: true,
        schemaValidation: {
          type: "string",
        },
        GridProps: { xs: 12, sm: 3, md: 3, lg: 2.2, xl: 1.5 },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "ROWID_COLUMN",
        label: "RowId Column",
        required: true,
        __EDIT__: { isReadOnly: true },
        GridProps: { xs: 12, sm: 3, md: 3, lg: 2, xl: 1.5 },
        maxLength: 40,
        validate: (currentField, value) => {
          if (currentField?.value) {
            return;
          }
        },
      },
      {
        render: {
          componentType: "checkbox",
        },
        name: "DENSE",
        label: "Dense",
        defaultValue: true,
        GridProps: { xs: 12, sm: 3, md: 3, lg: 1.2, xl: 1.5 },
      },
      {
        render: {
          componentType: "checkbox",
        },
        name: "DISABLE_GROUP_BY",
        label: "Disable Group By",
        defaultValue: true,
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 1.5 },
      },
      {
        render: {
          componentType: "checkbox",
        },
        name: "ALLOW_ROW_SELECTION",
        label: "Allow RowSelection",
        defaultValue: true,
        GridProps: { xs: 12, sm: 3, md: 3, lg: 2.5, xl: 1.5 },
      },
      // {
      //   render: {
      //     componentType: "checkbox",
      //   },
      //   name: "GRID_LABEL",
      //   label: "Grid Label",
      //   defaultValue: true,
      //   GridProps: {
      //     xs: 12,
      //     md: 3,
      //     sm: 3,
      //   },
      // },

      {
        render: {
          componentType: "checkbox",
        },
        name: "ALLOW_COLUMN_REORDERING",
        label: "Allow Column Reordering",
        defaultValue: true,
        GridProps: { xs: 12, sm: 4, md: 4, lg: 3, xl: 1.5 },
      },
      {
        render: {
          componentType: "checkbox",
        },
        name: "ENABLE_PAGINATION",
        label: "Enable Pagination",
        defaultValue: true,
        GridProps: { xs: 12, sm: 3, md: 3, lg: 2.5, xl: 1.5 },
      },

      {
        render: {
          componentType: "checkbox",
        },
        name: "IS_CUSRSORFOCUSED",
        label: "Is Cusrsor Focused",
        defaultValue: true,
        GridProps: { xs: 12, sm: 3, md: 3, lg: 2.5, xl: 1.5 },
      },
    ],
  },
  detailsGrid: {
    gridConfig: {
      dense: true,
      gridLabel: "Details",
      rowIdColumn: "SR_CD",
      defaultColumnConfig: { width: 150, maxWidth: 250, minWidth: 100 },
      allowColumnReordering: false,
      hideHeader: true,
      disableGroupBy: true,
      enablePagination: false,
      containerHeight: { min: "30vh", max: "40vh" },
      allowRowSelection: false,
      hiddenFlag: "_hidden",
      disableLoader: true,
      onlySingleSelectionAllow: true,
    },
    columns: [
      {
        accessor: "SR_CD",
        columnName: "Serial No.",
        componentType: "default",
        sequence: 1,
        alignment: "right",
        width: 86,
        maxWidth: 120,
        minWidth: 70,
      },

      {
        accessor: "COLUMN_ACCESSOR",
        columnName: "Column Accessor",
        componentType: "default",
        required: true,
        validation: (value, data) => {
          if (!Boolean(value)) {
            return "This field is required.";
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
        columnName: "Column Name",
        componentType: "editableTextField",
        required: true,
        validation: (value, data) => {
          if (!Boolean(value)) {
            return "This field is required.";
          }
          return "";
        },
        sequence: 3,
        width: 200,
        maxWidth: 300,
        minWidth: 150,
      },
      {
        accessor: "COMPONENT_TYPE",
        columnName: "Component Type",
        componentType: "editableSelect",
        // componentType: "editableAutocomplete",
        options: () => getProMiscData("Component_Type"),
        _optionsKey: "getproMiscDataComponent",
        enableDefaultOption: true,
        required: true,
        validation: (value, data) => {
          if (!Boolean(value)) {
            return "This field is required.";
          }
          return "";
        },
        sequence: 4,
        width: 200,
        maxWidth: 350,
        minWidth: 180,
      },
      {
        accessor: "SEQ_NO",
        columnName: "Column Sequence",
        componentType: "editableNumberFormat",
        required: true,
        validation: (value, data) => {
          if (!Boolean(value)) {
            return "This field is required.";
          }
          return "";
        },
        alignment: "left",
        sequence: 5,
        width: 140,
        maxWidth: 180,
        minWidth: 150,
      },

      {
        accessor: "COLUMN_WIDTH",
        columnName: "Column Width",
        componentType: "editableTextField",
        required: true,
        validation: (value, data) => {
          if (!Boolean(value)) {
            return "This field is required.";
          }
          return "";
        },
        alignment: "right",
        sequence: 6,
        width: 120,
        maxWidth: 180,
        minWidth: 80,
      },

      {
        accessor: "ALIGNMENT",
        columnName: "Column Alignment",
        componentType: "editableSelect",
        options: () => getProMiscData("alignment"),
        _optionsKey: "getproMiscDataalignment",
        sequence: 7,
        width: 160,
        maxWidth: 300,
        minWidth: 120,
      },

      {
        accessor: "IS_VISIBLE",
        columnName: "Is Visible",
        componentType: "editableCheckbox",
        sequence: 8,
        alignment: "left",
        defaultValue: true,
        placeholder: "",
        width: 90,
        minWidth: 50,
        maxWidth: 100,
      },
    ],
  },
};
