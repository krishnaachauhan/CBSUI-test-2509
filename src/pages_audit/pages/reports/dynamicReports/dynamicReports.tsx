import { useLocation } from "react-router-dom";
import * as API from "../api";
import { useQuery } from "react-query";
import { Box, Typography } from "@mui/material";
import accessDeniedImage from "../../../../assets/images/accessDenied.svg";
import { useTranslation } from "react-i18next";
import {
  Alert,
  LoaderPaperComponent,
  ReportGrid,
  RetrievalParametersProps,
} from "@acuteinfo/common-base";
import { DateRetrievalDialog } from "components/common/custom/dateRetrievalPara";
import { DateServiceChannelRetrievalWrapper } from "../reportsRetrieval/dateServiceChannelRetrieval/dateServiceChannelRetrieval";
import { DateUserRetrievalDialog } from "../reportsRetrieval/dateUserRetrieval";
import { CustomRetrieval } from "../reportsRetrieval/customRetrieval";
import { BranchwiseRetrive } from "../reportsRetrieval/dateServiceChannelRetrieval/BranchWiseList";
import { ComponentType } from "react";

export const DynamicReports = () => {
  const location = useLocation();
  const { search } = location;
  let params = new URLSearchParams(search);
  const reportID = params.get("reportID");

  const { data, isLoading, isFetching, isError, error } = useQuery<any, any>(
    ["getDynamicReportMetaData", reportID],
    () => API.getDynamicReportMetaData(reportID),
    { retry: false }
  );

  const asRetrievalComponent = (
    Comp: any
  ): ComponentType<RetrievalParametersProps> => Comp;

  const getRetrievalComponent = (
    retrievalType: string | undefined
  ): ComponentType<RetrievalParametersProps> | undefined => {
    switch (retrievalType) {
      case "DATE":
        return asRetrievalComponent(DateRetrievalDialog);

      case "DATESERVICE":
      case "ASONDATESERVICE":
      case "BALANCEREPORT":
      case "CREDITBALANCEREPORT":
      case "GLPLCLOSINGREGISTER":
        return asRetrievalComponent(DateServiceChannelRetrievalWrapper);

      case "DATELOGINID":
      case "DATELOGINIDREQ":
        return asRetrievalComponent(DateUserRetrievalDialog);

      case "CUSTOM":
        return asRetrievalComponent(CustomRetrieval);

      case "DATERANGEWITHBRANCH":
      case "DATERANGEWITHACCTTYPE":
      case "ASONDATEWITHBRANCH":
      case "ASONDATEWITHACCTTYPE":
      case "BRANCHWISE":
      case "ACCTTYPEWISE":
      case "ASONDATE":
        return asRetrievalComponent(BranchwiseRetrive);

      default:
        return undefined;
    }
  };

  return (
    <>
      {isLoading || isFetching ? (
        <LoaderPaperComponent />
      ) : isError ? (
        !error?.error_msg.includes("403") ? (
          <Alert
            severity="error"
            errorMsg={error?.error_msg ?? "Error"}
            errorDetail={""}
            color="error"
          />
        ) : (
          <AccessDeniedPage />
        )
      ) : (
        <ReportGrid
          reportID={"/enfinityReportServiceAPI/GETDYNAMICREPORTDATA"}
          reportName={"reportID-" + reportID}
          key={"dynamicReport_reportID_" + reportID}
          dataFetcher={
            data?.retrievalType === "CUSTOM"
              ? API.getCustomRetrievalReportData
              : API.getReportData
          }
          metaData={data}
          // disableFilters
          maxHeight={window.innerHeight - 250}
          title={data.title}
          options={{
            disableGroupBy: data.disableGroupBy,
          }}
          hideFooter={data.hideFooter}
          hideAmountIn={data.hideAmountIn}
          retrievalType={data.retrievalType}
          retrievalComponent={getRetrievalComponent(data?.retrievalType)}
          autoFetch={data?.filters?.fields?.length > 0 ? false : true}
          otherAPIRequestPara={{ TRAN_CD: reportID }}
        />
      )}
    </>
  );
};

const AccessDeniedPage = () => {
  const { t } = useTranslation();
  return (
    <Box>
      <img
        src={accessDeniedImage}
        style={{ aspectRatio: "2/0.8" }}
        alt="access-denied"
      />
      <Typography variant="h4" fontWeight={700} textAlign={"center"}>
        {t("AccessDenied")}
      </Typography>
    </Box>
  );
};
