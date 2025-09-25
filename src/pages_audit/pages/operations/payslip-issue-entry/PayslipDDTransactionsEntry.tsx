import { Dialog, Paper, Typography } from "@mui/material";
import { t } from "i18next";
import {
  ActionTypes,
  Alert,
  GridMetaDataType,
  GridWrapper,
  queryClient,
} from "@acuteinfo/common-base";
import { DDtransactionsMetadata } from "./paySlipMetadata";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RetrieveEntryGrid } from "./entries/entryGrid";
import { getDDtransactionScreenList } from "./api";
import { useQuery } from "react-query";

interface DDTransactionRow {
  DOC_CD: string;
  DOC_NM: string;
  SCREENREF: string;
  TRAN_TYPE: string;
}

interface SelectedScreen {
  docCd: string;
  docNm: string;
  screenRef: string;
  transType: string;
}

const actions: ActionTypes[] = [
  {
    actionName: "close",
    actionLabel: t("Close"),
    alwaysAvailable: true,
    multiple: undefined,
  },
  {
    actionName: "open",
    actionLabel: t("open"),
    rowDoubleClick: true,
    multiple: undefined,
  },
];

export const PayslipDDTransactionsEntry = () => {
  const navigate = useNavigate();
  const [selectedScreen, setSelectedScreen] = useState<SelectedScreen | null>(
    null
  );

  const { data, isLoading, isFetching, isError, error } = useQuery<
    DDTransactionRow[],
    { error_msg?: string; error_detail?: string }
  >(["getDDtransactionScreenList"], () =>
    getDDtransactionScreenList({ FLAG: "E" })
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getDDtransactionScreenList"]);
    };
  }, []);

  const setCurrentAction = useCallback(
    (action: { name: string; rows?: { data: DDTransactionRow }[] }) => {
      if (action?.name === "close") {
        navigate("/EnfinityCore/dashboard");
      }
      if (action?.name === "open" && action?.rows?.[0]) {
        const row = action.rows[0].data;
        setSelectedScreen({
          docCd: row.DOC_CD,
          docNm: row.DOC_NM,
          screenRef: row.SCREENREF,
          transType: row.TRAN_TYPE,
        });
      }
    },
    [navigate]
  );

  const close = () => setSelectedScreen(null);

  return (
    <Dialog
      open
      fullScreen
      maxWidth="md"
      PaperProps={{ sx: { width: 500, height: "auto" } }}
    >
      <Paper sx={{ p: 2, pb: 0 }}>
        {isError && (
          <Alert
            severity="error"
            errorMsg={error?.error_msg ?? t("Somethingwenttowrong")}
            errorDetail={error?.error_detail}
            color="error"
          />
        )}

        <GridWrapper
          key="DDtransactionsMetadata"
          finalMetaData={DDtransactionsMetadata as GridMetaDataType}
          data={data ?? []}
          setData={() => null}
          actions={actions}
          loading={isLoading || isFetching}
          setAction={setCurrentAction}
          refetchData={null}
          variant="contained"
        />

        <Typography
          fontWeight={800}
          variant="h6"
          textAlign="center"
          sx={{ mt: 1 }}
        >
          {t("openDDtrnsScreenMsg")}
        </Typography>
      </Paper>

      {selectedScreen && (
        <RetrieveEntryGrid
          screenFlag={selectedScreen.screenRef}
          open
          close={close}
          headerLabel={`${selectedScreen.docNm} (${selectedScreen.docCd})`}
          apiReqFlag={selectedScreen.docCd}
          trans_type={selectedScreen.transType}
        />
      )}
    </Dialog>
  );
};
