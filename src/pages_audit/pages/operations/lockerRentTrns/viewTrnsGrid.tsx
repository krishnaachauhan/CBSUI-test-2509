import { Fragment } from "react/jsx-runtime";
import {
  GridMetaDataType,
  GridWrapper,
  RemarksAPIWrapper,
  usePopupContext,
} from "@acuteinfo/common-base";
import { todayTrnsGridMetadata } from "./gridMetadata/todayTrnsGridMetadata";
import { viewTrnsGridMetadata } from "./gridMetadata/viewTrnsGridMetadata";
import * as API from "./api";
import { AuthContext } from "pages_audit/auth";
import { useContext, useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query"; // Use useQuery for caching
import { useDataContext } from "./DataContext";
import { t } from "i18next";
import { Alert } from "@acuteinfo/common-base";
import { format } from "date-fns";
import { getTodatTrnsData } from "./Confirmation/api";
import { confirmationTodayTrns } from "./Confirmation/todayTransactionsMetadata";

export const ViewTrnsGrid = () => {
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [isDelete, setIsDelete] = useState(false);
  const [rawData, setRawData] = useState({});

  const { data } = useDataContext();
  //@ts-ignore
  const { ACCT_CD, ACCT_TYPE, TRAN_CD } = data?.reqData;
  //@ts-ignore
  const { FROM_DATE, TO_DATE } = data?.retrievalPara;

  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    error: transactionsError,
    isError: isTransactionalError,
    refetch,
  } = useQuery(
    [
      "transactions",
      ACCT_CD,
      ACCT_TYPE,
      data?.activeView,
      data?.screenFlag,
      FROM_DATE,
      TO_DATE,
      TRAN_CD,
    ],
    async () => {
      if (
        data?.activeView === "ViewTransactions" ||
        data?.screenFlag === "viewAllRentPaid"
      ) {
        return API.getTransactionsData({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
          ACCT_TYPE,
          ACCT_CD,
        });
      } else if (data?.activeView === "TodaysTransaction") {
        return API.getTodayTrnsData({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
          ACCT_TYPE,
          ACCT_CD,
          USERROLE: authState?.role ?? "",
          WORKING_DATE: authState?.workingDate,
          FROM_DT: FROM_DATE
            ? format(new Date(FROM_DATE), "dd-MMM-yyyy")
            : authState?.workingDate,
          TO_DT: TO_DATE
            ? format(new Date(TO_DATE), "dd-MMM-yyyy")
            : authState?.workingDate,
        });
      } else if (data?.screenFlag === "lockerRentConfirmTodatTrns") {
        return getTodatTrnsData({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
          TRAN_CD: TRAN_CD,
        });
      } else if (data?.screenFlag === "viewAllRentPaid") {
        return getTodatTrnsData({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
          TRAN_CD: TRAN_CD,
        });
      }
    },
    {
      enabled: ACCT_CD !== undefined && ACCT_TYPE !== undefined,
      refetchOnWindowFocus: false,
      // staleTime: 5 * 60 * 1000,
    }
  );

  const deleteMutation = useMutation(API.lockerRentTransactionDML, {
    onError: async (error: any) => {
      CloseMessageBox();
    },
    onSuccess: (data) => {
      refetch();
      MessageBox({
        messageTitle: "Success",
        message: "Success",
        icon: "SUCCESS",
      });
    },
  });

  const errorDataa: any = [
    { error: transactionsError, isError: isTransactionalError },
    { error: deleteMutation?.error, isError: deleteMutation?.isError },
  ];
  const hasError = errorDataa.some(({ isError }) => isError);

  return (
    <Fragment>
      {hasError
        ? errorDataa.map(
            ({ error, isError }, index) =>
              isError && (
                <Alert
                  key={index}
                  severity="error"
                  errorMsg={error?.error_msg || t("Somethingwenttowrong")}
                  errorDetail={error?.error_detail ?? ""}
                  color="error"
                />
              )
          )
        : null}
      <GridWrapper
        key={"lockerDeatilsViewMetadata" + data?.activeView + data?.screenFlag}
        finalMetaData={
          data?.activeView === "TodaysTransaction"
            ? todayTrnsGridMetadata
            : data?.screenFlag === "lockerRentConfirmTodatTrns"
            ? confirmationTodayTrns
            : (viewTrnsGridMetadata as GridMetaDataType)
        }
        data={transactionsData ?? []}
        onClickActionEvent={async (index, id, data) => {
          if (id === "DELETE") {
            const btnName = await MessageBox({
              messageTitle: "Confirmation",
              message: t("deleteCmfmMsg"),
              icon: "CONFIRM",
              buttonNames: ["Yes", "No"],
            });
            if (btnName === "Yes") {
              setRawData(data);
              setIsDelete(true);
            }
          }
        }}
        setData={() => null}
        refetchData={() => refetch()}
        hideHeader={true}
        actions={[]}
        loading={isLoadingTransactions}
      />
      {isDelete ? (
        <RemarksAPIWrapper
          defaultValue="WRONG ENTRY FROM LOCKER RENT TRANSACTION"
          TitleText={"Confirmation"}
          onActionNo={() => {
            setIsDelete(false);
          }}
          onActionYes={(val, rows) => {
            deleteMutation?.mutate({
              _isNewRow: false,
              //@ts-ignore
              TRAN_CD: rawData?.TRAN_CD,
              COMP_CD: authState?.companyID,
              BRANCH_CD: authState?.user?.branchCode,
              WORKING_DATE: authState?.workingDate,
            });
            setIsDelete(false);
          }}
          isEntertoSubmit={true}
          AcceptbuttonLabelText="Ok"
          CanceltbuttonLabelText="Cancel"
          open={isDelete}
          rows={{}}
        />
      ) : null}
    </Fragment>
  );
};
