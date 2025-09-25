import React from "react";
import Draggable from "react-draggable";
import {
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  FormLabel,
  TextField,
} from "@mui/material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { makeStyles } from "@mui/styles";
import { useTranslation } from "react-i18next";

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
    justifyContent: "flex-end",
    alignItems: "center",
  },
  label: {
    fontWeight: 600,
    fontSize: "14px",
    marginRight: theme.spacing(1),
  },
  textField: {
    padding: "5px",
    borderRadius: "5px",
    width: "32vw",
  },
  input: {
    fontWeight: 500,
    padding: "5px 8px",
    fontColor: "black",
  },
  header: {
    background: "var(--theme-color5)",
    color: "var(--theme-color2)",
    display: "flex",
    paddingLeft: "10px",
    alignItems: "center",
    justifyContent: "space-between",
    "& .MuiButtonBase-root": {
      color: "var(--theme-color2) !important",
    },
  },
}));
export const CardPrinting = ({ cardData, setIsData }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div className={classes.modalOverlay}>
      <Draggable
        handle="#draggable-modal-title"
        cancel={'[class*="Mui-disabled"], input, textarea, select, button'}
      >
        <div className={classes.modalContent}>
          <div id="draggable-modal-title">
            <Card>
              <CardContent>
                <Grid item xs={12} className={classes?.header}>
                  <Typography align="center" variant="h6">
                    {t("CardPrinting")}
                  </Typography>
                  <IconButton
                    color="secondary"
                    onClick={() =>
                      setIsData((old) => ({ ...old, isOpenCard: false }))
                    }
                  >
                    <HighlightOffIcon />
                  </IconButton>
                </Grid>
                <Grid item xs={12} spacing={1} className={classes.box}>
                  <FormLabel className={classes.label}>
                    {t("Surname")} :
                  </FormLabel>
                  <TextField
                    disabled
                    className={classes.textField}
                    value={cardData?.SUR_NAME ?? ""}
                    InputProps={{
                      classes: { input: classes.input },
                    }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} className={classes.box}>
                  <FormLabel className={classes.label}>
                    {" "}
                    {t("FirstName")} :{" "}
                  </FormLabel>
                  <TextField
                    disabled
                    className={classes.textField}
                    value={cardData?.FIRST_NAME ?? ""}
                    InputProps={{
                      classes: { input: classes.input },
                    }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} className={classes.box}>
                  <FormLabel className={classes.label}>
                    {t("LastName")} :{" "}
                  </FormLabel>
                  <TextField
                    disabled
                    className={classes.textField}
                    value={cardData?.MIDDLE_NAME ?? ""}
                    InputProps={{
                      classes: { input: classes.input },
                    }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} className={classes.box}>
                  <FormLabel className={classes.label}>
                    {t("Add1")} :{" "}
                  </FormLabel>
                  <TextField
                    disabled
                    className={classes.textField}
                    value={cardData?.ADDRESS1 ?? ""}
                    InputProps={{
                      classes: { input: classes.input },
                    }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} className={classes.box}>
                  <FormLabel className={classes.label}>
                    {t("Add2")} :{" "}
                  </FormLabel>
                  <TextField
                    disabled
                    className={classes.textField}
                    value={cardData?.ADDRESS2 ?? ""}
                    InputProps={{
                      classes: { input: classes.input },
                    }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} className={classes.box}>
                  <FormLabel className={classes.label}>
                    {t("Add3")} :{" "}
                  </FormLabel>
                  <TextField
                    disabled
                    className={classes.textField}
                    value={cardData?.ADDRESS3 ?? ""}
                    style={{ width: "17vw" }}
                    InputProps={{
                      classes: { input: classes.input },
                    }}
                    variant="outlined"
                  />
                  <FormLabel className={classes.label}>
                    {t("Pincode")} :
                  </FormLabel>
                  <TextField
                    disabled
                    className={classes.textField}
                    value={cardData?.PINCODE ?? ""}
                    style={{ width: "10vw" }}
                    InputProps={{
                      classes: { input: classes.input },
                    }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} className={classes.box}>
                  <FormLabel className={classes.label}>
                    {t("City")} :{" "}
                  </FormLabel>
                  <TextField
                    disabled
                    className={classes.textField}
                    value={cardData?.CITY ?? ""}
                    style={{ width: "14.3vw" }}
                    InputProps={{
                      classes: { input: classes.input },
                    }}
                    variant="outlined"
                  />
                  <FormLabel className={classes.label}>
                    {t("State")} :
                  </FormLabel>
                  <TextField
                    disabled
                    className={classes.textField}
                    value={cardData?.STATE ?? ""}
                    style={{ width: "14vw" }}
                    InputProps={{
                      classes: { input: classes.input },
                    }}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} className={classes.box}>
                  <FormLabel className={classes.label}>
                    {" "}
                    {t("Branch")} :{" "}
                  </FormLabel>
                  <TextField
                    disabled
                    className={classes.textField}
                    value={cardData?.BRANCH_NAME ?? ""}
                    InputProps={{
                      classes: { input: classes.input },
                    }}
                    variant="outlined"
                  />
                </Grid>
              </CardContent>
            </Card>
          </div>
        </div>
      </Draggable>
    </div>
  );
};
