import { useRef, useContext, useEffect, useState } from "react";
import { useMutation } from "react-query";
import * as API from "../api";
import { AppBar, Dialog, LinearProgress } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import { useTranslation } from "react-i18next";
import { retrieveFormMetaData } from "./retrieveFormMetadata";
import {
  usePopupContext,
  ActionTypes,
  FormWrapper,
  MetaDataType,
  ClearCacheProvider,
  SubmitFnType,
} from "@acuteinfo/common-base";
import { LinearProgressBarSpacer } from "components/common/custom/linerProgressBarSpacer";

const RetrieveDataCustom = ({
  navigate,
  parameter,
  setFormMode,
  setRetrieveData,
  setIsData,
  myRef,
  docCD,
}) => {
  const formRef = useRef<any>(null);
  const { t } = useTranslation();
  const { MessageBox } = usePopupContext();
  const isAcccctValidate = useRef<any>({
    flag: "",
    valid: false,
  });

  const updateFnWrapper =
    (update) =>
    async ({ data }) => {
      return update({
        ...data,
      });
    };
  const mutation: any = useMutation(
    "getRtgsRetrieveData",
    updateFnWrapper(API.retrieveData),
    {
      onSuccess: (data, { endSubmit }: any) => {
        myRef?.current?.handleFormReset({ preventDefault: () => {} });
        if (!data?.length) {
          endSubmit(false, t("NoDataFound") ?? "");
        } else if (Array.isArray(data) && data?.length > 0) {
          navigate(".");
          let updateRetrieveData = data.map((item) => {
            return {
              ...item,
              ACCOUNT_NAME: "",
            };
          });
          setRetrieveData(updateRetrieveData);
          setIsData((old) => ({
            ...old,
            closeAlert: false,
            uniqueNo: Date.now(),
          }));
          setFormMode("view");
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

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    let apiReq = {
      RET_FLAG: data?.A_RET_FLAG ?? "",
      CUSTOMER_ID: data?.CUSTOMER_ID ?? "",
      BRANCH_CD: data?.BRANCH_CD ?? "",
      ACCT_TYPE: data?.ACCT_TYPE ?? "",
      ACCT_CD: data?.ACCT_CD ?? "",
      PARA_602: parameter?.PARA_602 ?? "",
      PARA_610: parameter?.PARA_610 ?? "",
      FROM_DT: data?.A_RET_FLAG === "D" ? data?.FROM_DT ?? "" : "",
      TO_DT: data?.A_RET_FLAG === "D" ? data?.TO_DT ?? "" : "",
      SCREEN_REF: docCD,
    };

    mutation.mutate({
      data: apiReq,
      endSubmit,
    });
    endSubmit(true);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isAcccctValidate?.current?.flag == "A") {
        if (
          typeof isAcccctValidate?.current?.valid === "boolean" &&
          isAcccctValidate?.current?.valid
        ) {
          if (event.key === "Enter") {
            event.preventDefault();
            formRef?.current?.handleSubmit(
              { preventDefault: () => {} },
              "Save"
            );
          }
        } else {
        }
      } else {
        if (event.key === "Enter") {
          event.preventDefault();
          formRef?.current?.handleSubmit({ preventDefault: () => {} }, "Save");
        }
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
              maxWidth: "800px",
              padding: "5px",
            },
          }}
        >
          {mutation?.isLoading ? (
            <LinearProgress color="inherit" />
          ) : (
            <LinearProgressBarSpacer />
          )}
          <FormWrapper
            key={`retrieve-atm-Form`}
            metaData={retrieveFormMetaData as MetaDataType}
            initialValues={{}}
            onSubmitHandler={onSubmitHandler}
            formStyle={{}}
            formState={{
              MessageBox: MessageBox,
              docCD: docCD,
              parameter: parameter,
              isAcccctValidate: isAcccctValidate,
            }}
            onFormButtonClickHandel={(id) => {
              let event: any = { preventDefault: () => {} };
              if (id === "RETRIEVE") {
                formRef?.current?.handleSubmit(event, "RETRIEVE");
              } else if (id === "CANCEL") {
                navigate(".");
              }
            }}
            ref={formRef}
          >
            {({ isSubmitting, handleSubmit }) => <></>}
          </FormWrapper>
        </Dialog>
      </>
    </>
  );
};

export const RetrieveData = ({
  navigate,
  parameter,
  setFormMode,
  setRetrieveData,
  setIsData,
  myRef,
  docCD,
}) => {
  return (
    <ClearCacheProvider>
      <RetrieveDataCustom
        parameter={parameter}
        navigate={navigate}
        setFormMode={setFormMode}
        setRetrieveData={setRetrieveData}
        setIsData={setIsData}
        myRef={myRef}
        docCD={docCD}
      />
    </ClearCacheProvider>
  );
};
