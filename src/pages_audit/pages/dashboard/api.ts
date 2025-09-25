import { DefaultErrorObject } from "@acuteinfo/common-base";
import { format } from "date-fns";
import { AuthSDK } from "registry/fns/auth";

export const getDashboardData = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDASHBOARDDATA", {
      APP_TRAN_CD: "51",
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const QuickAccessTableGridData = async ({
  COMP_CD,
  BASE_BRANCH_CD,
  GROUP_NAME,
  APP_TRAN_CD,
  FLAG,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETQUICKACCESS", {
      COMP_CD: COMP_CD,
      BASE_BRANCH_CD: BASE_BRANCH_CD,
      ASON_DT: format(new Date(), "dd/MMM/yyyy"),
      GROUP_NAME: GROUP_NAME,
      FLAG: FLAG.toUpperCase(),
      APP_TRAN_CD: APP_TRAN_CD,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const TodaysTransactionTableGrid = async (req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDASHBOARDCHARTDATA", {
      ...req,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
