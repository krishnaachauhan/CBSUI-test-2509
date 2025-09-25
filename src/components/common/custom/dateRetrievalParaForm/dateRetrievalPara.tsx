import { Box, CircularProgress, Dialog } from "@mui/material";
import { useEffect, useRef } from "react";
import {
  SubmitFnType,
  GradientButton,
  FormWrapper,
  MetaDataType,
  InitialValuesType,
} from "@acuteinfo/common-base";
import { useTranslation } from "react-i18next";
import { DateRetrievalMetadata } from "./metaData";

type DateRetrievalDialogProps = {
  handleClose?: any;
  retrievalParaValues?: any;
  defaultData?: any;
};

export const DateRetrievalDialog: React.FC<DateRetrievalDialogProps> = ({
  handleClose,
  retrievalParaValues,
  defaultData,
}) => {
  const { t } = useTranslation();
  const submitFormRef = useRef<any>(null);

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    action
  ) => {
    endSubmit(true);
    retrievalParaValues(data);
    handleClose();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submitFormRef?.current?.handleSubmit(
          { preventDefault: () => {} },
          "Save"
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <Dialog
      open={true}
      PaperProps={{
        style: {
          width: "100%",
          overflow: "auto",
        },
      }}
      maxWidth="xs"
      onKeyUp={(e) => {
        if (e.key === "Escape") {
          handleClose();
        }
      }}
    >
      <FormWrapper
        key={"dateRetrievalMetadata"}
        metaData={DateRetrievalMetadata as MetaDataType}
        onSubmitHandler={onSubmitHandler}
        initialValues={
          {
            FROM_DATE: defaultData?.A_FROM_DT
              ? new Date(defaultData?.A_FROM_DT)
              : new Date(),
            TO_DATE: defaultData?.A_TO_DT
              ? new Date(defaultData?.A_TO_DT)
              : new Date(),
          } as InitialValuesType
        }
        formStyle={{
          background: "white",
        }}
        ref={submitFormRef}
        controlsAtBottom={true}
      >
        {({ isSubmitting, handleSubmit }) => (
          <Box
            sx={{
              width: "100%",
              marginTop: "10px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <GradientButton
              onClick={handleSubmit}
              disabled={isSubmitting}
              color={"primary"}
              endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {t("Ok")}
            </GradientButton>
            <GradientButton onClick={handleClose}>{t("Close")}</GradientButton>
          </Box>
        )}
      </FormWrapper>
    </Dialog>
  );
};
