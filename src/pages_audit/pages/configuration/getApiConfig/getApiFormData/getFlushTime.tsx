import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { t } from "i18next";

const KeyValueTable = ({ data }) => {
  const entries = data?.length ? Object.entries(data[0]) : [];

  return (
    <TableContainer component={Paper} sx={{ maxHeight: "38vh" }}>
      <Table stickyHeader sx={{ padding: "10px" }}>
        <TableHead>
          <TableRow>
            <TableCell padding={"none"}>
              <h3
                style={{
                  fontSize: "20px",
                  color: "var(--theme-color3)",
                }}
              >
                {t("ActiveRedisKey")}
              </h3>
            </TableCell>
            <TableCell padding={"none"}>
              <h3
                style={{
                  fontSize: "20px",
                  color: "var(--theme-color3)",
                }}
              >
                {t("ExpiredTime")}
              </h3>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries?.map(([key, value], index) => (
            <TableRow key={index}>
              <TableCell sx={{ fontSize: "16px" }} padding={"none"}>
                {key}
              </TableCell>
              <TableCell padding={"none"}>
                {<CountdownTimer minutes={value} />}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default KeyValueTable;

export const CountdownTimer = ({ minutes }) => {
  const totalSeconds = minutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [totalSeconds]);

  const progress = (secondsLeft / totalSeconds) * 100;

  const displayHours = Math.floor(secondsLeft / 3600);
  const displayMinutes = Math.floor((secondsLeft % 3600) / 60);
  const displaySeconds = secondsLeft % 60;

  const formatTime = (num) => num.toString().padStart(2, "0");

  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress
        variant="determinate"
        sx={{ color: "var(--theme-color3)" }}
        value={progress}
        size={59}
      />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography
          fontWeight={600}
          sx={{ color: "rgb(0 0 0)" }}
          variant="caption"
          component="div"
          color="textSecondary"
        >
          {`${formatTime(displayHours)}:${formatTime(
            displayMinutes
          )}:${formatTime(displaySeconds)}`}
        </Typography>
      </Box>
    </Box>
  );
};
