import { Fragment, useContext, useEffect, useState } from "react";
import { useCallback } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  standingConfirmationViewGridMetaData,
  standingInsructionGridMetaData,
} from "./metaData";
import { AuthContext } from "pages_audit/auth";
import * as API from "./api";
import { useMutation, useQuery } from "react-query";
import SearchGrid from "../searchGrid";
import { t } from "i18next";
import { enqueueSnackbar } from "notistack";
import SiExecuteDetailView from "../siExecuteDetailView";
import PhotoSignWithHistory from "components/common/custom/photoSignWithHistory/photoSignWithHistory";
import {
  usePopupContext,
  GridWrapper,
  Alert,
  ActionTypes,
  GridMetaDataType,
  ClearCacheProvider,
  queryClient,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
const actions: ActionTypes[] = [
  {
    actionName: "view-details",
    actionLabel: "ViewDetails",
    multiple: false,
    rowDoubleClick: true,
  },
  {
    actionName: "search",
    actionLabel: "Search",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];

const StandingInstructionGrid = () => {
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [opens, setOpens] = useState(false);
  const [open, setOpen] = useState(false);
  const [viewDetailData, setViewDetailData] = useState(null);
  const [isViewDetailOpen, setIsViewDetailOpen] = useState(false);
  const navigate = useNavigate();
  const { state: rows } = useLocation();
  const tran_Cd = rows?.[0]?.data?.TRAN_CD;
  const [lineId, setLineId] = useState(null);
  const [srCd, setSrCd] = useState(null);
  const [Acctdata, SetAcctData] = useState({});
  const [isPhotoSign, setIsPhotoSign] = useState(false);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const setCurrentAction = useCallback(
    async (data) => {
      if (data?.name === "search") {
        setOpens(true);
      }
      if (data?.name === "view-details") {
        setViewDetailData(data?.rows?.[0]);
        setIsViewDetailOpen(true);
        setOpen(true);
      }
      navigate(data?.name, {
        state: data?.rows,
      });
    },
    [navigate, MessageBox]
  );

  const {
    data: mainData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch: mainRefetch,
  } = useQuery<any, any>(["getStandingInstructionConfirmMainData"], () =>
    API.getStandingInstructionConfirmMainData({
      companyID: authState?.companyID,
      branchCode: authState?.user?.branchCode,
    })
  );
  const {
    data,
    isLoading: confirmisLoading,
    isFetching: confirmisFetching,
    isError: confirmisError,
    error: confirmError,
    refetch: siRefetch,
  } = useQuery<any, any>(["getStandingInstructionConfInnerData", tran_Cd], () =>
    API.getStandingInstructionConfInnerData({
      companyID: authState?.companyID ?? "",
      branchCode: authState?.user?.branchCode ?? "",
      Tran_cd: tran_Cd ?? "",
    })
  );

  const ConfirmMutation = useMutation(API.getSIConfirmation, {
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
      siRefetch();
      CloseMessageBox();
      mainRefetch();
    },
  });
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getStandingInstructionConfirmMainData"]);
      queryClient.removeQueries(["getStandingInstructionConfInnerData"]);
    };
  }, []);

  return (
    <Fragment>
      {isError && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? t("Somethingwenttowrong")}
          errorDetail={error?.error_detail}
          color="error"
        />
      )}
      <GridWrapper
        key={"standingInsructionGridMetaData"}
        finalMetaData={standingInsructionGridMetaData as GridMetaDataType}
        loading={isLoading || isFetching}
        data={mainData ?? []}
        setData={() => null}
        actions={actions}
        setAction={setCurrentAction}
        refetchData={() => mainRefetch}
      />
      {isViewDetailOpen && (
        <>
          <GridWrapper
            key={"standingInsructionViewGridMetaData"}
            finalMetaData={
              standingConfirmationViewGridMetaData as GridMetaDataType
            }
            loading={confirmisLoading || confirmisFetching}
            data={data || []}
            setData={() => null}
            refetchData={() => siRefetch()}
            onClickActionEvent={(index, id, currentData) => {
              if (id === "edit") {
                const { LINE_ID, SR_CD } = currentData;
                setLineId(LINE_ID);
                setSrCd(SR_CD);
                setOpens(true);
              }
              if (id === "confirm") {
                const {
                  ENT_COMP_CD,
                  ENT_BRANCH_CD,
                  LINE_ID,
                  SR_CD,
                  TRAN_CD,
                  ENTERED_BY,
                  VERIFIED_BY,
                } = currentData;
                const confirmData = async () => {
                  if (ENTERED_BY === authState?.user?.id) {
                    await MessageBox({
                      messageTitle: t("ValidationFailed"),
                      message: t("SInotConfirmByYou"),
                      icon: "ERROR",
                      buttonNames: ["Ok"],
                    });
                  } else {
                    const btnName = await MessageBox({
                      message: t("confirmSI"),
                      messageTitle: t("Confirmation"),
                      icon: "CONFIRM",
                      buttonNames: ["Yes", "No"],
                      loadingBtnName: ["Yes"],
                    });

                    if (btnName === "Yes") {
                      ConfirmMutation.mutate({
                        ENT_COMP_CD: ENT_COMP_CD,
                        ENT_BRANCH_CD: ENT_BRANCH_CD,
                        TRAN_CD: TRAN_CD,
                        SR_CD: SR_CD,
                        LINE_ID: LINE_ID,
                        ENTERED_BY: ENTERED_BY,
                      });
                    }
                  }
                };
                confirmData();
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

          <SiExecuteDetailView
            open={opens}
            onClose={() => setOpens(false)}
            lineId={lineId}
            srCd={srCd}
            tran_cd={tran_Cd}
          />
        </>
      )}
      <Routes>
        <Route
          path="search"
          element={
            <SearchGrid
              open={opens}
              onClose={() => setOpens(false)}
              mainRefetch={""}
            />
          }
        />
      </Routes>
    </Fragment>
  );
};

export const StandingInstructionConfirmationGridWrapper = () => {
  return (
    <ClearCacheProvider>
      <StandingInstructionGrid />
    </ClearCacheProvider>
  );
};
