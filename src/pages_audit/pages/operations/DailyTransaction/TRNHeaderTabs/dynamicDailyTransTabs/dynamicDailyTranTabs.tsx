import {
  ActionTypes,
  Alert,
  GridWrapper,
  LoaderPaperComponent,
  PopupRequestWrapper,
} from "@acuteinfo/common-base";
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import {
  formatDateMinusDays,
  getdocCD,
  parseAndReplaceGridMetdata,
} from "components/utilFunction/function";
import i18n from "components/multiLanguage/languagesConfiguration";
import { format } from "date-fns";
import { AuthContext } from "pages_audit/auth";
import { useLocation } from "react-router-dom";
import { JointDetailsForm } from "../JointDetails/jointDetailsForm";
import { ChequeDtlGrid } from "pages_audit/pages/operations/chequeBookTab/chequeDetail/chequeDetail";
import { Dialog, DialogProps } from "@mui/material";
import TodaysClearingGrid from "pages_audit/pages/operations/chequeBookTab/TodaysClearing/todaysClearingGrid";
import ChequeReturnHistoryGrid from "pages_audit/pages/operations/chequeBookTab/chequeReturnHistory/chequeReturnHistory";
import HoldCharge from "../HoldCharge";
import ScrollRegisterReport from "../SnapShot/ScrollRegister";
import { DateRetrievalDialog } from "components/common/custom/dateRetrievalParaForm/dateRetrievalPara";
import { ChequeImageWrapper } from "./chequeImage";
import { DocumentViewer } from "../Document/documentView";
import { InsuranceDetails } from "../Insurance/InsuranceDetails";
import SiExecuteDetailView from "pages_audit/pages/operations/standingInstruction/siExecuteDetailView";
import { ACHIWDetailView } from "../OtherTrx/ACH_IW/achIWDetail";
import { ACHOWDetailView } from "../OtherTrx/ACH_OW/achOWDetail";
import { LimitDetailView } from "../Limit/limitDetail";
import { StockDetailView } from "../Stock/stockDetail";
import DetailDisbursement from "../Disbursement/DetailDisbursement";
import { AdvanceStockEntryForm } from "pages_audit/pages/operations/advanceStockEntry/advanceStockEntry";

interface ActionDialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: DialogProps["maxWidth"]; // ✅ correct type
  style?: React.CSSProperties;
}

const ActionDialog = ({
  open,
  onClose,
  children,
  maxWidth = "lg",
  style = {},
}: ActionDialogProps) => (
  <Dialog
    open={open}
    onKeyUp={(event) => {
      if (event.key === "Escape") onClose();
    }}
    PaperProps={{
      style: {
        width: "100%",
        overflow: "auto",
        ...style,
      },
    }}
    maxWidth={maxWidth}
  >
    {children}
  </Dialog>
);

export const getOccupiedHeight = ({ min, max }, screenFlag, tabName = "") => {
  const screenHeight = window.innerHeight;
  const minVal = parseInt(min, 10);
  const maxVal = parseInt(max, 10);

  // Case: ACCTINQ
  if (screenFlag === "ACCTINQ") {
    if (screenHeight >= 900) return { min, max };
    const offset = screenHeight >= 700 ? 30 : 60;
    return {
      min: `${minVal - offset}px`,
      max: `${maxVal - offset}px`,
    };
  }

  // Case: High Resolution Screen height >= 900
  if (screenHeight >= 900) {
    if (screenFlag === "CUST360") {
      const extra = tabName === "ACCOUNT" ? 30 : 72;
      return {
        min: `${minVal + extra}px`,
        max: `${maxVal + extra}px`,
      };
    }
    return { min, max };
  }

  // Case: Medium Resolution Screen height >= 700
  if (screenHeight >= 700) {
    let offset = 30;
    if (screenFlag === "TRN/001") {
      offset = 55;
    } else if (screenFlag === "CUST360") {
      offset = tabName === "ACCOUNT" ? 105 : 55;
    } else if (
      screenFlag === "TRN/002" ||
      screenFlag === "CARDSCANING" ||
      screenFlag === "OTHERREC" ||
      screenFlag === "RELEASEMAIN" ||
      screenFlag === "CASHPAY"
    ) {
      offset = 100;
    } else if (
      screenFlag === "ACCTCLOSECONFIRM" ||
      screenFlag === "ACCTCLOSEPROCESS"
    ) {
      offset = 200;
    }

    return {
      min: `${minVal - offset}px`,
      max: `${maxVal - offset}px`,
    };
  }

  // Case: Low Resolution Screen height < 700
  let offset = 60;
  if (screenFlag === "TELLER") {
    offset = 85;
  } else if (screenFlag === "TRN/001") {
    offset = 110;
  } else if (screenFlag === "CUST360") {
    offset = tabName === "ACCOUNT" ? 70 : 110;
  } else if (screenFlag === "TRN/002") {
    offset = 150;
  } else if (
    screenFlag === "CARDSCANING" ||
    screenFlag === "OTHERREC" ||
    screenFlag === "RELEASEMAIN" ||
    screenFlag === "CASHPAY"
  ) {
    offset = 170;
  } else if (
    screenFlag === "ACCTCLOSECONFIRM" ||
    screenFlag === "ACCTCLOSEPROCESS"
  ) {
    offset = 260;
  }

  return {
    min: `${minVal - offset}px`,
    max: `${maxVal - offset}px`,
  };
};

export const DynamicTabs = ({
  tabName,
  reqData,
  occupiedHeight,
  screenFlag,
}) => {
  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const [openDetails, setOpenDetails] = useState({ isOpen: false, action: "" });
  const [rowsData, setRowsData] = useState<any>({});
  const [modifiedMetaData, setModifiedMetaData] = useState<any>("");
  const [updatedGridData, setUpdatedGridData] = useState<any>([]);
  const [displayAction, setDisplayAction] = useState("P");
  const [popupMsg, setPopupMsg] = useState<any>({
    isOpen: false,
    message: "",
    title: "",
    action: "",
    icon: "INFO",
  });

  const hasRequiredFields = Boolean(
    reqData?.ACCT_CD && reqData?.ACCT_TYPE && reqData?.BRANCH_CD
  );

  const actions: ActionTypes[] = useMemo(
    () => [
      {
        actionName: "ViewDetails",
        actionLabel: "ViewDetails",
        multiple: false,
        rowDoubleClick: true,
        alwaysAvailable: false,
        shouldExclude: () =>
          !(
            tabName === "JOINT" ||
            tabName === "CHQ" ||
            tabName === "SNAPSHOT" ||
            tabName === "DOCS" ||
            tabName === "INSU" ||
            tabName === "SI" ||
            tabName === "ACHIW" ||
            tabName === "ACHOW" ||
            tabName === "LIMIT" ||
            tabName === "STOCK" ||
            tabName === "DISBDTL"
          ),
      },
      {
        actionName: tabName === "CHQ" ? "todayClearing" : "back-date",
        actionLabel: tabName === "CHQ" ? "TodaysClearing" : "BackDate",
        multiple: undefined,
        rowDoubleClick: false,
        alwaysAvailable: true,
        shouldExclude: () => tabName !== "CHQ" && tabName !== "SNAPSHOT",
      },
      {
        actionName: "chequeReturnHistory",
        actionLabel: "ChequeReturnHistory",
        multiple: undefined,
        rowDoubleClick: false,
        alwaysAvailable: true,
        shouldExclude: () => tabName !== "CHQ",
      },
      {
        actionName: displayAction === "P" ? "view-All" : "Filtered",
        actionLabel: displayAction === "P" ? "ViewAll" : "Filtered",
        multiple: undefined,
        rowDoubleClick: false,
        alwaysAvailable: true,
        shouldExclude: () => tabName !== "SI",
      },
    ],
    [tabName, displayAction]
  );

  const { data, isLoading, isFetching, error, isError } = useQuery<any, any>(
    ["getDynamicMetaData", tabName],
    () => API.getDynamicMetaData(tabName),
    {
      enabled: Boolean(tabName) && hasRequiredFields,
    }
  );

  // const fetchGridData = useMutation(API.getGridDataList, {
  //   onError: async (error: any) => {
  //     setPopupMsg({
  //       isOpen: true,
  //       message: error?.error_msg ?? "",
  //       title: "ValidationFailed",
  //       action: "MSG",
  //       icon: "ERROR",
  //     });
  //   },
  //   onSuccess: (data) => {},
  // });

  const setCurrentAction = useCallback(
    async (data) => {
      setRowsData(data?.rows?.[0]?.data);

      if (tabName === "SI" && data?.name === "view-All") {
        setDisplayAction("A");
      } else if (tabName === "SI" && data?.name === "Filtered") {
        setDisplayAction("P");
      } else if (
        tabName === "ACHIW" &&
        data?.rows?.[0]?.data?.STATUS?.trim() !== "A"
      ) {
        setPopupMsg({
          isOpen: true,
          message: "MandateAlertMessage",
          title: "Alert",
          action: data?.name,
        });
      } else {
        setOpenDetails({ isOpen: true, action: data?.name });
      }
    },
    [tabName]
  );

  // const handleRefetch = useCallback(() => {
  //   if (tabName !== "HOLDCHRG" && hasRequiredFields) {
  //     console.log(
  //       ">>>>>>>>",
  //       tabName,
  //       data,
  //       reqData,
  //       docCD,
  //       authState,
  //       fetchGridData
  //     );

  //     fetchGridData.mutate({
  //       tabName: tabName,
  //       apiEndPoint: data?.[0]?.API_ENDPOINT,
  //       reqData: {
  //         ...reqData,
  //         SCREEN_REF: docCD ?? "",
  //         FROM_DATE:
  //           reqData.FROM_DATE ??
  //           formatDateMinusDays(
  //             authState?.workingDate,
  //             reqData?.PARENT_CODE?.trim() === "GL01" ? 1 : 31
  //           ) ??
  //           "",
  //         TO_DATE: reqData?.TO_DATE || format(new Date(), "dd-MMM-yyyy"),
  //         LANG: i18n.resolvedLanguage,
  //         YEAR_CHAR: "0",
  //         FLAG: 2,
  //       },
  //     });
  //   }
  // }, [
  //   tabName,
  //   data,
  //   reqData?.BRANCH_CD,
  //   reqData?.ACCT_TYPE,
  //   reqData?.ACCT_CD,
  //   docCD,
  // ]);
  // console.log(">>Dynamic Transaction Tab");

  const parsedMetaData = useMemo(() => {
    if (data?.[0]?.TAB_DATA) {
      let finalMetadata = parseAndReplaceGridMetdata(data[0]?.TAB_DATA);
      let newOccupiedHeight = finalMetadata?.gridConfig?.footerNote
        ? {
            min: `${parseInt(occupiedHeight?.min, 10) + 24}px`,
            max: `${parseInt(occupiedHeight?.max, 10) + 24}px`,
          }
        : occupiedHeight;

      let hideFooter =
        (screenFlag === "TRN/001" ||
          screenFlag === "TRN/002" ||
          screenFlag === "TELLER" ||
          screenFlag === "OTHERREC" ||
          screenFlag === "SINGLEDENO" ||
          screenFlag === "RELEASEMAIN" ||
          screenFlag === "CASHPAY") &&
        tabName !== "SNAPSHOT";
      return {
        ...finalMetadata,
        gridConfig: {
          ...finalMetadata.gridConfig,
          hideFooter: hideFooter ?? false,
          enablePagination: !hideFooter,
          containerHeight: {
            min: "100vh",
            max: "100vh",
          },
          occupiedHeight: getOccupiedHeight(newOccupiedHeight, screenFlag),
        },
      };
    }
    return null;
  }, [data, occupiedHeight, screenFlag, window.innerHeight]);

  const {
    data: gridData,
    isLoading: isGridLoading,
    refetch,
  } = useQuery(
    ["getGridDataList", tabName, reqData, docCD],
    () =>
      API.getGridDataList({
        tabName: tabName,
        apiEndPoint: data?.[0]?.API_ENDPOINT,
        reqData: {
          ...reqData,
          SCREEN_REF: docCD ?? "",
          FROM_DATE:
            reqData.FROM_DATE ??
            formatDateMinusDays(
              authState?.workingDate,
              reqData?.PARENT_CODE?.trim() === "GL01" ? 1 : 31
            ) ??
            "",
          TO_DATE: reqData?.TO_DATE || format(new Date(), "dd-MMM-yyyy"),
          LANG: i18n.resolvedLanguage,
          YEAR_CHAR: "0",
          FLAG: 2,
        },
      }),
    {
      enabled:
        Boolean(parsedMetaData) && tabName !== "HOLDCHRG" && hasRequiredFields,
      keepPreviousData: true, // ✅ prevents flicker + re-fetch spam
      staleTime: 1000 * 120, // ✅ cache for 1 min
    }
  );

  useEffect(() => {
    if (tabName === "SI") {
      if (displayAction === "P") {
        setUpdatedGridData(
          gridData?.filter((item: any) => Boolean(item?.DOC_STATUS))
        );
      } else {
        setUpdatedGridData(gridData);
      }
    } else {
      setUpdatedGridData(gridData);
    }
  }, [gridData?.length, tabName, displayAction]);

  useEffect(() => {
    if (
      tabName === "SHTRN" &&
      !modifiedMetaData &&
      parsedMetaData &&
      gridData
    ) {
      const sumByType = (field, types) =>
        gridData?.reduce((sum, item) => {
          const typeCd = item?.TYPE_CD?.trim();
          const value = parseFloat(item?.[field]) || 0;
          return types.includes(typeCd) ? sum + value : sum;
        }, 0) || 0;

      const purchaseTypes = ["1", "2", "3"];
      const sellTypes = ["4", "5", "6"];

      const PurchaseShare = sumByType("NO_OF_SHARE", purchaseTypes);
      const PurchaseAmount = sumByType("CR_AMT", purchaseTypes).toFixed(2);

      const SellShare = sumByType("NO_OF_SHARE", sellTypes);
      const SellAmount = sumByType("DR_AMT", sellTypes).toFixed(2);

      const balanceShare = PurchaseShare - SellShare;
      const balanceAmount = (
        parseFloat(PurchaseAmount) - parseFloat(SellAmount)
      ).toFixed(2);
      const footerNote = `• No. Of Share → Purchase: ${PurchaseShare}, Sell: ${SellShare}, Balance: ${balanceShare}
                          • Amount → Purchase: ${PurchaseAmount}, Sell: ${SellAmount}, Balance: ${balanceAmount}`;
      setModifiedMetaData({
        ...parsedMetaData,
        gridConfig: {
          ...parsedMetaData.gridConfig,
          footerNote,
        },
      });
    }
  }, [parsedMetaData, gridData]);

  // useEffect(() => {
  //   if (parsedMetaData) {
  //     handleRefetch();
  //   }
  // }, [parsedMetaData]);

  const loaderDivStyle = useMemo(() => {
    if (!occupiedHeight) return {};
    const { min, max } = getOccupiedHeight(occupiedHeight, screenFlag);
    if (screenFlag === "ACCTINQ") {
      return {
        minHeight: `calc(100vh - ${parseInt(min, 10) - 125}px)`,
        maxHeight: `calc(100vh - ${parseInt(max, 10) - 125}px)`,
      };
    }
    return {
      minHeight: `calc(100vh - ${parseInt(min, 10) - 55}px)`,
      maxHeight: `calc(100vh - ${parseInt(max, 10) - 55}px)`,
    };
  }, [screenFlag, occupiedHeight]);

  const renderDetails = () => {
    const { isOpen, action } = openDetails;
    if (!isOpen) return null;

    const closeDialog = () => setOpenDetails({ isOpen: false, action: "" });

    const viewDetailsMap: Record<string, JSX.Element | null> = {
      JOINT: (
        <JointDetailsForm
          isOpen={isOpen}
          reqData={reqData}
          index={rowsData?.index}
          data={gridData}
          closeDialog={closeDialog}
        />
      ),
      CHQ: (
        <ChequeDtlGrid
          setChequebookIssueDtlOpen={closeDialog}
          reqDataFromFlag={[{ data: rowsData }]}
          screenFlag="chequesDtlForTrn"
        />
      ),
      SNAPSHOT: (
        <ScrollRegisterReport
          rowData={{
            ...rowsData,
            COMP_CD: reqData?.COMP_CD ?? "",
            BRANCH_CD: reqData?.BRANCH_CD ?? "",
            docCD: reqData?.SCREEN_REF ?? "",
          }}
          handleClose={closeDialog}
          openReport={isOpen}
        />
      ),
      DOCS: (
        <DocumentViewer
          isOpen={isOpen}
          rowsData={rowsData}
          handleClose={closeDialog}
        />
      ),
      INSU: (
        <ActionDialog onClose={closeDialog} open={isOpen}>
          <InsuranceDetails rowData={rowsData} setOpenDetail={closeDialog} />
        </ActionDialog>
      ),
      SI: (
        <SiExecuteDetailView
          open={isOpen}
          onClose={closeDialog}
          lineId={rowsData?.LINE_ID ?? ""}
          srCd={rowsData?.SR_CD ?? ""}
          tran_cd={rowsData?.TRAN_CD ?? ""}
          branch_cd={rowsData?.ENT_BRANCH_CD ?? ""}
          screenFlag="SIDTL_TRN"
        />
      ),
      ACHIW: (
        <ACHIWDetailView
          isOpen={isOpen}
          rowsData={rowsData}
          handleClose={closeDialog}
        />
      ),
      ACHOW: (
        <ACHOWDetailView
          isOpen={isOpen}
          rowsData={rowsData}
          handleClose={closeDialog}
        />
      ),
      LIMIT: (
        <LimitDetailView
          isOpen={isOpen}
          rowsData={rowsData}
          handleClose={closeDialog}
          docCD={docCD}
        />
      ),
      STOCK:
        rowsData?.DTL_CNT > 0 ? (
          <AdvanceStockEntryForm
            closeDialog={closeDialog}
            defaultView="view"
            screenForUse="view"
            otherScreenReqPara={rowsData}
            confirmedDataGridMutation={null}
          />
        ) : (
          <StockDetailView
            isOpen={isOpen}
            rowsData={rowsData}
            handleClose={closeDialog}
            docCD={docCD}
          />
        ),
      DISBDTL: (
        <ActionDialog
          onClose={closeDialog}
          open={isOpen}
          maxWidth="xl"
          style={{ width: "75%", padding: "10px" }}
        >
          <DetailDisbursement rowData={rowsData} setOpenDetail={closeDialog} />
        </ActionDialog>
      ),
    };

    switch (action) {
      case "ViewDetails":
        return viewDetailsMap[tabName] ?? null;

      case "todayClearing":
        return (
          <ActionDialog onClose={closeDialog} open={isOpen}>
            <TodaysClearingGrid
              setTodayClearingOpen={closeDialog}
              reqData={reqData}
            />
          </ActionDialog>
        );

      case "chequeReturnHistory":
        return (
          <ActionDialog onClose={closeDialog} open={isOpen}>
            <ChequeReturnHistoryGrid
              setChequebookReturnHistoryOpen={closeDialog}
              reqData={reqData}
            />
          </ActionDialog>
        );

      case "back-date":
        return (
          <DateRetrievalDialog
            handleClose={closeDialog}
            retrievalParaValues={(retrievalValues) => {
              reqData.FROM_DATE = retrievalValues?.FROM_DATE
                ? format(new Date(retrievalValues?.FROM_DATE), "dd-MMM-yyyy")
                : "";
              reqData.TO_DATE = retrievalValues?.TO_DATE
                ? format(new Date(retrievalValues?.TO_DATE), "dd-MMM-yyyy")
                : "";
              refetch();
            }}
            defaultData={{
              A_FROM_DT:
                reqData?.FROM_DATE ??
                formatDateMinusDays(authState?.workingDate, 60),
              A_TO_DT: authState?.workingDate ?? "",
            }}
          />
        );

      case "CHEQUE_IMG":
        return (
          <ChequeImageWrapper
            isOpen={isOpen}
            reqData={rowsData}
            authState={authState}
            SCREEN_REF={docCD}
            onClose={closeDialog}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Fragment>
      {(() => {
        if ((isLoading || isFetching) && !parsedMetaData) {
          return (
            <div style={loaderDivStyle}>
              <LoaderPaperComponent />
            </div>
          );
        }
        if (isError) {
          return (
            <Alert
              severity="error"
              errorMsg={error?.error_msg ?? "Error"}
              errorDetail={""}
              color="error"
            />
          );
        }
        let gridContent: any = null;
        if (tabName === "HOLDCHRG" && parsedMetaData) {
          gridContent = (
            <HoldCharge
              gridMetaData={parsedMetaData}
              reqData={reqData}
              tabName={tabName}
              apiEndPoint={data?.[0]?.API_ENDPOINT}
            />
          );
        } else if (parsedMetaData) {
          gridContent = (
            <GridWrapper
              key={
                `dailyTranGrid-${tabName}` +
                Boolean(modifiedMetaData) +
                displayAction +
                updatedGridData?.length
              }
              finalMetaData={modifiedMetaData || parsedMetaData}
              loading={isGridLoading || isFetching || isLoading}
              data={updatedGridData ?? []}
              actions={actions}
              setAction={setCurrentAction}
              setData={(data) => {}}
              refetchData={refetch}
              enableExport={true}
              onClickActionEvent={async (index, id, currentData) => {
                if (id === "CHEQUE_IMG") {
                  setOpenDetails({ isOpen: true, action: id });
                  setRowsData(currentData);
                }
                if (id === "VIEW_DTL") {
                  setRowsData(currentData);
                  if (
                    tabName === "ACHIW" &&
                    currentData?.STATUS?.trim() === "A"
                  ) {
                    setPopupMsg({
                      isOpen: true,
                      message: "MandateAlertMessage",
                      title: "Alert",
                      action: "ViewDetails",
                    });
                  } else {
                    setOpenDetails({ isOpen: true, action: "ViewDetails" });
                  }
                }
              }}
            />
          );
        } else {
          gridContent = <div style={loaderDivStyle}></div>;
        }

        return <>{gridContent}</>;
      })()}
      {popupMsg.isOpen && (
        <PopupRequestWrapper
          open={popupMsg.isOpen}
          MessageTitle={popupMsg.title}
          Message={popupMsg.message}
          rows={[]}
          onClickButton={() => {
            if (rowsData && popupMsg.action !== "MSG") {
              setOpenDetails({ isOpen: true, action: popupMsg.action });
            }
            setPopupMsg({
              isOpen: false,
              message: "",
              title: "",
              action: "",
            });
          }}
          buttonNames={["Ok"]}
          icon={popupMsg.icon ?? "INFO"}
        />
      )}
      {renderDetails()}
    </Fragment>
  );
};
