import { Dialog } from "@mui/material";
import React from "react";

import {
  FormWrapper,
  MetaDataType,
  GradientButton,
} from "@acuteinfo/common-base";
import { useLocation } from "react-router-dom";
import { nscDetailFormMetaData } from "./nscFormDetailMetaData";
import { useTranslation } from "react-i18next";

export const NSCFormDetail = ({ navigate }) => {
  const { state: rows }: any = useLocation();
  const { t } = useTranslation();
  return (
    <Dialog
      open={true}
      fullWidth={true}
      PaperProps={{
        style: {
          maxWidth: "1090px",
        },
      }}
    >
      <>
        <FormWrapper
          key={"nscdetailForm"}
          metaData={nscDetailFormMetaData as MetaDataType}
          initialValues={rows?.[0]?.data ?? {}}
          onSubmitHandler={() => {}}
          formStyle={{}}
        >
          {({ isSubmitting, handleSubmit }) => {
            return (
              <GradientButton color="primary" onClick={() => navigate(".")}>
                {t("Close")}
              </GradientButton>
            );
          }}
        </FormWrapper>
      </>
    </Dialog>
  );
};
