import {
  Fragment,
  useEffect,
  useContext,
  useRef,
  useCallback,
  StrictMode,
  useState,
} from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  Alert,
  ActionTypes,
  GridWrapper,
  GridMetaDataType,
  usePopupContext,
  ClearCacheProvider,
  ClearCacheContext,
  queryClient,
} from "@acuteinfo/common-base";
import { AuthContext } from "pages_audit/auth";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import * as API from "./api";
import { chequeBkConfirmGridMetaData } from "./MetaData/chequebkConfirmGridMetadata";
import { limitConfirmGridMetaData } from "./MetaData/limitConfirmGridMetadata";
import { stockConfirmGridMetaData } from "./MetaData/stockConfirmGridMetadata";
import { stopPayConfirmGridMetaData } from "./MetaData/stopPayConfirmGridMetadata";
import { lienConfirmGridMetaData } from "./MetaData/lienConfirmGridMetadata";
import { tempODConfirmGridMetaData } from "./MetaData/temporaryODGridMetadata";
import { RetrieveData } from "../operations/chequeBookTab/confirm/retrieveData";
import { ChequebookCfmForm } from "../operations/chequeBookTab/entryForm/entryForm";
import { LimitConfirmationForm } from "../operations/limit-entry/confirm/confirmationForm";
import { StockConfirmationForm } from "../operations/stockEntry/confirm/confirmationForm";
import { StopPayConfirmationForm } from "../operations/stopPaymentEntry/confirm/confirmationForm";
import { LienConfirmationForm } from "../operations/lienEntry/confirm/confirmationForm";
import { TempODConfirmationForm } from "../operations/temporaryOD/confirm/confirmationForm";
import { insuranceEntryConfirmGridMetaData } from "./MetaData/insuranceConfirmGridMetadata";
import { InsuranceConfirmationFormWrapper } from "../operations/insuranceEntry/confirmation/insuranceConfirmationForm";
import { Dialog, Typography } from "@mui/material";
import {
  DialogProvider,
  useDialogContext,
} from "../operations/payslip-issue-entry/DialogContext";
import { useEnter } from "components/custom/useEnter";
import { disburseEntryConfirmGridMetadata } from "./MetaData/disburseEntryConfirmGridMetadata";
import { DisbursEntryCnfFormWrapper } from "../operations/disburseEntry/Confirmation/DisbursEntryCnfForm";
import { unclaimedConfirmGridMetaData } from "./MetaData/unclaimedConfirmGridMetaData";
import { getdocCD } from "components/utilFunction/function";
import UnclPaymentEntry from "../operations/Uncl-paymentEntry";
import { photoSignatureConfGridMetaData } from "./MetaData/photoSignatureConfGridMetaData";
import { PhotoSignatureConfFormWrapper } from "../operations/photo-signatureScanningConfirm/PhotoSignatureConf";
import { CUSTOM_SCREEN_FLAG } from "components/utilFunction/constant";
import { ShareAppConfirmGridMetadata } from "./MetaData/shareAppConfirmGridMetadata";
import MainSharedAppEntry from "../operations/sharedAppEntry";
import { AdvanceStockEntryForm } from "../operations/advanceStockEntry/advanceStockEntry";

export const Confirmations = ({ screenFlag }) => {
  const actions: ActionTypes[] = [
    {
      actionName: "view-details",
      actionLabel: "ViewDetails",
      multiple: false,
      rowDoubleClick: true,
    },
  ];

  const myGridRef = useRef<any>(null);
  const [isOpen, setIsOpen] = useState<any>(true);
  const { getEntries } = useContext(ClearCacheContext);
  const { authState } = useContext(AuthContext);
  const [rowData, setRowData] = useState<any>({});
  const { MessageBox } = usePopupContext();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const setCurrentAction = useCallback(
    (data) => {
      setRowData(data?.rows?.[0]?.data);
      if (
        docCD !== "MST/523" &&
        data?.rows?.[0]?.data?.LAST_ENTERED_BY === authState?.user?.id
      ) {
        MessageBox({
          messageTitle: t("InvalidConfirmation"),
          message: t("ConfirmRestrictMsg"),
          buttonNames: ["Ok"],
          icon: "ERROR",
        });
      } else if (data?.name === "retrieve") {
        setIsOpen(true);
      } else if (data?.name === "new-entry") {
        navigate(data?.name, {
          state: {
            rows: [
              {
                data: {},
              },
            ],
            from: "new-entry",
            formmode: "new",
          },
        });
      } else {
        if (screenFlag === CUSTOM_SCREEN_FLAG.SHARE_APP_ENTRY) {
          navigate(data?.name, {
            state: {
              rows: data?.rows,
              formmode: "view",
              from: docCD === "MST/523" ? "" : "confirmation-entry",
            },
          });
        } else {
          navigate(data?.name, {
            state: data?.rows,
          });
        }
      }
    },
    [navigate]
  );

  const result: any = useMutation(API.getConfirmationGridData, {});

  useEffect(() => {
    result.mutate({
      screenFlag: screenFlag ?? "",
      COMP_CD: authState.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
      workingDate: authState?.workingDate ?? "",
      USERNAME: authState?.user?.id ?? "",
      USERROLE: authState?.role ?? "",
      SCREEN_REF: docCD ?? "",
    });
    return () => {
      let entries = getEntries() as any[];
      if (Array.isArray(entries) && entries.length > 0) {
        entries.forEach((one) => {
          queryClient.removeQueries(one);
        });
      }
      queryClient.removeQueries(["getConfirmationGridData"]);
    };
  }, [getEntries]);
  const { commonClass, trackDialogClass, dialogClassNames } =
    useDialogContext();
  const [dataClass, setDataClass] = useState("");
  useEffect(() => {
    if (isOpen) {
      trackDialogClass("Retrieve");
    }
    return () => {
      trackDialogClass("main");
    };
  }, [isOpen]);

  useEffect(() => {
    const newData =
      commonClass !== null
        ? commonClass
        : dialogClassNames
        ? `${dialogClassNames}`
        : "main";

    setDataClass(newData);
  }, [commonClass, dialogClassNames]);

  useEnter(`${dataClass}`);
  const ClosedEventCall = useCallback(() => {
    setIsOpen(false);
    trackDialogClass("main");
    navigate(".");
  }, [navigate]);

  let gridMetaData = chequeBkConfirmGridMetaData;
  if (screenFlag === "chequebookCFM") {
    gridMetaData = chequeBkConfirmGridMetaData;
    actions.push({
      actionName: "retrieve",
      actionLabel: "Retrieve",
      multiple: undefined,
      rowDoubleClick: false,
      alwaysAvailable: true,
    });
  } else if (screenFlag === "limitCFM") {
    gridMetaData = limitConfirmGridMetaData;
  } else if (screenFlag === "stockCFM") {
    gridMetaData = stockConfirmGridMetaData;
  } else if (screenFlag === "stopPaymentCFM") {
    gridMetaData = stopPayConfirmGridMetaData;
  } else if (screenFlag === "lienCFM") {
    gridMetaData = lienConfirmGridMetaData;
  } else if (screenFlag === "tempOdCFM") {
    gridMetaData = tempODConfirmGridMetaData;
  } else if (screenFlag === "insuranceCFM") {
    gridMetaData = insuranceEntryConfirmGridMetaData;
  } else if (screenFlag === "disburseCFM") {
    gridMetaData = disburseEntryConfirmGridMetadata;
  } else if (screenFlag === "unclaimedCFM") {
    gridMetaData = unclaimedConfirmGridMetaData;
  } else if (screenFlag === "photosignatureCFM") {
    gridMetaData = photoSignatureConfGridMetaData;
  } else if (screenFlag === CUSTOM_SCREEN_FLAG.SHARE_APP_ENTRY) {
    gridMetaData = ShareAppConfirmGridMetadata;
    if (docCD === "MST/523")
      actions.push({
        actionName: "new-entry",
        actionLabel: "Add",
        multiple: undefined,
        rowDoubleClick: false,
        alwaysAvailable: true,
      });
  }

  return (
    <StrictMode>
      <Fragment>
        {result.isError && (
          <Alert
            severity="error"
            errorMsg={result.error?.error_msg ?? "Something went to wrong."}
            errorDetail={result.error?.error_detail}
            color="error"
          />
        )}
        <GridWrapper
          key={`ConfirmationReqGrid-` + screenFlag}
          finalMetaData={gridMetaData as GridMetaDataType}
          data={result.data ?? []}
          setData={() => null}
          loading={result.isLoading}
          actions={actions}
          setAction={setCurrentAction}
          refetchData={() =>
            result.mutate({
              screenFlag: screenFlag ?? "",
              COMP_CD: authState.companyID ?? "",
              BRANCH_CD: authState?.user?.branchCode ?? "",
              workingDate: authState?.workingDate ?? "",
              USERNAME: authState?.user?.id ?? "",
              USERROLE: authState?.role ?? "",
              SCREEN_REF: docCD ?? "",
            })
          }
          ref={myGridRef}
        />
        <Routes>
          <Route
            path="view-details/*"
            element={
              screenFlag === "chequebookCFM" ? (
                <ChequebookCfmForm
                  closeDialog={ClosedEventCall}
                  result={result}
                  navigate={navigate}
                />
              ) : screenFlag === "limitCFM" ? (
                <LimitConfirmationForm
                  closeDialog={ClosedEventCall}
                  result={result}
                />
              ) : screenFlag === "stockCFM" ? (
                rowData?.DTL_CNT > 0 ? (
                  <AdvanceStockEntryForm
                    closeDialog={ClosedEventCall}
                    defaultView="view"
                    screenForUse="confirm"
                    otherScreenReqPara={null}
                    confirmedDataGridMutation={result}
                  />
                ) : (
                  <StockConfirmationForm
                    closeDialog={ClosedEventCall}
                    result={result}
                  />
                )
              ) : screenFlag === "stopPaymentCFM" ? (
                <StopPayConfirmationForm
                  closeDialog={ClosedEventCall}
                  result={result}
                />
              ) : screenFlag === "lienCFM" ? (
                <LienConfirmationForm
                  closeDialog={ClosedEventCall}
                  result={result}
                />
              ) : screenFlag === "tempOdCFM" ? (
                <TempODConfirmationForm
                  closeDialog={ClosedEventCall}
                  result={result}
                />
              ) : screenFlag === "insuranceCFM" ? (
                <InsuranceConfirmationFormWrapper
                  closeDialog={ClosedEventCall}
                  result={result}
                />
              ) : screenFlag === "disburseCFM" ? (
                <DisbursEntryCnfFormWrapper
                  closeDialog={ClosedEventCall}
                  result={result}
                />
              ) : screenFlag === "unclaimedCFM" ? (
                <Dialog
                  open={true}
                  fullWidth={true}
                  PaperProps={{
                    style: {
                      maxWidth: "1335px",
                    },
                  }}
                >
                  <UnclPaymentEntry
                    closeDialog={ClosedEventCall}
                    result={result}
                    screenFlag={screenFlag}
                  />
                </Dialog>
              ) : screenFlag === "photosignatureCFM" ? (
                <PhotoSignatureConfFormWrapper
                  closeDialog={ClosedEventCall}
                  result={result}
                />
              ) : (
                <></>
              )
            }
          />
        </Routes>

        {screenFlag === "chequebookCFM" && isOpen && (
          <RetrieveData
            closeDialog={ClosedEventCall}
            result={result}
            isOpen={isOpen}
          />
        )}
      </Fragment>
    </StrictMode>
  );
};

export const ConfirmationGridWrapper = ({ screenFlag }) => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <div className="main">
          <Confirmations
            key={screenFlag + "-Confirmation"}
            screenFlag={screenFlag}
          />
        </div>
      </DialogProvider>
    </ClearCacheProvider>
  );
};
