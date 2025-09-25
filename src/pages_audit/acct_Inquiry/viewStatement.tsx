import { CircularProgress, Dialog, useTheme } from "@mui/material";
import { format } from "date-fns";
import { AuthContext } from "pages_audit/auth";
import { useContext, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import { AccountInquiry, PassbookStatement } from "./metaData";
import { useTranslation } from "react-i18next";
import {
  LoaderPaperComponent,
  usePopupContext,
  GradientButton,
  InitialValuesType,
  SubmitFnType,
  MetaDataType,
  queryClient,
  FormWrapper,
} from "@acuteinfo/common-base";
import PassbookPrint from "pages_audit/pages/operations/passbookPrint";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";

export const ViewStatement: any = ({
  open,
  onClose,
  rowsData,
  screenFlag,
  close,
}) => {
  const [disableButton, setDisableButton] = useState(false);
  const [passbookOpen, setPassbookOpen] = useState(false);
  const [passbookData, setPassbookData] = useState([]);
  const formRef = useRef<any>(null);
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const parameterRef = useRef<any>();
  const { t } = useTranslation();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const acctInqData: any = useQuery<any, any, any>(
    ["getAcctInqStatement", { rowsData, COMP_CD: authState.companyID }],
    () =>
      API.getAcctInqStatement({
        rowsData,
        COMP_CD: authState.companyID,
        workingDate: authState?.workingDate,
        screenFlag: screenFlag,
        FULL_ACCT_NO: "",
      })
  );

  const passbookInqData: any = useMutation(
    "getPassbookStatement",
    API.getPassbookStatement,
    {
      onSuccess: async (data) => {
        setPassbookOpen(true);
        setPassbookData(data);
        // onClose();
      },
      onError: async (error: any) => {
        const btnName = await MessageBox({
          messageTitle: "ValidationFailed",
          message: error?.error_msg ?? "",
          icon: "ERROR",
        });
        CloseMessageBox();
      },
    }
  );

  const passbookValidation: any = useMutation(
    "passbookPrintingValidation",
    API.passbookPrintingValidation,
    {
      onSuccess: async (data: any) => {
        if (data?.[0]?.O_STATUS === "999") {
          const btnName = await MessageBox({
            messageTitle: "ValidationFailed",
            message: data?.[0]?.O_MESSAGE,
            buttonNames: ["Ok"],
            icon: "ERROR",
          });
        } else if (data?.[0]?.O_STATUS === "0") {
          passbookInqData.mutate({
            COMP_CD: authState.companyID ?? "",
            BRANCH_CD: parameterRef?.current?.BRANCH_CD ?? "",
            ACCT_TYPE: parameterRef?.current?.ACCT_TYPE ?? "",
            ACCT_CD: parameterRef?.current?.ACCT_CD ?? "",
            ENTERED_BRANCH_CD: parameterRef?.current?.BRANCH_CD ?? "",
            FROM_DT: parameterRef?.current?.PASS_BOOK_DT ?? "",
            TO_DT: parameterRef?.current?.PASS_BOOK_TO_DT ?? "",
            PRINT_PAGE: parameterRef?.current?.PID_DESCRIPION ?? "",
            TEMPL_TRAN_CD: parameterRef?.current?.TRAN_CD ?? "",
            LAST_LINE_NO: parameterRef?.current?.PASS_BOOK_LINE ?? "",
            REPRINT: parameterRef?.current?.REPRINT_VALUE ?? "",
          });
        }
      },
      onError: async (error: any) => {
        const btnName = await MessageBox({
          messageTitle: "ValidationFailed",
          message: error?.error_msg ?? "",
          icon: "ERROR",
        });
        CloseMessageBox();
      },
    }
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getAcctInqStatement",
        {
          rowsData,
          COMP_CD: authState.companyID,
          workingDate: authState?.workingDate,
          screenFlag: screenFlag,
        },
      ]);
      queryClient.removeQueries(["getPassbookStatement"]);
      queryClient.removeQueries(["passbookPrintingCompleted"]);
      queryClient.removeQueries(["passbookPrintingValidation"]);
    };
  }, []);

  const handleClose = () => {
    onClose();
  };
  const onSubmitHandler: SubmitFnType = (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    // onClose();
    endSubmit(true);
    if (screenFlag === "ACCT_INQ" && data?.PD_DESTION === "S") {
      const combinedData = { ...rowsData?.[0]?.data, ...data };
      const dataString = JSON.stringify(combinedData);
      sessionStorage.setItem("myData", dataString);
      const newWindow = window.open("/EnfinityCore/view-statement", "_blank");
      if (newWindow) {
        newWindow.focus();
      }
    } else if (screenFlag === "ACCT_INQ" && data?.PD_DESTION === "P") {
      parameterRef.current = {
        ...rowsData?.[0]?.data,
        ...acctInqData?.data?.[0],
        ...data,
      };
      passbookValidation.mutate({
        COMP_CD: authState.companyID ?? "",
        BRANCH_CD: parameterRef.current?.BRANCH_CD ?? "",
        ACCT_TYPE: parameterRef.current?.ACCT_TYPE ?? "",
        ACCT_CD: parameterRef.current?.ACCT_CD ?? "",
        TRAN_CD: parameterRef.current?.TRAN_CD ?? "",
        FLAG: data?.PID_DESCRIPION ?? "",
        LINE_ID: data?.PASS_BOOK_LINE ?? "",
        LINE_PER_PAGE: data?.LINE_PER_PAGE ?? "",
        FROM_DT: format(
          new Date(parameterRef.current["PASS_BOOK_DT"]),
          "dd/MMM/yyyy"
        ),
        GD_DATE: format(
          new Date(parameterRef.current["PASS_BOOK_TO_DT"]),
          "dd/MMM/yyyy"
        ),
        SCREEN_REF: docCD ?? "",
        WORKING_DATE: authState?.workingDate ?? "",
        USERNAME: authState?.user?.id ?? "",
        USERROLE: authState?.role ?? "",
      });
    } else {
      const dataString = JSON.stringify(data);
      sessionStorage.setItem("myData", dataString);
      window.location.reload();
    }
  };

  let finalMetadata: any = null;
  if (screenFlag === "STATEMENT") {
    finalMetadata = PassbookStatement as MetaDataType;
  } else if (screenFlag === "ACCT_INQ") {
    finalMetadata = AccountInquiry as MetaDataType;
  }

  const handleButonDisable = (disable) => {
    setDisableButton(disable);
  };

  const renderResult = (
    <>
      <Dialog
        open={open}
        className="passbookRetrival"
        maxWidth={"sm"}
        onKeyUp={(event) => {
          if (event.key === "Escape") {
            handleClose();
          }
        }}
      >
        {screenFlag === "ACCT_INQ" && acctInqData?.isLoading ? (
          <>
            <div style={{ width: "600px", height: "100px" }}>
              <LoaderPaperComponent />
            </div>
          </>
        ) : (
          <FormWrapper
            key={`ViewStatement`}
            metaData={finalMetadata as MetaDataType}
            initialValues={
              {
                ...acctInqData?.data?.[0],
                BRANCH_CD: authState?.user?.branchCode,
                OP_DATE: rowsData?.[0]?.data?.OP_DATE,
              } as InitialValuesType
            }
            onSubmitHandler={onSubmitHandler}
            formStyle={{
              background: "white",
            }}
            controlsAtBottom={true}
            ref={formRef}
            formState={{
              rowsData: rowsData?.[0]?.data,
              acctInqData: acctInqData?.data?.[0],
              handleButonDisable: handleButonDisable,
              MessageBox: MessageBox,
              docCD: docCD,
            }}
          >
            {({ isSubmitting, handleSubmit }) => (
              <>
                <GradientButton
                  style={{ marginRight: "5px" }}
                  onClick={(event) => {
                    handleSubmit(event, "Save");
                  }}
                  color={"primary"}
                  disabled={
                    acctInqData?.isLoading ||
                    acctInqData?.isFetching ||
                    passbookInqData?.isLoading ||
                    passbookInqData?.isFetching ||
                    passbookValidation?.isLoading ||
                    passbookValidation?.isFetching ||
                    disableButton
                  }
                  endicon={
                    acctInqData?.isLoading ||
                    acctInqData?.isFetching ||
                    passbookInqData?.isLoading ||
                    passbookInqData?.isFetching ||
                    passbookValidation?.isLoading ||
                    passbookValidation?.isFetching
                      ? undefined
                      : "CheckCircleOutline"
                  }
                  rotateIcon="scale(1.4)"
                >
                  {acctInqData?.isLoading ||
                  passbookValidation?.isLoading ||
                  passbookInqData?.isLoading ? (
                    <CircularProgress size={25} thickness={4.6} />
                  ) : (
                    t("Ok")
                  )}
                </GradientButton>
                <GradientButton
                  onClick={handleClose}
                  color={"primary"}
                  endicon="CancelOutlined"
                  rotateIcon="scale(1.4) rotateY(360deg)"
                >
                  {t("Close")}
                </GradientButton>
              </>
            )}
          </FormWrapper>
        )}
      </Dialog>

      {passbookOpen && (
        <Dialog
          open={passbookOpen}
          fullWidth={true}
          PaperProps={{
            style: {
              width: "100%",
              overflow: "auto",
            },
          }}
          maxWidth="lg"
        >
          <PassbookPrint
            screenFlag="PASSBOOK_FROM_ACCT_INQ"
            PassbookPrintingData={passbookData}
            parameterFlagDate={parameterRef.current}
            acctInqDetail={acctInqData?.data?.[0]}
            handleClose={setPassbookOpen}
            onClose={onClose}
          />
          ;
        </Dialog>
      )}
    </>
  );
  return renderResult;
};
