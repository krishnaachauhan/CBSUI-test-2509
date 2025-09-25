export let customMetadataSugg = {
  ReportMetadata: {
    disableGroupBy: false,
    retrievalType: "CUSTOMIZE",
    hideAmountIn: true,
    autoFetch: false,
    columns: [
      {
        accessor: "COMP_CD",
        width: "140",
        type: "default",
        columnName: "CompCd",
      },
      {
        accessor: "BRANCH_CD",
        width: "140",
        type: "default",
        columnName: "BranchCd",
      },
      {
        accessor: "ACCT_TYPE",
        width: "140",
        type: "default",
        columnName: "AcctType",
      },
      {
        accessor: "ACCT_CD",
        width: "140",
        type: "default",
        columnName: "AcctCd",
      },
      {
        accessor: "TRAN_CD",
        width: "140",
        type: "default",
        columnName: "TranCd",
      },
      {
        accessor: "TRAN_DT",
        width: "140",
        type: "default",
        columnName: "TranDt",
      },
      {
        accessor: "STATUS",
        width: "140",
        type: "default",
        columnName: "Status",
      },
      {
        accessor: "OLD_STATUS",
        width: "140",
        type: "default",
        columnName: "OldStatus",
      },
      {
        accessor: "ENTERED_BY",
        width: "140",
        type: "default",
        columnName: "EnteredBy",
      },
      {
        accessor: "ENTERED_COMP_CD",
        width: "140",
        type: "default",
        columnName: "EnteredCompCd",
      },
      {
        accessor: "ENTERED_BRANCH_CD",
        width: "140",
        type: "default",
        columnName: "EnteredBranchCd",
      },
      {
        accessor: "LAST_MACHINE_NM",
        width: "140",
        type: "default",
        columnName: "LastMachineNm",
      },
      {
        accessor: "ENTERED_DATE",
        width: "140",
        type: "default",
        columnName: "EnteredDate",
      },
      {
        accessor: "ACCT_NM",
        width: "140",
        type: "default",
        columnName: "AcctNm",
      },
      {
        accessor: "CONF_BAL",
        width: "140",
        type: "default",
        columnName: "ConfBal",
      },
    ],
    hideFooter: false,
    title: "",
  },

  "=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*": "=*=*=*=**=*=*=*=*=*=*=*=*=*=*=*=*=*=",

  RetrievalMetadata: {
    dialogStyle: {
      PaperProps: {
        style: {
          maxWidth: "885px",
        },
      },
    },

    topGridConfig: {
      isHideColumnHeader: false,
      topColumns: [
        {
          minWidth: "50",
          id: "COMP_CD",
          label: "Company Code",
        },
        {
          minWidth: "50",
          id: "BRANCH_CD",
          label: "Branch Code",
        },
        {
          minWidth: "150",
          id: "BRANCH_NM",
          label: "Branch Name",
        },
        {
          minWidth: "50",
          id: "STATUS",
          label: "Status",
        },
      ],
      reqParameters: [
        {
          displayValue: "BRANCH_CD",
          displayLabel: "BranchCode",
          accessorName: "BRANCH_CD",
          dataValue: "BRANCH_CD",
        },
      ],
      topMessageData: {
        icon: "WARNING",
        messageTitle: "Alert",
        message: "Please Select a Branch.",
      },
      apiUrl: "GETBRANCHDDDW",
      isSelctionRequiredT: true,
      buttonStyle: {
        display: "flex",
        justifyContent: "flex-end",
      },
      tableStyle: {
        "& .MuiTableContainer-root": {
          maxHeight: "20vh",
        },
      },
      isTopVisible: true,
      isHideHeader: true,
    },

    bottomGridConfig: {
      isBottomVisible: true,
      isHideColumnHeader: true,
      reqParameters: [
        {
          displayValue: "DATA_VALUE",
          displayLabel: "Status",
          accessorName: "STATUS",
          dataValue: "DATA_VALUE",
        },
      ],
      apiUrl: "GETPMISCDATA",
      staticReq: {
        CATEGORY_CD: "STATUS",
      },
      bottomColumns: [
        {
          minWidth: "250px",
          id: "DISPLAY_NM",
          label: "Account Type",
        },
      ],
      isSelctionRequiredB: true,
      buttonStyle: {
        display: "flex",
        justifyContent: "flex-end",
      },
      tableStyle: {
        "& .MuiTableContainer-root": {
          maxHeight: "30vh",
        },
      },
      bottomMessageData: {
        icon: "WARNING",
        messageTitle: "Alert",
        message: "Please Select a Type.",
      },
      isHideHeader: false,
    },

    formConfig: {
      formMetadata: {
        form: {
          resetFieldOnUnmount: false,
          name: "retrieve-rpt-metadata",
          submitAction: "home",
          validationRun: "onBlur",
          componentProps: {
            datetimePicker: {
              fullWidth: true,
            },
            select: {
              fullWidth: true,
            },
            numberFormat: {
              fullWidth: true,
            },
            datePicker: {
              fullWidth: true,
            },
            inputMask: {
              fullWidth: true,
            },
            textField: {
              fullWidth: true,
            },
          },
          label: "RetrieveInformation",
          render: {
            ordering: "auto",
            renderType: "simple",
            gridConfig: {
              container: {
                spacing: "10px",
                direction: "row",
              },
              item: {
                md: "4",
                sm: "4",
                xs: "12",
              },
            },
          },
        },
        fields: [
          {
            fullWidth: true,
            isWorkingDate: true,
            name: "FROM_DT",
            format: "dd/MM/yyyy",
            GridProps: {
              xl: "4",
              md: "4",
              sm: "4",
              xs: "12",
              lg: "4",
            },
            dependentFields: ["A_RET_FLAG"],
            label: "GeneralFromDate",
            placeholder: "DD/MM/YYYY",
            isFieldFocused: true,
            render: {
              componentType: "datePicker",
            },
            required: true,
            schemaValidation: {
              type: "string",
              rules: [
                {
                  name: "required",
                  params: ["This Field is required."],
                },
              ],
            },
          },
          {
            fullWidth: true,
            isWorkingDate: true,
            name: "TO_DT",
            format: "dd/MM/yyyy",
            runValidationOnDependentFieldsChange: true,
            GridProps: {
              xl: "4",
              md: "4",
              sm: "4",
              xs: "12",
              lg: "4",
            },
            dependentFields: ["FROM_DT", "A_RET_FLAG"],
            label: "GeneralToDate",
            placeholder: "DD/MM/YYYY",
            render: {
              componentType: "datePicker",
            },
            required: true,
            schemaValidation: {
              type: "string",
              rules: [
                {
                  name: "required",
                  params: ["This Field is required."],
                },
              ],
            },
          },
        ],
      },
      formVisible: true,
      buttonVisible: false,
    },
  },
};
