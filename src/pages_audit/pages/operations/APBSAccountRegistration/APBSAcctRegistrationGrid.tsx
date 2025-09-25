import {
  GridWrapper,
  ActionTypes,
  GridMetaDataType,
  queryClient,
  Alert,
  usePopupContext,
  ClearCacheProvider,
} from "@acuteinfo/common-base";
import { ABPSAcctRegGridMetadata } from "./gridMetadata";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import * as API from "./api";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { APBSAcctRegistrationFormWrapper } from "./form";
import { APBSRetrieveFormWrapper } from "./form/retrieveForm";
import { format } from "date-fns";
import { getdocCD } from "components/utilFunction/function";
import {
  DialogProvider,
  useDialogContext,
} from "../payslip-issue-entry/DialogContext";
import { useEnter } from "components/custom/useEnter";

const actions: ActionTypes[] = [
  {
    actionName: "add",
    actionLabel: "Add",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "retrieve",
    actionLabel: "Retrieve",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "view-details",
    actionLabel: "ViewDetail",
    multiple: false,
    rowDoubleClick: true,
  },
];

const APBSAcctRegistrationGridMain = () => {
  const isDataChangedRef = useRef(false);
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  const retrievalParaRef = useRef<any>(null);
  const [isDataRetrieved, setIsDataRetrieved] = useState(false);
  const [gridData, setGridData] = useState([]);
  const { MessageBox } = usePopupContext();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const [className, setClassName] = useState<any>("main");
  const { commonClass, trackDialogClass, dialogClassNames } =
    useDialogContext();

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

  const {
    data: initialData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<any, any>(
    ["getABPSAcctRegistrationGridData", authState?.user?.branchCode],
    () =>
      API.getAPBSAcctRegistrationData({
        A_LOG_COMP_CD: authState?.companyID ?? "",
        A_LOG_BRANCH_CD: authState?.user?.branchCode ?? "",
        A_BASE_BRANCH: authState?.user?.baseBranchCode ?? "",
        WORKING_DATE: authState?.workingDate ?? "",
        A_FROM_DT: authState?.workingDate ?? "",
        A_TO_DT: authState?.workingDate ?? "",
        A_SCREEN_REF: docCD ?? "",
      })
  );
  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getABPSAcctRegistrationGridData",
        authState?.user?.branchCode,
      ]);
    };
  }, []);

  useEffect(() => {
    if (initialData && !isLoading && !isFetching) {
      setGridData(initialData);
      setIsDataRetrieved(false);
    }
  }, [initialData, isLoading, isFetching]);

  const retrieveDataMutation = useMutation(API.getAPBSAcctRegistrationData, {
    onError: (error: any) => {
      setGridData([]);
      handleDialogClose();
    },
    onSuccess: (data) => {
      setGridData([]);
      if (data.length > 0) {
        setGridData(data);
        setIsDataRetrieved(true);
      } else {
        MessageBox({
          messageTitle: "Information",
          message: "NoRecordFound",
          buttonNames: ["Ok"],
          icon: "INFO",
        });
        handleDialogClose();
      }
    },
  });

  const selectedDatas = (dataObj) => {
    navigate(".");
    if (dataObj) retrievalParaRef.current = dataObj;
    const retrieveData: any = {
      A_LOG_COMP_CD: authState?.companyID ?? "",
      A_LOG_BRANCH_CD: authState?.user?.branchCode ?? "",
      A_BASE_BRANCH: authState?.user?.baseBranchCode ?? "",
      WORKING_DATE: authState?.workingDate ?? "",
      A_FROM_DT: Boolean(retrievalParaRef?.current?.FROM_DT)
        ? format(new Date(retrievalParaRef?.current?.FROM_DT), "dd/MMM/yyyy") ??
          ""
        : authState?.workingDate ?? "",
      A_TO_DT: Boolean(retrievalParaRef?.current?.TO_DT)
        ? format(new Date(retrievalParaRef?.current?.TO_DT), "dd/MMM/yyyy") ??
          ""
        : authState?.workingDate ?? "",
      A_SCREEN_REF: docCD ?? "",
    };
    retrieveDataMutation.mutate(retrieveData);
  };

  const setCurrentAction = useCallback(
    async (data) => {
      if (data?.name === "add") {
        trackDialogClass("formDlg");
        navigate(data?.name, {
          state: [],
        });
        if (Boolean(retrievalParaRef.current)) {
          retrievalParaRef.current = null;
          setIsDataRetrieved(false);
          refetch();
        }
      } else if (data?.name === "retrieve") {
        trackDialogClass("retrieveDlg");
        navigate(data?.name, {
          state: [],
        });
        setGridData([]);
      } else {
        trackDialogClass("formDlg");
        navigate(data?.name, {
          state: data?.rows,
        });
      }
    },
    [navigate]
  );

  useEffect(() => {
    trackDialogClass("formDlg");
    navigate("add");
  }, []);

  const handleClose = () => {
    trackDialogClass("main");
    navigate(".");
    if (!isDataRetrieved) {
      refetch();
    }
  };

  const handleDialogClose = useCallback(() => {
    navigate(".");
    trackDialogClass("main");
    if (isDataChangedRef.current === true) {
      isDataRetrieved
        ? retrieveDataMutation.mutate({
            A_LOG_COMP_CD: authState?.companyID ?? "",
            A_LOG_BRANCH_CD: authState?.user?.branchCode ?? "",
            A_BASE_BRANCH: authState?.user?.baseBranchCode ?? "",
            WORKING_DATE: authState?.workingDate ?? "",
            A_FROM_DT: Boolean(retrievalParaRef?.current?.FROM_DT)
              ? format(
                  new Date(retrievalParaRef?.current?.FROM_DT),
                  "dd/MMM/yyyy"
                ) ?? ""
              : authState?.workingDate ?? "",
            A_TO_DT: Boolean(retrievalParaRef?.current?.TO_DT)
              ? format(
                  new Date(retrievalParaRef?.current?.TO_DT),
                  "dd/MMM/yyyy"
                ) ?? ""
              : authState?.workingDate ?? "",
            A_SCREEN_REF: docCD ?? "",
          })
        : refetch();
    }
    isDataChangedRef.current = false;
  }, [navigate, initialData, refetch]);

  useEnter(`${className}`);

  return (
    <>
      {(isError || retrieveDataMutation?.isError) && (
        <Alert
          severity="error"
          errorMsg={
            (error?.error_msg || retrieveDataMutation?.error?.error_msg) ??
            "Something went to wrong.."
          }
          errorDetail={
            (error?.error_detail ||
              retrieveDataMutation?.error?.error_detail) ??
            ""
          }
          color="error"
        />
      )}
      <GridWrapper
        key={`APBSAcctRegistrationGrid` + gridData}
        finalMetaData={ABPSAcctRegGridMetadata as GridMetaDataType}
        data={gridData ?? []}
        setData={setGridData}
        actions={actions}
        loading={isLoading || isFetching || retrieveDataMutation?.isLoading}
        setAction={setCurrentAction}
        refetchData={() => refetch()}
      />
      <Routes>
        <Route
          path="view-details/*"
          element={
            <APBSAcctRegistrationFormWrapper
              isDataChangedRef={isDataChangedRef}
              closeDialog={handleDialogClose}
              defaultView={"view"}
            />
          }
        />
        <Route
          path="add/*"
          element={
            <APBSAcctRegistrationFormWrapper
              isDataChangedRef={isDataChangedRef}
              closeDialog={handleDialogClose}
              defaultView={"new"}
            />
          }
        />
        <Route
          path="retrieve/*"
          element={
            <APBSRetrieveFormWrapper
              closeDialog={handleClose}
              retrievalParaValues={selectedDatas}
            />
          }
        />
      </Routes>
    </>
  );
};

export const APBSAcctRegistrationGrid = () => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <div className="main">
          <APBSAcctRegistrationGridMain />
        </div>
      </DialogProvider>
    </ClearCacheProvider>
  );
};
