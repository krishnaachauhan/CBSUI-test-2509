import {
  Alert,
  FormWrapper,
  GradientButton,
  LoaderPaperComponent,
  MetaDataType,
  queryClient,
  utilFunction,
} from "@acuteinfo/common-base";
import {
  AppBar,
  Dialog,
  Tab,
  Tabs,
  Theme,
  Toolbar,
  Typography,
} from "@mui/material";
import { t } from "i18next";
import { useQuery } from "react-query";
import { getACH_IWDetailView } from "./api";
import { useEffect, useState } from "react";
import TabContext from "@mui/lab/TabContext";
import { Box } from "@mui/system";
import TabPanel from "@mui/lab/TabPanel";
import { ach_IW_dtlmetaData } from "./gridMetadata";
import { createStyles, makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      marginBottom: "4px",
      position: "sticky",
    },
    headerRoot: {
      paddingLeft: theme.spacing(1.5),
      paddingRight: theme.spacing(1.5),
      background: "var(--theme-color5)",
    },
    headerTitle: {
      flex: "1 1 100%",
      color: "var(--theme-color2)",
      fontSize: "1.5rem",
    },
  })
);

export const ACHIWDetailView = ({ isOpen, rowsData, handleClose }) => {
  const [tabValue, setTabValue] = useState("Mandate_Image");
  const [imageBlob, setImageBlob] = useState<any>(null);
  const classes = useStyles();

  const { data, isLoading, isFetching, error, isError } = useQuery<any, any>(
    ["getACH_IWDetailView", { rowsData }],
    () => {
      return getACH_IWDetailView(rowsData);
    }
  );

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (data?.[0]) {
      let blob = utilFunction.base64toBlob(data?.[0]?.MNDT_FIMG);
      const url =
        typeof blob === "object" && Boolean(blob)
          ? URL.createObjectURL(blob)
          : "";
      setImageBlob(url);
    }
  }, [data?.[0]]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getACH_IWDetailView"]);
    };
  }, []);

  const fullAccountNo = [
    data?.[0]?.TRN_COMP_CD?.trim() ?? "",
    data?.[0]?.TRN_BRANCH_CD?.trim() ?? "",
    data?.[0]?.TRN_ACCT_TYPE?.trim() ?? "",
    data?.[0]?.TRN_ACCT_CD?.trim() ?? "",
  ].join("");

  const umrnNo = data?.[0]?.MNDT_ID?.trim() ?? "";

  const headerText = t("ACHIWHeader", {
    FULL_ACCOUNT_NO: fullAccountNo,
    UMRN_NO: umrnNo,
  });
  return (
    <Dialog
      open={isOpen}
      onKeyUp={(event) => {
        if (event.key === "Escape") {
          handleClose();
        }
      }}
      PaperProps={{
        style: {
          width: "100%",
          overflow: "auto",
          padding: 10,
        },
      }}
      maxWidth="lg"
    >
      {isLoading || isFetching ? <LoaderPaperComponent size={30} /> : null}
      {isError ? (
        <Alert
          severity={error?.severity ?? "error"}
          errorMsg={error?.error_msg ?? "Error"}
          errorDetail={error?.error_detail ?? ""}
        />
      ) : null}
      {!isLoading && !isFetching ? (
        <TabContext value={tabValue}>
          <AppBar className={classes.appBar}>
            <Toolbar variant="dense" className={classes.headerRoot}>
              <Typography
                component="span"
                variant="h5"
                className={classes.headerTitle}
              >
                {headerText}
              </Typography>
              <GradientButton onClick={handleClose} color={"primary"}>
                {t("Close")}
              </GradientButton>
            </Toolbar>
          </AppBar>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleChange}
              textColor="secondary"
              indicatorColor="secondary"
              variant="scrollable"
            >
              <Tab label={t("Mandate Image")} value="Mandate_Image" />
              <Tab label={t("Mandate Details")} value="Mandate_Details" />
            </Tabs>
          </Box>
          <TabPanel
            value="Mandate_Image"
            style={{
              height: isLoading ? "auto" : "81vh",
              overflow: "scroll",
            }}
          >
            <Box
              style={{
                height: "100%",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={imageBlob}
                alt=""
                style={{ maxWidth: "80%", maxHeight: "80%" }}
              />
            </Box>
          </TabPanel>
          <TabPanel
            value="Mandate_Details"
            style={{
              height: isLoading ? "auto" : "81vh",
              overflow: "scroll",
              padding: 0,
            }}
          >
            <FormWrapper
              key={"ACH/OW_DtlFormData"}
              metaData={ach_IW_dtlmetaData as MetaDataType}
              displayMode={"view"}
              onSubmitHandler={() => {}}
              initialValues={data?.[0] ?? {}}
              formStyle={{
                background: "white",
                margin: "10px 0",
              }}
              hideHeader={true}
            />
          </TabPanel>
        </TabContext>
      ) : null}
    </Dialog>
  );
};
