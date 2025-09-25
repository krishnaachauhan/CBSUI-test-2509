import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getSearchActiveSi = async ({
  companyID,
  branchCode,
  activeSiFlag,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSISEARCHBTN", {
      COMP_CD: companyID,
      BRANCH_CD: branchCode,
      ACTIVE_SI_FLAG: activeSiFlag,
    });

  if (status === "0") {
    const count =
      data &&
      data.reduce(
        (acc, item) => {
          const status = String(item.DOC_STATUS).trim();
          if (status === "Y") {
            acc.activeCount++;
          } else if (status === "N") {
            acc.inactiveCount++;
          }

          return acc;
        },
        { activeCount: 0, inactiveCount: 0 }
      );
    console.log(count);

    return data.map((item, index) => ({
      ...item,
      _rowColor: item.DOC_STATUS === "N" ? "rgb(255, 0, 0)" : undefined,
      FEQ_TYPE:
        item.FEQ_TYPE === "M"
          ? "Month(s)"
          : item.FEQ_TYPE === "Y"
          ? "Year(s)"
          : item.FEQ_TYPE === "Q"
          ? "Quartely"
          : item.FEQ_TYPE === "D"
          ? "Day(s)"
          : item.FEQ_TYPE === "H"
          ? "Half Yearly"
          : "",
      DOC_STATUS: item.DOC_STATUS === "Y",
      INDEX: `${index}`,
      ACTIVE_SI: count.activeCount,
      IN_ACTIVE_SI: count.inactiveCount,
      ROWS: data?.length,
    }));
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getStandingInstructionData = async ({ companyID, branchCode }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSIHDR", {
      ENT_COMP_CD: companyID,
      ENT_BRANCH_CD: branchCode,
    });
  if (status === "0") {
    return data.map((item) => {
      return {
        ...item,
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getStandingInstructionInnerData = async ({
  companyID,
  branchCode,
  Tran_cd,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSIGRIDDATADISP", {
      COMP_CD: companyID,
      BRANCH_CD: branchCode,
      TRAN_CD: Tran_cd,
      CONFIRMED: "A",
    });
  if (status === "0") {
    return data.map((item) => {
      return {
        ...item,
        FEQ_TYPE:
          item.FEQ_TYPE === "M"
            ? "Month(s)"
            : item.FEQ_TYPE === "Y"
            ? "Year(s)"
            : item.FEQ_TYPE === "Q"
            ? "Quartely"
            : item.FEQ_TYPE === "D"
            ? "Day(s)"
            : item.FEQ_TYPE === "H"
            ? "Half Yearly"
            : "",
        DOC_STATUS: item.DOC_STATUS === "Y" ? true : false,
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getcommisiontype = async (...reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCOMMTYPEDDDW", {
      COMP_CD: reqData?.[3]?.companyID ?? "",
      BRANCH_CD: reqData?.[3]?.user?.branchCode ?? "",
      CODE: "SIC",
    });

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DESCRIPTION, MISC_CODE, MST_DESC, TRAN_CD, ...other }) => {
          return {
            ...other,
            value: TRAN_CD,
            label: DESCRIPTION,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getSIAsExcutedData = async ({
  companyID,
  branchCode,
  acct_type,
  acct_cd,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSIASEXECUTEDBTN", {
      COMP_CD: companyID,
      BRANCH_CD: branchCode,
      ACCT_TYPE: acct_type,
      ACCT_CD: acct_cd,
    });

  if (status === "0") {
    return data.map((item, index) => {
      return {
        ...item,
        INDEX: index,
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getSiExecuteDetailViewData = async ({
  companyID,
  branchCode,
  Tran_cd,
  Line_id,
  Sr_cd,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSIEXECUTEDTLBTN", {
      COMP_CD: companyID,
      BRANCH_CD: branchCode,
      TRAN_CD: Tran_cd,
      LINE_ID: Line_id,
      SR_CD: Sr_cd,
    });
  if (status === "0") {
    return data.map((item) => {
      return {
        ...item,
        FEQ_TYPE:
          item.FEQ_TYPE === "M"
            ? "Month(s)"
            : item.FEQ_TYPE === "Y"
            ? "Year(s)"
            : item.FEQ_TYPE === "Q"
            ? "Quartely"
            : item.FEQ_TYPE === "D"
            ? "Day(s)"
            : item.FEQ_TYPE === "H"
            ? "Half Yearly"
            : "",
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateStandingInstructionData = async ({ ...reqdata }) => {
  const { data, status, message } = await AuthSDK.internalFetcher(
    "VALIDATESIDATA",
    {
      ...reqdata,
    }
  );
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message);
  }
};

export const getSiCharge = async ({ ...reqData }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSICHARGE", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const AuditDataDetail = async ({
  companyID,
  branchCode,
  Tran_cd,
  Lien_id,
  Sr_cd,
  sub_lineid,
  execute_date,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSIDTLAUDITBTN", {
      EXECUTE_DT: execute_date,
      COMP_CD: companyID,
      ENT_BRANCH_CD: branchCode,
      TABLE_NM: "SI_SDT_EXECUTE_DTL",
      A_TRAN_CD: Tran_cd,
      A_SR_CD: Sr_cd,
      A_LINE_ID: Lien_id,
      A_SUB_LINE_ID: sub_lineid,
    });

  if (status === "0") {
    return data.map((item) => ({
      ...item,
    }));
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getDebitAccountvalidation = async ({ reqData }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSIDRACDTL", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getCreditAccountvalidation = async ({ reqData }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSICRACDTL", {
      ...reqData,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const deleteSIDetailData = async ({ reqData }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATESIDELETEEXECDTL", { ...reqData });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const deleteSIExecuteDetail = async ({ reqdata }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DODELETESIEXECDTL", { ...reqdata });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const addStandingInstructionTemplate = async (reqdata) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "SAVESTANDINGINSTRUCTIONENTRY",
    {
      ...reqdata,
    }
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const updateSiAsExecute = async ({ data: reqdata }) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "DOSIEXECUTION",
    {
      ...reqdata,
    }
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const updateSiDetailData = async ({ data: reqdata }) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "DOSIEXECUTIONDETAILVIEW",
    {
      ...reqdata,
    }
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const validateSiExecuteDays = async ({
  CR_ACCT_CD,
  CR_ACCT_TYPE,
  CR_COMP_CD,
  CR_BRANCH_CD,
  START_DT,
  WORKING_DATE,
  DISPLAY_LANGUAGE,
  EXECUTE_DAY,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATESIEXECUTEDAY", {
      CR_ACCT_CD: CR_ACCT_CD,
      CR_ACCT_TYPE: CR_ACCT_TYPE,
      CR_COMP_CD: CR_COMP_CD,
      CR_BRANCH_CD: CR_BRANCH_CD,
      START_DT: START_DT,
      EXECUTE_DAY: EXECUTE_DAY,
      WORKING_DATE: WORKING_DATE,
      DISPLAY_LANGUAGE: DISPLAY_LANGUAGE,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
