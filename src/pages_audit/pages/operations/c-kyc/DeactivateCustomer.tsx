import React, { useState, useEffect, useCallback, useContext } from "react";
import { AppBar, Dialog, IconButton } from "@mui/material";
import * as API from "./api";
import { AuthContext } from "pages_audit/auth";
import { useMutation, useQuery } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import Dependencies from "pages_audit/acct_Inquiry/dependencies";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import {
  usePopupContext,
  Alert,
  LoaderPaperComponent,
  ActionTypes,
  queryClient,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
import i18n from "components/multiLanguage/languagesConfiguration";

export const DeactivateCustomer = ({ rowdata, onClose }) => {
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [dependecyDialogOpen, setDependecyDialogOpen] = useState(false);
  const { state: data } = useLocation();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  // console.log("::stateeee", data)
  const {
    data: inactivateCustData,
    isError: isinactivateCustError,
    error: InactivateCustError,
    isLoading: isinactivateCustLoading,
    refetch: inactivateCustRefetch,
  } = useQuery<any, any>(
    ["DeactivateCustomer", { data }],
    () =>
      API.validateActiveField({
        COMP_CD: authState?.companyID ?? "",
        CUSTOMER_ID: data?.[0]?.data?.CUSTOMER_ID ?? "", // mutation?.data?.[0]?.CUSTOMER_ID ??
        USER_NAME: authState?.user?.id ?? "",
        DISPLAY_LANGUAG: i18n.resolvedLanguage,
        // ACCT_TYPE: "143 ",
        // ACCT_CD: "000039",
        // AS_FROM: "C"
      }),
    {
      onSuccess: async (data) => {
        const messagebox = async (msgTitle, msg, buttonNames, status) => {
          let buttonName = await MessageBox({
            messageTitle: msgTitle,
            message: msg,
            buttonNames: buttonNames,
            icon:
              status === "9"
                ? "WARNING"
                : status === "99"
                ? "CONFIRM"
                : status === "999"
                ? "ERROR"
                : status === "0"
                ? "SUCCESS"
                : "WARNING",
          });
          return { buttonName, status };
        };
        if (Array.isArray(data) && data?.length > 0) {
          for (let i = 0; i < data?.length; i++) {
            if (data[i]?.STATUS !== "0") {
              let btnName = await messagebox(
                data[i]?.O_MSG_TITLE ?? data[i]?.STATUS === "999"
                  ? "ValidationFailed"
                  : data[i]?.STATUS === "99"
                  ? "Confirmation"
                  : data[i]?.STATUS === "9"
                  ? "Alert"
                  : "",
                data[i]?.MSG ?? "",
                data[i]?.STATUS === "99" ? ["Yes", "No"] : ["Ok"],
                data[i]?.STATUS
              );
              if (btnName?.status === "999" || btnName?.buttonName === "No") {
                setDependecyDialogOpen(true);
                CloseMessageBox();
              }
            } else {
              onClose();
              CloseMessageBox();
            }
          }
        }
      },
    }
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["DeactivateCustomer"]);
    };
  }, []);

  return (
    <React.Fragment>
      {dependecyDialogOpen && (
        <Dependencies
          rowsData={data}
          open={dependecyDialogOpen}
          screenRef={docCD}
          onClose={() => {
            setDependecyDialogOpen(false);
            onClose();
          }}
        />
      )}
      <Dialog
        open={true}
        maxWidth="lg"
        PaperProps={{
          style: {
            minWidth: "70%",
            width: "80%",
            // maxWidth: "90%",
          },
        }}
      >
        {isinactivateCustLoading ? (
          <div style={{ height: 100, paddingTop: 10 }}>
            <div style={{ padding: 10 }}>
              <LoaderPaperComponent />
            </div>
            {typeof onClose === "function" ? (
              <div style={{ position: "absolute", right: 0, top: 0 }}>
                <IconButton onClick={onClose}>
                  <HighlightOffOutlinedIcon />
                </IconButton>
              </div>
            ) : null}
          </div>
        ) : (
          isinactivateCustError && (
            <div
              style={{
                paddingRight: "10px",
                paddingLeft: "10px",
                height: 100,
                paddingTop: 10,
              }}
            >
              <AppBar position="relative" color="primary">
                <Alert
                  severity="error"
                  errorMsg={InactivateCustError?.error_msg ?? "Unknown Error"}
                  errorDetail={InactivateCustError?.error_detail ?? ""}
                  color="error"
                />
                {typeof onClose === "function" ? (
                  <div style={{ position: "absolute", right: 0, top: 0 }}>
                    <IconButton onClick={onClose}>
                      <HighlightOffOutlinedIcon />
                    </IconButton>
                  </div>
                ) : null}
              </AppBar>
            </div>
          )
        )}
      </Dialog>
    </React.Fragment>
  );
};
