import {
  ReportGrid,
  Alert,
  utilFunction,
  DefaultErrorObject,
  usePropertiesConfigContext,
  PDFViewer,
} from "@acuteinfo/common-base";
import { useTranslation } from "react-i18next";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { LoaderPaperComponent } from "@acuteinfo/common-base";
import { useLocation } from "react-router-dom";
import { DateRetrievalDialog } from "components/common/custom/dateRetrievalPara";
import { AuthContext } from "pages_audit/auth";
import { getdocCD } from "components/utilFunction/function";
import { getDynMetadata, getReportBlobdata } from "./api";
import RetrieveCompoD from "./retrieveComponent/retrieveCompoD";
import { RetrieveCompoB } from "./retrieveComponent/retrieveCompoB";
import { AuthSDK } from "registry/fns/auth";
import i18n from "components/multiLanguage/languagesConfiguration";
import { Dialog, LinearProgress } from "@mui/material";
import { LinearProgressBarSpacer } from "components/common/custom/linerProgressBarSpacer";
import {
  convertBooleanStrings,
  getFilteredData1234,
  getFilteredDataByScroll,
  normalizeAndFormatDates,
  parseAndReplaceComponents,
  parseAndReplaceDefaultFilter,
} from "./function";
import { AsPerQuery } from "./retrieveComponent/retrieveAsPerQuery";

const CommonReportWrapper = () => {
  const { t } = useTranslation();
  const { authState } = useContext(AuthContext);
  const [metaData, setMetaData] = useState<any>(null);
  const [fileBlob, setFileBlob] = useState<any>(null);
  const onChangeValueRef = useRef<any>({ filterValue: [], filterHeader: "" });
  const [openPrint, setOpenPrint] = useState<any>(null);
  const [req, setReq] = useState<any>({});
  const [defaultFilter, setDefaultFilter] = useState<any>([]);
  const [flag, setFlag] = useState<any>("");
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const customParameter = usePropertiesConfigContext();
  const { dynamicAmountSymbol } = customParameter;
  let title = utilFunction.getDynamicLabel(
    useLocation().pathname,
    authState?.menulistdata,
    true
  );

  // let params = new URL(location?.search);
  //@ts-ignore
  // const reportID = params.get("reportID");
  const reportID = docCD.trim();

  const { data, isLoading, isFetching, isError, error } = useQuery<any, any>(
    ["getStaticReportMetaData", reportID],
    () => getDynMetadata(reportID),
    { retry: false }
  );

  useEffect(() => {
    reportBlobdata.reset();
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
        } else if (convertedData?.retrievalType === "STATIC") {
          convertedData["retrievalComponent"] = RetrieveCompoB;
        } else if (convertedData?.retrievalType === "AS_PER_QUERY") {
          convertedData["retrievalComponent"] = AsPerQuery;
          convertedData["filters"] = data?.[0]?.RETRIEVAL_METADATA;
        } else if (convertedData?.retrievalType === "CUSTOMIZE") {
          convertedData["retrievalComponent"] = RetrieveCompoD;
          convertedData["filters"] = data?.[0]?.RETRIEVAL_METADATA;
        }
      }

      setMetaData({ metaData: convertedData, reportID });
    }
  }, [data, reportID]);

  const reportBlobdata: any = useMutation(getReportBlobdata, {
    onSuccess: (data) => {
      let blobData = utilFunction.blobToFile(data, "");
      if (blobData) {
        setFileBlob(blobData);
        setOpenPrint(true);
      }
    },
    onError: () => {
      setOpenPrint(false);
    },
  });

  const getReportGridData = async (reportId, retrieveReqPara, otherReqPara) => {
    const result = retrieveReqPara?.reduce(
      (acc, curr) => ({ ...acc, [curr.id]: curr.value.value }),
      {}
    );

    const output = normalizeAndFormatDates(result);

    setReq({ REQ_PARA: output, OTHER_REQ_PARA: otherReqPara });

    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher(reportId, {
        ...otherReqPara,
        ...output,
        // ...result,
      });
    if (status === "0") {
      return data;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };
  const onChangeReportData = (filters, queryFilters, _, orignaldata) => {
    if (orignaldata?.length) {
      function generateSummary(data1, data2) {
        let otherFields: any = [];
        const branchSet = new Set(
          orignaldata?.map((item) => item.BRANCH_CD?.trim()).filter(Boolean)
        );

        const branchList = Array.from(branchSet).join(",");

        // Separate out date-related and other fields
        data2.forEach(({ value }) => {
          if (!value?.columnName) return;
          const keyName: any = value.columnName.trim();
          const val: any = value.value?.toString().trim();
          if (Boolean(value?.visibleInRetrieval)) {
            otherFields.push(`${t(keyName)}  ${val}`);
          }
        });

        // Create readable value pairs from data1
        const valuePairs = data1
          .map(({ id, value }) => `${id} ${value?.value}`)
          .join("  ");

        // Combine the sections
        const prefix = [...otherFields].join("  ");
        return `${
          branchList &&
          ` ${branchSet.size === 1 ? "Branch" : "Branche(s)"} ${branchList}  `
        }${prefix} ${
          valuePairs ? `and having starting with values ${valuePairs}` : ""
        }`;
      }

      const result = generateSummary(filters, queryFilters);
      onChangeValueRef.current.filterHeader = result;
      onChangeValueRef.current.filterValue = filters;
    }
  };

  const actions = useMemo(() => {
    const list = [
      {
        buttonName: t("ViewReport"),
        callback: (e, orignaldata, filterdata) => {
          const hasNoFilterAndOriginalData =
            !onChangeValueRef?.current?.filterValue?.length &&
            Array.isArray(orignaldata) &&
            orignaldata?.length;

          const hasFilterAndFilteredData =
            onChangeValueRef?.current?.filterValue?.length &&
            filterdata?.length;

          if (hasNoFilterAndOriginalData || hasFilterAndFilteredData) {
            const apiReq = {
              ...req?.REQ_PARA,
              RESPONSE: filterdata,
              FILTER_VALUE: onChangeValueRef?.current?.filterHeader,
              DYNAMIC_AMT_SYMBOL: dynamicAmountSymbol,
            };

            reportBlobdata.mutate({
              REQ_PARA: apiReq,
              OTHER_REQ_PARA: req?.OTHER_REQ_PARA,
            });
          }
        },
      },
    ];

    if (reportID === "RPT/488") {
      list.push({
        buttonName: flag === "VT" ? t("ViewTally") : t("ViewUnTally"),
        callback: () => {
          setFlag((prev) => (prev === "VT" ? "VU" : "VT"));
        },
      });
    } else if (reportID === "RPT/1234") {
      list.push({
        buttonName: flag === "ALL" ? t("All") : t("OnlyChange"),
        callback: () => {
          setFlag((prev) => (prev === "ALL" ? "OC" : "ALL"));
        },
      });
    }

    return list;
  }, [flag, reportID, req, dynamicAmountSymbol, reportBlobdata]);

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
          {Boolean(fileBlob && fileBlob?.type?.includes("pdf")) &&
            Boolean(openPrint) && (
              <Dialog
                open={true}
                fullWidth={true}
                PaperProps={{
                  style: {
                    maxWidth: "1450px",
                    height: "inherit",
                  },
                }}
              >
                <PDFViewer
                  blob={fileBlob}
                  fileName={title ?? ""}
                  onClose={() => {
                    setFileBlob(null);
                    setOpenPrint(false);
                  }}
                  hideDownloadBtn
                  contentStyle={{
                    padding: "0px 10px",
                    height: "71vh",
                    scrollbarWidth: "none",
                  }}
                />
              </Dialog>
            )}
          {reportBlobdata?.isLoading || reportBlobdata?.isFetching ? (
            <LinearProgress color="secondary" />
          ) : reportBlobdata?.isError ? (
            <Alert
              severity="error"
              errorMsg={
                reportBlobdata?.error?.error_msg || t("Unknownerroroccured")
              }
              errorDetail={reportBlobdata?.error?.error_detail || ""}
            />
          ) : (
            <LinearProgressBarSpacer />
          )}
          <ReportGrid
            reportID={"enfinityReportServiceAPI/GETSTATICREPORTDATA"}
            reportName={"reportID-" + reportID}
            key={"staticReport-" + reportID}
            dataFetcher={getReportGridData}
            metaData={metaData?.metaData}
            // disableFilters
            maxHeight={window.innerHeight - 300}
            title={title}
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
              USERNAME: authState?.user?.id,
              LANG: i18n.resolvedLanguage,
              COMP_CD: authState?.companyID,
              A_COMP_CD: authState?.companyID,
              BRANCH_CD: authState?.user?.branchCode,
              SCREEN_REF: docCD.trim(),
              DOC_CD: docCD.trim(),
              // BRANCH_CD: authState?.user?.branchCode,
            }}
            defaultFilter={defaultFilter}
            autoFetch={metaData?.metaData?.autoFetch ?? true}
            getReportData={onChangeReportData}
            dataTransformer={(data: any) => {
              if (docCD === "RPT/488") {
                const newFilteredData = getFilteredDataByScroll(data, flag);
                return newFilteredData;
              } else if (docCD === "RPT/1234") {
                const newFilteredData = getFilteredData1234(data, flag);
                return newFilteredData;
              }
              return data;
            }}
            actions={actions}
          />
        </>
      )}
    </>
  );
};
export default CommonReportWrapper;
