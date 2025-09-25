import {
  FormWrapper,
  GradientButton,
  MetaDataType,
  SubmitFnType,
  usePopupContext,
} from "@acuteinfo/common-base";
import React, {
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { CircularProgress, Dialog } from "@mui/material";
import i18n from "components/multiLanguage/languagesConfiguration";
import { t } from "i18next";
import { UnclPaymentRetrieveMetaData } from "./UnclPaymentEntryMetaData";
import { getdocCD } from "components/utilFunction/function";
import * as API from "./api";
import { AuthContext } from "pages_audit/auth";
import { useLocation } from "react-router-dom";
import { useEnter } from "components/custom/useEnter";
import { useMutation } from "react-query";

export const UnclPaymentRetrieve = ({
  closeDialog,
  retrievalParaValues,
  setColumnNM,
  columnNM,
}) => {
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const retrieveDataRef = useRef<any>(null);
  const [dataClass, setDataClass] = useState("");
  const [disableButton, setDisableButton] = useState(false);
  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const isDataChangedRef = useRef<any>([]);

  const unclaimdataMutation = useMutation(API.getunclaimdata, {
    onError: async (error: any) => {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      for (const obj of data ?? []) {
        if (obj?.O_STATUS === "999") {
          await MessageBox({
            messageTitle: obj?.O_MSG_TITLE?.length
              ? obj?.O_MSG_TITLE
              : "ValidationFailed",
            message: obj?.O_MESSAGE ?? "",
            icon: "ERROR",
          });
          return;
        }
        // else if (obj?.O_STATUS === "9") {
        //   await MessageBox({
        //     messageTitle: obj?.O_MSG_TITLE?.length ? obj?.O_MSG_TITLE : "Alert",
        //     message: obj?.O_MESSAGE ?? "",
        //     icon: "WARNING",
        //   });
        //   continue;
        // }
        else if (obj?.O_STATUS === "99") {
          const buttonName = await MessageBox({
            messageTitle: obj?.O_MSG_TITLE?.length
              ? obj?.O_MSG_TITLE
              : "Confirmation",
            message: obj?.O_MESSAGE ?? "",
            buttonNames: ["Yes", "No"],
            defFocusBtnName: "Yes",
            icon: "CONFIRM",
          });
          if (buttonName === "No") {
            return;
          }
          if (buttonName === "Yes" && obj?.O_COLUMN_NM === "PAIDDATA") {
            setColumnNM(true);
          }
        } else if (obj?.O_STATUS === "0") {
          unclaimdataMutation.mutate({
            //@ts-ignore
            ...isDataChangedRef.current,
            FOR: "D",
          });
        }
      }
      if (isDataChangedRef?.current?.FOR === "D") {
        closeDialog();
      }
    },
  });

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData: any,
    endSubmit,
    setFieldError
  ) => {
    retrieveDataRef.current = data;
    const reqObj: any = {
      COMP_CD: authState?.companyID,
      BRANCH_CD: authState?.user?.branchCode,
      ACCT_TYPE: data?.ACCT_TYPE,
      ACCT_CD: data?.ACCT_CD,
      CONFIRMED: "N",
      LOGIN_BRANCH: authState.user.branchCode,
      FLAG: data?.FLAG ?? "",
      WORKING_DATE: authState?.workingDate ?? "",
      USERNAME: authState?.user?.id ?? "",
      USERROLE: authState?.role ?? "",
      SCREEN_REF: docCD ?? "",
      DISPLAY_LANGUAGE: i18n.resolvedLanguage,
    };
    isDataChangedRef.current = reqObj;

    unclaimdataMutation.mutate({
      //@ts-ignore
      ...isDataChangedRef.current,
      FOR: "V",
    });
    endSubmit(true);
  };

  const handleButtonDisable = (disable) => {
    setDisableButton(disable);
  };

  useEffect(() => {
    const responseData = unclaimdataMutation?.data;

    if (responseData) {
      const hasError999 = responseData.some(
        (item: any) => item.O_STATUS === "999"
      );

      if (hasError999 && retrieveDataRef?.current) {
        const updatedData = {
          ...retrieveDataRef?.current,
          ACCT_CD: "",
          ACCT_NM: "",
        };

        retrieveDataRef.current = updatedData;

        retrievalParaValues(responseData, updatedData);
      } else {
        retrievalParaValues(responseData, retrieveDataRef?.current);
        closeDialog();
      }
    }
  }, [unclaimdataMutation?.data]);

  useEnter(`${dataClass}`);

  return (
    <Fragment>
      <Dialog
        open={true}
        PaperProps={{
          style: {
            width: "100%",
            overflow: "auto",
          },
        }}
        maxWidth="sm"
      >
        <FormWrapper
          key={"unclaim-payment-retrieve" + columnNM}
          metaData={UnclPaymentRetrieveMetaData as MetaDataType}
          formStyle={{
            background: "white",
          }}
          controlsAtBottom={true}
          onSubmitHandler={onSubmitHandler}
          formState={{
            MessageBox: MessageBox,
            handleButonDisable: handleButtonDisable,
            docCD: docCD,
            acctDtlReqPara: {
              ACCT_CD: {
                ACCT_TYPE: "ACCT_TYPE",
                BRANCH_CD: "BRANCH_CD",
                SCREEN_REF: docCD ?? "",
              },
            },
          }}
        >
          {({ isSubmitting, handleSubmit }) => (
            <>
              <GradientButton
                endIcon={
                  unclaimdataMutation?.isLoading ? (
                    <CircularProgress size={20} />
                  ) : null
                }
                disabled={
                  isSubmitting || disableButton || unclaimdataMutation.isError
                }
                onClick={(event) => {
                  handleSubmit(event, "Save");
                }}
                color={"primary"}
              >
                {t("Ok")}
              </GradientButton>
              <GradientButton
                onClick={closeDialog}
                disabled={isSubmitting}
                color={"primary"}
              >
                {t("Close")}
              </GradientButton>
            </>
          )}
        </FormWrapper>
      </Dialog>
    </Fragment>
  );
};
