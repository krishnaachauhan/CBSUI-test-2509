import { AppBar, Button, Dialog, Toolbar, Typography } from "@mui/material";
import { Transition } from "@acuteinfo/common-base";
import { useContext, useEffect, useRef, useState } from "react";
import { RetrievalParametersGridMetaData } from "./retrievalParametersMetadata";
import { makeStyles } from "@mui/styles";
import { useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import * as API from "../api";
import {
  CreateDetailsRequestData,
  ClearCacheContext,
  queryClient,
  GridWrapper,
  GridMetaDataType,
} from "@acuteinfo/common-base";
export const useDialogStyles = makeStyles({
  topScrollPaper: {
    alignItems: "center",
  },
  topPaperScrollBody: {
    verticalAlign: "top",
  },
  title: {
    flex: "1 1 100%",
    color: "var(--white)",
    letterSpacing: "1px",
    fontSize: "1.5rem",
  },
});
export const RetrievalParametersGrid = ({
  isOpen,
  formMode,
  onClose,
  rowsData,
  onSaveData,
  docCD,
}) => {
  const classes = useDialogStyles();

  const myGridRef = useRef<any>(null);
  const { getEntries } = useContext(ClearCacheContext);
  const isErrorFuncRef = useRef<any>(null);
  const { authState } = useContext(AuthContext);
  const [girdData, setGridData] = useState<any>(rowsData);

  // const { data, isFetching, isLoading, isError, error } = useQuery<any, any>(
  //   ["getDynamicParamterConfigData"],
  //   () =>
  //     API.getDynamicParamterConfigData({
  //       COMP_CD: authState?.companyID ?? "",
  //       BRANCH_CD: authState?.user?.branchCode ?? "",
  //       docCD,
  //     })
  // );

  // useEffect(() => {
  //   return () => {
  //     let entries = getEntries() as any[];
  //     // entries.forEach((one) => {
  //     //   queryClient.removeQueries(one);
  //     // });
  //     queryClient.removeQueries(["getDynamicParamterConfigData"]);
  //   };
  // }, [getEntries]);
  // useEffect(() => {
  //   if (Array.isArray(data)) {
  //     setGridData(data);
  //   } else {
  //     setGridData([]);
  //   }
  // }, [data]);

  const onSaveRecord = async () => {
    let { hasError, data: dataold } = await myGridRef.current?.validate();
    if (hasError === true) {
      if (dataold) {
        setGridData(dataold);
      }
    } else {
      let result = myGridRef?.current?.cleanData?.();
      if (!Array.isArray(result)) {
        result = [result];
      }

      onSaveData(result);
    }
  };
  return (
    <Dialog
      open={isOpen}
      //@ts-ignore
      TransitionComponent={Transition}
      PaperProps={{
        style: {
          width: "100%",
        },
      }}
      maxWidth="md"
      classes={{
        scrollPaper: classes.topScrollPaper,
        paperScrollBody: classes.topPaperScrollBody,
      }}
    >
      <div style={{ padding: "10px" }}>
        <AppBar
          position="relative"
          color="secondary"
          style={{ marginBottom: "10px" }}
        >
          <Toolbar variant="dense">
            <Typography
              className={classes.title}
              color="inherit"
              variant={"h6"}
              component="div"
            >
              Retrieval Parameters
            </Typography>
            {/* {isLoading || isFetching || isError ? null : ( */}
            <>
              {/* <Button
                  onClick={AddNewRow}
                  color="primary"
                  disabled={mutation.isLoading}
                >
                  Add
                </Button> */}
              <Button
                onClick={onSaveRecord}
                color="primary"
                // disabled={mutation.isLoading}
                // endIcon={
                //   mutation.isLoading ? <CircularProgress size={20} /> : null
                // }
              >
                Save
              </Button>
            </>
            {/* )} */}
            <Button
              onClick={onClose}
              color="primary"
              // disabled={mutation.isLoading}
            >
              Close
            </Button>
          </Toolbar>
        </AppBar>
        <GridWrapper
          key={"operatorMasterSpecialAmount"}
          finalMetaData={RetrievalParametersGridMetaData as GridMetaDataType}
          data={girdData}
          setData={setGridData}
          // loading={isLoading || isFetching || isError}
          actions={[]}
          setAction={() => {}}
          // refetchData={refetch}
          ref={myGridRef}
        />
      </div>
    </Dialog>
  );
};
