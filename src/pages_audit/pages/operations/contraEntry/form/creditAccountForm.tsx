import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AuthContext } from "pages_audit/auth";
import {
  usePopupContext,
  SubmitFnType,
  GradientButton,
  FormWrapper,
  MetaDataType,
  InitialValuesType,
  getCurrencySymbol,
  formatCurrency,
  usePropertiesConfigContext,
  queryClient,
  LoaderPaperComponent,
  Alert,
} from "@acuteinfo/common-base";
import { useTranslation } from "react-i18next";
import { CreditAccountDtlMetadata } from "./creditAccountMetadata";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";
import { TRN001Context } from "../../DailyTransaction/TRN001/Trn001Reducer";
import { format } from "date-fns";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useCommonFunctions } from "../../fix-deposit/function";
import { useDialogContext } from "../../payslip-issue-entry/DialogContext";
import { useQuery } from "react-query";
import { getTrxValidate } from "../../DailyTransaction/TRN001/api";
import i18n from "components/multiLanguage/languagesConfiguration";

export const CreditAccountForm = ({ saveScroll, parametres }) => {
  const { trackDialogClass, dialogClassNames } = useDialogContext();
  const { MessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const { t } = useTranslation();
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const { state, dispatch } = useContext(TRN001Context);
  const [disableButton, setDisableButton] = useState(false);
  const rowData = state?.rows?.[0];
  const customParameter = usePropertiesConfigContext();
  const { dynamicAmountSymbol, currencyFormat, decimalCount } = customParameter;
  const { focusRef, setFocus } = useCommonFunctions();

  const {
    data: paramData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<any, any>(["getTrxValidate"], () =>
    getTrxValidate({
      A_ENT_COMP_CD: authState?.companyID ?? "",
      A_ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
      A_COMP_CD: authState?.companyID ?? "",
      A_BRANCH_CD: rowData?.branch?.value ?? "",
      A_ACCT_TYPE: rowData?.accType?.value ?? "",
      A_ACCT_CD: rowData?.accNo ?? "",
      A_INST_DUE_DT: format(new Date(), "dd/MMM/yyyy"),
      A_TYPE_CD: "6   ",
      A_AC_TYPE_CD: rowData?.TYPE_CD ?? "",
      A_GD_DATE: authState?.workingDate ?? "",
      A_SCREEN_REF: docCD,
      A_LANG: i18n.resolvedLanguage ?? "",
      A_USER: authState?.user?.id ?? "",
      A_USER_LEVEL: authState?.role ?? "",
      unqID: rowData?.unqID,
      PREV_TYPE_CD: "",
      PREV_SCROLL: "",
      PARA_24: parametres?.[0]?.PARA_24 ?? "",
      SCROLL_TALLY: "Y",
    })
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getTrxValidate"]);
    };
  }, []);

  const handleButtonDisable = (disable) => {
    setDisableButton(disable);
  };

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    action
  ) => {
    endSubmit(true);

    const reqParam = [
      {
        ENTERED_BRANCH_CD: rowData?.branch?.value ?? "",
        ENTERED_COMP_CD: authState?.companyID ?? "",
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: rowData?.branch?.value ?? "",
        ACCT_TYPE: rowData?.accType?.value ?? "",
        ACCT_CD: rowData?.accNo ?? "",
        TYPE_CD: "6   ",
        SCROLL1: paramData?.[0]?.SCROLL1 ?? "",
        SDC: rowData?.sdc?.value ?? "",
        REMARKS: `${rowData?.remark ?? ""} ${
          authState?.companyID?.trim() ?? ""
        }.${data?.BRANCH_CD?.trim() ?? ""}.${data?.ACCT_TYPE?.trim() ?? ""}.${
          data?.ACCT_CD?.trim() ?? ""
        } ${data?.ACCT_NM?.trim() ?? ""}`,
        CHEQUE_NO: rowData?.cNo ? rowData?.cNo : "",
        VALUE_DT: format(rowData?.date, "dd-MMM-yyyy"),
        AMOUNT: rowData?.debit ?? "",
        CURRENCY_CD: "00  ",
        CONFIRMED: "0",
        ENTERED_DATE: format(new Date(), "dd/MM/yyyy HH:mm:ss"),
        TRN_FLAG: "BT",
      },
      {
        ENTERED_BRANCH_CD: data?.BRANCH_CD ?? "",
        ENTERED_COMP_CD: authState?.companyID ?? "",
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: data?.BRANCH_CD ?? "",
        ACCT_TYPE: data?.ACCT_TYPE ?? "",
        ACCT_CD: data?.ACCT_CD ?? "",
        TYPE_CD: "3   ",
        SCROLL1: paramData?.[0]?.SCROLL1 ?? "",
        SDC: "3   ",
        REMARKS: `${rowData?.remark ?? ""} ${
          authState?.companyID?.trim() ?? ""
        }.${rowData?.branch?.value?.trim() ?? ""}.${
          rowData?.accType?.value?.trim() ?? ""
        }.${rowData?.accNo?.trim() ?? ""} ${rowData?.accName?.trim() ?? ""}`,
        CHEQUE_NO: rowData?.cNo ? rowData?.cNo : "",
        VALUE_DT: format(rowData?.date, "dd-MMM-yyyy"),
        AMOUNT: rowData?.debit ?? "",
        CURRENCY_CD: "00  ",
        CONFIRMED: "0",
        ENTERED_DATE: format(new Date(), "dd/MM/yyyy HH:mm:ss"),
        TRN_FLAG: "BT",
      },
    ];

    const btnName = await MessageBox({
      messageTitle: "confirmation",
      message: "SaveData",
      buttonNames: ["Yes", "No"],
      defFocusBtnName: "Yes",
      loadingBtnName: ["Yes"],
      icon: "CONFIRM",
    });
    if (btnName === "Yes") {
      saveScroll.mutate(reqParam);
    }
  };
  trackDialogClass("contraCreditForm");
  return (
    <>
      {isLoading ? (
        <LoaderPaperComponent />
      ) : (
        <div className="contraCreditForm">
          {(isError || isError) && (
            <Alert
              severity="error"
              errorMsg={error?.error_msg || t("Somethingwenttowrong")}
              errorDetail={error?.error_detail || ""}
              color="error"
            />
          )}

          <FormWrapper
            key={"creditAccountDtl"}
            metaData={CreditAccountDtlMetadata as MetaDataType}
            initialValues={
              {
                COMP_CD: authState?.companyID ?? "",
                ACCT_TYPE: state?.rows?.[0]?.accType?.value ?? "",
                BRANCH_CD: state?.rows?.[0]?.branch?.value ?? "",
              } as InitialValuesType
            }
            onSubmitHandler={onSubmitHandler}
            formState={{
              MessageBox: MessageBox,
              docCD: docCD,
              handleButtonDisable: handleButtonDisable,
              setFocus: setFocus,
              acctDtlReqPara: {
                ACCT_CD: {
                  ACCT_TYPE: "ACCT_TYPE",
                  BRANCH_CD: "BRANCH_CD",
                  SCREEN_REF: docCD ?? "",
                },
              },
            }}
            formStyle={{
              background: "white",
            }}
            controlsAtBottom={true}
          >
            {({ isSubmitting, handleSubmit }) => (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Typography
                  component="span"
                  variant="h5"
                  style={{
                    fontSize: "16px",
                    fontWeight: "500",
                    color: "var(--theme-color1)",
                  }}
                >
                  {`Debit Account: ${rowData?.branch?.value?.trim() ?? ""}-${
                    rowData?.accType?.value?.trim() ?? ""
                  }-${
                    rowData?.accNo?.trim() ?? ""
                  }\u00A0\u00A0\u00A0\u00A0Transfer Amount: ${formatCurrency(
                    parseFloat(rowData?.debit || "0"),
                    getCurrencySymbol(dynamicAmountSymbol),
                    currencyFormat,
                    decimalCount
                  )}    `}
                </Typography>

                <Box>
                  <GradientButton
                    onClick={handleSubmit}
                    disabled={disableButton}
                    color={"primary"}
                    ref={focusRef}
                  >
                    {t("Ok")}
                  </GradientButton>
                  <GradientButton
                    onClick={() => {
                      dispatch({
                        type: "UPDATE_ROW",
                        payload: {
                          updUnqId: 0,
                          updateFn: (row) => ({
                            ...row,
                            isOpenContraCreditForm: false,
                          }),
                        },
                      });
                    }}
                  >
                    {t("Close")}
                  </GradientButton>
                </Box>
              </Box>
            )}
          </FormWrapper>
        </div>
      )}
    </>
  );
};
