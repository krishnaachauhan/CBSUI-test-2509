import {
  useRef,
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { useMutation, useQuery } from "react-query";
import * as API from "../recurringPaymentEntry/api";
import { AuthContext } from "pages_audit/auth";
import { useTranslation } from "react-i18next";
import {
  usePopupContext,
  queryClient,
  GridWrapper,
  GridMetaDataType,
  Alert,
  ActionTypes,
  RemarksAPIWrapper,
  LoaderPaperComponent,
  ClearCacheProvider,
  utilFunction,
} from "@acuteinfo/common-base";
import { RecurringPaymentConfirmation } from "../recurringPaymentConfirmation/recurringPaymentConfirmation";
import { RecurringPaymentEntryGridMetaData } from "../recurringPaymentEntry/recurringPmtEntryGridMetadata";
import { Dialog } from "@mui/material";
import { useEnter } from "components/custom/useEnter";
import {
  DialogProvider,
  useDialogContext,
} from "../payslip-issue-entry/DialogContext";
import { cloneDeep } from "lodash";
import { getdocCD } from "components/utilFunction/function";

const actions: ActionTypes[] = [
  {
    actionName: "view-details",
    actionLabel: "View Detail",
    multiple: false,
    rowDoubleClick: true,
  },
  {
    actionName: "viewAll",
    actionLabel: "ViewAll",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
    shouldExclude: (rows) => false,
  },
];

const RecurringPaymentEntryConfGridMain = () => {
  const navigate = useNavigate();
  const isDataChangedRef = useRef(false);
  const isDeleteDataRef = useRef<any>(null);
  const { authState } = useContext(AuthContext);
  const { CloseMessageBox } = usePopupContext();
  const { t } = useTranslation();
  const [deleteMessageBox, setDeleteMessageBox] = useState<boolean>(false);
  const [displayAction, setDisplayAction] = useState<string>("P");
  const [displayStatus, setDisplayStatus] = useState("Pending Entries");
  const [gridData, setGridData] = useState([]);
  const [actionMenu, setActionMenu] = useState<any>(actions);
  const [className, setClassName] = useState<string>("main");
  const { commonClass, trackDialogClass, dialogClassNames } =
    useDialogContext();
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);
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
    {
      enabled: Boolean(entryScreenFlagData),
      onSuccess: (data) => {
        if (displayAction === "V") {
          setGridData(data);
        } else if (displayAction === "P") {
          const filterData = data.filter((item) => item.ALLOW_CONFIRM === "Y");
          setGridData(filterData);
        } else {
          setGridData(data);
        }
      },
    }
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
      if (data?.name === "view-details") {
        trackDialogClass("recurConfFormDlg");
        isDeleteDataRef.current = data?.rows?.[0]?.data;
        navigate(data?.name, {
          state: data?.rows,
        });
      } else if (data?.name === "viewAll") {
        setActionMenu((values) =>
          values.map((item) =>
            item.actionName === "viewAll"
              ? { ...item, actionName: "pending", actionLabel: "Pending" }
              : item
          )
        );
        setDisplayAction("V");
        setDisplayStatus("All Entries");
        refetch();
      } else if (data?.name === "pending") {
        setActionMenu((values) =>
          values.map((item) =>
            item.actionName === "pending"
              ? { ...item, actionName: "viewAll", actionLabel: "ViewAll" }
              : item
          )
        );
        setDisplayAction("P");
        setDisplayStatus("Pending Entries");
        refetch();
      } else {
        navigate(data?.name, {
          state: data?.rows,
        });
      }
    },
    [navigate]
  );

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

  //Set the header title for the dynamically generating it based on status
  const memoizedMetadata = useMemo(() => {
    // Dynamically set the grid label
    const label = utilFunction?.getDynamicLabel(
      currentPath,
      authState?.menulistdata,
      true
    );
    const metadata = cloneDeep(RecurringPaymentEntryGridMetaData);
    metadata.gridConfig.gridLabel = `${label} - ${displayStatus}`;
    return metadata;
  }, [displayStatus, authState?.menulistdata, currentPath]);

  useEnter(`${className}`);

  return (
    <>
      {(isError || entryScreenFlagIsError) && (
        <Alert
          severity="error"
          errorMsg={
            error?.error_msg ||
            entryScreenFlagError?.error_msg ||
            t("Somethingwenttowrong")
          }
          errorDetail={
            error?.error_detail || entryScreenFlagError?.error_detail || ""
          }
          color="error"
        />
      )}
      <GridWrapper
        key={"recurringPaymentEntryGrid" + actionMenu + displayAction}
        finalMetaData={memoizedMetadata as GridMetaDataType}
        data={gridData ?? []}
        setData={setGridData}
        loading={
          entryScreenFlagLoading ||
          entryScreenFlagIsFetching ||
          isLoading ||
          isFetching
        }
        actions={actionMenu}
        setAction={setCurrentAction}
        refetchData={() => refetchData()}
        enableExport={true}
      />

      <Routes>
        <Route
          path="view-details/*"
          element={
            <RecurringPaymentConfirmation
              handleDialogClose={handleDialogClose}
              isDataChangedRef={isDataChangedRef}
              setDeleteMessageBox={setDeleteMessageBox}
              validateDeleteRecurMutation={validateDeleteRecurMutation}
              entryDeleteMutation={entryDeleteMutation}
            />
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
          TitleText={t("EnterRemovalRemarksForRecurringPaymentConfirmation", {
            docCD: docCD,
            interpolation: { escapeValue: false },
          })}
          label={"RemovalRemarks"}
          onActionNo={() => {
            trackDialogClass("recurConfFormDlg");
            setDeleteMessageBox(false);
          }}
          onActionYes={(val, rows) => {
            entryDeleteMutation.mutate({
              isDeleteRow: true,
              ...isDeleteDataRef.current,
              TRAN_AMOUNT: isDeleteDataRef.current?.TRF_AMT ?? "",
              ACTIVITY_TYPE: t("RecurringPaymentConfirmation"),
              REMARKS: t("DeleteFromRecurringPaymentConfirmation"),
              USER_DEF_REMARKS: val
                ? val
                : t("WRONGENTRYFROMRECURRINGPAYMENTCONFIRMATION", {
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
          defaultValue={t("WRONGENTRYFROMRECURRINGPAYMENTCONFIRMATION", {
            docCD: docCD,
            interpolation: { escapeValue: false },
          })}
        />
      )}
    </>
  );
};

export const RecurringPaymentEntryConfGrid = () => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <div className="main">
          <RecurringPaymentEntryConfGridMain />
        </div>
      </DialogProvider>
    </ClearCacheProvider>
  );
};
