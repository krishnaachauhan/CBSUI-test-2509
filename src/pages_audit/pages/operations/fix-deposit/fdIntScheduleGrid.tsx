import { useCallback, useEffect } from "react";
import * as API from "./api";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import { Dialog } from "@mui/material";
import {
  Alert,
  GridWrapper,
  queryClient,
  ActionTypes,
  GridMetaDataType,
} from "@acuteinfo/common-base";
import { FDIntScheduleGridMetaData } from "./fdIntScheduleGridMetadata";
import { useDialogContext } from "../payslip-issue-entry/DialogContext";

// List of actions to be displayed as buttons in the header
const actions: ActionTypes[] = [
  {
    actionName: "close",
    actionLabel: "Close",
    multiple: undefined,
    alwaysAvailable: true,
  },
];

export const FDIntScheduleGrid = ({ setOpenIntSchedule, apiReqData }) => {
  const { t } = useTranslation();
  // const { trackDialogClass } = useDialogContext();

  // Function to handle actions when a button is clicked
  const setCurrentAction = useCallback((data) => {
    if (data?.name === "close") {
      setOpenIntSchedule(false);
      // trackDialogClass("fdCommDlg");
    }
  }, []);

  // API call to fetch FD Int. Schedule data
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getFDIntSchedule"], () =>
    API.getFDIntSchedule({
      ...apiReqData,
    })
  );

  // Remove cached data for the API query to ensure fresh data is fetched
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getFDIntSchedule"]);
    };
  }, []);

  return (
    <Dialog
      open={true}
      fullWidth={true}
      PaperProps={{
        style: {
          width: "100%",
          padding: 8,
        },
      }}
      maxWidth="sm"
      onKeyUp={(event) => {
        if (event.key === "Escape") {
          setOpenIntSchedule(false);
          // trackDialogClass("fdCommDlg");
        }
      }}
      className="fdIntSchedule"
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
        key={"FDIntScheduleGrid"}
        finalMetaData={FDIntScheduleGridMetaData as GridMetaDataType}
        data={data ?? []}
        setData={() => null}
        actions={actions}
        loading={isLoading || isFetching}
        setAction={setCurrentAction}
        refetchData={() => refetch()}
        enableExport={true}
      />
    </Dialog>
  );
};
