import { utilFunction } from "@acuteinfo/common-base";

export const VehicleDetailsMetadata = {
  form: {
    name: "VehicleDetailsMetadata",
    label: "Vehicle Detail",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "sequence",
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
      Divider: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "hidden",
      },
      defaultValue: "V   ",
      name: "J_TYPE",
    },
    {
      render: {
        componentType: "hidden",
      },
      defaultValue: "1",
      name: "SR_CD",
    },
    {
      render: {
        componentType: "hidden",
      },
      defaultValue: "N",
      name: "ACTIVE",
    },
    {
      render: {
        componentType: "hidden",
      },
      defaultValue: "1",
      name: "LINE_ID",
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CITY_SURVEY_NO",
      label: "VehicleNo",
      placeholder: "EnterVehicleNo",
      type: "text",
      maxLength: 100,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "FINAL_PLOT_NO",
      label: "EngineNo",
      placeholder: "EnterEngineNo",
      type: "text",
      maxLength: 100,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TP_SKIM_NO",
      label: "ChasisNo",
      placeholder: "EnterChasisNo",
      type: "text",
      maxLength: 100,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SUB_PLOT_NO",
      label: "ModelName",
      placeholder: "EnterModelName",
      type: "text",
      maxLength: 100,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REVENUE_SURVEY_NO",
      label: "OwnerName1",
      placeholder: "EnterOwnerName1",
      type: "text",
      maxLength: 100,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SQUARE_FOOT",
      label: "OwnerName2",
      placeholder: "EnterOwnerName2",
      type: "text",
      maxLength: 100,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "BUILDING_SQUARE_FOOT",
      label: "RCTCBook",
      placeholder: "EnterRCTCBook",
      type: "text",
      maxLength: 100,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PLOT_SQUARE_FOOT",
      label: "CertiRegistration",
      placeholder: "EnterCertiRegistration",
      type: "text",
      maxLength: 100,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "UN_SPREAD_AREA_SQRFT",
      label: "BillNo",
      placeholder: "EnterBillNo",
      type: "text",
      maxLength: 100,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "RECEIPT_NO",
      label: "ReceiptNo",
      placeholder: "EnterReceiptNo",
      type: "text",
      maxLength: 20,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 3.5, lg: 2.5, xl: 2.5 },
    },
    {
      render: {
        componentType: "select",
      },
      name: "SEIZE",
      label: "Seize",
      options: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
      defaultValue: "N",
      defaultOptionLabel: "SelectSeize",
      GridProps: { xs: 12, sm: 6, md: 2.5, lg: 1.5, xl: 1.5 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "PERMIT_NO",
      label: "PermitNo",
      placeholder: "EnterPermitNo",
      type: "text",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 3, lg: 2, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "MFG_DATE",
      label: "MfgDate",
      placeholder: "DD/MM/YYYY",
      type: "text",
      validate: (value) => {
        if (
          Boolean(value?.value) &&
          !utilFunction.isValidDate(utilFunction.getParsedDate(value?.value))
        ) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "PERMIT_START_DT",
      label: "PermitStartDate",
      placeholder: "DD/MM/YYYY",
      validate: (value) => {
        if (
          Boolean(value?.value) &&
          !utilFunction.isValidDate(utilFunction.getParsedDate(value?.value))
        ) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "PERMIT_EXPIRY_DT",
      label: "PermitExpiryDate",
      placeholder: "DD/MM/YYYY",
      validate: (value) => {
        if (
          Boolean(value?.value) &&
          !utilFunction.isValidDate(utilFunction.getParsedDate(value?.value))
        ) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "PURCHASE_AMT",
      label: "PurchaseAmount",
      type: "text",
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          if (values?.value?.length > 15) {
            return false;
          }
          return true;
        },
      },
      GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "HORSE_POWER",
      label: "HorsePower",
      placeholder: "EnterHorsePower",
      type: "text",
      maxLength: 100,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 4.5, xl: 4.5 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "ELIGIBLE_AMT",
      label: "EligibleAmount",
      type: "text",
      FormatProps: {
        allowNegative: false,
        isAllowed: (values) => {
          if (values?.value?.length > 15) {
            return false;
          }
          return true;
        },
      },
      GridProps: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CUBIC_CAPACIY",
      label: "CubicCapacity",
      placeholder: "EnterCubicCapacity",
      type: "text",
      maxLength: 100,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 4.5, xl: 4.5 },
    },
  ],
};
