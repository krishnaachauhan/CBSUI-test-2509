import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getAccountInquiry =
  ({ reqPara }) =>
  async (fromNo, toNo, sortBy, filterBy, abort) => {
    let A_PARA: any[] = [];
    if (!reqPara?.SELECT_COLUMN) return;
    Object.keys(reqPara?.SELECT_COLUMN).forEach((fieldKey) => {
      A_PARA.push({
        COL_NM: fieldKey,
        COL_VAL: reqPara?.SELECT_COLUMN[fieldKey],
      });
    });

    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher(
        "GETACCTINQUIRY",
        {
          COMP_CD: reqPara?.COMP_CD ?? "",
          DEFALUT_VIEW: reqPara?.DEFALUT_VIEW ?? "",
          A_PARA,
          FROM_ROW: fromNo,
          TO_ROW: toNo,
          ORDERBY: sortBy?.[0]?.ACCESSOR
            ? `${sortBy?.[0]?.ACCESSOR} ${sortBy?.[0]?.VALUE}`
            : "",
        },
        {},
        null,
        abort
      );
    if (status === "0") {
      const dataStatus = data;
      dataStatus.map((item) => {
        if (item?.DISPLAY_STATUS === "CLOSED") {
          item._rowColor = "rgb(152 59 70 / 61%)";
        }
        if (item?.DISPLAY_STATUS === "FREEZED") {
          item._rowColor = "rgb(40 142 159 / 60%)";
        }
        if (item?.DISPLAY_STATUS === "UNCLAIMED") {
          item._rowColor = "rgb(9 132 3 / 51%)";
        }
      });
      return [
        {
          REPORT_DATA: dataStatus,
          COUNT: dataStatus?.[0]?.TOTAL_COUNT ?? toNo + 1,
        },
      ];
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };

export const getCustomer360Data =
  ({ reqPara }) =>
  async (fromNo, toNo, sortBy, filterBy, abort) => {
    if (!reqPara?.SELECT_COLUMN) return;
    let A_PARA: any[] = [];
    Object.keys(reqPara?.SELECT_COLUMN).forEach((fieldKey) => {
      A_PARA.push({
        COL_NM: fieldKey,
        COL_VAL: reqPara?.SELECT_COLUMN[fieldKey],
      });
    });
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher(
        "GETCUSTINQUIRY",
        {
          COMP_CD: reqPara?.COMP_CD ?? "",
          DEFALUT_VIEW: reqPara?.DEFALUT_VIEW ?? "",
          A_PARA,
          FROM_ROW: fromNo,
          TO_ROW: toNo,
          ORDERBY: sortBy?.[0]?.ACCESSOR
            ? `${sortBy?.[0]?.ACCESSOR} ${sortBy?.[0]?.VALUE}`
            : "",
        },
        {},
        null,
        abort
      );
    if (status === "0") {
      return [
        {
          REPORT_DATA: data,
          COUNT: data?.[0]?.TOTAL_COUNT ?? toNo + 1,
        },
      ];
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  };
export const getPassBookTemplate = async (reqData: any) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPASSBKTEMPL", reqData);
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DESCRIPTION, TRAN_CD, DEFAULT_TRAN_CD, ...other }) => {
          return {
            value: TRAN_CD,
            label: DESCRIPTION,
            defaultValue: DEFAULT_TRAN_CD,
            ...other,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getAcctInqStatement = async ({
  rowsData,
  COMP_CD,
  workingDate,
  screenFlag,
  FULL_ACCT_NO,
}) => {
  if (screenFlag === "ACCT_INQ") {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETACCTDATA", {
        ACCT_CD: rowsData?.[0]?.data?.ACCT_CD,
        ACCT_TYPE: rowsData?.[0]?.data?.ACCT_TYPE,
        BRANCH_CD: rowsData?.[0]?.data?.BRANCH_CD,
        COMP_CD: COMP_CD,
        FULL_ACCT_NO: FULL_ACCT_NO,
      });
    if (status === "0") {
      const { LST_STATEMENT_DT } = data[0];
      const inputDate = new Date(LST_STATEMENT_DT);
      const nextDate = new Date(inputDate);
      let NEwdate = nextDate.setDate(nextDate.getDate() + 1);
      // Make sure to adjust the timezone offset to match your desired output
      const timezoneOffset = nextDate.getTimezoneOffset() * 60000; // Convert to milliseconds
      const STMT_FROM_DATE = new Date(NEwdate - timezoneOffset)
        .toISOString()
        .slice(0, 23);
      data[0].STMT_FROM_DATE = STMT_FROM_DATE;

      const [day, month, year] = workingDate.split("/");
      const dateObject = new Date(`${year}-${month}-${day}`);
      const WK_DATE = dateObject.toISOString().slice(0, 10);
      data[0].WK_STMT_TO_DATE = WK_DATE;

      return data;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  } else {
    return [];
  }
};
export const getDependenciesData = async (_, __, otherAPIRequestPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCKYCCUSTDEPENCYDTL", {
      ...otherAPIRequestPara,
    });
  if (status === "0") {
    const dataStatus = data;
    dataStatus.map((item) => {
      if (item?.STATUS === "Closed") {
        item._rowColor = "rgb(152 59 70 / 61%)";
      }
      if (item?.STATUS === "Freezed") {
        item._rowColor = "rgb(40 142 159 / 60%)";
      }
      if (item?.STATUS === "Un-Claimed") {
        item._rowColor = "rgb(9 132 3 / 51%)";
      }
    });
    return dataStatus;
    // return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

// -----------------------------------------------------------

export const getPassbookStatement = async (reqData: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPASSBKPRINTDATA", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const passbookPrintingValidation = async (reqData: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEPASSBOOKPRINT", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const passbookAccountDetails = async (reqData: any) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPASSBOOKACDTL", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getAccountDetails = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DAILYTRNCARDDTL", reqData);
  if (status === "0") {
    data?.map((a) => {
      if (a?.COMPONENT_TYPE == "amountField" && !a?.COL_VALUE.includes(".")) {
        a.COL_VALUE = a.COL_VALUE + ".00";
      }
    });
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
