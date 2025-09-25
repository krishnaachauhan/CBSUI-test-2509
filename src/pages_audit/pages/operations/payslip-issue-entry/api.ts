import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getRetrievalPaySlipEntryData = async ({
  companyID,
  branchCode,
  FROM_DT,
  TO_DT,
  GD_DATE,
  USER_LEVEL,
  DOC_CD,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPAYSLIPTODAYGRID", {
      COMP_CD: companyID,
      BRANCH_CD: branchCode,
      FROM_DT: FROM_DT,
      TO_DT: TO_DT,
      GD_DATE: GD_DATE,
      USER_LEVEL: USER_LEVEL,
      DOC_CD: DOC_CD,
    });

  if (status === "0") {
    let responseData = data;

    if (Array.isArray(responseData)) {
      const totals = responseData.reduce<Record<string, number>>((acc, obj) => {
        const amount = parseFloat(obj.AMOUNT || "0");
        acc[obj.TRAN_CD] = (acc[obj.TRAN_CD] || 0) + amount;
        return acc;
      }, {} as Record<string, number>);

      responseData = responseData.map((items, index) => ({
        ...items,
        PENDING_FLAG: items.CONFIRMED === "Y" ? "Confirmed" : "Pending",
        TOTAL_AMT: `${totals[items.TRAN_CD]}`,
        INDEX: index,
      }));
    }

    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getRetrievalType = async (...reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCOMMTYPEDDDW", {
      ...reqData[0],
      CODE: "DD",
    });

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DESCRIPTION, TRAN_CD, DEFAULT_COMM_TYPE, ...items }) => {
          return {
            ...items,
            value: TRAN_CD,
            label: DESCRIPTION,
            defaultType: DEFAULT_COMM_TYPE,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getRetrievalDateWise = async ({
  COMP_CD,
  BRANCH_CD,
  FROM_DT,
  TO_DT,
  TRAN_CD,
  GD_DATE,
  USER_LEVEL,
  FLAG,
}: {
  COMP_CD: string;
  BRANCH_CD: string;
  FROM_DT: string;
  TO_DT: string;
  TRAN_CD: string;
  GD_DATE: string;
  USER_LEVEL: string;
  FLAG: string;
}) => {
  // Fetch data from the API
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPAYSLIPRETRIVEGRID", {
      COMP_CD,
      BRANCH_CD,
      FROM_DT,
      TO_DT,
      DEF_TRAN_CD: TRAN_CD,
      GD_DATE,
      USER_LEVEL,
      FLAG,
    });

  if (status === "0") {
    let responseData = data;

    if (Array.isArray(responseData)) {
      const totals = responseData.reduce<Record<string, number>>((acc, obj) => {
        const amount = parseFloat(obj.AMOUNT || "0");
        acc[obj.TRAN_CD] = (acc[obj.TRAN_CD] || 0) + amount;
        return acc;
      }, {} as Record<string, number>);

      responseData = responseData.map((items, index) => ({
        ...items,
        PENDING_FLAG: items.CONFIRMED === "Y" ? "Confirmed" : "Pending",
        TOTAL_AMT: `${totals[items.TRAN_CD]}`,
        INDEX: index,
      }));
    }

    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const headerDataRetrive = async ({ COMP_CD, BRANCH_CD, TRAN_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPAYSLIPACCTDTLDISP", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      TRAN_CD: TRAN_CD,
    });

  if (status === "0") {
    return data.map((item) => {
      return {
        ...item,
        isOldRow: "Y",
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const commonDataRetrive = async ({ COMP_CD, BRANCH_CD, TRAN_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPAYSLIPDDDATADISP", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      TRAN_CD: TRAN_CD,
    });

  if (status === "0") {
    return data.map((item) => {
      return {
        ...item,
        isOldRow: "Y",
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getInfavourOfData = async (...reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPAYSLIPINFAVOURDDW", {
      COMP_CD: reqData?.[3]?.companyID,
      BRANCH_CD: reqData?.[3]?.user?.branchCode,
    });

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ INFAVOUR_OF, MST_DESC, ...items }) => {
        return {
          ...items,
          value: INFAVOUR_OF,
          label: INFAVOUR_OF,
        };
      });
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
          value: REGION_CD,
          label: REGION_NM,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getSlipNo = async ({ ENT_COMP_CD, ENT_BRANCH_CD, TRAN_DT }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPAYSLIPNOHDR", {
      ENT_COMP_CD: ENT_COMP_CD,
      ENT_BRANCH_CD: ENT_BRANCH_CD,
      TRAN_DT: TRAN_DT,
    });

  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getCalculateGstComm = async (reqParams) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPAYSLIPISSUECHARGE", {
      COMP_CD: reqParams.COMP_CD,
      BRANCH_CD: reqParams.BRANCH_CD,
      ACCT_TYPE: reqParams.ACCT_TYPE,
      ACCT_CD: reqParams.ACCT_CD,
      AMOUNT: reqParams.AMOUNT,
      DEF_TRAN_CD: reqParams.DEF_TRAN_CD,
      SCREEN_REF: "RPT/14",
      // TYPE_CD: reqParams.TYPE_CD,
      COMM_TYPE: reqParams.COMM_TYPE,
      ENT_COMP: reqParams.ENT_COMP,
      ENT_BRANCH: reqParams.ENT_BRANCH,
      WORKING_DATE: reqParams.WORKING_DATE,
      USERNAME: reqParams.USERNAME,
      USERROLE: reqParams.USERROLE,
    });
  if (status === "0") {
    let responseData = data;
    return responseData;
  } else if (status === "999") {
    return { status: status, messageDetails: messageDetails };
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getCustDocData = async (...reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCUSTDOCUMENT", {
      COMP_CD: reqData?.[3]?.companyID,
      BRANCH_CD: reqData?.[3]?.user?.branchCode,
      CUSTOMER_TYPE: "A",
    });

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ DESCRIPTION, SR_CD, ...items }) => {
        return {
          ...items,
          value: SR_CD,
          label: DESCRIPTION,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getBankCodeData = async (...reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPAYSLIPBANKCODEDDW", {
      COMP_CD: reqData?.[3]?.companyID,
      BRANCH_CD: reqData?.[3]?.user?.branchCode,
    });

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ COL_BANK_CODE, COL_BANK_CD, ...items }) => {
          return {
            ...items,
            value: COL_BANK_CD,
            label: COL_BANK_CODE,
          };
        }
      );
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
        ({
          DISLAY_SIGNATURE,
          SIGNATURE_CD,
          DEFAULT_VAL1,
          DEFAULT_VAL2,
          ...items
        }) => {
          return {
            ...items,
            value: SIGNATURE_CD,
            label: DISLAY_SIGNATURE,
            signature1: DEFAULT_VAL1,
            signature2: DEFAULT_VAL2,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getRegionDDData2 = async (requestData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPAYSLIPREGIONDDW", {
      COMP_CD: requestData?.COMP_CD,
      BRANCH_CD: requestData?.BRANCH_CD,
      COMM_TYPE_CD: "",
      FLAG: "",
    });

  if (status === "0") {
    let responseData = data;

    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const addRegionData = async (reqdata) => {
  const { status, message } = await AuthSDK.internalFetcher(
    "DOSAVEREGIONMST",
    reqdata
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message);
  }
};
export const getSlipTransCd = async ({ ENT_COMP_CD, ENT_BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPAYSLIPTRANCD", {
      ENT_COMP_CD: ENT_COMP_CD,
      ENT_BRANCH_CD: ENT_BRANCH_CD,
    });

  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const validatePayslipData = async (reqdata) => {
  const { data, status, message } = await AuthSDK.internalFetcher(
    "VALIDATEPAYSLIPISSUE",
    reqdata
  );
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message);
  }
};
export const getregioncommtype = async (...reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCOMMTYPEMSTDDDW", {
      ...reqData[0],
    });

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ DISCRIPTION, TYPE_CD, ...items }) => {
        return {
          ...items,
          value: TYPE_CD,
          label: DISCRIPTION,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const validatePayslipNo = async (reqdata) => {
  const { data, status, message } = await AuthSDK.internalFetcher(
    "VALIDATEPAYSLIPNO",
    reqdata
  );
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message);
  }
};
export const getJointDetailsList = async (Apireq?) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDLYTRNJOINTTAB", { ...Apireq });
  if (status === "0") {
    // return data;
    let responseData = data;
    responseData.map((a, i) => {
      a.index = i;
      a.phone1 = [a.MOBILE_NO, a.PHONE].filter(Boolean).join(", ");
      a.MEM_DISP_ACCT_TYPE = [a.MEM_ACCT_TYPE, a.MEM_ACCT_CD]
        .filter(Boolean)
        .join("-");
      a.REF_ACCT = [
        a.REF_BRANCH_CD,
        a.REF_COMP_CD,
        a.REF_ACCT_TYPE,
        a.MEM_ACCT_CD,
      ]
        .filter(Boolean)
        .join("-");

      return a;
    });
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const savePayslipEntry = async (reqdata) => {
  const { data, status, message } = await AuthSDK.internalFetcher(
    "SAVEPAYSLIPISSUEENTRYDTL",
    reqdata
  );
  if (status === "0") {
    return { data, message };
  } else {
    throw DefaultErrorObject(message);
  }
};
export const geTrxDdw = async (...reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPAYSLIPTRXDDW", {
      ...reqData[0],
    });

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DATA_VALUE, DISPLAY_VALUE, ...items }) => {
          return {
            ...items,
            value: DATA_VALUE,
            label: DISPLAY_VALUE,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getVoucherList = async (reqdata) => {
  const { data, status, message } = await AuthSDK.internalFetcher(
    "GETVOUCHERMSG",
    reqdata
  );
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message);
  }
};
export const getDDtransactionScreenList = async ({ FLAG }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPAYSLIPDOCDTL", {
      FLAG: FLAG,
    });

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map((items, index) => ({
        ...items,
        INDEX: `${index}`,
      }));
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
