import {
  ActionTypes,
  Alert,
  GridMetaDataType,
  GridWrapper,
  queryClient,
} from "@acuteinfo/common-base";
import { useEffect } from "react";
import { useQuery } from "react-query";
import { getTodayClearing } from "../api";
import { TodaysClearingGridMetaData } from "../chequebookDetailMetadata";
import { useDialogContext } from "../../payslip-issue-entry/DialogContext";

const todaysClearingActions: ActionTypes[] = [
  {
    actionName: "Close",
    actionLabel: "Close",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];

const TodaysClearingGrid = ({ setTodayClearingOpen, reqData }) => {
  const { data, isLoading, isFetching, refetch, error, isError } = useQuery<
    any,
    any
  >(
    ["getTodayClearing", { reqData }],
    () =>
      getTodayClearing({
        COMP_CD: reqData?.COMP_CD ?? "",
        BRANCH_CD: reqData?.BRANCH_CD ?? "",
        ACCT_TYPE: reqData?.ACCT_TYPE ?? "",
        ACCT_CD: reqData?.ACCT_CD ?? "",
      }),
    {}
  );

  TodaysClearingGridMetaData.gridConfig.gridLabel = `Inward Clearing Status of A/c No.: ${
    reqData?.BRANCH_CD?.trim() ?? ""
  }/${reqData?.ACCT_TYPE?.trim() ?? ""}/${reqData?.ACCT_CD?.trim() ?? ""}-${
    reqData?.ACCT_NM?.trim() ?? ""
  }`;

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getTodayClearing"]);
    };
  }, []);
  const { trackDialogClass } = useDialogContext();
  return (
    <>
      {isError && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? "Something went to wrong.."}
          errorDetail={error?.error_detail ?? ""}
          color="error"
        />
      )}
      <div className="todayClearing">
        <GridWrapper
          key={
            `todayClearingDtl` +
            data?.length +
            TodaysClearingGridMetaData?.gridConfig?.gridLabel
          }
          finalMetaData={TodaysClearingGridMetaData as GridMetaDataType}
          data={data ?? []}
          loading={isLoading || isFetching}
          setData={() => {}}
          actions={todaysClearingActions}
          setAction={(data) => {
            if (data?.name === "Close") {
              setTodayClearingOpen(false);
              trackDialogClass("main");
            }
          }}
          refetchData={() => refetch()}
        />
      </div>
    </>
  );
};
export default TodaysClearingGrid;
