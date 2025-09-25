import { GridMetaDataType } from "@acuteinfo/common-base";
import * as API from "../../../../api";
import { isValid } from "date-fns";
export const attestation_detail_meta_data = {
  form: {
    name: "attestation_details_form",
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
          sm: 6,
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
      name: "RCV_DOC_TYPE",
      label: "TypeOfDocSubmitted",
      options: () => API.getPMISCData("CKYC_RCVDOCTYPE"),
      _optionsKey: "ckycDocTypes",
      required: true,
      isFieldFocused: true,
      schemaValidation: {
        type: "string",
        rules: [
          { name: "required", params: ["TypesofDocSubmittedIsRequired"] },
        ],
      },
      placeholder: "TypeOfDocSubmitted",
      type: "text",
      // GridProps: {xs:12, sm:4, md: 3, lg: 2.5, xl:1.5},
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      options: [
        { label: "YES", value: "Y" },
        { label: "NO", value: "N" },
      ],
      name: "IPV_FLAG",
      label: "KYCVerificationFlag",
      required: true,
      schemaValidation: {
        type: "string",
        rules: [
          { name: "required", params: ["KYCVerificationFlagIsRequired"] },
        ],
      },
      placeholder: "KYCVerificationFlag",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "select",
      },
      // options: [
      //     {label: "Risk Category 1", value: "riskcat1"},
      //     {label: "Risk Category 2", value: "riskcat2"}
      // ],
      options: () => API.getRiskCateg({ CALLFROM: "ATTESTATION" }),
      _optionsKey: "ckycRiskCategOp",
      name: "RISK_CATEG",
      label: "RiskCategory",
      isReadOnly: true,
      // required: true,
      placeholder: "SelectRiskCategory",
      defaultOptionLabel: "SelectRiskCategory",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "IPV_EMP_CODE",
      label: "KYCVerificationEmpCode",
      options: API.getEmpCodeList,
      _optionsKey: "getEmpCodeList",
      enableVirtualized: true,
      placeholder: "KYCVerificationEmpCode",
      runPostValidationHookAlways: true,
      isReadOnly: (current, dependent, formState) => {
        return !Boolean(
          formState?.state?.tabsApiResctx?.[0]?.ENABLE_IPV_EMP_CODE === "Y"
        );
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        ___,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        return {
          IPV_NAME: {
            value: field?.optionData?.[0]?.DESCRIPTION ?? "",
            isFieldFocused: false,
            ignoreUpdate: false,
          },
          IPV_EMP_DESIG: {
            value: field?.optionData?.[0]?.GROUP_NAME ?? "",
            isFieldFocused: false,
            ignoreUpdate: false,
          },
        };
      },
      validate: (columnValue, dependent, formState) => {
        if (
          Boolean(
            formState?.state?.tabsApiResctx?.[0]?.ENABLE_IPV_EMP_CODE === "Y"
          ) &&
          columnValue?.value === ""
        ) {
          return "KYCVerificationEmpCodeRequired";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "IPV_NAME",
      label: "KYCVerificationEmpName",
      placeholder: "KYCVerificationEmpName",
      isReadOnly: true,
      txtTransform: "uppercase",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "IPV_EMP_DESIG",
      label: "KYCVerificationEmpDesignation",
      placeholder: "KYCVerificationEmpDesignation",
      isReadOnly: true,
      txtTransform: "uppercase",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "IPV_BRANCH",
      label: "KYCVerificationBranch",
      placeholder: "KYCVerificationBranch",
      isReadOnly: true,
      txtTransform: "uppercase",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "IPV_DATE",
      label: "KYCVerificationDate",
      placeholder: "KYCVerificationDate",
      isReadOnly: true,
      format: "dd/MM/yyyy HH:mm:ss",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ORG_CODE",
      label: "OrganizationCode",
      placeholder: "OrganizationCode",
      isReadOnly: true,
      txtTransform: "uppercase",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ORG_NAME",
      label: "OrganizationName",
      placeholder: "OrganizationName",
      isReadOnly: true,
      txtTransform: "uppercase",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PLACE_OF_DECLARE",
      label: "PlaceOfDeclaration",
      placeholder: "PlaceOfDeclaration",
      isReadOnly: true,
      txtTransform: "uppercase",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "DATE_OF_DECLARE",
      label: "DateOfDeclaration",
      isReadOnly: true,
      placeholder: "DateOfDeclaration",
      format: "dd/MM/yyyy HH:mm:ss",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
  ],
};

export const attest_history_meta_data: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "Attestation History",
    rowIdColumn: "SR_CD",
    defaultColumnConfig: {
      width: 150,
      maxWidth: 250,
      minWidth: 100,
    },
    allowColumnReordering: true,
    disableSorting: false,
    hideHeader: false,
    disableGroupBy: true,
    enablePagination: true,
    pageSizes: [10, 20, 30],
    defaultPageSize: 10,
    allowRowSelection: false,
    containerHeight: {
      min: "42vh",
      max: "65vh",
    },
    allowFilter: false,
    allowColumnHiding: false,
  },
  // filters: [],
  columns: [
    {
      accessor: "RCV_DOC_TYPE",
      columnName: "TypeOfDocSubmitted",
      sequence: 1,
      alignment: "left",
      componentType: "default",
      width: 300,
      minWidth: 300,
      maxWidth: 580,
    },
    {
      accessor: "RISK_CATEG",
      columnName: "RiskCategory",
      sequence: 2,
      alignment: "left",
      componentType: "default",
      width: 140,
      minWidth: 140,
      maxWidth: 180,
    },
    {
      // accessor: "IPV_FLAG",
      accessor: "IPV_FLAG_DISP",
      columnName: "KYCVerificationFlag",
      sequence: 3,
      alignment: "left",
      componentType: "default",
      width: 140,
      minWidth: 140,
      maxWidth: 180,
    },
    {
      accessor: "IPV_EMP_CODE",
      columnName: "KYCVerificationEmpCode",
      sequence: 4,
      alignment: "left",
      componentType: "default",
      width: 140,
      minWidth: 140,
      maxWidth: 180,
    },
    {
      accessor: "LAST_ENTERED_BY",
      columnName: "LastEnteredBy",
      sequence: 5,
      alignment: "left",
      componentType: "default",
      width: 180,
      minWidth: 180,
      maxWidth: 250,
    },
    {
      accessor: "IPV_EMP_DESIG",
      columnName: "KYCVerificationEmpDesignation",
      sequence: 6,
      alignment: "left",
      componentType: "default",
      width: 140,
      minWidth: 140,
      maxWidth: 180,
    },
    {
      accessor: "IPV_BRANCH",
      columnName: "BranchName",
      sequence: 7,
      alignment: "left",
      componentType: "default",
      width: 200,
      minWidth: 240,
      maxWidth: 300,
    },
    {
      accessor: "IPV_DATE",
      columnName: "IPVDate",
      sequence: 8,
      alignment: "left",
      componentType: "date",
      dateFormat: "dd/MM/yyyy HH:mm:ss",
      width: 140,
      minWidth: 140,
      maxWidth: 180,
    },
    {
      accessor: "ORG_CODE",
      columnName: "ORGCode",
      sequence: 9,
      alignment: "left",
      componentType: "default",
      width: 140,
      minWidth: 140,
      maxWidth: 180,
    },
    {
      accessor: "ORG_NAME",
      columnName: "ORGName",
      sequence: 10,
      alignment: "left",
      componentType: "default",
      width: 200,
      minWidth: 240,
      maxWidth: 300,
    },
    {
      accessor: "PLACE_OF_DECLARE",
      columnName: "PlaceOfDeclaration",
      sequence: 11,
      alignment: "left",
      componentType: "default",
      width: 200,
      minWidth: 240,
      maxWidth: 300,
    },
    {
      accessor: "DATE_OF_DECLARE",
      columnName: "DateOfDeclaration",
      sequence: 12,
      alignment: "left",
      componentType: "date",
      dateFormat: "dd/MM/yyyy HH:mm:ss",
      width: 140,
      minWidth: 140,
      maxWidth: 180,
    },
    //   {
    //     columnName: "Remarks",
    //     componentType: "buttonRowCell",
    //     accessor: "REMARKS",
    //     sequence: 10,
    //     buttonLabel: "Remarks",
    //     // isVisible: false,
    //     // __EDIT__: { isVisible: true },
    //   },
  ],
};
