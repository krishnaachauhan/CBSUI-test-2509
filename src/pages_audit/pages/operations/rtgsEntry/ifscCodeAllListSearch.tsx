import { FC, useCallback } from "react";
import {
  GridWrapper,
  ActionTypes,
  GridMetaDataType,
  Alert,
} from "@acuteinfo/common-base";
import { useQuery } from "react-query";
import * as API from "./api";
import { Dialog } from "@mui/material";
import { IfscCodeSearchGridMetadata } from "./metaData";
import { t } from "i18next";

const actions: ActionTypes[] = [
  {
    actionName: "view-details",
    actionLabel: t("ViewDetails"),
    multiple: false,
    rowDoubleClick: true,
  },
  {
    actionName: "ok",
    actionLabel: t("Ok"),
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "close",
    actionLabel: t("Close"),
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];
export const IfscAllListSearch: FC<{
  onClose?: any;
}> = ({ onClose }) => {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getIfscAllListData"], () => API.getIfscAllListData());
  const setCurrentAction = useCallback((data) => {
    if (data.name === "close") {
      onClose();
    } else if (data?.name === "ok") {
      onClose("action", data?.rows);
    } else if (data.name === "view-details") {
      onClose("action", data?.rows);
    }
  }, []);
  return (
    <>
      <Dialog
        key="IfscCodeSearchDialog"
        open={true}
        maxWidth="lg"
        PaperProps={{
          style: {
            width: "100%",
          },
        }}
      >
        {isError && (
          <Alert
            severity="error"
            errorMsg={error?.error_msg ?? "Somethingwenttowrong"}
            errorDetail={error?.error_detail}
            color="error"
          />
        )}
        <GridWrapper
          key={`IfscCodeSearchGrid${isLoading} `}
          finalMetaData={IfscCodeSearchGridMetadata as GridMetaDataType}
          data={data ?? []}
          setData={() => null}
          actions={actions}
          setAction={setCurrentAction}
          loading={isLoading || isFetching}
          refetchData={() => refetch()}
          disableMultipleRowSelect={true}
        />
      </Dialog>
    </>
  );
};
