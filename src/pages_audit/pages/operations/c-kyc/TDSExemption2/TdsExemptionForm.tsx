import {
  Alert,
  ClearCacheProvider,
  extractMetaData,
  FormWrapper,
  GradientButton,
  InitialValuesType,
  MetaDataType,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { CircularProgress, Dialog } from "@mui/material";
import { TDSAddNewFormMetadata } from "./TDSAddNewFormMetadata";
import { t } from "i18next";
import { useContext, useRef, useState } from "react";
import { AuthContext } from "pages_audit/auth";
import { format } from "date-fns";
import { useMutation } from "react-query";
import { SaveTDSExemption } from "../api";
import { enqueueSnackbar } from "notistack";

const TdsExemptionForm = ({
  defaultView,
  closeForm,
  referenceData,
  enteredFrom,
  rowData,
  setFormmode,
  existingReqCd,
  isModal,
  reqId,
}) => {
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const updateMutation: any = useMutation(SaveTDSExemption, {
    onSuccess: (data) => {
      enqueueSnackbar(`${t("DataSaveSuccessfully")} Req-Cd :- ${data[0]}`, {
        variant: "success",
      });
      closeForm(data[0]);
      CloseMessageBox();
    },
    onError: (error: any) => {
      CloseMessageBox();
    },
  });

  const onFormSubmit = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag,
    hasError
  ) => {
    data.ACTIVE = data?.ACTIVE === true ? "Y" : "N";
    const oldData =
      defaultView === "new"
        ? []
        : [rowData].map((item, index) => ({
            ...item,
            id: defaultView === "new" ? "" : `${index}`,
          }));
    if (defaultView === "new") {
      delete data?.TRAN_CD;
    }

    const newData = [
      {
        ...data,
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        FORM_EXPIRY_DATE: data?.FORM_EXPIRY_DATE
          ? format(new Date(data?.FORM_EXPIRY_DATE), "dd/MMM/yyyy")
          : "",
        RECEIVED_DT: data?.RECEIVED_DT
          ? format(new Date(data?.RECEIVED_DT), "dd/MMM/yyyy")
          : "",
        EFFECTIVE_DT: data?.EFFECTIVE_DT
          ? format(new Date(data?.EFFECTIVE_DT), "dd/MMM/yyyy")
          : "",
        ENTERED_COMP_CD: authState?.companyID ?? "",
        ENTERED_BRANCH_CD: authState?.user?.branchCode ?? "",
        CUSTOMER_ID: referenceData?.CUSTOMER_ID ?? "",
        ENTERED_FROM: enteredFrom ?? "",
      },
    ].map((item, index) => ({
      ...item,
      id: `${index}`,
    }));

    const transformedData = utilFunction.transformDetailDataForDML(
      oldData ?? [],
      newData ?? [],
      ["id"]
    );
    const keysToRemove = ["COMP_CD", "BRANCH_CD", "ENTERED_FROM"];

    const updatedRows = transformedData.isUpdatedRow;

    updatedRows.forEach((row) => {
      if (row._OLDROWVALUE) {
        keysToRemove.forEach((key) => {
          delete row._OLDROWVALUE[key];
        });
      }

      if (Array.isArray(row._UPDATEDCOLUMNS)) {
        row._UPDATEDCOLUMNS = row._UPDATEDCOLUMNS.filter(
          (key) => !keysToRemove.includes(key)
        );
      }
    });

    const isEmpty = (value) =>
      value === null || value === undefined || value === "";

    const finalReqCd = isEmpty(reqId) ? existingReqCd : reqId;

    const payload = {
      IsNewRow: defaultView === "new",
      REQ_CD: finalReqCd,
      REQ_FLAG: referenceData?.CUSTOMER_ID ? "E" : "F",
      ENTRY_TYPE: "",
      COMP_CD: authState?.companyID ?? "",
      SAVE_FLAG: "F",
      CUSTOMER_ID: referenceData?.CUSTOMER_ID ?? "",
      IS_FROM_TDS_EXEMPTION: isEmpty(finalReqCd) ? "Y" : "N",
      TDS_EXEMPTION: {
        DETAILS_DATA: { ...transformedData },
        IsNewRow: defaultView === "new",
        REQ_CD: finalReqCd,
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
      },
    };
    const btnName = await MessageBox({
      message: "AreYouSureToProceed",
      messageTitle: "Confirmation",
      buttonNames: ["Yes", "No"],
      loadingBtnName: ["Yes"],
      icon: "CONFIRM",
    });
    if (btnName === "Yes") {
      updateMutation.mutate({
        ...payload,
      });
    }
    endSubmit(true);
  };

  const renderButtons = (isSubmitting: boolean, handleSubmit: any) => {
    switch (defaultView) {
      case "edit":
        return (
          <>
            <GradientButton
              onClick={(e) => handleSubmit(e, "Save")}
              color="primary"
            >
              {t("Save")}
            </GradientButton>
            <GradientButton onClick={() => setFormmode("view")} color="primary">
              {t("Cancel")}
            </GradientButton>
          </>
        );
      case "new":
        return (
          <>
            <GradientButton
              onClick={(e) => handleSubmit(e, "Save")}
              color="primary"
            >
              {t("Save")}
            </GradientButton>
            <GradientButton onClick={() => closeForm()} color="primary">
              {t("Close")}
            </GradientButton>
          </>
        );
      default:
        return (
          <>
            {rowData?.ACTIVE === "Y" &&
              defaultView === "view" &&
              !Boolean(isModal) && (
                <GradientButton
                  onClick={() => setFormmode("edit")}
                  color="primary"
                >
                  {t("edit")}
                </GradientButton>
              )}
            <GradientButton onClick={() => closeForm()} color="primary">
              {t("Close")}
            </GradientButton>
          </>
        );
    }
  };

  return (
    <Dialog
      open
      maxWidth="xl"
      PaperProps={{
        style: {
          minWidth: "70%",
          width: "80%",
        },
      }}
    >
      {updateMutation?.isError && (
        <Alert
          severity="error"
          errorMsg={
            updateMutation?.error?.error_msg ?? t("Somethingwenttowrong")
          }
          errorDetail={updateMutation?.error?.error_detail}
          color="error"
        />
      )}
      <FormWrapper
        key={"TDSAddNewForm" + defaultView}
        metaData={
          extractMetaData(TDSAddNewFormMetadata, defaultView) as MetaDataType
        }
        onSubmitHandler={onFormSubmit}
        initialValues={
          defaultView === "new"
            ? {}
            : ({
                ...rowData,
                ACTIVE: rowData?.ACTIVE === "Y" ? true : false,
              } as InitialValuesType)
        }
        displayMode={defaultView}
        formStyle={{
          height: "auto",
          overflow: "scroll",
        }}
        formState={{
          WORKING_DATE: authState?.workingDate,
          MessageBox,
          rowData,
          ACTIVE: rowData?.ACTIVE,
        }}
      >
        {({ isSubmitting, handleSubmit }) =>
          renderButtons(isSubmitting, handleSubmit)
        }
      </FormWrapper>
    </Dialog>
  );
};

export const TdsExemptionFormMain = ({
  closeForm,
  defaultView,
  referenceData,
  enteredFrom,
  rowData,
  setFormmode,
  existingReqCd,
  isModal,
  reqId,
}) => (
  <ClearCacheProvider>
    <TdsExemptionForm
      closeForm={closeForm}
      defaultView={defaultView}
      referenceData={referenceData}
      enteredFrom={enteredFrom}
      rowData={rowData}
      setFormmode={setFormmode}
      existingReqCd={existingReqCd}
      isModal={isModal}
      reqId={reqId}
    />
  </ClearCacheProvider>
);
