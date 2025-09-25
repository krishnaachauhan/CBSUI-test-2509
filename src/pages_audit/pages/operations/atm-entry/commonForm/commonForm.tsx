import {
  AppBar,
  CircularProgress,
  Dialog,
  LinearProgress,
  Paper,
} from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { t } from "i18next";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Draggable from "react-draggable";
import { useMutation } from "react-query";
import { AuthContext } from "pages_audit/auth";
import { commonFormMetaData } from "./commonFormMetadata";
import { CardPrinting } from "../cardPrinting";
import { RetrieveCfmData } from "../confirm/retrieveCfmData/retrieveCfmData";
import JointDetails from "../../DailyTransaction/TRNHeaderTabs/JointDetails";
import {
  confirmData,
  crudData,
  getATMcardDetails,
  validateInsertData,
} from "../api";
import { format } from "date-fns";
import { CardDetails } from "../cardDetails/cardDetails";
import { RetrieveData } from "../retrieveData/retrieveData";
import { AtmEntryMetaData } from "./metaData/atmEntryMetadata";
import { atmentrymetadata } from "./metaData/atmEntryMetadata2";
import { enqueueSnackbar } from "notistack";
import { LinearProgressBarSpacer } from "components/common/custom/linerProgressBarSpacer";
import {
  ActionTypes,
  Alert,
  MasterDetailsForm,
  MasterDetailsMetaData,
  usePopupContext,
  GradientButton,
  utilFunction,
} from "@acuteinfo/common-base";
import PhotoSignWithHistory from "components/common/custom/photoSignWithHistory/photoSignWithHistory";
import { ViewChanges } from "../../imps-entry/confirm/viewChanges/viewChanges";
import { getdocCD } from "components/utilFunction/function";
const CommonForm = (props) => {
  const [formMode, setFormMode] = useState<any>("new");
  const actions: ActionTypes[] = [
    {
      actionName: "card-details",
      actionLabel: "Add",
      multiple: undefined,
      rowDoubleClick: false,
      alwaysAvailable: formMode !== "view" ? true : false,
    },
    {
      actionName: "card-details",
      actionLabel: "Edit",
      multiple: false,
      rowDoubleClick: true,
      alwaysAvailable: false,
    },
    {
      actionName: "delete-details",
      actionLabel: "Delete",
      multiple: false,
      rowDoubleClick: false,
      alwaysAvailable: false,
      shouldExclude: (data) => {
        if (
          data?.[0]?.data?.EDIT_STATUS &&
          data?.[0]?.data?.EDIT_STATUS === "N"
        ) {
          return true;
        } else {
          if (
            data?.[0]?.data?.ALLOW_DELETE &&
            data?.[0]?.data?.ALLOW_DELETE !== "Y"
          ) {
            return true;
          } else {
            return false;
          }
        }
      },
    },
  ];

  const navigate = useNavigate();
  let { FLAG, ...parameter } = props?.parameter;
  const [isData, setIsData] = useState<any>({
    cardData: {},
    isVisible: false,
    isOpenCard: false,
    closeAlert: true,
    uniqueNo: 0,
  });

  const [retrieveData, setRetrieveData] = useState<any>();
  const [filteredData, setFilteredData] = useState<any>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const myRef = useRef<any>(null);
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const masterCommonFormMetaData = {
    ...commonFormMetaData,
    masterForm: {
      ...commonFormMetaData.masterForm,
      fields:
        parameter?.PARA_602 === "Y"
          ? AtmEntryMetaData.fields
          : parameter?.PARA_602 === "N"
          ? atmentrymetadata.fields
          : [],
    },
  };

  const cardDetails: any = useMutation(
    "getATMcardDetails",
    () =>
      getATMcardDetails({
        A_COMP_CD: retrieveData?.[currentIndex]?.COMP_CD,
        A_BRANCH_CD: retrieveData?.[currentIndex]?.BRANCH_CD,
        A_TRAN_CD: retrieveData?.[currentIndex]?.TRAN_CD,
        PARA_604: parameter?.PARA_604,
        PARA_601: parameter?.PARA_601,
      }),
    {
      onSuccess(data) {
        let newData: any = [];
        if (Array.isArray(data) && data?.length > 0) {
          newData = data.map((item) => {
            return {
              ...item,
              EDIT_STATUS: retrieveData?.[currentIndex]?.EDIT_STATUS,
              ID_SR_NO: item?.SR_CD,
              // CARD_NO: item?.M_CARD_NO,
            };
          });
        }
        myRef.current?.setGridData(newData);
      },
      onError() {
        setIsData((old) => ({
          ...old,
          closeAlert: true,
        }));
      },
    }
  );

  const atmConfirmation: any = useMutation("confirmData", confirmData, {
    onSuccess(data, variables) {
      CloseMessageBox();

      if (data?.[0]?.STATUS === "999") {
        MessageBox({
          messageTitle: "InvalidConfirmation",
          message: data?.message || data?.[0]?.MESSAGE,
          icon: "ERROR",
        });
      } else {
        //  after successfull update confirmed flag
        const updateConfirmation = (data) => {
          const updatedData = data.map((old) => {
            if (old?.TRAN_CD === variables?.TRAN_CD) {
              return { ...old, CONFIRMED: variables?._isConfrimed ? "Y" : "R" };
            }
            return old;
          });

          return updatedData;
        };
        setFilteredData(updateConfirmation(filteredData));
        setRetrieveData(updateConfirmation(retrieveData));

        enqueueSnackbar(
          t(
            variables?._isConfrimed ? "DataConfirmMessage" : "DataRejectMessage"
          ),
          { variant: "success" }
        );
      }
    },
    onError() {
      setIsData((old) => ({
        ...old,
        closeAlert: true,
      }));
    },
  });

  const confirmedData = async ({ flag }) => {
    let buttonName = await MessageBox({
      messageTitle: "confirmation",
      message: "AreYouSureToProceed",
      buttonNames: ["Yes", "No"],
      loadingBtnName: ["Yes"],
      icon: "CONFIRM",
    });
    if (buttonName === "Yes") {
      atmConfirmation.mutate({
        _isConfrimed: flag === "cfm" ? true : flag === "rj" ? false : "",
        ENTERED_BRANCH_CD: retrieveData?.[currentIndex]?.ENTERED_BRANCH_CD,
        ENTERED_COMP_CD: retrieveData?.[currentIndex]?.ENTERED_COMP_CD,
        TRAN_CD: retrieveData?.[currentIndex]?.TRAN_CD,
      });
    }
  };

  const validateInsert: any = useMutation(
    "validateInsertData",
    validateInsertData,
    {
      onError() {
        setIsData((old) => ({ ...old, closeAlert: true }));
      },
    }
  );

  const crudAtmData: any = useMutation("crudData", crudData, {
    onSuccess(data, variables) {
      if (variables?._isNewRow) {
        setIsData((old) => ({ ...old, isVisible: false }));
        myRef?.current?.handleFormReset({ preventDefault: () => {} });
        enqueueSnackbar(t("RecordInsertedMsg"), { variant: "success" });
      } else if (variables?.DETAILS_DATA?.isNewRow?.length) {
        enqueueSnackbar(t("RecordInsertedMsg"), { variant: "success" });
      } else if (
        variables?._isUpdateRow ||
        variables?.DETAILS_DATA?.isUpdatedRow?.length
      ) {
        enqueueSnackbar(t("RecordUpdatedMsg"), { variant: "success" });
      }
      CloseMessageBox();
    },
    onError(error) {
      CloseMessageBox();
      setIsData((old) => ({ ...old, closeAlert: true }));
    },
  });

  const changeIndex = (direction) => {
    setCurrentIndex((prevIndex) => {
      if (direction === "next") {
        return prevIndex === retrieveData?.length - 1 ? 0 : prevIndex + 1;
      } else {
        return prevIndex === 0 ? retrieveData?.length - 1 : prevIndex - 1;
      }
    });
  };

  const onSubmitHandler = async ({ data, endSubmit }) => {
    let result = myRef?.current?.GetGirdData?.();
    let saveData = () => {
      let gridData =
        result?.length > 0
          ? result.map((item) => {
              return {
                ...item,
                // CARD_NO: item?.CARD_NO.replace(/\s+/g, ""),
                // M_CARD_NO: item?.M_CARD_NO.replace(/\s+/g, ""),
                REQ_DT: item?.REQ_DT
                  ? format(new Date(item?.REQ_DT), "dd/MMM/yyyy")
                  : "",
                ISSUE_DT: item?.ISSUE_DT
                  ? format(new Date(item?.ISSUE_DT), "dd/MMM/yyyy")
                  : "",
                EXPIRE_DT: item?.EXPIRE_DT
                  ? format(new Date(item?.EXPIRE_DT), "dd/MMM/yyyy")
                  : "",
                DEACTIVE_DT: item?.DEACTIVE_DT
                  ? format(new Date(item?.DEACTIVE_DT), "dd/MMM/yyyy")
                  : "",
              };
            })
          : [];

      let apiReq = {
        CUSTOMER_ID: data?.CUSTOMER_ID,
        ACCT_NM: data?.ACCT_NM,
        ACCT_CD: data?.ACCT_CD,
        SB_ACCT_CD: data?.SB_ACCT_CD ?? "",
        CA_ACCT_CD: data?.CA_ACCT_CD ?? "",
        CC_ACCT_CD: data?.CC_ACCT_CD ?? "",
        PARA_601: parameter?.PARA_601,
        PARA_602: parameter?.PARA_602,
        PARA_604: parameter?.PARA_604,
        PARA_100: parameter?.PARA_100,
        PARA_336: parameter?.PARA_336,
        ENTRY_FLAG: retrieveData?.length ? "M" : "F",
        SCREEN_REF: docCD,
        DTL_DATA: gridData,
      };

      let { CARD_PRINT, ...rest } = data?._OLDROWVALUE;

      let insertdata = {
        ...data,
        _isDeleteRow: false,
        _isUpdateRow:
          formMode !== "new" && Object.keys(rest).length ? true : false,
        SMS_ALERT: data?.SMS_ALERT === true ? "Y" : "N",
      };
      validateInsert.mutate(apiReq, {
        onSuccess: async (data) => {
          //@ts-ignore
          endSubmit(true);
          setIsData((old) => ({ ...old, closeAlert: false }));
          if (data?.length) {
            for (let i = 0; i < data?.length; i++) {
              if (data[i]?.O_STATUS !== "0") {
                let btnName = await MessageBox({
                  messageTitle: data[i]?.O_MSG_TITLE
                    ? data[i]?.O_MSG_TITLE
                    : data[i]?.O_STATUS === "999"
                    ? "ValidationFailed"
                    : data[i]?.O_STATUS === "99"
                    ? "confirmation"
                    : "ALert",
                  message: data[i]?.O_MESSAGE,
                  buttonNames:
                    data[i]?.O_STATUS === "99" ? ["Yes", "No"] : ["Ok"],
                  icon:
                    data[i]?.O_STATUS === "999"
                      ? "ERROR"
                      : data[i]?.O_STATUS === "99"
                      ? "CONFIRM"
                      : "WARNING",
                });
                if (btnName === "No" || data[i]?.O_STATUS === "999") {
                  return;
                }
              } else {
                let btnName = await MessageBox({
                  messageTitle: "confirmation",
                  message: "AreYouSureToProcced",
                  buttonNames: ["Yes", "No"],
                  icon: "CONFIRM",
                  defFocusBtnName: "Yes",
                  loadingBtnName: ["Yes"],
                });

                if (btnName === "Yes") {
                  crudAtmData.mutate(insertdata);
                }
              }
            }
          }
        },
        onError() {
          //@ts-ignore
          endSubmit(true);
        },
      });
    };
    if (parameter?.PARA_602 === "N") {
      if (
        (data?.SB_BRANCH_CD && data?.SB_ACCT_TYPE && data?.SB_ACCT_CD) ||
        (data?.CA_BRANCH_CD && data?.CA_ACCT_TYPE && data?.CA_ACCT_CD) ||
        (data?.CC_BRANCH_CD && data?.CC_ACCT_TYPE && data?.CC_ACCT_CD)
      ) {
        if (!result?.length) {
          MessageBox({
            messageTitle: "Alert",
            message: "Atleastonerowmustbeindetail",
            icon: "WARNING",
            defFocusBtnName: "Ok",
          });
        } else {
          saveData();
        }
      } else {
        MessageBox({
          messageTitle: "ValidationFailed",
          message: "PleaseenteratleastonAccountNumber",
          icon: "ERROR",
          defFocusBtnName: "Ok",
        });
        //@ts-ignore
        endSubmit(true);
      }
    } else {
      if (!result?.length) {
        MessageBox({
          messageTitle: "Alert",
          message: "Atleastonerowmustbeindetail",
          icon: "WARNING",
          defFocusBtnName: "Ok",
        });
      } else {
        saveData();
      }
    }
  };

  // common function for filter data on click view-all and refresh button
  const filterData = (flag) => {
    if (flag === "REFRESH") {
      let refreshData = retrieveData?.filter(
        (item) => item.CONFIRMED !== "Y" && item.CONFIRMED !== "R"
      );
      setCurrentIndex(0);
      setRetrieveData(refreshData);
    } else if (flag === "VIEW_ALL") {
      setRetrieveData(filteredData);
    }
  };

  useEffect(() => {
    if (retrieveData?.length) {
      setIsData((old) => ({ ...old, cardData: retrieveData?.[currentIndex] }));
      cardDetails.mutate();
    }
  }, [retrieveData, currentIndex]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "s" && event.ctrlKey) {
        event.preventDefault();
        // formRef?.current?.handleSubmit({ preventDefault: () => {} }, "Save");
      } else if (event.key === "r" && event.ctrlKey) {
        event.preventDefault();
        navigate("retrieve-form");
      } else if (event.key === "Escape") {
        setIsData((old) => ({ ...old, isOpenCard: false }));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const deleteData: any = async ({ FLAG, DATA }) => {
    const formdata = await myRef?.current?.getFieldData();
    const gridData = await myRef?.current?.GetGirdData();

    let buttonName = await MessageBox({
      messageTitle: "confirmation",
      message: "AreYouSureToProceed",
      buttonNames: ["Yes", "No"],
      loadingBtnName: ["Yes"],
      icon: "CONFIRM",
    });

    if (buttonName === "Yes") {
      let apiReq = {
        _isNewRow: false,
        _isDeleteRow: FLAG === "R" ? false : true,
        _isUpdateRow: false,
        ENTERED_BRANCH_CD: formdata?.ENTERED_BRANCH_CD,
        ENTERED_COMP_CD: formdata?.ENTERED_COMP_CD,
        TRAN_CD: formdata?.TRAN_CD,
        CONFIRMED: formdata?.CONFIRMED,
        DETAILS_DATA: {
          isNewRow: [],
          isDeleteRow:
            FLAG === "R" ? [DATA] : FLAG === "M" ? gridData ?? [] : [],
          isUpdatedRow: [],
        },
      };

      crudAtmData.mutate(apiReq, {
        onSuccess(data, variables) {
          CloseMessageBox();

          if (variables?._isDeleteRow) {
            // setIsData((old) => ({ ...old, isVisible: false }));

            setFormMode("new");
            setRetrieveData(null);
            myRef.current?.setGridData();
            setIsData(() => {});
            // setIsData((old) => ({
            //   ...old,
            //   closeAlert: false,
            //   cardData: {},
            // }));
            myRef?.current?.handleFormReset({ preventDefault: () => {} });
            enqueueSnackbar(t("RecordRemovedMsg"), { variant: "success" });
          } else if (variables?.DETAILS_DATA?.isDeleteRow?.length) {
            enqueueSnackbar(t("RecordRemovedMsg"), { variant: "success" });
            cardDetails.mutate({
              A_COMP_CD: authState?.companyID,
              A_BRANCH_CD: authState?.user?.branchCode,
              A_TRAN_CD: retrieveData?.[currentIndex]?.TRAN_CD,
            });
          }
        },
      });
    }
  };
  return (
    <>
      {validateInsert?.isLoading ? (
        <LinearProgress color="secondary" />
      ) : (validateInsert?.isError && isData.closeAlert) ||
        (crudAtmData?.isError && isData.closeAlert) ||
        (atmConfirmation?.isError && atmConfirmation.closeAlert) ||
        (cardDetails?.isError && isData.closeAlert) ? (
        <AppBar position="relative" color="primary">
          <Alert
            severity="error"
            errorMsg={
              validateInsert?.error?.error_msg ??
              crudAtmData?.error?.error_msg ??
              atmConfirmation?.error?.error_msg ??
              cardDetails?.error?.error_msg ??
              "Unknow Error"
            }
            errorDetail={
              validateInsert?.error?.error_detail ??
              crudAtmData?.error?.error_detail ??
              atmConfirmation?.error?.error_detail ??
              cardDetails?.error?.error_detail ??
              ""
            }
            color="error"
          />
        </AppBar>
      ) : (
        <LinearProgressBarSpacer />
      )}
      <MasterDetailsForm
        key={
          "atm-form" + formMode + retrieveData + currentIndex + isData?.uniqueNo
        }
        subHeaderLabel={utilFunction.getDynamicLabel(
          useLocation().pathname,
          authState?.menulistdata,
          true
        )}
        subHeaderLabelStyle={{ paddingLeft: "0px" }}
        metaData={masterCommonFormMetaData as MasterDetailsMetaData}
        isNewRow={formMode === "new" ? true : false}
        initialData={{
          _isNewRow: formMode === "new" ? true : false,
          ...retrieveData?.[currentIndex],
          TOTAL:
            retrieveData?.length &&
            `\u00A0 ${currentIndex + 1} of ${retrieveData?.length}`,
          DETAILS_DATA: formMode === "new" ? [] : myRef.current?.GetGirdData(),
        }}
        formState={{
          MessageBox: MessageBox,
          parameter: {
            ...parameter,
            FORM_MODE: formMode,
            USER_ROLE: authState?.role,
          },
          docCD: docCD,
          acctDtlReqPara: {
            ACCT_CD: {
              ACCT_TYPE: "ACCT_TYPE",
              BRANCH_CD: "BRANCH_CD",
              SCREEN_REF: docCD ?? "",
            },
            SB_ACCT_CD: {
              ACCT_TYPE: "SB_ACCT_TYPE",
              BRANCH_CD: "SB_BRANCH_CD",
              SCREEN_REF: docCD ?? "",
            },
            CA_ACCT_CD: {
              ACCT_TYPE: "CA_ACCT_TYPE",
              BRANCH_CD: "CA_BRANCH_CD",
              SCREEN_REF: docCD ?? "",
            },
            CC_ACCT_CD: {
              ACCT_TYPE: "CC_ACCT_TYPE",
              BRANCH_CD: "CC_BRANCH_CD",
              SCREEN_REF: docCD ?? "",
            },
          },
        }}
        displayMode={FLAG === "C" ? "view" : formMode}
        isDetailRowRequire={false}
        onSubmitData={onSubmitHandler}
        setDataOnFieldChange={(action, payload) => {
          if (action === "RES_DATA") {
            setIsData((old) => ({
              ...old,
              cardData: payload?.validateData,
              isVisible: payload?.isVisible,
            }));
          }
          if (action === "IS_VISIBLE") {
            setIsData((old) => ({
              ...old,
              isVisible: payload?.isVisible,
            }));
          }
        }}
        onFormButtonClickHandel={() => {
          if (!isData?.isOpenCard) {
            setIsData((old) => ({ ...old, isOpenCard: true }));
          }
        }}
        actions={FLAG === "C" ? [] : actions}
        handelActionEvent={(data) => {
          if (data?.name === "card-details" && formMode !== "view") {
            navigate(data?.name, {
              state: {
                rows: data?.rows,
                retrieveData: retrieveData?.[currentIndex],
              },
            });
          } else if (data?.name === "delete-details") {
            if (
              data?.rows?.[0]?.data?.TRAN_CD &&
              !data?.rows?.[0]?.data?.ID_NO
            ) {
              deleteData({ FLAG: "R", DATA: data?.rows?.[0]?.data });
            } else {
              myRef.current?.setGridData((old) => {
                let deleteData = old?.filter(
                  (item) => item !== data?.rows?.[0]?.data
                );
                return deleteData;
              });
            }
          }
        }}
        // onClickActionEvent={(index, id, data) => {
        // if (data?.TRAN_CD && !data?.ID_NO) {
        //   deleteData({ FLAG: "R", DATA: data });
        // } else {
        //   myRef.current?.setGridData((old) => {
        //     let deleteData = old?.filter((item) => item !== data);
        //     return [deleteData];
        //   });
        // }
        // }}
        isLoading={cardDetails?.isLoading || cardDetails?.isFetching}
        formStyle={{}}
        headerToolbarStyle={{
          minHeight: "40px !important",
        }}
        ref={myRef}
      >
        {({ isSubmitting, handleSubmit }) => {
          return (
            <>
              <GradientButton
                sx={{
                  display:
                    formMode === "view" && retrieveData?.length > 0
                      ? "inline-flex"
                      : "none",
                }}
                startIcon={<ArrowBackIosNewIcon />}
                disabled={
                  1 === currentIndex + 1 ||
                  cardDetails?.isLoading ||
                  cardDetails?.isFetching ||
                  validateInsert?.isLoading
                }
                onClick={() => changeIndex("previous")}
                color={"primary"}
              >
                {t("Prev")}
              </GradientButton>
              <GradientButton
                sx={{
                  display:
                    formMode === "view" && retrieveData?.length > 0
                      ? "inline-flex"
                      : "none",
                }}
                endIcon={<ArrowForwardIosIcon />}
                disabled={
                  currentIndex + 1 === retrieveData?.length ||
                  cardDetails?.isLoading ||
                  cardDetails?.isFetching ||
                  validateInsert?.isLoading
                }
                onClick={() => changeIndex("next")}
                color={"primary"}
              >
                {t("Next")}
              </GradientButton>

              <GradientButton
                sx={{
                  display:
                    FLAG === "C" && retrieveData?.length > 0
                      ? "inline-flex"
                      : "none",
                }}
                disabled={validateInsert?.isLoading}
                color="primary"
                onClick={() => confirmedData({ flag: "cfm" })}
              >
                {t("Confirm")}
              </GradientButton>
              <GradientButton
                sx={{
                  display:
                    FLAG === "C" && retrieveData?.length > 0
                      ? "inline-flex"
                      : "none",
                }}
                disabled={validateInsert?.isLoading}
                color="primary"
                onClick={() => confirmedData({ flag: "rj" })}
              >
                {t("Reject")}
              </GradientButton>
              <GradientButton
                sx={{
                  display:
                    FLAG !== "C" && retrieveData?.length > 0
                      ? "inline-flex"
                      : "none",
                }}
                onClick={() =>
                  setFormMode(formMode === "edit" ? "view" : "edit")
                }
                disabled={validateInsert?.isLoading}
                color={"primary"}
              >
                {formMode === "edit" ? t("View") : t("Edit")}
              </GradientButton>
              <GradientButton
                sx={{
                  display:
                    FLAG !== "C" && retrieveData?.length > 0
                      ? "inline-flex"
                      : "none",
                }}
                onClick={() => {
                  setFormMode("new");
                  setRetrieveData(null);
                  myRef.current?.setGridData();
                  setIsData((old) => ({
                    ...old,
                    closeAlert: false,
                    cardData: {},
                  }));
                }}
                disabled={validateInsert?.isLoading}
                color={"primary"}
              >
                {t("New")}
              </GradientButton>
              <GradientButton
                sx={{
                  display:
                    FLAG === "C" && retrieveData?.length > 0
                      ? "inline-flex"
                      : "none",
                }}
                disabled={validateInsert?.isLoading}
                onClick={() =>
                  navigate("view-changes", {
                    state: {
                      COMP_CD: retrieveData?.[currentIndex]?.ENTERED_COMP_CD,
                      BRANCH_CD:
                        retrieveData?.[currentIndex]?.ENTERED_BRANCH_CD,
                      TRAN_CD: retrieveData?.[currentIndex]?.TRAN_CD,
                      DOC_CD: docCD,
                    },
                  })
                }
                color={"primary"}
              >
                {t("ViewChanges")}
              </GradientButton>
              <GradientButton
                sx={{
                  display:
                    FLAG === "C" && retrieveData?.length > 0
                      ? "inline-flex"
                      : "none",
                }}
                onClick={() => filterData("VIEW_ALL")}
                disabled={validateInsert?.isLoading}
                color="primary"
              >
                {t("View All")}
              </GradientButton>
              <GradientButton
                sx={{
                  display:
                    FLAG === "C" && retrieveData?.length > 0
                      ? "inline-flex"
                      : "none",
                }}
                onClick={() => filterData("REFRESH")}
                disabled={validateInsert?.isLoading}
                color="primary"
              >
                {t("Refresh")}
              </GradientButton>

              <GradientButton
                sx={{
                  display:
                    (formMode === "new" &&
                      parameter?.PARA_602 == "Y" &&
                      isData?.isVisible) ||
                    retrieveData?.length
                      ? "inline-flex"
                      : "none",
                }}
                onClick={() => navigate("joint-details")}
                disabled={validateInsert?.isLoading}
                color={"primary"}
              >
                {t("JointDetails")}
              </GradientButton>
              <GradientButton
                sx={{
                  display:
                    (formMode === "new" &&
                      parameter?.PARA_602 == "Y" &&
                      isData?.isVisible) ||
                    retrieveData?.length
                      ? "inline-flex"
                      : "none",
                }}
                color="primary"
                disabled={validateInsert?.isLoading}
                onClick={() => navigate("photo-sign")}
              >
                {t("PhotoSign")}
              </GradientButton>

              <GradientButton
                sx={{
                  display:
                    FLAG !== "C" && retrieveData?.length > 0
                      ? "inline-flex"
                      : "none",
                }}
                onClick={() => deleteData({ FLAG: "M" })}
                disabled={validateInsert?.isLoading}
                color={"primary"}
              >
                {t("Delete")}
              </GradientButton>
              <GradientButton
                onClick={() =>
                  navigate(FLAG === "C" ? "retrieve-cfm-form" : "retrieve-form")
                }
                disabled={validateInsert?.isLoading}
                color={"primary"}
              >
                {t("Retrieve")}
              </GradientButton>
              <GradientButton
                sx={{
                  display: FLAG !== "C" ? "inline-flex" : "none",
                }}
                color={"primary"}
                onClick={(event) => handleSubmit(event, "BUTTON_CLICK")}
                disabled={
                  validateInsert?.isLoading ||
                  (formMode === "new" && !isData?.isVisible)
                    ? true
                    : false || formMode === "view"
                }
              >
                {t("Save")}
              </GradientButton>
            </>
          );
        }}
      </MasterDetailsForm>
      <Routes>
        <Route
          path="card-details/*"
          element={
            <CardDetails
              navigate={navigate}
              parameter={parameter}
              myRef={myRef}
              docCD={docCD}
              isData={isData}
              formMode={formMode}
            />
          }
        />
        <Route
          path="retrieve-form/*"
          element={
            <RetrieveData
              navigate={navigate}
              parameter={parameter}
              setFormMode={setFormMode}
              setRetrieveData={setRetrieveData}
              setIsData={setIsData}
              myRef={myRef}
              docCD={docCD}
            />
          }
        />
        <Route
          path="photo-sign/*"
          element={
            <PhotoSignWithHistory
              data={isData?.cardData ?? {}}
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
                  maxWidth: "1215px",
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
                    COMP_CD: isData?.cardData?.COMP_CD,
                    BRANCH_CD: isData?.cardData?.BRANCH_CD,
                    ACCT_TYPE: isData?.cardData?.ACCT_TYPE,
                    ACCT_CD: utilFunction.getPadAccountNumber(
                      isData?.cardData?.ACCT_CD,
                      ""
                    ),
                    BTN_FLAG: "Y",
                    custHeader: true,
                  }}
                  closeDialog={() => navigate(-1)}
                />
              </div>
            </Dialog>
          }
        />
        <Route
          path="retrieve-cfm-form/*"
          element={
            <RetrieveCfmData
              onClose={() => navigate(".")}
              navigate={navigate}
              setRetrieveData={setRetrieveData}
              setFilteredData={setFilteredData}
              setFormMode={setFormMode}
            />
          }
        />
        <Route
          path="view-changes/*"
          element={<ViewChanges navigate={navigate} />}
        />
      </Routes>
      {isData?.isOpenCard && (
        <CardPrinting cardData={isData.cardData} setIsData={setIsData} />
      )}
    </>
  );
};

export default CommonForm;
