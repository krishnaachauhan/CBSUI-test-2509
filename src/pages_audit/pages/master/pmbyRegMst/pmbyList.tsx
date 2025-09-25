import {
  ActionTypes,
  Alert,
  GridWrapper,
  queryClient,
} from "@acuteinfo/common-base";
import { t } from "i18next";
import { getPMBYList } from "pages_audit/pages/operations/DailyTransaction/TRNHeaderTabs/OtherTrx/PMBY/api";
import { useCallback, useEffect } from "react";
import { useQuery } from "react-query";
import { pmbyListGridMetadata } from "./gridmetadata";
import { Dialog } from "@mui/material";
const actions: ActionTypes[] = [
  {
    actionName: "Close",
    actionLabel: "Close",
    multiple: false,
    alwaysAvailable: true,
    rowDoubleClick: false,
  },
];
export const PmbyList = ({ onClose, reqData }) => {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getPMBYList"], () =>
    getPMBYList({
      ...reqData,
    })
  );
  const setCurrentAction = useCallback(async (data) => {
    if (data.name === "Close") {
      onClose(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getPMBYList"]);
    };
  }, []);
  return (
    <Dialog
      open={true}
      onClose={onClose}
      PaperProps={{
        style: {
          overflow: "auto",
          width: "100%",
          height: "auto",
        },
      }}
      maxWidth="lg"
    >
      {isError && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? t("Somethingwenttowrong")}
          errorDetail={error?.error_detail}
          color="error"
        />
      )}
      <GridWrapper
        key={"pmbyListGrid"}
        finalMetaData={pmbyListGridMetadata}
        data={data ?? []}
        setData={() => null}
        actions={actions}
        loading={isLoading || isFetching}
        setAction={setCurrentAction}
        controlsAtBottom
        refetchData={() => refetch()}
      />
    </Dialog>
  );
};
