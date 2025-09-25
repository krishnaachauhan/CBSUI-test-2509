import { useWorkerContext, EXPORT_WORKER_STATUS } from "@acuteinfo/common-base";

import { useState, forwardRef, useCallback, useEffect, useRef } from "react";
import clsx from "clsx";
import { makeStyles } from "@mui/styles";
import { useSnackbar, SnackbarContent, CustomContentProps } from "notistack";
import Collapse from "@mui/material/Collapse";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PrintIcon from "@mui/icons-material/Print";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import { LinearProgress, Stack } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

const useStyles = makeStyles(() => ({
  root: {
    "@media (min-width:600px)": {
      minWidth: "344px !important",
    },
  },
  card: {
    width: "100%",
  },
  typography: {
    color: "var(--theme-color1)",
  },
  actionRoot: {
    padding: "8px 8px 8px 16px",
    justifyContent: "space-between",
  },
  icons: {
    marginLeft: "auto",
  },
  expand: {
    padding: "8px 8px",
    transform: "rotate(0deg)",
    color: "var(--theme-color1)",
    transition: "all .2s",
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
  paper: {
    backgroundColor: "#fff",
    padding: 16,

    "& span": {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: ".5rem",
    },
  },
  checkIcon: {
    fontSize: 20,
    paddingRight: 4,
  },
  button: {
    padding: 0,
    textTransform: "none",
  },
}));

export const CustomSnackbarContent = forwardRef<
  HTMLDivElement,
  CustomContentProps
>(({ id, ...props }, ref) => {
  const { status, workerQueue, setWorkerQueue } = useWorkerContext();
  const classes = useStyles();
  const { closeSnackbar } = useSnackbar();
  const [expanded, setExpanded] = useState(true);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const handleExpandClick = useCallback(() => {
    setExpanded((oldExpanded) => !oldExpanded);
  }, []);

  const handlePrint = useCallback((url) => {
    if (frameRef.current) {
      frameRef.current.src = url;
      setTimeout(() => {
        window.frames["printFrame"].print();
      }, 50);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setWorkerQueue((prevQueue) => {
      if (prevQueue.length === 0) return prevQueue; // Prevent unnecessary updates. Do not use setWorkerQueue([]) directly.
      return [];
    });
    closeSnackbar(id);
  }, [id, closeSnackbar, setWorkerQueue]);

  useEffect(() => {
    if (workerQueue.length === 0) {
      handleDismiss();
    }
  }, [workerQueue, handleDismiss]);

  return (
    <>
      <SnackbarContent ref={ref} className={classes.root}>
        <Card
          className={classes.card}
          style={{ backgroundColor: "var(--theme-color4)" }}
        >
          <CardActions classes={{ root: classes.actionRoot }}>
            <Typography variant="h6" className={classes.typography}>
              <ImportExportIcon />
              &nbsp;{props.message}
            </Typography>
            <div className={classes.icons}>
              <IconButton
                aria-label="Show more"
                size="small"
                className={clsx(classes.expand, {
                  [classes.expandOpen]: expanded,
                })}
                onClick={handleExpandClick}
              >
                <ExpandMoreIcon />
              </IconButton>
              <IconButton
                size="small"
                className={classes.expand}
                onClick={handleDismiss}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
          </CardActions>
          {status.excelStatus === EXPORT_WORKER_STATUS.RUNNING ||
          status.pdfStatus === EXPORT_WORKER_STATUS.RUNNING ||
          status.csvStatus === EXPORT_WORKER_STATUS.RUNNING ||
          status.textStatus === EXPORT_WORKER_STATUS.RUNNING ||
          status.xmlStatus === EXPORT_WORKER_STATUS.RUNNING ||
          status.htmlStatus === EXPORT_WORKER_STATUS.RUNNING ? (
            <LinearProgress color="secondary" />
          ) : null}
          <Collapse
            style={{ maxHeight: "124px", overflowY: "auto" }}
            in={expanded}
            timeout="auto"
            unmountOnExit
          >
            <Paper className={classes.paper}>
              <Stack
                gap={1}
                divider={
                  <div
                    style={{
                      height: "1px",
                      width: "100%",
                      background: "#e7e7e7",
                    }}
                  />
                }
              >
                {workerQueue.map((queue) => (
                  <Typography
                    gutterBottom
                    variant="body2"
                    style={{ display: "block" }}
                  >
                    {!queue.isCompleted ? (
                      <span style={{ color: "#aaa" }}>
                        {queue.title}...
                        <CircularProgress size={16} color="secondary" />
                      </span>
                    ) : (
                      <>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="subtitle2" component={"span"}>
                            {queue.title}
                          </Typography>
                          <span
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            {queue?.enablePdfPrint &&
                            queue?.type === "pdf" &&
                            Boolean(queue?.url) ? (
                              <IconButton
                                size="small"
                                onClick={() => handlePrint(queue.url)}
                              >
                                <PrintIcon
                                  fontSize="small"
                                  sx={{ color: "#333" }}
                                />
                              </IconButton>
                            ) : null}
                            <CheckCircleIcon fontSize="small" color="success" />
                          </span>
                        </span>
                      </>
                    )}
                  </Typography>
                ))}
              </Stack>
            </Paper>
          </Collapse>
        </Card>
      </SnackbarContent>
      <iframe
        id="printFrame"
        src={""}
        ref={frameRef}
        name="printFrame"
        title="printFrame"
        style={{ display: "none" }}
      ></iframe>
    </>
  );
});
