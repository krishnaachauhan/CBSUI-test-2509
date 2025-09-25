import { useMutation, useQuery } from "react-query";
import { cloneDeep } from "lodash-es";
import Dialog from "@mui/material/Dialog";
import * as API from "../api";
import { DynamicReportConfigMetaData } from "./metaData";
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AppBar,
  Box,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { makeStyles } from "@mui/styles";
import { Theme } from "@mui/material/styles";
import { RetrievalParametersGrid } from "./retrievalParameters";
import { useLocation } from "react-router-dom";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-mysql";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import { useTranslation } from "react-i18next";
import {
  Alert,
  GradientButton,
  LoaderPaperComponent,
  MasterDetailsForm,
  MasterDetailsMetaData,
  PopupMessageAPIWrapper,
  queryClient,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { AuthContext } from "pages_audit/auth";
import { debounce } from "lodash";

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
  refreshiconhover: {},
  aceContent: {
    "&  .ace_scroller": {
      "&  .ace_content": {
        margin: "0",
      },
    },
    "& .ace_scroller.ace_scroll-left:after": {
      boxShadow: "none",
    },
  },
}));

interface addMasterDataType {
  data: object;
  formMode: string;
  displayData?: object;
  endSubmit?: any;
  setFieldError?: any;
  SetLoadingOWN?: any;
}

const addMasterFormDataFnWrapper =
  (addMasterFn) =>
  async ({ data, formMode }: addMasterDataType) => {
    return addMasterFn(data, formMode);
  };

const DynamicReportConfig: FC<{
  isDataChangedRef: any;
  closeDialog?: any;
  defaultView?: "view" | "edit" | "add";
  transactionID: number;
}> = ({
  isDataChangedRef,
  closeDialog,
  defaultView = "view",
  transactionID,
}) => {
  const headerClasses = useTypeStyles();
  const myRef = useRef<any>(null);
  const isErrorFuncRef = useRef<any>(null);
  const [isOpenSave, setIsOpenSave] = useState(false);
  const myVerifyCntRef = useRef(0);
  const mySqlSyntaxRef = useRef<any>(defaultView === "add" ? false : true);
  const myoldSqlSyntaxRef = useRef<any>("");
  const myparameterDataRef = useRef<any>([]);
  const myOriginParameterRef = useRef<any>([]);
  // const [isLocalLoading, setLocalLoading] = useState(false);
  const [isOpenRerieval, setIsOpenRerieval] = useState(false);
  const [formName, setformName] = useState("");
  const [sqlSyntax, setSqlSyntax] = useState("");
  const mynewSqlSyntaxRef = useRef<any>("");
  const [formMode, setFormMode] = useState(defaultView);
  const moveToViewMode = useCallback(() => {
    setSqlSyntax(myoldSqlSyntaxRef.current);
    setFormMode("view");
  }, [setFormMode]);
  const moveToEditMode = useCallback(() => setFormMode("edit"), [setFormMode]);
  const [expandEditor, setExpandEditor] = useState(false);
  const { t } = useTranslation();
  const { MessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  let currentPath = useLocation().pathname;

  const [errorObjData, seterrorObjData] = useState({
    isError: false,
    error: { error_msg: "", error_detail: "" },
  });

  const { data, isLoading, isError, error } = useQuery<any, any>(
    ["getDynamicReportConfigData", transactionID],
    () => API.getDynamicReportConfigData(transactionID, formMode)
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getDynamicReportConfigData", transactionID]);
    };
  }, [transactionID]);

  const mutation = useMutation(
    addMasterFormDataFnWrapper(API.dynamicRptConfigDML()),
    {
      onError: (error: any, { endSubmit, SetLoadingOWN }) => {
        setIsOpenSave(false);
        SetLoadingOWN(false, error?.error_msg, error?.error_detail ?? "");
      },
      onSuccess: async (data, { endSubmit, SetLoadingOWN }) => {
        SetLoadingOWN(true, "");
        isDataChangedRef.current = true;
        await MessageBox({
          messageTitle: "Success",
          message: data ?? "",
          icon: "SUCCESS",
        });
        closeDialog();
      },
    }
  );
  const verifySql = useMutation(API.verifyDynRptSqlSyntax, {
    onError: (error: any) => {},
    onSuccess: async (apiData) => {
      mySqlSyntaxRef.current = true;
      // let detailData = apiData?.[0]?.DETAILS.map((itemDetail) => {
      //   return {
      //     ...itemDetail,
      //     _isNewRow: true,
      //   };
      // });

      myRef.current?.setGridData((existingData) => {
        let newData = apiData?.[0]?.DETAILS;
        existingData = existingData.map((item) => {
          let isExists = newData.some((item2) => {
            return (
              item2["COLUMN_ACCESSOR"] === item["COLUMN_ACCESSOR"] &&
              item2["SR_CD"] === item["SR_CD"]
            );
          });
          if (isExists) {
            return { ...item, _hidden: false };
          } else {
            return { ...item, _hidden: true };
          }
        });
        newData = newData.filter((item) => {
          let isExists = existingData.some((item2) => {
            return (
              item2["COLUMN_ACCESSOR"] === item["COLUMN_ACCESSOR"] &&
              item2["SR_CD"] === item["SR_CD"]
            );
          });
          return !isExists;
        });
        newData = newData.map((item) => {
          let existed = existingData.filter((item2) => {
            return item2["COLUMN_ACCESSOR"] === item["COLUMN_ACCESSOR"];
          });
          if (existed.length > 0) {
            let { SR_CD, _hidden, ...others } = existed[0];
            return { ...item, ...others, _isNewRow: true };
          }
          return { ...item, _isNewRow: true };
        });
        let mergedData = [...existingData, ...newData];
        //Sorting Data
        mergedData.sort((value1, value2) => {
          return parseInt(value1?.SR_CD ?? 0) - parseInt(value2?.SR_CD ?? 0);
        });
        let _displayIndex = 0;
        let finalData = mergedData.map((item, index) => {
          if (!Boolean(item["_hidden"])) {
            _displayIndex++;
          }
          return {
            ...item,
            NEW_SR_CD: index + 1,
            _displaySequence: _displayIndex,
          };
        });
        return finalData;
      });
      myparameterDataRef.current = apiData?.[0]?.PARAMETERS;
      setformName("dynDetail" + myVerifyCntRef.current);
      myVerifyCntRef.current = myVerifyCntRef.current + 1;
      setLocalError(false, "", "");
      await MessageBox({
        messageTitle: "Result",
        message: "QuerySuccessfullyVerified",
        icon: "SUCCESS",
      });
    },
  });

  const hasUpdates = (oldData, newData) => {
    // Check if the arrays have the same length
    if (oldData.length !== newData.length) {
      return true; // Different number of elements means there are updates
    }

    // Iterate through the arrays and compare each object
    for (let i = 0; i < oldData.length; i++) {
      const oldObj = oldData[i];
      const newObj = newData[i];

      // Compare the values of each key
      const oldValues = Object.values(oldObj);
      const newValues = Object.values(newObj);

      // Check if any value is different
      if (!oldValues.every((value, index) => value === newValues[index])) {
        return true; // Different values means there are updates
      }
    }
    return false; // Arrays are identical
  };

  const handleCollapseEditor = () => {
    setExpandEditor(false);
  };

  const handleExpandEditor = () => {
    setExpandEditor(true);
  };

  const onSubmitHandler = ({
    data,
    resultValueObj,
    resultDisplayValueObj,
    endSubmit,
    setFieldErrors,
    actionFlag,
  }) => {
    if (actionFlag === "close") {
      setLocalError(false, "", "");
      endSubmit(true, "");
      moveToViewMode();
      return;
    }
    if (!mySqlSyntaxRef.current) {
      setLocalError(true, t("PleaseVerifyQuery"), "");
      endSubmit(true, t("PleaseVerifyQuery"));
      return;
    }
    const SetLoadingOWN = (isLoading, error_msg = "", error_detail = "") => {
      // setLocalLoading(isLoading);
      endSubmit(isLoading, error_msg, error_detail);
    };

    data.PARAMETERS = myparameterDataRef.current;
    // data.SQL_ANSI_SYNTAX = mynewSqlSyntaxRef.current;
    data["DISABLE_GROUP_BY"] = Boolean(data["DISABLE_GROUP_BY"]) ? "Y" : "N";
    data["HIDE_AMOUNT_IN"] = Boolean(data["HIDE_AMOUNT_IN"]) ? "Y" : "N";
    data["HIDE_FOOTER"] = Boolean(data["HIDE_FOOTER"]) ? "Y" : "N";
    data["ACTIVE"] = Boolean(data["ACTIVE"]) ? "Y" : "N";

    if (mynewSqlSyntaxRef.current !== myoldSqlSyntaxRef.current) {
      data["SQL_ANSI_SYNTAX"] = mynewSqlSyntaxRef.current;
      data["_OLDROWVALUE"] = {
        ...data["_OLDROWVALUE"],
        SQL_ANSI_SYNTAX: myoldSqlSyntaxRef.current,
      };
      data["_UPDATEDCOLUMNS"] = [...data["_UPDATEDCOLUMNS"], "SQL_ANSI_SYNTAX"];
    } else {
      data["SQL_ANSI_SYNTAX"] = myoldSqlSyntaxRef.current;
    }

    const updatesExist = hasUpdates(
      myOriginParameterRef.current,
      data?.PARAMETERS
    );
    isErrorFuncRef.current = {
      data,
      SetLoadingOWN,
      endSubmit,
      formMode,
    };
    if (
      Array.isArray(data?._UPDATEDCOLUMNS) &&
      data._UPDATEDCOLUMNS.length === 0 &&
      Array.isArray(data?.DETAILS_DATA?.isDeleteRow) &&
      data?.DETAILS_DATA?.isDeleteRow?.length === 0 &&
      Array.isArray(data?.DETAILS_DATA?.isNewRow) &&
      data?.DETAILS_DATA?.isNewRow?.length === 0 &&
      Array.isArray(data?.DETAILS_DATA?.isUpdatedRow) &&
      data?.DETAILS_DATA?.isUpdatedRow?.length === 0 &&
      !updatesExist
    ) {
      moveToViewMode();
    } else {
      // setLocalLoading(true);
      setIsOpenSave(true);
      // mutation.mutate({
      //   data,
      //   SetLoadingOWN,
      //   endSubmit,
      //   formMode,
      // });
    }
  };

  const setLocalError = (isError, error_msg = "", error_detail = "") => {
    seterrorObjData({
      isError: isError,
      error: { error_msg: error_msg, error_detail: error_detail },
    });
  };

  const onCloseDialog = () => {
    setIsOpenRerieval(false);
  };

  const onActionCancel = () => {
    setIsOpenSave(false);
    isErrorFuncRef.current.SetLoadingOWN(false);
  };

  const onPopupYes = (data) => {
    mutation.mutate(data);
  };

  const onSaveParameters = (data) => {
    const upd = data.map((item) => ({
      ...item,
      IS_REQUIRED:
        item.IS_REQUIRED === "Y" || item.IS_REQUIRED === true ? "Y" : "N",
    }));
    myparameterDataRef.current = upd;
    setIsOpenRerieval(false);
  };

  let metadata: MasterDetailsMetaData = {} as MasterDetailsMetaData;

  metadata = cloneDeep(DynamicReportConfigMetaData) as MasterDetailsMetaData;

  useEffect(() => {
    setSqlSyntax(data?.[0]?.SQL_ANSI_SYNTAX ?? "");
    myparameterDataRef.current = data?.[0]?.PARA_DETAILS ?? [];
    myOriginParameterRef.current = data?.[0]?.PARA_DETAILS ?? [];
    myoldSqlSyntaxRef.current = data?.[0]?.SQL_ANSI_SYNTAX ?? "";
    mynewSqlSyntaxRef.current = data?.[0]?.SQL_ANSI_SYNTAX ?? "";
  }, [data]);

  useEffect(() => {
    mynewSqlSyntaxRef.current = sqlSyntax;
    mySqlSyntaxRef.current =
      myoldSqlSyntaxRef.current === mynewSqlSyntaxRef.current;
  }, [sqlSyntax]);

  const debouncedSetSqlSyntax = useRef(
    debounce((value: string) => {
      setSqlSyntax(value);
    }, 300)
  ).current;

  const handleAceChange = useCallback((value) => {
    mynewSqlSyntaxRef.current = value;
    debouncedSetSqlSyntax(value);
    mySqlSyntaxRef.current = false;
  }, []);

  return (
    <>
      {isLoading ? (
        <LoaderPaperComponent />
      ) : (
        <Grid container>
          <Grid
            item
            xs={12}
            sm={12}
            md={12}
            // style={{
            //   paddingTop: "10px",
            //   paddingLeft: "10px",
            //   paddingRight: "10px",
            // }}
          >
            <AppBar position="relative">
              <Toolbar className={headerClasses.root} variant={"dense"}>
                <Typography
                  className={headerClasses.formHeaderTitle}
                  component="span"
                  variant="h5"
                >
                  {utilFunction.getDynamicLabel(
                    currentPath,
                    authState?.menulistdata,
                    false
                  )}
                </Typography>
                {formMode === "edit" ? (
                  <>
                    <GradientButton
                      onClick={(event) => {
                        myRef.current?.onSubmitHandler(event);
                      }}
                      // disabled={isLocalLoading}
                    >
                      {t("Save")}
                    </GradientButton>
                    <GradientButton
                      onClick={(e) => {
                        myRef.current?.onSubmitHandler(e, "close");
                      }}
                      // disabled={isLocalLoading}
                      color={"primary"}
                    >
                      {t("Cancel")}
                    </GradientButton>
                  </>
                ) : formMode === "view" ? (
                  <>
                    <GradientButton onClick={moveToEditMode} disabled={isError}>
                      {t("Edit")}
                    </GradientButton>
                    <GradientButton onClick={closeDialog}>
                      {t("Close")}
                    </GradientButton>
                  </>
                ) : (
                  <>
                    <GradientButton
                      onClick={(event) => {
                        myRef.current?.onSubmitHandler(event);
                      }}
                    >
                      {t("Save")}
                    </GradientButton>
                    <GradientButton onClick={closeDialog}>
                      {t("Close")}
                    </GradientButton>
                  </>
                )}
              </Toolbar>
            </AppBar>
            {mutation?.isError || isError ? (
              <>
                <Alert
                  severity="error"
                  errorMsg={
                    mutation?.error?.error_msg || error?.error_msg || ""
                  }
                  errorDetail={
                    mutation?.error?.error_detail || error?.error_detail || ""
                  }
                />
              </>
            ) : null}
          </Grid>
          <Grid item xs={8} sm={6} md={8}>
            <MasterDetailsForm
              key={"dynReportConfig" + formMode}
              formNameMaster={"dynRptConfigMaster" + formMode}
              formName={formName + formMode}
              metaData={metadata}
              ref={myRef}
              initialData={{
                _isNewRow: formMode === "add" ? true : false,
                ...(data?.[0] ?? {}),
                DETAILS_DATA: data?.[0]?.DETAILS ?? [],
              }}
              displayMode={formMode === "add" ? "New" : formMode}
              isLoading={formMode === "view" ? true : mutation.isLoading}
              onSubmitData={onSubmitHandler}
              isNewRow={formMode === "add" ? true : false}
              containerstyle={{
                paddingRight: "10px",
                paddingLeft: "10px",
                paddingTop: "5px",
              }}
              formStyle={{
                background: "white",
                // height: "38vh",
                // overflowY: "auto",
                // overflowX: "hidden",
              }}
              hideHeader={true}
              isError={errorObjData.isError}
              errorObj={errorObjData.error}
            >
              {({ isSubmitting, handleSubmit }) => {
                return <></>;
              }}
            </MasterDetailsForm>
          </Grid>
          <Grid item xs={4} sm={6} md={4} style={{ paddingRight: "10px" }}>
            <Grid item xs={12} sm={12} md={12}>
              {verifySql.isError ? (
                <div style={{ marginBottom: "5px" }}>
                  <AppBar position="relative" color="primary">
                    <Alert
                      severity="error"
                      errorMsg={
                        verifySql?.error?.error_msg ?? "Somethingwenttowrong"
                      }
                      errorDetail={verifySql?.error?.error_detail}
                      color="error"
                    />
                  </AppBar>
                </div>
              ) : null}
            </Grid>
            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              style={{ paddingTop: "12px", position: "relative" }}
            >
              <Box position={"relative"}>
                <Typography
                  component="label"
                  sx={{
                    color: "var(--theme-color1)",
                    transform: "translateY(-0.25rem)",
                  }}
                >
                  {String(t("SQLANSIQuerySyntax"))}
                </Typography>
                <AceEditor
                  className={headerClasses.aceContent}
                  style={{
                    height: verifySql.isError ? "54vh" : "60vh",
                    width: "100%",
                    border: "1px solid var(--theme-color6)",
                    borderRadius: "6px",
                    background: "var(--white)",
                    boxShadow: "none",
                    fontFamily: "Fira Mono, monospace",
                    fontSize: 14,
                    transition: "border 0.2s",
                    ...(formMode === "view" && { opacity: 0.7 }),
                  }}
                  placeholder={String(t("SQLANSIQuerySyntax"))}
                  mode="mysql"
                  onChange={handleAceChange}
                  readOnly={formMode === "view" ? true : false}
                  fontSize={14}
                  value={sqlSyntax}
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
                <IconButton
                  size="small"
                  onClick={handleExpandEditor}
                  style={{
                    position: "absolute",
                    right: 12,
                    bottom: 12,
                    boxShadow:
                      "rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset",
                    background: "white",
                    zIndex: 2,
                  }}
                >
                  <Tooltip title={t("Maximize")}>
                    <OpenInFullIcon fontSize="small" />
                  </Tooltip>
                </IconButton>
              </Box>
            </Grid>
            {formMode === "edit" || formMode === "add" ? (
              <Grid
                container
                spacing={2}
                justifyContent="center"
                alignItems="center"
                style={{ padding: "20px 0" }}
              >
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={6}
                  lg={6}
                  sx={{ display: "flex", justifyContent: "right" }}
                >
                  <GradientButton
                    disabled={verifySql.isLoading}
                    endIcon={
                      verifySql.isLoading ? (
                        <CircularProgress size={20} />
                      ) : null
                    }
                    onClick={async () => {
                      if (Boolean(sqlSyntax)) {
                        verifySql.mutate({ sqlSyntax, detailsData: [] });
                      } else {
                        await MessageBox({
                          messageTitle: "Warning",
                          message: "PleaseEnterSQLSyntax",
                          icon: "WARNING",
                        });
                      }
                    }}
                    sx={{
                      minWidth: "120px",
                    }}
                  >
                    {t("VerifyAndPopulate")}
                  </GradientButton>
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={6}>
                  <GradientButton
                    onClick={async () => {
                      if (!Boolean(sqlSyntax)) {
                        await MessageBox({
                          messageTitle: "Warning",
                          message: "PleaseEnterSQLSyntax",
                          icon: "WARNING",
                        });
                      } else if (!mySqlSyntaxRef.current) {
                        await MessageBox({
                          messageTitle: "Warning",
                          message: "PleaseVerifySQLSyntax",
                          icon: "WARNING",
                        });
                      } else {
                        // createRetrievalMetaData(sqlSyntax);
                        setIsOpenRerieval(true);
                      }
                    }}
                  >
                    {t("Parameters")}
                  </GradientButton>
                </Grid>
              </Grid>
            ) : null}
          </Grid>
        </Grid>
      )}

      {expandEditor ? (
        <FullScreenSqlEditor
          open={expandEditor}
          closeEditor={handleCollapseEditor}
          sql={sqlSyntax}
          setSql={setSqlSyntax}
          formMode={formMode}
        />
      ) : null}

      {isOpenRerieval ? (
        <RetrievalParametersGrid
          isOpen={isOpenRerieval}
          formMode={undefined}
          onClose={onCloseDialog}
          rowsData={myparameterDataRef.current}
          onSaveData={onSaveParameters}
        />
      ) : null}
      {isOpenSave ? (
        <PopupMessageAPIWrapper
          MessageTitle="Confirmation"
          Message={t("DoyouwanttosavethisRecord")}
          onActionYes={(rowVal) => onPopupYes(rowVal)}
          onActionNo={() => onActionCancel()}
          rows={isErrorFuncRef.current}
          open={isOpenSave}
          loading={mutation.isLoading}
        />
      ) : null}
    </>
  );
};

export const DynamicReportConfigWrapper = ({
  isDataChangedRef,
  closeDialog,
  defaultView,
}) => {
  const { state: data }: any = useLocation();
  return (
    <Dialog
      open={true}
      fullWidth={true}
      PaperProps={{
        style: {
          width: "100%",
          maxWidth: "90%",
        },
      }}
    >
      <DynamicReportConfig
        isDataChangedRef={isDataChangedRef}
        closeDialog={closeDialog}
        defaultView={defaultView}
        transactionID={data?.[0]?.data?.TRAN_CD}
      />
    </Dialog>
  );
};

const FullScreenSqlEditor = ({ open, closeEditor, sql, setSql, formMode }) => {
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
            {t("SQLANSIQuerySyntax")}
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
          readOnly={formMode === "view" ? true : false}
          value={sqlSyntax}
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
