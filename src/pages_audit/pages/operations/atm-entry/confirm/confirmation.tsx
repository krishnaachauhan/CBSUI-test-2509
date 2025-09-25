import React, { useContext, useEffect } from "react";
import CommonForm from "../commonForm/commonForm";
import {
  Alert,
  ClearCacheProvider,
  LoaderPaperComponent,
} from "@acuteinfo/common-base";
import { useNavigate } from "react-router-dom";
import { getParameter } from "../api";
import { AuthContext } from "pages_audit/auth";
import { useQuery } from "react-query";
import { AppBar } from "@mui/material";
import { t } from "i18next";

const Confirmation = () => {
  const { authState } = useContext(AuthContext);
  const { data, isLoading, isSuccess, isError, error } = useQuery<any, any>(
    ["GETATMREGPARA"],
    () =>
      getParameter({
        A_ENT_BRANCH: authState?.user?.branchCode,
        A_ENT_COMP: authState?.companyID,
      })
  );
  const navigate = useNavigate();
  useEffect(() => {
    navigate("retrieve-cfm-form");
  }, []);
  return (
    <>
      {isLoading ? (
        <LoaderPaperComponent />
      ) : isError ? (
        <AppBar position="relative" color="primary">
          <Alert
            severity="error"
            errorMsg={error?.error_msg ?? t("UnknownErrorOccured")}
            errorDetail={error?.error_detail ?? ""}
            color="error"
          />
        </AppBar>
      ) : isSuccess ? (
        <ClearCacheProvider>
          <CommonForm parameter={{ ...data?.[0], FLAG: "C" }} />
        </ClearCacheProvider>
      ) : null}
    </>
  );
};
export default Confirmation;
