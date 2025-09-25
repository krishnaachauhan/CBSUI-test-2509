import {
  ActionTypes,
  Alert,
  FormWrapper,
  GradientButton,
  GridWrapper,
  MetaDataType,
  SubmitFnType,
  usePopupContext,
} from "@acuteinfo/common-base";
import { CircularProgress, Dialog } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { AuthContext } from "pages_audit/auth";
import { useCallback, useContext, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { Fragment } from "react/jsx-runtime";
import {
  accountFindmetaData,
  FdInterestPaymentGridMetaData,
} from "../FDInterestPayment/FdInterestPaymentGridMetaData";
import * as API from "./api";
import { RecInterestPaymentDetail } from "./RecInterestPaymentViewDetails";
import { getdocCD } from "components/utilFunction/function";
import { useCommonFunctions } from "../fix-deposit/function";

const actions: ActionTypes[] = [
  {
    actionName: "retrieve",
    actionLabel: "Retrieve",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "view-details",
    actionLabel: "ViewDetails",
    multiple: false,
    rowDoubleClick: true,
  },
  {
    actionName: "delete",
    actionLabel: "Delete",
    multiple: false,
    rowDoubleClick: false,
  },
];

export const RecInterestPaymentForm = () => {
  const [isFormOpen, setFormOpen] = useState(true);
  const [isRecDetailOpen, setRecDetailOpen] = useState(false);
  const [rowsData, setRowsData] = useState<any>([]);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const [recPaymentInstructions, setRecPaymentInstructions] = useState<any>([]);
  const { t } = useTranslation();
  const parameterRef = useRef<any>();
  const RecDetailsRef = useRef<any>();
  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const navigate = useNavigate();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const { focusRef, setFocus } = useCommonFunctions();

  const fetchRecPaymentInstructions: any = useMutation(
    "getRecPaymentInstrudtl",
    API.fetchRecPaymentDetails,
    {
      onSuccess: async (data, variables) => {
        if (data.length === 0) {
          let buttonName = await MessageBox({
            messageTitle: "ValidationFailed",
            message: "NounPaidFDmsg",
            buttonNames: ["Ok"],
            icon: "ERROR",
          });
        } else {
          const updatedData = data?.map((item) => ({
            ...item,
            TRAN_BAL: variables?.data?.TRAN_BAL,
            FULL_ACCOUNT:
              (item?.BRANCH_CD?.trim() ?? "") +
              "-" +
              (item?.ACCT_TYPE?.trim() ?? "") +
              "-" +
              (item?.ACCT_CD?.trim() ?? ""),
            CR_COMP_CD: authState?.companyID ?? "",
            CREDIT_DTL:
              item?.PAYMENT_MODE === "BANKACCT"
                ? (item?.CR_BRANCH_CD?.trim() ?? "") +
                  "-" +
                  (item?.CR_ACCT_TYPE?.trim() ?? "") +
                  "-" +
                  (item?.CR_ACCT_CD?.trim() ?? "")
                : item?.PAYMENT_MODE === "NEFT"
                ? "NEFT :" +
                  " " +
                  (item?.TO_IFSCCODE.trim() ?? "") +
                  "-" +
                  (item?.TO_ACCT_TYPE.trim() ?? "")
                : "-",
            _rowColor: Boolean(item?.PAYMENT_MODE)
              ? "rgb(130, 224, 170)"
              : undefined,
          }));

          setRecPaymentInstructions(updatedData);
          RecDetailsRef.current = updatedData;
          //@ts-ignore
          setFormOpen(false);
          CloseMessageBox();
        }
      },
      onError: async (error: any) => {
        CloseMessageBox();
      },
    }
  );
  const updateRecInterestPaymentEntry = useMutation(
    API.updateRecInterestPaymentEntry,
    {
      onSuccess: async (data, variables) => {
        if (variables.data._isDeleteRow) {
          enqueueSnackbar(t("RecordRemovedMsg"), {
            variant: "success",
          });
        }
        setFormOpen(true);
        setRecPaymentInstructions([]);
        RecDetailsRef.current = [];
        CloseMessageBox();
      },
      onError: async (error: any) => {
        CloseMessageBox();
      },
    }
  );

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData: any,
    endSubmit,
    setFieldError
  ) => {
    fetchRecPaymentInstructions.mutate(
      { ...parameterRef?.current, data },
      {
        onSettled: () => {
          if (!fetchRecPaymentInstructions?.isLoading) {
            endSubmit(true);
          }
        },
      }
    );
  };
  const handleButtonDisable = (disable) => {
    setButtonDisabled(disable);
  };
  const handleCloseForm = () => {
    setFormOpen(false);
  };
  const handleRecDetailClose = () => {
    setRecDetailOpen(false);
  };
  const handleReset = () => {
    setRecPaymentInstructions([]);
    RecDetailsRef.current = [];
    setFormOpen(true);
  };

  const setCurrentAction = useCallback(
    async (data) => {
      if (data?.name === "delete") {
        if (data?.rows?.[0]?.data?.PAY_MODE_DISPLAY !== "Instruction Pending") {
          const btnName = await MessageBox({
            messageTitle: "Confirmation",
            message: "DoYouWantDeleteRow",
            buttonNames: ["Yes", "No"],
            loadingBtnName: ["Yes"],
            icon: "CONFIRM",
          });
          if (btnName === "Yes") {
            updateRecInterestPaymentEntry.mutate({
              data: {
                COMP_CD: data?.rows?.[0]?.data?.COMP_CD ?? "",
                CR_COMP_CD: data?.rows?.[0]?.data?.COMP_CD ?? "",
                BRANCH_CD: data?.rows?.[0]?.data?.BRANCH_CD ?? "",
                FD_NO: data?.rows?.[0]?.data?.FD_NO ?? "",
                ACCT_TYPE: data?.rows?.[0]?.data?.ACCT_TYPE ?? "",
                ACCT_CD: data?.rows?.[0]?.data?.ACCT_CD ?? "",
                _isDeleteRow: true,
              },
            });
          }
        }
      } else if (data?.name === "retrieve") {
        if (
          Array.isArray(recPaymentInstructions) &&
          RecDetailsRef?.current?.length > 0
        ) {
          let btnName = await MessageBox({
            messageTitle: "Confirmation",
            message: `RetrieveConfirmation`,
            buttonNames: ["Yes", "No"],
            icon: "CONFIRM",
          });
          if (btnName === "Yes") {
            setFormOpen(true);
            setRecPaymentInstructions([]);
            RecDetailsRef.current = [];
          }
        } else {
          setFormOpen(true);
          setRecPaymentInstructions([]);
          RecDetailsRef.current = [];
        }
      } else if (data?.name === "view-details") {
        setRowsData(data?.rows);
        setRecDetailOpen(true);
      } else {
        navigate(data?.name, {
          state: data?.rows,
        });
      }
    },
    [navigate]
  );

  return (
    <Fragment>
      <Dialog
        open={isFormOpen}
        PaperProps={{
          style: {
            width: "100%",
            overflow: "auto",
          },
        }}
        maxWidth="sm"
      >
        {fetchRecPaymentInstructions?.error && (
          <Alert
            severity="error"
            errorMsg={
              fetchRecPaymentInstructions?.error?.error_msg ||
              t("Somethingwenttowrong")
            }
            errorDetail={fetchRecPaymentInstructions?.error?.error_detail || ""}
            color="error"
          />
        )}
        <FormWrapper
          key={"recAccountFindmetaData"}
          metaData={accountFindmetaData as MetaDataType}
          formStyle={{
            background: "white",
          }}
          controlsAtBottom={true}
          onSubmitHandler={onSubmitHandler}
          setDataOnFieldChange={(action, payload) => {
            if (action === "fdPaymentInstrudtl") {
              parameterRef.current = { ...payload, A_PARM: "REC" };
            }
          }}
          formState={{
            MessageBox: MessageBox,
            handleButtonDisable: handleButtonDisable,
            docCD: docCD,
            acctDtlReqPara: {
              ACCT_CD: {
                ACCT_TYPE: "ACCT_TYPE",
                BRANCH_CD: "BRANCH_CD",
                SCREEN_REF: docCD ?? "",
              },
            },
            setFocus: setFocus,
          }}
        >
          {({ isSubmitting, handleSubmit }) => (
            <>
              <GradientButton
                onClick={(event) => {
                  handleSubmit(event, "Save");
                }}
                disabled={
                  isSubmitting ||
                  fetchRecPaymentInstructions?.isLoading ||
                  isButtonDisabled
                }
                endIcon={
                  isSubmitting || fetchRecPaymentInstructions?.isLoading ? (
                    <CircularProgress size={20} />
                  ) : null
                }
                color={"primary"}
                ref={focusRef}
              >
                {t("Submit")}
              </GradientButton>

              <GradientButton onClick={handleCloseForm} color={"primary"}>
                {t("Cancel")}
              </GradientButton>
            </>
          )}
        </FormWrapper>
      </Dialog>

      <GridWrapper
        key={
          "RecinterestPaymentGrid" + isFormOpen + recPaymentInstructions?.length
        }
        finalMetaData={FdInterestPaymentGridMetaData}
        data={recPaymentInstructions ?? []}
        setData={() => null}
        enableExport={true}
        actions={actions}
        setAction={setCurrentAction}
      />

      <Dialog
        open={isRecDetailOpen}
        onKeyUp={(event) => {
          if (event.key === "Escape") handleRecDetailClose();
        }}
        PaperProps={{
          style: {
            width: "100%",
            overflow: "auto",
          },
        }}
        maxWidth="lg"
      >
        <RecInterestPaymentDetail
          closeDialog={handleRecDetailClose}
          dataReset={handleReset}
          gridData={recPaymentInstructions}
          rows={rowsData}
          fdDetails={recPaymentInstructions}
          defaultView={
            Boolean(rowsData?.[0]?.data?.PAYMENT_MODE) ? "edit" : "new"
          }
        />
      </Dialog>
    </Fragment>
  );
};
