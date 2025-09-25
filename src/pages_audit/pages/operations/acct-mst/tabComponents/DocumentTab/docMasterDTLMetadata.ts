import { t } from "i18next";
import * as API from "../../api";
import { format, isValid } from "date-fns";
import { getAgGridSRNo, handleDeleteButtonClick } from "@acuteinfo/common-base";

// export const DocMasterDTLMetadata: MasterDetailsMetaData = {
export const DocMasterDTLMetadata: any = {
  masterForm: {
    form: {
      name: "extdocumentmasterform",
      label: "KYCDocumentView",
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
      componentProps: {
        textField: {
          fullWidth: true,
        },
        numberFormat: {
          fullWidth: true,
        },
      },
    },
    fields: [
      {
        render: { componentType: "autocomplete" },
        name: "TEMPLATE_CD",
        label: "Document",
        options: (dependentValue?, formState?, _?, authState?) =>
          API.getCustDocumentOpDtl({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            CUSTOMER_TYPE: "A",
            formState,
          }),
        _optionsKey: "getKYCDocumentTypes",
        placeholder: "SelectDocument",
        disableCaching: true,
        required: true,
        GridProps: { xs: 12, md: 4, sm: 4, lg: 4, xl: 4 },
        fullWidth: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["DocumentIsRequired"] }],
        },
        isFieldFocused: true,
        __EDIT__: {
          dependentFields: ["DOC_TYPE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            if (dependentFields?.DOC_TYPE?.value === "KYC") {
              return true;
            } else {
              return false;
            }
          },
        },
        __VIEW__: { isReadOnly: true },
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "DOC_DESCRIPTION",
        label: "",
        dependentFields: ["TEMPLATE_CD"],
        setValueOnDependentFieldsChange: (dependentFields) => {
          const optionData = dependentFields?.TEMPLATE_CD?.optionData;
          if (Array.isArray(optionData) && optionData.length > 0) {
            return optionData[0]?.DESCRIPTION;
          } else return "";
        },
      },
      {
        render: { componentType: "numberFormat" },
        name: "DOC_WEIGHTAGE",
        type: "text",
        label: "DocumentWeightage",
        autoComplete: "off",
        GridProps: { xs: 12, sm: 4, md: 2.5, lg: 2, xl: 2 },
        FormatProps: {
          allowNegative: false,
          isAllowed: (values) => {
            if (values?.value?.length > 3) {
              return false;
            }
            if (values.floatValue === 0) {
              return false;
            }
            return true;
          },
        },
        __EDIT__: {
          dependentFields: ["DOC_TYPE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            if (dependentFields?.DOC_TYPE?.value === "KYC") {
              return true;
            } else {
              return false;
            }
          },
        },
      },
      {
        render: { componentType: "checkbox" },
        defaultValue: true,
        name: "SUBMIT",
        label: "Submit",
        GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 2 },
        __EDIT__: {
          dependentFields: ["DOC_TYPE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            if (dependentFields?.DOC_TYPE?.value === "KYC") {
              return true;
            } else {
              return false;
            }
          },
        },
      },
      {
        render: { componentType: "textField" },
        name: "DOC_NO",
        label: "DocumentNo",
        placeholder: "EnterDocumentNo",
        maxLength: 50,
        autoComplete: "off",
        txtTransform: "uppercase",
        validate: (columnValue, ...rest) => {
          let regex = /^[^~`!@#$%^&*()\-+_=\\"';:?/<>,.{}[\]|]+$/;
          if (columnValue.value && !regex.test(columnValue.value)) {
            return `${t(`SpecialCharacterNotAllowed`)}`;
          }
          return "";
        },
        __EDIT__: {
          dependentFields: ["DOC_TYPE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            if (dependentFields?.DOC_TYPE?.value === "KYC") {
              return true;
            } else {
              return false;
            }
          },
        },
        GridProps: { xs: 12, sm: 4, md: 3.5, lg: 4, xl: 4 },
      },
      {
        render: { componentType: "checkbox" },
        defaultValue: true,
        name: "ACTIVE",
        label: "Active",
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2, xl: 2 },
        __NEW__: { isReadOnly: true },
        __EDIT__: {
          dependentFields: ["DOC_TYPE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            if (dependentFields?.DOC_TYPE?.value === "KYC") {
              return true;
            } else {
              return false;
            }
          },
        },
      },
      {
        render: { componentType: "datePicker" },
        name: "VALID_UPTO",
        label: "Valid Till Date",
        placeholder: "DD/MM/YYYY",
        autoComplete: "off",
        // validate: (currentField, dependentFields, formState) => {
        //   let currentFieldDate = currentField?.value
        //     ? format(new Date(currentField?.value), "dd/MMM/yyyy")
        //     : "";
        //   let workingDt = formState?.workingDate
        //     ? format(new Date(formState?.workingDate), "dd/MMM/yyyy")
        //     : "";
        //   if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
        //     return "Mustbeavaliddate";
        //   } else if (
        //     Boolean(currentField?.value) &&
        //     currentFieldDate < workingDt
        //   ) {
        //     return `Valid till date can not be less than opening date ${format(
        //       new Date(),
        //       "dd/MM/yyyy"
        //     )}`;
        //   }
        //   return "";
        // },
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 2.5 },
        __EDIT__: {
          dependentFields: ["DOC_TYPE"],
          isReadOnly: (fieldValue, dependentFields, formState) => {
            if (dependentFields?.DOC_TYPE?.value === "KYC") {
              return true;
            } else {
              return false;
            }
          },
        },
      },
      {
        render: {
          componentType: "textField",
        },
        name: "DOC_TYPE",
        label: "Entered From",
        type: "text",
        txtTransform: "uppercase",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2, xl: 2 },
      },
      {
        render: {
          componentType: "datePicker",
        },
        name: "ENTERED_DATE",
        label: "Entered Date",
        placeholder: "DD/MM/YYYY",
        isReadOnly: true,
        GridProps: { xs: 12, sm: 4, md: 3, lg: 2.5, xl: 2.5 },
      },
      {
        render: { componentType: "amountField" },
        name: "DOC_AMOUNT",
        placeholder: "0.00",
        type: "text",
        label: "DocumentAmount",
        autoComplete: "off",
        GridProps: { xs: 12, md: 4, sm: 4, lg: 3, xl: 3 },
      },
      {
        render: { componentType: "textField" },
        name: "DOCUMENT_TYPE",
        label: "DocumentType",
        placeholder: "",
        GridProps: { xs: 12, sm: 6, md: 5, lg: 4, xl: 4 },
        isReadOnly: true,
        dependentFields: ["TEMPLATE_CD"],
        setValueOnDependentFieldsChange: (dependentFields) => {
          const optionData = dependentFields?.TEMPLATE_CD?.optionData;
          if (Array.isArray(optionData) && optionData.length > 0) {
            return optionData[0]?.DOC_TYPE;
          } else return "";
        },
      },
      {
        render: { componentType: "hidden" },
        name: "TRAN_CD",
      },
      {
        render: { componentType: "hidden" },
        name: "SR_CD",
      },
    ],
  },
  detailsGrid: {
    gridConfig: {
      dense: true,
      gridLabel: "Document Files",
      rowIdColumn: "LINE_ID",
      defaultColumnConfig: { width: 150, maxWidth: 250, minWidth: 100 },
      allowColumnReordering: true,
      hideHeader: true,
      disableGroupBy: true,
      // enablePagination: true,
      containerHeight: { min: "40vh", max: "40vh" },
      allowRowSelection: false,
      hiddenFlag: "_hidden",
      disableLoader: true,
    },
    columns: [
      {
        accessor: "LINE_ID",
        columnName: "Sr. No.",
        componentType: "default",
        sequence: 1,
        alignment: "right",
        width: 70,
        maxWidth: 150,
        minWidth: 60,
        isAutoSequence: true,
      },
      {
        accessor: "PAGE_NO",
        columnName: "Page No.",
        componentType: "editableNumberFormat",
        sequence: 1,
        alignment: "right",
        width: 90,
        maxWidth: 150,
        minWidth: 60,
      },
      {
        accessor: "VALID_UPTO",
        columnName: "Valid Upto",
        componentType: "editableDatePicker",
        sequence: 2,
        width: 180,
        maxWidth: 250,
        minWidth: 150,
        required: true,
        validation: (value, data) => {
          if (!Boolean(value)) {
            return t("ThisFieldisrequired");
          }
          return "";
        },
        isReadOnly: true,
        __EDIT__: { isReadOnly: false },
      },
      {
        accessor: "DOC_IMAGE",
        columnName: "File",
        componentType: "default",
        sequence: 3,
        isVisible: false,
      },
      {
        accessor: "IMG_TYPE",
        columnName: "File Type",
        componentType: "default",
        sequence: 4,
        isVisible: false,
      },
      {
        columnName: "",
        componentType: "buttonRowCell",
        accessor: "VIEW_DETAIL",
        sequence: 11,
        buttonLabel: "DocumentUpload",
        width: 150,
        minWidth: 130,
        maxWidth: 200,
        isVisibleInNew: true,
        __EDIT__: { isVisible: true, buttonLabel: "ViewDtl" },
      },
    ],
  },
};
