import { UserSecurity } from "./metaDataGrid";
import { Fragment, useCallback, useContext, useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import * as API from "./api";
import { Typography } from "@mui/material";
import { DateRetrievalDialog } from "components/common/custom/dateRetrievalPara";
import { SecurityContextWrapper } from "./context/SecuityForm";
import { RetrieveForm } from "./retrivalPara";
import Steppers from "./stepper/stepper";
import {
  getPadAccountNumber,
  validateHOBranch,
  getdocCD,
} from "components/utilFunction/function";
import { GeneralAPI } from "registry/fns/functions";
import { ETFGeneralAPI } from "../../../../generalAPI";
import { useLocation } from "react-router-dom";
import {
  ClearCacheContext,
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  queryClient,
  FormWrapper,
  MetaDataType,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { t } from "i18next";
import { AuthContext } from "pages_audit/auth";
import { de } from "date-fns/locale";

const actions: ActionTypes[] = [
  {
    actionName: "retrieve",
    actionLabel: "Retrieve",
    multiple: undefined,
    alwaysAvailable: true,
    rowDoubleClick: false,
  },
  {
    actionName: "edit",
    actionLabel: "Edit Detail",
    multiple: false,
    alwaysAvailable: false,
    rowDoubleClick: true,
  },
];

export const tradeParaMetaData = {
  form: {
    name: "tradeParaMetaData",
    label: "LC Entry",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    // allowColumnHiding: true,
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 4,
          sm: 4,
          md: 4,
          lg: 6,
          xl: 5,
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
      formbutton: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "autocomplete",
      },
      name: "function_id",
      label: "Function",
      placeholder: "Select Function",
      type: "text",
      isFieldFocused: true,
      required: true,
      GridProps: {
        xs: 6,
        sm: 4,
        md: 2.5,
        lg: 2,
        xl: 2.5,
      },
      options: [
        { label: "ISSUE AT SIGHT", value: "LCS" },
        { label: "ISSUE AT USANCE", value: "LCU" },
        { label: "VIEW", value: "VIEW" },
      ],
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["This field is required."] }],
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "CURR_CD",
      label: "Currency",
      placeholder: "Enter Currency",
      type: "text",
      GridProps: {
        xs: 6,
        sm: 4,
        md: 2.5,
        lg: 2,
        xl: 1.5,
      },
      FormatProps: {
        allowNegative: false,
      },
      options: async (dependentValue, formState, _, authState) => {
        const ccyList = await ETFGeneralAPI.getCurrencyList({
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: authState?.user?.baseBranchCode ?? "",
        });
        return ccyList;
      },
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        authState
      ) => {
        if (formState?.isSubmitting) return {};
        const ccyRate = await ETFGeneralAPI.getCCYRate({
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: authState?.user?.baseBranchCode ?? "",
          CURR_CD: field.value ?? "",
          WORKING_DATE: authState?.workingDate,
          A_FLAG: "S",
        });

        return {
          CCY_RATE: {
            value: ccyRate?.[0]?.RATE ?? "",
          },
        };
      },
      required: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["This field is required."] }],
      },
    },
    {
      render: {
        componentType: "amountField",
      },
      StartAdornment: (dependentFields) => dependentFields?.CURR_CD?.value,
      dependentFields: ["CURR_CD"],
      name: "CCY_RATE",
      label: "Card Rate",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: {
        xs: 6,
        sm: 4,
        md: 3.5,
        lg: 2,
        xl: 1.5,
      },
    },
    {
      render: {
        componentType: "spacer",
      },
      name: "LINE_NO_SPACER",
      GridProps: {
        xs: 0,
        sm: 0.2,
        md: 0.1,
        lg: 0.1,
        xl: 6,
      },
    },
    {
      render: {
        componentType: "_accountNumber",
      },
      branchCodeMetadata: {
        required: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["This field is required."] }],
        },
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          authState
        ) => {
          if (formState?.isSubmitting) return {};
          const isHOBranch = await validateHOBranch(
            field,
            formState?.MessageBox,
            authState
          );
          if (isHOBranch) {
            return {
              BRANCH_CD: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          }
          if (field.value) {
            return {
              ACCT_TYPE: { value: "" },
              ACCT_CD: { value: "" },
              CUSTOMER_ID: { value: "" },
            };
          } else if (!field.value) {
            return {
              ACCT_TYPE: { value: "" },
              ACCT_CD: { value: "" },
              CUSTOMER_ID: { value: "" },
            };
          }
        },
        GridProps: { xs: 4, sm: 4, md: 4, lg: 1.5, xl: 1.5 },
        runPostValidationHookAlways: true,
      },
      accountTypeMetadata: {
        dependentFields: ["BRANCH_CD"],
        validationRun: "all",
        required: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["This field is required."] }],
        },
        isFieldFocused: false,
        postValidationSetCrossFieldValues: (
          field,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          return {
            ACCT_CD: { value: "" },
            CUSTOMER_ID: { value: "" },
          };
        },
        runPostValidationHookAlways: true,
        GridProps: { xs: 12, sm: 4, md: 4, lg: 1.5, xl: 1.5 },
      },
      accountCodeMetadata: {
        render: {
          componentType: "textField",
        },
        required: true,
        validationRun: "all",
        // schemaValidation: {
        //   type: "string",
        //   rules: [
        //     {
        //       name: "max",
        //       params: [20, "AcctNoValidationMsg"],
        //     },
        //   ],
        // },
        schemaValidation: {
          type: "string",
          rules: [
            { name: "required", params: ["This field is required."] },
            { name: "max", params: [20, "AcctNoValidationMsg"] },
          ],
        },
        validate: (columnValue) => {
          let regex = /^[^!&]*$/;
          if (!regex.test(columnValue.value)) {
            return "Special Characters (!, &) not Allowed";
          }
          return "";
        },
        postValidationSetCrossFieldValues: async (
          field,
          formState,
          authState,
          dependentValue
        ) => {
          if (formState?.isSubmitting) return {};
          const ACCT_TYPE = dependentValue?.ACCT_TYPE?.value;
          const BRANCH_CD = dependentValue?.BRANCH_CD?.value;

          let btn99, returnVal;
          if (
            field?.value &&
            dependentValue?.BRANCH_CD?.value &&
            dependentValue?.ACCT_TYPE?.value
          ) {
            let apiRequest = {
              ACCT_CD: getPadAccountNumber(
                field?.value,
                dependentValue?.ACCT_TYPE?.optionData?.[0]
              ),
              ACCT_TYPE: dependentValue?.ACCT_TYPE?.value,
              BRANCH_CD: dependentValue?.BRANCH_CD?.value,
              SCREEN_REF: formState.docCD,
            };

            let postData = await GeneralAPI.getAccNoValidation(apiRequest);
            // returnVal = postData;
            let apiRespMSGdata = postData?.MSG;
            const messagebox = async (msgTitle, msg, buttonNames, status) => {
              let buttonName = await formState.MessageBox({
                messageTitle: msgTitle,
                message: msg,
                buttonNames: buttonNames,
                icon:
                  status === "9"
                    ? "WARNING"
                    : status === "99"
                    ? "CONFIRM"
                    : status === "999"
                    ? "ERROR"
                    : status === "0" && "SUCCESS",
              });
              return { buttonName, status };
            };
            if (apiRespMSGdata?.length) {
              for (let i = 0; i < apiRespMSGdata?.length; i++) {
                if (apiRespMSGdata[i]?.O_STATUS !== "0") {
                  //formState?.setDisplayGridData(false);
                  let btnName = await messagebox(
                    apiRespMSGdata[i]?.O_STATUS === "999"
                      ? "ValidationFailed"
                      : apiRespMSGdata[i]?.O_STATUS === "999"
                      ? "Confirmation"
                      : "Alert",
                    apiRespMSGdata[i]?.O_MESSAGE,
                    apiRespMSGdata[i]?.O_STATUS === "99"
                      ? ["Yes", "No"]
                      : ["Ok"],
                    apiRespMSGdata[i]?.O_STATUS
                  );
                  if (
                    btnName?.status === "999" ||
                    btnName?.buttonName === "No"
                  ) {
                    return {
                      ACCT_CD: {
                        value: "",
                        isFieldFocused: true,
                        ignoreUpdate: false,
                      },
                      CUSTOMER_ID: { value: "" },
                    };
                  }
                } else if (apiRespMSGdata[i]?.O_STATUS === "0") {
                  returnVal = postData;
                } else {
                  formState.setDataOnFieldChange("BUTTON_CLICK_ACCTCD", {
                    ACCT_TYPE: ACCT_TYPE,
                    BRANCH_CD: BRANCH_CD,
                    ACCT_CD: field?.value,
                    PADDINGNUMBER:
                      dependentValue?.ACCT_TYPE?.optionData?.[0] ?? "",
                  });
                  return {
                    CUSTOMER_ID: { value: "" },
                  };
                }
              }
            }
            return {
              ACCT_CD:
                returnVal !== ""
                  ? {
                      value: utilFunction.getPadAccountNumber(
                        field?.value,
                        dependentValue?.ACCT_TYPE?.optionData
                      ),
                      isFieldFocused: false,
                      ignoreUpdate: true,
                    }
                  : {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: true,
                    },
              ACCT_NAME: {
                value: returnVal?.ACCT_NM ?? "",
              },
              CUSTOMER_ID: {
                value: returnVal?.CUSTOMER_ID ?? "",
              },
              TRAN_BAL: {
                value: returnVal?.TRAN_BAL ?? "",
              },
            };
          }
        },
        autoComplete: "off",
        runPostValidationHookAlways: true,
        GridProps: { xs: 12, sm: 2, md: 2, lg: 2, xl: 1.5 },
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PADDINGNUMBER",
      dependentFields: ["ACCT_TYPE"],
      setValueOnDependentFieldsChange: (dependentFields) => {
        const optionData = dependentFields.ACCT_TYPE.optionData;
        if (optionData && optionData.length > 0) {
          return optionData[0]?.PADDING_NUMBER;
        } else return "";
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NAME",
      label: "Account Name",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 3.3, md: 3.3, lg: 3.3, xl: 2.3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CUSTOMER_ID",
      label: "Customer ID",
      type: "text",
      fullWidth: true,
      isReadOnly: true,
      GridProps: { xs: 12, sm: 3.3, md: 3.3, lg: 3.3, xl: 1 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "TRAN_BAL",
      label: "Available Balance",
      placeholder: "",
      type: "text",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 2.1, md: 2.1, lg: 2.1, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "REF_NO",
      label: "Copy From",
      placeholder: "Enter Reference Number",
      type: "text",
      GridProps: {
        xs: 6,
        sm: 4,
        md: 2.5,
        lg: 2,
        xl: 3,
      },
      FormatProps: {
        allowNegative: false,
      },
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "GO_BTN",
      label: "Go",
      isReadOnly: false,
      dependentFields: [
        "function_id",
        "CURR_CD",
        "CUSTOMER_ID",
        "ACCT_NAME",
        "BRANCH_CD",
        "ACCT_TYPE",
        "ACCT_CD",
        "TRAN_BAL",
        "CCY_RATE",
      ],
      endsIcon: "YoutubeSearchedFor",
      rotateIcon: "scale(1.5)",
      placeholder: "",
      type: "text",
      GridProps: {
        xs: 12,
        sm: 6,
        md: 1.5,
        lg: 1,
        xl: 1,
      },
    },
  ],
};

const TradePara = () => {
  const navigate = useNavigate();
  const { getEntries } = useContext(ClearCacheContext);
  const { authState } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [intialAction, setintialAction] = useState(actions);
  const [isRetrieve, setRetrieve] = useState(false);

  let currentPath = useLocation().pathname;
  const docCD = "TRN/021"; //getdocCD(currentPath, authState?.menulistdata);
  const { MessageBox, CloseMessageBox } = usePopupContext();

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getLCRecentQueue"], (params) =>
    API.getLCRecentQueue({
      A_COMP_CD: authState?.companyID,
      A_BRANCH_CD: authState?.user?.branchCode,
      A_PARM: "FBLC",
      A_FUNCTION_TYPE: "LCS",
      A_FLAG: "D",
      A_FROMDATE: authState?.workingDate,
      A_TODATE: authState?.workingDate,
      A_REF_NO: "",
    })
  );

  const [gridData, setGridData] = useState<any>([]);
  const getMutateData: any = useMutation(API.getLCRecentQueue, {
    onSuccess: (data) => {
      setGridData(data);
    },
    onError: (error: any) => {
      console.log("err", error);
    },
  });

  useEffect(() => {
    if (authState?.hoLogin !== "Y") {
      setintialAction([
        {
          actionName: "edit",
          actionLabel: "Edit Detail",
          multiple: false,
          alwaysAvailable: false,
          rowDoubleClick: true,
        },
      ]);
    } else {
      setintialAction([
        {
          actionName: "add",
          actionLabel: "Retrieve",
          multiple: undefined,
          alwaysAvailable: true,
          rowDoubleClick: false,
        },
        {
          actionName: "edit",
          actionLabel: "Edit Detail",
          multiple: false,
          alwaysAvailable: false,
          rowDoubleClick: true,
        },
      ]);
    }
  }, [actions]);
  const setCurrentAction = useCallback((data) => {
    const queriesForClear = [
      "getapplicationaccess",
      "getUserAccessBranch",
      "getproductaccess",
      "getLoginShiftAccess",
      "getBiometric",
    ];
    queriesForClear.forEach((key) => {
      queryClient.removeQueries(key);
    });
    if (data.name === "retrieve") {
      setRetrieve(true);
    }
  }, []);
  useEffect(() => {
    return () => {
      let entries = getEntries() as any[];
      if (Array.isArray(entries) && entries.length > 0) {
        entries.forEach((one) => {
          queryClient.removeQueries(one);
        });
      }
      queryClient.removeQueries(["getLCRecentQueue"]);
    };
  }, [getEntries]);

  return (
    //need to add here form wrapper
    <Fragment>
      {isError && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? t("Somethingwenttowrong")}
          errorDetail={error?.error_detail}
          color="error"
        />
      )}

      <FormWrapper
        metaData={tradeParaMetaData as MetaDataType}
        onSubmitHandler={() => {}}
        formStyle={{
          background: "white",
          maxHeight: "500px",
          overflowY: "auto",
          overflowX: "hidden",
        }}
        formState={{ MessageBox: MessageBox, docCD: docCD }}
        onFormButtonClickHandel={(id, dependentFields) => {
          if (id === "GO_BTN") {
            const FunctionId = dependentFields.function_id.value;
            const Ccy = dependentFields.CURR_CD.value;
            const branch_id = dependentFields.BRANCH_CD.value;
            const acct_type = dependentFields.ACCT_TYPE.value;
            const ACCT_CD = dependentFields.ACCT_CD.value;
            const TRAN_BAL = dependentFields.TRAN_BAL.value;
            const CCY_RATE = dependentFields.CCY_RATE.value;
            if (
              FunctionId === "" ||
              Ccy === "" ||
              branch_id === "" ||
              acct_type === "" ||
              ACCT_CD === ""
            ) {
              return; // Stop further execution
            }

            navigate("add", {
              state: {
                function_id: FunctionId,
                CURR_CD: Ccy,
                CUSTOMER_ID: dependentFields.CUSTOMER_ID.value,
                ACCT_NAME: dependentFields.ACCT_NAME.value,
                BRANCH_CD: branch_id,
                ACCT_TYPE: acct_type,
                ACCT_CD: ACCT_CD,
                docType: "FBLC",
                TRAN_BAL: TRAN_BAL,
                CCY_RATE: CCY_RATE,
              },
            });
          }
        }}
      />

      <GridWrapper
        key={`SecurityUserGrid` + intialAction}
        finalMetaData={UserSecurity as GridMetaDataType}
        data={gridData ?? []}
        actions={intialAction}
        loading={isFetching || isLoading}
        setData={() => null}
        setAction={setCurrentAction}
        refetchData={() => refetch()}
      />
      {/* <DateRetrievalDialog
        classes={"divflex"}
        open={isRetrieve}
        handleClose={() => setRetrieve(false)}
        loginState={authState}
        retrievalParaValues={(...arg) => {
          console.log("arg", arg);
        }}
        defaultData={undefined} /> */}
      <RetrieveForm
        getData={getMutateData}
        onClose={(flag, rowsData) => setRetrieve(false)}
        open={isRetrieve}
      />
    </Fragment>
  );
};

const ImportLCWrapper = () => {
  return (
    <SecurityContextWrapper>
      <Routes>
        <Route
          path="add"
          element={<Steppers defaultView={"new"} flag={"addMode"} />}
        />
        <Route
          path="edit"
          element={<Steppers defaultView={"view"} flag={"editMode"} />}
        />
        <Route path="/*" element={<TradePara />} />
      </Routes>
    </SecurityContextWrapper>
  );
};

export default ImportLCWrapper;
