import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getAddBranchData = async ({ bankCd }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDYNAMICBRANCHLIST", {
      KEY_VALUES: bankCd,
      DOC_CD: "MST/091",
    });
  if (status === "0") {
    return data?.map((item) => {
      return {
        ...item,
        CHECK_BOX: item?.CHECK_BOX === "Y" ? true : false,
        VISIBLE_YN: item?.VISIBLE_YN === "Y" ? true : false,
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const updateAddBranchData = async (apiReq) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "DOADDDYNAMICBRANCH",
    {
      ...apiReq,
    }
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
