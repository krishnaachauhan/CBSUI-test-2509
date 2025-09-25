import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
  Tooltip,
  Divider,
} from "@mui/material";
import { GradientButton } from "@acuteinfo/common-base";
import "pages_audit/sideBar/icons";
import { lazy, useContext, useState } from "react";
import { useQuery } from "react-query";
import * as API from "./api";
import "./style.css";
import { useStyles } from "pages_audit/style";
import { AuthContext } from "pages_audit/auth";
import * as SvgIcon from "assets/icons/svgIcons";
export const DashboardBox = ({
  title = "",
  body = "",
  isSequencs = "",
  // icon = "home",
  icon,
  apiName = "",
  isBackground = "",
  visibility = false,
}) => {
  // const NNNN = icon.charAt(0).toUpperCase() + icon.slice(1);
  const SvgIcons = SvgIcon?.[icon] || null;
  const [showMore, setShowMore] = useState(false);
  const classes = useStyles();
  const { authState } = useContext(AuthContext);
  let reqID = Math.floor(new Date().getTime() / 300000);
  const result = useQuery(["getDynamicBoxData", apiName, reqID], () =>
    API.getDynamicBoxData(apiName, {
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
      USER_ID: authState?.user?.id ?? "",
      WORKING_DT: authState?.workingDate,
    })
  );

  const showErrorData = () => {
    setShowMore(true);
  };
  return (
    <>
      <Card
        sx={{
          // height: "14vh",
          // width: "34vh",
          borderRadius: "15px",
          border: "0.5px solid #EBEDEE",
          // boxShadow: "none",

          boxShadow:
            "rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px",
          // backgroundColor:
          //   body === "Follow Up done"
          //     ? "#E2ECFD"
          //     : body === "Follow Up"
          //     ? "#E2ECFD"
          //     : body === "Reject Transactions"
          //     ? "#FFE5EB"
          //     : body === "Reject Request"
          //     ? "#FFE5EB"
          //     : body === "Pending Request"
          //     ? "#efe0c680"
          //     : body === "Confirm Request"
          //     ? "#d7f1c8b0"
          //     : body === "Confirmed Transactions"
          //     ? "#d7f1c8b0"
          //     : null,
        }}
      >
        <CardContent style={{ height: "80px", padding: "10px", margin: "5px" }}>
          <Grid
            container
            // spacing={2}
            sx={{
              // justifyContent: "space-between",
              display: "flex",
              flexDirection: "row",
            }}
          >
            <Grid item style={{ flexGrow: 1 }}>
              <Typography
                // gutterBottom
                // variant="overline"
                style={{
                  color: "var(--theme-color3)",
                  fontSize: "23px",
                  fontWeight: "500",
                  letterSpacing: "0.01em",
                  marginBottom: "0px",
                }}
              >{`${result?.data?.[0]?.BOX_BODY ?? body}`}</Typography>
              <Divider
                style={{ borderColor: "var(--theme-color3)", width: "21vh" }}
              />
              <Typography
                variant="h3"
                style={{
                  color: "#949597",
                  fontSize: "13px",
                  fontWeight: "500",
                  marginTop: "5px",
                }}
              >
                {`${title}`}
              </Typography>
            </Grid>
            <Grid
              item
              sx={{
                alignSelf: "center",
              }}
            >
              {/* <Avatar
                className={classes.avtar}
                sx={{
                  backgroundColor: "error.main",
                  height: 40,
                  width: 40,
                  top: "10px",
                  // boxShadow:
                  //   "rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset",
                }}
                style={{
                  backgroundColor: "var(--theme-color2)",
                  color: "var(--theme-color2)",
                }}
              > */}
              {/* {Boolean(icon) ? (
                  <FontAwesomeIcon
                    icon={["fa", icon]}
                    // className={classes.icon}
                    className={"avtar"}
                  />
                ) : null} */}
              <SvgIcons height={37} width={37} />
              {/* </Avatar> */}
              <div
                // className="rotating"
                style={{
                  flex: "auto",
                  textAlign: "right",
                  marginTop: "10px",
                }}
              >
                {result.isError || result.isLoading || result.isFetching ? (
                  <>
                    {result.isError ? (
                      <>
                        <Tooltip title={"Error"}>
                          <span>
                            <FontAwesomeIcon
                              icon={["fas", "circle-exclamation"]}
                              color={"red"}
                              style={{ cursor: "pointer" }}
                              onClick={showErrorData}
                            />
                          </span>
                        </Tooltip>
                        <Tooltip title={"Refetch"}>
                          <span>
                            <FontAwesomeIcon
                              icon={["fas", "rotate-right"]}
                              color={"var(--theme-color1)"}
                              style={{ cursor: "pointer", marginLeft: "3px" }}
                              onClick={() => {
                                result.refetch();
                              }}
                            />
                          </span>
                        </Tooltip>
                      </>
                    ) : (
                      <Tooltip title={"Feching..."}>
                        <span>
                          <FontAwesomeIcon
                            icon={["fas", "spinner"]}
                            className={"rotating"}
                          />
                        </span>
                      </Tooltip>
                    )}
                  </>
                ) : (
                  <>
                    <Tooltip title={"Refresh"}>
                      <span>
                        <FontAwesomeIcon
                          icon={["fas", "rotate-right"]}
                          color={"var(--theme-color1)"}
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            result.refetch();
                          }}
                        />
                      </span>
                    </Tooltip>
                  </>
                )}
              </div>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {result.isError ? (
        <Dialog
          open={showMore}
          fullWidth={false}
          onKeyUp={(event) => {
            if (event.key === "Escape") {
              setShowMore(false);
            }
          }}
        >
          <DialogTitle>Error Details</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {result.error?.error_msg ?? "Error"}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <GradientButton onClick={() => setShowMore(false)}>
              OK
            </GradientButton>
          </DialogActions>
        </Dialog>
      ) : null}
    </>
  );
};
