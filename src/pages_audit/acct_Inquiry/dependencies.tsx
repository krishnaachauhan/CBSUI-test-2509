import { useContext } from "react";
import { Dialog } from "@mui/material";
import * as API from "./api";
import { DependenciesData } from "./metaData";
import { AuthContext } from "pages_audit/auth";
import { t } from "i18next";
import { ReportGrid } from "@acuteinfo/common-base";
const Dependencies = ({ open, onClose, rowsData, screenRef }) => {
  const { authState } = useContext(AuthContext);
  return (
    <Dialog
      open={open}
      fullWidth
      PaperProps={{
        style: {
          maxWidth: "1200px",
        },
      }}
    >
      <div style={{ padding: "8px" }}>
        <ReportGrid
          reportID={"CUSTOMERDEPENDENCYDTL"}
          reportName={"reportID-" + "getDependenciesData"}
          dataFetcher={API.getDependenciesData}
          metaData={DependenciesData}
          title={`${t("DetailsofCustomer_id")} : ${
            rowsData?.[0]?.data?.CUSTOMER_ID
          }`}
          onClose={onClose}
          hideFooter={DependenciesData.hideFooter}
          hideAmountIn={DependenciesData.hideAmountIn}
          // retrievalType={data.retrievalType}
          // autoFetch={data?.filters?.fields?.length > 0 ? false : true}
          otherAPIRequestPara={{
            CUSTOMER_ID: rowsData?.[0]?.data?.CUSTOMER_ID,
            COMP_CD: authState.companyID,
            WORKING_DATE: authState?.workingDate ?? "",
            USERNAME: authState?.user?.id ?? "",
            SCREEN_REF: screenRef,
          }}
        />
      </div>
    </Dialog>
  );
};
export default Dependencies;
