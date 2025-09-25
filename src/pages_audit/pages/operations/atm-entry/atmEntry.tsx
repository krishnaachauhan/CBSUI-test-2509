import { AppBar } from "@mui/material";
import React, { useContext } from "react";
import { AuthContext } from "pages_audit/auth";
import { useQuery } from "react-query";
import { getParameter } from "./api";
import { t } from "i18next";
import CommonForm from "./commonForm/commonForm";
import {
  LoaderPaperComponent,
  ClearCacheProvider,
  Alert,
} from "@acuteinfo/common-base";
import { commonFormMetaData } from "./commonForm/commonFormMetadata";

const AtmEntryCustom = ({ parameter }) => {
  commonFormMetaData.detailsGrid.gridConfig.containerHeight =
    parameter?.PARA_602 === "Y"
      ? { min: "calc(100vh - 498px)", max: "calc(100vh - 498px)" }
      : { min: "calc(100vh - 547px)", max: "calc(100vh - 547px)" };

  return (
    <>
      <CommonForm parameter={parameter} />
    </>
  );
};

export const AtmEntry = () => {
  const { authState } = useContext(AuthContext);
  const { data, isLoading, isSuccess, isError, error } = useQuery<any, any>(
    ["GETATMREGPARA"],
    () =>
      getParameter({
        A_ENT_BRANCH: authState?.user?.branchCode,
        A_ENT_COMP: authState?.companyID,
      })
  );

  return (
    <ClearCacheProvider>
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
        <AtmEntryCustom parameter={data?.[0]} />
      ) : null}
    </ClearCacheProvider>
  );
};
