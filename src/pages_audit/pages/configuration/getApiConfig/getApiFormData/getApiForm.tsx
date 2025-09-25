import {
  AppBar,
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { getApiFormMetadata } from "./getApiiFormMetadata";

import { AuthContext } from "pages_audit/auth";
import { useMutation, useQuery } from "react-query";
import { checkRediskeyTtl, flushRediskey, savedynamicAPIconfig } from "../api";
import { enqueueSnackbar } from "notistack";
import AceEditor from "react-ace";
import { Theme } from "@mui/material/styles";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";

import {
  Alert,
  SubmitFnType,
  FormWrapper,
  MetaDataType,
  CreateDetailsRequestData,
  utilFunction,
  GradientButton,
  queryClient,
  usePopupContext,
} from "@acuteinfo/common-base";
import { t } from "i18next";
import KeyValueTable from "./getFlushTime";
import i18n from "components/multiLanguage/languagesConfiguration";
import { makeStyles } from "@mui/styles";
import { useTranslation } from "react-i18next";

const useTypeStyles = makeStyles((theme: Theme) => ({
  root: {
    background: "var(--theme-color5)",
  },
  formHeaderTitle: {
    flex: "1 1 100%",
    color: "var(--theme-color2)",
    letterSpacing: "1px",
    fontSize: "1.5rem",
  },
  aceContent: {
    "& .ace_scroller": {
      "& .ace_content": {
        margin: "0",
      },
    },
    "& .ace_scroller.ace_scroll-left:after": {
      boxShadow: "none",
    },
  },
}));

const GetApiFormCustom = ({ closeDialog, refetch, defaultView, flush }) => {
  const formRef = useRef<any>(null);
  const { authState } = useContext(AuthContext);
  const { state: rowdata }: any = useLocation();
  const mynewSqlSyntaxRef = useRef<any>("");
  const [sqlSyntax, setSqlSyntax] = useState(rowdata?.GET_QUERY ?? "");
  const headerClasses = useTypeStyles();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [expandEditor, setExpandEditor] = useState(false);
  useEffect(() => {
    mynewSqlSyntaxRef.current = sqlSyntax ?? "";
  }, [sqlSyntax]);

  const {
    data,
    refetch: refetchKey,
    isLoading,
    isFetching,
    error,
    isError,
  } = useQuery<any, any>(
    ["checkRediskeyTtl"],
    () =>
      checkRediskeyTtl({
        DISPLAY_LANGUAGE: i18n.resolvedLanguage,
        DYNAMIC_ACTION: rowdata?.ACTION,
      }),
    {
      enabled: defaultView === "edit" && rowdata?.CACHING === "Y",
    }
  );
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["checkRediskeyTtl"]);
    };
  }, []);

  const mutation: any = useMutation(savedynamicAPIconfig, {
    onSuccess: (data, variables) => {
      if (variables?._isNewRow) {
        enqueueSnackbar(t("RecordInsertedMsg"), { variant: "success" });
      } else if (variables?._isUpdatedRow) {
        enqueueSnackbar(t("RecordUpdatedMsg"), { variant: "success" });
      }
      refetch();
      closeDialog();
    },
    onError: (error: any) => {},
  });

  const onSubmitHandler: SubmitFnType = (data: any, displayData, endSubmit) => {
    //@ts-ignore
    endSubmit(true);

    let newData = data?.requestParameters?.map((item) => {
      const newItem = {
        ...item,
        _isNewRow: true,
      };
      return newItem;
    });
    newData = CreateDetailsRequestData(newData);
    let reqData = {
      _isNewRow: true,
      ACTION: data?.ACTION.toUpperCase(),
      GET_QUERY: mynewSqlSyntaxRef.current,
      GET_TYPE: data?.GET_API_TYPE,
      DETAILS_DATA: newData,
      DOC_API_DTL: {
        COMP_CD: authState.companyID,
        _isNewRow: true,
        BRANCH_CD: authState.user.branchCode,
        DOC_CD: data?.DOC_CD,
        // API_ID: "73",
        API_ENDPOINT: `/enfinityCommonServiceAPI/GETDYNAMICDATA/${data?.ACTION.toUpperCase()}`,
      },
    };

    let updateReq = {
      _isUpdatedRow: true,
      ID: rowdata?.ID,
      IS_COMPRESSED: data?.IS_COMPRESSED,
      PAGINATION: data?.PAGINATION,
      CACHING: data?.CACHING,
      CACHING_INTERVAL: data?.CACHING_INTERVAL,
      DETAILS_DATA: {
        isNewRow: [],
        isDeleteRow: [],
        isUpdatedRow: [],
      },
      DOC_API_DTL: {},
    };

    if (Boolean(mynewSqlSyntaxRef.current)) {
      mutation.mutate(
        defaultView === "edit"
          ? { ...updateReq }
          : defaultView === "add"
          ? { ...reqData }
          : {}
      );
    } else {
      enqueueSnackbar("Please Enter SQL Syntax.", {
        variant: "warning",
      });
    }
  };
  return (
    <>
      <DialogTitle
        sx={{
          m: 1,
          p: 0,
          background: "var(--theme-color5)",
          color: "var(--theme-color2)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          "& .MuiTypography-body1": {
            fontSize: "1.5rem",
            paddingLeft: "10px",
            fontWeight: 500,
          },
          "& .MuiButtonBase-root": {
            color: "var(--theme-color2) !important",
          },
        }}
        id="customized-dialog-title"
      >
        <Typography>
          {utilFunction.getDynamicLabel(
            useLocation().pathname,
            authState?.menulistdata,
            true
          )}
        </Typography>
        <DialogActions>
          {defaultView === "edit" &&
            rowdata?.CACHING === "Y" &&
            data?.[0]?.STATUS !== "0" && (
              <GradientButton
                onClick={async () => {
                  let buttonName = await MessageBox({
                    messageTitle: "confirmation",
                    message: `${t("AreYouSureFlushKeys")} ${rowdata?.ACTION} `,
                    buttonNames: ["Yes", "No"],
                    icon: "CONFIRM",
                    defFocusBtnName: "Yes",
                    loadingBtnName: ["Yes"],
                  });
                  if (buttonName === "Yes") {
                    flush.mutate(
                      {
                        FLUSHALL: false,
                        DYNAMIC_ACTION: [rowdata?.ACTION],
                        FLAG: "S",
                      },
                      {
                        onSuccess() {
                          refetchKey();
                          CloseMessageBox();
                        },
                      }
                    );
                  }
                }}
              >
                {t("Flush")}
              </GradientButton>
            )}
          <GradientButton
            onClick={(event) =>
              formRef?.current?.handleSubmit(event, "BUTTON_CLICK")
            }
            endIcon={
              mutation?.isLoading ? <CircularProgress size={20} /> : null
            }
          >
            {t("Save")}
          </GradientButton>
          <GradientButton onClick={closeDialog}>{t("Close")}</GradientButton>
        </DialogActions>
      </DialogTitle>
      {mutation.isError && (
        <Alert
          severity={mutation.error?.severity ?? "error"}
          errorMsg={mutation.error?.error_msg ?? "Something went to wrong.."}
          errorDetail={mutation.error?.error_detail}
          color="error"
        />
      )}
      <Grid container spacing={2} sx={{ height: "100%", padding: "10px" }}>
        <Grid item xs={12} md={7}>
          <Box display="flex" flexDirection="column" height="100%">
            <FormWrapper
              key={`MerchantOnboardConfig`}
              metaData={getApiFormMetadata as MetaDataType}
              initialValues={rowdata ?? {}}
              onSubmitHandler={onSubmitHandler}
              formStyle={{ maxHeight: "80vh", overflowY: "auto" }}
              formState={{ formMode: defaultView }}
              hideHeader={true}
              ref={formRef}
            />
            {isLoading || isFetching ? (
              <Box display="flex" justifyContent="center" mt={2}>
                <CircularProgress color="secondary" size={20} />
              </Box>
            ) : isError ? (
              <AppBar position="relative" color="primary">
                <Alert
                  severity="error"
                  errorMsg={error?.error_msg ?? "Unknow Error"}
                  errorDetail={error?.error_detail ?? ""}
                  color="error"
                />
              </AppBar>
            ) : data?.[0]?.STATUS === "0" && data?.[0]?.MESSAGE ? (
              <AppBar position="relative" color="primary">
                <Alert
                  severity="warning"
                  errorMsg={data?.[0]?.MESSAGE ?? "Unknow Error"}
                  sx={{
                    "& span": {
                      color: "rgb(239 122 27) !important",
                    },
                  }}
                />
              </AppBar>
            ) : rowdata?.CACHING === "Y" ? (
              <KeyValueTable data={data} />
            ) : null}
          </Box>
        </Grid>

        <Grid item xs={12} md={5}>
          <Box
            position="relative"
            height="100%"
            display="flex"
            flexDirection="column"
          >
            <Typography
              component="label"
              sx={{
                color: "var(--theme-color1)",
                transform: "translateY(-0.25rem)",
                mb: 0.5,
              }}
            >
              {String(t("SQLANSIQuerySyntax"))}
            </Typography>
            <Box flexGrow={1} position="relative">
              <AceEditor
                className={headerClasses.aceContent}
                style={{
                  width: "100%",
                  minHeight: "250px",
                  border: "1px solid var(--theme-color6)",
                  borderRadius: "6px",
                  background: "var(--white)",
                  fontFamily: "Fira Mono, monospace",
                  fontSize: 14,
                  ...(defaultView === "view" && { opacity: 0.7 }),
                }}
                placeholder={String(t("SQLANSIQuerySyntax"))}
                mode="mysql"
                onChange={(value) => {
                  mynewSqlSyntaxRef.current = value;
                  setSqlSyntax(value);
                }}
                readOnly={Boolean(defaultView === "edit")}
                value={sqlSyntax}
                showPrintMargin={false}
                showGutter={false}
                highlightActiveLine={true}
                setOptions={{
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: true,
                  showLineNumbers: false,
                  tabSize: 2,
                  useWorker: false,
                }}
              />
              <IconButton
                size="small"
                onClick={() => setExpandEditor(true)}
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
            </Box>
          </Box>
        </Grid>
      </Grid>
      {expandEditor ? (
        <FullScreenSqlEditor
          defaultView={defaultView}
          open={expandEditor}
          closeEditor={() => setExpandEditor(false)}
          sql={sqlSyntax}
          setSql={setSqlSyntax}
        />
      ) : null}
    </>
  );
};
export const GetApiForm = ({ closeDialog, refetch, defaultView, flush }) => {
  return (
    <Dialog
      open={true}
      fullWidth={true}
      PaperProps={{
        style: {
          maxWidth: "1375px",
        },
      }}
    >
      <GetApiFormCustom
        refetch={refetch}
        closeDialog={closeDialog}
        defaultView={defaultView}
        flush={flush}
      />
    </Dialog>
  );
};

const FullScreenSqlEditor = ({
  defaultView,
  open,
  closeEditor,
  sql,
  setSql,
}) => {
  const [sqlSyntax, setSqlSyntax] = useState(sql ?? "");
  const mynewSqlSyntaxRef = useRef<any>("");
  const { t } = useTranslation();
  const headerClasses = useTypeStyles();
  const handleClose = () => {
    closeEditor();
  };
  const handleDone = () => {
    setSql(sqlSyntax);
    handleClose();
  };

  return (
    <Dialog
      open={true}
      fullWidth={true}
      onKeyUp={(event) => {
        if (event.key === "Escape") {
          handleClose();
        }
      }}
      PaperProps={{
        style: {
          width: "100%",
          overflow: "hidden",
          position: "relative",
          padding: "0 10px 10px 10px",
          height: "auto",
        },
      }}
      maxWidth="lg"
    >
      <AppBar
        style={{ position: "relative", marginBottom: "10px" }}
        className="form__header"
      >
        <Toolbar variant="dense" className={headerClasses.root}>
          <Typography
            component="span"
            variant="h5"
            className={headerClasses.formHeaderTitle}
          >
            {String(t("SQLANSIQuerySyntax"))}
          </Typography>
        </Toolbar>
      </AppBar>
      <DialogContent style={{ marginTop: "1rem", padding: 0 }}>
        <AceEditor
          placeholder={String(t("SQLANSIQuerySyntax"))}
          mode="mysql"
          onChange={(value) => {
            mynewSqlSyntaxRef.current = value;
            setSqlSyntax(value);
          }}
          width="100%"
          height="50vh"
          fontSize={14}
          value={sqlSyntax}
          readOnly={Boolean(defaultView === "edit")}
          showPrintMargin={true}
          showGutter={true}
          highlightActiveLine={true}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: false,
            showLineNumbers: true,
            tabSize: 2,
          }}
        />
      </DialogContent>
      <DialogActions
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <GradientButton onClick={handleDone}>{t("Done")}</GradientButton>
        <GradientButton onClick={handleClose}>{t("Cancel")}</GradientButton>
      </DialogActions>
    </Dialog>
  );
};
