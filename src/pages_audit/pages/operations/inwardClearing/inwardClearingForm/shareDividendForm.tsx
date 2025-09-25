import { FC, useContext, useRef, useState } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Dialog from "@mui/material/Dialog";
import * as API from "../api";
import { Alert, Tab, Tabs } from "@acuteinfo/common-base";
import {
  PaidWarrantGridMetaData,
  shareDividendMetaData,
  ViewDetailGridMetaData,
  ViewMasterMetaData,
} from "./metaData";
import {
  AppBar,
  CircularProgress,
  Typography,
  Theme,
  Toolbar,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { AuthContext } from "pages_audit/auth";
import { useMutation, useQueries } from "react-query";
import { useTranslation } from "react-i18next";

import {
  usePopupContext,
  utilFunction,
  GridWrapper,
  GridMetaDataType,
  SubmitFnType,
  FormWrapper,
  MetaDataType,
  useTabStyles,
  GradientButton,
} from "@acuteinfo/common-base";

const useTypeStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    background: "var(--theme-color5)",
  },
  title: {
    flex: "1 1 100%",
    color: "var(--theme-color2)",
    letterSpacing: "1px",
    fontSize: "1.5rem",
  },
  refreshiconhover: {},
}));

export const ShareDividendFormWrapper: FC<{
  onClose?: any;
  dividendData?: any;
}> = ({ onClose, dividendData }) => {
  const headerClasses = useTypeStyles();
  const [currentTab, setCurrentTab] = useState("tab0");
  const tabClasses = useTabStyles();
  const { authState }: any = useContext(AuthContext);
  const [reqData, setReqData] = useState<any>({});
  const [divAmount, setDivAmount] = useState<any>();
  const [viewMasterTab, setViewMasterTab] = useState<any>();
  const { MessageBox } = usePopupContext();
  const myRef = useRef<any>(null);
  const { t } = useTranslation();
  const acctDtlParaRef = useRef<any>(null);
  const [disableBtn, setDisableBtn] = useState(false);

  const getDividendViewDetailGridData: any = useMutation(
    API.getDividendViewDetailGridData,
    {
      onError: (error: any) => {
        let errorMsg = "Unknown Error occured";
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
      },

      onSuccess: (data) => {},
    }
  );

  const getDividendPaidWarrantGridData: any = useMutation(
    API.getDividendPaidWarrantGridData,
    {
      onError: (error: any) => {
        let errorMsg = "Unknown Error occured";
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
      },

      onSuccess: (data) => {},
    }
  );
  const postConfigDML: any = useMutation(API.postConfigDML, {
    onSuccess: (data, variables) => {
      MessageBox({
        messageTitle: "Success",
        message: data,
      });
      onClose();
    },

    onError: (error: any) => {
      let errorMsg = "Unknown Error occured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
    },
  });
  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    endSubmit(true);
    const oldData = {
      COMP_CD: dividendData?.COMP_CD ?? "",
      BRANCH_CD: dividendData?.BRANCH_CD ?? "",
      ACCT_TYPE: dividendData?.ACCT_TYPE ?? "",
      ACCT_CD: dividendData?.ACCT_CD ?? "",
      CHEQUE_NO: dividendData?.CHEQUE_NO,
      DRAFT_DIV: dividendData?.DRAFT_DIV,
      TRAN_CD: dividendData?.TRAN_CD,
      MICR_TRAN_CD: dividendData?.MICR_TRAN_CD,
      CHEQUE_DT: dividendData?.CHEQUE_DT,
    };
    const newData = {
      COMP_CD: dividendData?.COMP_CD ?? "",
      BRANCH_CD: data?.BRANCH_CD ?? "",
      ACCT_TYPE: data?.ACCT_TYPE ?? "",
      ACCT_CD: data?.ACCT_CD ?? "",
      CHEQUE_NO: dividendData?.CHEQUE_NO,
      TRAN_CD: dividendData?.TRAN_CD,
      MICR_TRAN_CD: data?.MICR_TRAN_CD,
      CHEQUE_DT: data?.CHEQUE_DT,
      DRAFT_DIV: dividendData?.DRAFT_DIV,
    };

    let upd: any = utilFunction.transformDetailsData(newData ?? {}, oldData);
    postConfigDML.mutate({
      ...newData,
      ...upd,
      _isNewRow: true,
    });
  };
  const year: any =
    new Date(authState?.workingDate).getFullYear() -
    (new Date(authState?.workingDate).getMonth() < 3 ? 1 : 0);

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="lg"
        open={true} // Assuming this is controlled by a state
        key="positivePayDialog"
        PaperProps={{
          style: {
            width: "75%",
            // height: "78%",
            // height: "70%",
          },
        }}
      >
        <AppBar
          position="relative"
          color="secondary"
          style={{ marginBottom: "5px" }}
        >
          <Toolbar className={headerClasses.root} variant={"dense"}>
            <Typography
              className={headerClasses.title}
              color="inherit"
              variant={"h6"}
              component="div"
            >
              {t("InwardClearingProcess")}
            </Typography>
            <>
              <GradientButton
                onClick={(event) => {
                  if (
                    divAmount?.[0]?.DIVIDEND_AMOUNT !== dividendData?.AMOUNT
                  ) {
                    MessageBox({
                      messageTitle: t("ValidationFailed"),
                      message: t("DividendAmountMatch"),
                      icon: "ERROR",
                    });
                  } else {
                    myRef.current?.handleSubmit(event);
                  }
                }}
                // disabled={isSubmitting}
                endIcon={
                  postConfigDML?.isLoading ? (
                    <CircularProgress size={20} />
                  ) : null
                }
                color={"primary"}
                disabled={disableBtn}
              >
                {t("Save")}
              </GradientButton>
              <GradientButton
                onClick={onClose}
                color={"primary"}
                // disabled={isSubmitting}
              >
                {t("Close")}
              </GradientButton>
            </>
          </Toolbar>
        </AppBar>
        <div style={{ padding: "0px 8px 0px 8px" }}>
          <Tabs
            value={currentTab}
            onChange={(_, currentTab) => {
              setCurrentTab(currentTab);

              if (reqData && Object.keys(reqData).length > 0) {
                if (currentTab === "tab0") {
                  getDividendViewDetailGridData.mutate({
                    ...reqData,
                    COMP_CD: authState?.companyID,
                    YEAR_CHAR: reqData?.YEAR_CD,
                    FLAG: "1",
                  });
                } else if (currentTab === "tab2") {
                  getDividendPaidWarrantGridData.mutate({
                    ...reqData,
                    COMP_CD: authState?.companyID,
                    YEAR_CHAR: reqData?.YEAR_CD,
                    A_FLAG: "1",
                  });
                }
              }
            }}
            textColor="secondary"
            aria-label="ant example"
          >
            <Tab label="View Detail" id="0" value="tab0" />
            <Tab label="View Master" id="1" value="tab1" />
            <Tab label="Paid Warrant" id="2" value="tab2" />
          </Tabs>
          <div className={tabClasses.tabPanel}>
            {currentTab === "tab0" ? (
              <>
                {getDividendViewDetailGridData?.isError && (
                  <Alert
                    severity="error"
                    errorMsg={
                      getDividendViewDetailGridData?.error?.error_msg ??
                      "Something went to wrong.."
                    }
                    errorDetail={
                      getDividendViewDetailGridData?.error?.error_detail
                    }
                    color="error"
                  />
                )}
                <GridWrapper
                  key={`ViewDetailGridMetaData`}
                  finalMetaData={ViewDetailGridMetaData as GridMetaDataType}
                  data={getDividendViewDetailGridData?.data ?? []}
                  setData={() => null}
                  loading={getDividendViewDetailGridData.isLoading}
                  refetchData={() => {}}
                />
              </>
            ) : currentTab === "tab1" ? (
              <FormWrapper
                key={"ShareDividend"}
                metaData={ViewMasterMetaData as MetaDataType}
                onSubmitHandler={() => {}}
                initialValues={viewMasterTab?.[0]}
                //@ts-ignore
                displayMode={"view"}
                formStyle={{
                  background: "white",
                  height: "40vh",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
                hideHeader={true}
              />
            ) : currentTab === "tab2" ? (
              <>
                {getDividendPaidWarrantGridData?.isError && (
                  <Alert
                    severity="error"
                    errorMsg={
                      getDividendPaidWarrantGridData?.error?.error_msg ??
                      "Something went to wrong.."
                    }
                    errorDetail={
                      getDividendPaidWarrantGridData?.error?.error_detail
                    }
                    color="error"
                  />
                )}
                <GridWrapper
                  key={`PaidWarrentGridMetaData`}
                  finalMetaData={PaidWarrantGridMetaData as GridMetaDataType}
                  data={getDividendPaidWarrantGridData?.data ?? []}
                  setData={() => null}
                  loading={getDividendPaidWarrantGridData.isLoading}
                  refetchData={() => {}}
                />
              </>
            ) : null}
          </div>
        </div>
        <>
          {postConfigDML?.isError ? (
            <Alert
              severity="error"
              errorMsg={
                postConfigDML.error?.error_msg ?? "Unknown Error occured"
              }
              errorDetail={postConfigDML.error?.error_detail ?? ""}
            />
          ) : null}
          <FormWrapper
            key={"ShareDividend"}
            metaData={shareDividendMetaData as MetaDataType}
            onSubmitHandler={onSubmitHandler}
            initialValues={{
              YEAR_CD: `${year}`,
              AMOUNT: dividendData?.AMOUNT,
            }}
            ref={myRef}
            //@ts-ignore
            formStyle={{
              background: "white",
            }}
            hideHeader={true}
            containerstyle={{ padding: "10px", maxWidth: "100%" }}
            setDataOnFieldChange={(action, payload) => {
              if (action === "TAB_REQUEST") {
                setReqData(payload);
              } else if (action === "VIEW_MASTER") {
                setViewMasterTab(payload);
                setCurrentTab("tab1");
              }
              if (action === "ACSHRTCTKEY_REQ") {
                acctDtlParaRef.current = payload;
              }
              // else if (action === "TAB_CHANGED") {
              //   setCurrentTab("tab2");
              //   // getDividendPaidWarrantGridData.mutate({
              //   //   ...reqData,
              //   //   COMP_CD: authState?.companyID,
              //   //   YEAR_CHAR: reqData?.YEAR_CD,
              //   //   A_FLAG: "1",
              //   // });
              // }
              if (action === "POST_DATA") {
                setDivAmount(payload);
              }
            }}
            formState={{
              DOC_CD: "DIV",
              MessageBox: MessageBox,
              setDisableBtn: setDisableBtn,
            }}
          />
        </>
      </Dialog>
    </>
  );
};
