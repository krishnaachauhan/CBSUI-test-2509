import * as API from "./api";

export const impsEntryMetadata = {
  masterForm: {
    form: {
      name: "atm-Confirm-MetaData",
      label: " ",
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
    },
    fields: [
      {
        render: {
          componentType: "numberFormat",
        },
        name: "CUSTOMER_ID",
        fullWidth: true,
        label: "CustomerId",
        FormatProps: {
          isAllowed: (values) => {
            console.log(values);
            if (values?.value?.length > 12 || values?.floatValue === 0) {
              return false;
            }
            return true;
          },
        },
        isFieldFocused: true,
        required: true,
        placeholder: "Enter Customer Id",
        dependentFields: [
          "PARA_602",
          "PARA_946",
          "RETRIEVE_DATA",
          "COPY_CUSTOMER_ID",
        ],
        isReadOnly: (fieldData, dependentFields) => {
          if (dependentFields?.RETRIEVE_DATA?.value === "Y") {
            return true;
          } else {
            return false;
          }
        },
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          authState,
          dependent
        ) => {
          if (
            field?.value &&
            formState?.FORM_MODE === "new" &&
            dependent?.COPY_CUSTOMER_ID?.value !== field?.value
          ) {
            let postData = await API.validateCustId({
              SCREEN_REF: formState?.docCD,
              CUST_ID: field?.value,
            });

            let apiRespMSGdata = postData?.[0]?.MSG;
            let isReturn;
            const messagebox = async (
              msgTitle,
              msg,
              buttonNames,
              status,
              icon
            ) => {
              let buttonName = await formState.MessageBox({
                messageTitle: msgTitle,
                message: msg,
                buttonNames: buttonNames,
                icon: icon,
              });
              return { buttonName, status };
            };
            if (apiRespMSGdata?.length) {
              for (let i = 0; i < apiRespMSGdata?.length; i++) {
                if (apiRespMSGdata[i]?.O_STATUS !== "0") {
                  let btnName = await messagebox(
                    apiRespMSGdata[i]?.O_MSG_TITLE
                      ? apiRespMSGdata[i]?.O_MSG_TITLE
                      : apiRespMSGdata[i]?.O_STATUS === "999"
                      ? "ValidationFailed"
                      : apiRespMSGdata[i]?.O_STATUS === "99"
                      ? "confirmation"
                      : "ALert",
                    apiRespMSGdata[i]?.O_MESSAGE,
                    apiRespMSGdata[i]?.O_STATUS === "99"
                      ? ["Yes", "No"]
                      : ["Ok"],
                    apiRespMSGdata[i]?.O_STATUS,
                    apiRespMSGdata[i]?.O_STATUS === "999"
                      ? "ERROR"
                      : apiRespMSGdata[i]?.O_STATUS === "99"
                      ? "CONFIRM"
                      : "WARNING"
                  );
                  if (btnName.buttonName === "No" || btnName.status === "999") {
                    formState?.formRef.current?.setGridData([]);
                    return {
                      CUSTOMER_ID: { value: "", isFieldFocused: true },
                      ORGINAL_NM: { value: "" },
                      UNIQUE_ID: { value: "" },
                      MOB_NO: { value: "" },
                      PAN_NO: { value: "" },
                      COPY_CUSTOMER_ID: { value: "" },
                      CONFIRMED: { value: "" },
                    };
                  }
                } else {
                  isReturn = true;
                }
              }
            }
            if (Boolean(isReturn)) {
              formState?.formRef.current?.setGridData([]);
              return {
                CUSTOMER_ID: {
                  value: field?.value,
                  ignoreUpdate: true,
                  isFieldFocused: false,
                },
                ORGINAL_NM: { value: postData?.[0]?.ORIGINAL_NM },
                UNIQUE_ID: { value: postData?.[0]?.UNIQUE_ID },
                MOB_NO: { value: postData?.[0]?.MOB_NO },
                PAN_NO: { value: postData?.[0]?.PAN_NO },
                CONFIRMED: { value: postData?.[0]?.CONFIRMED },
                COMP_CD: { value: authState?.companyID },
                COPY_CUSTOMER_ID: { value: field?.value },
              };
            }
          } else if (!field?.value) {
            formState?.formRef.current?.setGridData([]);
            return {
              ORGINAL_NM: { value: "" },
              UNIQUE_ID: { value: "" },
              MOB_NO: { value: "" },
              PAN_NO: { value: "" },
              CONFIRMED: { value: "" },
              COPY_CUSTOMER_ID: { value: "" },
            };
          }
          return {};
        },
        runPostValidationHookAlways: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["CustomerIdisrequired"] }],
        },
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
        name: "ORGINAL_NM",
        label: "AcctOrignalName",
        fullWidth: true,
        isReadOnly: true,
        GridProps: {
          xs: 12,
          md: 4.5,
          sm: 4.5,
          lg: 4.5,
          xl: 4.5,
        },
      },
      {
        render: {
          componentType: "phoneNumberOptional",
        },
        name: "MOB_NO",
        label: "MobileNo",
        fullWidth: true,
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
          componentType: "aadharCard",
        },
        name: "UNIQUE_ID",
        label: "UIDAadhaar",
        fullWidth: true,
        isReadOnly: true,
        GridProps: { xs: 12, md: 2.5, sm: 2.5, lg: 2.5, xl: 2.5 },
        schemaValidation: {
          type: "string",
          rules: [{ name: "", params: [""] }],
        },
      },

      {
        render: {
          componentType: "panCardOptional",
        },
        name: "PAN_NO",
        label: "PanNo",
        fullWidth: true,
        isReadOnly: true,
        txtTransform: "uppercase",
        GridProps: { xs: 12, md: 2.5, sm: 2.5, lg: 2.5, xl: 2.5 },
      },
      {
        render: {
          componentType: "datetimePicker",
        },
        name: "REG_DATE",
        label: "ActivationDate",
        format: "dd/MM/yyyy HH:mm:ss",
        fullWidth: true,
        isReadOnly: true,
        GridProps: { xs: 12, md: 2.5, sm: 2.5, lg: 2.5, xl: 2.5 },
      },
      {
        render: {
          componentType: "checkbox",
        },
        name: "ACTIVE",
        label: "Active",
        fullWidth: true,
        dependentFields: ["RETRIEVE_DATA"],
        shouldExclude: (field, dependent) => {
          if (dependent?.RETRIEVE_DATA?.value === "Y") {
            return false;
          }
          return true;
        },
        GridProps: {
          style: { paddingTop: "44px" },
          xs: 12,
          md: 2,
          sm: 2,
          lg: 2,
          xl: 2,
        },
      },
      {
        render: {
          componentType: "datePicker",
        },
        name: "DEACTIVE_DT",
        fullWidth: true,
        isReadOnly: true,
        isWorkingDate: true,
        label: "DeActiveDateIMPS",
        dependentFields: ["ACTIVE", "RETRIEVE_DATA"],
        shouldExclude: (field, dependent, __) => {
          if (
            (dependent?.RETRIEVE_DATA?.value === "Y" &&
              !Boolean(dependent?.ACTIVE?.value)) ||
            (dependent?.RETRIEVE_DATA?.value === "Y" &&
              dependent?.ACTIVE?.value === "N")
          ) {
            return false;
          }
          return true;
        },
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
          componentType: "formbutton",
        },
        name: "POPULATE",
        label: "Populate",
        __VIEW__: {
          render: {
            componentType: "hidden",
          },
        },
        dependentFields: ["RETRIEVE_DATA", "CUSTOMER_ID", "COPY_CUSTOMER_ID"],
        shouldExclude: (field, dependentFields) => {
          if (
            (dependentFields?.CUSTOMER_ID?.value &&
              dependentFields?.CUSTOMER_ID?.value ===
                dependentFields?.COPY_CUSTOMER_ID?.value) ||
            dependentFields?.RETRIEVE_DATA?.value === "Y"
          ) {
            return false;
          }
          return true;
        },

        GridProps: {
          xs: 12,
          sm: 1,
          md: 1,
          lg: 1,
          xl: 1,
        },
      },

      {
        render: {
          componentType: "hidden",
        },
        name: "CONFIRMED",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "ENTERED_COMP_CD",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "ENTERED_BRANCH_CD",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "TRAN_CD",
      },
      {
        render: {
          componentType: "hidden",
        },
        name: "RETRIEVE_DATA",
      },

      {
        render: {
          componentType: "hidden",
        },
        name: "COPY_CUSTOMER_ID",
        ignoreInSubmit: true,
      },
    ],
  },
  detailsGrid: {
    gridConfig: {
      dense: true,
      gridLabel: " ",
      rowIdColumn: "FULL_ACCT_NO_NM",
      defaultColumnConfig: {
        width: 150,
        maxWidth: 250,
        minWidth: 100,
      },
      allowColumnReordering: true,
      disableSorting: false,
      disableGroupBy: true,
      enablePagination: true,
      hideFooter: false,
      hideHeader: true,
      pageSizes: [10, 20, 30],
      defaultPageSize: 10,
      containerHeight: {
        min: "calc(100vh - 430px)",
        max: "calc(100vh - 430px)",
      },
      allowFilter: false,
      allowColumnHiding: false,
      allowRowSelection: false,
      footerNote: "Doubleclickontherowtoedit",
    },
    filters: [],
    columns: [
      {
        accessor: "FULL_ACCT_NO_NM",
        columnName: "SrNo",
        sequence: 1,
        alignment: "center",
        componentType: "default",
        width: 76,
        minWidth: 70,
        maxWidth: 100,
        isAutoSequence: true,
      },
      {
        accessor: "REG_DT",
        columnName: "RegDate",
        sequence: 2,
        alignment: "center",
        componentType: "date",
        dateFormat: "dd/MM/yyyy",
        width: 135,
        minWidth: 100,
        maxWidth: 200,
      },
      {
        accessor: "BRANCH_CD",
        columnName: "BranchCode",
        sequence: 2,
        alignment: "left",
        componentType: "default",
        width: 100,
        minWidth: 50,
        maxWidth: 150,
      },
      {
        accessor: "ACCT_TYPE",
        columnName: "AccountType",
        sequence: 2,
        alignment: "left",
        componentType: "default",
        width: 100,
        minWidth: 50,
        maxWidth: 150,
      },
      {
        accessor: "ACCT_CD",
        columnName: "AccountNumber",
        sequence: 2,
        alignment: "left",
        componentType: "default",
        width: 110,
        minWidth: 80,
        maxWidth: 150,
      },
      {
        accessor: "ACCT_NM",
        columnName: "AccountName",
        sequence: 2,
        alignment: "left",
        componentType: "default",
        width: 220,
        minWidth: 100,
        maxWidth: 300,
      },
      {
        accessor: "IFT",
        columnName: "IFT",
        sequence: 3,
        alignment: "center",
        componentType: "editableCheckbox",
        isReadOnly: true,
        width: 60,
        minWidth: 40,
        maxWidth: 100,
      },
      {
        accessor: "PERDAY_IFT_LIMIT",
        columnName: "IFTDailyLimit",
        componentType: "currency",
        alignment: "right",
        sequence: 4,
        width: 115,
        maxWidth: 250,
        minWidth: 90,
      },
      {
        accessor: "RTGS",
        columnName: "RTGS",
        sequence: 5,
        alignment: "center",
        componentType: "editableCheckbox",
        isReadOnly: true,
        width: 60,
        minWidth: 40,
        maxWidth: 100,
      },
      {
        accessor: "PERDAY_RTGS_LIMIT",
        columnName: "RTGSDayLimit",
        componentType: "currency",
        alignment: "right",
        sequence: 6,
        width: 115,
        maxWidth: 250,
        minWidth: 90,
      },
      {
        accessor: "NEFT",
        columnName: "NEFT",
        sequence: 7,
        alignment: "center",
        componentType: "editableCheckbox",
        isReadOnly: true,
        width: 60,
        minWidth: 40,
        maxWidth: 100,
      },
      {
        accessor: "PERDAY_NEFT_LIMIT",
        columnName: "NEFTDayLimit",
        componentType: "currency",
        alignment: "right",
        sequence: 8,
        width: 115,
        maxWidth: 250,
        minWidth: 90,
      },
      {
        accessor: "IMPS",
        columnName: "IMPS",
        sequence: 8,
        alignment: "center",
        componentType: "editableCheckbox",
        isReadOnly: true,
        width: 60,
        minWidth: 40,
        maxWidth: 100,
      },
      {
        accessor: "PERDAY_P2P_LIMIT",
        columnName: "IMPSP2PDayLimit",
        componentType: "currency",
        alignment: "right",
        sequence: 8,
        width: 120,
        maxWidth: 250,
        minWidth: 90,
      },
      {
        accessor: "PERDAY_P2A_LIMIT",
        columnName: "IMPSP2ADayLimit",
        componentType: "currency",
        alignment: "right",
        sequence: 8,
        width: 125,
        maxWidth: 250,
        minWidth: 90,
      },
      {
        accessor: "OWN_ACT",
        columnName: "OwnAc",
        sequence: 9,
        alignment: "center",
        componentType: "editableCheckbox",
        isReadOnly: true,
        width: 72,
        minWidth: 40,
        maxWidth: 100,
      },
      {
        accessor: "PERDAY_OWN_LIMIT",
        columnName: "OWNDayLimit",
        componentType: "currency",
        alignment: "right",
        sequence: 10,
        width: 115,
        maxWidth: 250,
        minWidth: 90,
      },
      {
        accessor: "BBPS",
        columnName: "BBPS",
        sequence: 11,
        alignment: "center",
        componentType: "editableCheckbox",
        isReadOnly: true,
        width: 60,
        minWidth: 40,
        maxWidth: 100,
      },
      {
        accessor: "PERDAY_BBPS_LIMIT",
        columnName: "BBPSDayLimit",
        componentType: "currency",
        alignment: "right",
        sequence: 12,
        width: 115,
        maxWidth: 250,
        minWidth: 90,
      },
      {
        accessor: "PG_TRN",
        columnName: "PaymentGateway",
        sequence: 13,
        alignment: "center",
        componentType: "editableCheckbox",
        isReadOnly: true,
        width: 125,
        minWidth: 40,
        maxWidth: 150,
      },
      {
        accessor: "PERDAY_PG_AMT",
        columnName: "PGatewayDailyLimit",
        componentType: "currency",
        alignment: "right",
        sequence: 14,
        width: 130,
        maxWidth: 250,
        minWidth: 90,
      },

      {
        accessor: "JOINT_DETAILS",
        columnName: "JointDetails",
        componentType: "buttonRowCell",
        alignment: "center",
        buttonLabel: "JointDetails",
        isVisibleInNew: true,
        sequence: 18,
        width: 110,
        maxWidth: 150,
        minWidth: 90,
      },
      {
        accessor: "PHOTO_SIGN",
        columnName: "PhotoSign",
        componentType: "buttonRowCell",
        alignment: "center",
        buttonLabel: "PhotoSign",
        isVisibleInNew: true,
        sequence: 19,
        width: 110,
        maxWidth: 150,
        minWidth: 90,
      },

      {
        accessor: "ALLOW_DELETE",
        columnName: "Action",
        componentType: "buttonRowCell",
        alignment: "center",
        buttonLabel: "Delete",
        sequence: 20,
        width: 110,
        maxWidth: 150,
        minWidth: 90,
        __EDIT__: {
          isVisible: true,
        },
        isVisible: false,
        // isVisibleInNew: true,
        // setButtonName: (initialValue, original) => {
        //   return original?.DOC_DATA ? "View" : "Upload";
        // },
        // shouldExclude: (initialValue, original) => {
        //   console.log("<<<orignal", original);
        //   if (original?.DOC_DEC) {
        //     return false;
        //   }
        //   return true;
        // },
      },
    ],
  },
};
