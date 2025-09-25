import { CircularProgress, Dialog } from "@mui/material";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import { enqueueSnackbar } from "notistack";
import { useMutation, useQuery } from "react-query";
import * as API from "../api";
import { useTranslation } from "react-i18next";
import { InsuranceDetailFormMetaData } from "./insuranceDetailMetadata";
import { format } from "date-fns";
import {
  LoaderPaperComponent,
  RemarksAPIWrapper,
  GradientButton,
  MasterDetailsForm,
  Alert,
  queryClient,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";

export const InsuranceDetailForm = ({
  handleDialogClose,
  defaultView,
  isDataChangedRef,
}) => {
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { t } = useTranslation();
  const myMasterRef = useRef<any>(null);
  const { state: rows }: any = useLocation();
  const [formMode, setFormMode] = useState(defaultView);
  const [isDeleteRemark, SetDeleteRemark] = useState(false);
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const {
    data: mainData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<any, any>(
    ["getInsuranceEntryDetail", rows?.[0]?.data?.TRAN_CD],
    () =>
      API.getInsuranceEntryDetail({
        COMP_CD: rows?.[0]?.data?.COMP_CD,
        BRANCH_CD: rows?.[0]?.data?.BRANCH_CD,
        ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE,
        ACCT_CD: rows?.[0]?.data?.ACCT_CD,
        TRAN_CD: rows?.[0]?.data?.TRAN_CD,
        A_GD_DATE: authState?.workingDate,
      })
  );
  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getInsuranceEntryDetail",
        rows?.[0]?.data?.TRAN_CD,
      ]);
    };
  }, []);
  const deleteInsuranceMutation = useMutation(
    "deleteInsuranceMutation",
    API.doInsuranceDml,
    {
      onError: (error: any) => {
        let errorMsg = "Unknown Error occured";
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
        CloseMessageBox();
        SetDeleteRemark(false);
      },
      onSuccess: (data) => {
        enqueueSnackbar(t("RecordSuccessfullyDeleted"), {
          variant: "success",
        });
        isDataChangedRef.current = true;
        handleDialogClose();
        CloseMessageBox();
        SetDeleteRemark(false);
      },
    }
  );
  const doInsuranceDml: any = useMutation(API.doInsuranceDml, {
    onError: (error: any) => {
      let errorMsg = "Unknown Error occured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      CloseMessageBox();
    },
    onSuccess: (data) => {
      enqueueSnackbar(t("DataUpdatedSuccessfully"), {
        variant: "success",
      });
      isDataChangedRef.current = true;
      CloseMessageBox();
      handleDialogClose();
      CloseMessageBox();
    },
  });
  const validateInsuranceEntryData: any = useMutation(
    API.validateInsuranceEntryData,
    {
      onError: (error: any) => {
        let errorMsg = "Unknown Error occured";
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
      },
      onSuccess: async (data, variables) => {},
    }
  );

  const AddNewRow = () => {
    myMasterRef.current?.addNewRow(true);
  };
  const formatAmount = (value) => {
    return value ? parseFloat(value).toFixed(2) : "0.00";
  };

  const onSubmitHandler = useCallback(
    ({
      data,
      resultValueObj,
      resultDisplayValueObj,
      endSubmit,
      setFieldErrors,
      actionFlag,
    }) => {
      let newData = data;
      if (newData.undefined) {
        // data.OLD_ROW = data.undefined;
        delete newData.undefined;
      }
      newData["RENEWED_FLAG"] = Boolean(newData["RENEWED_FLAG"])
        ? "I"
        : rows?.[0]?.data?.RENEW_FLAG ?? "";

      if (
        data["_UPDATEDCOLUMNS"].length === 0 &&
        data.DETAILS_DATA?.isUpdatedRow?.length === 0
      ) {
        handleDialogClose();
      }
      validateInsuranceEntryData.mutate(
        {
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: authState?.user?.branchCode ?? "",
          ACCT_TYPE: data?.ACCT_TYPE ?? "",
          ACCT_CD: data?.ACCT_CD ?? "",
          INSURANCE_DATE: data?.INSURANCE_DATE
            ? format(new Date(data?.INSURANCE_DATE), "dd/MMM/yyyy")
            : "",
          DUE_DATE: data?.DUE_DATE
            ? format(new Date(data?.DUE_DATE), "dd/MMM/yyyy")
            : "",
          COVER_NOTE: data?.COVER_NOTE ?? "",
          INSURANCE_COMP_CD: data?.INSURANCE_COMP_CD ?? "",
          POLICY_NO: data?.POLICY_NO ?? "",
          INSURANCE_AMOUNT: data?.INSURANCE_AMOUNT ?? "",
          NET_PREMIUM_AMT: data?.NET_PREMIUM_AMOUNT ?? "",
          SERVICE_CHARGE: data?.SERVICE_CHARGE ?? "",
          DTL_DATA:
            data?.DETAILS_DATA?.isUpdatedRow?.length > 0
              ? data?.DETAILS_DATA?.isUpdatedRow
              : data?.DETAILS_DATA?.isNewRow?.length > 0
              ? data?.DETAILS_DATA?.isNewRow
              : mainData?.detailData,
          SCREEN_REF: docCD,
          WORKING_DATE: authState?.workingDate ?? "",
          USERNAME: authState?.user?.id ?? "",
          USERROLE: authState?.role ?? "",
        },
        {
          onSuccess: async (data, variables) => {
            let mutateData = {
              ...newData,
              INSURANCE_DATE: format(
                new Date(newData?.INSURANCE_DATE),
                "dd/MMM/yyyy"
              ),
              DUE_DATE: format(new Date(newData?.DUE_DATE), "dd/MMM/yyyy"),
              TRAN_DT: format(new Date(newData?.TRAN_DT), "dd/MMM/yyyy"),
              COMP_CD: authState?.companyID,
              _isNewRow: formMode === "new" ? true : false,
              _isAllowRenewRow: formMode === "new" ? true : false,
              _isDeleteRow: false,
              _isUpdateRow: formMode === "edit" ? true : false,
              _isConfrimed: false,
            };
            for (let i = 0; i < data?.length; i++) {
              if (data[i]?.O_STATUS === "999") {
                MessageBox({
                  messageTitle: data[i]?.O_MSG_TITLE,
                  message: data[i]?.O_MESSAGE,
                  icon: "ERROR",
                });
              } else if (data[i]?.O_STATUS === "9") {
                MessageBox({
                  messageTitle: data[i]?.O_MSG_TITLE,
                  message: data[i]?.O_MESSAGE,
                  icon: "WARNING",
                });
              } else if (data[i]?.O_STATUS === "99") {
                const buttonName = await MessageBox({
                  messageTitle: data[i]?.O_MSG_TITLE,
                  message: data[i]?.O_MESSAGE,
                  buttonNames: ["Yes", "No"],
                  loadingBtnName: ["Yes"],
                  icon: "CONFIRM",
                });
                if (buttonName === "Yes") {
                  if (formMode === "edit") {
                    newData.RENEWED_FLAG =
                      newData.RENEWED_FLAG === "Y"
                        ? "I"
                        : newData.RENEWED_FLAG === "N"
                        ? rows?.[0]?.data?.RENEW_FLAG ?? ""
                        : newData.RENEWED_FLAG;
                    mutateData = {
                      ...mutateData,
                      TRAN_CD: mainData?.[0]?.TRAN_CD,
                    };
                  }
                  if (formMode === "new") {
                    mutateData = {
                      ...mutateData,
                      RENEWED_FLAG: "Y",
                      ENTERED_BRANCH_CD: authState?.user?.branchCode,
                      ENTERED_COMP_CD: authState?.companyID,
                      OLD_ROW: {
                        BRANCH_CD: newData?.BRANCH_CD,
                        COMP_CD: authState?.companyID,
                        TRAN_CD: mainData?.[0]?.TRAN_CD,
                      },
                      _UPDATEDCOLUMNS: [],
                      _OLDROWVALUE: [],
                    };
                  }
                  doInsuranceDml.mutate(mutateData);
                }
              } else if (data[i]?.O_STATUS === "0") {
                const buttonName = await MessageBox({
                  messageTitle: t("Confirmation"),
                  message: t("ProceedGen"),
                  buttonNames: ["Yes", "No"],
                  loadingBtnName: ["Yes"],
                  icon: "CONFIRM",
                });
                if (buttonName === "Yes") {
                  if (formMode === "edit") {
                    mutateData = {
                      ...mutateData,
                      TRAN_CD: mainData?.[0]?.TRAN_CD,
                    };
                  }
                  if (formMode === "new") {
                    mutateData = {
                      ...mutateData,
                      RENEWED_FLAG: "Y",
                      ENTERED_BRANCH_CD: authState?.user?.branchCode,
                      ENTERED_COMP_CD: authState?.companyID,
                      OLD_ROW: {
                        BRANCH_CD: newData?.BRANCH_CD,
                        COMP_CD: authState?.companyID,
                        TRAN_CD: mainData?.[0]?.TRAN_CD,
                      },
                      _UPDATEDCOLUMNS: [],
                      _OLDROWVALUE: [],
                    };
                  }
                  // console.log("mutateData",mutateData)
                  doInsuranceDml.mutate(mutateData);
                }
              }
            }
          },
        }
      );
      endSubmit(true);
    },
    [formMode]
  );

  InsuranceDetailFormMetaData.masterForm.form.label =
    utilFunction?.getDynamicLabel(currentPath, authState?.menulistdata, false) +
    " " +
    "Status" +
    " " +
    "-" +
    " " +
    mainData?.[0]?.STATUS_DISP;
  const detailsData = mainData?.detailData.map((item) => {
    return {
      ...item,
      _isNewRow: formMode === "new" ? true : false,
    };
  });
  return (
    <>
      <Dialog
        open={true}
        fullWidth={true}
        PaperProps={{
          style: {
            width: "100%",
          },
        }}
        maxWidth="lg"
      >
        {isLoading || isFetching ? (
          <LoaderPaperComponent />
        ) : (
          <>
            {(isError ||
              deleteInsuranceMutation?.isError ||
              doInsuranceDml.isError ||
              validateInsuranceEntryData?.isError) && (
              <Alert
                severity="error"
                errorMsg={
                  error?.error_msg ??
                  deleteInsuranceMutation?.error?.error_msg ??
                  doInsuranceDml?.error?.error_msg ??
                  validateInsuranceEntryData?.error?.error_msg ??
                  "Unknow Error"
                }
                errorDetail={
                  error?.error_detail ??
                  deleteInsuranceMutation?.error?.error_detail ??
                  doInsuranceDml?.error?.error_detail ??
                  validateInsuranceEntryData?.error?.error_detail ??
                  ""
                }
              />
            )}
            <MasterDetailsForm
              key={"InsuranceDetailForm" + formMode}
              metaData={InsuranceDetailFormMetaData}
              displayMode={formMode}
              initialData={{
                _isNewRow: formMode === "new" ? true : false,
                ...mainData?.[0],
                INSURANCE_TYPE_CD:
                  formMode === "new" ? "" : mainData?.[0].INSURANCE_TYPE_CD,
                ALLOW_EDIT: mainData?.[0]?.ALLOW_EDIT,
                INSURANCE_AMOUNT: formatAmount(mainData?.[0]?.INSURANCE_AMOUNT),
                NET_PREMIUM_AMOUNT: formatAmount(
                  mainData?.[0]?.NET_PREMIUM_AMOUNT
                ),
                SERVICE_CHARGE: formatAmount(mainData?.[0]?.SERVICE_CHARGE),
                PREMIUM_AMOUNT: formatAmount(mainData?.[0]?.PREMIUM_AMOUNT),
                ALLOW_RENEW: rows?.[0]?.data?.ALLOW_RENEW,
                WORKING_DATE: authState?.workingDate,
                TRAN_DT:
                  formMode === "new"
                    ? authState.workingDate
                    : mainData?.[0]?.TRAN_DT,
                COVER_NOTE: formMode === "new" ? "" : mainData?.[0]?.COVER_NOTE,
                POLICY_NO: formMode === "new" ? "" : mainData?.[0]?.POLICY_NO,
                // DETAILS_DATA: detailsData
                DETAILS_DATA:
                  detailsData?.length > 0
                    ? detailsData
                    : formMode === "new" || formMode === "edit"
                    ? [
                        {
                          _isNewRow: true,
                        },
                      ]
                    : detailsData,
              }}
              onSubmitData={onSubmitHandler}
              isNewRow={formMode === "new" ? true : false}
              isLoading={isLoading}
              formState={{ MessageBox: MessageBox }}
              ref={myMasterRef}
              formStyle={{
                background: "white",
                height: "43vh",
                overflowY: "auto",
                overflowX: "hidden",
              }}
              onClickActionEvent={(index, id, data) => {
                if (id === "ADDROW") {
                  AddNewRow();
                }
              }}
            >
              {({ isSubmitting, handleSubmit }) => {
                return (
                  <>
                    {formMode === "edit" || formMode === "new" ? (
                      <>
                        {/* <GradientButton
                          onClick={AddNewRow}
                          disabled={isSubmitting}
                          color={"primary"}
                        >
                          {t("AddRow")}
                        </GradientButton> */}
                        <GradientButton
                          onClick={(event) => {
                            handleSubmit(event, "Save");
                          }}
                          disabled={isSubmitting}
                          endIcon={
                            validateInsuranceEntryData?.isLoading ? (
                              <CircularProgress size={20} />
                            ) : null
                          }
                          color={"primary"}
                        >
                          {t("Save")}
                        </GradientButton>
                        <GradientButton
                          onClick={() => {
                            setFormMode("view");
                          }}
                          color={"primary"}
                        >
                          {t("Cancel")}
                        </GradientButton>
                      </>
                    ) : (
                      <>
                        <GradientButton
                          onClick={async () => {
                            if (rows?.[0]?.data?.ALLOW_DELETE === "N") {
                              await MessageBox({
                                messageTitle: t("ValidationFailed"),
                                message: t("BackDatedEntryCantBeDelete"),
                                buttonNames: ["Ok"],
                                icon: "ERROR",
                              });
                            } else {
                              SetDeleteRemark(true);
                            }
                          }}
                          color={"primary"}
                        >
                          {t("Remove")}
                        </GradientButton>
                        {mainData?.[0]?.ALLOW_EDIT === "Y" ? (
                          <GradientButton
                            onClick={() => {
                              setFormMode("edit");
                            }}
                            color={"primary"}
                          >
                            {t("Edit")}
                          </GradientButton>
                        ) : null}
                        {rows?.[0]?.data?.ALLOW_RENEW === "Y" ? (
                          <GradientButton
                            onClick={() => {
                              setFormMode("new");
                            }}
                            color={"primary"}
                          >
                            {t("Renew")}
                          </GradientButton>
                        ) : null}
                        <GradientButton
                          onClick={() => handleDialogClose()}
                          color={"primary"}
                        >
                          {t("Close")}
                        </GradientButton>
                      </>
                    )}
                  </>
                );
              }}
            </MasterDetailsForm>
          </>
        )}
        {isDeleteRemark && (
          <RemarksAPIWrapper
            TitleText={t("EnterRemovalRemarksForInsuranceMaster")}
            onActionNo={() => SetDeleteRemark(false)}
            onActionYes={async (val, rows) => {
              const buttonName = await MessageBox({
                messageTitle: t("Confirmation"),
                message: t("DoYouWantDeleteRow"),
                buttonNames: ["Yes", "No"],
                defFocusBtnName: "Yes",
                loadingBtnName: ["Yes"],
                icon: "CONFIRM",
              });
              if (buttonName === "Yes") {
                deleteInsuranceMutation.mutate({
                  _isNewRow: false,
                  _isDeleteRow: true,
                  _isConfrimed: false,
                  COMP_CD: mainData?.[0]?.COMP_CD,
                  ENTERED_COMP_CD: mainData?.[0]?.ENTERED_COMP_CD,
                  ENTERED_BRANCH_CD: mainData?.[0]?.ENTERED_BRANCH_CD,
                  TRAN_CD: mainData?.[0]?.TRAN_CD,
                  ENTERED_BY: mainData?.[0]?.ENTERED_BY,
                  BRANCH_CD: mainData?.[0]?.BRANCH_CD,
                  ACCT_TYPE: mainData?.[0]?.ACCT_TYPE,
                  ACCT_CD: mainData?.[0]?.ACCT_CD,
                  INSURANCE_AMOUNT: mainData?.[0]?.INSURANCE_AMOUNT,
                  TRAN_DT: mainData?.[0]?.TRAN_DT,
                  CONFIRMED: mainData?.[0]?.CONFIRMED,
                  USER_DEF_REMARKS: val
                    ? val
                    : "WRONG ENTRY FROM INSURANCE ENTRY (RPT/70)",

                  ACTIVITY_TYPE: "INSURANCE ENTRY SCREEN",
                  DETAILS_DATA: {
                    isNewRow: [],
                    isDeleteRow: [...mainData?.detailData],
                    isUpdatedRow: [],
                  },
                });
              }
            }}
            isEntertoSubmit={true}
            AcceptbuttonLabelText="Ok"
            CanceltbuttonLabelText="Cancel"
            open={isDeleteRemark}
            defaultValue={"WRONG ENTRY FROM INSURANCE MASTER"}
            rows={undefined}
          />
        )}
      </Dialog>
    </>
  );
};
