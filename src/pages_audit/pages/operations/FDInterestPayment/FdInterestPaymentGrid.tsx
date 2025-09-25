import { Box, Chip, CircularProgress, Dialog, Grid } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import { Alert, ClearCacheProvider, Transition } from "@acuteinfo/common-base";
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import {
  FormWrapper,
  MetaDataType,
  SubmitFnType,
  GradientButton,
  ActionTypes,
  usePopupContext,
  GridWrapper,
  queryClient,
} from "@acuteinfo/common-base";
import { useMutation } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import * as API from "./api";
import {
  accountFindmetaData,
  FdInterestPaymentGridMetaData,
  PaidFDGridMetaData,
} from "./FdInterestPaymentGridMetaData";
import { FdInterestPaymentDetail } from "./viewDetails";
import { cloneDeep } from "lodash";
import { enqueueSnackbar } from "notistack";
import { getdocCD } from "components/utilFunction/function";
import { useCommonFunctions } from "../fix-deposit/function";
import { useEnter } from "components/custom/useEnter";
import {
  DialogProvider,
  useDialogContext,
} from "../payslip-issue-entry/DialogContext";
const baseActions: ActionTypes[] = [
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
    multiple: true,
    rowDoubleClick: false,
  },
];
const paidFDactions: ActionTypes[] = [
  {
    actionName: "close",
    actionLabel: "Close",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];

export const FdInterestPaymentGridMain = () => {
  const [isFormOpen, setFormOpen] = useState(true);
  const [isPaidFDOpen, setPaidFDOpen] = useState(false);
  const [isFDDetailOpen, setFDDetailOpen] = useState(false);
  const [paidFDdata, setPaidFDdata] = useState([]);
  const [fdPaymentInstructions, setFdPaymentInstructions] = useState([]);
  const [actions, setActions] = useState(baseActions);
  const [rowsData, setRowsData] = useState<any>([]);
  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const { authState } = useContext(AuthContext);
  const parameterRef = useRef<any>();
  const deletedRowsRef = useRef<any[]>([]);
  const updatedRowsRef = useRef<any[]>([]);
  const gridDataRef = useRef<any[]>([]);
  const { t } = useTranslation();
  const { focusRef, setFocus } = useCommonFunctions();

  const { MessageBox, CloseMessageBox } = usePopupContext();
  const navigate = useNavigate();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const [enterKeyClassName, setEnterKeyClassName] = useState("main");
  const { commonClass } = useDialogContext();

  useEnter(`${enterKeyClassName}`);

  useEffect(() => {
    const newData = commonClass !== null ? commonClass : "main";
    setEnterKeyClassName(newData);
  }, [commonClass]);

  const fetchFDPaymentInstructions: any = useMutation(
    "getFDPaymentInstrudtl",
    API.fetchFDPaymentDetails,
    {
      onSuccess: async (data) => {
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
            FULL_ACCOUNT:
              (item?.COMP_CD?.trim() ?? "") +
              "-" +
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

          setFdPaymentInstructions(updatedData);
          //@ts-ignore
          gridDataRef.current = cloneDeep(updatedData);
          setEnterKeyClassName("gridTable");
          setFormOpen(false);
          CloseMessageBox();
        }
      },
      onError: async (error: any) => {
        CloseMessageBox();
      },
    }
  );
  const updateFDPayment: any = useMutation(
    "updateFDInterestPayment",
    API.updateFDInterestPayment,
    {
      onSuccess: async (data) => {
        enqueueSnackbar(t("RecordSave"), {
          variant: "success",
        });
        setFormOpen(true);
        setFdPaymentInstructions([]);
        gridDataRef.current = [];
        deletedRowsRef.current = [];
        updatedRowsRef.current = [];
        CloseMessageBox();
      },
      onError: async (error: any) => {
        CloseMessageBox();
      },
    }
  );
  const fetchPaidFDDetails: any = useMutation(
    "fetchPaidFDDetails",
    API.fetchPaidFDDetails,
    {
      onSuccess: async (data: any) => {
        if (data.length === 0) {
          let buttonName = await MessageBox({
            messageTitle: "NotFound",
            message: "RecordNotFound",
            buttonNames: ["Ok"],
          });
          if (buttonName === "Ok") {
            setPaidFDOpen(false);
          }
        } else {
          const updatedData = data?.map((item) => ({
            ...item,
            INT_RATE: parseFloat(item?.INT_RATE ?? 0).toFixed(2),
            TOT_TDS_RECO_INT_AMT: parseFloat(
              item?.TOT_TDS_RECO_INT_AMT ?? 0
            ).toFixed(2),
          }));
          setPaidFDdata(updatedData);
          CloseMessageBox();
        }
      },
      onError: async (error: any) => {
        CloseMessageBox();
      },
    }
  );

  const setCurrentAction = useCallback(
    async (data) => {
      if (data?.name === "delete") {
        // Log rows to be deleted
        const rowsToDelete = data?.rows || [];
        if (rowsToDelete.length === 0) return;

        // Filter rows that are not already marked for deletion
        const rowsNotDeleted = rowsToDelete.filter(
          (row) =>
            !deletedRowsRef.current.some((item) => item?.FD_NO === row?.FD_NO)
        );

        if (rowsNotDeleted.length > 0) {
          const btnName = await MessageBox({
            messageTitle: "Confirmation",
            message: "DeleteData",
            buttonNames: ["Yes", "No"],
            icon: "CONFIRM",
          });

          if (btnName === "Yes") {
            rowsNotDeleted.forEach((row) => {
              const deletedRow = row?.data;
              gridDataRef.current = gridDataRef?.current?.filter(
                (item) => item?.FD_NO !== deletedRow?.FD_NO
              );
              delete deletedRow?.isNewRow;
              deletedRow.isDeleteRow = true;
              updatedRowsRef.current = updatedRowsRef?.current?.filter(
                (item) => item?.FD_NO !== deletedRow?.FD_NO
              );
              deletedRowsRef.current = [...deletedRowsRef?.current, deletedRow];
            });

            CloseMessageBox();
          } else {
            CloseMessageBox();
          }
        } else {
          CloseMessageBox();
        }
      } else if (data?.name === "retrieve") {
        if (
          Array.isArray(gridDataRef?.current) &&
          gridDataRef?.current?.length > 0
        ) {
          let btnName = await MessageBox({
            messageTitle: "Confirmation",
            message: `RetrieveConfirmation`,
            buttonNames: ["Yes", "No"],
            icon: "CONFIRM",
          });
          if (btnName === "Yes") {
            setFormOpen(true);
            setFdPaymentInstructions([]);
            setEnterKeyClassName("main");
            gridDataRef.current = [];
            deletedRowsRef.current = [];
            updatedRowsRef.current = [];
          }
        } else {
          setFormOpen(true);
          setEnterKeyClassName("main");
        }
      } else if (data?.name === "view-details") {
        setRowsData(data?.rows);
        setFDDetailOpen(true);
        setEnterKeyClassName("viewDetails");
      } else if (data?.name === "paid-fd") {
        fetchPaidFDDetails.mutate({
          COMP_CD: parameterRef?.current?.COMP_CD ?? "",
          BRANCH_CD: parameterRef?.current?.BRANCH_CD ?? "",
          ACCT_TYPE: parameterRef?.current?.ACCT_TYPE ?? "",
          ACCT_CD: parameterRef?.current?.ACCT_CD ?? "",
        });
        setEnterKeyClassName("paidFDOpen");
        setPaidFDOpen(true);
      } else if (data?.name === "save") {
        let allValid = true;

        for (let i = 0; i < gridDataRef?.current?.length; i++) {
          if (
            !gridDataRef?.current[i]?.PAYMENT_MODE ||
            gridDataRef?.current[i]?.PAYMENT_MODE?.trim() === ""
          ) {
            let btnName = await MessageBox({
              messageTitle: "ValidationFailed",
              message: `${t(`SelectPaymentMode`, {
                FD_NO: gridDataRef?.current[i]?.FD_NO,
              })}`,
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            if (btnName === "Ok") {
              allValid = false;
              break;
            }
          }
        }

        if (
          allValid &&
          (deletedRowsRef?.current?.length > 0 ||
            updatedRowsRef?.current?.length > 0 ||
            gridDataRef?.current?.filter((item) => item?.isNewRow === true)
              ?.length > 0)
        ) {
          const btnName = await MessageBox({
            messageTitle: "Confirmation",
            message: "SaveData",
            buttonNames: ["Yes", "No"],
            loadingBtnName: ["Yes"],
            icon: "CONFIRM",
          });
          if (btnName === "Yes") {
            updateFDPayment.mutate({
              DETAILS_DATA: {
                isDeleteRow: deletedRowsRef?.current ?? [],
                isUpdatedRow: updatedRowsRef?.current ?? [],
                isNewRow:
                  gridDataRef?.current?.filter(
                    (item) => item?.isNewRow === true
                  ) ?? [],
              },
            });
          }
        }
      } else {
        navigate(data?.name, {
          state: data?.rows,
        });
      }
    },
    [navigate]
  );
  const setPaidFDAction = useCallback(
    async (data) => {
      if (data?.name === "close") {
        setPaidFDdata([]);
        setPaidFDOpen(false);
        setEnterKeyClassName("gridTable");
      }
    },
    [navigate]
  );

  // Add/Remove action
  useEffect(() => {
    setActions(
      // @ts-ignore
      fdPaymentInstructions?.length > 0
        ? [
            ...baseActions,
            {
              actionName: "paid-fd",
              actionLabel: "PaidFD",
              alwaysAvailable: true,
            },
            { actionName: "save", actionLabel: "Save", alwaysAvailable: true },
          ]
        : baseActions
    );
  }, [fdPaymentInstructions?.length]);

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData: any,
    endSubmit,
    setFieldError
  ) => {
    gridDataRef.current = gridDataRef?.current?.map((item) => ({
      ...item,
      COMP_CD: authState?.companyID ?? "",
    }));

    fetchFDPaymentInstructions.mutate(parameterRef?.current, {
      onSettled: () => {
        if (!fetchFDPaymentInstructions?.isLoading) {
          endSubmit(true);
        }
      },
    });
  };
  const handleCloseForm = () => {
    setEnterKeyClassName("gridTable");
    setFormOpen(false);
  };
  const handleFDDetailClose = () => {
    setEnterKeyClassName("gridTable");
    setFDDetailOpen(false);
  };
  const handleButtonDisable = (disable) => {
    setButtonDisabled(disable);
  };

  const updateGrid = (formData) => {
    const index = gridDataRef?.current?.findIndex(
      (item) => item?.FD_NO === formData?.FD_NO
    );
    if (index !== -1) {
      gridDataRef.current[index] = {
        ...gridDataRef?.current[index],
        ...formData,
      };
    } else {
      gridDataRef?.current?.push(formData);
    }
    gridDataRef.current = gridDataRef?.current?.map((item) => ({
      ...item,
      FULL_ACCOUNT:
        (item?.BRANCH_CD?.trim() ?? "") +
        "-" +
        (item?.ACCT_TYPE?.trim() ?? "") +
        "-" +
        (item?.ACCT_CD?.trim() ?? ""),
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
      _rowColor: Boolean(item?.PAYMENT_MODE) ? "rgb(130, 224, 170)" : undefined,
    }));
  };

  const updateRow = (rowsData) => {
    const fdNo = rowsData?.FD_NO;

    if (rowsData?.isNewRow === false) {
      const index = updatedRowsRef?.current?.findIndex(
        (row) => row?.FD_NO === fdNo
      );

      if (index !== -1) {
        // Update the existing entry
        updatedRowsRef.current[index] = rowsData;
      } else {
        // Add a new entry
        updatedRowsRef?.current?.push(rowsData);
      }
    } else {
      return;
    }
  };

  useEffect(() => {
    const keysToRemove = [
      "getFDPaymentInstrudtl",
      "updateFDInterestPayment",
      "fetchPaidFDDetails",
      "getPMISCData",
      "getAccountTypeList",
    ].map((key) => [key, authState?.user?.branchCode]);
    return () => {
      keysToRemove?.forEach((key) => queryClient?.removeQueries(key));
    };
  }, []);

  return (
    <Fragment>
      <Dialog
        open={isFormOpen}
        // @ts-ignore
        TransitionComponent={Transition}
        className="main"
        PaperProps={{
          style: {
            width: "100%",
            overflow: "auto",
          },
        }}
        maxWidth="sm"
      >
        {(fetchFDPaymentInstructions?.error || updateFDPayment?.error) && (
          <Alert
            severity="error"
            errorMsg={
              fetchFDPaymentInstructions?.error?.error_msg ||
              updateFDPayment?.error?.error_msg ||
              t("Somethingwenttowrong")
            }
            errorDetail={
              fetchFDPaymentInstructions?.error?.error_detail ||
              updateFDPayment?.error?.error_detail ||
              ""
            }
            color="error"
          />
        )}
        <FormWrapper
          key={"accountFindmetaData"}
          metaData={accountFindmetaData as MetaDataType}
          formStyle={{
            background: "white",
          }}
          controlsAtBottom={true}
          onSubmitHandler={onSubmitHandler}
          setDataOnFieldChange={(action, payload) => {
            if (action === "fdPaymentInstrudtl") {
              parameterRef.current = { ...payload, A_PARM: "FD" };
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
                  fetchFDPaymentInstructions?.isLoading ||
                  isButtonDisabled
                }
                endIcon={
                  isSubmitting || fetchFDPaymentInstructions?.isLoading ? (
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
      <div className="gridTable">
        {updateFDPayment?.error && (
          <Alert
            severity="error"
            errorMsg={
              updateFDPayment?.error?.error_msg || t("Somethingwenttowrong")
            }
            errorDetail={updateFDPayment?.error?.error_detail || ""}
            color="error"
          />
        )}
        <GridWrapper
          key={"FDinterestPaymentGrid" + actions?.length}
          finalMetaData={FdInterestPaymentGridMetaData}
          data={gridDataRef?.current ?? []}
          setData={() => null}
          enableExport={true}
          actions={actions}
          setAction={setCurrentAction}
        />
      </div>

      <Dialog
        open={isPaidFDOpen}
        className="paidFDOpen"
        onKeyUp={(event) => {
          if (event.key === "Escape") {
            setPaidFDdata([]);
            setPaidFDOpen(false);
            setEnterKeyClassName("gridTable");
          }
        }}
        // @ts-ignore
        TransitionComponent={Transition}
        PaperProps={{
          style: {
            width: "100%",
            overflow: "auto",
          },
        }}
        maxWidth="lg"
      >
        {fetchPaidFDDetails?.error && (
          <Alert
            severity="error"
            errorMsg={
              fetchPaidFDDetails?.error?.error_msg || t("Somethingwenttowrong")
            }
            errorDetail={fetchPaidFDDetails?.error?.error_detail || ""}
            color="error"
          />
        )}
        <GridWrapper
          key={"PaidFD"}
          finalMetaData={PaidFDGridMetaData}
          data={paidFDdata ?? []}
          setData={() => null}
          actions={paidFDactions}
          setAction={setPaidFDAction}
          loading={
            fetchPaidFDDetails?.isLoading || fetchPaidFDDetails?.isFetching
          }
        />
      </Dialog>
      <Dialog
        open={isFDDetailOpen}
        onKeyUp={(event) => {
          if (event.key === "Escape") handleFDDetailClose();
        }}
        // @ts-ignore
        TransitionComponent={Transition}
        className="viewDetails"
        PaperProps={{
          style: {
            width: "100%",
            overflow: "auto",
          },
        }}
        maxWidth="lg"
      >
        <FdInterestPaymentDetail
          closeDialog={handleFDDetailClose}
          gridData={gridDataRef?.current}
          rows={rowsData}
          updateGrid={updateGrid}
          updateRow={updateRow}
          fdDetails={fdPaymentInstructions}
          defaultView={
            Boolean(rowsData?.[0]?.data?.PAYMENT_MODE) ? "edit" : "new"
          }
        />
      </Dialog>
    </Fragment>
  );
};

export const FdInterestPaymentGrid = () => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <FdInterestPaymentGridMain />
      </DialogProvider>
    </ClearCacheProvider>
  );
};
