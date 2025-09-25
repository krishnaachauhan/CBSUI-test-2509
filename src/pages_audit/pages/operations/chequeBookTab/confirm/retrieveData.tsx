import React, { useContext, useEffect, useRef } from "react";
import { AppBar, Dialog } from "@mui/material";
import { format } from "date-fns";
import { AuthContext } from "pages_audit/auth";
import * as API from "../api";
import { useQuery } from "react-query";
import { chequeBKRetrievalMetadata } from "./retrieveMetadata";
import { useTranslation } from "react-i18next";
import {
  Alert,
  LoaderPaperComponent,
  GradientButton,
  FormWrapper,
  MetaDataType,
} from "@acuteinfo/common-base";

const RetrieveDataCustom = ({ closeDialog, result }) => {
  const { authState } = useContext(AuthContext);
  const { t } = useTranslation();
  const formRef = useRef<any>(null);
  const {
    data: chequeBookFlag,
    isError,
    error,
    isLoading,
  } = useQuery<any, any, any>(["GETRETRIVECHQBKFLAG"], () =>
    API.getChequeBookFlag()
  );
  // API calling for Retrieve Data
  const onSubmitHandler = (data, displayData, endSubmit) => {
    closeDialog();
    result.mutate({
      screenFlag: "chequebookCFM",
      COMP_CD: authState?.companyID,
      BRANCH_CD: authState?.user?.branchCode,
      FROM_DATE: format(new Date(data?.FROM_DATE), "dd-MMM-yyyy"),
      TO_DATE: format(new Date(data?.TO_DATE), "dd-MMM-yyyy"),
      FLAG: data?.FLAG ?? "",
    });

    //@ts-ignore
    endSubmit(true);
  };
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        // closeDialog();
        // event.preventDefault();
        // formRef?.current?.handleSubmit({ preventDefault: () => {} }, "Save");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return (
    <>
      {isLoading ? (
        <LoaderPaperComponent />
      ) : (
        <>
          {isError && (
            <AppBar position="relative" color="primary">
              <Alert
                severity="error"
                errorMsg={error?.error_msg ?? "Unknow Error"}
                errorDetail={error?.error_detail ?? ""}
                color="error"
              />
            </AppBar>
          )}
          <div className="Retrieve">
            <FormWrapper
              key={"Retrieve-data"}
              metaData={chequeBKRetrievalMetadata as MetaDataType}
              initialValues={{
                FLAG: chequeBookFlag?.[0]?.CHQ_PRINT_BUTTON_FLAG === "N" && "B",
              }}
              onSubmitHandler={onSubmitHandler}
              //@ts-ignore
              formStyle={{}}
              ref={formRef}
              controlsAtBottom={true}
              containerstyle={{ padding: "10px" }}
            >
              {({ isSubmitting, handleSubmit }) => (
                <>
                  {!Boolean(isError) && (
                    <GradientButton
                      onClick={(event) => {
                        handleSubmit(event, "Save");
                      }}
                      disabled={isSubmitting}
                      color={"primary"}
                    >
                      {t("Ok")}
                    </GradientButton>
                  )}

                  <GradientButton
                    onClick={closeDialog}
                    color={"primary"}
                    disabled={isSubmitting}
                  >
                    {t("Close")}
                  </GradientButton>
                </>
              )}
            </FormWrapper>
          </div>
        </>
      )}
    </>
  );
};

export const RetrieveData = ({ closeDialog, result, isOpen }) => {
  return (
    <>
      <Dialog
        open={isOpen}
        //@ts-ignore
        PaperProps={{
          style: {
            width: "100%",
          },
        }}
        maxWidth="sm"
      >
        <RetrieveDataCustom closeDialog={closeDialog} result={result} />
      </Dialog>
    </>
  );
};
