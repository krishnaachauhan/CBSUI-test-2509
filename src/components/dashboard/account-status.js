import { useMemo, useContext } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement } from "chart.js";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
} from "@mui/material";

import CancelIcon from "@mui/icons-material/Cancel";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import SavingsIcon from "@mui/icons-material/Savings";
import { useQuery } from "react-query";
import * as API from "./api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { GradientButton } from "@acuteinfo/common-base";
import { AuthContext } from "pages_audit/auth";
import { wrap } from "lodash";
import { useTranslation } from "react-i18next";
Chart.register(ArcElement);

export const AccountStatus = (props) => {
  const theme = useTheme();
  const [showMore, setShowMore] = useState(false);
  const { authState } = useContext(AuthContext);
  const { t } = useTranslation();
  let reqID = Math.floor(new Date().getTime() / 300000);
  const result = useQuery(["getAccountStatusData", reqID], () =>
    API.getAccountStatusData({
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
    })
  );
  const showErrorData = () => {
    setShowMore(true);
  };
  const getPerData = (value, totalLoginUser) => {
    return (
      Number.parseFloat(
        totalLoginUser > 0 && Number.parseInt(value) > 0
          ? (Number.parseInt(value) / totalLoginUser) * 100
          : Boolean(value)
          ? value
          : "0"
      ).toFixed(2) + "%"
    );
  };
  const data = {
    datasets: [
      {
        data: [
          result?.data?.[0]?.OPEN,
          result?.data?.[0]?.CLOSE,
          result?.data?.[0]?.INOPERATIVE,
          result?.data?.[0]?.UNCLAIMED,
          result?.data?.[0]?.DORMANT,
          result?.data?.[0]?.FREEZE,
        ],
        backgroundColor: [
          "#3F51B5",
          "#e53935",
          "#FB8C00",
          "#42c746",
          "#f6f937",
          "#f93791",
        ],
        borderWidth: 8,
        borderColor: "#FFFFFF",
        hoverBorderColor: "#FFFFFF",
      },
    ],
    labels: [
      t("Open"),
      t("Close"),
      t("Inoperative"),
      t("Unclaimed"),
      t("Dormant"),
      t("Freeze"),
    ],
  };

  const options = {
    animation: false,
    cutoutPercentage: 80,
    layout: { padding: 0 },
    legend: {
      display: false,
    },
    maintainAspectRatio: false,
    responsive: true,
    tooltips: {
      backgroundColor: theme.palette.background.paper,
      bodyFontColor: theme.palette.text.secondary,
      borderColor: theme.palette.divider,
      borderWidth: 1,
      enabled: true,
      footerFontColor: theme.palette.text.secondary,
      intersect: false,
      mode: "index",
      titleFontColor: theme.palette.text.primary,
    },
  };

  const devices = useMemo(() => {
    return [
      {
        title: "Open",
        value: result?.data?.[0]?.OPEN ?? "0",
        icon: VerifiedUserIcon,
        color: "#3F51B5",
      },
      {
        title: "Close",
        value: result?.data?.[0]?.CLOSE ?? "0",
        icon: CancelIcon,
        color: "#E53935",
      },
      {
        title: "Inoperative",
        value: result?.data?.[0]?.INOPERATIVE ?? "0",
        icon: PersonAddAlt1Icon,
        color: "#FB8C00",
      },
      {
        title: "Unclaimed",
        value: result?.data?.[0]?.UNCLAIMED ?? "0",
        icon: SavingsIcon,
        color: "#42c746",
      },
      {
        title: "Dormant",
        value: result?.data?.[0]?.DORMANT ?? "0",
        icon: PersonSearchIcon,
        color: "#f6f937",
      },
      {
        title: "Freeze",
        value: result?.data?.[0]?.FREEZE ?? "0",
        icon: AcUnitIcon,
        color: "#f93791",
      },
    ];
  }, [result.data]);
  const totalLoginUser = useMemo(() => {
    let total = devices.reduce((accu, item) => {
      if (!isNaN(item.value)) {
        accu += Number.parseInt(item.value);
      }
      return accu;
    }, 0);
    return total;
  }, [devices]);

  return (
    <>
      <Card
        {...props}
        style={{ borderRadius: "20px" }}
        className="account-view-card"
      >
        <CardHeader
          title={t("AccountStatus")}
          style={{ color: "var(--theme-color3)" }}
        />
        <Divider />
        <CardContent style={{ padding: "10px", height: "62.6vh" }}>
          <Box
            sx={{
              height: "50%",
              position: "relative",
            }}
          >
            <Doughnut data={data} options={options} />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              pt: 1,
            }}
          >
            {devices.map(({ color, icon: Icon, title, value }) => (
              <Box
                key={title}
                sx={{
                  p: 1,
                  textAlign: "center",
                }}
              >
                <Icon color="action" style={{ fontSize: "25px" }} />
                <Typography color="textPrimary" variant="body1">
                  {t(title)}
                </Typography>
                <Typography style={{ color }} variant="h6">
                  {getPerData(value, totalLoginUser)}
                </Typography>
              </Box>
            ))}
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "right",
              pt: 2,
            }}
            style={{ paddingTop: "0px" }}
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
          </Box>
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
