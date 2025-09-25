import { Dialog } from "@mui/material";
import { useContext, useRef } from "react";
import { AuthContext } from "pages_audit/auth";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import {
  SubmitFnType,
  GradientButton,
  FormWrapper,
  MetaDataType,
  utilFunction,
} from "@acuteinfo/common-base";
import { APBSRetriveFormMetadata } from "./metadata";

export const APBSRetrieveForm = ({ closeDialog, retrievalParaValues }) => {
  const { authState } = useContext(AuthContext);
  const { t } = useTranslation();
  const retrieveDataRef = useRef<any>(null);

  const onSubmitHandler: SubmitFnType = (
    data,
    displayData,
    endSubmit,
    setFieldError
  ) => {
    if (Boolean(data)) {
      retrieveDataRef.current = data;
      retrievalParaValues({
        FROM_DT: utilFunction.isValidDate(retrieveDataRef?.current?.FROM_DT)
          ? format(
              new Date(retrieveDataRef?.current?.FROM_DT),
              "dd/MMM/yyyy"
            ) ?? ""
          : authState?.workingDate ?? "",
        TO_DT: utilFunction.isValidDate(retrieveDataRef?.current?.TO_DT)
          ? format(new Date(retrieveDataRef?.current?.TO_DT), "dd/MMM/yyyy") ??
            ""
          : authState?.workingDate ?? "",
      });
    }
  };

  return (
    <>
      <FormWrapper
        key={"APBSRetrieveForm"}
        metaData={APBSRetriveFormMetadata as MetaDataType}
        initialValues={{
          FROM_DT: authState?.workingDate ?? "",
          TO_DT: authState?.workingDate ?? "",
        }}
        onSubmitHandler={onSubmitHandler}
        //@ts-ignore
        formStyle={{
          background: "white",
        }}
        controlsAtBottom={true}
        containerstyle={{ padding: "10px" }}
      >
        {({ isSubmitting, handleSubmit }) => (
          <>
            <GradientButton
              onClick={(event) => {
                handleSubmit(event, "Save");
              }}
              color={"primary"}
            >
              {t("Ok")}
            </GradientButton>
            <GradientButton onClick={closeDialog} color={"primary"}>
              {t("Close")}
            </GradientButton>
          </>
        )}
      </FormWrapper>
    </>
  );
};

export const APBSRetrieveFormWrapper = ({
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
        },
      }}
      maxWidth="sm"
      className="retrieveDlg"
    >
      <APBSRetrieveForm
        closeDialog={closeDialog}
        retrievalParaValues={retrievalParaValues}
      />
    </Dialog>
  );
};
