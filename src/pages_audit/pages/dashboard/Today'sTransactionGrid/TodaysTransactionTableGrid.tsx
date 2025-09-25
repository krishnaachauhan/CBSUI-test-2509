import {
  GridWrapper,
  ClearCacheProvider,
  Alert,
  ActionTypes,
  GridMetaDataType,
} from "@acuteinfo/common-base";
import { TodaysTransactionTableGridMetaData } from "./gridMetaData";
import { Fragment, useCallback, useMemo, useState } from "react";
import Scroll from "./openScroll/scroll";
import { useTranslation } from "react-i18next";
import { cloneDeep } from "lodash";

const actions: ActionTypes[] = [
  {
    actionName: "scroll",
    actionLabel: "Scroll",
    multiple: false,
    rowDoubleClick: true,
    actionTextColor: "var(--theme-color3)",
    alwaysAvailable: false,
    actionBackground: "inherit",
  },
];

const TodaysTransactionTableGrid = ({ mutation }) => {
  // const [enableClick, setEnableClick] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rowsData, setRowsData] = useState({});
  const { t, i18n } = useTranslation();
  const setCurrentAction = useCallback((data) => {
    setRowsData(data.rows);
    if (
      data?.rows?.[0].data?.TYPE_CD === "3" ||
      data?.rows?.[0].data?.TYPE_CD === "6"
    ) {
      setDialogOpen(true);
    }
  }, []);

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // const confirmedCount = mutation?.data?.filter(
  //   (item) => item.CONFIRM === "Y"
  // ).length;

  // const rejectedCount = mutation?.data?.filter(
  //   (item) => item.CONFIRM === "N"
  // ).length;
  // const pendingCount = mutation?.data?.filter(
  //   (item) => item.CONFIRM === "0"
  // ).length;
  // useEffect(() => {
  //   setEnableClick(mutation?.data?.map((item) => item?.TYPE_CD === "3"));
  // }, [enableClick]);
  const memoizedMetadata = useMemo(() => {
    const metadata = cloneDeep(TodaysTransactionTableGridMetaData);
    const confirmedCount = mutation?.data?.filter(
      (item) => item.CONFIRM === "Y"
    ).length;

    const rejectedCount = mutation?.data?.filter(
      (item) => item.CONFIRM === "N"
    ).length;
    const pendingCount = mutation?.data?.filter(
      (item) => item.CONFIRM === "0"
    ).length;
    if (metadata?.gridConfig) {
      metadata.gridConfig.footerNote = `${t("ConfirmedCount")} : ${
        confirmedCount ?? 0
      } \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0${t("RejectedCount")} : ${
        rejectedCount ?? 0
      } \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0${t("PendingCount")} : ${
        pendingCount ?? 0
      }`;
    }
    return metadata;
  }, [mutation?.data, i18n.language]);

  return (
    <>
      {mutation.isError ? (
        <Fragment>
          <div style={{ width: "100%", paddingTop: "10px" }}>
            <Alert
              severity={mutation.error?.severity ?? "error"}
              errorMsg={mutation.error?.error_msg ?? "Error"}
              errorDetail={mutation.error?.error_detail ?? ""}
            />
          </div>
        </Fragment>
      ) : null}
      <GridWrapper
        key={
          `TodaysTransactionTableGrid` + mutation?.data?.length + i18n.language
        }
        finalMetaData={memoizedMetadata as GridMetaDataType}
        data={mutation?.data ?? []}
        setData={() => null}
        enableExport={true}
        actions={actions}
        setAction={setCurrentAction}
        headerToolbarStyle={{
          background: "var(--theme-color2)",
          color: "var(--theme-color3)",
        }}
        loading={mutation.isLoading || mutation.isFetching}
      />
      {/* <Grid
        item
        xs={12}
        sm={12}
        sx={{
          // backgroundColor: "blueviolet",
          height: "23px",
          width: "60%",
          float: "right",
          position: "relative",
          top: "-2.67rem",
          display: "flex",
          // justifyContent: "space-evenly",
          gap: "4rem",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontWeight: "bold" }} variant="subtitle1">
          {t("ConfirmedCount")} : {confirmedCount}
        </Typography>
        <Typography sx={{ fontWeight: "bold" }} variant="subtitle1">
          {t("RejectedCount")} :{rejectedCount}
        </Typography>
        <Typography sx={{ fontWeight: "bold" }} variant="subtitle1">
          {t("PendingCount")} : {pendingCount}
        </Typography>
      </Grid> */}
      {dialogOpen && (
        <Scroll
          data={rowsData}
          open={dialogOpen}
          handleCloseDialog={handleCloseDialog}
        />
      )}
    </>
  );
};

export const TodaysTransactionTableGridWrapper = ({ mutation }) => {
  return (
    <ClearCacheProvider>
      <TodaysTransactionTableGrid mutation={mutation} />
    </ClearCacheProvider>
  );
};
