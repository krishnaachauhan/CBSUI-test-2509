import {
  ClearCacheProvider,
  FormWrapper,
  GradientButton,
  MetaDataType,
  usePopupContext,
} from "@acuteinfo/common-base";
import { CircularProgress, Dialog } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import { useContext, useEffect, useRef } from "react";
import { useMutation } from "react-query";
import { DateRetrievalFormMetaData } from "./DateRetrivalMetadata";
import { enqueueSnackbar } from "notistack";
import * as API from "./api";
import { format } from "date-fns";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import { useTranslation } from "react-i18next";

const DateRetrivalCustom = ({
  closeDialog,
  open,
  reqData,
  reportDTL,
  openReport,
}) => {
  const IntCalDataRef = useRef<any>(null);
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const { t } = useTranslation();
  const getInterestCalculateReport = useMutation(
    API.getInterestCalculateReportDTL,
    {
      onSuccess: async (data: any, variables: any) => {
        for (let i = 0; i < data?.[0]?.MSG?.length; i++) {
          if (data?.[0]?.MSG[i]?.O_STATUS === "999") {
            const btnName = await MessageBox({
              messageTitle:
                data?.[0]?.MSG[i]?.O_MSG_TITLE ?? "ValidationFailed",
              message: data?.[0]?.MSG[i]?.O_MESSAGE,
              icon: "ERROR",
            });
          } else if (data?.[0]?.MSG[i]?.O_STATUS === "99") {
            const btnName = await MessageBox({
              messageTitle: data?.[0]?.MSG[i]?.O_MSG_TITLE ?? "Confirmation",
              message: data?.[0]?.MSG[i]?.O_MESSAGE,
              buttonNames: ["Yes", "No"],
              icon: "CONFIRM",
            });
          } else if (data?.[0]?.MSG[i]?.O_STATUS === "9") {
            const btnName = await MessageBox({
              messageTitle: data?.[0]?.MSG[i]?.O_MSG_TITLE ?? "Alert",
              message: data?.[0]?.MSG[i]?.O_MESSAGE,
              icon: "WARNING",
            });
          } else if (data?.[0]?.MSG[i]?.O_STATUS === "0") {
            IntCalDataRef.current = data?.[0];
            getHeaderDTL.mutate({ SCREEN_REF: docCD ?? "" });
          }
        }
        CloseMessageBox();
      },
      onError: async (error: any, variables: any) => {
        await MessageBox({
          messageTitle: "ValidationFailed",
          message: error?.error_msg ?? "Somethingwenttowrong",
          icon: "ERROR",
        });
        IntCalDataRef.current = [];
        getHeaderDTL.mutate({ SCREEN_REF: docCD ?? "" });
      },
    }
  );
  const getHeaderDTL = useMutation(API.getHeaderDTL, {
    onSuccess: async (data: any, variables: any) => {
      reportDTL((prevData) => [
        ...prevData,
        IntCalDataRef.current ? IntCalDataRef.current : [],
        data?.[0],
      ]);
      openReport();
      CloseMessageBox();
    },
    onError: async (error: any, variables: any) => {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: error?.error_msg ?? "Somethingwenttowrong",
        icon: "ERROR",
      });
      reportDTL((prevData) => [
        ...prevData,
        IntCalDataRef.current ? IntCalDataRef.current : [],
        [],
      ]);
      openReport();
    },
  });

  const onSubmitHandler = (data, displayData, endSubmit, setFieldError) => {
    reportDTL((prevData) => [
      ...prevData,
      {
        FROM_DT: data?.FROM_DT
          ? format(new Date(data?.FROM_DT), "dd/MMM/yyyy")
          : "",
        TO_DT: data?.TO_DT ? format(new Date(data?.TO_DT), "dd/MMM/yyyy") : "",
      },
    ]);

    endSubmit(true);

    getInterestCalculateReport.mutate({
      ...reqData,
      WORKING_DATE: authState?.workingDate ?? "",
      USERNAME: authState?.user?.id ?? "",
      USERROLE: authState?.role ?? "",
      FROM_DT: data?.FROM_DT
        ? format(new Date(data?.FROM_DT), "dd/MMM/yyyy")
        : "",
      TO_DT: data?.TO_DT ? format(new Date(data?.TO_DT), "dd/MMM/yyyy") : "",
      GD_DATE: authState?.workingDate ?? "",
      SCREEN_REF: docCD ?? "",
    });
  };

  return (
    <>
      <Dialog
        open={open}
        className="Retrieve"
        PaperProps={{
          style: {
            width: "auto",
            overflow: "auto",
          },
        }}
        onKeyUp={(event) => {
          if (event.key === "Escape") {
            closeDialog();
          }
        }}
        maxWidth="lg"
      >
        <FormWrapper
          key={"dateretrievalForm"}
          metaData={DateRetrievalFormMetaData as MetaDataType}
          onSubmitHandler={onSubmitHandler}
          formStyle={{
            background: "white",
          }}
          initialValues={reqData}
          controlsAtBottom
          containerstyle={{ padding: "10px" }}
          formState={{
            reqData: reqData,
          }}
        >
          {({ isSubmitting, handleSubmit }) => (
            <>
              <GradientButton
                onClick={handleSubmit}
                endIcon={
                  getInterestCalculateReport?.isLoading ||
                  getHeaderDTL?.isLoading ? (
                    <CircularProgress size={20} />
                  ) : null
                }
                disabled={
                  getInterestCalculateReport?.isLoading ||
                  getHeaderDTL?.isLoading ||
                  isSubmitting
                }
              >
                {t("Ok")}
              </GradientButton>
              <GradientButton onClick={() => closeDialog()}>
                {t("Cancel")}
              </GradientButton>
            </>
          )}
        </FormWrapper>
      </Dialog>
    </>
  );
};

type DateRetrivalCustomProps = {
  closeDialog?: any;
  open?: any;
  reqData?: any;
  reportDTL?: any;
  openReport?: any;
};
export const DateRetrival: React.FC<DateRetrivalCustomProps> = ({
  closeDialog,
  open,
  reqData,
  reportDTL,
  openReport,
}) => {
  return (
    <ClearCacheProvider>
      <DateRetrivalCustom
        closeDialog={closeDialog}
        open={open}
        reqData={reqData}
        reportDTL={reportDTL}
        openReport={openReport}
      />
    </ClearCacheProvider>
  );
};
