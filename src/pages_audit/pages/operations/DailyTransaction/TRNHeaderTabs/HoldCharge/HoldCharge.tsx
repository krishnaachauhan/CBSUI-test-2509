import {
  ActionTypes,
  Alert,
  extractGridMetaData,
  GridMetaDataType,
  GridWrapper,
  queryClient,
  usePopupContext,
} from "@acuteinfo/common-base";
import i18n from "components/multiLanguage/languagesConfiguration";
import { AuthContext } from "pages_audit/auth";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import { getGridDataList } from "../dynamicDailyTransTabs/api";

const actions: ActionTypes[] = [
  {
    actionName: "proceed",
    actionLabel: "Proceed",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];
export const HoldCharge = ({ tabName, apiEndPoint, gridMetaData, reqData }) => {
  const { authState } = useContext(AuthContext);
  const myGridRef = useRef<any>(null);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [rows, setRows] = useState<any>([]);
  const [prevPaidValues, setPrevPaidValues] = useState<any>([]);
  const [Mode, setMode] = useState("edit");
  const { t } = useTranslation();
  const oldRowsDataRef = useRef<any>([]);
  const previousRow = useRef<any>({});
  const sameTranCDRowsRef = useRef<any>([]);
  const [renderFlag, setRenderFlag] = useState(false);

  const hasRequiredFields = Boolean(
    reqData?.ACCT_CD && reqData?.ACCT_TYPE && reqData?.BRANCH_CD
  );
  const { data, isLoading, isFetching, refetch, error, isError } = useQuery<
    any,
    any
  >(
    [
      "getGridDataList",
      {
        tabName: tabName,
        apiEndPoint: apiEndPoint,
        reqData,
      },
    ],
    () =>
      getGridDataList({
        tabName: tabName,
        apiEndPoint: apiEndPoint,
        reqData,
      }),
    {
      enabled: hasRequiredFields,
    }
  );
  const handleRefetch = () => {
    if (hasRequiredFields) {
      refetch();
    }
  };

  useEffect(() => {
    if (data?.length > 0) {
      setRows(data);
      oldRowsDataRef.current = data;
      setPrevPaidValues(data?.map((row: any) => row?.PAID));
    }
  }, [data]);
  const validateHoldCharge = useMutation(API.validateHoldCharge, {
    onMutate: () => {
      setMode("view");
    },
    onError: async (error: any, varieble: any) => {
      setRows((preRow) => {
        const updatedRow = [...preRow];
        const oldRow = oldRowsDataRef?.current?.find(
          (row: any) => row?.index === varieble?.INDEX
        );
        if (oldRow) {
          updatedRow[varieble?.INDEX] = {
            ...updatedRow[varieble?.INDEX],
            FLAG: oldRow?.FLAG,
            PAID: oldRow?.PAID,
          };
        }
        return updatedRow;
      });
      CloseMessageBox();
    },
  });

  const proceedHoldCharges = useMutation(API.proceedHoldCharges, {
    onError: async (error: any) => {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      CloseMessageBox();
      refetch();
    },
  });

  const setCurrentAction = useCallback(async (data) => {
    if (data?.name === "proceed") {
      const updatedRows = myGridRef.current?.cleanData(true);
      const paidUpdatedRows = updatedRows?.filter((row) => row.PAID !== "N");
      const paidChanges = paidUpdatedRows.map((updatedRow) => {
        let paidLabel;
        if (updatedRow.PAID === "Y") {
          paidLabel = "Paid";
        } else if (updatedRow.PAID === "N") {
          paidLabel = "Unpaid";
        } else if (updatedRow.PAID === "W") {
          paidLabel = "Waive";
        } else {
          paidLabel = updatedRow.PAID;
        }
        return {
          amount: parseFloat(updatedRow.AMOUNT).toFixed(2),
          remarks: updatedRow.REMARKS,
          paid: paidLabel,
        };
      });

      if (paidChanges.length > 0) {
        const message = paidChanges
          .map(
            (change, index) =>
              `${change.amount} ${change.remarks} ${change.paid}`
          )
          .join("\n");
        const reqPara = paidUpdatedRows?.map((row) => ({
          ENTERED_COMP_CD: row?.ENTERED_COMP_CD ?? "",
          ENTERED_BRANCH_CD: row?.ENTERED_BRANCH_CD ?? "",
          TRAN_CD: row?.TRAN_CD ?? "",
          SR_CD: row?.SR_CD ?? "",
          PAID: row?.PAID ?? "",
        }));

        const btnName = await MessageBox({
          message: `Are you sure to apply/waive following transactions? \n\n${message} `,
          messageTitle: "Confirmation",
          buttonNames: ["Yes", "No"],
          loadingBtnName: ["Yes"],
          defFocusBtnName: "Yes",
          icon: "CONFIRM",
        });
        if (btnName === "Yes") {
          proceedHoldCharges.mutate({
            DETAILS_DATA: {
              isNewRow: reqPara,
              isDeleteRow: [],
              isUpdatedRow: [],
            },
          });
        }
      }
    }
  }, []);

  const updatePaidStatusSequentially = async (data, paidFlag) => {
    setRenderFlag(true);
    for (let i = 0; i < data.length; i++) {
      const currentObject = { ...data[i], PAID: paidFlag };
      setRows((prevRows: any) =>
        prevRows.map((row: any) => {
          return row?.index === currentObject?.index
            ? {
                ...row,
                FLAG: "Y",
              }
            : row;
        })
      );

      if (paidFlag === rows?.[currentObject?.index]?.PAID)
        try {
          await new Promise<void>((resolve, reject) => {
            validateHoldCharge?.mutate(
              {
                A_COMP_CD: currentObject?.COMP_CD ?? "",
                A_BRANCH_CD: currentObject?.BRANCH_CD ?? "",
                A_ACCT_TYPE: currentObject?.ACCT_TYPE ?? "",
                A_ACCT_CD: currentObject?.ACCT_CD ?? "",
                A_PAID: currentObject?.PAID ?? "",
                A_AMOUNT: currentObject?.AMOUNT ?? "",
                A_STATUS: reqData?.STATUS ?? "",
                A_NPA_CD: reqData?.NPA_CD ?? "",
                A_GD_DATE: authState?.workingDate ?? "",
                A_USER: authState?.user?.id ?? "",
                A_USER_LEVEL: authState?.role ?? "",
                A_SCREEN_REF: reqData?.SCREEN_REF ?? "",
                A_LANG: i18n.resolvedLanguage,
                INDEX: currentObject?.index ?? "",
              },
              {
                onSuccess: async (data, varieble) => {
                  for (let i = 0; i < data?.length; i++) {
                    if (data?.[i]?.O_STATUS === "999") {
                      const btnName = await MessageBox({
                        messageTitle:
                          data?.[i]?.O_MSG_TITLE ?? "ValidationFailed",
                        message: data?.[i]?.O_MESSAGE,
                        icon: "ERROR",
                      });
                      if (btnName === "Ok") {
                        setRows((preRow) => {
                          const updatedRow = [...preRow];
                          updatedRow[varieble?.INDEX] =
                            oldRowsDataRef?.current?.find(
                              (row: any) => row?.index === varieble?.INDEX
                            );
                          return updatedRow;
                        });
                      }
                    } else if (data?.[i]?.O_STATUS === "99") {
                      const btnName = await MessageBox({
                        messageTitle: "Confirmation",
                        message: data?.[i]?.O_MESSAGE,
                        buttonNames: ["Yes", "No"],
                      });
                      if (btnName === "No") {
                        break;
                      }
                    } else if (data?.[i]?.O_STATUS === "9") {
                      await MessageBox({
                        messageTitle: "Alert",
                        message: data?.[i]?.O_MESSAGE,
                        icon: "WARNING",
                      });
                    } else if (data?.[i]?.O_STATUS === "0") {
                      setRows((preRow) => {
                        const updatedRow = [...preRow];
                        const oldRow = oldRowsDataRef?.current?.find(
                          (row: any) => row?.index === varieble?.INDEX
                        );
                        if (oldRow) {
                          updatedRow[varieble?.INDEX] = {
                            ...updatedRow[varieble?.INDEX],
                            FLAG: oldRow?.FLAG,
                            PAID: currentObject?.PAID,
                          };
                        }
                        return updatedRow;
                      });
                    }
                  }
                  setMode("edit");
                  resolve();
                },
                onError: (error) => {
                  reject(error);
                },
              }
            );
          });
        } catch (error) {
          console.error(error);
          break;
        }
    }
    setRenderFlag(false);
    sameTranCDRowsRef.current = [];
    setPrevPaidValues(rows?.map((row: any) => row?.PAID));
  };

  useEffect(() => {
    const currentPaidValues = rows?.map((row: any) => row?.PAID);
    const isPaidChanged = currentPaidValues?.some(
      (paid, index) => paid !== prevPaidValues[index]
    );

    if (!renderFlag && Boolean(isPaidChanged)) {
      let lastUpdatedRowIndex: any = -1;
      prevPaidValues.forEach((currentRow: any, index) => {
        if (currentPaidValues[index] !== currentRow) {
          previousRow.current = rows?.[index];
          lastUpdatedRowIndex = index;
        }
      });

      if (previousRow?.current) {
        setRows((prevRows: any) =>
          prevRows.map((row: any) => {
            return row.TRAN_CD === rows[lastUpdatedRowIndex]?.TRAN_CD
              ? {
                  ...row,
                  PAID: previousRow?.current?.PAID,
                }
              : row;
          })
        );
      }

      sameTranCDRowsRef.current = rows
        ?.filter((row) => row?.TRAN_CD === previousRow?.current?.TRAN_CD)
        ?.map((row, index) => ({
          ...row,
          FLAG: "Y",
          PAID: previousRow?.current?.PAID,
        }));

      setPrevPaidValues(currentPaidValues);
    }
  }, [rows]);

  useEffect(() => {
    updatePaidStatusSequentially(
      sameTranCDRowsRef.current,
      previousRow?.current?.PAID
    );
  }, [sameTranCDRowsRef?.current?.length]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getGridDataList"]);
    };
  }, []);

  return (
    <>
      {(isError || validateHoldCharge?.error) && (
        <Alert
          severity="error"
          errorMsg={
            error?.error_msg ||
            validateHoldCharge?.error?.error_msg ||
            t("Somethingwenttowrong")
          }
          errorDetail={
            error?.error_detail || validateHoldCharge?.error?.error_detail || ""
          }
          color="error"
        />
      )}

      <GridWrapper
        key={`HoldChargeGridMetaData` + rows?.length + Mode}
        finalMetaData={
          extractGridMetaData(gridMetaData, Mode) as GridMetaDataType
        }
        data={hasRequiredFields ? rows : []}
        setData={setRows}
        loading={isLoading || isFetching}
        actions={actions}
        setAction={
          !Boolean(validateHoldCharge?.isLoading) ? setCurrentAction : undefined
        }
        refetchData={handleRefetch}
        ref={myGridRef}
        enableExport={true}
      />
    </>
  );
};
