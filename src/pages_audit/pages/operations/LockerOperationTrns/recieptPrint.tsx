import { useRef } from "react";
import Draggable from "react-draggable";
import {
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  Paper,
} from "@mui/material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { makeStyles } from "@mui/styles";
import { useTranslation } from "react-i18next";
import { PrintButton } from "@acuteinfo/common-base";

const useStyles: any = makeStyles((theme: any) => ({
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  modalContent: {
    pointerEvents: "auto",
  },
  box: {
    display: "flex",
    justifyContent: "center",
    fontColor: "black",
    alignItems: "center",
  },
  label: {
    width: "30%",
    fontColor: "black",
    fontSize: "14px",
    boxShadow: "none",
    textAlign: "end",
    marginRight: theme.spacing(1),
  },
  label2: {
    width: "30%",
    fontSize: "14px",
    textAlign: "end",
    boxShadow: "none",
    fontWeight: "normal",
  },
  textField: {
    padding: "5px",
    borderRadius: "5px",
    width: "calc(100% - 132px)",
    boxShadow: "none",
    fontColor: "black",
  },
  typography: {
    padding: "5px 5px 2px 5px",
    fontWeight: "bolder",
    fontSize: "22px",
  },
  typography2: {
    padding: "0px",
    fontSize: "18px",
    fontWeight: 600,
    fontColor: "black",
  },
  typography3: {
    padding: "5px",
    fontSize: "18px",
    fontColor: "black",
    letterSpacing: "8px",
  },
  textFieldHighLight: {
    padding: "5px 5px 2px 5px",
    borderRadius: "5px",
    width: "100%",
    fontColor: "black",
    textAlign: "center",
  },
  input: {
    fontWeight: "normal",
    padding: "5px 8px",
    fontColor: "black",
    boxShadow: "none",
    width: "100%",
    outline: "none",
  },
  header: {
    background: "var(--theme-color5)",
    color: "var(--theme-color2)",
    display: "flex",
    padding: "4px 0px 4px 10px",
    alignItems: "center",
    justifyContent: "end",
    "& .MuiButtonBase-root": {
      color: "var(--theme-color2) !important",
    },
  },
}));
export const RecieptPrint = ({ cardData, close }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const printRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className={classes.modalOverlay}>
      <Draggable
        handle="#draggable-modal-title"
        cancel={'[class*="Mui-disabled"], input, textarea, select, button'}
      >
        <div className={classes.modalContent}>
          <div id="draggable-modal-title">
            <Grid item xs={12} className={classes?.header}>
              <div
                style={{
                  width: "50%",
                  display: "flex",
                  justifyContent: "start",
                }}
              >
                <Typography align="center" variant="h6">
                  {t("recieptPrinting")}
                </Typography>
              </div>
              <div
                style={{
                  width: "50%",
                  display: "flex",
                  justifyContent: "end",
                }}
              >
                <PrintButton
                  content={() => {
                    return printRef.current;
                  }}
                  buttonText="Print"
                />
                <IconButton color="secondary" onClick={close}>
                  <HighlightOffIcon />
                </IconButton>
              </div>
            </Grid>
            <Card>
              <CardContent ref={printRef}>
                <Grid item xs={12} spacing={1}>
                  <Typography
                    className={classes.typography}
                    align="center"
                    variant="h6"
                  >
                    {cardData[0]?.COMP_NM}
                  </Typography>
                </Grid>
                <Grid item xs={12} spacing={1}>
                  <Typography
                    className={classes.typography2}
                    align="center"
                    variant="h6"
                  >
                    {cardData[0]?.BRANCH_NM}
                  </Typography>
                </Grid>
                <Grid item xs={12} spacing={1}>
                  <Typography
                    className={classes.typography3}
                    align="center"
                    variant="h6"
                  >
                    {"LOCKER VISIT"}
                  </Typography>
                </Grid>
                <Typography align="center" variant="h6">
                  <span
                    style={{
                      letterSpacing: "8px",
                      width: "100%",
                    }}
                  >
                    {`----------------------------------------`}
                  </span>
                </Typography>
                <Grid item xs={12} className={classes.box}>
                  <Paper className={classes.label}> {t("dateTime")} : </Paper>
                  <Paper className={classes.textField}>
                    {cardData[0]?.ST_TIME}
                  </Paper>
                </Grid>
                <Grid item xs={12} className={classes.box}>
                  <Paper className={classes.label}>
                    {" "}
                    {t("lockerNumber")} :{" "}
                  </Paper>
                  <Paper className={classes.textField}>
                    {" "}
                    {cardData[0]?.LOCKER_NO}
                  </Paper>
                </Grid>
                <Grid item xs={12} className={classes.box}>
                  <Paper className={classes.label}> {t("keyNumber")} : </Paper>
                  <Paper className={classes.textField}>
                    {cardData[0]?.KEY_NO}
                  </Paper>
                </Grid>
                <Grid item xs={12} className={classes.box}>
                  <Paper className={classes.label}> {t("lockerSize")} : </Paper>
                  <Paper className={classes.textField}>
                    {cardData[0]?.SIZE_NM}
                  </Paper>
                </Grid>
                <Grid item xs={12} className={classes.box}>
                  <Paper className={classes.label}> {t("ACNo")} : </Paper>
                  <Paper className={classes.textField}>
                    {cardData[0]?.ACCT_NO}
                  </Paper>
                </Grid>

                <Grid item xs={12} className={classes.box}>
                  <Paper className={classes.label}> {t("visitor")} : </Paper>
                  <Paper className={classes.textField}>
                    {cardData[0]?.REMARKS}
                  </Paper>
                </Grid>
                <Grid item xs={12} className={classes.box}>
                  <Paper className={classes.label}>
                    {" "}
                    {t("todaysVisis")} :{" "}
                  </Paper>
                  <Paper className={classes.textField}>
                    {cardData[0]?.TOTAL_CNT}
                  </Paper>
                </Grid>
                <Typography align="center" variant="h6">
                  <span
                    style={{
                      letterSpacing: "8px",
                      width: "100%",
                    }}
                  >
                    {`----------------------------------------`}
                  </span>
                </Typography>
                <Grid item xs={12} className={classes.box}>
                  <Paper className={classes.label2}>
                    {" "}
                    {t("OfficerSign")} :{" "}
                  </Paper>
                  <Paper className={classes.textField}>
                    <br />
                    {""}
                  </Paper>
                </Grid>
                <Grid item xs={12} className={classes.box}>
                  <Paper className={classes.label2}> {t("staffName")} : </Paper>
                  <Paper className={classes.textField}>
                    {cardData[0]?.ENTERED_BY}
                  </Paper>
                </Grid>
              </CardContent>
            </Card>
          </div>
        </div>
      </Draggable>
    </div>
  );
};
