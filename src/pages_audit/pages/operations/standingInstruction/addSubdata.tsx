import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { standingInsructionViewGridMetaData } from "./metaData/gridMetaData";
import { AuthContext } from "pages_audit/auth";
import * as API from "./api";
import {
  CircularProgress,
  Dialog,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { AddSubDataMetaData, EditSubDataMetaData } from "./metaData/metaData";
import { useMutation, useQuery } from "react-query";
import SiExecuteDetailView from "./siExecuteDetailView";
import { enqueueSnackbar } from "notistack";
import { format } from "date-fns";
import { DeleteDialog } from "./deleteDialog";
import PhotoSignWithHistory from "components/common/custom/photoSignWithHistory/photoSignWithHistory";
import Draggable from "react-draggable";
import { t } from "i18next";
import {
  ActionTypes,
  GridWrapper,
  GradientButton,
  extractMetaData,
  FormWrapper,
  MetaDataType,
  queryClient,
  GridMetaDataType,
  SubmitFnType,
  usePopupContext,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
const actions: ActionTypes[] = [
  {
    actionName: "view-details",
    actionLabel: "ViewDetails",
    multiple: false,
    rowDoubleClick: true,
  },
];

const AddSubData = ({ open, onClose, mainRefetch }) => {
  const authController = useContext(AuthContext);
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { state: rows } = useLocation();
  const [lineId, setLineId] = useState(null);
  const [srCd, setSrCd] = useState(null);
  const shrtctKeysRef = useRef<any>(null);
  const tranCd = rows?.[0]?.data?.TRAN_CD;
  const [opens, setOpens] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [deleteopen, setDeleteOpen] = useState(false);
  const [formMode, setFormMode] = useState("view");
  const isErrorFuncRef = useRef<any>(null);
  const [currentRowData, setCurrentRowData] = useState(null);
  const [rowData, setRowData] = useState<any>(null);
  const [isPhotoSign, setIsPhotoSign] = useState(false);
  const [Acctdata, SetAcctData] = useState({});
  const navigate = useNavigate();
  const isUpdateDataRef = useRef<any>(null);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const setCurrentAction = useCallback(
    async (data) => {
      isUpdateDataRef.current = data?.rows?.[0];
      if (data?.name === "view-details") {
        if (rows && rows.length > 0) {
          setOpenEdit(true);
          setRowData(isUpdateDataRef.current.data);
        }
      }
    },
    [navigate, MessageBox]
  );

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch: siRefetch,
  } = useQuery(
    [
      "getStandingInstructionInnerData",
      authController?.authState?.companyID,
      authController?.authState?.user?.branchCode,
      tranCd,
    ],
    () => {
      return API.getStandingInstructionInnerData({
        companyID: authController?.authState?.companyID,
        branchCode: authController?.authState?.user?.branchCode,
        Tran_cd: tranCd,
      });
    }
  );
  const validDataMutation = useMutation(API.validateStandingInstructionData, {
    onSuccess: async (data) => {
      if (data?.[0]?.O_STATUS === "0") {
        const btnName = await MessageBox({
          message: t("SaveData"),
          messageTitle: t("Confirmation"),
          buttonNames: ["Yes", "No"],
          icon: "CONFIRM",
          loadingBtnName: ["Yes"],
        });
        if (btnName === "Yes") {
          mutation.mutate({
            ...isErrorFuncRef.current?.data,
          });
        }
      } else if (data?.[0]?.O_STATUS === "999") {
        const messages = data.map((item) => item.O_MESSAGE).join("\n");
        MessageBox({
          messageTitle: t("ValidationFailed"),
          message: messages,
          icon: "ERROR",
        });
      }
    },
    onError: (error: any) => {
      MessageBox({
        messageTitle: t("ValidationAlert"),
        message: error?.error_detail,
      });
    },
  });

  const mutation = useMutation(API.addStandingInstructionTemplate, {
    onError: (error: any) => {
      let errorMsg = t("Unknownerroroccured");
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      CloseMessageBox();
    },
    onSuccess: (data) => {
      enqueueSnackbar(t("insertSuccessfully"), {
        variant: "success",
      });
      siRefetch();
      CloseMessageBox();
      onClose();
      mainRefetch();
    },
  });
  const updateMutation = useMutation(API.addStandingInstructionTemplate, {
    onError: (error: any) => {
      let errorMsg = t("Unknownerroroccured");
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      CloseMessageBox();
    },
    onSuccess: (data) => {
      enqueueSnackbar(t("insertSuccessfully"), {
        variant: "success",
      });
      siRefetch();
      CloseMessageBox();
      onClose();
      setOpenEdit(false);
      mainRefetch();
    },
  });
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getStandingInstructionInnerData"]);
    };
  }, []);

  const activeSICount = data?.filter((item) => item.DOC_STATUS === true).length;

  const saveData: SubmitFnType = async (
    data: any,
    displayData: any,
    endSubmit,
    setFieldError
  ) => {
    endSubmit(true);

    isErrorFuncRef.current = {
      data: {
        _isNewRow: false,
        ENT_COMP_CD: rowData?.ENT_COMP_CD,
        ENT_BRANCH_CD: rowData?.ENT_BRANCH_CD,
        TRAN_CD: rowData?.TRAN_CD,
        SR_CD: rowData?.SR_CD,
        LINE_ID: rowData?.LINE_ID,
        DOC_STATUS:
          typeof data?.DOC_STATUS === "boolean"
            ? data?.DOC_STATUS
              ? "Y"
              : "N"
            : data?.DOC_STATUS,
      },
    };
    const btnName = await MessageBox({
      message: t("SaveData"),
      messageTitle: t("Confirmation"),
      buttonNames: ["Yes", "No"],
      icon: "CONFIRM",
      loadingBtnName: ["Yes"],
    });

    if (btnName === "Yes") {
      updateMutation.mutate({
        ...isErrorFuncRef.current?.data,
      });
    }
  };

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData: any,
    endSubmit,
    setFieldError
  ) => {
    endSubmit(true);

    const newData = {
      isNewRow: Array.isArray(data) ? data : [data],
    };

    isErrorFuncRef.current = {
      data: {
        COMP_CD: authState?.companyID,
        BRANCH_CD: authState?.user?.branchCode,
        TRAN_CD: tranCd,
        _isNewRow: false,
        SI_SDT: {
          ...newData,
        },
      },

      displayData,
      endSubmit,
      setFieldError,
    };
    validDataMutation.mutate({
      START_DT: format(new Date(data.START_DT), "dd/MMM/yyyy") ?? "",
      EXECUTE_DAY: data.EXECUTE_DAY ?? "",
      SI_AMOUNT: data.SI_AMOUNT ?? "",
      VALID_UPTO: format(new Date(data.VALID_UPTO), "dd/MMM/yyyy") ?? "",
      WORKING_DATE: authState?.workingDate ?? "",
      USERNAME: authState?.user?.id ?? "",
      USERROLE: authState?.role ?? "",
    });
  };

  return (
    <Fragment>
      <Dialog
        open={open}
        PaperProps={{ style: { width: "100%", overflow: "auto" } }}
        maxWidth="lg"
      >
        {/* <div id="draggable-dialog-title"> */}
        <FormWrapper
          key={"standingInstructionForm"}
          metaData={AddSubDataMetaData as MetaDataType}
          onSubmitHandler={onSubmitHandler}
          displayMode={"New"}
          initialValues={rows?.[0]?.data}
          formStyle={{
            background: "white",
          }}
          formState={{
            MessageBox: MessageBox,
            docCd: docCD,
            authState: authState,
            acctDtlReqPara: shrtctKeysRef,
          }}
          setDataOnFieldChange={(action, payload) => {
            if (
              action === "SHORTCUTKEY_REQPARA" ||
              action === "SHORTCUTKEY_REQPARA2"
            ) {
              shrtctKeysRef.current = payload;
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
                  validDataMutation.isLoading ? (
                    <CircularProgress size={20} />
                  ) : null
                }
                color={"primary"}
              >
                Add
              </GradientButton>

              <GradientButton onClick={onClose} color={"primary"}>
                Close
              </GradientButton>
            </>
          )}
        </FormWrapper>
        <GridWrapper
          key={"standingInsructionViewGridMetaData"}
          finalMetaData={standingInsructionViewGridMetaData as GridMetaDataType}
          loading={isLoading || isFetching}
          actions={actions}
          data={data ?? []}
          setAction={setCurrentAction}
          setData={() => null}
          refetchData={() => siRefetch()}
          onClickActionEvent={(index, id, currentData) => {
            if (id === "edit") {
              const { LINE_ID, SR_CD } = currentData;
              setLineId(LINE_ID);
              setSrCd(SR_CD);
              setOpens(true);
            }
            if (id === "delete") {
              setDeleteOpen(true);
              setCurrentRowData(currentData);
            }
            if (id === "credit") {
              const {
                COMP_CD,
                BRANCH_CD,
                CR_ACCT_TYPE,
                CR_ACCT_CD,
                SI_AMOUNT,
                CR_ACCT_NM,
              } = currentData;
              const payload = {
                COMP_CD: COMP_CD,
                BRANCH_CD: BRANCH_CD,
                ACCT_TYPE: CR_ACCT_TYPE,
                ACCT_CD: CR_ACCT_CD,
                AMOUNT: SI_AMOUNT,
                ACCT_NM: CR_ACCT_NM,
              };
              setIsPhotoSign(true);
              SetAcctData(payload);
            }
            if (id === "debit") {
              const {
                COMP_CD,
                BRANCH_CD,
                DR_ACCT_TYPE,
                DR_ACCT_CD,
                SI_AMOUNT,
                DR_ACCT_NM,
              } = currentData;
              const payload = {
                COMP_CD: COMP_CD,
                BRANCH_CD: BRANCH_CD,
                ACCT_TYPE: DR_ACCT_TYPE,
                ACCT_CD: DR_ACCT_CD,
                AMOUNT: SI_AMOUNT,
                ACCT_NM: DR_ACCT_NM,
              };
              setIsPhotoSign(true);
              SetAcctData(payload);
            }
          }}
        />

        <Grid
          item
          xs={12}
          sm={12}
          sx={{
            height: "23px",
            width: "auto",
            float: "right",
            position: "relative",
            top: "-1.37rem",
            right: "20%",
            display: "flex",
            justifyContent: "right",
            gap: "4rem",
            alignItems: "center",
          }}
        >
          <Typography sx={{ fontWeight: "bold" }} variant="subtitle1">
            {t("TotalNoofActiveSI")} : {activeSICount}
          </Typography>
        </Grid>
      </Dialog>
      <>
        {isPhotoSign ? (
          <>
            <div style={{ paddingTop: 10 }}>
              <PhotoSignWithHistory
                data={Acctdata}
                onClose={() => {
                  setIsPhotoSign(false);
                }}
                screenRef={docCD}
              />
            </div>
          </>
        ) : null}
      </>
      <Dialog
        open={openEdit}
        PaperProps={{ style: { width: "100%", overflow: "auto" } }}
        maxWidth="lg"
      >
        <FormWrapper
          key={"modeMasterForm" + formMode}
          displayMode={formMode}
          onSubmitHandler={saveData}
          metaData={
            extractMetaData(EditSubDataMetaData, formMode) as MetaDataType
          }
          initialValues={{
            ...(rowData ?? {}),
          }}
          formState={{
            MessageBox: MessageBox,
            docCd: docCD,
          }}
          formStyle={{
            background: "white",
          }}
        >
          {({ isSubmitting, handleSubmit }) => (
            <>
              {formMode === "edit" ? (
                <>
                  <GradientButton
                    onClick={(event) => {
                      handleSubmit(event, "Save");
                    }}
                    disabled={isSubmitting}
                    endIcon={
                      isSubmitting ? <CircularProgress size={20} /> : null
                    }
                    color={"primary"}
                  >
                    Save
                  </GradientButton>
                  <GradientButton
                    onClick={() => {
                      setFormMode("view");
                    }}
                    color={"primary"}
                  >
                    Cancel
                  </GradientButton>
                </>
              ) : formMode === "add" ? (
                <>
                  <GradientButton
                    onClick={(event) => {
                      handleSubmit(event, "Save");
                    }}
                    disabled={isSubmitting}
                    endIcon={
                      isSubmitting ? <CircularProgress size={20} /> : null
                    }
                    color={"primary"}
                  >
                    Save
                  </GradientButton>
                  <GradientButton onClick={onClose} color={"primary"}>
                    Close
                  </GradientButton>
                </>
              ) : (
                <>
                  <GradientButton
                    onClick={() => {
                      setFormMode("edit");
                    }}
                    color={"primary"}
                  >
                    Edit
                  </GradientButton>
                  <GradientButton
                    onClick={() => {
                      setOpenEdit(false);
                    }}
                    color={"primary"}
                  >
                    Close
                  </GradientButton>
                </>
              )}
            </>
          )}
        </FormWrapper>
      </Dialog>

      <SiExecuteDetailView
        open={opens}
        onClose={() => setOpens(false)}
        lineId={lineId}
        srCd={srCd}
        tran_cd={tranCd}
      />
      <DeleteDialog
        open={deleteopen}
        onClose={() => setDeleteOpen(false)}
        rowData={currentRowData}
        siRefetch={siRefetch}
        mainRefetch={mainRefetch}
      />
    </Fragment>
  );
};

export default AddSubData;
