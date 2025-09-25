import {
  ReportGrid,
  Alert,
  components,
  filters,
  ReportWrapper,
} from "@acuteinfo/common-base";
import * as API from "../api";
import { useTranslation } from "react-i18next";
import { useContext, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { LoaderPaperComponent } from "@acuteinfo/common-base";
import { useLocation } from "react-router-dom";
import { DateServiceChannelRetrievalWrapper } from "../reportsRetrieval/dateServiceChannelRetrieval/dateServiceChannelRetrieval";
import { DateRetrievalDialog } from "components/common/custom/dateRetrievalPara";
import { DateUserRetrievalDialog } from "../reportsRetrieval/dateUserRetrieval";
import { AuthContext } from "pages_audit/auth";
import { getdocCD } from "components/utilFunction/function";
import { BranchwiseRetrive } from "../reportsRetrieval/dateServiceChannelRetrieval/BranchWiseList";
import { CustomRetrieval } from "../reportsRetrieval/customRetrieval";
import RetrieveCompoD from "../../jasperReport/commonReport/retrieveComponent/retrieveCompoD";

export const StaticAdminUserReports = () => {
  const { t } = useTranslation();
  const { authState } = useContext(AuthContext);
  const [metaData, setMetaData] = useState<any>(null);
  const [defaultFilter, setDefaultFilter] = useState<any>([]);
  const location = useLocation();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  // let params = new URL(location?.search);
  //@ts-ignore
  // const reportID = params.get("reportID");
  const reportID = docCD;

  const { data, isLoading, isFetching, isError, error } = useQuery<any, any>(
    ["getStaticReportMetaData", reportID],
    () => API.getStaticReportMetaData(reportID),
    { retry: false }
  );

  const convertBooleanStrings = (obj) => {
    if (typeof obj !== "object" || obj === null) return obj;
    const convertedObj = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (typeof value === "object") {
          // Recursively convert nested objects or arrays
          convertedObj[key] = convertBooleanStrings(value);
        } else if (value === "true") {
          convertedObj[key] = true;
        } else if (value === "false") {
          convertedObj[key] = false;
        } else {
          convertedObj[key] = value;
        }
      }
    }
    return convertedObj;
  };

  const parseAndReplaceDefaultFilter = (jsonArray) => {
    return jsonArray.map((item) => {
      // Iterate through each object and its nested 'value' property
      if (item.value) {
        for (let key in item.value) {
          if (item.value.hasOwnProperty(key)) {
            let value = item.value[key];

            // Check and convert string booleans to actual boolean
            if (typeof value === "string" && value.toLowerCase() === "true") {
              item.value[key] = true;
            } else if (
              typeof value === "string" &&
              value.toLowerCase() === "false"
            ) {
              item.value[key] = false;
            }

            // Check for "new Date()" string and replace it with actual Date object
            if (value === "new Date()") {
              item.value[key] = new Date().toString();
            }
          }
        }
      }
      return item;
    });
  };
  const parseAndReplaceComponents = (jsonString) => {
    try {
      // Parse the JSON string into a JavaScript object
      const metadata = jsonString;

      // Map the full component paths to the actual imported components
      const componentMap = {
        "components.DateTimeCell": components.DateTimeCell,
        "components.DateCell": components.DateCell,
        "components.NumberCell": components.NumberCell,
        "components.ButtonRowCell": components.ButtonRowCell,
      };

      const filterMap = {
        "filters.DefaultColumnFilter": filters.DefaultColumnFilter,
        "filters.NumberRangeColumnFilter": filters.NumberRangeColumnFilter,
        "filters.SelectColumnFilter": filters.SelectColumnFilter,
        "filters.SliderColumnFilter": filters.SliderColumnFilter,
      };

      // Replace string component references with actual component imports
      if (Array.isArray(metadata.columns)) {
        metadata.columns = metadata.columns.map((column) => {
          if (
            column.Cell === "components.DateTimeCell" &&
            !Boolean(column?.format)
          ) {
            column["format"] = "dd/MM/yyyy HH:mm:ss";
          }
          if (column.Cell && typeof column.Cell === "string") {
            // Replace with actual component from the map if it exists
            column.Cell = componentMap[column.Cell] || column.Cell;
          }
          if (column.Filter && typeof column.Filter === "string") {
            // Replace with actual component from the map if it exists
            column.Filter = filterMap[column.Filter] || column.Filter;
          }
          if (typeof column.filter === "string") {
            // Convert the string into an actual function
            column.filter = new Function(
              "rows",
              "_",
              "filterValue",
              `
                return (${column.filter})(rows, _, filterValue);
            `
            );
          }
          if (typeof column.shouldExclude === "string") {
            // Convert the string into an actual function
            column.shouldExclude = new Function(
              "...arg", // Spread operator for flexible argument length
              `
                return (${column.shouldExclude})(...arg);
              `
            );
          }
          return column;
        });
      }

      return metadata;
    } catch (error) {
      console.error(
        "Error parsing JSON string or replacing components:",
        error
      );
      return null; // Return null or handle error as needed
    }
  };

  useEffect(() => {
    if (data) {
      if (
        Array.isArray(data?.[0]?.DEFAULT_FILTER) &&
        data?.[0]?.DEFAULT_FILTER.length > 0
      ) {
        let convertedDefaultFilter = parseAndReplaceDefaultFilter(
          data?.[0]?.DEFAULT_FILTER
        );
        setDefaultFilter(convertedDefaultFilter);
      }
      let convertedData = convertBooleanStrings(data?.[0]?.METADATA ?? null);
      convertedData = parseAndReplaceComponents(convertedData);
      if (convertedData?.retrievalType) {
        if (convertedData?.retrievalType === "DATE") {
          convertedData["retrievalComponent"] = DateRetrievalDialog;
        }

        if (
          convertedData?.retrievalType === "DATESERVICE" ||
          convertedData?.retrievalType === "ASONDATESERVICE" ||
          convertedData?.retrievalType === "BALANCEREPORT" ||
          convertedData?.retrievalType === "CREDITBALANCEREPORT" ||
          convertedData?.retrievalType === "GLPLCLOSINGREGISTER"
        ) {
          convertedData["retrievalComponent"] =
            DateServiceChannelRetrievalWrapper;
        } else if (
          convertedData?.retrievalType === "DATELOGINIDREQ" ||
          convertedData?.retrievalType === "DATELOGINID"
        ) {
          convertedData["retrievalComponent"] = DateUserRetrievalDialog;
        } else if (convertedData?.retrievalType === "CUSTOM") {
          convertedData["retrievalComponent"] = CustomRetrieval;
        } else if (convertedData?.retrievalType === "CUSTOMIZE") {
          convertedData["retrievalComponent"] = RetrieveCompoD;
          convertedData["filters"] = data?.[0]?.RETRIEVAL_METADATA;
        } else if (
          convertedData?.retrievalType === "DATERANGEWITHBRANCH" ||
          convertedData?.retrievalType === "DATERANGEWITHACCTTYPE" ||
          convertedData?.retrievalType === "ASONDATEWITHBRANCH" ||
          convertedData?.retrievalType === "ASONDATEWITHACCTTYPE" ||
          convertedData?.retrievalType === "BRANCHWISE" ||
          convertedData?.retrievalType === "ACCTTYPEWISE" ||
          convertedData?.retrievalType === "ASONDATE"
        ) {
          convertedData["retrievalComponent"] = BranchwiseRetrive;
        }
      }
      setMetaData({ metaData: convertedData, reportID });
    }
  }, [data, reportID]);

  return (
    <>
      {isLoading ||
      isFetching ||
      (!isError && !Boolean(metaData?.metaData)) ||
      (!isError && metaData?.reportID !== reportID) ? (
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
          // <AccessDeniedPage />
          <></>
        )
      ) : (
        <>
          {data?.[0]?.ENABLE_PAGINATION === "Y" ? (
            <ReportWrapper
              key={"staticReport-" + reportID}
              reportID={"enfinityReportServiceAPI/GETSTATICREPORTDATA"}
              reportName={"reportID-" + reportID}
              metaData={metaData?.metaData}
              getAPIFn={API.getServerReportData}
              maxHeight={window.innerHeight - 300}
              // onClickActionEvent={() => { }}
              onClickActionEvent={(index, id, data, queryFilters) => {
                if (id === "EMAIL_PREVIEW") {
                }
              }}
              otherAPIRequestPara={{
                DOC_CD: reportID,
                COMP_CD: authState?.companyID,
                // BRANCH_CD: authState?.user?.branchCode,
              }}
              //@ts-ignore
              defaultFilter={defaultFilter}
            />
          ) : (
            <ReportGrid
              reportID={"enfinityReportServiceAPI/GETSTATICREPORTDATA"}
              reportName={"reportID-" + reportID}
              key={"staticReport-" + reportID}
              dataFetcher={API.getReportData}
              metaData={metaData?.metaData}
              // disableFilters
              maxHeight={window.innerHeight - 300}
              title={t(metaData?.metaData?.title)}
              options={{
                disableGroupBy: data.disableGroupBy,
              }}
              hideFooter={metaData?.metaData?.hideFooter}
              hideAmountIn={metaData?.metaData?.hideAmountIn}
              retrievalType={metaData?.metaData?.retrievalType}
              retrievalComponent={metaData?.metaData?.retrievalComponent}
              initialState={{
                groupBy: metaData?.metaData?.groupBy ?? [],
              }}
              otherAPIRequestPara={{
                DOC_CD: reportID,
                COMP_CD: authState?.companyID,
                // BRANCH_CD: authState?.user?.branchCode,
              }}
              autoFetch={metaData?.metaData?.autoFetch ?? true}
            />
          )}
        </>
      )}
    </>
  );
};
