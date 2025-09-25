import React, { useCallback, useEffect } from "react";
import {
  ActionTypes,
  Alert,
  GridMetaDataType,
  GridWrapper,
  queryClient,
} from "@acuteinfo/common-base";
import { AppBar, Box, Dialog } from "@mui/material";
import { useMutation } from "react-query";
import { getScrollListData } from "./api";
import { scrollListMetadataData } from "./scrollListGridMetadata";

const ScrollList = ({
  setIsOpenScrollList,
  handleDeletByScroll,
  batchdata,
}) => {
  const [flag, setFlag] = React.useState<any>("C");
  const [gridData, setGridData] = React.useState<any>([]);

  const actions: ActionTypes[] = [
    {
      actionName: "viewConfirmed",
      actionLabel: "View Confirmed",
      multiple: false,
      rowDoubleClick: false,
      isNodataThenShow: true,
      alwaysAvailable: true,
      shouldExclude: (data) => {
        if (flag === "C") {
          return false;
        } else {
          return true;
        }
      },
    },
    {
      actionName: "viewPending",
      actionLabel: "View Pending",
      multiple: false,
      rowDoubleClick: false,
      alwaysAvailable: true,
      isNodataThenShow: true,
      shouldExclude: (data) => {
        if (flag === "P") {
          return false;
        } else {
          return true;
        }
      },
    },
    // {
    //   actionName: "scrollDelete",
    //   actionLabel: "Scroll Delete",
    //   multiple: false,
    //   rowDoubleClick: false,
    //   alwaysAvailable: false,
    // },
    {
      actionName: "ok",
      actionLabel: "Ok",
      multiple: false,
      rowDoubleClick: true,
      alwaysAvailable: false,
    },

    {
      actionName: "Close",
      actionLabel: "Close",
      multiple: undefined,
      rowDoubleClick: false,
      isNodataThenShow: true,
      alwaysAvailable: true,
    },
  ];

  const scrollData: any = useMutation("getScrollListData", getScrollListData, {
    onSuccess(data) {
      setGridData(data);
    },
  });

  useEffect(() => {
    scrollData.mutate({
      CONFIRMED: "0",
    });
    return () => {
      queryClient.removeQueries(["getScrollListData"]);
    };
  }, []);

  const setCurrentAction = useCallback(
    (data) => {
      if (data?.name === "Close") {
        setIsOpenScrollList(false);
      } else if (data?.name === "viewPending") {
        setFlag("C");
        scrollData.mutate({
          CONFIRMED: "0",
        });
      } else if (data?.name === "viewConfirmed") {
        setFlag("P");
        scrollData.mutate({
          CONFIRMED: "Y",
        });
      } else if (data?.name === "scrollDelete") {
        // setIsOpenScrollList(false);
        // let filterData;
        // setTimeout(() => {
        //   handleDeletByScroll(data?.rows?.[0]?.data?.SCROLL1, filterData);
        // }, 1000);
      } else if (data?.name === "ok") {
        batchdata.mutate({
          COMP_CD: data?.rows?.[0]?.data?.ENTERED_COMP_CD,
          BRANCH_CD: data?.rows?.[0]?.data?.ENTERED_BRANCH_CD,
          SCROLL1: data?.rows?.[0]?.data?.SCROLL1,
        });
        setIsOpenScrollList(false);
      }
    },
    [scrollData]
  );

  return (
    <Dialog
      open={true}
      fullWidth={true}
      PaperProps={{
        style: {
          maxWidth: "1000px",
          padding: "10px",
          height: "auto",
        },
      }}
    >
      {scrollData?.isError && (
        <AppBar position="relative" color="primary">
          <Alert
            severity="error"
            errorMsg={scrollData?.error?.error_msg ?? "Unknow Error"}
            errorDetail={scrollData?.error?.error_detail ?? ""}
            color="error"
          />
        </AppBar>
      )}
      <Box
        sx={{
          "&>.MuiPaper-root .MuiTableContainer-root .MuiTable-root .MuiTableBody-root .MuiTableRow-root.Mui-selected":
            {
              border: "2px solid #000 !important",
            },
        }}
      >
        <GridWrapper
          key={`scrollList-Details-GridData` + gridData}
          finalMetaData={scrollListMetadataData as GridMetaDataType}
          data={gridData ?? []}
          setData={setGridData}
          loading={scrollData?.isLoading}
          actions={actions}
          setAction={setCurrentAction}
        />
      </Box>
    </Dialog>
  );
};

export default ScrollList;
