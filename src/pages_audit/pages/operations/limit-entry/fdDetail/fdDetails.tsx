import React, { useContext, useEffect, useState } from "react";
import { useMutation } from "react-query";
import { getLimitFDdetail } from "../api";
import { AppBar, Dialog } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import { fdDetailGridData } from "./fdDetailsGridMetaData";
import { useTranslation } from "react-i18next";
import {
  usePopupContext,
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  queryClient,
} from "@acuteinfo/common-base";
import { useDialogContext } from "../../payslip-issue-entry/DialogContext";

export const FdDetails = ({ navigate, myMasterRef }) => {
  const fdAction: ActionTypes[] = [
    {
      actionName: "close",
      actionLabel: "Close",
      multiple: false,
      rowDoubleClick: false,
      alwaysAvailable: true,
    },
  ];
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [openDialog, setOpenDialg] = useState<boolean>(false);
  const { trackDialogClass } = useDialogContext();
  const fdDetail: any = useMutation("getLimitFDdetail", getLimitFDdetail, {
    onSuccess: (data) => {
      CloseMessageBox();
      if (data?.[0]?.MESSAGE) {
        navigate(".");
        MessageBox({
          messageTitle: "AccountDescription",
          message: data?.[0]?.MESSAGE,
        });
      } else {
        setOpenDialg(true);
      }
    },
  });

  useEffect(() => {
    async function apiCall() {
      let buttonName = await MessageBox({
        messageTitle: "confirmation",
        message: `Press 'Yes' - to view Lien Marked FD(s) against this A/c.\nPress 'No' - to view all the FD(s) of  this Customer.`,
        buttonNames: ["Yes", "No", "Cancel"],
        loadingBtnName: ["Yes", "No"],
        icon: "CONFIRM",
      });
      if (buttonName === "Yes" || buttonName === "No") {
        trackDialogClass("main");
        myMasterRef?.current?.getFieldData().then((res) => {
          if (res?.ACCT_CD && res?.ACCT_TYPE && res?.BRANCH_CD) {
            fdDetail.mutate({
              COMP_CD: authState?.companyID,
              ACCT_CD: res?.ACCT_CD,
              ACCT_TYPE: res?.ACCT_TYPE,
              BRANCH_CD: res?.BRANCH_CD,
              LOGIN_COMP_CD: authState?.companyID,
              FLAG:
                buttonName === "Yes" ? "L" : buttonName === "No" ? "C" : null,
            });
          }
        });

        // CloseMessageBox();
      } else {
        trackDialogClass("main");
        navigate(".");
      }
    }
    apiCall();
  }, []);

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getLimitFDdetail"]);
    };
  }, []);
  return (
    <>
      <Dialog
        open={openDialog}
        fullWidth={true}
        PaperProps={{
          style: {
            maxWidth: "1095px",
            padding: "5px",
          },
        }}
      >
        <>
          {fdDetail.isError && (
            <AppBar position="relative" color="primary">
              <Alert
                severity="error"
                errorMsg={fdDetail?.error?.error_msg ?? "Unknow Error"}
                errorDetail={fdDetail?.error?.error_detail ?? ""}
                color="error"
              />
            </AppBar>
          )}
          <GridWrapper
            key={`fd-Detail-GridData`}
            finalMetaData={fdDetailGridData as GridMetaDataType}
            data={fdDetail.data ?? []}
            setData={() => {}}
            loading={fdDetail.isLoading}
            actions={fdAction}
            setAction={() => {
              navigate(".");
            }}
          />
        </>
      </Dialog>
    </>
  );
};
