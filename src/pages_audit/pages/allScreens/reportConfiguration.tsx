import {
  Alert,
  FormWrapper,
  GradientButton,
  LoaderPaperComponent,
  MetaDataType,
  queryClient,
  SubmitFnType,
  usePopupContext,
} from "@acuteinfo/common-base";
import {
  CircularProgress,
  Dialog,
  Grid,
  IconButton,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import { Box, Theme } from "@mui/system";
import { makeStyles } from "@mui/styles";
import { reportConfigMetadata } from "./formMetadata";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import { AuthContext } from "pages_audit/auth";
import { t } from "i18next";
import { enqueueSnackbar } from "notistack";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-mysql";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-json";
import { RptMetadataSuggestion } from "./metadataSuggetion";
import FullScreenEditor from "./fullScreenEditor";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { LinearProgressBarSpacer } from "components/common/custom/linerProgressBarSpacer";
import { RetrieParaGrid } from "./parameterGrid/parametersGrid";
import JrxmlDesign from "./jrxmlDesign";
interface QueryData {
  SQL_ANSI_SYNTAX: string;
  METADATA: string;
  RETRIEVAL_METADATA: string;
  DEFAULT_FILTER: string;
  ENABLE_PAGINATION: string;
}

const useTypeStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    background: "var(--theme-color5)",
  },
  title: {
    flex: "1 1 100%",
    color: "var(--white)",
    letterSpacing: "1px",
    fontSize: "1.5rem",
  },
  textField: {
    marginBottom: "10px",
    "& .MuiInputBase-input ": {
      height: "calc(100vh - 341px) !important",
    },
  },
  aceContent: {
    "&  .ace_scroller": {
      "&  .ace_content": {
        margin: "0",
      },
    },
  },
}));

export const ReportConfiguration = ({
  OpenDialogue,
  closeDialogue,
  rowData,
}: {
  OpenDialogue: boolean;
  closeDialogue: () => void;
  rowData: { DOC_CD: string; DOC_NM: string };
}) => {
  const headerClasses = useTypeStyles();
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const formRef = useRef<any>(null);

  const [myData, setMyData] = useState<any>({
    showError: false,
    isSuggOpen: false,
    defaultFilter: null,
    expandEditor: false,
    flag: "",
    isParaOpen: false,
    isJrxmlOpen: false,
  });

  const myRef = useRef<any>({
    origSqlSyntaxData: "",
    sqlSyntaxData: "",
    reportMetadata: "",
    retrieveMetadata: "",
    parameterData: "",
    defaultParaData: "",
    verifyFlag: "",
    screenRef: rowData?.DOC_CD,
  });
  const [refresh, setRefresh] = useState<any>(0);

  const getmetadataMutation = useMutation(API.generateReportMetadata, {
    onError: async (error: any) => {
      await MessageBox({
        messageTitle: "Error",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
    },
    onSuccess: (data) => {
      const metadata = JSON.stringify(data[0]?.METADATA, null, 2);
      const retrieveMetadata = JSON.stringify(
        data[0]?.RETRIEVAL_METADATA,
        null,
        2
      );

      if (myRef.current.retrieveMetadata?.trim() !== "") {
        myRef.current.retrieveMetadata = myRef.current.retrieveMetadata;
      } else {
        if (
          retrieveMetadata.trim() === "{}" ||
          retrieveMetadata.trim() === ""
        ) {
          myRef.current.retrieveMetadata = "";
        } else {
          myRef.current.retrieveMetadata = "";
        }
      }
      myRef.current.reportMetadata = metadata;
      enqueueSnackbar(t("MetadataGeneratedSuccessfully"), {
        variant: "success",
      });
    },
  });
  const verifyQuery = useMutation(API.verifyQueryData, {
    onError: async (error: any) => {
      await MessageBox({
        messageTitle: "Error",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
      myRef.current.verifyFlag = false;
    },
    onSuccess: (data, variables) => {
      myRef.current.verifyFlag = true;
      myRef.current.parameterData = data?.[0]?.columns;

      MessageBox({
        messageTitle: "Scccess",
        message: "Queryverifiedsuccessfully",
        icon: "SUCCESS",
      });
    },
  });

  const savemetadataMutation = useMutation(API.saveReportConfiguration, {
    onError: async (error: any) => {
      await MessageBox({
        messageTitle: "Error",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
    },
    onSuccess: () => {
      CloseMessageBox();
      enqueueSnackbar(t("DataSaveSuccessfully"), {
        variant: "success",
      });

      closeDialogue();
      queryClient.clear();
    },
  });
  function isValidJSON(str) {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }
  const {
    data: Query,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery<QueryData[], any>(
    ["getSqlQuery", rowData?.DOC_CD],
    () =>
      API.getrReportSqlQuery({
        companyID: authState?.companyID,
        branchCode: authState?.user?.branchCode,
        DOC_CD: rowData?.DOC_CD,
      }),
    {
      onSuccess: (data: any) => {
        if (data?.length === 0) {
          enqueueSnackbar(t("QueryNotFound"), { variant: "error" });
        } else {
          const metadataStr = data[0]?.METADATA;

          if (isValidJSON(metadataStr)) {
            const parsedMeta = JSON.parse(metadataStr);
            myRef.current.retrievalType = parsedMeta?.retrievalType;
          } else {
            console.error("Invalid JSON:", metadataStr);
            enqueueSnackbar(t("InvalidJSON"), { variant: "error" });
          }

          myRef.current.getType = data?.[0]?.GET_TYPE;
          myRef.current.sqlSyntaxData = data[0]?.SQL_ANSI_SYNTAX;
          myRef.current.origSqlSyntaxData = data[0]?.SQL_ANSI_SYNTAX?.trim();
          if (data[0]?.METADATA) {
            myRef.current.reportMetadata = data[0]?.METADATA;
          }
          if (data[0]?.RETRIEVAL_METADATA) {
            myRef.current.retrieveMetadata = data[0]?.RETRIEVAL_METADATA;
          }
          const filter = data[0]?.DEFAULT_FILTER;
          if (filter && typeof filter === "string") {
            const cleanFilter = filter.replace(/^\/|\/$/g, "");
            setMyData((old) => ({
              ...old,
              defaultFilter: JSON.parse(cleanFilter)[0] || null,
            }));
          }
        }
      },
      onError: (error: any) => {
        MessageBox({
          messageTitle: "Error",
          message: error?.error_msg ?? "",
          icon: "ERROR",
        });
      },
      enabled: Boolean(rowData?.DOC_CD),
    }
  );
  const compareData = () => {
    if (
      myRef.current.origSqlSyntaxData?.trim().split(/\s+/).join("") !==
      myRef.current.sqlSyntaxData?.trim().split(/\s+/).join("")
    ) {
      myRef.current.reportMetadata = "";
      myRef.current.retrieveMetadata = "";
      myRef.current.verifyFlag = false;
      setRefresh((old) => old + 1);
    }
  };

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldErrors,
    actionFlag
  ) => {
    endSubmit(true);

    if (myRef.current.sqlSyntaxData.trim() === "") {
      enqueueSnackbar(t("SQLQuerycannotbeempty"), { variant: "error" });
      return;
    } else if (data?.RETRIEVAL_TYPE === "") {
      setFieldErrors({ RETRIEVAL_TYPE: t("PleaseenterRetrievalType") });
    } else if (data?.GET_TYPE === "") {
      setFieldErrors({ GET_TYPE: t("PleaseenterGetType") });
    } else if (!Boolean(myRef.current.verifyFlag)) {
      enqueueSnackbar(t("PleaseVerifyQuery"), { variant: "error" });
    } else if (actionFlag === "GENE_META") {
      setMyData((old) => ({ ...old, defaultFilter: null }));
      getmetadataMutation.mutate({
        SQL_SYNTAX: myRef.current.sqlSyntaxData,
        RETRIEVAL_TYPE: data?.RETRIEVAL_TYPE,
        GET_TYPE: data?.GET_TYPE,
        SCREEN_REF: rowData?.DOC_CD,
        PARAMETERS: myRef.current.defaultParaData,
      });
    } else if (myRef.current.reportMetadata.trim() === "") {
      enqueueSnackbar(t("ReportMetadatacannotbeempty"), { variant: "error" });
    } else if (
      (data?.RETRIEVAL_TYPE === "AS_PER_QUERY" &&
        myRef.current.retrieveMetadata.trim() === "") ||
      (data?.RETRIEVAL_TYPE === "CUSTOMIZE" &&
        myRef.current.retrieveMetadata.trim() === "")
    ) {
      enqueueSnackbar(t("RetrieveMetadatacannotbeempty"), { variant: "error" });
    } else if (
      !isValidJSON(myRef.current.reportMetadata) &&
      myRef.current.reportMetadata.trim() !== ""
    ) {
      enqueueSnackbar(t("InvalidJSONofReportMetadata"), {
        variant: "error",
      });
      console.error("Invalid JSON:", myRef.current.reportMetadata);
    } else if (
      (data?.RETRIEVAL_TYPE === "AS_PER_QUERY" &&
        !isValidJSON(myRef.current.retrieveMetadata) &&
        myRef.current.reportMetadata.trim() !== "") ||
      (data?.RETRIEVAL_TYPE === "CUSTOMIZE" &&
        !isValidJSON(myRef.current.retrieveMetadata) &&
        myRef.current.reportMetadata.trim() !== "")
    ) {
      enqueueSnackbar(t("InvalidJSONofRetrieveMetadata"), {
        variant: "error",
      });
      console.error("Invalid JSON:", myRef.current.retrieveMetadata);
    } else if (actionFlag === "Save") {
      const payload = {
        IS_UPDATE: Query && Query?.length > 0 ? "Y" : "N",
        DOC_CD: rowData?.DOC_CD ?? "",
        SQL_ANSI_SYNTAX: myRef.current.sqlSyntaxData, // Use the current SQL query
        ENABLE_PAGINATION: data?.PAGINATION_ENABLE === true ? "Y" : "N",
        DEFAULT_FILTER:
          data?.DEFAULT_FILTER === true
            ? [
                {
                  id: data?.id,
                  value: {
                    value: data?.value,
                    type: data?.type,
                    isDisableDelete: data?.isDisableDelete,
                    columnName: data?.columnName,
                    condition: data?.condition,
                  },
                },
              ]
            : "",
        METADATA: myRef.current.reportMetadata,
        RETRIEVAL_METADATA: myRef.current.retrieveMetadata,
        GET_TYPE: data?.GET_TYPE,
        CACHING: data?.CACHING,
        CACHING_INTERVAL: data?.CACHING_INTERVAL,
      };
      let buttonName = await MessageBox({
        messageTitle: "Confirmation",
        message: "AreYouSureToProceed",
        icon: "CONFIRM",
        buttonNames: ["Yes", "No"],
        loadingBtnName: ["Yes"],
      });
      if (buttonName === "Yes") {
        savemetadataMutation.mutate(payload);
      }
    }
  };

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getSqlQuery"]);
    };
  }, []);

  const FullscreenIcon = (iconFlag) => {
    return (
      <IconButton
        size="small"
        onClick={() => {
          setMyData((old) => ({ ...old, flag: iconFlag?.flag }));
          setMyData((old) => ({ ...old, expandEditor: true }));
        }}
        sx={{
          position: "absolute",
          right: "1.5rem",
          bottom: "1.5rem",
          background: "white",
          boxShadow:
            "rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset",
          "&:hover": {
            background: "#f5f5f5",
          },
        }}
      >
        <Tooltip title={t("Maximize")}>
          <OpenInFullIcon fontSize="small" />
        </Tooltip>
      </IconButton>
    );
  };

  let upDateData = (data) => {
    if (myData?.flag === "SQL") {
      myRef.current.sqlSyntaxData = data;
      if (myRef.current.reportMetadata !== "") {
        compareData();
      }
    } else if (myData?.flag === "RM") {
      myRef.current.reportMetadata = data;
    } else if (myData?.flag === "RT") {
      myRef.current.retrieveMetadata = data;
    }
  };
  return (
    <Fragment>
      <Dialog
        open={OpenDialogue}
        fullWidth
        maxWidth="xl"
        PaperProps={{
          style: { width: "100%", height: "100%", padding: "7px" },
        }}
      >
        {isFetching || isLoading ? (
          <LinearProgress color="secondary" />
        ) : isError ? (
          <Alert
            severity="error"
            errorMsg={error?.error_msg ?? t("Somethingwenttowrong")}
            errorDetail={error?.error_detail}
            color="error"
          />
        ) : (
          <LinearProgressBarSpacer />
        )}

        <Grid container sx={{ height: "100%" }}>
          <Grid item xs={12}>
            <FormWrapper
              key={`reportConfigMetadata-${
                myData?.defaultFilter ? myData?.defaultFilter.id : "null"
                //@ts-ignore
              }-${Query?.[0]?.ENABLE_PAGINATION}`}
              metaData={reportConfigMetadata as MetaDataType}
              subHeaderLabel={`${t("ReportConfigurationFormFor")} - ${
                rowData?.DOC_NM
              }  ${rowData?.DOC_CD}`}
              initialValues={{
                //@ts-ignore
                PAGINATION_ENABLE: Query?.[0]?.ENABLE_PAGINATION === "Y",
                DEFAULT_FILTER: myData?.defaultFilter ? true : false,
                id: myData?.defaultFilter?.id,
                columnName: myData?.defaultFilter?.value?.columnName,
                type: myData?.defaultFilter?.value?.type,
                value: myData?.defaultFilter?.value?.value,
                condition: myData?.defaultFilter?.value?.condition,
                isDisableDelete: myData?.defaultFilter?.value?.isDisableDelete,
                RETRIEVAL_TYPE: myRef.current.retrievalType,
                GET_TYPE: myRef.current.getType,
              }}
              formStyle={{ height: "auto", width: "100%" }}
              onSubmitHandler={onSubmitHandler}
              ref={formRef}
              formState={{
                // setMetaData: setMetaData,
                // setRetrivalForm: setRetrivalForm,
                MessageBox: MessageBox,
                myRef: myRef,
              }}
              onFormButtonClickHandel={async (id, dependent) => {
                if (id === "METADATA_SUGG") {
                  if (dependent?.RETRIEVAL_TYPE?.value !== "") {
                    setMyData((old) => ({
                      ...old,
                      isSuggOpen: true,
                    }));
                    myRef.current.retrievalType =
                      dependent?.RETRIEVAL_TYPE?.value;
                  }
                }
              }}
            >
              {({ isSubmitting, handleSubmit }) => {
                return (
                  <>
                    <GradientButton
                      onClick={() => {
                        setMyData((old) => ({ ...old, isJrxmlOpen: true }));
                      }}
                      color={"primary"}
                    >
                      {t("UploadJRXMLdesign")}
                    </GradientButton>
                    <GradientButton
                      onClick={(event) => {
                        handleSubmit(event, "Save");
                      }}
                      color={"primary"}
                    >
                      {t("Save")}
                    </GradientButton>
                    <GradientButton onClick={closeDialogue} color="primary">
                      {t("Close")}
                    </GradientButton>
                  </>
                );
              }}
            </FormWrapper>
          </Grid>

          <Grid item xs={12} xl={12} sx={{ m: 2 }} style={{ display: "flex" }}>
            <Box sx={{ width: "40%" }}>
              <Box sx={{ position: "relative" }}>
                <h4>{t("SQLQuery")} </h4>
                <AceEditor
                  className={headerClasses.aceContent}
                  style={{
                    height: "calc(100vh - 340px)",
                    width: "100%",
                    opacity: 1,
                    border: "1px solid #a39494",
                    borderRadius: "10px",
                  }}
                  placeholder={String(t("SQLANSIQuerySyntax"))}
                  onChange={(value) => {
                    myRef.current.sqlSyntaxData = value;
                    if (myRef.current.reportMetadata !== "") {
                      compareData();
                    }
                  }}
                  mode="mysql"
                  fontSize={14}
                  value={myRef.current.sqlSyntaxData}
                  showPrintMargin={false}
                  showGutter={false}
                  highlightActiveLine={true}
                  setOptions={{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: false,
                    showLineNumbers: false,
                    tabSize: 2,
                  }}
                />
                <FullscreenIcon flag="SQL" />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "10px",
                }}
              >
                <GradientButton
                  color={"primary"}
                  endIcon={
                    verifyQuery?.isLoading ? (
                      <CircularProgress size={20} />
                    ) : null
                  }
                  onClick={() => {
                    if (myRef?.current?.getType?.trim() === "") {
                      MessageBox({
                        messageTitle: "Alert",
                        message: "PleaseSelectGetType",
                        icon: "WARNING",
                      });
                    } else {
                      verifyQuery.mutate({
                        SQL_SYNTAX: myRef.current.sqlSyntaxData,
                        GET_TYPE: myRef.current.getType,
                      });
                    }
                  }}
                  disabled={verifyQuery?.isLoading}
                >
                  {t("VerifyQuery")}
                </GradientButton>

                <GradientButton
                  onClick={() => {
                    setMyData((old) => ({
                      ...old,
                      isParaOpen: old?.isParaOpen ? false : true,
                    }));
                  }}
                  disabled={
                    !Boolean(myRef.current.verifyFlag) ||
                    !myRef.current.parameterData?.length
                  }
                >
                  {t("Parameters")}
                </GradientButton>
                <GradientButton
                  onClick={() => {
                    let event: any = { preventDefault: () => {} };
                    formRef.current?.handleSubmit(event, "GENE_META", false);
                  }}
                  endIcon={
                    getmetadataMutation.isLoading ? (
                      <CircularProgress size={20} />
                    ) : null
                  }
                  disabled={!Boolean(myRef.current.verifyFlag)}
                >
                  {t("GenerateMetadata")}
                </GradientButton>
              </Box>
            </Box>
            <Box sx={{ position: "relative", width: "30%", marginX: "10px" }}>
              <h4> {t("ReportMetadata")} </h4>
              <AceEditor
                className={headerClasses.aceContent}
                style={{
                  height: "calc(100vh - 290px)",
                  width: "100%",
                  opacity: 1,
                  border: "1px solid #a39494",
                  borderRadius: "10px",
                }}
                placeholder={String(t("EnterReportFormMetadata"))}
                onChange={(value) => {
                  myRef.current.reportMetadata = value;
                }}
                key={refresh}
                mode="json"
                fontSize={14}
                value={myRef.current.reportMetadata}
                showPrintMargin={false}
                showGutter={false}
                highlightActiveLine={true}
                setOptions={{
                  useWorker: false,
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: true,
                  enableSnippets: false,
                  showLineNumbers: false,
                  tabSize: 2,
                }}
              />
              <FullscreenIcon flag="RM" />
            </Box>
            <Box sx={{ position: "relative", width: "30%" }}>
              <h4> {t("RetrievalMetadata")}</h4>
              <AceEditor
                className={headerClasses.aceContent}
                style={{
                  height: "calc(100vh - 290px)",
                  width: "100%",
                  opacity: 1,
                  border: "1px solid #a39494",
                  borderRadius: "10px",
                }}
                placeholder={String(t("EnterRetrivalFormMetadata"))}
                onChange={(value) => {
                  myRef.current.retrieveMetadata = value;
                }}
                mode="json"
                fontSize={14}
                value={myRef.current.retrieveMetadata}
                showPrintMargin={false}
                showGutter={false}
                highlightActiveLine={true}
                setOptions={{
                  useWorker: false,
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: true,
                  enableSnippets: false,
                  showLineNumbers: false,
                  tabSize: 2,
                }}
              />
              <FullscreenIcon flag="RT" />
            </Box>
          </Grid>
        </Grid>
        {myData?.isSuggOpen && (
          <RptMetadataSuggestion
            isSuggOpen={myData?.isSuggOpen}
            setIsSuggOpen={setMyData}
            retrievalaType={myRef.current.retrievalType}
          />
        )}
        {myData?.expandEditor && (
          <FullScreenEditor
            refdata={
              myData?.flag === "SQL"
                ? myRef.current.sqlSyntaxData
                : myData?.flag === "RM"
                ? myRef.current.reportMetadata
                : myData?.flag === "RT"
                ? myRef.current.retrieveMetadata
                : ""
            }
            mode={myData?.flag === "SQL" ? "mysql" : "json"}
            expandEditor={myData?.expandEditor}
            setMyData={setMyData}
            title={`${rowData?.DOC_NM} ${rowData?.DOC_CD}`}
            upDateData={upDateData}
          />
        )}

        {myData?.isParaOpen && (
          <RetrieParaGrid
            myData={myData}
            setMyData={setMyData}
            refdata={myRef}
          />
        )}

        {myData?.isJrxmlOpen && (
          <JrxmlDesign
            setMyData={setMyData}
            rowData={rowData}
            title={`${rowData?.DOC_NM} ${rowData?.DOC_CD}`}
          />
        )}
      </Dialog>
    </Fragment>
  );
};
