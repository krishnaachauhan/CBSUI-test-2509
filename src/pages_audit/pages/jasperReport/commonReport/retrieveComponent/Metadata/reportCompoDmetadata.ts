import { isValid } from "date-fns";

export const retrieveRptFormMetaData = {
  topGridConfig: {
    apiUrl: "GETBRANCHDDDW",
    topVisible: true,
    hideHeader: true,
    hideColumnHeader: true,
    isSelctionRequiredT: true,
    tableStyle: {
      "& .MuiTableContainer-root": {
        maxHeight: "20vh",
      },
    },
    buttonStyle: { display: "flex", justifyContent: "flex-end" },
    reqParameters: [
      {
        displayValue: "BRANCH_CD",
        dataValue: "BRANCH_CD",
        accessorName: "BRANCH_CD",
        displayLabel: "Branch Code",
      },
    ],
    topMessageData: {
      messageTitle: "Alert",
      message: "Please Select a Branch.",
      icon: "WARNING",
    },
    topColumns: [
      {
        id: "COMP_CD",
        label: "Company Code",
        minWidth: 50,
      },
      {
        id: "BRANCH_CD",
        label: "Branch Code",
        minWidth: 50,
      },
      {
        id: "BRANCH_NM",
        label: "Branch Name",
        minWidth: 150,
      },

      {
        id: "STATUS",
        label: "Status",
        minWidth: 50,
      },
    ],

    // otherReqPara: {
    //   FLAG: "A",
    // },
  },
  bottomGridConfig: {
    apiUrl: "GETRTGSNEFTMSGTYPELIST",
    bottomVisible: true,
    isSelctionRequiredB: true,
    tableStyle: {
      "& .MuiTableContainer-root": {
        maxHeight: "30vh",
      },
    },
    buttonStyle: { display: "flex", justifyContent: "flex-end" },
    reqParameters: [
      {
        displayValue: "TRAN_CD",
        dataValue: "TRAN_CD",
        accessorName: "TRAN_CD",
        displayLabel: "Tran Code",
      },
    ],
    bottomMessageData: {
      messageTitle: "Alert",
      message: "Please Select a Branch.",
      icon: "WARNING",
    },
    bottomColumns: [
      {
        id: "ENTRY_TYPE",
        label: "Entry Type",
        minWidth: 80,
      },
      {
        id: "MSG_TYPE",
        label: "Message Type",
        minWidth: 100,
      },
      {
        id: "DISP_MSG_FLOW",
        label: "Message Flow",
        minWidth: 150,
      },

      {
        id: "DESCRIPTION",
        label: "Description",
        minWidth: 170,
      },
    ],
    // otherReqPara: {
    //   FLAG: "A",
    // },
  },

  formConfig: {
    formVisible: true,
    formMetadata: {
      form: {
        name: "retrieve-rpt-metadata",
        label: "RetrieveInformation",
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
            componentType: "datePicker",
          },
          name: "FROM_DT",
          label: "GeneralFromDate",
          isFieldFocused: true,
          required: true,
          fullWidth: true,
          isWorkingDate: true,
          placeholder: "DD/MM/YYYY",
          format: "dd/MM/yyyy",
          GridProps: {
            xs: 12,
            md: 4,
            sm: 4,
            lg: 4,
            xl: 4,
          },
          validate: (currentField) => {
            let formatdate = new Date(currentField?.value);
            if (!currentField?.value) {
              return "PleaseEnterFromDate";
            } else if (Boolean(formatdate) && !isValid(formatdate)) {
              return "Mustbeavaliddate";
            }
            return "";
          },
          onFocus: (date) => {
            date.target.select();
          },
          dependentFields: ["A_RET_FLAG"],
        },
        {
          render: {
            componentType: "datePicker",
          },
          name: "TO_DT",
          label: "GeneralToDate",
          required: true,
          fullWidth: true,
          isWorkingDate: true,
          format: "dd/MM/yyyy",
          placeholder: "DD/MM/YYYY",
          validate: (currentField, dependentField) => {
            let formatdate = new Date(currentField?.value);
            if (!currentField?.value) {
              return "PleaseEnterToDate";
            } else if (Boolean(formatdate) && !isValid(formatdate)) {
              return "Mustbeavaliddate";
            } else if (
              new Date(currentField?.value) <
              new Date(dependentField?.FROM_DT?.value)
            ) {
              return "ToDateshouldbegreaterthanorequaltoFromDate";
            }
            return "";
          },
          onFocus: (date) => {
            date.target.select();
          },
          dependentFields: ["FROM_DT", "A_RET_FLAG"],
          runValidationOnDependentFieldsChange: true,
          GridProps: {
            xs: 12,
            md: 4,
            sm: 4,
            lg: 4,
            xl: 4,
          },
        },
      ],
    },
  },
};
