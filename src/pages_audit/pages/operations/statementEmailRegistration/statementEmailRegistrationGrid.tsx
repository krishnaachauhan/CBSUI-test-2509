import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import { AuthContext } from "pages_audit/auth";
import { format } from "date-fns";
import { enqueueSnackbar } from "notistack";
import { t } from "i18next";
import {
  Alert,
  GridWrapper,
  queryClient,
  ActionTypes,
  utilFunction,
  usePopupContext,
  ClearCacheProvider,
} from "@acuteinfo/common-base";
import {
  DialogProvider,
  useDialogContext,
} from "../payslip-issue-entry/DialogContext";
import { useEnter } from "components/custom/useEnter";
import { StatementEmailRegistrationForm } from "./statementEmailRegistrationForm";
import { gridMetadata } from "./gridMetaData";
import { DateRetrievalDialog } from "components/common/custom/dateRetrievalParaForm/dateRetrievalPara";

const actions: ActionTypes[] = [
  {
    actionName: "add",
    actionLabel: "Add",
    alwaysAvailable: true,
    multiple: undefined,
  },
  {
    actionName: "retrieve",
    actionLabel: "Retrieve",
    alwaysAvailable: true,
    multiple: undefined,
  },
  {
    actionName: "view-details",
    actionLabel: "ViewDetail",
    multiple: false,
    rowDoubleClick: true,
  },
];

const StatementEmailRegistrationGrid = () => {
  const [gridData, setGridData] = useState([]);
  const [open, setOpen] = useState(false);
  const [className, setClassName] = useState("main");
  const [isDataRetrieved, setIsDataRetrieved] = useState(false);

  const [isRetrieveMode, setIsRetrieveMode] = useState(false);

  const isDataChangedRef = useRef(false);
  const initialRender = useRef(true);
  const retrievalParaRef = useRef<any>(null);

  const { authState } = useContext(AuthContext);
  const { MessageBox } = usePopupContext();
  const { commonClass, trackDialogClass, dialogClassNames } =
    useDialogContext();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const newData = commonClass ?? dialogClassNames ?? "main";
    setClassName(newData);
  }, [commonClass, dialogClassNames]);

  const {
    data: initialData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<any, any>(
    ["getstatementEmailRegistrationData", authState?.user?.branchCode],
    () =>
      API.getStatementMailData({
        FROM_DT: authState?.workingDate ?? "",
        TO_DT: authState?.workingDate ?? "",
        COMP_CD: authState?.companyID ?? "",
      }),
    {
      enabled: !isRetrieveMode,
    }
  );

  const retrieveDataMutation = useMutation(API.getStatementMailData, {
    onError: (error: any) => {
      setGridData([]);
      const errorMsg =
        typeof error === "object"
          ? error?.error_msg ?? t("Unknownerroroccured")
          : t("Unknownerroroccured");
      enqueueSnackbar(errorMsg, { variant: "error" });
      handleDialogClose();
    },
    onSuccess: (data) => {
      setGridData([]);
      if (data.length === 1) {
        trackDialogClass("formDlg");
        navigate("view-details", { state: { retrieveData: data[0] } });
      }
      data.length > 0
        ? setGridData(data)
        : MessageBox({
            messageTitle: "Information",
            message: "NoRecordFound",
            buttonNames: ["Ok"],
            icon: "INFO",
          });
      setIsDataRetrieved(data.length > 0);
      if (!data.length) handleDialogClose();
    },
  });

  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getstatementEmailRegistrationData",
        authState?.user?.branchCode,
      ]);
    };
  }, []);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      if (location.pathname === "/EnfinityCore/operation/email-reg-entry") {
        trackDialogClass("formDlg");
        navigate("add");
      }
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (initialData && !isLoading && !isFetching) {
      setGridData(initialData);
      setIsDataRetrieved(false);
    }
  }, [initialData, isLoading, isFetching]);

  const setCurrentAction = useCallback(
    (data) => {
      const { name, rows } = data || {};
      if (name === "add") {
        trackDialogClass("formDlg");
        navigate(name, { state: [] });
        if (retrievalParaRef.current) {
          retrievalParaRef.current = null;
          setIsDataRetrieved(false);
          refetch();
        }
      } else if (name === "retrieve") {
        setIsRetrieveMode(false);
        trackDialogClass("retrieveDlg");
        setOpen(true);
        setGridData([]);
      } else {
        trackDialogClass("formDlg");
        navigate(name, { state: rows });
      }
    },
    [navigate, refetch]
  );

  const handleDialogClose = useCallback(() => {
    navigate(".");
    trackDialogClass("main");
    if (isDataChangedRef.current) {
      if (isDataRetrieved) {
        const { FROM_DATE, TO_DATE } = retrievalParaRef.current || {};
        const formatDate = (date) =>
          utilFunction.isValidDate(date)
            ? format(new Date(date), "dd/MMM/yyyy")
            : authState?.workingDate ?? "";

        retrieveDataMutation.mutate({
          FROM_DT: formatDate(FROM_DATE) ?? "",
          TO_DT: formatDate(TO_DATE) ?? "",
          COMP_CD: authState?.companyID ?? "",
        });
      } else {
        refetch();
      }
    }
    isDataChangedRef.current = false;
  }, [navigate, refetch, isDataRetrieved]);

  const handleClose = () => {
    setOpen(false);
    // setIsRetrieveMode(true);
    trackDialogClass("main");
    if (isDataChangedRef?.current) {
      refetch();
    }
    // if (!isDataRetrieved) refetch();
  };

  const selectedDatas = (dataObj) => {
    setOpen(false);
    trackDialogClass("main");
    if (dataObj) retrievalParaRef.current = dataObj;

    const { FLAG, FROM_DATE, TO_DATE } = retrievalParaRef.current || {};
    const formatDate = (date) =>
      date ? format(new Date(date), "dd/MMM/yyyy") : "";

    retrieveDataMutation.mutate({
      FLAG: FLAG ?? "",
      FROM_DT: formatDate(FROM_DATE) ?? "",
      TO_DT: formatDate(TO_DATE) ?? "",
      COMP_CD: authState?.companyID ?? "",
    });
  };

  useEnter(className);

  return (
    <>
      {isError && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? "Something went to wrong.."}
          errorDetail={error?.error_detail}
          color="error"
        />
      )}
      <GridWrapper
        key={`StatementEmailRegistration${gridData}`}
        finalMetaData={gridMetadata}
        data={gridData ?? []}
        setData={setGridData}
        loading={isLoading || isFetching || retrieveDataMutation?.isLoading}
        actions={actions}
        setAction={setCurrentAction}
        refetchData={refetch}
        enableExport
      />
      <Routes>
        {[
          { path: "view-details/*", view: "view" },
          { path: "add/*", view: "new" },
        ].map(({ path, view }) => (
          <Route
            key={path}
            path={path}
            element={
              <StatementEmailRegistrationForm
                isDataChangedRef={isDataChangedRef}
                closeDialog={handleDialogClose}
                defaultView={view}
                screenFlag="E"
              />
            }
          />
        ))}
      </Routes>
      {open && (
        <DateRetrievalDialog
          handleClose={handleClose}
          retrievalParaValues={selectedDatas}
          defaultData={{
            A_FROM_DT: authState?.workingDate,
            A_TO_DT: authState?.workingDate,
          }}
        />
      )}
    </>
  );
};

export const StatementEmailRegistration = () => (
  <ClearCacheProvider>
    <DialogProvider>
      <div className="main">
        <StatementEmailRegistrationGrid />
      </div>
    </DialogProvider>
  </ClearCacheProvider>
);
