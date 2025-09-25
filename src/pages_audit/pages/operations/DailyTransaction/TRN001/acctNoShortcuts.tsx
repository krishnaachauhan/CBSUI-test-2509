import {
  GradientButton,
  LoaderPaperComponent,
  usePopupContext,
} from "@acuteinfo/common-base";
import { Dialog } from "@mui/material";
import DailyTransTabs from "../TRNHeaderTabs";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";
import { useContext, useEffect, useMemo } from "react";
import { AuthContext } from "pages_audit/auth";
import { TRN001Context } from "./Trn001Reducer";
import { t } from "i18next";
import { useMutation } from "react-query";
import * as API from "../TRNCommon/api";
import SearchAcctGridMain from "components/common/custom/searchAccountMaster";
import AcctMSTProvider from "../../acct-mst/AcctMSTContext";
import AcctMST from "../../acct-mst/AcctMST";
import JointDetails from "../TRNHeaderTabs/JointDetails";
import PhotoSignWithHistory from "components/common/custom/photoSignWithHistory/photoSignWithHistory";
import AcctModal from "../../acct-mst/AcctModal";

export const handleShortcuts = (event, induvidualUpdate, row, state) => {
  const { key, ctrlKey, shiftKey } = event;

  if (key === "F5") {
    event.preventDefault();
    induvidualUpdate(true, "isSearchAcctOpen");
  }

  if (key === "F6") {
    event.preventDefault();
    if (Boolean(state?.reqData?.ACCT_CD)) {
      induvidualUpdate(true, "isAcctMst");
    }
  }
  if (key === "F9") {
    event.preventDefault();
    if (Boolean(state?.reqData?.ACCT_CD)) {
      induvidualUpdate(true, "isPhotoSignature");
    }
  }

  if (key === "F4" && shiftKey) {
    event.preventDefault();
    if (Boolean(state?.reqData?.ACCT_CD)) {
      induvidualUpdate(true, "open360");
    }
  }

  if (key?.toLowerCase() === "j" && ctrlKey) {
    event.preventDefault();
    if (Boolean(state?.reqData?.ACCT_CD)) {
      induvidualUpdate(true, "isJointDtlOpen");
    }
  }
};

const AcctNoShortcuts = ({ state, unqId }) => {
  const { induvidualUpdate, handleAcctNoChange } = useContext(TRN001Context);
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  let currentPath = useLocation()?.pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const row = state?.rows?.find((row) => row?.unqID === unqId);

  const getAccountDetails: any = useMutation(API?.getCarousalCards, {
    onSuccess: (data) => {},
    onError: async (error: any) => {
      await MessageBox({
        messageTitle: "ERROR",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
      CloseMessageBox();
    },
  });
  const getTabDetails: any = useMutation(API?.getTabsByParentType, {
    onSuccess: (data) => {},
    onError: async (error: any) => {
      await MessageBox({
        messageTitle: "ERROR",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
      CloseMessageBox();
    },
  });

  const req = {
    COMP_CD: state?.reqData?.COMP_CD ?? "",
    ACCT_TYPE: state?.reqData?.ACCT_TYPE ?? "",
    ACCT_CD: state?.reqData?.ACCT_CD ?? "",
    BRANCH_CD: state?.reqData?.BRANCH_CD ?? "",
    PARENT_TYPE: state?.reqData?.PARENT_TYPE ?? "",
    PARENT_CODE: state?.reqData?.PARENT_CODE ?? "",
    SCREEN_REF: docCD ?? "",
  };

  useEffect(() => {
    if (Boolean(state?.open360)) {
      getTabDetails?.mutate({
        reqData: req,
      });
      getAccountDetails?.mutate({ reqData: req });
    }
  }, [state?.open360]);

  const headingWithButton: any = useMemo(
    () => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: "-1",
        }}
      >
        {"Account Details"}

        <GradientButton
          onClick={() => induvidualUpdate(false, "open360")}
          color={"primary"}
        >
          {t("close")}
        </GradientButton>
      </div>
    ),
    []
  );
  return (
    <>
      {Boolean(state?.open360) ? (
        <Dialog
          open={state?.open360}
          onClose={() => induvidualUpdate(false, "open360")}
          PaperProps={{
            style: {
              width: "100%",
            },
          }}
          maxWidth="xl"
        >
          {getAccountDetails?.isLoading || getTabDetails?.isLoading ? (
            <LoaderPaperComponent />
          ) : (
            <DailyTransTabs
              heading={headingWithButton}
              tabsData={getTabDetails?.data}
              cardsData={getAccountDetails?.data}
              reqData={req}
              hideCust360Btn={false}
              occupiedHeight={{ min: "327px", max: "327px" }}
              screenFlag="ACCTINQ"
            />
          )}
        </Dialog>
      ) : null}
      {Boolean(state?.isSearchAcctOpen) ? (
        <SearchAcctGridMain
          open={state?.isSearchAcctOpen}
          close={(data) => {
            induvidualUpdate(false, "isSearchAcctOpen");
            handleAcctNoChange({
              updUnqId: row?.unqID,
              value: data?.trim(),
            });
          }}
          reqPara={req}
        />
      ) : null}
      {Boolean(state?.isAcctMst) ? (
        <Dialog
          open={state?.isAcctMst}
          onClose={() => induvidualUpdate(false, "isAcctMst")}
          PaperProps={{
            style: {
              width: "100%",
            },
          }}
          maxWidth="xl"
        >
          <AcctMSTProvider>
            <AcctModal
              onClose={() => induvidualUpdate(false, "isAcctMst")}
              asDialog={false}
              rowData={req}
              formmodeState="view"
              fromState="pending-entry"
            />
          </AcctMSTProvider>
        </Dialog>
      ) : null}

      {Boolean(state?.isPhotoSignature) ? (
        <PhotoSignWithHistory
          data={{
            COMP_CD: state?.reqData?.COMP_CD ?? "",
            ACCT_TYPE: state?.reqData?.ACCT_TYPE ?? "",
            ACCT_CD: state?.reqData?.ACCT_CD ?? "",
            BRANCH_CD: state?.reqData?.BRANCH_CD ?? "",
          }}
          onClose={() => induvidualUpdate(false, "isPhotoSignature")}
          screenRef={docCD}
        />
      ) : null}
      {Boolean(state?.isJointDtlOpen) ? (
        <Dialog
          open={state?.isJointDtlOpen}
          onClose={() => {
            induvidualUpdate(false, "isJointDtlOpen");
          }}
          PaperProps={{
            style: {
              width: "100%",
            },
          }}
          maxWidth="xl"
        >
          <JointDetails
            hideHeader={false}
            reqData={{
              ...req,
              BTN_FLAG: "Y",
            }}
            height={"350px"}
            closeDialog={() => induvidualUpdate(false, "isJointDtlOpen")}
          />
        </Dialog>
      ) : null}
    </>
  );
};

export default AcctNoShortcuts;
