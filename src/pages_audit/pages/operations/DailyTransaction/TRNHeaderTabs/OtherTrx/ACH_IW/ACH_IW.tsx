import {
  ActionTypes,
  Alert,
  FormWrapper,
  GradientButton,
  GridMetaDataType,
  GridWrapper,
  LoaderPaperComponent,
  MetaDataType,
  queryClient,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import {
  AppBar,
  Box,
  Dialog,
  DialogActions,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import { cloneDeep } from "lodash";
import { AuthContext } from "pages_audit/auth";
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import { ach_IW_dtlmetaData, ACH_IWGridMetaData } from "./gridMetadata";
export const ACH_IW = ({ reqData }) => {
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [isachIWDtlOpen, setAchIWDtlOpen] = useState(false);
  const [achIWDtl, setAchIWDtl] = useState<any>({});
  const [isImageBlob, setIsImageBlob] = useState<any>(null);
  const [tabValue, setTabValue] = useState("Mandate_Image");
  const { t } = useTranslation();
  const hasRequiredFields = Boolean(
    reqData?.ACCT_CD && reqData?.ACCT_TYPE && reqData?.BRANCH_CD
  );

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const actions: ActionTypes[] = [
    {
      actionName: "view-details",
      actionLabel: "ViewDetails",
      multiple: false,
      rowDoubleClick: true,
    },
  ];
  const { data, isLoading, isFetching, refetch, error, isError } = useQuery<
    any,
    any
  >(["getACH_IWList", { reqData }], () => API.getACH_IWList(reqData), {
    enabled: hasRequiredFields,
  });
  const handleRefetch = () => {
    if (hasRequiredFields) {
      refetch();
    }
  };

  const getACH_IWDtl = useMutation("getACH_OWDtl", API.getACH_IWDetailView, {
    onError: async (error: any) => {
      const btnName = await MessageBox({
        messageTitle: "ValidationFailed",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
      setAchIWDtlOpen(false);
      CloseMessageBox();
    },
    onSuccess: (data) => {
      let blob = utilFunction.base64toBlob(data?.[0]?.MNDT_FIMG);
      const url =
        typeof blob === "object" && Boolean(blob)
          ? URL.createObjectURL(blob)
          : "";
      setIsImageBlob(url);
      setAchIWDtl(data?.[0]);
    },
  });
  const setCurrentAction = useCallback(async (data) => {
    if (data?.name === "view-details") {
      if (data?.rows?.[0]?.data?.STATUS?.trim() !== "A") {
        await MessageBox({
          message: "MandateAlertMessage",
          messageTitle: "Alert",
        });
      }
      setAchIWDtlOpen(true);
      getACH_IWDtl.mutate({
        ENTERED_COMP_CD: data?.rows?.[0]?.data?.ENTERED_COMP_CD ?? "",
        ENTERED_BRANCH_CD: data?.rows?.[0]?.data?.ENTERED_BRANCH_CD ?? "",
        TRAN_CD: data?.rows?.[0]?.data?.TRAN_CD ?? "",
      });
    }
  }, []);
  const memoizedMetadata = useMemo(() => {
    const metadata = cloneDeep(ACH_IWGridMetaData);
    if (metadata?.gridConfig) {
      metadata.gridConfig.containerHeight = { min: "23.7vh", max: "23.7vh" };
      metadata.gridConfig.gridLabel = reqData?.TAB_DISPL_NAME ?? "ACHIW";
    }
    return metadata;
  }, [data]);

  const handleCloseDialog = () => {
    setAchIWDtlOpen(false);
    setTabValue("Mandate_Image");
  };
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getACH_IWList", authState?.user?.branchCode]);
      queryClient.removeQueries(["getACH_OWDtl", authState?.user?.branchCode]);
    };
  }, []);

  return (
    <Fragment>
      {isError ? (
        <Alert
          severity={error?.severity ?? "error"}
          errorMsg={error?.error_msg ?? "Error"}
          errorDetail={error?.error_detail ?? ""}
        />
      ) : null}
      <GridWrapper
        key={`ACH_IWGridMetaData` + data?.length}
        finalMetaData={memoizedMetadata as GridMetaDataType}
        data={data ?? []}
        loading={isLoading || isFetching}
        actions={actions}
        setAction={setCurrentAction}
        setData={() => null}
        refetchData={handleRefetch}
        enableExport={true}
        onClickActionEvent={async (index, id, currentData) => {
          if (id === "VIEW_DTL") {
            if (
              currentData?.STATUS_DISP?.trim() === "Pending" ||
              currentData?.STATUS_DISP?.trim() === "Rejected" ||
              currentData?.STATUS_DISP?.trim() === "Cancel" ||
              currentData?.STATUS_DISP?.trim() === "Stop"
            ) {
              await MessageBox({
                message: "MandateAlertMessage",
                messageTitle: "Alert",
              });
            }
            setAchIWDtlOpen(true);
            getACH_IWDtl.mutate({
              ENTERED_COMP_CD: currentData?.ENTERED_COMP_CD ?? "",
              ENTERED_BRANCH_CD: currentData?.ENTERED_BRANCH_CD ?? "",
              TRAN_CD: currentData?.TRAN_CD ?? "",
            });
          }
        }}
      />

      {isachIWDtlOpen ? (
        <Dialog
          open={isachIWDtlOpen}
          onKeyUp={(event) => {
            if (event.key === "Escape") {
              setAchIWDtlOpen(false);
            }
          }}
          PaperProps={{
            style: {
              width: "100%",
              overflow: "auto",
            },
          }}
          maxWidth="lg"
        >
          {getACH_IWDtl?.isLoading ? (
            <LoaderPaperComponent />
          ) : (
            <>
              <TabContext value={tabValue}>
                <AppBar
                  position="static"
                  sx={{
                    background: "var(--theme-color5)",
                    margin: "2px",
                    width: "auto",
                    marginBottom: "10px",
                  }}
                >
                  <Toolbar
                    sx={{
                      paddingLeft: "24px",
                      paddingRight: "24px",
                      minHeight: "48px !important",
                    }}
                  >
                    <Typography
                      component="span"
                      variant="h5"
                      sx={{
                        color: "var(--theme-color2)",
                        fontSize: "1.25rem",
                        fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                        fontWeight: 500,
                        lineHeight: "1.6px",
                        letterSpacing: "0.0075em",
                      }}
                    >
                      {`${t(`ACHIWHeader`, {
                        FULL_ACCOUNT_NO: `${
                          achIWDtl?.TRN_COMP_CD?.trim() ?? ""
                        }${achIWDtl?.TRN_BRANCH_CD?.trim() ?? ""}${
                          achIWDtl?.TRN_ACCT_TYPE?.trim() ?? ""
                        }${achIWDtl?.TRN_ACCT_CD?.trim() ?? ""}`,
                        UMRN_NO: achIWDtl?.MNDT_ID?.trim() ?? "",
                      })}`}
                    </Typography>
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
                    height: getACH_IWDtl?.isLoading ? "auto" : "81vh",
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
                      src={isImageBlob}
                      style={{ maxWidth: "80%", maxHeight: "80%" }}
                    />
                  </Box>
                </TabPanel>
                <TabPanel
                  value="Mandate_Details"
                  style={{
                    height: getACH_IWDtl?.isLoading ? "auto" : "81vh",
                    overflow: "scroll",
                  }}
                >
                  <FormWrapper
                    key={"ACH/OW_DtlFormData"}
                    metaData={ach_IW_dtlmetaData as MetaDataType}
                    displayMode={"view"}
                    onSubmitHandler={() => {}}
                    initialValues={achIWDtl ?? {}}
                    formStyle={{
                      background: "white",
                      margin: "10px 0",
                    }}
                    hideHeader={true}
                  />
                </TabPanel>
              </TabContext>
            </>
          )}
          <DialogActions>
            <GradientButton onClick={handleCloseDialog} color={"primary"}>
              {t("Close")}
            </GradientButton>
          </DialogActions>
        </Dialog>
      ) : null}
    </Fragment>
  );
};
