import { useRef, useContext, useEffect } from "react";
import { useMutation } from "react-query";
import * as API from "../api";
import { CircularProgress, Dialog, Stack } from "@mui/material";
import { FormWrapper, MetaDataType } from "@acuteinfo/common-base";
import { AuthContext } from "pages_audit/auth";
import { useTranslation } from "react-i18next";
import { retrieveFormMetaData } from "./retrieveFormMetadata";
import { ClearCacheProvider, GradientButton } from "@acuteinfo/common-base";

const RetrieveDataCustom = ({ navigate, setFormMode, setRetrieveData }) => {
  const { authState } = useContext(AuthContext);
  const formRef = useRef<any>(null);
  const { t } = useTranslation();

  const updateFnWrapper =
    (update) =>
    async ({ reqdata }) => {
      return update({
        ...reqdata,
      });
    };

  //API calling  for retrieve data
  const mutation: any = useMutation(
    "getRtgsData",
    updateFnWrapper(API.retrieveData),
    {
      onSuccess: (data, { endSubmit }: any) => {
        if (!data?.length) {
          endSubmit(false, t("NoDataFound") ?? "");
        } else if (Array.isArray(data) && data?.length > 0) {
          data[0].RETRIEVE_DATA = "Y";
          setRetrieveData(data);
          navigate(".");
          setTimeout(() => {
            setFormMode("view");
          }, 500);
        }
      },
      onError: (error: any, { endSubmit }: any) => {
        let errorMsg = t("UnknownErrorOccured");
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
        endSubmit(false, errorMsg, error?.error_detail ?? "");
      },
    }
  );

  // for shortcut-key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        formRef?.current?.handleSubmit({ preventDefault: () => {} }, "Save");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return (
    <>
      <>
        <Dialog
          open={true}
          fullWidth={true}
          PaperProps={{
            style: {
              maxWidth: "450px",
              padding: "5px",
            },
          }}
        >
          <FormWrapper
            key={`retrieve-Form`}
            metaData={retrieveFormMetaData as MetaDataType}
            initialValues={{}}
            onSubmitHandler={(data: any, displayData, endSubmit) => {
              endSubmit(true);
              mutation.mutate({
                reqdata: {
                  CUSTOMER_ID: data?.CUSTOMER_ID ?? "",
                  COMP_CD: authState?.companyID,
                },
                endSubmit,
              });
            }}
            formStyle={{
              background: "white",
            }}
            controlsAtBottom={true}
            ref={formRef}
          >
            {({ isSubmitting, handleSubmit }) => (
              <Stack spacing={1.5} direction="row">
                <GradientButton
                  color={"primary"}
                  onClick={(event) => handleSubmit(event, "BUTTON_CLICK")}
                  disabled={isSubmitting || mutation?.isLoading}
                  endIcon={
                    mutation?.isLoading ? <CircularProgress size={20} /> : null
                  }
                >
                  {t("Retrieve")}
                </GradientButton>

                <GradientButton onClick={() => navigate(".")} color={"primary"}>
                  {t("Cancel")}
                </GradientButton>
              </Stack>
            )}
          </FormWrapper>
        </Dialog>
      </>
    </>
  );
};

export const RetrieveData = ({ navigate, setFormMode, setRetrieveData }) => {
  return (
    <ClearCacheProvider>
      <RetrieveDataCustom
        navigate={navigate}
        setFormMode={setFormMode}
        setRetrieveData={setRetrieveData}
      />
    </ClearCacheProvider>
  );
};
