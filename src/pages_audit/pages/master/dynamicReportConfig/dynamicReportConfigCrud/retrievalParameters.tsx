import { AppBar, Button, Dialog, Toolbar, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useRef, useState } from "react";
import { RetrievalParametersGridMetaData } from "./retrievalParametersMetadata";
import { useTranslation } from "react-i18next";
import { GridMetaDataType, GridWrapper } from "@acuteinfo/common-base";
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
}) => {
  const classes = useDialogStyles();
  const [girdData, setGridData] = useState<any>(rowsData);
  const myGridRef = useRef<any>(null);
  const { t } = useTranslation();
  // const { getEntries } = useContext(ClearCacheContext);

  // useEffect(() => {
  //   return () => {
  //     // let entries = getEntries() as any[];
  //     // entries.forEach((one) => {
  //     //   queryClient.removeQueries(one);
  //     // });
  //     queryClient.removeQueries([""]);
  //   };
  // }, [getEntries]);

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
      PaperProps={{
        style: {
          width: "100%",
        },
      }}
      maxWidth="xl"
      classes={{
        scrollPaper: classes.topScrollPaper,
        paperScrollBody: classes.topPaperScrollBody,
      }}
    >
      <div style={{ padding: "10px" }}>
        <AppBar
          position="relative"
          color="secondary"
          style={{ marginBottom: "10px", background: "var(--theme-color5)" }}
        >
          <Toolbar variant="dense">
            <Typography
              className={classes.title}
              color="inherit"
              variant={"h6"}
              component="div"
            >
              {t("RetrievalParameters")}
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
                {t("Save")}
              </Button>
            </>
            {/* )} */}
            <Button
              onClick={onClose}
              color="primary"
              // disabled={mutation.isLoading}
            >
              {t("Close")}
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
