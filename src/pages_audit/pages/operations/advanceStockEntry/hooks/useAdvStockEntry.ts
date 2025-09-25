import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery, UseQueryResult } from "react-query";
import { enqueueSnackbar } from "notistack";
import { t } from "i18next";
import { usePopupContext } from "@acuteinfo/common-base";
import { AuthContext } from "pages_audit/auth";
import * as API from "../api";
import { getdocCD } from "components/utilFunction/function";
import { HeaderData } from "../types";

interface RetrievalParams {
  FROM_DATE?: string;
  TO_DATE?: string;
  [key: string]: any;
}

export const useAdvStockEntry = () => {
  const [state, setState] = useState<{
    open: boolean;
    className: string;
    isDataRetrieved: boolean;
    isRetrieveMode: boolean;
    retrievedData: HeaderData[];
    gridData: HeaderData[];
  }>({
    open: false,
    className: "main",
    isDataRetrieved: false,
    isRetrieveMode: false,
    retrievedData: [],
    gridData: [],
  });

  const retrievalParaRef = useRef<RetrievalParams | null>(null);
  const isDataChangedRef = useRef(false);
  const initialRender = useRef(true);

  const { authState } = useContext(AuthContext);
  const { MessageBox } = usePopupContext();
  const location = useLocation();
  const navigate = useNavigate();
  const docCD = getdocCD(location.pathname, authState?.menulistdata);

  const {
    data: initialData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  }: UseQueryResult<HeaderData[], any> = useQuery<HeaderData[], any>(
    ["retrieveStockData", authState?.user?.branchCode],
    () =>
      API.getHeaderData({
        FROM_DT: authState?.workingDate ?? "",
        TO_DT: authState?.workingDate ?? "",
        COMP_CD: authState?.companyID,
        BRANCH_CD: authState?.user?.branchCode,
        ENTERED_BRANCH_CD: authState?.user?.branchCode,
        WORKING_DATE: authState?.workingDate,
        USERNAME: authState?.user?.id ?? "",
        USERROLE: authState?.role ?? "",
        DOC_CD: docCD,
        ACCT_TYPE: "",
        ACCT_CD: "",
      }),
    { enabled: !state.isRetrieveMode }
  );

  const retrieveDataMutation = useMutation(API.getHeaderData, {
    onError: (error: any) => {
      setState((prev) => ({ ...prev, gridData: [] }));
      const errorMsg =
        typeof error === "object"
          ? error?.error_msg ?? t("Unknownerroroccured")
          : t("Unknownerroroccured");
      enqueueSnackbar(errorMsg, { variant: "error" });
      handleDialogClose();
    },
    onSuccess: (data) => {
      setState((prev) => ({
        ...prev,
        retrievedData: data,
        isDataRetrieved: data.length > 0,
      }));
      if (data.length === 1) {
        navigate("view-details", { state: { retrieveData: data[0] } });
      }
      if (!data.length) {
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

  const handleDialogClose = useCallback(() => {
    navigate(".");

    if (isDataChangedRef.current) {
      if (retrievalParaRef.current) {
        retrieveDataMutation.mutate({
          ...retrievalParaRef.current,
        });
      }
    }
    isDataChangedRef.current = false;
  }, [navigate, refetch, state.isDataRetrieved]);

  const setCurrentAction = useCallback(
    (data) => {
      const { name, rows } = data || {};
      if (name === "add") {
        navigate("add", { state: [] });
        retrievalParaRef.current = null;
        setState((prev) => ({ ...prev, isDataRetrieved: false }));
        refetch();
      } else if (name === "retrieve") {
        setState((prev) => ({
          ...prev,
          open: true,
          gridData: [],
          isRetrieveMode: false,
        }));
      } else {
        navigate(name, { state: rows });
      }
    },
    [navigate, refetch]
  );

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      if (location.pathname === "/EnfinityCore/operation/email-reg-entry") {
        navigate("add");
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    if (initialData && !isLoading && !isFetching) {
      setState((prev) => ({
        ...prev,
        gridData: initialData,
        isDataRetrieved: false,
      }));
    }
  }, [initialData, isLoading, isFetching]);

  return {
    state,
    setState,
    refetch,
    isLoading,
    isFetching,
    isError,
    error,
    handleDialogClose,
    setCurrentAction,
    retrieveDataMutation,
    retrievalParaRef,
    isDataChangedRef,
  };
};
