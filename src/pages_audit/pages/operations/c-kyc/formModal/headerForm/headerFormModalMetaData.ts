import * as API from "../../api";
export const HeaderFormMetadata = {
  form: {
    name: "headerForm",
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
          sm: 12,
          md: 12,
          lg: 12,
          xl: 12,
        },
        container: {
          direction: "row",
          // spacing: 0.5,
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
        componentType: "numberFormat",
      },
      name: "CUSTOMER_ID",
      label: "CustID",
      isReadOnly: true,
      placeholder: "CustomerID",
      GridProps: {
        xs: 3,
        sm: 1.5,
        md: 1.5,
        lg: 1.5,
        xl: 1.5,
      },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "REQ_CD",
      label: "ReqID",
      placeholder: "reqId",
      isReadOnly: true,
      GridProps: {
        xs: 3,
        sm: 1.5,
        md: 1.5,
        lg: 1.5,
        xl: 1.5,
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "CATEG_CD",
      label: "CategoryConstitution",
      placeholder: "CategoryConstitution",
      options: async (dependentValue?, formState?, _?, authState?) => {
        if (Boolean(formState?.state?.entityTypectx)) {
          return await API.getCIFCategories({
            COMP_CD: authState?.companyID ?? "",
            BRANCH_CD: authState?.user?.branchCode ?? "",
            ENTITY_TYPE: formState?.state?.entityTypectx ?? "",
          });
        }
      },
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (!Boolean(formState?.state?.isFreshEntryctx)) {
          return true;
        }
        return false;
      },
      isFieldFocused: true,
      GridProps: {
        xs: 6,
        sm: 4,
        md: 3.5,
        lg: 2.5,
        xl: 2.5,
      },
      disableCaching: true,
    },

    {
      render: {
        componentType: "numberFormat",
      },
      name: "KYC_NUMBER",
      label: "CkycNo",
      placeholder: "CkycNo",
      isReadOnly: true,
      GridProps: {
        xs: 3,
        sm: 2,
        md: 2,
        lg: 1.5,
        xl: 1.5,
      },
    },
    {
      render: { componentType: "checkbox" },
      name: "ACTIVE_FLAG_F",
      label: "Active",
      isReadOnly: true,
      GridProps: { xs: 1, md: 1, sm: 1, lg: 1, xl: 1 },
    },
    {
      render: { componentType: "datePicker" },
      name: "INACTIVE_DT",
      label: "InactiveDate",
      placeholder: "DD/MM/YYYY",
      isReadOnly: true,
      GridProps: {
        xs: 3,
        sm: 2,
        md: 2.5,
        lg: 1.5,
        xl: 1.5,
      },
    },
  ],
};
