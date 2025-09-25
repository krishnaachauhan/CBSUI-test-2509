import {
  DefaultErrorObject,
  components,
  filters,
} from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";
import { GeneralAPI } from "registry/fns/functions/general";
import { format } from "date-fns";

export const GetMiscValue = (categoryCode) =>
  GeneralAPI.GetMiscValue(categoryCode);
export const getBranchList = async (reqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETBRANCHLISTRPT", {
      ...reqPara,
    });
  if (status === "0") {
    let responseData = data;

    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ BRANCH_CD, BRANCH_NM, ...other }) => {
        return {
          value: BRANCH_CD,
          label: BRANCH_NM,
          ...other,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getStaticReportMetaData = async (docCode) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSTATICMETADA", {
      DOC_CD: docCode,
    });
  if (status === "0") {
    return data;

    // return [
    //   {
    //     ENABLE_PAGINATION: "N",
    //     DEFAULT_FILTER: [],
    //     METADATA: {
    //       disableGroupBy: "true",
    //       retrievalType: "DATELOGINID",
    //       hideAmountIn: "true",
    //       autoFetch: "false",
    //       columns: [
    //         {
    //           accessor: "START_DT",
    //           width: "150",
    //           type: "default",
    //           columnName: "RegDate",
    //         },
    //         {
    //           accessor: "COMP_CD",
    //           width: "140",
    //           type: "default",
    //           columnName: "LoginID",
    //         },
    //         {
    //           accessor: "BRANCH_CD",
    //           width: "250",
    //           type: "default",
    //           columnName: "CustomerName",
    //         },
    //         {
    //           accessor: "TRAN_CD",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "DEACTIVE_DATE",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "ENTRY_DT",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "ENTRY_DT1",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "DESCRIPTION",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "EXECUTE_DAY",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "COMP_CD_1",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "BRANCH_CD_1",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "TRAN_CD_1",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "SR_CD",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "LINE_ID",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "VALID_UPTO",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "DR_ACCT_TYPE",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "DR_ACCT_CD",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "CR_ACCT_CD",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "CR_COMP_CD",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "CR_BRANCH_CD",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "CR_ACCT_TYPE",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "CR_ACCT_CD1",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "SI_AMOUNT",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "REMARKS",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "CONFIRMED",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "ACCT_NM",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "DR_ACCT_NM",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "FEQ_TYPE",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "FEQ_VALUE",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "DOC_STATUS",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "ENTERED_BY",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "DEACTIVE_BY",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //         {
    //           accessor: "VERIFIED_BY",
    //           width: "120",
    //           columnName: "RegWith",
    //         },
    //       ],
    //       hideFooter: "false",
    //       title: "SI reg",
    //     },
    //   },
    // ];
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getDynamicReportMetaData = async (reportID) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDYNAMICREPORTMETADATA", {
      TRAN_CD: reportID,
    });
  if (status === "0") {
    let columns = data[0].COLUMNS.map((one) => {
      let comumn: any = {
        columnName: one.COLUMN_NAME,
        accessor: one.COLUMN_ACCESSOR,
        Filter:
          one.COLUMN_FILTER_TYPE === "SELECT"
            ? filters.SelectColumnFilter
            : one.COLUMN_FILTER_TYPE === "SLIDER"
            ? filters.SliderColumnFilter
            : filters.DefaultColumnFilter,
        width: one.COLUMN_WIDTH,
        isHiddenColumn:
          one.IS_VISIBLE === "N" || one.IS_VISIBLE === false ? true : false,
      };
      if (one.COLUMN_TYPE === "DATE") {
        comumn = { ...comumn, Cell: components.DateCell };
      } else if (one.COLUMN_TYPE === "DATETIME") {
        comumn = { ...comumn, Cell: components.DateTimeCell };
      } else if (one.COLUMN_TYPE === "AMOUNT") {
        comumn = {
          ...comumn,
          isTotalWithCurrency: true,
          Cell: components.NumberCell,
          alignment: "right",
        };
      } else if (one.COLUMN_TYPE === "NUMBER") {
        comumn = {
          ...comumn,
          alignment: "right",
        };
      }
      return comumn;
    });
    let filter = data[0].FILTER.map((one) => {
      const required =
        one.IS_REQUIRED === "Y" || one.IS_REQUIRED === true ? true : false;
      return {
        render: {
          componentType: one.COLUMN_TYPE,
        },
        name: one.COLUMN_ACCESSOR,
        label: one.COLUMN_NAME,
        required: required,
        placeholder: `Enter ${one.COLUMN_NAME}`,
        sequence: one.WHERE_SEQ_ID,
        defaultValue:
          one.COLUMN_TYPE === "datePicker" ||
          one.COLUMN_TYPE === "datetimePicker"
            ? new Date(one.DEFAULT_VALUE || Date.now())
            : one.DEFAULT_VALUE,
        format: Boolean(one.COLUMN_FORMAT)
          ? one.COLUMN_FORMAT
          : one.COLUMN_TYPE === "datePicker"
          ? "dd/MM/yyyy"
          : one.COLUMN_TYPE === "datetimePicker"
          ? "dd/MM/yyyy HH:mm:ss"
          : "",
        ...(required
          ? {
              schemaValidation: {
                type: "string",
                rules: [{ name: "required", params: ["ThisFieldisrequired"] }],
              },
            }
          : {}),

        GridProps: {
          xs: 12,
          md: one.COLUMN_WIDTH || 6,
          sm: one.COLUMN_WIDTH || 6,
        },
      };
    });
    filter.sort((a, b) => a.sequence - b.sequence);
    let result = {
      title: data[0].TITLE,
      disableGroupBy: data[0].DISABLE_GROUP_BY,
      hideFooter:
        data[0].HIDE_FOOTER === "Y" || data[0].HIDE_FOOTER === true
          ? true
          : false,
      hideAmountIn: data[0].HIDE_AMOUNT_IN,
      retrievalType: data[0].RETRIEVAL_TYPE,
      columns: columns,
      filters: {
        form: {
          name: "dynamicReport",
          label: "RetrievalParameters",
          resetFieldOnUnmount: false,
          validationRun: "onBlur",
          submitAction: "home",
          render: {
            ordering: "auto",
            renderType: "simple",
            gridConfig: {
              item: {
                xs: 12,
                sm: 4,
                md: 4,
              },
              container: {
                direction: "row",
                spacing: 0.5,
              },
            },
          },
          componentProps: {
            textField: {
              fullWidth: true,
            },
            select: {
              fullWidth: true,
            },
            datePicker: {
              fullWidth: true,
            },
            numberFormat: {
              fullWidth: true,
            },
            inputMask: {
              fullWidth: true,
            },
            datetimePicker: {
              fullWidth: true,
            },
          },
        },
        fields: filter,
      },
    };
    return result;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getReportData = async (reportID, filter, otherAPIRequestPara) => {
  const newData: any = {};
  filter.forEach((item) => {
    newData[item.id] = item.value.value;
  });
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(
      reportID,
      {
        A_FROM_DT: format(new Date(), "dd/MM/yyyy"),
        A_TO_DT: format(new Date(), "dd/MM/yyyy"),
        // A_CUSTOM_USER_NM: "",
        // USER_NAME: newData?.A_CUSTOM_USER_NM ?? "",
        // A_TRN_TYPE: "",
        // A_STATUS: "ALL",
        // A_FR_AMT: "",
        // A_TO_AMT: "",
        // V_CHANNEL: "ALL",
        // CHANNEL: "ALL",
        // BILLER_ID: "",
        // SUB_CATEGORY_ID: "",
        // A_MER_TRAN_CD: "",
        // A_FLAG:
        //   reportID === "OTPSMS" || reportID === "MOBILEEMAILSMS"
        //     ? "ALL"
        //     : "DATE",
        // A_KEY: "ALL",
        // A_FILTER_VALUE: "ALL",
        // A_PAGE_NO: "",
        // A_PAGE_SIZE: "",
        // TRN_TYPE: "ALL",
        // A_PRODUCT_TYPE: "BOTH",
        ...newData,
        ...otherAPIRequestPara,
      },
      { COMPRESSED: "Y" },
      300000
    );
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getServerReportData = async ({
  reportID,
  APIRequestPara,
  abortAPICall,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(
      reportID,
      APIRequestPara,
      {
        COMPRESSED: "Y",
      },
      300000,
      abortAPICall
    );
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getCustomRetrievalReportData = async (
  reportID,
  filter,
  otherAPIRequestPara
) => {
  const newData: any = {};
  filter.forEach((item) => {
    newData[item.id] = item.value.value;
  });
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(
      reportID,
      {
        // ...filter?.[0],
        ...newData,
        ...otherAPIRequestPara,
      },
      { COMPRESSED: "Y" }
    );
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
