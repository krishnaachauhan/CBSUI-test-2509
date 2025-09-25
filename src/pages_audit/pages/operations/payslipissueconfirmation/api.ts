import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getPayslipCnfRetrieveData = async ({
  ENT_COMP_CD,
  ENT_BRANCH_CD,
  GD_DATE,
  FROM_DT,
  TO_DT,
  FLAG,
  A_LANG,
}: {
  ENT_COMP_CD: string;
  ENT_BRANCH_CD: string;
  GD_DATE: string;
  FROM_DT: string;
  TO_DT: string;
  FLAG: string;
  A_LANG: string;
}) => {
  // Fetch data from the API
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPAYSLIPCNFRETRIVEGRID", {
      ENT_COMP_CD,
      ENT_BRANCH_CD,
      GD_DATE,
      FROM_DT,
      TO_DT,
      FLAG,
      A_LANG,
    });

  if (status === "0") {
    let responseData = data;

    // Check if the responseData is an array
    if (Array.isArray(responseData)) {
      // Calculate totals for each TRAN_CD
      const totals = responseData.reduce<Record<string, number>>((acc, obj) => {
        const amount = parseFloat(obj.AMOUNT || "0");
        acc[obj.TRAN_CD] = (acc[obj.TRAN_CD] || 0) + amount;
        return acc;
      }, {} as Record<string, number>);

      // Process data to include CONFIRMED_FLG and TOTAL_AMT
      responseData = responseData.map((items) => ({
        ...items,
        CONFIRMED_FLG: items.CONFIRMED === "Y" ? "Confirmed" : "Pending",
        TOTAL_AMT: totals[items.TRAN_CD],
      }));
    }

    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getEntryConfirmed = async ({ ...reqdata }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DODUALCONFIRMATION", { ...reqdata });

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ ...items }) => {
        return {
          ...items,

          CONFIRMED_FLG: items.CONFIRMED === "Y" ? "Confirmed" : "Pending",
        };
      });
    }
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getEntryReject = async (reqdata) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("SAVEPAYSLIPISSUEENTRYDTL", reqdata);

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ ...items }) => {
        return {
          ...items,
        };
      });
    }
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getShowConfirmedHistory = async (reqdata) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCONFIRMEDHISTORY", reqdata);

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ ...items }) => {
        return {
          ...items,

          CONFIRMED: items.CONFIRMED === "Y" ? "Confirmed" : "Pending",
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getSignatureDdnData = async ({
  COMM_TYPE_CD,
  COMP_CD,
  BRANCH_CD,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPAYSLIPSIGNATUREDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      COMM_TYPE_CD: COMM_TYPE_CD,
    });

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DISLAY_SIGNATURE, SIGNATURE_CD, ...items }) => {
          return {
            ...items,
            value: DISLAY_SIGNATURE,
            label: SIGNATURE_CD,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getRegionDDData = async (...reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPAYSLIPREGIONDDW", {
      ...reqData[0],
    });

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ REGION_CD, REGION_NM, ...items }) => {
        return {
          ...items,
          value: REGION_NM,
          label: REGION_CD,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
