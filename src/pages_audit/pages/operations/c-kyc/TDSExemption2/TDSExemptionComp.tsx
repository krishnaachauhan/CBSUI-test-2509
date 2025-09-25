import {
  ActionTypes,
  Alert,
  GridMetaDataType,
  GridWrapper,
  queryClient,
  RemarksAPIWrapper,
  usePopupContext,
} from "@acuteinfo/common-base";
import { Dialog } from "@mui/material";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import * as API from "../api";
import { AuthContext } from "pages_audit/auth";
import { tds_exemption_dtl_grid_meta_data } from "./gridMetadata";
import { TdsExemptionFormMain } from "./TdsExemptionForm";
import { enqueueSnackbar } from "notistack";
import { t } from "i18next";
import { getdocCD } from "components/utilFunction/function";
import { CkycContext } from "../CkycContext";
import { ClonedCkycContext } from "../formModal/formDetails/formComponents/legalComps/ClonedCkycContext";

const TDSSExemptionComp = ({ open, onClose, viewMode, isModal }: any) => {
  const { authState } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<any>(null);
  const [newReqCd, setNewReqCd] = useState("");
  const gridRef = useRef<any>(null);
  const reqCdRef = useRef<any>(null);
  const [gridData, setGridData] = useState<any>([]);
  const [curRow, setCurRow] = useState<any>({});
  const [formMode, setFormmode] = useState<any>(viewMode ?? "");
  const { state } = useContext(isModal ? ClonedCkycContext : CkycContext);
  const [isAddNewFormVisible, setIsAddNewFormVisible] =
    useState<boolean>(false);
  const actions: ActionTypes[] = [
    {
      actionName: "add",
      actionLabel: "Add",
      multiple: undefined,
      rowDoubleClick: false,
      alwaysAvailable: true,
      shouldExclude: () => isModal,
    },
    {
      actionName: "view-details",
      actionLabel: "View Detail",
      multiple: false,
      rowDoubleClick: true,
    },
    {
      actionName: "Delete",
      actionLabel: "Delete",
      multiple: false,
      shouldExclude: () => isModal,
    },
    {
      actionName: "close",
      actionLabel: "Close",
      multiple: undefined,
      rowDoubleClick: false,
      alwaysAvailable: true,
    },
  ];
  const {
    data: TDSExemptionData,
    isError: isTDSExemptionError,
    isLoading: isTDSExemptionLoading,
    isFetching: isTDSExemptionFetching,
    refetch: TDSExemptionRefetch,
    error: TDSExemptionError,
  } = useQuery<any, any>(
    ["TDSExemptionDTL", newReqCd || location?.state?.[0]?.data?.REQUEST_ID],
    () =>
      API.TDSExemptionDTL({
        COMP_CD: authState?.companyID ?? "",
        CUSTOMER_ID: isModal
          ? state?.customerIDctx
          : location?.state?.[0]?.data?.CUSTOMER_ID ?? "",
        USERNAME: authState?.user?.id ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        REQ_CD: location?.state?.[0]?.data?.REQUEST_ID
          ? location?.state?.[0]?.data?.REQUEST_ID
          : state?.req_cd_ctx || newReqCd,
        WORKING_DATE: authState?.workingDate ?? "",
      }),
    {
      enabled: !!(state?.req_cd_ctx || newReqCd),
    }
  );
  const confirmMutation: any = useMutation(API.ConfirmPendingCustomers, {
    onSuccess: async (data, variables) => {
      setIsOpen(false);
      const confirmed: string = variables?.CONFIRMED;
      const customerID = location?.state?.[0]?.data?.CUSTOMER_ID ?? "";

      const reqId = Boolean(
        variables?.REQUEST_CD && parseInt(variables?.REQUEST_CD)
      )
        ? parseInt(variables?.REQUEST_CD)
        : Boolean(state?.req_cd_ctx && parseInt(state?.req_cd_ctx))
        ? parseInt(state?.req_cd_ctx)
        : "";
      const message =
        confirmed === "Y"
          ? `${t("ConfirmedSuccessfully")} Customer ID - ${customerID}`
          : confirmed === "M"
          ? `${t("SentForModificationSuccessfully")} Request ID - ${reqId}`
          : confirmed === "R"
          ? `${t("RejectedSuccessfully")} Request ID - ${reqId}`
          : "No Message";
      const buttonName = await MessageBox({
        messageTitle: "SUCCESS",
        message: message,
        icon: "SUCCESS",
        buttonNames: ["Ok"],
      });
      if (buttonName === "Ok") {
        onClose();

        CloseMessageBox();
        queryClient.invalidateQueries({
          queryKey: ["ckyc", "getConfirmPendingData"],
        });
      }
    },
    onError: (error: any) => {
      setIsOpen(false);
      setConfirmAction(null);
    },
  });
  const openActionDialog = (state: string) => {
    setIsOpen(true);
    setConfirmAction(state);
  };
  const setCurrentAction = useCallback(
    async (data) => {
      setCurRow(data?.rows?.[0]?.data);
      if (data?.name === "add") {
        setFormmode("new");
        setIsAddNewFormVisible(true);
      } else if (data?.name === "view-details") {
        setFormmode("view");
        setIsAddNewFormVisible(true);
      } else if (data?.name === "close") {
        onClose();
      } else if (data?.name === "Delete") {
        const active = data?.rows?.[0]?.data?.ACTIVE;
        if (active === "N") {
          await MessageBox({
            message: "TDSExemptionDeleteRestrictMsg",
            messageTitle: "Not Allowed",
            icon: "ERROR",
          });
        } else {
          const payload = {
            IsNewRow: formMode === "new" ? true : false,
            REQ_CD: reqCdRef.current,
            REQ_FLAG: location?.state?.[0]?.data?.CUSTOMER_ID ? "E" : "F",
            ENTRY_TYPE: "",
            COMP_CD: authState?.companyID ?? "",
            SAVE_FLAG: "F",
            CUSTOMER_ID: location?.state?.[0]?.data?.CUSTOMER_ID ?? "",
            IS_FROM_TDS_EXEMPTION: reqCdRef.current === "" ? "Y" : "N",
            TDS_EXEMPTION: {
              DETAILS_DATA: {
                isNewRow: [],
                isUpdatedRow: [],
                isDeleteRow: [{ ...data?.rows?.[0]?.data }],
              },
              IsNewRow: formMode === "new" ? true : false,
              REQ_CD: reqCdRef.current,
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: authState?.user?.branchCode ?? "",
            },
          };

          const btnName = await MessageBox({
            message: "deleteTitle",
            messageTitle: "Confirmation",
            buttonNames: ["Yes", "No"],
            icon: "CONFIRM",
            loadingBtnName: ["Yes"],
          });
          if (btnName === "Yes") {
            updateMutation.mutate({
              ...payload,
            });
          }
        }
      } else if (data?.name === "confirm") {
        openActionDialog("Y");
      } else if (data?.name === "reject") {
        openActionDialog("R");
      }
    },
    [navigate]
  );

  useEffect(() => {
    if (newReqCd) {
      TDSExemptionRefetch();
    }
  }, [newReqCd]);
  useEffect(() => {
    TDSExemptionRefetch();
  }, []);
  const updateMutation: any = useMutation(API.SaveTDSExemption, {
    onSuccess: (data) => {
      setIsAddNewFormVisible(false);
      enqueueSnackbar(t("DataDeletedSuccessfully"), { variant: "success" });
      CloseMessageBox();
      TDSExemptionRefetch();
    },
    onError: (error: any) => {
      CloseMessageBox();
    },
  });
  useEffect(() => {
    const isEmpty = (value) =>
      value === null || value === undefined || value === "";

    reqCdRef.current = isEmpty(newReqCd) ? state?.req_cd_ctx : newReqCd;
  }, [newReqCd, state?.req_cd_ctx]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["TDSExemptionDTL"]);
    };
  }, []);

  const closeForm = (reqCd?: string) => {
    setIsAddNewFormVisible(false);
    if (reqCd) {
      setNewReqCd(reqCd);
      reqCdRef.current = reqCd;
      TDSExemptionRefetch();
    }
  };
  const filteredActions =
    docCD === "MST/710"
      ? [
          {
            actionName: "confirm",
            actionLabel: "Confirm",
            multiple: undefined,
            alwaysAvailable: true,
          },
          {
            actionName: "reject",
            actionLabel: "Reject",
            multiple: undefined,
            alwaysAvailable: true,
          },
          {
            actionName: "close",
            actionLabel: "Close",
            multiple: undefined,
            rowDoubleClick: false,
            alwaysAvailable: true,
          },
          // ...actions.filter((action) => action.actionName !== "add"),
        ]
      : actions;
  const renderErrorAlert = (error) => {
    if (!error) return null;

    return (
      <Alert
        severity={error.severity ?? "error"}
        errorMsg={error.error_msg ?? t("Somethingwenttowrong")}
        errorDetail={error.error_detail}
        color="error"
      />
    );
  };

  return (
    <Dialog
      open={open}
      maxWidth="xl"
      PaperProps={{ style: { minWidth: "70%", width: "80%" } }}
    >
      {isTDSExemptionError && (
        <Alert
          severity="error"
          errorMsg={TDSExemptionError?.error_msg ?? t("Somethingwenttowrong")}
          errorDetail={TDSExemptionError?.error_detail}
          color="error"
        />
      )}
      {isTDSExemptionError && renderErrorAlert(TDSExemptionError)}
      {confirmMutation.isError && renderErrorAlert(confirmMutation.error)}
      <GridWrapper
        key={"TDSExeptionGrid" + filteredActions}
        ref={gridRef}
        finalMetaData={tds_exemption_dtl_grid_meta_data as GridMetaDataType}
        data={TDSExemptionData ?? []}
        setData={() => {}}
        loading={isTDSExemptionLoading || isTDSExemptionFetching}
        actions={filteredActions}
        setAction={setCurrentAction}
        refetchData={() => TDSExemptionRefetch()}
      />
      {isAddNewFormVisible && (
        <TdsExemptionFormMain
          closeForm={closeForm}
          defaultView={isModal ? "view" : formMode}
          referenceData={location?.state?.[0]?.data}
          enteredFrom={TDSExemptionData?.[0]?.PARA_28 ?? ""}
          rowData={curRow}
          setFormmode={setFormmode}
          existingReqCd={newReqCd}
          isModal={isModal}
          reqId={state?.req_cd_ctx}
        />
      )}

      {Boolean(confirmAction) && (
        <RemarksAPIWrapper
          TitleText={
            confirmAction === "Y"
              ? "Confirm"
              : confirmAction === "M"
              ? "Raise Query"
              : confirmAction === "R" && "Rejection Reason"
          }
          onActionNo={() => {
            setIsOpen(false);
            setConfirmAction(null);
          }}
          defaultValue={`${
            confirmAction === "Y"
              ? t("APPROVED BY")
              : confirmAction === "M"
              ? t("QUERY RAISED BY")
              : confirmAction === "R"
              ? t("REJECTED BY")
              : ""
          } ${authState?.user?.name?.toUpperCase() ?? ""} ON ${
            authState?.workingDate ?? ""
          }`}
          onActionYes={(val, rows) => {
            confirmMutation.mutate({
              REQUEST_CD: location?.state?.[0]?.data?.REQUEST_ID
                ? location?.state?.[0]?.data?.REQUEST_ID
                : state?.req_cd_ctx,
              REMARKS: val ?? "",
              CONFIRMED: confirmAction,
              REQ_FLAG: location?.state?.[0]?.data?.REQ_FLAG ?? "",
              SCREEN_REF: docCD ?? "",
            });
          }}
          isLoading={confirmMutation.isLoading || confirmMutation.isFetching}
          isEntertoSubmit={true}
          AcceptbuttonLabelText="Ok"
          CanceltbuttonLabelText="Cancel"
          open={isOpen}
          rows={{}}
          maxLength={300}
          showMaxLength={true}
          isRequired={confirmAction === "Y" ? false : true}
        />
      )}
    </Dialog>
  );
};

export default TDSSExemptionComp;
