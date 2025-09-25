import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getVouchersDetails = async ({ companyID, branchCode, tranCd }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRECURPAYMENTDTL", {
      COMP_CD: companyID,
      BRANCH_CD: branchCode,
      TRAN_CD: tranCd,
    });
  if (status === "0") {
    return data?.map((item) => {
      return {
        ...item,
        PAYSLIP: item?.PAYSLIP === "Y" ? true : false,
        RTGS_NEFT: item?.RTGS_NEFT === "Y" ? true : false,
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const recurringPmtConfirmation = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DORECURRINGPAYMENTCONFIMRATION", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
