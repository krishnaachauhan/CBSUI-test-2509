import {
  ActionTypes,
  Alert,
  ClearCacheProvider,
  extractGridMetaData,
  GridMetaDataType,
  GridWrapper,
  queryClient,
  usePopupContext,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
import { format } from "date-fns";
import { AuthContext } from "pages_audit/auth";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery } from "react-query";
import { useLocation } from "react-router-dom";
import * as API from "./api";
import { DataRetrieval } from "./dataRetrieval";
import { MultipleAcctCloserGridMetaData } from "./multipleAcctCloseMetadata";
import { useTranslation } from "react-i18next";

const defaultActions: ActionTypes[] = [
  {
    actionName: "retrieve",
    actionLabel: "Retrieve",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];
const actions: ActionTypes[] = [
  {
    actionName: "procced",
    actionLabel: "ProceedSelected",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "selectAll",
    actionLabel: "SelectAllForClose",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];

export const MultipleAcctCloseMain = () => {
  const [gridData, setGridData] = useState<any>([]);
  const [conditionalActions, setConditionalActions] = useState(actions);
  const [gridReqData, setGridReqData] = useState<any>({});
  const [isOpenRetrieve, setOpenRetrieve] = useState(true);
  const [Mode, setMode] = useState("edit");
  const [count, setCount] = useState(0);

  const { authState } = useContext(AuthContext);
  const { MessageBox } = usePopupContext();
  const docCD = getdocCD(useLocation()?.pathname, authState?.menulistdata);

  const myGridRef = useRef<any>(null);
  const oldGridDataRef = useRef<any>([]);
  const declineRef = useRef<Boolean>(false);
  const closeCountRef = useRef(0);
  const { t } = useTranslation();

  const hasRequiredFields = Boolean(
    gridReqData?.ASON_DT &&
      gridReqData?.USERROLE &&
      gridReqData?.COMP_CD &&
      gridReqData?.BRANCH_CD &&
      gridReqData?.ACCT_TYPE
  );

  const { isLoading, isFetching, refetch, error, isError } = useQuery<any, any>(
    ["getAccountCloseList", authState?.user?.branchCode],
    () => API?.getAccountCloseList(gridReqData),
    {
      enabled: hasRequiredFields,
      onSuccess: (fetchedData) => {
        setGridData(fetchedData || []);
        oldGridDataRef.current = fetchedData;
        setMode("edit");
        declineRef.current = false;
        closeCountRef.current = 0;
      },
    }
  );

  const setCurrentAction = useCallback(async (data) => {
    if (data?.name === "retrieve") {
      setGridData([]);
      setGridReqData({});
      setMode("edit");
      setOpenRetrieve(true);
      closeCountRef.current = 0;
      declineRef.current = false;
    } else if (data?.name === "selectAll") {
      if (Boolean(declineRef?.current)) return;
      setGridData((prevData) =>
        prevData?.map((item) => ({
          ...item,
          STATUS: "C",
        }))
      );
      setConditionalActions((values) =>
        values.map((item) =>
          item.actionName === "selectAll"
            ? {
                ...item,
                actionName: "DeselectAll",
                actionLabel: "DeselectAll",
              }
            : item
        )
      );
    } else if (data?.name === "DeselectAll") {
      if (Boolean(declineRef?.current)) return;
      setGridData((prevData) =>
        prevData?.map((item) => ({
          ...item,
          STATUS: "O",
        }))
      );
      setConditionalActions((values) =>
        values.map((item) =>
          item.actionName === "DeselectAll"
            ? {
                ...item,
                actionName: "selectAll",
                actionLabel: "SelectAllForClose",
              }
            : item
        )
      );
    } else if (data?.name === "procced") {
      const updatedRows = myGridRef?.current
        ?.cleanData(true)
        ?.filter((row: any) => row?.STATUS === "C");
      if (Boolean(declineRef?.current)) return;
      if (updatedRows?.length <= 0) return;

      setGridData(updatedRows);
      const btnName = await MessageBox({
        messageTitle: "Confirmation",
        message: `${t(`AreyousuretoCloseAccount`, {
          length: updatedRows?.length,
        })}`,
        buttonNames: ["Yes", "No"],
        icon: "CONFIRM",
      });

      if (btnName === "Yes") {
        setMode("view");
        for (let i = 0; i < updatedRows?.length; i++) {
          setCount((prev) => prev + 1);
          try {
            const reqParameters = {
              COMP_CD: updatedRows?.[i]?.COMP_CD ?? "",
              BRANCH_CD: updatedRows?.[i]?.BRANCH_CD ?? "",
              ACCT_TYPE: updatedRows?.[i]?.ACCT_TYPE ?? "",
              ACCT_CD: updatedRows?.[i]?.ACCT_CD ?? "",
              CONF_BAL: updatedRows?.[i]?.CONF_BAL ?? "0",
              TRAN_BAL: updatedRows?.[i]?.TRAN_BAL ?? "0",
              NPA_CD: updatedRows?.[i]?.NPA_CD ?? "",
              LST_INT_COMPUTE_DT: updatedRows?.[i]?.LST_INT_COMPUTE_DT
                ? format(
                    new Date(updatedRows?.[i]?.LST_INT_COMPUTE_DT),
                    "dd/MMM/yyyy"
                  )
                : "",
              OP_DATE: updatedRows?.[i]?.OP_DATE
                ? format(new Date(updatedRows?.[i]?.OP_DATE), "dd/MMM/yyyy")
                : "",
              CUSTOMER_ID: updatedRows?.[i]?.CUSTOMER_ID ?? "",
              SCREEN_REF: docCD ?? "",
              INDEX: updatedRows?.[i]?.INDEX ?? "",
              IS_LAST: Boolean(i === updatedRows?.length - 1),
              WORKING_DATE: authState?.workingDate ?? "",
              USERNAME: authState?.user?.id ?? "",
              USERROLE: authState?.role ?? "",
            };

            setGridData((preRow) => {
              return preRow?.map((row) => {
                if (row?.INDEX === updatedRows?.[i]?.INDEX) {
                  return {
                    ...row,
                    FLAG: "Y",
                  };
                }
                return row;
              });
            });

            const data = await API?.multipleAccountCloseValidation(
              reqParameters
            );

            for (let i = 0; i < data?.length; i++) {
              if (data?.[i]?.O_STATUS === "999") {
                const btnName = await MessageBox({
                  messageTitle: data?.[i]?.O_MSG_TITLE ?? "ValidationFailed",
                  message: data?.[i]?.O_MESSAGE,
                  icon: "ERROR",
                  buttonNames: ["Ok"],
                });
                if (btnName === "Ok") {
                  setGridData((prev) =>
                    prev?.map((item) => ({
                      ...item,
                      STATUS:
                        item?.INDEX === reqParameters?.INDEX
                          ? "O"
                          : item.STATUS,
                      FLAG:
                        item?.INDEX === reqParameters?.INDEX ? "N" : item?.FLAG,
                    }))
                  );
                }
              } else if (data?.[i]?.O_STATUS === "99") {
                const btnName = await MessageBox({
                  messageTitle: data?.[i]?.O_MSG_TITLE ?? "Confirmation",
                  message: data?.[i]?.O_MESSAGE,
                  buttonNames: ["Yes", "No"],
                  defFocusBtnName: "Yes",
                  icon: "CONFIRM",
                });
                if (btnName === "No") {
                  setGridData((prev) =>
                    prev?.map((item) => ({
                      ...item,
                      STATUS:
                        item?.INDEX === reqParameters?.INDEX
                          ? "O"
                          : item.STATUS,
                      FLAG:
                        item?.INDEX === reqParameters?.INDEX ? "N" : item?.FLAG,
                    }))
                  );
                  break;
                }
              } else if (data?.[i]?.O_STATUS === "9") {
                const btnName = await MessageBox({
                  messageTitle: data?.[i]?.O_MSG_TITLE ?? "Alert",
                  message: data?.[i]?.O_MESSAGE,
                  icon: "WARNING",
                  buttonNames: ["Ok"],
                });
              } else if (data?.[i]?.O_STATUS === "0") {
                const acctClose: any = await API?.multipleAccountClose({
                  CLOSEACCT_LIST: [
                    {
                      COMP_CD: reqParameters?.COMP_CD ?? "",
                      BRANCH_CD: reqParameters?.BRANCH_CD ?? "",
                      ACCT_TYPE: reqParameters?.ACCT_TYPE ?? "",
                      ACCT_CD: reqParameters?.ACCT_CD ?? "",
                      CLOSE_DT: authState?.workingDate ?? "",
                      IS_LAST: reqParameters?.IS_LAST ?? "",
                      INDEX: reqParameters?.INDEX ?? "",
                    },
                  ],
                });
                if (acctClose?.status === "0") {
                  setGridData((prev) =>
                    prev?.map((item) => ({
                      ...item,
                      FLAG:
                        item?.INDEX === reqParameters?.INDEX ? "N" : item?.FLAG,
                    }))
                  );
                  closeCountRef.current += 1;
                } else {
                  await MessageBox({
                    messageTitle: "ValidationFailed",
                    message: `${acctClose?.message}`,
                    icon: "ERROR",
                  });
                  setGridData((prev) =>
                    prev?.map((item) => ({
                      ...item,
                      STATUS:
                        item?.INDEX === reqParameters?.INDEX
                          ? "O"
                          : item.STATUS,
                      FLAG:
                        item?.INDEX === reqParameters?.INDEX ? "N" : item?.FLAG,
                    }))
                  );
                }
              }
            }

            if (Boolean(reqParameters?.IS_LAST)) {
              if (closeCountRef?.current > 0) {
                await MessageBox({
                  messageTitle: "AccountClosed",
                  message: `${t(`AccountClosedSuccessfully`, {
                    CloseCount: closeCountRef?.current,
                  })}`,
                  icon: "SUCCESS",
                });
                setGridData(
                  myGridRef?.current
                    ?.cleanData(true)
                    ?.filter((row: any) => row?.STATUS === "C")
                );
                declineRef.current = true;
              } else {
                setMode("edit");
                setGridData(oldGridDataRef?.current);
              }
            } else {
            }
          } catch (error) {
            console.error("Account validation failed:", error);
            break;
          }
        }
      } else if (btnName === "No") {
        const oldData = oldGridDataRef?.current || [];
        const newData = myGridRef?.current?.cleanData(true) || [];
        const updatedData = oldData?.map((oldRow) => {
          const newRow = newData?.find(
            (newRow) => newRow?.INDEX === oldRow?.INDEX
          );
          if (newRow) {
            if (JSON?.stringify(newRow) !== JSON?.stringify(oldRow)) {
              return { ...oldRow, STATUS: "C" };
            }
          } else {
            return { ...oldRow, STATUS: "O" };
          }
          return oldRow;
        });
        setGridData(updatedData);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      queryClient?.removeQueries([
        "getAccountCloseList",
        authState?.user?.branchCode,
      ]);
    };
  }, []);

  useEffect(() => {
    setGridData((prevRows) => {
      return prevRows?.map((row: any) => {
        if (row?.STATUS === "C") {
          return {
            ...row,
            _rowColor: "rgb(40, 180, 99)",
          };
        } else if (row?.STATUS === "O") {
          return {
            ...row,
            _rowColor: "",
          };
        }
        return row;
      });
    });
    MultipleAcctCloserGridMetaData.gridConfig.footerNote = `${t(
      `SelectedRowsClose`,
      {
        SelectedCount: gridData?.filter((row: any) => row?.STATUS === "C")
          ?.length,
      }
    )}`;
  }, [JSON.stringify(gridData)]);

  return (
    <>
      {isError ? (
        <Alert
          severity={error?.severity ?? "error"}
          errorMsg={error?.error_msg ?? "Error"}
          errorDetail={error?.error_detail ?? ""}
        />
      ) : null}
      <GridWrapper
        key={`multipleAcctClosegrid_${JSON.stringify(gridData)}` + Mode + count}
        finalMetaData={
          extractGridMetaData(
            MultipleAcctCloserGridMetaData,
            Mode
          ) as GridMetaDataType
        }
        data={gridData ?? []}
        setData={setGridData}
        loading={isLoading || isFetching}
        actions={
          gridData?.length > 0 && gridData?.[0]?.DISABLE_STATUS !== "Y"
            ? [...defaultActions, ...conditionalActions]
            : defaultActions
        }
        setAction={setCurrentAction}
        refetchData={Boolean(hasRequiredFields) ? refetch : {}}
        ref={myGridRef}
        defaultSelectedRowId={
          gridData?.find((item) => item?.FLAG === "Y")?.INDEX || ""
        }
      />
      <DataRetrieval
        isOpenRetrieve={isOpenRetrieve}
        setOpenRetrieve={setOpenRetrieve}
        setGridReqData={setGridReqData}
      />
    </>
  );
};

export const MultipleAcctClose = () => {
  return (
    <ClearCacheProvider>
      <MultipleAcctCloseMain />
    </ClearCacheProvider>
  );
};
