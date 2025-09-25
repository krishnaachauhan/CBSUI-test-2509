import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getTodayTransList = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDLYTRNTODAYTAB", {
      COMP_CD: reqData?.COMP_CD ?? "",
      ACCT_TYPE: reqData?.ACCT_TYPE ?? "",
      ACCT_CD: reqData?.ACCT_CD ?? "",
      BRANCH_CD: reqData?.BRANCH_CD ?? "",
    });
  if (status === "0") {
    let responseData = data;
    responseData.map((item, index) => {
      item.index = index;
      item.sr = index + 1;
      item.ignoreValue = item?.STATUS !== "CONFIRMED" ? true : false;
    });
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getAcctDtlList = async (reqParaMeters) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSEARCHCOMPONENT", {
      COMP_CD: reqParaMeters?.COMP_CD,
      A_FLAG: reqParaMeters?.CUSTOMER_ID ? "" : "A",
      BRANCH_CD: reqParaMeters?.CUSTOMER_ID ? "" : reqParaMeters?.BRANCH_CD,
      ACCT_TYPE: reqParaMeters?.CUSTOMER_ID ? "" : reqParaMeters?.ACCT_TYPE,
      ACCT_CD: reqParaMeters?.CUSTOMER_ID ? "" : reqParaMeters?.ACCT_CD,
      CUST_ID: reqParaMeters?.CUSTOMER_ID ? reqParaMeters?.CUSTOMER_ID : "",
    });
  if (status === "0") {
    /// FOR rearange gridData get mathed record first
    const rearrangeData = (rowData, gridData: any) => {
      let matchedRecord = null;
      const remainingRecords: any = [];
      for (let i = 0; i < gridData?.length; i++) {
        const abc = rowData?.ACCT_NO?.trim() ?? rowData?.ACCT_CD?.trim();
        const concatedAcctNo =
          rowData?.COMP_CD?.trim() +
          rowData?.BRANCH_CD?.trim() +
          rowData?.ACCT_TYPE?.trim() +
          rowData?.ACCT_CD?.trim();
        if (
          //this AC_CD is always full(1320990004000006)
          gridData[i]?.AC_CD?.trim()?.replace(/\s+/g, "") ===
          //this line for if full ACCT_NO(1320990004000006) not get and get only ACCT_CD(000006)
          (rowData?.ACCT_NO?.trim() ?? concatedAcctNo)
        ) {
          matchedRecord = gridData[i];
        } else {
          remainingRecords.push(gridData[i]);
        }
      }

      if (matchedRecord) {
        return [matchedRecord, ...remainingRecords];
      } else {
        return gridData;
      }
    };
    let rearangedGridData = [];
    if (data?.length > 0 && Object?.keys(reqParaMeters)?.length > 0) {
      rearangedGridData = rearrangeData(reqParaMeters, data);
    }

    // const dataStatus = data;
    // dataStatus.map((item) => {
    //   if (item?.ORG_STATUS === "Close") {
    //     item._rowColor = "rgb(152 59 70 / 61%)";
    //   }
    //   if (item?.ORG_STATUS === "Freezed") {
    //     item._rowColor = "rgb(40 142 159 / 60%)";
    //   }
    //   if (item?.ORG_STATUS === "Un-Claimed") {
    //     item._rowColor = "rgb(9 132 3 / 51%)";
    //   }
    // });
    // // return dataStatus;
    return rearangedGridData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
