import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  usePopupContext,
  GradientButton,
  FormWrapper,
  MetaDataType,
} from "@acuteinfo/common-base";
import { Dialog } from "@mui/material";
import { LetterOfContinuityBtnMetadata } from "../buttonMetadata/letterOfContBtnMetadata";

export const LetterOfContinuityBtnForm = ({
  closeDialog,
  initialData,
  setGridData,
}) => {
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [formMode, setFormMode] = useState("new");
  const { t } = useTranslation();

  useEffect(() => {
    if (
      typeof initialData === "object" &&
      Object.keys(initialData).length &&
      !initialData?._isNewRow
    ) {
      setFormMode("edit");
    } else {
      setFormMode("new");
    }
  }, []);

  const onSubmitHandler = (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag,
    hasError
  ) => {
    setGridData((old) => {
      const updatedGridData = initialData?.ID_NO
        ? old?.map((item) => {
            if (item.ID_NO && item.ID_NO === initialData?.ID_NO) {
              return {
                ...item,
                ...data,
              };
            }
            return item;
          })
        : [
            ...old,
            {
              ...data,
              ID_NO: Date.now(),
              SR_CD_ID_NO: Date.now(),
              IsNewRow: true,
            },
          ];
      return updatedGridData;
    });
    closeDialog();
    //@ts-ignore
    endSubmit(true);
  };

  return (
    <>
      <Dialog
        open={true}
        PaperProps={{
          style: {
            width: "70%",
            overflow: "auto",
          },
        }}
        maxWidth="md"
      >
        <FormWrapper
          key={"LetterOfContinuityBtnForm" + formMode}
          metaData={LetterOfContinuityBtnMetadata as MetaDataType}
          initialValues={{ ...initialData }}
          onSubmitHandler={onSubmitHandler}
          displayMode={formMode}
          formStyle={{
            background: "white",
          }}
          formState={{
            MessageBox: MessageBox,
          }}
        >
          {({ isSubmitting, handleSubmit }) => (
            <>
              <GradientButton
                onClick={(event) => {
                  handleSubmit(event, "Save");
                }}
                disabled={isSubmitting}
                color={"primary"}
              >
                {t("Save")}
              </GradientButton>
              <GradientButton onClick={closeDialog} color={"primary"}>
                {t("Cancel")}
              </GradientButton>
            </>
          )}
        </FormWrapper>
      </Dialog>
    </>
  );
};
