export let staticMetadataSugg = {
  ReportMetadata: {
    disableGroupBy: false,
    retrievalType: "STATIC",
    hideAmountIn: true,
    autoFetch: false,
    columns: [
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
        accessor: "NAME",
        width: "140",
        type: "default",
        columnName: "Name",
      },
      {
        accessor: "CONF_BAL",
        width: "140",
        type: "default",
        columnName: "ConfBal",
      },
      {
        accessor: "ADD1",
        width: "140",
        type: "default",
        columnName: "Add1",
      },
      {
        accessor: "ADD2",
        width: "140",
        type: "default",
        columnName: "Add2",
      },
      {
        accessor: "CLOSE_DT",
        width: "140",
        type: "default",
        columnName: "CloseDt",
      },
      {
        accessor: "OLD_AC",
        width: "140",
        type: "default",
        columnName: "OldAc",
      },
      {
        accessor: "VEHICLE_NO",
        width: "140",
        type: "default",
        columnName: "VehicleNo",
      },
      {
        accessor: "ENGINE_NO",
        width: "140",
        type: "default",
        columnName: "EngineNo",
      },
      {
        accessor: "CHASIS_NO",
        width: "140",
        type: "default",
        columnName: "ChasisNo",
      },
      {
        accessor: "MODEL_NAME",
        width: "140",
        type: "default",
        columnName: "ModelName",
      },
      {
        accessor: "INST_DUE_DT",
        width: "140",
        type: "default",
        columnName: "InstDueDt",
      },
      {
        accessor: "INS_COMP_NM",
        width: "140",
        type: "default",
        columnName: "InsCompNm",
      },
      {
        accessor: "CONTACT1",
        width: "140",
        type: "default",
        columnName: "Contact1",
      },
      {
        accessor: "COMP_NM",
        width: "140",
        type: "default",
        columnName: "CompNm",
      },
      {
        accessor: "BRANCH_NM",
        width: "140",
        type: "default",
        columnName: "BranchNm",
      },
      {
        accessor: "AREA_NM",
        width: "140",
        type: "default",
        columnName: "AreaNm",
      },
      {
        accessor: "ENTERED_BY",
        width: "140",
        type: "default",
        columnName: "EnteredBy",
      },
      {
        accessor: "CITY_CD",
        width: "140",
        type: "default",
        columnName: "CityCd",
      },
      {
        accessor: "CITY_NM",
        width: "140",
        type: "default",
        columnName: "CityNm",
      },
      {
        accessor: "STATE_NM",
        width: "140",
        type: "default",
        columnName: "StateNm",
      },
      {
        accessor: "STAT_CD",
        width: "140",
        type: "default",
        columnName: "StatCd",
      },
      {
        accessor: "AMOUNT",
        width: "140",
        type: "default",
        columnName: "Amount",
      },
      {
        accessor: "PARA_VALUE",
        width: "140",
        type: "default",
        columnName: "ParaValue",
      },
      {
        accessor: "FULL_AC_NO",
        width: "140",
        type: "default",
        columnName: "FullAcNo",
      },
      {
        accessor: "AREA_DTL",
        width: "140",
        type: "default",
        columnName: "AreaDtl",
      },
    ],
    hideFooter: false,
    title: "",
  },

  "=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*=*": "=*=*=*=**=*=*=*=*=*=*=*=*=*=*=*=*=*=",

  RetrievalMetadata: {
    formConfig: {
      formMetadata: {
        form: {
          name: "retrieve-compo-retrieve-MetaData",
          label: "enterRetrivalPara",
          resetFieldOnUnmount: false,
          validationRun: "onBlur",
          submitAction: "home",
          render: {
            ordering: "auto",
            renderType: "simple",
            gridConfig: {
              item: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
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
            _accountNumber: {
              fullWidth: true,
            },
          },
        },
        fields: [
          {
            render: {
              componentType: "autocomplete",
            },
            name: "BRANCH_CD",
            runPostValidationHookAlways: true,
            fullWidth: true,
            validationRun: "onChange",
            defaultBranchTrue: true,
            shouldExclude: true,
            label: "BranchCode",
            placeholder: "BranchCodePlaceHolder",
            options: " GeneralAPI.getBranchCodeList",
            required: true,
            _optionsKey: "getBranchCodeList",
            GridProps: { xs: 12, sm: 4, md: 2, lg: 2, xl: 1 },
          },
          {
            render: {
              componentType: "autocomplete",
            },
            name: "ACCT_TYPE",
            runExternalFunction: true,
            fullWidth: true,
            isFieldFocused: true,
            validationRun: "all",
            label: "AccountType",
            placeholder: "AccountTypePlaceHolder",
            required: true,
            schemaValidation: {
              type: "string",
              rules: [{ name: "required", params: ["AccountTypeReqired"] }],
            },
            options: (dependentValue, formState, _, authState) => {
              return [];
            },
            _optionsKey: "get_Account_Type",
            postValidationSetCrossFieldValues: async (field, formState) => {
              formState.setDataOnFieldChange("IS_VISIBLE", {
                IS_VISIBLE: false,
              });
              if (field?.value) {
                return {
                  ACCT_CD: { value: "" },
                };
              }
            },
            runPostValidationHookAlways: true,
            GridProps: { xs: 12, sm: 3.5, md: 3.5, lg: 3.5, xl: 3.5 },
          },
          {
            render: {
              componentType: "textField",
            },
            required: true,
            placeholder: "EnterAccountNumber",

            schemaValidation: {
              type: "string",
              rules: [
                { name: "required", params: ["AccountNumberRequired"] },
                {
                  name: "max",
                  params: [20, "Account code should not exceed 20 digits"],
                },
              ],
            },
            name: "ACCT_CD",
            autoComplete: "off",
            label: "AccountNumber",
            dependentFields: ["ACCT_TYPE", "BRANCH_CD"],
            runPostValidationHookAlways: true,
            validate: (columnValue) => {
              let regex = /^[^!&]*$/;
              if (!regex.test(columnValue.value)) {
                return "Special Characters (!, &) not Allowed";
              }
              return "";
            },
            fullWidth: true,
            GridProps: { xs: 12, sm: 3.5, md: 3.5, lg: 3.5, xl: 3.5 },
          },
          {
            render: {
              componentType: "textField",
            },
            name: "ACCT_NM",
            fullWidth: true,
            label: "AccountName",
            placeholder: "AccountName",
            type: "text",
            isReadOnly: true,
            GridProps: { xs: 12, sm: 5, md: 5, lg: 5, xl: 5 },
          },
          {
            render: { componentType: "datePicker" },
            name: "TRAN_DATE",
            label: "Date",
            placeholder: "DD/MM/YYYY",
            fullWidth: true,
            schemaValidation: {
              type: "string",
              rules: [{ name: "required", params: ["DateRequired"] }],
            },
            GridProps: {
              xs: 12,
              md: 3.5,
              sm: 3.5,
              lg: 3.5,
              xl: 3.5,
            },
          },
          {
            render: {
              componentType: "select",
            },
            name: "PARA_CD",
            label: "ReportType",
            fullWidth: true,
            placeholder: "NocReportConf",
            options: [
              { label: "JointGuarantorSignatoryAcctwise", value: "Y" },
              { label: "Accountwise", value: "N" },
            ],
            defaultValue: "Y",
            _optionsKey: "PARA_CD",
            GridProps: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
          },
        ],
      },
    },
  },
};
