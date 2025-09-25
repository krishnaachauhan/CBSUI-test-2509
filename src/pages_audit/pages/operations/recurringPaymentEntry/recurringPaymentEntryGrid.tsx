import { useRef, useCallback, useContext, useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import { AuthContext } from "pages_audit/auth";
import { RecurringPaymentEntryGridMetaData } from "./recurringPmtEntryGridMetadata";
import RecurringPaymentStepperForm from "./recurringPaymentEntryForm/recurringPaymentStepperForm";
import { RecurringContext } from "./context/recurringPaymentContext";
import { useTranslation } from "react-i18next";
import { RecurringPaymentEntryForm } from "./recurringPaymentEntryForm/recurringPaymentEntryForm";
import {
  usePopupContext,
  queryClient,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  Alert,
  RemarksAPIWrapper,
  LoaderPaperComponent,
  ClearCacheProvider,
} from "@acuteinfo/common-base";
import { Dialog } from "@mui/material";
import { getdocCD } from "components/utilFunction/function";
import { useEnter } from "components/custom/useEnter";
import {
  DialogProvider,
  useDialogContext,
} from "../payslip-issue-entry/DialogContext";

const RecurringPaymentEntryGridMain = () => {
  const navigate = useNavigate();
  const isDataChangedRef = useRef(false);
  const isDeleteDataRef = useRef<any>(null);
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { t } = useTranslation();
  const { getAcctDatafromValApi, updateRecurPmtEntryGridData, resetAllData } =
    useContext(RecurringContext);
  const [deleteMessageBox, setDeleteMessageBox] = useState<boolean>(false);
  const location = useLocation();
  const initialRender = useRef(true);
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const { commonClass, trackDialogClass, dialogClassNames } =
    useDialogContext();
  const [className, setClassName] = useState<string>("main");

  const actions: ActionTypes[] = [
    {
      actionName: "add",
      actionLabel: "Add",
      multiple: undefined,
      rowDoubleClick: false,
      alwaysAvailable: true,
    },
    {
      actionName: "view-details",
      actionLabel: "View Detail",
      multiple: false,
      rowDoubleClick: true,
    },

    {
      actionName: "delete",
      actionLabel: "Delete",
      multiple: false,
      rowDoubleClick: false,
    },
  ];

  //For Enter key
  useEffect(() => {
    const newData =
      commonClass !== null
        ? commonClass
        : dialogClassNames
        ? `${dialogClassNames}`
        : "main";

    setClassName(newData);
  }, [commonClass, dialogClassNames]);

  //Api for readonly flag for entry form
  const {
    data: entryScreenFlagData,
    isLoading: entryScreenFlagLoading,
    isFetching: entryScreenFlagIsFetching,
    isError: entryScreenFlagIsError,
    error: entryScreenFlagError,
    refetch: entryScreenFlagRefetch,
  } = useQuery<any, any>(
    ["getRecurPaymentScreenPara", authState?.user?.branchCode],
    () =>
      API.getRecurPaymentScreenPara({
        companyID: authState?.companyID ?? "",
        branchCode: authState?.user?.branchCode ?? "",
      })
  );

  //Api for get grid data
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(
    ["getRecurPaymentEntryGirdData", authState?.user?.branchCode],
    () =>
      API.getRecurPaymentMst({
        companyID: authState?.companyID ?? "",
        branchCode: authState?.user?.branchCode ?? "",
        TDS_METHOD: entryScreenFlagData?.[0]?.TDS_METHOD ?? "",
        GD_DATE: authState?.workingDate ?? "",
      }),
    { enabled: Boolean(entryScreenFlagData) }
  );

  const refetchData = useCallback(() => {
    entryScreenFlagRefetch().then(() => {
      refetch();
    });
  }, [entryScreenFlagRefetch, refetch]);

  const handleDialogClose: any = useCallback(() => {
    trackDialogClass("main");
    navigate(".");
    if (isDataChangedRef.current === true) {
      refetchData();
      isDataChangedRef.current = false;
    }
    resetAllData();
  }, [navigate]);

  //Mutation for delete recurring payment data
  const entryDeleteMutation = useMutation(API.recurringPaymentEntryDML, {
    onError: async (error: any) => {
      setDeleteMessageBox(false);
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      setDeleteMessageBox(false);
      enqueueSnackbar(t("RecordRemovedMsg"), {
        variant: "success",
      });
      CloseMessageBox();
      navigate(".");
      refetchData();
      handleDialogClose();
    },
  });

  //Mutation for validation before delete entry
  const validateDeleteRecurMutation: any = useMutation(
    "validateDeleteRecurData",
    API.validateDeleteRecurData,
    {
      onSuccess: async (data) => {},
      onError: async (error: any) => {
        CloseMessageBox();
      },
    }
  );

  // Handle action based on user interaction
  const setCurrentAction = useCallback(
    async (data) => {
      if (data?.name === "delete") {
        const row = data?.rows?.[0]?.data;
        isDeleteDataRef.current = data?.rows?.[0]?.data;
        validateDeleteRecurMutation.mutate(
          {
            COMP_CD: row?.COMP_CD ?? "",
            BRANCH_CD: row?.BRANCH_CD ?? "",
            ACCT_TYPE: row?.ACCT_TYPE ?? "",
            ACCT_CD: row?.ACCT_CD ?? "",
            TRAN_CD: row?.TRAN_CD ?? "",
            PAYSLIP: Boolean(row?.PAYSLIP) ? "Y" : "N",
            RTGS_NEFT: Boolean(row?.RTGS_NEFT) ? "Y" : "N",
            SCREEN_REF: docCD,
            STATUS: row?.STATUS ?? "",
            ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
            WORKING_DATE: authState?.workingDate ?? "",
            USERNAME: authState?.user?.id ?? "",
            USERROLE: authState?.role ?? "",
          },
          {
            onSuccess: async (deletValidData) => {
              setDeleteMessageBox(false);
              for (const response of deletValidData ?? []) {
                if (response?.O_STATUS === "999") {
                  await MessageBox({
                    messageTitle: response?.O_MSG_TITLE?.length
                      ? response?.O_MSG_TITLE
                      : "ValidationFailed",
                    message: response?.O_MESSAGE ?? "",
                    icon: "ERROR",
                  });
                } else if (response?.O_STATUS === "9") {
                  await MessageBox({
                    messageTitle: response?.O_MSG_TITLE?.length
                      ? response?.O_MSG_TITLE
                      : "Alert",
                    message: response?.O_MESSAGE ?? "",
                    icon: "WARNING",
                  });
                } else if (response?.O_STATUS === "99") {
                  const buttonName = await MessageBox({
                    messageTitle: response?.O_MSG_TITLE?.length
                      ? response?.O_MSG_TITLE
                      : "Confirmation",
                    message: response?.O_MESSAGE ?? "",
                    buttonNames: ["Yes", "No"],
                    defFocusBtnName: "Yes",
                    icon: "CONFIRM",
                  });
                  if (buttonName === "No") {
                    break;
                  }
                } else if (response?.O_STATUS === "0") {
                  const buttonName = await MessageBox({
                    messageTitle: "Confirmation",
                    message: "DoYouWantDeleteRow",
                    buttonNames: ["Yes", "No"],
                    defFocusBtnName: "Yes",
                    icon: "CONFIRM",
                  });
                  if (buttonName === "Yes") {
                    setDeleteMessageBox(true);
                    trackDialogClass("remarks__wrapper__base");
                  }
                }
              }
            },
          }
        );
      } else if (data?.name === "add") {
        trackDialogClass("recurDlg");
        navigate(data?.name, {
          state: [],
        });
      } else if (data?.name === "view-details") {
        trackDialogClass("recurDlg");
        getAcctDatafromValApi(data?.rows?.[0]?.data);
        isDeleteDataRef.current = data?.rows?.[0]?.data;
        navigate(data?.name, {
          state: data?.rows,
        });
      } else {
        navigate(data?.name, {
          state: data?.rows,
        });
      }
    },
    [navigate]
  );

  useEffect(() => {
    updateRecurPmtEntryGridData(data);
  }, [data]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getRecurPaymentEntryGirdData",
        authState?.user?.branchCode,
      ]);
      queryClient.removeQueries([
        "getRecurPaymentScreenPara",
        authState?.user?.branchCode,
      ]);
    };
  }, []);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      if (
        location.pathname === "/EnfinityCore/operation/recurring-payment-entry"
      ) {
        navigate("add");
        trackDialogClass("recurDlg");
      }
    }
  }, [location.pathname, navigate]);

  useEnter(`${className}`);

  return (
    <>
      {(isError ||
        entryScreenFlagIsError ||
        entryDeleteMutation?.isError ||
        validateDeleteRecurMutation?.isError) && (
        <Alert
          severity="error"
          errorMsg={
            error?.error_msg ||
            entryScreenFlagError?.error_msg ||
            entryDeleteMutation?.error?.error_msg ||
            validateDeleteRecurMutation?.error?.error_msg ||
            t("Somethingwenttowrong")
          }
          errorDetail={
            error?.error_detail ||
            entryScreenFlagError?.error_detail ||
            entryDeleteMutation?.error?.error_detail ||
            validateDeleteRecurMutation?.error?.error_detail ||
            ""
          }
          color="error"
        />
      )}
      <GridWrapper
        key={"recurringPaymentEntryGrid"}
        finalMetaData={RecurringPaymentEntryGridMetaData as GridMetaDataType}
        data={data ?? []}
        setData={() => null}
        loading={
          entryScreenFlagLoading ||
          entryScreenFlagIsFetching ||
          isLoading ||
          isFetching
        }
        actions={actions}
        setAction={setCurrentAction}
        refetchData={() => refetchData()}
        enableExport={true}
      />

      <Routes>
        <Route
          path="add/*"
          element={
            <RecurringPaymentStepperForm
              isDataChangedRef={isDataChangedRef}
              closeDialog={handleDialogClose}
              defaultView={"new"}
              entryScreenFlagData={entryScreenFlagData}
            />
          }
        />
        <Route
          path="view-details/*"
          element={
            <Dialog
              open={true}
              fullWidth={true}
              PaperProps={{
                style: {
                  width: "100%",
                },
              }}
              maxWidth="xl"
              className="recurDlg"
            >
              <RecurringPaymentEntryForm
                closeDialog={handleDialogClose}
                defaultView={"view"}
              />
            </Dialog>
          }
        />
      </Routes>

      {validateDeleteRecurMutation?.isLoading ? (
        <Dialog
          open={true}
          fullWidth={true}
          PaperProps={{
            style: {
              width: "100%",
            },
          }}
          maxWidth="md"
        >
          <LoaderPaperComponent />
        </Dialog>
      ) : null}

      {/*Message box with input for delete entry */}
      {deleteMessageBox && (
        <RemarksAPIWrapper
          TitleText={t("EnterRemovalRemarksForRecurringPaymentEntry", {
            docCD: docCD,
            interpolation: { escapeValue: false },
          })}
          label={"RemovalRemarks"}
          onActionNo={() => {
            trackDialogClass("main");
            setDeleteMessageBox(false);
          }}
          onActionYes={(val, rows) => {
            entryDeleteMutation.mutate({
              isDeleteRow: true,
              ...isDeleteDataRef.current,
              TRAN_AMOUNT: isDeleteDataRef.current?.TRF_AMT,
              ACTIVITY_TYPE: t("RecurringPaymentEntry"),
              REMARKS: t("DeleteFromRecurringPaymentEntry"),
              USER_DEF_REMARKS: val
                ? val
                : t("WRONGENTRYFROMRECURRINGPAYMENTENTRY", {
                    docCD: docCD,
                    interpolation: { escapeValue: false },
                  }),
            });
          }}
          isLoading={entryDeleteMutation?.isLoading}
          isEntertoSubmit={true}
          AcceptbuttonLabelText="Ok"
          CanceltbuttonLabelText="Cancel"
          open={deleteMessageBox}
          rows={isDeleteDataRef.current}
          defaultValue={t("WRONGENTRYFROMRECURRINGPAYMENTENTRY", {
            docCD: docCD,
            interpolation: { escapeValue: false },
          })}
        />
      )}
    </>
  );
};

export const RecurringPaymentEntryGrid = () => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <div className="main">
          <RecurringPaymentEntryGridMain />
        </div>
      </DialogProvider>
    </ClearCacheProvider>
  );
};
