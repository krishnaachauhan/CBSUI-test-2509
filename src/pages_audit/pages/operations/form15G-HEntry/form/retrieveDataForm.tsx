import { AppBar, CircularProgress, Dialog } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "pages_audit/auth";
import { useQuery } from "react-query";
import * as API from "../api";
import { RetrievalParameterFormMetaData } from "../form/metaData";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Form15GHEntryWrapper } from "../form";
import {
  queryClient,
  Alert,
  usePopupContext,
  LoaderPaperComponent,
  SubmitFnType,
  GradientButton,
  FormWrapper,
  MetaDataType,
  utilFunction,
} from "@acuteinfo/common-base";

export const RetrievalParameters = ({ closeDialog, retrievalParaValues }) => {
  const { authState } = useContext(AuthContext);
  const customerIdRef: any = useRef({});
  const okButtonRef = useRef<any>(null);
  const { t } = useTranslation();

  const {
    data: initialData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery(["getFinDate"], () =>
    API.getFinDate({
      GD_DATE: authState?.workingDate,
    })
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getFinDate"]);
    };
  }, []);

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData: any,
    endSubmit,
    setFieldError
  ) => {
    endSubmit(true);
    if (data?.A_CUSTOM_USER_NM && data?.FROM_DT && data?.TO_DT) {
      customerIdRef.current = data;
      retrievalParaValues({
        FROM_DT: customerIdRef.current.FROM_DT ?? "",
        TO_DT: customerIdRef.current.TO_DT ?? "",
        A_CUSTOM_USER_NM: customerIdRef.current.A_CUSTOM_USER_NM ?? "",
        TRAN_TYPE: initialData?.[0]?.TRAN_TYPE ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        COMP_CD: authState?.companyID ?? "",
      });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (okButtonRef.current) {
        okButtonRef.current.click?.();
      }
    }
  };

  return (
    <>
      {isLoading || isFetching ? (
        <div style={{ width: "600px", height: "100px" }}>
          <LoaderPaperComponent />
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            padding: "5px",
          }}
          onKeyDown={handleKeyDown}
        >
          {isError && (
            <div style={{ marginBottom: "10px" }}>
              <AppBar position="relative" color="primary">
                <Alert
                  severity="error"
                  // @ts-ignore
                  errorMsg={error.error_msg ?? "Something went wrong.."}
                  // @ts-ignore
                  errorDetail={error?.error_detail}
                  color="error"
                />
              </AppBar>
            </div>
          )}
          <FormWrapper
            key={"retrievalParameterForm" + initialData}
            metaData={RetrievalParameterFormMetaData as MetaDataType}
            initialValues={{
              FROM_DT: initialData?.[0]?.FROM_DT,
              TO_DT: initialData?.[0]?.TO_DT,
            }}
            onSubmitHandler={onSubmitHandler}
            // isLoading={true}
            //@ts-ignore
            formStyle={{
              background: "white",
            }}
            controlsAtBottom={true}
            containerstyle={{ padding: "2px" }}
          >
            {({ isSubmitting, handleSubmit }) => (
              <>
                <GradientButton
                  onClick={(event) => {
                    handleSubmit(event, "Save");
                  }}
                  disabled={isSubmitting}
                  color={"primary"}
                  ref={okButtonRef}
                >
                  {t("Ok")}
                </GradientButton>
                <GradientButton onClick={closeDialog} color={"primary"}>
                  {t("Close")}
                </GradientButton>
              </>
            )}
          </FormWrapper>
        </div>
      )}
    </>
  );
};

export const RetrievalParametersFormWrapper = ({
  closeDialog,
  retrievalParaValues,
}) => {
  return (
    <Dialog
      open={true}
      PaperProps={{
        style: {
          width: "100%",
          overflow: "auto",
          position: "absolute",
          top: 100,
          margin: 0,
        },
      }}
      maxWidth="sm"
      className="retrDlg"
    >
      <RetrievalParameters
        closeDialog={closeDialog}
        retrievalParaValues={retrievalParaValues}
      />
    </Dialog>
  );
};
