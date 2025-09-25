import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getTransSumCardData = async () => {
  //   const { status, data, message, messageDetails } =
  //     await AuthSDK.internalFetcher("GETEMPLOYEEDTL", { USERID: userID });

  return [
    {
      TYPE_CD: "CREDIT-TRF",
      AMOUNT: "8868121.77",
      CNT: "45",
    },
    {
      TYPE_CD: "DEBIT-TRF",
      AMOUNT: "8868121.77",
      CNT: "47",
    },
    {
      TYPE_CD: "DEBIT-TRF",
      AMOUNT: "8868121.77",
      CNT: "47",
    },
    {
      TYPE_CD: "DEBIT-TRF",
      AMOUNT: "8868121.77",
      CNT: "47",
    },
    {
      TYPE_CD: "DEBIT-TRF",
      AMOUNT: "8868121.77",
      CNT: "47",
    },
    {
      TYPE_CD: "DEBIT-TRF",
      AMOUNT: "8868121.77",
      CNT: "47",
    },
    {
      TYPE_CD: "DEBIT-TRF",
      AMOUNT: "8868121.77",
      CNT: "47",
    },
  ];
};
