import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  IconButton,
  LinearProgress,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import RefreshIcon from "@mui/icons-material/Refresh";
import { SearchBar } from "@acuteinfo/common-base";
import { LinearProgressBarSpacer } from "components/common/custom/linerProgressBarSpacer";

const useHeaderStyles = makeStyles((theme: Theme) => ({
  title: {
    flex: "1 1 100%",
    color: "var(--theme-color2)",
    letterSpacing: "0.8px",
    fontSize: "1.4rem",
    textTransform: "capitalize",
  },
  container: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    padding: "3px 16px",
    justifyContent: "space-between",
    background: "var(--theme-color5)",
    borderTopLeftRadius: "5px",
    borderTopRightRadius: "5px",
  },
}));

type CustomGridHeaderProps = {
  isLoading?: boolean;
  setApiData: (data: any[]) => void;
  gridData: any[];
  headerContent?: string;
  metaData?: any;
  exportBtn?: boolean;
  refetchData?: () => void;
  filterPlaceHolder?: string;
};

export const CustomGridHeader: React.FC<CustomGridHeaderProps> = ({
  isLoading = false,
  setApiData,
  gridData,
  headerContent,
  metaData,
  exportBtn = false,
  refetchData,
  filterPlaceHolder,
}) => {
  const headerClasses = useHeaderStyles();
  const [originalData, setOriginalData] = useState<any[]>([]);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const searchTerm = e.target.value.toLowerCase();
      if (searchTerm === "") {
        setApiData(originalData);
      } else {
        const filteredValue = originalData.filter((item) =>
          Object.values(item).some(
            (value) =>
              value && value.toString().toLowerCase().includes(searchTerm)
          )
        );
        setApiData(filteredValue);
      }
    },
    [originalData, setApiData]
  );

  useEffect(() => {
    if (gridData && gridData !== originalData) {
      setOriginalData(gridData);
      setApiData(gridData);
    }
  }, [gridData, originalData, setApiData]);

  return (
    <>
      <Box className={headerClasses.container}>
        <Typography
          className={headerClasses.title}
          variant="h6"
          component="div"
        >
          {headerContent}
        </Typography>

        {refetchData && (
          <IconButton
            aria-label="refresh"
            onClick={refetchData}
            color="primary"
          >
            <RefreshIcon />
          </IconButton>
        )}

        <SearchBar onChange={handleSearch} placeholder={filterPlaceHolder} />

        {isLoading ? (
          <LinearProgress color="secondary" style={{ marginTop: "1px" }} />
        ) : (
          <LinearProgressBarSpacer />
        )}
      </Box>
    </>
  );
};
