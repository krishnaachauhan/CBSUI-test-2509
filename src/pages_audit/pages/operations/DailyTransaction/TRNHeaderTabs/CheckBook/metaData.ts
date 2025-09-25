import { GeneralAPI } from "registry/fns/functions";
export const JointDetailIssueEntry = {
  form: {
    name: "chequeBookForm",
    label: "Cheque Book Issue",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",

    render: {
      ordering: "sequence",
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
    // {
    //   render: {
    //     componentType: "_accountNumber",
    //   },
    //   name: "dfk",
    // },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "BRANCH_CD",
      label: "Branch",
      placeholder: "Branch Code",
      type: "text",
      required: true,
      // maxLength: 16,
      options: GeneralAPI.getBranchCodeList,
      _optionsKey: "getBranchCodeList",
      GridProps: {
        xs: 12,
        md: 3,
        sm: 3,
        lg: 3,
        xl: 3,
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["Branch Code is required."] }],
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "ACCT_TYPE",
      label: "AccountType",
      placeholder: "EnterAccountType",
      type: "text",
      required: true,
      options: GeneralAPI.get_Account_Type,
      _optionsKey: "get_Account_Type",
      GridProps: {
        xs: 12,
        md: 3,
        sm: 3,
        lg: 3,
        xl: 3,
      },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["Account Type is required."] }],
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_CD",
      label: "ACNo",
      placeholder: "EnterAcNo",
      type: "text",
      fullWidth: true,
      required: true,
      maxLength: 20,
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 3,
        xl: 3,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "NO_OF_CHEQUE",
      label: "No of Cheq(s)",
      placeholder: "Enter no of Cheque book",
      type: "text",
      // options: () => {
      //   return [
      //     { value: "15", label: "15" },
      //     { value: "45", label: "45" },
      //     { value: "90", label: "90" },
      //   ];
      // },
      options: GeneralAPI.getChequeLeavesList,
      _optionsKey: "getChequeLeavesList",
      GridProps: {
        xs: 12,
        md: 3,
        sm: 3,
        lg: 3,
        xl: 3,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "FROM_CHEQUE_NO",
      label: "From Cheque No.",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 2.5,
        sm: 2.5,
        lg: 2.5,
        xl: 2.5,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TO_CHEQUE_NO",
      label: "To Cheque No.",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 2.5,
        sm: 2.5,
        lg: 2.5,
        xl: 2.5,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "SERVICE_CHARGE",
      label: "Service Charge",
      placeholder: "",
      type: "text",
      required: true,
      GridProps: {
        xs: 12,
        md: 2,
        sm: 2,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "GST",
      label: "GST",
      placeholder: "",
      type: "text",
      required: true,
      GridProps: {
        xs: 12,
        md: 2.5,
        sm: 2.5,
        lg: 2.5,
        xl: 2.5,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "REQUISITION_DT",
      // sequence: 9,
      label: "Requisition Date",
      placeholder: "",
      // options: () => {
      //   return GeneralAPI.GetMiscValue("USER_SUB_TYPE");
      // },
      // enableDefaultOption: true,
      // _optionsKey: "GetSubTypeMiscValue",
      GridProps: {
        xs: 12,
        md: 2.5,
        sm: 2.5,
        lg: 2.5,
        xl: 2.5,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      // sequence: 1,
      label: "Name",
      type: "text",
      // required: true,
      // maxLength: 16,
      isReadOnly: true,
      GridProps: {
        xs: 12,
        md: 3,
        sm: 3,
        lg: 3,
        xl: 3,
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "REMARKS",
      // sequence: 10,
      label: "Remark",
      placeholder: "Enter remark.",
      // options: () => {
      //   return GeneralAPI.GetUsersNotificationTemplateList();
      // },
      // enableDefaultOption: true,
      // _optionsKey: "GetUsersNotificationTemplateList",
      GridProps: {
        xs: 12,
        md: 3,
        sm: 3,
        lg: 3,
        xl: 3,
      },
    },

    {
      render: {
        componentType: "autocomplete",
      },
      name: "CHARACTERISTICS",
      // sequence: 4,
      label: "Characteristics",
      placeholder: "",
      type: "text",
      required: true,
      options: () => {
        return [
          { value: "Bearer", label: "Bearer" },
          { value: "Order", label: "Order" },
        ];
      },
      _optionsKey: "CHARACTERISTICS",
      GridProps: {
        xs: 12,
        md: 1.5,
        sm: 1.5,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "PAYABLE_AT_PAR",
      label: "Payable At PAR",
      options: () => {
        return [
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
        ];
      },
      _optionsKey: "PAYABLE_AT_PAR",
      type: "text",
      required: true,
      GridProps: {
        xs: 12,
        md: 1.5,
        sm: 1.5,
        lg: 2,
        xl: 2,
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CHEQUE_TOTAL",
      label: "No of Cheque Book(s)",
      placeholder: "Enter no of Cheque book",
      type: "text",
      required: true,
      // defaultValue: "2",
      // enableDefaultOption: true,
      GridProps: {
        xs: 12,
        md: 3,
        sm: 2,
        lg: 2,
        xl: 2,
      },
    },
    // {
    //   render: {
    //     componentType: "textField",
    //   },
    //   name: "ACCT_MODE",
    //   // sequence: 7,
    //   label: "ModeOfOperation",
    //   placeholder: "",
    //   type: "text",
    //   // required: true,
    //   // maxLength: 100,
    //   isReadOnly: true,
    //   GridProps: {
    //     xs: 12,
    //     md: 2,
    //     sm: 2,
    //   },
    // },
    // {
    //   render: {
    //     componentType: "textField",
    //   },
    //   name: "CONTACT",
    //   // sequence: 3,
    //   label: "Contact Details",
    //   // placeholder: "Enter no of Cheque book",
    //   type: "text",
    //   // required: true,
    //   // maxLength: 32,
    //   // schemaValidation: {
    //   //   type: "string",
    //   //   rules: [{ name: "required", params: ["User Name is required."] }],
    //   // },
    //   isReadOnly: true,
    //   GridProps: {
    //     xs: 12,
    //     md: 4,
    //     sm: 4,
    //   },
    // },
    // {
    //   render: {
    //     componentType: "textField",
    //   },
    //   name: "WITHDRAW_BAL",
    //   // sequence: 5,
    //   label: "Withdrawalable Balance",
    //   placeholder: "",
    //   type: "text",
    //   // required: true,
    //   // options: () => {
    //   //   return GeneralAPI.GetSecurityGroupingList();
    //   // },
    //   // enableDefaultOption: true,
    //   // _optionsKey: "GetSecurityGroupingList",
    //   // schemaValidation: {
    //   //   type: "string",
    //   //   rules: [{ name: "required", params: ["Group Name is required."] }],
    //   // },
    //   isReadOnly: true,
    //   GridProps: {
    //     xs: 12,
    //     md: 2,
    //     sm: 2,
    //   },
    // },

    // {
    //   render: {
    //     componentType: "textField",
    //   },
    //   name: "CUSTOMER_ID",
    //   // sequence: 4,
    //   label: "Customer Id",
    //   placeholder: "",
    //   type: "text",
    //   // required: true,
    //   // maxLength: 11,
    //   isReadOnly: true,
    //   GridProps: {
    //     xs: 12,
    //     md: 2,
    //     sm: 2,
    //   },
    // },
    // {
    //   render: {
    //     componentType: "textField",
    //   },
    //   name: "PAN_NO",
    //   // sequence: 8,
    //   label: "PAN No.",
    //   placeholder: "",
    //   type: "text",
    //   // required: true,
    //   // maxLength: 100,
    //   isReadOnly: true,
    //   GridProps: {
    //     xs: 12,
    //     md: 2,
    //     sm: 2,
    //   },
    // },
    // {
    //   render: {
    //     componentType: "textField",
    //   },
    //   name: "UNIQUE_ID",
    //   // sequence: 9,
    //   label: "National ID",
    //   placeholder: "",
    //   // options: () => {
    //   //   return GeneralAPI.GetMiscValue("USER_SUB_TYPE");
    //   // },
    //   // enableDefaultOption: true,
    //   // _optionsKey: "GetSubTypeMiscValue",
    //   isReadOnly: true,
    //   GridProps: {
    //     xs: 12,
    //     md: 2,
    //     sm: 2,
    //   },
    // },
    // {
    //   render: {
    //     componentType: "textField",
    //   },
    //   name: "SCR_ADD",
    //   // sequence: 2,
    //   label: "Address",
    //   // placeholder: "Select No of Leaves",
    //   // enableDefaultOption: true,
    //   // required: true,
    //   isReadOnly: true,
    //   GridProps: {
    //     xs: 12,
    //     md: 4,
    //     sm: 4,
    //   },
    // },
    // {
    //   render: {
    //     componentType: "textField",
    //   },
    //   name: "NO_OF_LEAVE",
    //   // sequence: 2,
    //   label: "No of Leaves",
    //   placeholder: "Select No of Leaves",
    //   enableDefaultOption: true,
    //   required: true,
    //   GridProps: {
    //     xs: 12,
    //     md: 1,
    //     sm: 1,
    //   },
    // setValueOnDependentFieldsChange: useGetDataMutation,

    // setValueOnDependentFieldsChange: (dependent) => {
    //   if (
    //     typeof dependent["ACTIVE_FLAG"]?.value === "boolean" &&
    //     !Boolean(dependent["ACTIVE_FLAG"]?.value)
    //   ) {
    //     return format(new Date(), "dd/MM/yyyy HH:mm:ss");
    //   }
    //   return null;
    // },
    // shouldExclude: (val1, dependent) => {
    //   if (
    //     typeof dependent["ACTIVE_FLAG"]?.value === "boolean" &&
    //     Boolean(dependent["ACTIVE_FLAG"]?.value)
    //   ) {
    //     return true;
    //   }
    //   return false;
    // },
    // },
    // {
    //   render: {
    //     componentType: "hidden",
    //   },
    //   name: "INACTIVE_DATE",
    //   sequence: 12,
    //   label: "Inactive Date",
    //   isReadOnly: true,
    //   placeholder: "",
    //   GridProps: {
    //     xs: 12,
    //     md: 4,
    //     sm: 4,
    //   },
    //   dependentFields: ["ACTIVE_FLAG"],
    //   runValidationOnDependentFieldsChange: true,
    //   setValueOnDependentFieldsChange: (dependent) => {
    //     if (
    //       typeof dependent["ACTIVE_FLAG"]?.value === "boolean" &&
    //       !Boolean(dependent["ACTIVE_FLAG"]?.value)
    //     ) {
    //       return format(new Date(), "dd/MM/yyyy HH:mm:ss");
    //     }
    //     return null;
    //   },
    //   shouldExclude: (val1, dependent) => {
    //     if (
    //       typeof dependent["ACTIVE_FLAG"]?.value === "boolean" &&
    //       Boolean(dependent["ACTIVE_FLAG"]?.value)
    //     ) {
    //       return true;
    //     }
    //     return false;
    //   },
    //   __EDIT__: { render: { componentType: "textField", group: 0 } },
    // },
  ],
};
