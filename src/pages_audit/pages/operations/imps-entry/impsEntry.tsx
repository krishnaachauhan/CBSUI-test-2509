import {
  AppBar,
  Container,
  Dialog,
  Grid,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";
import { t } from "i18next";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthContext } from "pages_audit/auth";
import { impsEntryMetadata } from "./impsEntryMetadata";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import i18n from "components/multiLanguage/languagesConfiguration";
import { RetrieveData } from "./retrieveData/retrieveData";
import {
  Alert,
  ClearCacheProvider,
  usePopupContext,
  utilFunction,
  GradientButton,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  MasterDetailsMetaData,
  MasterDetailsForm,
} from "@acuteinfo/common-base";
import { LinearProgressBarSpacer } from "components/common/custom/linerProgressBarSpacer";
import { format } from "date-fns";
import { enqueueSnackbar } from "notistack";
import PhotoSignWithHistory from "components/common/custom/photoSignWithHistory/photoSignWithHistory";
import Draggable from "react-draggable";
import JointDetails from "../DailyTransaction/TRNHeaderTabs/JointDetails";
import { getdocCD } from "components/utilFunction/function";
import { ImpsDetailForm } from "./impsDetailForm/impsDetailForm";

export const ImpsEntryCustom = () => {
  const actions: ActionTypes[] = [
    {
      actionName: "imps-details",
      actionLabel: "impsDetails",
      multiple: false,
      rowDoubleClick: true,
      alwaysAvailable: false,
    },
  ];
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [isData, setIsData] = useState<any>({
    closeAlert: true,
    photoSignJointDtlReq: {},
    uniqNo: 0,
  });
  const [formMode, setFormMode] = useState<any>("new");
  const [retrieveData, setRetrieveData] = useState<any>([]);
  const [currentIndex, setCurrentIndex] = useState<any>(0);
  const formRef = useRef<any>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  // After Retrieve data API is calling for details data
  const impsDetails: any = useMutation(
    ["getImpsDetails"],
    () =>
      API.getImpsDetails({
        ENT_COMP_CD: retrieveData?.[0]?.ENTERED_COMP_CD,
        ENT_BRANCH_CD: retrieveData?.[0]?.ENTERED_BRANCH_CD,
        TRAN_CD: retrieveData?.[0]?.TRAN_CD,
      }),
    {
      onSuccess(data) {
        setIsData((old) => ({
          ...old,
          closeAlert: false,
        }));
        if (Array.isArray(data) && data?.length > 0) {
          let newData = data.map((item) => {
            let {
              OLD_PERDAY_BBPS_LIMIT,
              OLD_PERDAY_IFT_LIMIT,
              OLD_PERDAY_NEFT_LIMIT,
              OLD_PERDAY_OWN_LIMIT,
              OLD_PERDAY_P2A_LIMIT,
              OLD_PERDAY_P2P_LIMIT,
              OLD_PERDAY_PG_AMT,
              OLD_PERDAY_RTGS_LIMIT,
              ...restdata
            } = item;
            return restdata;
          });

          formRef.current?.setGridData(newData);
        } else {
          formRef.current?.setGridData([]);
        }
      },
      onError(err) {
        formRef.current?.setGridData([]);
        setIsData((old) => ({
          ...old,
          closeAlert: true,
        }));
      },
    }
  );
  useEffect(() => {
    if (retrieveData?.[0]?.TRAN_CD) {
      impsDetails.mutate();
    }
  }, [retrieveData?.[0]?.TRAN_CD]);

  // API calling on populate button and then set in rowdata
  const populatedata: any = useMutation(
    "getRtgsRetrieveData",
    API.populateData,
    {
      onSuccess: (data) => {
        setIsData((old) => ({ ...old, closeAlert: false }));
        let rowData = formRef.current?.GetGirdData();
        if (rowData?.length > 0) {
          function isMatch(item1, item2) {
            return (
              item1.COMP_CD.trim() === item2.COMP_CD.trim() &&
              item1.BRANCH_CD.trim() === item2.BRANCH_CD.trim() &&
              item1.ACCT_TYPE.trim() === item2.ACCT_TYPE.trim() &&
              item1.ACCT_CD.trim() === item2.ACCT_CD.trim()
            );
          }
          let filteredData = data.filter((d2Item) => {
            return !rowData.some((d1Item) => isMatch(d1Item, d2Item));
          });
          if (filteredData?.length > 0) {
            messagebox(filteredData);
          }
        } else {
          formRef.current?.setGridData(data);
        }
      },
      onError(err) {
        setIsData((old) => ({
          ...old,
          closeAlert: true,
        }));
      },
    }
  );

  // after retrieve data so API calling for populatedata is automatically, then click on populate button so API is called , then compare both APIs response data and same data is removed using this function.and inside the response any message found so message is appear in messagebox.
  const messagebox = async (filterData) => {
    let insertData: any = [];
    if (filterData?.length) {
      for (let i = 0; i < filterData?.length; i++) {
        if (filterData[i]?.STATUS !== "0") {
          await MessageBox({
            messageTitle: "Alert",
            message: filterData[i]?.MESSAGE,
            defFocusBtnName: "Ok",
            icon: "WARNING",
          });
        } else {
          insertData.push(filterData[i]);
        }
      }
      formRef.current?.setGridData((old) => {
        return [...old, ...insertData];
      });
    }
  };

  // API calling for data insert and update
  const crudIMPS: any = useMutation("crudDataIMPS", API.crudDataIMPS, {
    onSuccess: (data, variables) => {
      setIsData((old) => ({ ...old, closeAlert: false }));
      if (variables?._isNewRow) {
        setFormMode("new");
        enqueueSnackbar(t("RecordInsertedMsg"), { variant: "success" });
      } else if (
        variables?._isUpdateRow ||
        variables?.DETAILS_DATA?.isUpdatedRow?.length > 0
      ) {
        if (variables?.DETAILS_DATA?.isUpdatedRow?.length > 0) {
          impsDetails.mutate();
        }
        enqueueSnackbar(t("RecordUpdatedMsg"), { variant: "success" });
      }
      CloseMessageBox();
    },
    onError() {
      CloseMessageBox();
      setIsData((old) => ({
        ...old,
        closeAlert: true,
      }));
    },
  });

  //After data is validate succeessfully,  this function is called for Delete single row or Main , if the function is called for single row and API is called successfull for delete so accounlist API is refetching
  const validateDelete: any = useMutation(
    "getRtgsRetrieveData",
    API.validateDeleteData,
    {
      onSuccess: (data, variables) => {
        setIsData((old) => ({ ...old, closeAlert: false }));
        if (data?.[0]?.O_STATUS !== "0") {
          MessageBox({
            messageTitle: data?.[0]?.O_MSG_TITLE
              ? data?.[0]?.O_MSG_TITLE
              : data?.[0]?.O_STATUS === "999"
              ? "ValidationFailed"
              : data?.[0]?.O_STATUS === "99"
              ? "confirmation"
              : "ALert",
            message: data?.[0]?.O_MESSAGE,
            icon:
              data?.[0]?.O_STATUS === "999"
                ? "ERROR"
                : data?.[0]?.O_STATUS === "99"
                ? "CONFIRM"
                : "WARNING",
            defFocusBtnName: "Ok",
          });
        } else {
          const apiCall = async () => {
            let apiReq = {
              _isNewRow: false,
              _isDeleteRow: variables?.FLAG === "S" ? false : true,
              _isUpdateRow: false,
              ENTERED_COMP_CD: retrieveData?.[0]?.ENTERED_COMP_CD,
              ENTERED_BRANCH_CD: retrieveData?.[0]?.ENTERED_BRANCH_CD,
              TRAN_CD: retrieveData?.[0]?.TRAN_CD,
              DETAILS_DATA: {
                isNewRow: [],
                isDeleteRow:
                  variables?.FLAG === "S"
                    ? variables?.deleteSingleRowData
                    : formRef.current?.GetGirdData(),
                isUpdatedRow: [],
              },
            };
            let buttonName = await MessageBox({
              messageTitle: "confirmation",
              message: "AreYouSureToProcced",
              defFocusBtnName: "Yes",
              buttonNames: ["Yes", "No"],
              loadingBtnName: ["Yes"],
              icon: "CONFIRM",
            });

            if (buttonName === "Yes") {
              crudIMPS.mutate(apiReq, {
                onSuccess: (data, variables) => {
                  if (
                    variables?.FLAG === "S" &&
                    variables?.DETAILS_DATA?.isDeleteRow?.length > 0
                  ) {
                    impsDetails.mutate();
                  } else {
                    setFormMode("new");
                    formRef?.current?.handleFormReset({
                      preventDefault: () => {},
                    });
                  }
                  if (
                    variables?._isDeleteRow ||
                    variables?.DETAILS_DATA?.isDeleteRow?.length > 0
                  ) {
                    enqueueSnackbar(t("RecordRemovedMsg"), {
                      variant: "success",
                    });
                  }
                },
              });
            }
          };
          let rowData = formRef.current?.GetGirdData();
          if (rowData?.length !== currentIndex) {
            if (variables?.FLAG === "S") {
              apiCall();
            } else {
              setCurrentIndex((old) => old + 1);
              setTimeout(() => {
                deleteData({ flag: "A" });
              }, 1000);
            }
          } else {
            apiCall();
          }
        }
      },
      onError(err) {
        setIsData((old) => ({
          ...old,
          closeAlert: true,
        }));
      },
    }
  );

  //common API request for validate data before delete data
  const deleteData: any = async ({ flag, reqData, deleteSingleRowData }) => {
    let rowData = formRef.current?.GetGirdData();
    let apiReq = {
      A_ENTERED_BY: retrieveData?.[0]?.ENTERED_BY ?? "",
      A_CONFIRMED: retrieveData?.[0]?.CONFIRMED ?? "",
      A_LOGIN_COMP: authState?.companyID,
      A_LOGIN_BRANCH: authState?.user?.branchCode,
      WORKING_DATE: authState?.workingDate,
      USERNAME: authState?.user?.id,
      USERROLE: authState?.role,
      A_BRANCH_CD:
        flag === "S"
          ? reqData?.BRANCH_CD
          : flag === "A"
          ? rowData[currentIndex]?.BRANCH_CD
          : "",
      A_ACCT_TYPE:
        flag === "S"
          ? reqData?.ACCT_TYPE
          : flag === "A"
          ? rowData[currentIndex]?.ACCT_TYPE
          : "",
      A_ACCT_CD:
        flag === "S"
          ? reqData?.ACCT_CD
          : flag === "A"
          ? rowData[currentIndex]?.ACCT_CD
          : "",
      A_REG_DT:
        flag === "S"
          ? reqData?.REG_DATE
          : flag === "A"
          ? rowData[currentIndex]?.REG_DT
            ? format(new Date(rowData[currentIndex]?.REG_DT), "dd/MMM/yyyy")
            : ""
          : "",
      FLAG: flag,
      deleteSingleRowData: deleteSingleRowData,
    };
    validateDelete.mutate(apiReq);
  };

  const onSubmitHandler = async ({ data, displayData, endSubmit }) => {
    let messagebox = async (apiReq) => {
      let buttonName = await MessageBox({
        messageTitle: rowData?.length ? "confirmation" : "Alert",
        message: rowData?.length
          ? "AreYouSureToProcced"
          : "Atleastonerowmustbeindetail",
        defFocusBtnName: rowData?.length ? "Yes" : "Ok",
        buttonNames: rowData?.length ? ["Yes", "No"] : ["Ok"],
        loadingBtnName: ["Yes"],
        icon: rowData?.length ? "CONFIRM" : "WARNING",
      });
      if (buttonName === "Yes") {
        crudIMPS.mutate(apiReq);
      }
    };
    let rowData = formRef.current?.GetGirdData();
    if (rowData?.length) {
      const formatRowData = (item) => {
        item.REG_DT = item?.REG_DT
          ? format(new Date(item.REG_DT), "dd/MMM/yyyy")
          : "";
        Object.keys(item).forEach((key) => {
          if (typeof item[key] === "boolean") {
            item[key] = item[key] ? "Y" : "N";
          } else if (typeof item[key] === "object" && item[key] !== null) {
            Object.keys(item[key]).forEach((nestedKey) => {
              if (typeof item[key][nestedKey] === "boolean") {
                item[key][nestedKey] = item[key][nestedKey] ? "Y" : "N";
              }
            });
            return item;
          }
        });
      };

      if (
        Array.isArray(data?.DETAILS_DATA?.isNewRow) &&
        data?.DETAILS_DATA?.isNewRow?.length > 0
      ) {
        data?.DETAILS_DATA?.isNewRow?.map(formatRowData);
      }
      if (
        Array.isArray(data?.DETAILS_DATA?.isUpdatedRow) &&
        data?.DETAILS_DATA?.isUpdatedRow?.length > 0
      ) {
        data?.DETAILS_DATA?.isUpdatedRow?.map(formatRowData);
      }
      let apiReq = {
        ...data,
        ACTIVE:
          data?.ACTIVE === "Y"
            ? "Y"
            : data?.ACTIVE === "N"
            ? "N"
            : data?.ACTIVE
            ? "Y"
            : !data?.ACTIVE
            ? "N"
            : "",
        DEACTIVE_DT: data?.DEACTIVE_DT
          ? format(new Date(data?.DEACTIVE_DT), "dd/MMM/yyyy")
          : "",
        _isUpdateRow: formMode === "edit" ? true : false,
      };

      messagebox(apiReq);
    } else {
      messagebox(null);
    }

    // @ts-ignore
    endSubmit(true);
  };

  // for shortcut-key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "s" && event.ctrlKey) {
        event.preventDefault();
        formRef?.current?.handleSubmit({ preventDefault: () => {} }, "Save");
      } else if (event.key === "r" && event.ctrlKey) {
        event.preventDefault();
        navigate("retrieve-form");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const setCurrentAction = useCallback(
    async (data) => {
      if (data.name === "imps-details" && formMode !== "view") {
        navigate(data?.name, {
          state: data?.rows,
        });
      }
    },
    [navigate, formMode]
  );

  return (
    <>
      <Container>
        <Grid
          sx={{
            backgroundColor: "var(--theme-color2)",
            padding: "0px",
            borderRadius: "10px",
            boxShadow:
              "rgba(136, 165, 191, 0.48) 6px 2px 16px 0px, rgba(255, 255, 255, 0.8) -6px -2px 16px 0px;",
          }}
        >
          {populatedata?.isLoading ||
          validateDelete?.isLoading ||
          impsDetails?.isLoading ? (
            <LinearProgress color="inherit" />
          ) : (populatedata?.isError && isData.closeAlert) ||
            (validateDelete?.isError && isData.closeAlert) ||
            (crudIMPS?.isError && isData.closeAlert) ||
            (impsDetails?.isError && isData.closeAlert) ? (
            <AppBar position="relative" color="primary">
              <Alert
                severity="error"
                errorMsg={
                  populatedata?.error?.error_msg ??
                  validateDelete?.error?.error_msg ??
                  crudIMPS?.error?.error_msg ??
                  impsDetails?.error?.error_msg ??
                  "Unknow Error"
                }
                errorDetail={
                  populatedata?.error?.error_detail ??
                  validateDelete?.error?.error_detail ??
                  crudIMPS?.error?.error_detail ??
                  impsDetails?.error?.error_detail ??
                  ""
                }
                color="error"
              />
            </AppBar>
          ) : (
            <LinearProgressBarSpacer />
          )}
          <MasterDetailsForm
            key={"atm-master-form" + formMode + retrieveData?.[0]?.TRAN_CD}
            subHeaderLabel={utilFunction.getDynamicLabel(
              useLocation().pathname,
              authState?.menulistdata,
              true
            )}
            subHeaderLabelStyle={{ paddingLeft: "0px" }}
            metaData={impsEntryMetadata as MasterDetailsMetaData}
            isNewRow={formMode === "new" ? true : false}
            initialData={{
              ...(formMode === "new" ? {} : retrieveData?.[0]),
              DETAILS_DATA:
                formMode === "new" ? [] : formRef.current?.GetGirdData(),
            }}
            formState={{
              MessageBox: MessageBox,
              FORM_MODE: formMode,
              formRef: formRef,
              docCD: docCD,
            }}
            displayMode={formMode}
            isDetailRowRequire={false}
            onSubmitData={onSubmitHandler}
            onFormButtonClickHandel={(id, dependent) => {
              if (
                dependent?.CUSTOMER_ID &&
                dependent?.CUSTOMER_ID?.value !== ""
              ) {
                populatedata.mutate({
                  COMP_CD: authState?.companyID,
                  CUSTOMER_ID: dependent?.CUSTOMER_ID?.value,
                  A_LANG: i18n.resolvedLanguage,
                  WORKING_DATE: authState?.workingDate,
                });
              }
            }}
            actions={actions}
            handelActionEvent={setCurrentAction}
            onClickActionEvent={(index, id, data) => {
              if (id.includes("ALLOW_DELETE")) {
                deleteData({
                  flag: "S",
                  reqData: {
                    REG_DATE: data?.["REG_DATE"]
                      ? format(new Date(data?.["REG_DATE"]), "dd/MMM/yyyy")
                      : "",
                    BRANCH_CD: data?.["BRANCH_CD"],
                    ACCT_TYPE: data?.["ACCT_TYPE"],
                    ACCT_CD: data?.["ACCT_CD"],
                  },
                  deleteSingleRowData: [
                    {
                      ENTERED_COMP_CD: data?.["ENTERED_COMP_CD"],
                      ENTERED_BRANCH_CD: data?.["ENTERED_BRANCH_CD"],
                      TRAN_CD: data?.["TRAN_CD"],
                      SR_CD: data?.["SR_CD"],
                    },
                  ],
                });
              } else if (id.includes("PHOTO_SIGN")) {
                setIsData((old) => ({
                  ...old,
                  photoSignJointDtlReq: {
                    COMP_CD: data?.["COMP_CD"],
                    BRANCH_CD: data?.["BRANCH_CD"],
                    ACCT_TYPE: data?.["ACCT_TYPE"],
                    ACCT_CD: data?.["ACCT_CD"],
                    SCREEN_REF: docCD,
                  },
                }));
                navigate("photo-sign");
              } else if (id.includes("JOINT_DETAILS")) {
                setIsData((old) => ({
                  ...old,
                  photoSignJointDtlReq: {
                    COMP_CD: data?.["COMP_CD"],
                    BRANCH_CD: data?.["BRANCH_CD"],
                    ACCT_TYPE: data?.["ACCT_TYPE"],
                    ACCT_CD: data?.["ACCT_CD"],
                    BTN_FLAG: "Y",
                  },
                }));
                navigate("joint-details");
              }
            }}
            isLoading={false}
            formStyle={{}}
            ref={formRef}
          >
            {({ isSubmitting, handleSubmit }) => (
              <>
                {retrieveData?.length > 0 && (
                  <>
                    <Typography
                      fontWeight={400}
                      color={"var(--theme-color2)"}
                      paddingRight={"25px"}
                    >
                      {retrieveData?.[0]?.CONFIRMED === "Y"
                        ? t("Confirmed")
                        : retrieveData?.[0]?.CONFIRMED === "R"
                        ? t("Rejected")
                        : retrieveData?.[0]?.CONFIRMED === "N"
                        ? t("confirmPending")
                        : null}
                    </Typography>

                    <GradientButton
                      onClick={() =>
                        setFormMode(formMode === "edit" ? "view" : "edit")
                      }
                      color={"primary"}
                      disabled={
                        populatedata?.isLoading || validateDelete?.isLoading
                      }
                    >
                      {formMode === "edit" ? t("View") : t("Edit")}
                    </GradientButton>
                    <GradientButton
                      onClick={() => {
                        setFormMode("new");
                        setRetrieveData({});
                      }}
                      disabled={
                        populatedata?.isLoading || validateDelete?.isLoading
                      }
                      color={"primary"}
                    >
                      {t("New")}
                    </GradientButton>
                    <GradientButton
                      onClick={() => {
                        setCurrentIndex(0);
                        setTimeout(() => {
                          deleteData({ flag: "M" });
                        }, 1000);
                      }}
                      disabled={
                        populatedata?.isLoading || validateDelete?.isLoading
                      }
                      color={"primary"}
                    >
                      {t("Delete")}
                    </GradientButton>
                  </>
                )}
                <GradientButton
                  onClick={() => navigate("retrieve-form")}
                  color={"primary"}
                  disabled={
                    populatedata?.isLoading || validateDelete?.isLoading
                  }
                >
                  {t("Retrieve")}
                </GradientButton>
                <GradientButton
                  color={"primary"}
                  disabled={
                    populatedata?.isLoading ||
                    validateDelete?.isLoading ||
                    formMode === "view"
                  }
                  onClick={(event) => handleSubmit(event, "BUTTON_CLICK")}
                >
                  {t("Save")}
                </GradientButton>
              </>
            )}
          </MasterDetailsForm>

          <Routes>
            <Route
              path="retrieve-form/*"
              element={
                <RetrieveData
                  navigate={navigate}
                  setFormMode={setFormMode}
                  setRetrieveData={setRetrieveData}
                />
              }
            />
            <Route
              path="imps-details/*"
              element={
                <ImpsDetailForm
                  navigate={navigate}
                  formMode={formMode}
                  formRef={formRef}
                />
              }
            />
            <Route
              path="photo-sign/*"
              element={
                <PhotoSignWithHistory
                  data={isData?.photoSignJointDtlReq ?? {}}
                  onClose={() => navigate(".")}
                  screenRef={docCD}
                />
              }
            />
            <Route
              path="joint-details/*"
              element={
                <Dialog
                  open={true}
                  fullWidth={true}
                  PaperProps={{
                    style: {
                      maxWidth: "1230px",
                      padding: "5px",
                    },
                  }}
                  PaperComponent={(props) => (
                    <Draggable
                      handle="#draggable-dialog-title"
                      cancel={'[class*="MuiDialogContent-root"]'}
                    >
                      <Paper {...props} />
                    </Draggable>
                  )}
                >
                  <div id="draggable-dialog-title">
                    <JointDetails
                      reqData={{
                        ...isData?.photoSignJointDtlReq,
                        custHeader: true,
                      }}
                      closeDialog={() => navigate(-1)}
                    />
                  </div>
                </Dialog>
              }
            />
          </Routes>
        </Grid>
      </Container>
    </>
  );
};

export const ImpsEntry = () => {
  return (
    <ClearCacheProvider>
      <ImpsEntryCustom />
    </ClearCacheProvider>
  );
};
