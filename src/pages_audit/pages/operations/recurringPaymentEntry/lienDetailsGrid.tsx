import { useCallback } from "react";
import { LienGridMetaData } from "../lienEntry/lienEntryGridMetaData";
import {
  Alert,
  ActionTypes,
  GridWrapper,
  GridMetaDataType,
} from "@acuteinfo/common-base";
import { useTranslation } from "react-i18next";

const actions: ActionTypes[] = [
  {
    actionName: "close",
    actionLabel: "Close",
    multiple: undefined,
    alwaysAvailable: true,
  },
];

export const LienDetailsGrid = ({
  lienGridData,
  handleCloseLienDialog,
  loading,
  fetching,
  error,
}) => {
  const { t } = useTranslation();
  const setCurrentAction = useCallback((data) => {
    if (data?.name === "close") {
      handleCloseLienDialog();
    }
  }, []);

  return (
    <>
      {error && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? t("Somethingwenttowrong")}
          errorDetail={error?.error_detail}
          color="error"
        />
      )}
      <div style={{ padding: "10px" }}>
        <GridWrapper
          key={"lienDetailsGrid"}
          finalMetaData={LienGridMetaData as GridMetaDataType}
          data={lienGridData ?? []}
          loading={loading || fetching}
          actions={actions}
          setAction={setCurrentAction}
          setData={() => {}}
        />
      </div>
    </>
  );
};
