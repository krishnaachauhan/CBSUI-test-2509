import { Bar } from "react-chartjs-2";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  useTheme,
  Tooltip,
} from "@mui/material";
import { Chart, CategoryScale, registerables } from "chart.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SelectWithoutOptions } from "@acuteinfo/common-base";
import { useMemo, useState } from "react";
import { GradientButton } from "@acuteinfo/common-base";
import { useTranslation } from "react-i18next";
import EnfinityLoader from "components/common/loader/EnfinityLoader";
Chart.register(CategoryScale);
Chart.register(...registerables);

export const Transactions = ({
  mutation,
  optionValue,
  setOptionValue,
  ...props
}) => {
  const theme = useTheme();
  const [showMore, setShowMore] = useState(false);
  const { t } = useTranslation();

  const showErrorData = () => {
    setShowMore(true);
  };
  const data = useMemo(() => {
    if (!optionValue || !mutation?.data) {
      return { datasets: [], labels: [] };
    }

    if (optionValue === "T") {
      // Group by TYPE_CD_NM and CONFIRMED
      const typeMap = {};
      mutation?.data?.forEach((item) => {
        const type = item?.TYPE_CD_NM;
        const status = item?.CONFIRMED;
        if (!typeMap?.[type]) {
          typeMap[type] = {
            Confirmed: 0,
            Pending: 0,
            Reject: 0,
            Amount: 0,
          };
        }
        if (status === "Confirmed") {
          typeMap[type].Confirmed += Number(item?.CNT ?? 0);
        } else if (status === "Pending") {
          typeMap[type].Pending += Number(item?.CNT ?? 0);
        } else if (status === "Reject") {
          typeMap[type].Reject += Number(item?.CNT ?? 0);
        }
        typeMap[type].Amount += Number(item?.AMOUNT ?? 0);
      });
      const displayLabels = Object.keys(typeMap);
      const displayConfirmData = displayLabels?.map(
        (type) => typeMap[type]?.Confirmed
      );
      const displayPendingData = displayLabels?.map(
        (type) => typeMap[type]?.Pending
      );
      const displayRejectData = displayLabels.map(
        (type) => typeMap[type]?.Reject
      );
      const displayAmounts = displayLabels?.map(
        (type) => typeMap[type]?.Amount
      );
      return {
        datasets: [
          {
            backgroundColor: "#4263c7",
            barPercentage: 1,
            barThickness: 12,
            borderRadius: 4,
            categoryPercentage: 1,
            data: displayConfirmData,
            label: t("Confirmed"),
            maxBarThickness: 10,
          },
          {
            backgroundColor: "#FB8C00",
            barPercentage: 1,
            barThickness: 12,
            borderRadius: 4,
            categoryPercentage: 1,
            data: displayPendingData,
            label: t("Pending"),
            maxBarThickness: 10,
          },
          {
            backgroundColor: "red",
            barPercentage: 1,
            barThickness: 12,
            borderRadius: 4,
            categoryPercentage: 1,
            data: displayRejectData,
            label: t("Reject"),
            maxBarThickness: 10,
          },
        ],
        labels: displayLabels,
        amounts: displayAmounts,
        rawTypeMap: typeMap,
      };
    } else if (optionValue === "S") {
      // Group by CONFIRMED status
      const statusOrder = ["Confirmed", "Reject", "Pending"];
      const statusMap = { Confirmed: 0, Reject: 0, Pending: 0 };
      const amountMap = { Confirmed: 0, Reject: 0, Pending: 0 };
      mutation.data.forEach((item) => {
        const status = item.CONFIRMED;
        statusMap[status] = (statusMap?.[status] ?? 0) + Number(item?.CNT ?? 0);
        amountMap[status] =
          (amountMap?.[status] ?? 0) + Number(item?.AMOUNT ?? 0);
      });
      const displayData = statusOrder?.map((status) => statusMap?.[status]);
      const displayLabels = statusOrder?.map(
        (status) => `${status?.toUpperCase()} (${statusMap?.[status]})`
      );
      const displayAmounts = statusOrder?.map((status) => amountMap?.[status]);
      return {
        datasets: [
          {
            backgroundColor: "#4263c7",
            barPercentage: 1,
            barThickness: 12,
            borderRadius: 4,
            categoryPercentage: 1,
            data: displayData,
            label: t("Transaction"),
            maxBarThickness: 10,
            amounts: displayAmounts,
          },
        ],
        labels: displayLabels,
        amounts: displayAmounts,
      };
    }
  }, [mutation?.data, optionValue, t]);
  const options = {
    animation: false,
    cornerRadius: 20,
    layout: { padding: 0 },
    legend: { display: false },
    maintainAspectRatio: false,
    responsive: true,
    xAxes: [
      {
        ticks: {
          fontColor: theme.palette.text.secondary,
        },
        gridLines: {
          display: false,
          drawBorder: false,
        },
      },
    ],
    yAxes: [
      {
        ticks: {
          fontColor: theme.palette.text.secondary,
          beginAtZero: true,
          min: 0,
        },
        gridLines: {
          borderDash: [2],
          borderDashOffset: [2],
          color: theme.palette.divider,
          drawBorder: false,
          zeroLineBorderDash: [2],
          zeroLineBorderDashOffset: [2],
          zeroLineColor: theme.palette.divider,
        },
      },
    ],
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

  return (
    <Card
      {...props}
      style={{ borderRadius: "20px", position: "relative" }}
      className="transaction-graph-card"
    >
      <EnfinityLoader loading={mutation.isLoading} />
      <CardHeader
        action={
          <div style={{ width: "200px" }}>
            <SelectWithoutOptions
              value={optionValue}
              error={""}
              touched={false}
              size="small"
              variant="outlined"
              handleChange={(e) => {
                setOptionValue(e.target.value);
              }}
              options={[
                { label: t("TransactionType"), value: "T" },
                { label: t("TransactionStatus"), value: "S" },
              ]}
              loadingOptions={false}
              multiple={false}
              showCheckbox={false}
              fullWidth
              disabled={mutation.isLoading || mutation.isFetching}
            />
          </div>
        }
        title={t("TodaysTransaction")}
        style={{ color: "var(--theme-color3)" }}
      />
      <Divider />
      <CardContent style={{ padding: "10px", height: "61vh" }}>
        <Box
          sx={{
            height: "98%",
            position: "relative",
          }}
        >
          <Bar data={data} options={options} />
        </Box>
      </CardContent>
      <Divider />
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          height: "32px",
          pt: 1,
          marginRight: "10px",
        }}
      >
        {mutation.isError || mutation.isLoading || mutation.isFetching ? (
          <>
            {mutation.isError ? (
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
              </>
            ) : (
              <>
                <Tooltip title={"Feching..."} style={{ paddingRight: "10px" }}>
                  <span>
                    <FontAwesomeIcon
                      icon={["fas", "spinner"]}
                      className={"rotating"}
                    />
                  </span>
                </Tooltip>
              </>
            )}
          </>
        ) : (
          <></>
        )}
      </Box>
      {mutation.isError ? (
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
              {mutation.error?.error_msg ?? "Error"}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <GradientButton onClick={() => setShowMore(false)}>
              OK
            </GradientButton>
          </DialogActions>
        </Dialog>
      ) : null}
    </Card>
  );
};
