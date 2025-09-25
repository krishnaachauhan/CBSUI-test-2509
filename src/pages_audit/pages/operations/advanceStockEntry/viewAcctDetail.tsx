import {
  ClearCacheProvider,
  GradientButton,
  LoaderPaperComponent,
  usePopupContext,
} from "@acuteinfo/common-base";
import { useMutation } from "react-query";
import { getCarousalCards, getTabsByParentType } from "../denomination/api";
import { useContext, useEffect, useMemo } from "react";
import { AuthContext } from "pages_audit/auth";
import DailyTransTabs from "../DailyTransaction/TRNHeaderTabs";
import { PaperComponent } from "../DailyTransaction/TRN001/components";
import { Dialog } from "@mui/material";
import { t } from "i18next";

export const ViewAcctDtl = ({ open, reqData, closeDialog }) => {
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  console.log(reqData, "reqData");

  const getAccountDetails: any = useMutation(getCarousalCards, {
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
  const getTabDetails: any = useMutation(getTabsByParentType, {
    onSuccess: (data) => {
      console.log(reqData, "test");

      getAccountDetails.mutate({
        reqData: {
          PARENT_TYPE: "",
          ACCT_TYPE: reqData?.ACCT_TYPE,
          ACCT_CD: reqData?.ACCT_CD,
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        },
      });
    },
    onError: async (error: any) => {
      await MessageBox({
        messageTitle: "ERROR",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
      CloseMessageBox();
    },
  });
  useEffect(() => {
    if (open && reqData) {
      getTabDetails?.mutate({
        reqData: reqData,
      });
    }
  }, [open]);
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

        <GradientButton onClick={closeDialog} color={"primary"}>
          {t("close")}
        </GradientButton>
      </div>
    ),
    []
  );
  return (
    <ClearCacheProvider>
      <Dialog
        className="AcctTab"
        open={open}
        PaperComponent={PaperComponent}
        id="draggable-dialog-title"
        PaperProps={{
          style: {
            width: "100%",
          },
        }}
        maxWidth="xl"
        onKeyUp={(event) => {
          if (event.key === "Escape") {
            closeDialog();
            localStorage.removeItem("commonClass");
          }
        }}
      >
        <div id="draggable-dialog-title" style={{ cursor: "move" }}>
          {getTabDetails?.isLoading || getAccountDetails?.isLoading ? (
            <LoaderPaperComponent />
          ) : (
            <DailyTransTabs
              heading={headingWithButton}
              tabsData={getTabDetails?.data}
              cardsData={getAccountDetails.data}
              reqData={reqData}
              hideCust360Btn={false}
              occupiedHeight={{ min: "387px", max: "387px" }}
              screenFlag="ACCTINQ"
            />
          )}
        </div>
      </Dialog>
    </ClearCacheProvider>
  );
};
