import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  DailyTransactionImportGridMetaData,
  DailyTransactionImportMetadata,
} from "./dailyTransactionImportMetadata";
import { AuthContext } from "pages_audit/auth";
import * as API from "./api";
import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { useMutation, useQuery } from "react-query";
import { enqueueSnackbar } from "notistack";
import { AppBar, Box, CircularProgress, Dialog } from "@mui/material";
import {
  SubmitFnType,
  GridWrapper,
  ClearCacheProvider,
  ActionTypes,
  usePopupContext,
  GridMetaDataType,
  FormWrapper,
  MetaDataType,
  GradientButton,
  FileUploadControl,
  Alert,
  utilFunction,
} from "@acuteinfo/common-base";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import EnfinityLoader from "components/common/loader/EnfinityLoader";
const actions: ActionTypes[] = [
  {
    actionName: "errors",
    actionLabel: t("errors"),
    multiple: false,
    alwaysAvailable: true,
  },
];
const DailyTransactionImport = () => {
  const { authState } = useContext(AuthContext);
  const formRef = useRef<any>(null);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { t } = useTranslation();
  const hasUpdated = useRef(false);
  const [isSelectFileOpen, setIsSelectFileOpen] = useState(false);
  const gridRef = useRef<any>(null);
  const [actionMenu, setActionMenu] = useState(actions);
  const [filteredGridData, setFilteredGridData] = useState<any>([]);
  const [paraType, setParaType] = useState("A");
  const [reqPara, setReqPara] = useState<any>({});
  const gridDataRef = useRef<any>(false);
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const acctDtlParaRef = useRef<any>(null);

  const setCurrentAction = useCallback(async (data) => {
    if (data.name === "errors") {
      setActionMenu((values: any) => {
        return values.map((item) => {
          if (item.actionName === "errors") {
            return { ...item, actionName: "all", actionLabel: t("All") };
          } else {
            return item;
          }
        });
      });
      setParaType("E");
    } else if (data.name === "all") {
      setActionMenu((values: any) => {
        return values.map((item) => {
          if (item.actionName === "all") {
            return {
              ...item,
              actionName: "errors",
              actionLabel: t("errors"),
            };
          } else {
            return item;
          }
        });
      });
      setParaType("A");
    }
  }, []);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(
    ["getDailyTransactionImportData"],
    () =>
      API.getDailyTransactionImportData({
        COMP_CD: authState?.companyID,
        BRANCH_CD: gridDataRef.current?.BRANCH_CD,
        ACCT_CD: gridDataRef.current?.ACCT_CD,
        ACCT_TYPE: gridDataRef.current?.ACCT_TYPE,
        FLAG: "R",
        CHEQUE_NO: "",
        OPP_ENT: "",
        REMARKS: "",
        TABLE_NM: "",
        IGNR_INSUF: "",
      }),
    {
      enabled: false,
    }
  );
  useEffect(() => {
    if (Array.isArray(data)) {
      if (paraType === "E") {
        setFilteredGridData(data.filter((item) => !(item.STATUS === "Y")));
      } else if (paraType === "A") {
        setFilteredGridData(data);
      }
    }
  }, [data, paraType]);

  const getDailyTransactionUploadData: any = useMutation(
    API.getDailyTransactionImportData,
    {
      onError: (error: any) => {
        let errorMsg = "Unknown Error occured";
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
        enqueueSnackbar(errorMsg, {});
      },
      onSuccess: async (data, variables) => {
        enqueueSnackbar(t("DataSaveSuccessfully"), {
          variant: "success",
        });
        formRef?.current?.handleFormReset({ preventDefault: () => {} });
        setFilteredGridData([]);
      },
    }
  );
  const deleteImportedData: any = useMutation(API.deleteImportedData, {
    onError: (error: any) => {
      let errorMsg = "Unknown Error occured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      CloseMessageBox();
    },
    onSuccess: async (data, variables) => {
      setIsSelectFileOpen(true);
      CloseMessageBox();
    },
  });
  const getValidateToSelectFile: any = useMutation(
    API.getValidateToSelectFile,
    {
      onError: (error: any) => {
        let errorMsg = "Unknown Error occured";
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
      },
      onSuccess: async (data, variables) => {
        setReqPara(variables);
        // for (let i = 0; i < data?.length; i++) {
        if (data[0]?.O_STATUS === "9") {
          MessageBox({
            messageTitle: data[0]?.O_MSG_TITLE,
            message: data[0]?.O_MESSAGE,
            icon: "WARNING",
          });
        } else if (data[0]?.O_STATUS === "99") {
          const buttonName = await MessageBox({
            messageTitle: data[0]?.O_MSG_TITLE,
            message: data[0]?.O_MESSAGE,
            buttonNames: ["Merge", "Replace"],
            loadingBtnName: ["Replace"],
            icon: "CONFIRM",
          });
          if (buttonName === "Replace") {
            deleteImportedData.mutate({
              A_COMP_CD: authState?.companyID,
              WORKING_DATE: variables?.WORKING_DATE,
              A_TABLE_NM: variables?.A_TABLE_NM,
              A_BRANCH_CD: variables?.A_BRANCH_CD,
              A_ACCT_TYPE: variables?.A_ACCT_TYPE,
              A_ACCT_CD: variables?.A_ACCT_CD,
            });
          } else if (buttonName === "Merge") {
            setIsSelectFileOpen(true);
          }
        } else if (data[0]?.O_STATUS === "999") {
          MessageBox({
            messageTitle: data[0]?.O_MSG_TITLE,
            message: data[0]?.O_MESSAGE,
            icon: "ERROR",
          });
        } else if (data[0]?.O_STATUS === "0") {
          setIsSelectFileOpen(true);
        }
        // }
      },
    }
  );
  const dailyTranimportFileData = useMutation(API.dailyTranimportFileData, {
    onError: (error: any) => {
      let errorMsg = t("Unknownerroroccured");
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      CloseMessageBox();
      setIsSelectFileOpen(false);
    },
    onSuccess: async (data) => {
      if (Boolean(data)) {
        for (let i = 0; i < data?.length; i++) {
          if (data[i]?.O_STATUS === "999") {
            const btnName = await MessageBox({
              messageTitle: data[i]?.O_MSG_TITLE,
              message: data[i]?.O_MESSAGE,
              buttonNames: ["Ok"],
            });
          } else if (data[i]?.O_STATUS === "9") {
            const btnName = await MessageBox({
              messageTitle: data[i]?.O_MSG_TITLE,
              message: data?.[0]?.O_MESSAGE,
              icon: "WARNING",
            });
          } else if (data[i]?.O_STATUS === "99") {
            const btnName = await MessageBox({
              messageTitle: data[i]?.O_MSG_TITLE,
              message: data?.[0]?.O_MESSAGE,
              buttonNames: ["Yes", "No"],
              icon: "CONFIRM",
            });
          } else if (data[i]?.STATUS === "0") {
            enqueueSnackbar(t("dataImportedSuccessfully"), {
              variant: "success",
            });
            CloseMessageBox();
            setIsSelectFileOpen(false);
            refetch();
          }
        }
      }
    },
  });
  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    data["OPP_ENT"] = Boolean(data["OPP_ENT"]) ? "Y" : "N";
    data["IGNR_INSUF"] = Boolean(data["IGNR_INSUF"]) ? "Y" : "N";
    if (actionFlag === "SELECT") {
      getValidateToSelectFile.mutate({
        A_BRANCH_CD: data?.FROM_BRANCH_CD,
        A_ACCT_TYPE: data?.FROM_ACCT_TYPE,
        A_ACCT_CD: data?.FROM_ACCT_CD,
        A_CHEQUE_NO: data?.CHEQUE_NO,
        A_TYPE_CD: data?.TYPE_CD,
        A_TRAN_CD: data?.TRAN_CD,
        A_TABLE_NM: data?.TABLE_NM,
        A_SCREEN_REF: "MST/454",
        A_LOG_COMP: authState?.companyID,
        A_LOG_BRANCH: authState?.user?.branchCode,
        WORKING_DATE: authState?.workingDate,
        USERNAME: authState?.user?.name,
        USERROLE: authState?.role,
        ...data,
      });
    } else {
      if (gridRef.current?.cleanData?.().length === 0) {
        MessageBox({
          messageTitle: t("Validation"),
          message: t("NoRowFoundForUploadData"),
          icon: "ERROR",
        });
      } else if (
        gridRef.current?.cleanData?.().length &&
        gridRef.current?.cleanData?.().length > 0
      ) {
        getDailyTransactionUploadData.mutate({
          COMP_CD: authState.companyID,
          BRANCH_CD: authState?.user?.branchCode,
          ACCT_TYPE: data?.FROM_ACCT_TYPE,
          ACCT_CD: data?.FROM_ACCT_CD,
          FLAG: "P",
          IGNR_INSUF: data?.IGNR_INSUF,
          CHEQUE_NO: data?.CHEQUE_NO,
          OPP_ENT: data?.OPP_ENT,
          REMARKS: data?.REMARKS,
          TABLE_NM: data?.TABLE_NM,
        });
      }
    }
    endSubmit(true);
  };
  if (
    DailyTransactionImportGridMetaData &&
    data?.length > 0 &&
    !hasUpdated.current
  ) {
    DailyTransactionImportGridMetaData.gridConfig.gridLabel =
      DailyTransactionImportGridMetaData.gridConfig.gridLabel +
      " " +
      data[0]?.DEBIT_AC;
    hasUpdated.current = true; // Set flag to true to prevent further updates
  }

  DailyTransactionImportMetadata.form.label = utilFunction.getDynamicLabel(
    useLocation().pathname,
    authState?.menulistdata,
    true
  );
  return (
    <>
      <Box
        sx={{
          overflow: "hidden",
          position: "relative",
          minHeight: "100px",
        }}
      >
        <EnfinityLoader loading={getDailyTransactionUploadData.isLoading} />

        <FormWrapper
          key={"DailyTransactionImportForm"}
          metaData={DailyTransactionImportMetadata as MetaDataType}
          initialValues={{}}
          onSubmitHandler={onSubmitHandler}
          formStyle={{
            height: "auto",
          }}
          formState={{
            MessageBox: MessageBox,
            docCD: docCD,
            acctDtlReqPara: {
              FROM_ACCT_CD: {
                ACCT_TYPE: "FROM_ACCT_TYPE",
                BRANCH_CD: "FROM_BRANCH_CD",
                SCREEN_REF: docCD ?? "",
              },
            },
          }}
          ref={formRef}
          onFormButtonClickHandel={() => {
            let event: any = { preventDefault: () => {} };
            formRef?.current?.handleSubmit(event, "SELECT");
          }}
          setDataOnFieldChange={(action, payload) => {
            if (action === "API_REQ") {
              gridDataRef.current = payload;
              if (payload && payload.BRANCH_CD && payload.ACCT_CD) {
                refetch(); // Manually trigger the API call
              }
            } else if (action === "GRID_DETAIL") {
              setFilteredGridData([]);
            }
            if (action === "ACSHRTCTKEY_REQ") {
              acctDtlParaRef.current = payload;
            }
          }}
        >
          {({ isSubmitting, handleSubmit }) => (
            <>
              <GradientButton
                onClick={(event) => {
                  handleSubmit(event, "Save");
                }}
                disabled={isSubmitting}
                endIcon={
                  getDailyTransactionUploadData.isLoading ? (
                    <CircularProgress size={20} />
                  ) : null
                }
                color={"primary"}
              >
                {t("UploadData")}
              </GradientButton>
            </>
          )}
        </FormWrapper>

        <>
          {isError ? (
            <Fragment>
              <div style={{ width: "100%", paddingTop: "10px" }}>
                <Alert
                  severity={error?.severity ?? "error"}
                  errorMsg={error?.error_msg ?? "Error"}
                  errorDetail={error?.error_detail ?? ""}
                />
              </div>
            </Fragment>
          ) : null}
          <GridWrapper
            key={`DailyTransactionImportGrid` + hasUpdated.current + paraType}
            finalMetaData={
              DailyTransactionImportGridMetaData as GridMetaDataType
            }
            data={filteredGridData ?? []}
            setData={setFilteredGridData}
            actions={actionMenu}
            setAction={setCurrentAction}
            ref={gridRef}
            loading={isLoading}
          />
        </>

        {isSelectFileOpen && (
          <>
            <Dialog fullWidth maxWidth="md" open={isSelectFileOpen}>
              {dailyTranimportFileData?.isError ? (
                <div style={{ paddingRight: "10px", paddingLeft: "10px" }}>
                  <AppBar position="relative" color="primary">
                    <Alert
                      severity="error"
                      errorMsg={
                        dailyTranimportFileData?.error?.error_msg ??
                        "Unknow Error"
                      }
                      errorDetail={
                        dailyTranimportFileData?.error?.error_detail ?? ""
                      }
                      color="error"
                    />
                  </AppBar>
                </div>
              ) : null}
              <FileUploadControl
                key={"DailyTransactionFileUploadData"}
                onClose={() => {
                  setIsSelectFileOpen(false);
                }}
                editableFileName={false}
                defaultFileData={[]}
                onUpload={async (
                  formDataObj,
                  proccessFunc,
                  ResultFunc,
                  base64Object,
                  result
                ) => {
                  const FILEBLOB = [base64Object[0]];
                  dailyTranimportFileData.mutate({
                    FILEBLOB: FILEBLOB,
                    ...reqPara,
                    SCREEN_REF: docCD,
                    ACCT_TYPE: reqPara?.A_ACCT_TYPE,
                    SCROLL_NO: "",
                    ACCT_CD: reqPara?.A_ACCT_CD,
                  });
                }}
                gridProps={{}}
                maxAllowedSize={1024 * 1204 * 10} //10Mb file
                allowedExtensions={["xlsx", "pdf", "csv", "txt", "xls", "TXT"]}
                onUpdateFileData={(files) => {}}
              />
            </Dialog>
          </>
        )}
      </Box>
    </>
  );
};

export const DailyTransactionImportForm = () => {
  return (
    <ClearCacheProvider>
      <DailyTransactionImport />
    </ClearCacheProvider>
  );
};
