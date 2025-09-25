import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation, QueryClient } from "react-query";
import * as API from "./api";
import { AuthContext } from "pages_audit/auth";
import { useDialogContext } from "pages_audit/pages/operations/payslip-issue-entry/DialogContext";

const queryClient = new QueryClient();

interface PmbyRegMstDataType {
  [key: string]: any;
}

interface UsePmbyRegMstGridProps {
  screenType: string;
  refetch: VoidFunction;
}

interface GetDataToConfirmParams {
  COMP_CD: string;
  BRANCH_CD: string;
  ENTERED_BRANCH_CD: string;
  WORKING_DATE: string;
  USERNAME: string;
  USERROLE: string;
  DOC_CD: string;
  SCREEN_REF: string;
  ACCT_TYPE: string;
  ACCT_CD: string;
  TRAN_CD: string;
  FROM_DT: string;
  TO_DT: string;
  FLAG: string;
}

export const usePmbyRegMstGrid = ({
  screenType,
  refetch,
}: UsePmbyRegMstGridProps) => {
  const [retrievedData, setRetrievedData] = useState<PmbyRegMstDataType[]>([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const retrievalParaRef = useRef<GetDataToConfirmParams | null>(null);
  const isDataChangedRef = useRef(false);
  const initialRender = useRef(true);
  const location = useLocation();

  const { authState } = useContext(AuthContext);
  const { trackDialogClass, commonClass, dialogClassNames } =
    useDialogContext();

  const className = commonClass ?? dialogClassNames ?? "main";

  // Mutation for retrieveData
  const retrieveData = useMutation<
    PmbyRegMstDataType[],
    Error,
    GetDataToConfirmParams
  >(API.getDataToConfirm, {
    onSuccess: (res) => setRetrievedData(res),
    onError: () => {},
    onSettled: (res) => {
      if (res && res.length === 1) {
        trackDialogClass("formDlg");
        navigate("view-details", { state: { retrieveData: res[0] } });
        isDataChangedRef.current = false;
      }
    },
  });

  const refetchModifiedRetrivedData = useCallback(() => {
    if (
      isDataChangedRef.current &&
      retrievalParaRef.current &&
      Object.keys(retrievalParaRef.current).length > 0
    ) {
      retrieveData.mutate({ ...retrievalParaRef.current });
    }
  }, [retrieveData]);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      if (location.pathname === "/EnfinityCore/master/pmby-reg-entry") {
        navigate("add");
        trackDialogClass("formDlg");
      }
    }
  }, [location.pathname, navigate, trackDialogClass]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getPassbookIssueData",
        authState?.user?.branchCode,
      ]);
    };
  }, [authState?.user?.branchCode]);

  const handleDialogClose = useCallback(() => {
    navigate(".");
    trackDialogClass("main");

    if (
      isDataChangedRef.current &&
      (!retrievalParaRef.current ||
        Object.keys(retrievalParaRef.current).length === 0)
    ) {
      refetch();
      isDataChangedRef.current = false;
    }
    refetchModifiedRetrivedData();
  }, [navigate, refetch, trackDialogClass, refetchModifiedRetrivedData]);

  return {
    retrievedData,
    setRetrievedData,
    open,
    setOpen,
    retrievalParaRef,
    isDataChangedRef,
    className,
    retrieveData,
    handleDialogClose,
  };
};
