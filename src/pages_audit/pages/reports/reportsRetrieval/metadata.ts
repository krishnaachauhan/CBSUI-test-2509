export const metaDataForm: any = {
  listDetails: [
    {
      apiUrl: "GETCATMSTGENDATADISP",
      displayValue: "DROPDOWN_DISP",
      dataValue: "CATEG_CD",
      accecorName: "CATEG_CD",
      displayLabel: "category",
      positionTop: false,
      otherReqPara: {
        FLAG: "A",
      },
    },
    // {
    //   apiUrl: "GETBRANCHLISTRPT",
    //   displayValue: "BRANCH_NM",
    //   dataValue: "BRANCH_CD",
    //   accecorName: "BRANCH_CD",
    //   displayLabel: "Branch",
    //   positionTop: false,
    // },
  ],
  form: {
    name: "dynamic Retrieval",
    label: "Retrieval Parameters",
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
    //     componentType: "textField",
    //   },
    //   name: "TEST_ACCECOR",
    //   label: "test",
    // },
    {
      render: {
        componentType: "datePicker",
      },
      name: "FROM_DT",
      label: "FromDates",
      placeholder: "",
      defaultValue: new Date(),
      format: "dd/MM/yyyy",
      GridProps: {
        xs: 8,
        md: 6,
        sm: 6,
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TO_DT",
      label: "ToDates",
      placeholder: "",
      format: "dd/MM/yyyy",
      defaultValue: new Date(),
      runValidationOnDependentFieldsChange: true,
      GridProps: {
        xs: 8,
        md: 6,
        sm: 6,
      },
    },
  ],
};
