import { Fragment, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuditgridMetaData } from "./metaData/gridMetaData";
import * as API from "./api";
import { useQuery } from "react-query";
import {
  Dialog,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  ActionTypes,
  GridWrapper,
  queryClient,
  GridMetaDataType,
  GradientButton,
} from "@acuteinfo/common-base";
import { AppBar, Toolbar, Typography } from "@mui/material";
import { Theme } from "@mui/system";
import { makeStyles } from "@mui/styles";
import { t } from "i18next";
const actions: ActionTypes[] = [
  {
    actionName: "close",
    actionLabel: "Close",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "edit",
    actionLabel: "Edit",
    rowDoubleClick: true,
    alwaysAvailable: false,
    multiple: undefined,
  },
];

const useTypeStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    background: "var(--theme-color5)",
  },
  title: {
    flex: "1 1 100%",
    color: "var(--white)",
    letterSpacing: "1px",
    fontSize: "1.5rem",
  },
}));
const AuditData = ({ griddata, open, onClose }) => {
  const headerClasses = useTypeStyles();
  const navigate = useNavigate();
  const setCurrentAction = useCallback(
    async (actionData) => {
      const { name, rows } = actionData;
      if (name === "close") {
        onClose();
      } else {
        navigate(name, {
          state: rows,
        });
      }
    },
    [navigate, onClose]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(
    ["AuditDataDetail"],
    () =>
      API.AuditDataDetail({
        execute_date: griddata.EXECUTE_DT,
        companyID: griddata.COMP_CD,
        branchCode: griddata.ENT_BRANCH_CD,
        Tran_cd: griddata.TRAN_CD,
        Sr_cd: griddata.SR_CD,
        Lien_id: griddata.LINE_ID,
        sub_lineid: griddata.SUB_LINE_ID,
      }),
    {
      enabled: open === true ? true : false,
    }
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["AuditDataDetail"]);
    };
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  AuditgridMetaData.gridConfig.gridLabel = `SI Audit Trail Execute Date : ${formatDate(
    griddata.EXECUTE_DT
  )}`;
  const formatText = (text) => {
    return text.split("\r").map((item, index) => (
      <Fragment key={index}>
        {item}
        <br />
      </Fragment>
    ));
  };

  return (
    <Fragment>
      <Dialog
        open={open}
        PaperProps={{ style: { width: "100%", overflow: "auto" } }}
        maxWidth="md"
      >
        <AppBar position="relative" color="secondary">
          <Toolbar className={headerClasses.root} variant="dense">
            <Typography
              className={headerClasses.title}
              color="inherit"
              variant="h6"
              component="div"
            >
              {`SI Audit Trail Execute Date : ${formatDate(
                griddata.EXECUTE_DT
              )}`}
            </Typography>
            <GradientButton onClick={onClose}>{t("close")}</GradientButton>
          </Toolbar>
        </AppBar>
        <TableContainer component={Paper} sx={{ p: 2 }}>
          <Table aria-label="simple table" padding="none">
            <TableHead style={{ color: "#07288e" }}>
              <TableRow id="topHead">
                <TableCell id="head">{t("ActivityTime")}</TableCell>
                <TableCell id="head">{t("ColumnName")}</TableCell>
                <TableCell id="head">{t("OldValue")}</TableCell>
                <TableCell id="head">{t("NewValue")}</TableCell>
                <TableCell id="head">{t("Maker")}</TableCell>
                <TableCell id="head">{t("Act. Date")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data && data.length > 0 ? (
                data.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.ACTIVITY_TIME}</TableCell>
                    <TableCell>{row.COLUMN_LABEL}</TableCell>
                    <TableCell>{formatText(row.OLD_VALUE)}</TableCell>
                    <TableCell>{formatText(row.NEW_VALUE)}</TableCell>
                    <TableCell>{formatText(row.USER_NM)}</TableCell>
                    <TableCell>{formatText(row.ACTIVITY_DATE)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {t("No data available")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* <GridWrapper
          key={"AuditgridMetaData"}
          finalMetaData={AuditgridMetaData as GridMetaDataType}
          loading={isLoading || isFetching}
          data={data ?? []}
          refetchData={() => refetch()}
          setData={() => null}
          actions={actions}
          setAction={setCurrentAction}
        /> */}
      </Dialog>
    </Fragment>
  );
};

export default AuditData;
