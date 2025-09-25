//UI
import { Button, Tooltip, CircularProgress } from "@mui/material";
import { Grid } from "@mui/material";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import * as trn2Api from "../TRN002/api";
//logic
import "./CommonFooter.css";
import React, { useEffect, useState, useContext, memo } from "react";
import { useMutation } from "react-query";
import { useLocation } from "react-router-dom";
import { useSnackbar } from "notistack";
import { AuthContext, AccDetailContext } from "pages_audit/auth";
import * as API from "./api";
import Paper, { PaperProps } from "@mui/material/Paper";
import Draggable from "react-draggable";

function PaperComponent(props: PaperProps) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}
const CommonFooter = ({
  viewOnly,
  handleViewAll,
  handleRefresh,
  handleFilterByScroll,
  filteredRows,
}) => {
  if (!filteredRows) {
    filteredRows = []; /// /// /// /// ///
  }

  const [scrollDeleteDialog, setScrollDeleteDialog] = useState(false);
  const [scrollConfirmDialog, setScrollConfirmDialog] = useState(false);
  const [otherTrxDialog, setOtherTrxDialog] = useState(false);

  const [scrollNo, setScrollNo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTrn1, setIsTrn1] = useState(true);
  const [isConfirmedRec, setIsConfirmedRec] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const { authState } = useContext(AuthContext);
  const { tempStore, setTempStore } = useContext(AccDetailContext);
  const location = useLocation();

  useEffect(() => {
    let abc = filteredRows && filteredRows?.some((a) => a?.CONFIRMED === "Y");
    setIsConfirmedRec(abc); /// /// /// /// ///
  }, [filteredRows]);

  useEffect(() => {
    handleSetRemarks();
  }, [location]);

  //api define
  const confirmScroll = useMutation(trn2Api.confirmScroll, {
    onSuccess: (data) => {
      setLoading(false);
      setScrollConfirmDialog(false);
      setScrollNo("");
      enqueueSnackbar("Record Confirm", {
        variant: "success",
      });
      if (isTrn1) {
        viewOnly && setTempStore({ ...tempStore, refresh: Math.random() }); // add new method to display tabs
      } else {
        handleRefresh();
      }
    },
    onError: (error: any) => {
      setScrollConfirmDialog(false);
      enqueueSnackbar(error?.error_msg, {
        variant: "error",
      });
    },
  });
  const deleteByScrollNo = useMutation(API.deleteScrollByScrollNo, {
    onSuccess: (data: any) => {
      setLoading(false);
      setScrollDeleteDialog(false);
      setScrollNo("");
      handleSetRemarks();
      if (data?.messageDetails) {
        enqueueSnackbar(data?.messageDetails, {
          variant: "success",
        });
      }

      if (isTrn1) {
        viewOnly && setTempStore({ ...tempStore, refresh: Math.random() }); //
      } else {
        handleRefresh();
      }
    },
    onError: (error: any) => {
      setLoading(false);
      enqueueSnackbar(error?.error_msg, {
        variant: "error",
      });
    },
  });

  //fns define
  const handleSetRemarks = () => {
    let msg = "WRONG ENTRY FROM DAILY TRAN";
    if (location.pathname.includes("/cnf_daily_tran_F2")) {
      setRemarks(msg + " CONFIRMATION (F2) (TRN/002)");
      setIsTrn1(false);
    } else {
      setRemarks(msg + " MAKER (TRN/001)");

      setIsTrn1(true);
    }
  };

  const handleConfirmScroll = () => {
    setLoading(true);
    let data = {
      TRAN_CD: filteredRows[0]?.TRAN_CD,
      COMP_CD: filteredRows[0]?.COMP_CD,
      ENTERED_COMP_CD: filteredRows[0]?.COMP_CD,
      ENTERED_BRANCH_CD: filteredRows[0]?.BRANCH_CD,
      scrollNo: scrollNo,
      ACCT_TYPE: filteredRows[0]?.ACCT_TYPE,
      ACCT_CD: filteredRows[0]?.ACCT_CD,
      CONFIRMED: "Y",
      CONFIRM_FLAG: "Y",
      TYPE_CD: filteredRows[0]?.TYPE_CD,
      AMOUNT: filteredRows[0]?.AMOUNT,
      SCREEN_REF: "ETRN/002",
    };
    confirmScroll.mutate(data);
  };

  const handleDeleteScroll = () => {
    let data = {
      COMP_CD: authState.companyID,
      BRANCH_CD: authState?.user?.branchCode,

      SCROLL_NO: scrollNo,
      USER_DEF_REMARKS: remarks,

      ACCT_TYPE: filteredRows[0]?.ACCT_TYPE,
      ACCT_CD: filteredRows[0]?.ACCT_CD,
      TRAN_AMOUNT: filteredRows[0]?.AMOUNT,
      ENTERED_COMP_CD: filteredRows[0]?.COMP_CD,
      ENTERED_BRANCH_CD: filteredRows[0]?.BRANCH_CD,
      ACTIVITY_TYPE: "DAILY TRANSACTION",
      TRAN_DT: filteredRows[0]?.TRAN_DT,
      CONFIRM_FLAG: filteredRows[0]?.CONFIRMED,
      CONFIRMED: filteredRows[0]?.CONFIRMED,
    };
    if (!scrollNo) {
      return enqueueSnackbar("Kindly enter Scroll No", {
        variant: "error",
      });
    }

    if (remarks?.length < 5) {
      return enqueueSnackbar("Kindly enter Remarks of atleast 5 Characters", {
        variant: "error",
      });
    }
    if (!data?.ACCT_CD) {
      return enqueueSnackbar("No records found", {
        variant: "error",
      });
    }

    if (data?.ACCT_CD && scrollNo && remarks?.length > 4) {
      setLoading(true);
      deleteByScrollNo.mutate(data);
    }
  };

  const handleScroll = (txt) => {
    txt.toString();
    if (!txt) {
      txt = "";
    }
    setScrollNo(txt);
    handleFilterByScroll(txt);
  };

  const handleCancelDeleteScroll = () => {
    setScrollDeleteDialog(false);
    setScrollConfirmDialog(false);
    setScrollNo("");
    handleScroll("");
  };

  return (
    <>
      <Grid
        container
        spacing={2}
        style={{ marginTop: "5px", marginBottom: "15px" }}
      >
        {" "}
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.open("Calculator:///")}
          >
            Calculator
          </Button>
        </Grid>{" "}
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              viewOnly && isTrn1 ? handleRefresh() : handleViewAll();
            }}
          >
            {viewOnly && isTrn1 ? "Go Back" : "View All"}
          </Button>
        </Grid>
        {viewOnly && (
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setScrollDeleteDialog(true)}
            >
              Scroll Delete
            </Button>
          </Grid>
        )}
        {viewOnly && !isTrn1 && (
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setScrollConfirmDialog(true)}
            >
              Scroll Confirm
            </Button>
          </Grid>
        )}
      </Grid>
      <br />
      <>
        <Dialog
          maxWidth="lg"
          open={scrollDeleteDialog || scrollConfirmDialog}
          aria-describedby="alert-dialog-description"
          PaperComponent={PaperComponent}
          aria-labelledby="draggable-dialog-title"
        >
          <DialogTitle
            style={{
              cursor: "move",
            }}
            id="draggable-dialog-title"
          >
            <div className="dialogTitle" style={{ padding: "10px" }}>
              {scrollConfirmDialog ? "Scroll Confirmation" : " Scroll Delete"}
            </div>
          </DialogTitle>
          <DialogContent>
            <br />
            <TextField
              style={{ minWidth: "300px" }}
              fullWidth={true}
              value={scrollNo}
              placeholder="Enter ScrollNo"
              type="number"
              onChange={(e) => handleScroll(e.target.value)}
              onBlur={(e) => handleScroll(e.target.value)}
              label="Scroll No."
              variant="outlined"
              color="secondary"
            />

            {isConfirmedRec && !scrollConfirmDialog && (
              <h4>
                Scroll No. {scrollNo} is confirmed. Are you sure you wish to
                Delete ?
              </h4>
            )}

            {isConfirmedRec && scrollConfirmDialog && (
              <h4>Scroll No. {scrollNo} is already confirmed</h4>
            )}
            <br />

            {scrollConfirmDialog ? (
              ""
            ) : (
              <TextField
                style={{ minWidth: "400px", marginTop: "20px" }}
                fullWidth={true}
                value={remarks}
                placeholder="Enter Remarks"
                onChange={(e) => setRemarks(e.target.value)}
                label="Remarks"
                variant="outlined"
                color="secondary"
              />
            )}
          </DialogContent>

          <DialogActions className="dialogFooter">
            {isConfirmedRec && scrollConfirmDialog ? (
              <></>
            ) : (
              <Button
                className="dialogBtn"
                color="secondary"
                variant="contained"
                onClick={() =>
                  scrollConfirmDialog
                    ? handleConfirmScroll()
                    : handleDeleteScroll()
                }
                autoFocus
              >
                {scrollConfirmDialog ? "Confirm" : "Delete"}
                {!loading ? (
                  ""
                ) : (
                  <CircularProgress size={20} sx={{ marginLeft: "10px" }} />
                )}
              </Button>
            )}

            <Button
              className="dialogBtn"
              onClick={() => handleCancelDeleteScroll()}
              variant="contained"
              color="secondary"
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </>
    </>
  );
};
export default memo(CommonFooter); /// /// /// /// ///
