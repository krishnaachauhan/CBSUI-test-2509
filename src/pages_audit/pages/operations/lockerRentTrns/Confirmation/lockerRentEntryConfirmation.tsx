import {
  ActionTypes,
  Alert,
  ClearCacheProvider,
  GradientButton,
  GridMetaDataType,
  GridWrapper,
  RemarksAPIWrapper,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import {
  DialogProvider,
  useDialogContext,
} from "../../payslip-issue-entry/DialogContext";
import { ViewTrnsGrid } from "../viewTrnsGrid";
import { LockerTrnsFormView } from "../../LockerOperationTrns/lockerTrnsForm";
import { Box } from "@mui/system";
import { Fragment } from "react/jsx-runtime";
import {
  AppBar,
  Grid,
  LinearProgress,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import { useTypeStyles } from "../../LockerOperationTrns/lockerOperationTrns";
import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "pages_audit/auth";
import { t } from "i18next";
import { useLocation } from "react-router-dom";
import { confirmationGridMetadata } from "./confirmationGridMetadata";
import { useMutation } from "react-query";
import * as API from "./api";
import { getLockerViewMst } from "../../LockerOperationTrns/api";
import { SearchVoucherNo } from "./searchVoucherNo";
import { DataProvider, useDataContext } from "../DataContext";
import { enqueueSnackbar } from "notistack";
import { useEnter } from "components/custom/useEnter";

const actions: ActionTypes[] = [
  {
    actionName: "Delete",
    actionLabel: "Remove",
    multiple: false,
    rowDoubleClick: false,
  },
  {
    actionName: "confirm",
    actionLabel: "Confirm",
    multiple: false,
    rowDoubleClick: false,
  },
];
const LockerRenConfirmMain = () => {
  const headerClasses = useTypeStyles();
  let currentPath = useLocation().pathname;
  const { authState } = useContext(AuthContext);
  const { setContextState } = useDataContext();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { commonClass, dialogClassNames, trackDialogClass } =
    useDialogContext();
  const [state, setState] = useState<any>({
    activeView: "master",
    flag: "P",
    apiRefetchPara: {},
    searchVoucher: false,
    removeVoucher: false,
    isDeleteDialogueOpen: false,
    gridData: [],
    tranCd: "",
    rawData: null,
    elementClass: "main",
  });

  const dataRefetch = () => {
    if (state?.apiRefetchPara) {
      const { COMP_CD, BRANCH_CD, TRAN_DT, FLAG } = state.apiRefetchPara;
      if (COMP_CD && BRANCH_CD && TRAN_DT && FLAG) {
        getCpnfirmGridData?.mutate({
          COMP_CD,
          BRANCH_CD,
          TRAN_DT,
          FLAG,
        });
      }
    }
  };

  const getLockerInfo = useMutation(getLockerViewMst, {
    onError: async (error: any) => {
      CloseMessageBox();
    },
    onSuccess: async (data) => {},
  });
  const confirmRejectMutation = useMutation(API?.confirmRejectLockerRentEntry, {
    onError: async (error: any) => {
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      enqueueSnackbar(t("RecordInsertedMsg"), {
        variant: "success",
      });
      dataRefetch();
      setState((prevState) => ({
        ...prevState,
        isDeleteDialogueOpen: false,
      }));
    },
  });
  const getCpnfirmGridData = useMutation(API?.getLockerRentConfirnData, {
    onError: async (error: any) => {
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      setState((prevState) => ({
        ...prevState,
        gridData: data,
      }));
    },
  });

  useEffect(() => {
    if (state?.activeView === "TodaysTransaction") {
      setContextState({
        screenFlag: "lockerRentConfirmTodatTrns",
      });
    } else if (state?.activeView == "viewAllRentPaid") {
      setContextState({
        screenFlag: "viewAllRentPaid",
      });
    }
  }, [state?.activeView]);

  const handleVoucherDelete = async () => {
    const btnName = await MessageBox({
      messageTitle: "Confirmation",
      message: t("deleteCmfmMsg"),
      icon: "CONFIRM",
      buttonNames: ["Yes", "No"],
    });
    if (btnName === "Yes") {
      setState((prevState) => ({
        ...prevState,
        isDeleteDialogueOpen: true,
      }));
    }
  };

  const setCurrentAction = useCallback(async (data) => {
    let row = data?.rows[0]?.data;
    let obj = {
      COMP_CD: authState?.companyID,
      BRANCH_CD: authState?.user?.baseBranchCode,
      ACCT_CD: row?.ACCT_CD,
      ACCT_TYPE: row?.ACCT_TYPE,
      WORKING_DATE: authState?.workingDate,
      TRAN_CD: row?.TRAN_CD,
    };
    if (data.name === "_rowChanged") {
      setState((prevState) => ({
        ...prevState,
        rawData: row,
      }));
      getLockerInfo?.mutate({
        ...obj,
      });
      setContextState({
        reqData: obj,
      });
    } else if (data.name === "confirm") {
      if (row?.CONFIRMED !== "Y" && authState?.role === "1") {
        MessageBox({
          messageTitle: "Error",
          message: t("Youarenotauthorized"),
          icon: "ERROR",
        });
      } else if (row?.ENTERED_BY === authState?.user?.id) {
        MessageBox({
          messageTitle: "Error",
          message: t("ConfirmRestrictMsg"),
          icon: "ERROR",
        });
      } else {
        const btnName = await MessageBox({
          messageTitle: "Confirmation",
          message: `Do you Want to allow the transaction - Voucher No.${row?.TRAN_CD} ?`,
          icon: "CONFIRM",
          buttonNames: ["Yes", "No"],
          defFocusBtnName: "Yes",
        });
        if (btnName === "Yes") {
          confirmRejectMutation?.mutate({
            isConfirmed: true,
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            TRAN_CD: row?.TRAN_CD,
          });
        }
      }
    } else if (data.name === "Delete") {
      handleVoucherDelete();
    }
  }, []);

  useEffect(() => {
    if (state?.isDeleteDialogueOpen) {
      trackDialogClass("remarks__wrapper__base");
    } else trackDialogClass("main");
  }, [state?.isDeleteDialogueOpen]);

  const handleSearchVoucher = (voucherNo) => {
    const result = getCpnfirmGridData?.data.filter(
      (item: any) => item.TRAN_CD === voucherNo
    );

    if (result.length === 0) {
      MessageBox({
        messageTitle: t("invalidVoucherNo"),
        message: t("voucherNonotFound"),
        icon: "INFO",
      });
      return getCpnfirmGridData?.data;
    } else if (state?.removeVoucher) {
      handleVoucherDelete();
      return result.concat(
        getCpnfirmGridData?.data.filter(
          (item: any) => item.TRAN_CD !== voucherNo
        )
      );
    } else
      return result.concat(
        getCpnfirmGridData?.data.filter(
          (item: any) => item.TRAN_CD !== voucherNo
        )
      );
  };

  const renderViewContent = () => {
    switch (state?.activeView) {
      case "master":
        return <LockerTrnsFormView data={getLockerInfo?.data} />;
      case "TodaysTransaction":
        return <ViewTrnsGrid />;
      case "viewAllRentPaid":
        return <ViewTrnsGrid />;
      default:
        return null;
    }
  };
  const views = [
    { name: "master", label: t("ViewMaster") },
    { name: "TodaysTransaction", label: t("TodaysTransaction") },
    { name: "viewAllRentPaid", label: t("viewAllRentPaid") },
  ];
  const getButtonStyle = (view) => ({
    border: state?.activeView === view ? "2px solid white" : "none",
  });

  useEffect(() => {
    const payLoad: any = {
      COMP_CD: authState?.companyID,
      BRANCH_CD: authState?.user?.branchCode,
      TRAN_DT: authState?.workingDate,
      FLAG: state?.flag,
    };
    setState((prevState) => ({
      ...prevState,
      apiRefetchPara: payLoad,
    }));
    getCpnfirmGridData?.mutate(payLoad);
  }, [state?.flag]);

  const errorDataa: any = [
    { error: getLockerInfo?.error, isError: getLockerInfo?.isError },
    { error: getCpnfirmGridData?.error, isError: getCpnfirmGridData?.isError },
    {
      error: confirmRejectMutation?.error,
      isError: confirmRejectMutation?.isError,
    },
  ];

  const hasError = errorDataa.some(({ isError }) => isError);

  useEffect(() => {
    const newData =
      commonClass !== null
        ? commonClass
        : dialogClassNames
        ? `${dialogClassNames}`
        : "main";

    setState((prevState) => ({
      ...prevState,
      elementClass: newData,
    }));
  }, [commonClass, dialogClassNames]);

  useEnter(`${state?.elementClass}`);

  return (
    <Fragment>
      <AppBar position="relative" color="secondary">
        <Toolbar className={headerClasses.root} variant="dense">
          <Typography
            className={headerClasses.title}
            color="inherit"
            variant="h6"
            component="div"
          >
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                {utilFunction.getDynamicLabel(
                  currentPath,
                  authState?.menulistdata,
                  true
                )}
              </Grid>
              <Grid item>
                {views.map((view) => (
                  <GradientButton
                    key={view.name}
                    onClick={() => {
                      setState((prevState) => ({
                        ...prevState,
                        activeView: view.name,
                      }));
                    }}
                    style={getButtonStyle(view.name)}
                  >
                    {view.label}
                  </GradientButton>
                ))}
              </Grid>
            </Grid>
          </Typography>
        </Toolbar>
      </AppBar>

      {getLockerInfo?.isLoading ? <LinearProgress color="secondary" /> : null}
      <Box className={headerClasses.mainContent}>
        <Box className={headerClasses.activeView}>{renderViewContent()}</Box>
        <Box className={headerClasses.entry}>
          <Paper className="ENTRIES" sx={{ margin: "8px", padding: "8px" }}>
            {hasError
              ? errorDataa.map(
                  ({ error, isError }, index) =>
                    isError && (
                      <Alert
                        key={index}
                        severity="error"
                        errorMsg={error?.error_msg || t("Somethingwenttowrong")}
                        errorDetail={error?.error_detail ?? ""}
                        color="error"
                      />
                    )
                )
              : null}
            <GridWrapper
              key={`confirmationGrid` + state?.tranCd}
              finalMetaData={confirmationGridMetadata as GridMetaDataType}
              data={state?.gridData}
              setData={() => {}}
              loading={getCpnfirmGridData?.isLoading}
              hideHeader={true}
              actions={actions}
              setAction={setCurrentAction}
              disableMultipleRowSelect={true}
              onClickActionEvent={async (index, id, currentDataItem) => {
                if (id === "CONFIRM") {
                  if (
                    currentDataItem?.CONFIRMED !== "Y" &&
                    authState?.role === "1"
                  ) {
                    MessageBox({
                      messageTitle: "Error",
                      message: t("Youarenotauthorized"),
                      icon: "ERROR",
                    });
                  } else if (
                    currentDataItem?.ENTERED_BY === authState?.user?.id
                  ) {
                    MessageBox({
                      messageTitle: "Error",
                      message: t("ConfirmRestrictMsg"),
                      icon: "ERROR",
                    });
                  } else {
                    const btnName = await MessageBox({
                      messageTitle: "Confirmation",
                      message: `Do you Want to allow the transaction - Voucher No.${currentDataItem?.TRAN_CD} ?`,
                      icon: "CONFIRM",
                      buttonNames: ["Yes", "No"],
                      defFocusBtnName: "Yes",
                    });
                    if (btnName === "Yes") {
                      confirmRejectMutation?.mutate({
                        isConfirmed: true,
                        COMP_CD: authState?.companyID,
                        BRANCH_CD: authState?.user?.branchCode,
                        TRAN_CD: currentDataItem?.TRAN_CD,
                      });
                    }
                  }
                }
                if (id === "REJECT") {
                  handleVoucherDelete();
                }
              }}
              defaultSelectedRowId={state?.tranCd}
            />
          </Paper>
          <Box padding={"8px"}>
            <GradientButton
              onClick={() => {
                setState((prevState) => ({
                  ...prevState,
                  flag: prevState?.flag === "P" ? "A" : "P",
                }));
              }}
              sx={{ margin: "5px" }}
            >
              {state?.flag === "P" ? t("ViewAll") : t("viewPending")}
            </GradientButton>

            <GradientButton
              className="CALCULATOR"
              onClick={() => window.open("Calculator:///")}
              sx={{ margin: "5px" }}
            >
              {t("Calculator")}
            </GradientButton>

            <GradientButton
              onClick={() => {
                setState((prevState) => ({
                  ...prevState,
                  removeVoucher: true,
                }));
              }}
              sx={{ margin: "5px" }}
            >
              {t("Delete")}
            </GradientButton>
            <GradientButton
              onClick={() => {
                setState((prevState) => ({
                  ...prevState,
                  searchVoucher: true,
                }));
              }}
              sx={{ margin: "5px" }}
            >
              {t("VoucherSearch")}
            </GradientButton>
            <GradientButton
              onClick={() => {
                dataRefetch();
              }}
              sx={{ margin: "5px" }}
            >
              {t("Refresh")}
            </GradientButton>
          </Box>
        </Box>
      </Box>
      {state?.searchVoucher ? (
        <SearchVoucherNo
          open={state?.searchVoucher}
          close={() => {
            setState((prevState) => ({
              ...prevState,
              searchVoucher: false,
            }));
          }}
          handleVoucherSearch={async (voucherNo) => {
            const result = await handleSearchVoucher(voucherNo);
            console.log(result, "result");

            setState((prevState) => ({
              ...prevState,
              gridData: result,
              tranCd: voucherNo,
              searchVoucher: false,
            }));
          }}
        />
      ) : null}
      {state?.removeVoucher ? (
        <SearchVoucherNo
          open={state?.removeVoucher}
          close={() => {
            setState((prevState) => ({
              ...prevState,
              removeVoucher: false,
            }));
          }}
          handleVoucherSearch={async (voucherNo) => {
            const result = await handleSearchVoucher(voucherNo);
            setState((prevState) => ({
              ...prevState,
              gridData: result,
              tranCd: voucherNo,
              removeVoucher: false,
            }));
          }}
        />
      ) : null}
      {state?.isDeleteDialogueOpen ? (
        <RemarksAPIWrapper
          defaultValue="WRONG ENTRY FROM LOCKER RENT TRANSACTION CONFIRMATION (TRN/056)"
          TitleText={"Confirmation"}
          onActionNo={() => {
            setState((prevState) => ({
              ...prevState,
              isDeleteDialogueOpen: false,
            }));
          }}
          onActionYes={(val, rows) => {
            confirmRejectMutation?.mutate({
              isConfirmed: false,
              COMP_CD: authState?.baseCompanyID,
              BRANCH_CD: authState?.user?.branchCode,
              TRAN_CD: state?.rawData?.TRAN_CD,
              ACCT_TYPE: state?.rawData?.ACCT_TYPE,
              ACCT_CD: state?.rawData?.ACCT_CD,
              TRAN_AMOUNT: state?.rawData?.AMOUNT,
              ENT_COMP_CD: state?.rawData?.COMP_CD,
              ENT_BRANCH_CD: state?.rawData?.BRANCH_CD,
              TRAN_DT: authState?.workingDate,
              CONFIRM_FLAG: state?.rawData?.CONFIRMED,
              USER_DEF_REMARKS: val,
              ENTERED_BY: state?.rawData?.ENTERED_BY,
            });
            setState((prevState) => ({
              ...prevState,
              isDeleteDialogueOpen: false,
            }));
          }}
          isEntertoSubmit={true}
          AcceptbuttonLabelText="Ok"
          CanceltbuttonLabelText="Cancel"
          open={state?.isDeleteDialogueOpen}
          rows={{}}
        />
      ) : null}
    </Fragment>
  );
};
export const lockerRenConfirm = () => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <DataProvider>
          <div className="main">
            <LockerRenConfirmMain />
          </div>
        </DataProvider>
      </DialogProvider>
    </ClearCacheProvider>
  );
};
