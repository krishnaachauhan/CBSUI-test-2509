import {
  getInfavourOfData,
  getRegionDDData,
  getRetrievalType,
  getSignatureDdnData,
} from "../api";

export const revalidateDDform = {
  form: {
    name: "new dd form",
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
        componentType: "autocomplete",
      },
      name: "DEF_TRAN_CD",
      label: "billType",
      placeholder: "Select Bill Type",
      fullWidth: true,
      options: (dependentValue, formState, _, authState) => {
        return getRetrievalType({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
          CODE: "DD",
        });
      },
      _optionsKey: "getCommonTypeList",
      GridProps: { xs: 6, sm: 6, md: 4, lg: 4, xl: 4 },
      dependentFields: ["PENDING_FLAG"],
    },

    {
      render: { componentType: "autocomplete" },
      name: "INFAVOUR_OF",
      label: "inFavourOf",
      options: getInfavourOfData,
      _optionsKey: "getInfavourOfData",
      GridProps: { xs: 6, sm: 6, md: 4, lg: 4, xl: 4 },
      fullWidth: true,
    },
    {
      render: {
        componentType: "textField",
      },
      name: "INSTRUCTION_REMARKS",
      label: "instRemarks",
      placeholder: "instRemarks",
      type: "text",
      GridProps: { xs: 6, sm: 6, md: 4, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PAYSLIP_NO",
      label: "payslipNumber",
      GridProps: { xs: 6, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "AMOUNT",
      label: "amount",
      GridProps: { xs: 6, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: { componentType: "textField" },
      name: "REGION_NM",
      placeholder: "region",
      label: "region",
      type: "text",
      GridProps: { xs: 6, sm: 6, md: 4, lg: 2, xl: 2 },
      fullWidth: true,
    },
    {
      render: { componentType: "hidden" },
      name: "REGION",
      placeholder: "region",
      label: "region",
      disableCaching: true,
      dependentFields: ["DEF_TRAN_CD", "FORM_MODE"],
      options: (...arg) => {
        if (
          arg?.[3]?.user?.branchCode &&
          arg?.[3]?.companyID &&
          arg?.[2]?.["PAYSLIP_DRAFT_DTL.DEF_TRAN_CD"]?.optionData[0]?.TYPE_CD
        ) {
          return getRegionDDData({
            BRANCH_CD: arg?.[3]?.user?.branchCode,
            COMP_CD: arg?.[3]?.companyID,
            COMM_TYPE_CD:
              arg?.[2]?.["PAYSLIP_DRAFT_DTL.DEF_TRAN_CD"]?.optionData[0]
                ?.TYPE_CD,
            FLAG: "R",
          });
        }
        return [];
      },
      _optionsKey: "getRegionDDData",
      type: "text",
      GridProps: { xs: 6, sm: 6, md: 4, lg: 2, xl: 2 },
      fullWidth: true,
      shouldExclude: (val1, dependentFields) => {
        if (dependentFields?.FORM_MODE?.value !== "view") {
          return false;
        }
        return true;
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "COMMISSION",
      label: "Commision",
      GridProps: { xs: 6, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "OTHER_COMISSION",
      label: "otherComm",
      GridProps: { xs: 6, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SERVICE_CHARGE",
      label: "GST",
      GridProps: { xs: 6, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "COL_BANK_CD",
      label: "bankCode",
      GridProps: { xs: 6, sm: 6, md: 4, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BANK_NM",
      label: "bankName",
      GridProps: { xs: 6, sm: 6, md: 4, lg: 4, xl: 4 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SIGNATURE1_NM",
      label: "signature1",
      GridProps: { xs: 6, sm: 6, md: 4, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "SIGNATURE1_CD",
      label: "signature1",
      placeholder: "signature1",
      runValidationOnDependentFieldsChange: true,
      dependentFields: ["DEF_TRAN_CD", "FORM_MODE"],
      disableCaching: true,
      options: (...arg) => {
        if (
          arg?.[3]?.user?.branchCode &&
          arg?.[3]?.companyID &&
          arg?.[2]?.["PAYSLIP_DRAFT_DTL.DEF_TRAN_CD"]?.optionData[0]?.TYPE_CD
        ) {
          return getSignatureDdnData({
            BRANCH_CD: arg?.[3]?.user?.branchCode,
            COMP_CD: arg?.[3]?.companyID,
            COMM_TYPE_CD:
              arg?.[2]?.["PAYSLIP_DRAFT_DTL.DEF_TRAN_CD"]?.optionData[0]
                ?.TYPE_CD,
          });
        }
        return [];
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["Signature 1 is required"] }],
      },
      _optionsKey: "getPayslipSignatureList1",
      shouldExclude: (val1, dependentFields) => {
        if (dependentFields?.FORM_MODE?.value !== "view") {
          return false;
        }
        return true;
      },
      GridProps: { xs: 6, sm: 6, md: 4, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SIGNATURE2_NM",
      label: "signature2",
      GridProps: { xs: 6, sm: 6, md: 4, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "SIGNATURE2_CD",
      label: "signature1",
      placeholder: "signature1",
      runValidationOnDependentFieldsChange: true,
      dependentFields: ["DEF_TRAN_CD", "FORM_MODE"],
      disableCaching: true,
      options: (...arg) => {
        if (
          arg?.[3]?.user?.branchCode &&
          arg?.[3]?.companyID &&
          arg?.[2]?.["PAYSLIP_DRAFT_DTL.DEF_TRAN_CD"]?.optionData[0]?.TYPE_CD
        ) {
          return getSignatureDdnData({
            BRANCH_CD: arg?.[3]?.user?.branchCode,
            COMP_CD: arg?.[3]?.companyID,
            COMM_TYPE_CD:
              arg?.[2]?.["PAYSLIP_DRAFT_DTL.DEF_TRAN_CD"]?.optionData[0]
                ?.TYPE_CD,
          });
        }
        return [];
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["Signature 1 is required"] }],
      },
      _optionsKey: "getPayslipSignatureList1",
      shouldExclude: (val1, dependentFields) => {
        if (dependentFields?.FORM_MODE?.value !== "view") {
          return false;
        }
        return true;
      },
      GridProps: { xs: 6, sm: 6, md: 4, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "PAYMENT_AMOUNT",
      label: "PaymentAmount",
      placeholder: "",
      type: "text",
      dependentFields: ["AMOUNT"],
      textFieldStyle: {
        "& .MuiInputBase-root": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
        },
        "& .MuiInputBase-input": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
          "&.Mui-disabled": {
            color: "var(--theme-color2) !important",
            "-webkit-text-fill-color": "var(--theme-color2) !important",
          },
        },
      },

      GridProps: { xs: 6, sm: 2, md: 2.2, lg: 2, xl: 1.5 },
      setValueOnDependentFieldsChange: (dependentFields) => {
        return dependentFields?.AMOUNT?.value;
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "SPACER1",
      GridProps: { xs: 6, sm: 6, md: 4, lg: 8, xl: 8 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TOTAL_AMOUNT",
      label: "TotalAmount",
      placeholder: "",
      type: "text",
      dependentFields: ["AMOUNT"],
      textFieldStyle: {
        "& .MuiInputBase-root": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
        },
        "& .MuiInputBase-input": {
          background: "var(--theme-color5)",
          color: "var(--theme-color2) !important",
          "&.Mui-disabled": {
            color: "var(--theme-color2) !important",
            "-webkit-text-fill-color": "var(--theme-color2) !important",
          },
        },
      },

      GridProps: { xs: 6, sm: 2, md: 2.2, lg: 2, xl: 1.5 },
      setValueOnDependentFieldsChange: (dependentFields) => {
        return dependentFields?.AMOUNT?.value;
      },
    },
  ],
};
