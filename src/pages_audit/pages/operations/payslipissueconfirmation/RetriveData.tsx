import React, { useContext, useRef } from "react";
import { Dialog } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import { format } from "date-fns/esm";
import { RetrievalParameterFormMetaData } from "./RetriveGridMetadata";
import {
  GradientButton,
  FormWrapper,
  MetaDataType,
  usePopupContext,
} from "@acuteinfo/common-base";
import { t } from "i18next";

export const DataRetrival = ({ closeDialog, onUpload }) => {
  const formRef = useRef(null);
  const { authState } = useContext(AuthContext);
  const buttonStateRef = useRef(""); // Use useRef to store button state
  const { MessageBox } = usePopupContext();
  const retrieveDataRef = useRef<any>(null);

  const onSubmitHandler = (data, displayData, endSubmit, setFieldError) => {
    endSubmit(true);

    if (Boolean(data)) {
      retrieveDataRef.current = data;
      onUpload({
        A_LANG: "en",
        ENT_COMP_CD: authState?.companyID ?? "",
        ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
        GD_DATE: authState?.workingDate ?? "",
        FROM_DT: format(new Date(data?.FROM_DT), "dd/MMM/yyyy"),
        TO_DT: format(new Date(data?.TO_DT), "dd/MMM/yyyy"),
        FLAG: buttonStateRef.current,
      });
    }
  };

  const handleRetrieveClick = (handleSubmit) => {
    buttonStateRef.current = "P";
    let event: any = { preventDefault: () => {} };
    handleSubmit(event, "BUTTON_CLICK");
  };

  const handleViewAllClick = (handleSubmit) => {
    buttonStateRef.current = "A";
    let event: any = { preventDefault: () => {} };
    handleSubmit(event, "BUTTON_CLICK");
  };

  return (
    <>
      <Dialog
        open={true}
        fullWidth
        PaperProps={{
          style: {
            width: "auto",
            height: "auto",
          },
        }}
      >
        <FormWrapper
          key={"retrievalParameterForm"}
          metaData={RetrievalParameterFormMetaData as MetaDataType}
          onSubmitHandler={onSubmitHandler}
          formStyle={{
            background: "white",
          }}
          controlsAtBottom
          containerstyle={{ padding: "10px" }}
          ref={formRef}
        >
          {({ isSubmitting, handleSubmit }) => (
            <>
              <GradientButton
                onClick={() => handleRetrieveClick(handleSubmit)} // Trigger "Retrieve"
              >
                {t("viewPending")}
              </GradientButton>
              <GradientButton
                onClick={() => handleViewAllClick(handleSubmit)} // Trigger "ViewAll"
              >
                {t("ViewAll")}
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
