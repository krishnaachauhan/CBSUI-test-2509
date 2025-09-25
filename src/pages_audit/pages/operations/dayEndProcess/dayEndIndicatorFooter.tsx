import React from "react";
import { Paper, Typography, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { GradientButton, LoadingTextAnimation } from "@acuteinfo/common-base";

type Props = {
  gridData: any[];
  processFlag: string;
  DoEodMutation: { isLoading: boolean };
  sessionDtlMutation: { isLoading: boolean };
  updateRunningMutation: { isLoading: boolean };
  state: { loopStart?: boolean };
  flag: string;
  handleLoopStart: () => void;
  close: () => void;
};

const DayEndFooter: React.FC<Props> = ({
  gridData,
  processFlag,
  DoEodMutation,
  sessionDtlMutation,
  updateRunningMutation,
  state,
  flag,
  handleLoopStart,
  close,
}) => {
  const { t } = useTranslation();

  const isLoading =
    updateRunningMutation.isLoading ||
    DoEodMutation?.isLoading ||
    sessionDtlMutation?.isLoading;

  return (
    <Paper
      style={{
        display: "flex",
        height: "20%",
        justifyContent: "space-between",
        padding: "8px 10px 10px 8px",
      }}
    >
      {/* Left Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Total Records */}
        <Typography
          component="span"
          variant="subtitle2"
          style={{
            whiteSpace: "nowrap",
            paddingInline: "33px",
          }}
        >
          {t("TotalNoofrecords")} {gridData.length}
        </Typography>

        {/* Chips */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "1px" }}>
          <Chip
            label="Success"
            variant="outlined"
            style={{
              backgroundColor: "rgb(130, 224, 170)",
              color: "white",
            }}
          />
          <Chip
            label="In Process"
            variant="outlined"
            style={{
              backgroundColor: "rgb(40, 180, 99)",
              color: "white",
            }}
          />
          <Chip
            label="Warning"
            variant="outlined"
            style={{
              backgroundColor: "rgb(244, 208, 63)",
              color: "white",
            }}
          />
          <Chip
            label="Error"
            variant="outlined"
            style={{
              backgroundColor: "rgb(241, 148, 138)",
              color: "white",
            }}
          />
        </div>

        {/* Progress Indicator */}
        <div
          style={{
            whiteSpace: "nowrap",
            paddingLeft: "33px",
            display: "flex",
            alignContent: "center",
            justifyContent: "center",
            width: "600px",
          }}
        >
          {DoEodMutation?.isLoading || sessionDtlMutation?.isLoading
            ? `Checksum Executed. Doing ${processFlag}`
            : ""}

          {isLoading && (
            <div style={{ marginLeft: "12px" }}>
              <LoadingTextAnimation />
            </div>
          )}
        </div>
      </div>

      {/* Right Section (Buttons) */}
      <div>
        {state?.loopStart && flag === "D" && (
          <GradientButton
            disabled={isLoading}
            onClick={handleLoopStart}
            color="primary"
          >
            {t("start")}
          </GradientButton>
        )}

        {state?.loopStart && (
          <GradientButton disabled={isLoading} onClick={close} color="primary">
            {t("Close")}
          </GradientButton>
        )}
      </div>
    </Paper>
  );
};

export default DayEndFooter;
