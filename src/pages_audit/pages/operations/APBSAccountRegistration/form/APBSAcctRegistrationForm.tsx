import { AppBar, Dialog } from "@mui/material";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import { useMutation, useQuery } from "react-query";
import * as API from "../api";
import { enqueueSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import {
  usePopupContext,
  GradientButton,
  SubmitFnType,
  utilFunction,
  FormWrapper,
  MetaDataType,
  Alert,
  extractMetaData,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  queryClient,
} from "@acuteinfo/common-base";
import { APBSAcctRegristrationMetadata } from "./metadata";
import { format } from "date-fns";
import JointDetails from "../../DailyTransaction/TRNHeaderTabs/JointDetails";
import { APBSUIDResponseGridMetadata } from "../gridMetadata";
import { getdocCD } from "components/utilFunction/function";

interface APBSAcctRegistrationFormWrapperProps {
  isDataChangedRef: any;
  closeDialog: () => void;
  defaultView: string;
  screenFlag?: string;
}

const actions: ActionTypes[] = [
  {
    actionName: "close",
    actionLabel: "Close",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];
export const APBSAcctRegistrationForm = ({
  isDataChangedRef,
  closeDialog,
  defaultView,
  screenFlag,
}) => {
  const navigate = useNavigate();
  const isErrorFuncRef = useRef<any>(null);
  const [formMode, setFormMode] = useState(defaultView);
  const { state: rows }: any = useLocation();
  const { authState } = useContext(AuthContext);
  const { t } = useTranslation();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [disableButton, setDisableButton] = useState(false);
  const [openUIDResGrid, setOpenUIDResGrid] = useState(false);
  const requestDataRef = useRef<any>(null);
  const myRef = useRef<any>(null);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const shrtctKeysRef = useRef<any>(null);
  const {
    data: UIDdata,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<any, any>(
    ["getAPBSUIDResponseGridData", authState?.user?.branchCode],
    () =>
      API.getAPBSUIDResponse({
        A_LOG_COMP_CD: authState?.companyID ?? "",
        A_LOG_BRANCH_CD: authState?.user?.branchCode ?? "",
        ORG_UNIQUE_ID: rows?.[0]?.data?.ORG_UNIQUE_ID ?? "",
      }),
    { enabled: Boolean(openUIDResGrid) }
  );
  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getAPBSUIDResponseGridData",
        authState?.user?.branchCode,
      ]);
    };
  }, []);

  const mutation = useMutation(API.apbsAcctRegistrationDML, {
    onError: (error: any) => {},
    onSuccess: (data, variables) => {},
  });

  const confirmMutation = useMutation(API.ConfirmAPBSAcctRegistration, {
    onError: (error: any) => {
      CloseMessageBox();
    },
    onSuccess: (data, variables) => {
      enqueueSnackbar(t("FormConfirmationMsg"), {
        variant: "success",
      });
      isDataChangedRef.current = true;
      CloseMessageBox();
      closeDialog();
    },
  });

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    if (Boolean(data["TRAN_DT"])) {
      data["TRAN_DT"] = format(new Date(data["TRAN_DT"]), "dd/MMM/yyyy");
    }
    if (Boolean(data["DEACTIVE_DT"])) {
      data["DEACTIVE_DT"] = format(
        new Date(data["DEACTIVE_DT"]),
        "dd/MMM/yyyy"
      );
    }

    let newData = {
      ...data,
      PREV_IIN_NO: data?.FRESH_REG === "Y" ? "" : data?.PREV_IIN_NO ?? "",
      CUSTOMER_ID: data?.REG_FLAG === "A" ? "" : data?.CUSTOMER_ID ?? "",
      CUSTOMER_NM: data?.REG_FLAG === "A" ? "" : data?.CUSTOMER_NM ?? "",
    };
    let oldData = {
      ...rows?.[0]?.data,
    };
    let upd = utilFunction.transformDetailsData(newData, oldData);
    if (upd._UPDATEDCOLUMNS.length > 0) {
      upd._UPDATEDCOLUMNS = upd._UPDATEDCOLUMNS.filter((field) => {
        if (
          field === "VALIDATE_ACTIVE" ||
          field === "TRAN_CD" ||
          field === "UNIQUE_ID_ORG"
        ) {
          return false;
        }
        if (
          formMode === "edit" &&
          oldData?.MASKED_UNIQUE_ID === newData?.UNIQUE_ID &&
          field === "UNIQUE_ID"
        ) {
          return false;
        }
        return true;
      });
    }

    isErrorFuncRef.current = {
      data: {
        ...newData,
        ...upd,
        ENTERED_BRANCH_CD: authState?.user?.branchCode,
        ENTERED_COMP_CD: authState?.companyID,
        COMP_CD: authState?.companyID,
        LIEN_EXP: "",
        UPLOAD: defaultView === "new" ? "N" : newData?.UPLOAD ?? "",
        ACTIVE: defaultView === "new" ? "Y" : newData?.ACTIVE ?? "",
        UNIQUE_ID:
          formMode === "new"
            ? newData?.UNIQUE_ID ?? ""
            : formMode === "edit" &&
              oldData?.MASKED_UNIQUE_ID === newData?.UNIQUE_ID
            ? oldData?.UNIQUE_ID ?? ""
            : newData?.UNIQUE_ID ?? "",
        PREV_IIN_NO:
          newData?.FRESH_REG === "Y" ? "" : newData?.PREV_IIN_NO ?? "",
        CUSTOMER_ID:
          newData?.REG_FLAG === "A" ? "" : newData?.CUSTOMER_ID ?? "",
        CUSTOMER_NM:
          newData?.REG_FLAG === "A" ? "" : newData?.CUSTOMER_NM ?? "",
      },
      displayData,
      endSubmit,
      setFieldError,
    };
    if (isErrorFuncRef.current?.data?._UPDATEDCOLUMNS.length === 0) {
      setFormMode("view");
    } else {
      const btnName = await MessageBox({
        message: "SaveData",
        messageTitle: "Confirmation",
        buttonNames: ["Yes", "No"],
        loadingBtnName: ["Yes"],
        icon: "CONFIRM",
      });
      if (btnName === "Yes") {
        mutation.mutate(
          {
            ...isErrorFuncRef.current?.data,
            _isNewRow: defaultView === "new" ? true : false,
          },
          {
            onError: (error: any) => {
              CloseMessageBox();
            },
            onSuccess: async (data, variables) => {
              const tranCd = data?.[0]?.TRAN_CD.endsWith(".00")
                ? parseInt(data?.[0]?.TRAN_CD).toString()
                : data?.[0]?.TRAN_CD.toString() ?? "";
              Boolean(variables?._isNewRow)
                ? await MessageBox({
                    messageTitle: "Confirmation",
                    message: `${t("RequestAcceptedRegistrationNo")} ${format(
                      new Date(authState?.workingDate),
                      "yyyy/MMM/dd"
                    )} - ${Boolean(data?.[0]?.TRAN_CD) ? tranCd : ""}`,
                    loadingBtnName: ["Ok"],
                    icon: "INFO",
                  })
                : enqueueSnackbar(t("RecordUpdatedMsg"), {
                    variant: "success",
                  });
              isDataChangedRef.current = true;
              CloseMessageBox();
              closeDialog();
            },
          }
        );
      } else if (btnName === "No") {
        endSubmit(false);
      }
    }
  };

  const handleJointInformationClick = async () => {
    const FormRefData = await myRef?.current?.getFieldData();
    requestDataRef.current = {
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: FormRefData?.BRANCH_CD ?? "",
      ACCT_TYPE: FormRefData?.ACCT_TYPE ?? "",
      ACCT_CD: FormRefData?.ACCT_CD ?? "",
      ACCT_NM: FormRefData?.ACCT_NM ?? "",
      BTN_FLAG: "Y",
    };
    navigate("joint-details");
  };

  const handleButtonDisable = (disable) => {
    setDisableButton(disable);
  };

  let currentPath = useLocation().pathname;
  const label = utilFunction.getDynamicLabel(
    currentPath,
    authState?.menulistdata,
    true
  );
  APBSAcctRegristrationMetadata.form.label = `${
    label ?? ""
  }\u00A0\u00A0||\u00A0 ${t("RegisterFromBranch")}:\u00A0${
    formMode === "new"
      ? authState?.user?.branchCode ?? ""
      : rows?.[0]?.data?.ENTERED_BRANCH_CD ?? ""
  } `;

  const setCurrentAction = useCallback(
    async (data) => {
      if (data?.name === "close") {
        setOpenUIDResGrid(false);
      }
    },
    [navigate]
  );

  const handleRemove = async (event) => {
    const btnName = await MessageBox({
      message: "DoYouWantDeleteRow",
      messageTitle: "Confirmation",
      buttonNames: ["Yes", "No"],
      loadingBtnName: ["Yes"],
      icon: "CONFIRM",
    });
    if (btnName === "Yes") {
      mutation.mutate(
        {
          ...rows?.[0]?.data,
          _isDeleteRow: true,
        },
        {
          onError: (error: any) => {
            CloseMessageBox();
          },
          onSuccess: (data, variables) => {
            enqueueSnackbar(t("RecordRemovedMsg"), {
              variant: "success",
            });
            isDataChangedRef.current = true;
            CloseMessageBox();
            closeDialog();
          },
        }
      );
    }
  };

  return (
    <>
      {(mutation?.isError || confirmMutation?.isError) && (
        <>
          <AppBar position="relative" color="primary">
            <Alert
              severity={
                (mutation?.error?.severity ||
                  confirmMutation?.error?.severity) ??
                "error"
              }
              errorMsg={
                (mutation?.error?.error_msg ||
                  confirmMutation?.error?.error_msg) ??
                "Something went to wrong.."
              }
              errorDetail={
                mutation?.error?.error_detail ||
                confirmMutation?.error?.error_detail
              }
              color="error"
            />
          </AppBar>
        </>
      )}
      <FormWrapper
        key={"APBSAcctRegistrationForm" + formMode}
        metaData={
          extractMetaData(
            APBSAcctRegristrationMetadata,
            formMode
          ) as MetaDataType
        }
        displayMode={formMode}
        onSubmitHandler={onSubmitHandler}
        initialValues={
          formMode === "new"
            ? {
                TRAN_DT: authState?.workingDate ?? "",
              }
            : {
                ...rows?.[0]?.data,
                VALIDATE_ACTIVE: rows?.[0]?.data?.ACTIVE ?? "",
                UNIQUE_ID: rows?.[0]?.data?.MASKED_UNIQUE_ID ?? "",
                UNIQUE_ID_ORG: rows?.[0]?.data?.UNIQUE_ID ?? "",
              }
        }
        formStyle={{
          background: "white",
        }}
        ref={myRef}
        formState={{
          MessageBox: MessageBox,
          docCD: docCD,
          handleButtonDisable: handleButtonDisable,
          formMode: formMode,
          acctDtlReqPara: shrtctKeysRef,
        }}
        setDataOnFieldChange={(action, payload) => {
          if (action === "SHORTCUTKEY_REQPARA") {
            shrtctKeysRef.current = payload;
          }
        }}
      >
        {({ isSubmitting, handleSubmit }) => (
          <>
            {formMode === "edit" ? (
              <>
                {rows?.[0]?.data?.UID_RESP > 0 ? (
                  <GradientButton
                    onClick={(event) => {
                      setOpenUIDResGrid(true);
                    }}
                    color={"primary"}
                  >
                    {t("ViewUIDResponse")}
                  </GradientButton>
                ) : null}
                <GradientButton
                  onClick={handleJointInformationClick}
                  disabled={disableButton}
                  color={"primary"}
                >
                  {t("jointDetails")}
                </GradientButton>
                {rows?.[0]?.data?.ALLOW_DELETE === "Y" ? (
                  <GradientButton
                    onClick={handleRemove}
                    color={"primary"}
                    disabled={disableButton}
                  >
                    {t("Remove")}
                  </GradientButton>
                ) : null}
                <GradientButton
                  onClick={(event) => {
                    handleSubmit(event, "Save");
                  }}
                  disabled={isSubmitting || disableButton}
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
            ) : formMode === "new" ? (
              <>
                <GradientButton
                  onClick={handleJointInformationClick}
                  disabled={disableButton}
                  color={"primary"}
                >
                  {t("jointDetails")}
                </GradientButton>
                <GradientButton
                  onClick={(event) => {
                    handleSubmit(event, "Save");
                  }}
                  disabled={isSubmitting || disableButton}
                  color={"primary"}
                >
                  {t("Save")}
                </GradientButton>

                <GradientButton onClick={closeDialog} color={"primary"}>
                  {t("Close")}
                </GradientButton>
              </>
            ) : screenFlag === "APBSCONF" && formMode === "view" ? (
              <>
                <GradientButton
                  color={"primary"}
                  onClick={async (event) => {
                    if (
                      rows?.[0]?.data?.LAST_ENTERED_BY === authState?.user?.id
                    ) {
                      await MessageBox({
                        messageTitle: "InvalidConfirmation",
                        message: "YouCanNotConfirmYourOwnPostedTransaction",
                        buttonNames: ["Ok"],
                        icon: "ERROR",
                      });
                    } else {
                      const confirmation = await MessageBox({
                        message: "ConfirmRecord",
                        messageTitle: "Confirmation",
                        buttonNames: ["Yes", "No"],
                        loadingBtnName: ["Yes"],
                        icon: "CONFIRM",
                      });
                      if (confirmation === "Yes") {
                        const confirmData = {
                          _isConfirm: true,
                          ENTERED_COMP_CD: authState?.companyID ?? "",
                          ENTERED_BRANCH_CD: authState?.user?.branchCode ?? "",
                          TRAN_CD: rows?.[0]?.data?.TRAN_CD ?? "",
                        };
                        confirmMutation.mutate(confirmData);
                      }
                    }
                  }}
                >
                  {t("Confirm")}
                </GradientButton>
                {rows?.[0]?.data?.ALLOW_DELETE === "Y" ? (
                  <GradientButton onClick={handleRemove} color={"primary"}>
                    {t("Reject")}
                  </GradientButton>
                ) : null}
                <GradientButton onClick={closeDialog} color={"primary"}>
                  {t("Close")}
                </GradientButton>
              </>
            ) : (
              <>
                {rows?.[0]?.data?.UID_RESP > 0 ? (
                  <GradientButton
                    onClick={(event) => {
                      setOpenUIDResGrid(true);
                    }}
                    color={"primary"}
                  >
                    {t("ViewUIDResponse")}
                  </GradientButton>
                ) : null}
                {rows?.[0]?.data?.ALLOW_DELETE === "Y" ? (
                  <GradientButton onClick={handleRemove} color={"primary"}>
                    {t("Remove")}
                  </GradientButton>
                ) : null}
                {rows?.[0]?.data?.EDIT_BUTTON === "Y" ? (
                  <GradientButton
                    onClick={() => {
                      setFormMode("edit");
                    }}
                    color={"primary"}
                  >
                    {t("Edit")}
                  </GradientButton>
                ) : null}
                <GradientButton onClick={closeDialog} color={"primary"}>
                  {t("Close")}
                </GradientButton>
              </>
            )}
          </>
        )}
      </FormWrapper>
      <Routes>
        <Route
          path="joint-details/*"
          element={
            <Dialog
              open={true}
              fullWidth={true}
              PaperProps={{
                style: {
                  maxWidth: "1130px",
                  padding: "5px",
                },
              }}
            >
              <JointDetails
                reqData={
                  Boolean(requestDataRef.current) ? requestDataRef.current : {}
                }
                closeDialog={() => navigate(-1)}
              />
            </Dialog>
          }
        />
      </Routes>
      {openUIDResGrid && (
        <Dialog
          open={true}
          fullWidth={true}
          PaperProps={{
            style: {
              maxWidth: "1130px",
              padding: "5px",
            },
          }}
        >
          {isError && (
            <Alert
              severity="error"
              errorMsg={error?.error_msg ?? "Something went to wrong.."}
              errorDetail={error?.error_detail ?? ""}
              color="error"
            />
          )}
          <GridWrapper
            key={`APBSUIDResponseGridMetadata`}
            finalMetaData={APBSUIDResponseGridMetadata as GridMetaDataType}
            data={UIDdata ?? []}
            setData={() => {}}
            actions={actions}
            loading={isLoading || isFetching}
            setAction={setCurrentAction}
            refetchData={() => refetch()}
          />
        </Dialog>
      )}
    </>
  );
};

export const APBSAcctRegistrationFormWrapper: React.FC<
  APBSAcctRegistrationFormWrapperProps
> = ({ isDataChangedRef, closeDialog, defaultView, screenFlag }) => {
  return (
    <Dialog
      open={true}
      PaperProps={{
        style: {
          width: "100%",
          overflow: "auto",
        },
      }}
      maxWidth="lg"
      className="formDlg"
    >
      <APBSAcctRegistrationForm
        isDataChangedRef={isDataChangedRef}
        closeDialog={closeDialog}
        defaultView={defaultView}
        screenFlag={screenFlag}
      />
    </Dialog>
  );
};
