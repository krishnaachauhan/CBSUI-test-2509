import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import PhotoSignWithHistory from "components/common/custom/photoSignWithHistory/photoSignWithHistory";
import { format } from "date-fns";
import { AuthContext } from "pages_audit/auth";
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "react-query";
import DailyTransTabs from "../DailyTransaction/TRNHeaderTabs";
import * as API from "./api";
import { AccountClosedConfirm, ClosedAccountDetailsMetaData } from "./metaData";
import { useLocation } from "react-router-dom";
import {
  LoaderPaperComponent,
  GridWrapper,
  GradientButton,
  ActionTypes,
  utilFunction,
  usePopupContext,
  Alert,
  queryClient,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
import { cloneDeep } from "lodash";

const confirmationActions: ActionTypes[] = [
  {
    actionName: "view-details",
    actionLabel: "ViewDetails",
    multiple: false,
    rowDoubleClick: true,
  },
];
const detailActions: ActionTypes[] = [
  {
    actionName: "view-details",
    actionLabel: "ViewDetails",
    multiple: false,
    rowDoubleClick: true,
  },
];

export const AccountCloseConfirm = () => {
  const { authState } = useContext(AuthContext);
  const [accountDetails, setAccountDetails] = useState([]);
  const [isPhotoSignVisible, setIsPhotoSignVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState({});
  const [confirmationData, setConfirmationData] = useState<any>([]);
  const [voucherDetails, setVoucherDetails] = useState([]);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { t } = useTranslation();
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const {
    data,
    isLoading: isLoadingConfData,
    isFetching: isFetchingConfData,
    isError,
    error,
    refetch: refetchConfData,
  } = useQuery<any, any>(
    ["getAccountCloseConfDetail", authState?.user?.branchCode ?? ""],
    () =>
      API.getAccountCloseConfDetail({
        ENT_COMP_CD: authState?.companyID ?? "",
        ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
        CLOSE_DT: authState?.workingDate ?? "",
      }),
    {
      onSuccess: (data) => {
        setConfirmationData(data);
      },
    }
  );

  const fetchAccountDetails: any = useMutation(
    "getAccountDetails",
    API.getAccountDetails,
    {
      onSuccess: (data) => {
        setAccountDetails(data);
      },
      onError: async (error: any) => {
        const btnName = await MessageBox({
          messageTitle: "ValidationFailed",
          message: error?.error_msg ?? "",
          icon: "ERROR",
        });
        CloseMessageBox();
      },
    }
  );
  const handleAccountCloseConfirmation: any = useMutation(
    "accountCloseConfirm",
    API.accountCloseConfirm,
    {
      onSuccess: async (data) => {
        let ConfirmMSG = data;
        for (let i = 0; i < ConfirmMSG.length; i++) {
          if (ConfirmMSG?.[i]?.O_STATUS === "999") {
            const btnName = await MessageBox({
              messageTitle: ConfirmMSG?.[i]?.O_MSG_TITLE ?? "ValidationFailed",
              message: ConfirmMSG?.[i]?.O_MESSAGE,
              icon: "ERROR",
            });
          } else if (ConfirmMSG?.[i]?.O_STATUS === "99") {
            const { btnName, obj } = await MessageBox({
              messageTitle: ConfirmMSG?.[i]?.O_MSG_TITLE ?? "Confirmation",
              message: ConfirmMSG?.[i]?.O_MESSAGE,
              buttonNames: ["Yes", "No"],
              icon: "CONFIRM",
            });
          } else if (ConfirmMSG?.[i]?.O_STATUS === "9") {
            const { btnName, obj } = await MessageBox({
              messageTitle: ConfirmMSG?.[i]?.O_MSG_TITLE ?? "Alert",
              message: ConfirmMSG?.[i]?.O_MESSAGE,
              icon: "WARNING",
            });
          } else if (ConfirmMSG?.[i]?.O_STATUS === "0") {
            const { btnName, obj } = await MessageBox({
              messageTitle: ConfirmMSG?.[i]?.O_MSG_TITLE ?? "Success",
              message: ConfirmMSG?.[i]?.O_MESSAGE,
              icon: "SUCCESS",
              buttonNames: ["Ok"],
            });
            if (btnName === "Ok") {
              refetchConfData();
            }
            refetchConfData();
          }
        }
      },
      onError: async (error: any) => {
        const btnName = await MessageBox({
          messageTitle: "ValidationFailed",
          message: error?.error_msg ?? "",
          icon: "ERROR",
        });

        CloseMessageBox();
      },
    }
  );
  const fetchVoucherDetails: any = useMutation(
    "getAccountCloseVoucherDtl",
    API.getAccountCloseVoucherDtl,
    {
      onSuccess: (data) => {
        setVoucherDetails(data);
      },
      onError: async (error: any) => {
        const btnName = await MessageBox({
          messageTitle: "ValidationFailed",
          message: error?.error_msg ?? "",
          icon: "ERROR",
        });
        CloseMessageBox();
      },
    }
  );
  useEffect(() => {
    setAccountDetails([]);
    setVoucherDetails([]);
  }, [confirmationData]);

  const handleViewDetails = useCallback(async (data) => {
    if (data?.name === "_rowChanged") {
      fetchAccountDetails.mutate({
        PARENT_TYPE: "",
        COMP_CD: authState?.companyID ?? "",
        ACCT_TYPE: data?.rows?.[0]?.data?.ACCT_TYPE ?? "",
        ACCT_CD: data?.rows?.[0]?.data?.ACCT_CD ?? "",
        BRANCH_CD: data?.rows?.[0]?.data?.BRANCH_CD ?? "",
      });
      fetchVoucherDetails.mutate({
        COMP_CD: authState?.companyID ?? "",
        ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
        ASON_DT:
          format(new Date(data?.rows?.[0]?.data?.CLOSE_DT), "dd/MMM/yyyy") ??
          "",
        SCROLL1: data?.rows?.[0]?.data?.SCROLL1 ?? "",
        TRN_FLAG: "AC",
        AC_BRANCH: data?.rows?.[0]?.data?.BRANCH_CD ?? "",
        ACCT_TYP: data?.rows?.[0]?.data?.ACCT_TYPE ?? "",
        AC_CD: data?.rows?.[0]?.data?.ACCT_CD ?? "",
        TRN_CD: data?.rows?.[0]?.data?.TRAN_CD ?? "",
      });
    }
  }, []);
  const DetailsetCurrentAction = useCallback(async (data) => {
    if (data?.name === "view-details") {
      if (data?.rows?.[0]?.data?.TRAN_CD) {
        setIsPhotoSignVisible(true);
        setSelectedAccount({
          COMP_CD: data?.rows?.[0]?.data?.COMP_CD ?? "",
          BRANCH_CD: data?.rows?.[0]?.data?.BRANCH_CD ?? "",
          ACCT_TYPE: data?.rows?.[0]?.data?.ACCT_TYPE ?? "",
          ACCT_CD: data?.rows?.[0]?.data?.ACCT_CD ?? "",
          SCREEN_REF: docCD,
        });
      } else {
        return "";
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      const keysToRemove = [
        "getAccountDetails",
        "getAccountCloseConfDetail",
        "getAccountCloseVoucherDtl",
        "accountCloseConfirm",
      ].map((key) => [key, authState?.user?.branchCode]);
      keysToRemove.forEach((key) => queryClient.removeQueries(key));
    };
  }, []);
  useEffect(() => {
    if (confirmationData?.length === 0) {
      setAccountDetails([]);
      setVoucherDetails([]);
    }
  }, [confirmationData]);
  const handleRetrieve = () => {
    setConfirmationData([]);
    setAccountDetails([]);
    setVoucherDetails([]);
    refetchConfData();
  };

  const headingWithButton = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: "-1",
      }}
    >
      {utilFunction.getDynamicLabel(currentPath, authState?.menulistdata, true)}

      <GradientButton onClick={handleRetrieve} color={"primary"}>
        {t("Retrieve")}
      </GradientButton>
    </div>
  );

  return (
    <Fragment>
      {isError && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg || t("Somethingwenttowrong")}
          errorDetail={error?.error_detail ?? ""}
          color="error"
        />
      )}
      {fetchAccountDetails?.isLoading ? <LoaderPaperComponent /> : null}
      <DailyTransTabs
        //@ts-ignore
        heading={headingWithButton}
        tabsData={[]}
        cardsData={accountDetails}
        reqData={[]}
        hideCust360Btn={true}
        occupiedHeight={{ min: "750px", max: "750px" }}
        screenFlag="ACCTCLOSECONFIRM"
      />
      <Box sx={{ padding: "0 15px" }}>
        <GridWrapper
          key={"ClosedAccountDetails" + voucherDetails?.length}
          finalMetaData={ClosedAccountDetailsMetaData}
          data={voucherDetails ?? []}
          setData={() => null}
          loading={
            fetchVoucherDetails?.isLoading || fetchVoucherDetails?.isFetching
          }
          actions={detailActions}
          setAction={DetailsetCurrentAction}
        />
        <Box sx={{ display: "flex", gap: "20px", padding: "10px" }}>
          <Typography fontWeight={"bold"} display={"inline"}>
            {t("TotalNoofrecords")}
            {voucherDetails?.length}
          </Typography>
          <Typography fontWeight={"bold"} display={"inline"}>
            {t("DoubleClicktoviewSign")}
          </Typography>
        </Box>
        <Box
          sx={{
            "&>.MuiPaper-root .MuiToolbar-root": {
              minHeight: "0px",
              display: "none",
            },
          }}
        >
          <GridWrapper
            key={`AccountClosedConfirm${confirmationData}${isLoadingConfData}`}
            finalMetaData={AccountClosedConfirm}
            data={confirmationData ?? []}
            setData={() => null}
            loading={isLoadingConfData || isFetchingConfData}
            actions={confirmationActions}
            setAction={handleViewDetails}
            disableMultipleRowSelect={true}
            defaultSelectedRowId={
              confirmationData?.length > 0 ? confirmationData?.[0]?.INDEX : ""
            }
            onClickActionEvent={async (index, id, data) => {
              if (id === "CONFIRMED") {
                if (data?.CONFIRMED !== "Y") {
                  if (authState?.user?.id === data?.ENTERED_BY) {
                    const btnName = await MessageBox({
                      messageTitle: "InvalidConfirmation",
                      message: "ConfirmRestrictMsg",
                      icon: "ERROR",
                    });
                  } else {
                    const btnName = await MessageBox({
                      messageTitle: "Confirmation",
                      message: "AcCloseConfMsg",
                      buttonNames: ["Confirm", "ReOpen", "Cancel"],
                      loadingBtnName: ["Confirm", "ReOpen"],
                      icon: "CONFIRM",
                    });
                    if (btnName === "Confirm") {
                      handleAccountCloseConfirmation.mutate({
                        ENTERED_COMP_CD: authState?.companyID ?? "",
                        ENTERED_BRANCH_CD: authState?.user?.branchCode ?? "",
                        COMP_CD: data?.COMP_CD ?? "",
                        BRANCH_CD: data?.BRANCH_CD ?? "",
                        ACCT_CD: data?.ACCT_CD ?? "",
                        ACCT_TYPE: data?.ACCT_TYPE ?? "",
                        CONFIRMED: data?.CONFIRMED ?? "",
                        SCROLL1: data?.SCROLL1 ?? "",
                        TRAN_CD: data?.TRAN_CD ?? "",
                        STATUS: "O",
                        FLAG: "Y",
                        ENTERED_BY: data?.ENTERED_BY ?? "",
                        SCREEN_REF: docCD,
                      });
                    }
                    if (btnName === "ReOpen") {
                      handleAccountCloseConfirmation.mutate({
                        ENTERED_COMP_CD: authState?.companyID ?? "",
                        ENTERED_BRANCH_CD: authState?.user?.branchCode ?? "",
                        COMP_CD: data?.COMP_CD ?? "",
                        BRANCH_CD: data?.BRANCH_CD ?? "",
                        ACCT_CD: data?.ACCT_CD ?? "",
                        ACCT_TYPE: data?.ACCT_TYPE ?? "",
                        CONFIRMED: data?.CONFIRMED ?? "",
                        SCROLL1: data?.SCROLL1 ?? "",
                        TRAN_CD: data?.TRAN_CD ?? "",
                        STATUS: "O",
                        FLAG: "N",
                        ENTERED_BY: data?.ENTERED_BY ?? "",
                        SCREEN_REF: docCD,
                      });
                    }
                  }
                } else if (data?.CONFIRMED === "Y") {
                  if (authState?.user?.id === data?.ENTERED_BY) {
                    const btnName = await MessageBox({
                      messageTitle: "InvalidConfirmation",
                      message: "ConfirmRestrictMsg",
                      icon: "ERROR",
                    });
                  } else {
                    const btnName = await MessageBox({
                      messageTitle: "ReOpenConf",
                      message: "ReOpenConfMsg",
                      buttonNames: ["Yes", "No"],
                      loadingBtnName: ["Yes"],
                      icon: "CONFIRM",
                    });
                    if (btnName === "Yes") {
                      handleAccountCloseConfirmation.mutate({
                        ENTERED_COMP_CD: authState?.companyID ?? "",
                        ENTERED_BRANCH_CD: authState?.user?.branchCode ?? "",
                        COMP_CD: data?.COMP_CD ?? "",
                        BRANCH_CD: data?.BRANCH_CD ?? "",
                        ACCT_CD: data?.ACCT_CD ?? "",
                        ACCT_TYPE: data?.ACCT_TYPE ?? "",
                        CONFIRMED: data?.CONFIRMED ?? "",
                        SCROLL1: data?.SCROLL1 ?? "",
                        TRAN_CD: data?.TRAN_CD ?? "",
                        STATUS: "O",
                        FLAG: "N",
                        ENTERED_BY: data?.ENTERED_BY ?? "",
                        SCREEN_REF: docCD,
                      });
                    }
                  }
                }
              }
            }}
          />
        </Box>
        <Box sx={{ display: "flex" }}>
          <Box sx={{ margin: "0 auto" }}>
            <Typography color="inherit" variant={"h6"} component="div">
              {t("AccountCloseConfNote")}
            </Typography>
          </Box>
        </Box>
      </Box>

      {isPhotoSignVisible ? (
        <>
          <div style={{ paddingTop: 10 }}>
            <PhotoSignWithHistory
              data={selectedAccount}
              onClose={() => {
                setIsPhotoSignVisible(false);
              }}
              screenRef={docCD}
            />
          </div>
        </>
      ) : null}
    </Fragment>
  );
};
