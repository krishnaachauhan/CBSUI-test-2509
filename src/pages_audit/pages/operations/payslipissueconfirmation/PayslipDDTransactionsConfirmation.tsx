import {
  AppBar,
  Box,
  Dialog,
  Grid,
  List,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import { t } from "i18next";
import { ListItemData } from "../inwardClearing/inwardClearing";
import {
  ActionTypes,
  GradientButton,
  GridMetaDataType,
  GridWrapper,
  queryClient,
} from "@acuteinfo/common-base";
import { useCallback, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { getDDtransactionScreenList } from "../payslip-issue-entry/api";
import { RetrieveEntryGrid } from "../payslip-issue-entry/entries/entryGrid";
import { DDtransactionsMetadata } from "../payslip-issue-entry/paySlipMetadata";
const actions: ActionTypes[] = [
  {
    actionName: "close",
    actionLabel: t("Close"),
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "open",
    actionLabel: t("open"),
    multiple: undefined,
    rowDoubleClick: true,
    alwaysAvailable: false,
  },
];
export const PayslipDDTrnsConfirmation = () => {
  const navigate = useNavigate();
  const [componentTorender, setComponetToRender] = useState<any>([]);
  const [screenOpen, setScreenOpen] = useState(false);

  const setCurrentAction = useCallback(async (data) => {
    if (data?.name === "close") {
      console.log("closed");

      navigate("/EnfinityCore/dashboard");
    } else if (data?.name === "open") {
      let row = data?.rows[0]?.data;
      setComponetToRender([
        row?.DOC_CD,
        row?.DOC_NM,
        row?.SCREENREF,
        row?.TRAN_TYPE,
      ]);
      setScreenOpen(true);
    }
  }, []);
  useEffect(() => {
    navigate("./");
  }, []);

  const close = () => {
    setScreenOpen(false);
  };
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getModeMasterDataconf"], () => getDDtransactionScreenList({ FLAG: "C" }));

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getModeMasterDataconf"]);
    };
  }, []);
  return (
    <>
      <Dialog
        open={true}
        fullScreen
        PaperProps={{
          style: {
            width: "32%",
            height: "auto",
            overflow: "hidden",
          },
        }}
        maxWidth="md"
      >
        <Paper sx={{ p: 2 }}>
          <GridWrapper
            key={"DDtransactionsMetadata"}
            finalMetaData={DDtransactionsMetadata as GridMetaDataType}
            data={data ?? []}
            setData={() => null}
            actions={actions}
            loading={isLoading || isFetching}
            setAction={setCurrentAction}
            refetchData={null}
            onClickActionEvent={(index, id, currentData) => {
              if (id === "OPEN") {
                console.log(componentTorender);
                setComponetToRender([
                  currentData?.DOC_CD,
                  currentData?.DOC_NM,
                  currentData?.SCREENREF,
                  currentData?.TRAN_TYPE,
                ]);
                setScreenOpen(true);
              }
            }}
            variant="contained"
          />
          <Typography
            color="inherit"
            fontWeight={800}
            variant={"h6"}
            component="div"
            textAlign={"center"}
          >
            {t("openDDtrnsScreenMsg")}
          </Typography>
        </Paper>
        {screenOpen && (
          <RetrieveEntryGrid
            screenFlag={componentTorender[2]}
            open={screenOpen}
            close={close}
            headerLabel={`${componentTorender[1]} (${componentTorender[0]})`}
            apiReqFlag={componentTorender[0]}
            trans_type={componentTorender[3]}
          />
        )}
      </Dialog>
    </>
  );
};
