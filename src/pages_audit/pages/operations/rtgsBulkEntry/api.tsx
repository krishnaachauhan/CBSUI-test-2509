import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const GetBankRTGSImportDdwn = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETBANKIFSCIMPORTDDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      TABLE_NM: "RTGS_NEFT_TRN_DTL",
    });

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData?.map(
        ({ DESCRIPTION, FILE_FORMAT, TRAN_CD, ...other }) => {
          return {
            ...other,
            value: `${FILE_FORMAT},${TRAN_CD}`,
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

export const uploadFileData = async ({ ...reqData }) => {
  try {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("RTGSNEFTBULKIMPORT", {
        ...reqData,
      });
    if (status === "0") {
      const dataStatus = data;
      if (Boolean(dataStatus?.[0]?.FILE_DATA)) {
        dataStatus?.[0]?.FILE_DATA?.map((item) => {
          if (item?.ERROR_FLAG === "Y") {
            item._rowColor = "#f5c1c1";
          }
        });
      }
      return dataStatus;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  } catch (error) {
    throw error;
  }
};
