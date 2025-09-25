import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const updateParameterData = async ({
  datatype_cd,
  paraValue,
  old_datatype,
  old_paraValue,
  remark,
  comp_cd,
  branch_cd,
  paraCode,
  old_remark,
}) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "UPDATEPARAMST",
    {
      DATATYPE_CD: datatype_cd,
      COMP_CD: comp_cd,
      REMARKS: remark,
      BRANCH_CD: branch_cd,
      OLD_DATATYPE_CD: old_datatype,
      OLD_PARA_VALUE: old_paraValue,
      PARA_VALUE: paraValue,
      PARA_CD: paraCode,
      OLD_REMARKS: old_remark,
      _LABELS_MASTER: {
        PARA_VALUE: "Value*",
        REMARKS: "Remarks",
        DATATYPE_CD: "Datatype*",
      },
    }
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, "error", messageDetails);
  }
};
export const validateparavalue = async (reqData) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATESYSPARAVALUE", reqData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
