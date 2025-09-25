import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getStandingInstructionConfirmMainData = async ({
  companyID,
  branchCode,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSIHDRCNF", {
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

export const getSIConfirmation = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOSICONFIRMATION", {
      ...apiReq,
    });
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getStandingInstructionConfInnerData = async ({
  companyID,
  branchCode,
  Tran_cd,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSIGRIDDATADISP", {
      COMP_CD: companyID,
      BRANCH_CD: branchCode,
      TRAN_CD: Tran_cd,
      CONFIRMED: "0",
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
        _rowColor:
          item.STATUS_DISP === "IN-ACTIVATED" ? "rgb(255, 0, 0)" : undefined,
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
