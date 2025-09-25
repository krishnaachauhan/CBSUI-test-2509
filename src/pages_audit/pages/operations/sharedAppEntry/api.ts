import { DefaultErrorObject, utilFunction } from "@acuteinfo/common-base";
import { format } from "date-fns";
import { AuthSDK } from "registry/fns/auth";

export const getAppTypeDropdownData = async (CATEGORY_CD) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETPMISCDATA", {
      CATEGORY_CD: CATEGORY_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DATA_VALUE, DISPLAY_VALUE, ...other }) => {
          return {
            ...other,
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

export const validateShareMemAcct = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATESHAREMEMACCT", { ...reqData });
  if (status === "0") {
    let responseData = data;
    return responseData[0];
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getModeOfPayData = async (reqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFDOPERMODE", reqPara);

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DATA_FOR_SHARE, DISP_VAL, ...other }) => ({
          ...other,
          value: DATA_FOR_SHARE,
          label: DISP_VAL,
        })
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getDivModeOfPayData = async (reqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCOLMISCDATA", reqPara);

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DISPLAY_VALUE, DATA_VALUE, ...other }) => ({
          ...other,
          value: DATA_VALUE,
          label: DISPLAY_VALUE,
        })
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getShareAppPara = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSHAREAPPPARA", { ...reqData });
  if (status === "0") {
    let responseData = data;
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const BankMasterValidate = async (formData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATECLGBANKCD", formData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getBankChequeAlert = async (formData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("BANKCHEQUEALERT", formData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getPurposeApi = async (reqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSHAREPURPOSEDDDW", reqPara);

  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ CODE, DESCRIPTION, ...other }) => ({
        ...other,
        value: CODE,
        label: DESCRIPTION,
      }));
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateApplicationData = async (formData) => {
  const response = await AuthSDK.internalFetcher("GETSHAREAPPDTL", formData);
  if (response.status === "0") {
    return [response];
  } else {
    throw DefaultErrorObject(response.message, response.messageDetails);
  }
};

export const accountSave = async (reqData) => {
  const {
    IsNewRow,
    REQ_CD,
    REQ_FLAG,
    SAVE_FLAG,
    CUSTOMER_ID,
    ACCT_TYPE,
    ACCT_CD,
    COMP_CD,
    BRANCH_CD,
    formData,
    OP_DATE,
    SCREEN_REF,
    mainIntialVals,
    btnData,
    deepRemoveKeysIfExist,
  } = reqData;

  const jointTabs = [
    "JOINT_HOLDER_DTL",
    "JOINT_NOMINEE_DTL",
    "JOINT_GUARDIAN_DTL",
    "JOINT_GUARANTOR_DTL",
    "JOINT_HYPOTHICATION_DTL",
    "JOINT_SIGNATORY_DTL",
    "JOINT_INTRODUCTOR_DTL",
  ];

  let payload = {};

  let joint_account_dtl: any[] = [];
  if (Object.keys(formData)?.length > 0) {
    Object.keys(formData).forEach(async (tab: string) => {
      if (jointTabs.includes(tab)) {
        joint_account_dtl = [...joint_account_dtl, ...formData[tab]];
      } else if (tab === "MAIN_DETAIL") {
        const mainTabDetails = {
          ...mainIntialVals,
          ...formData["MAIN_DETAIL"],
          COMP_CD: COMP_CD ?? "",
          BRANCH_CD: BRANCH_CD ?? "",
          OP_DATE,
        };
        const removedKeysMainData = await deepRemoveKeysIfExist(
          mainTabDetails,
          "MAIN"
        );
        payload["MAIN_DETAIL"] = {
          ...removedKeysMainData,
        };
      } else {
        payload[tab] = formData[tab];
      }
    });
    const removedKeysJointData = await deepRemoveKeysIfExist(
      joint_account_dtl,
      "JOINT"
    );
    payload["JOINT_ACCOUNT_DTL"] = removedKeysJointData?.map((row) => ({
      ...row,
      IsNewRow: IsNewRow,
      ACTIVE: row.ACTIVE === true || row.ACTIVE === "Y" ? "Y" : "N",
    }));
    const removedKeysOtherAddressData = await deepRemoveKeysIfExist(
      formData?.OTHER_ADDRESS_DTL,
      "JOINT"
    );
    payload["OTHER_ADDRESS_DTL"] = removedKeysOtherAddressData?.map((row) => ({
      ...row,
      ACCT_TYPE,
    }));
    payload["MOBILE_REG_DTL"] = formData?.MOBILE_REG_DTL?.map((row) => ({
      ...row,
      MOBILE_REG_FLAG:
        row.MOBILE_REG_FLAG === true || row.MOBILE_REG_FLAG === "Y" ? "Y" : "N",
    }));
    const removedKeysRelativeDeatilsData = await deepRemoveKeysIfExist(
      formData?.RELATIVE_DTL,
      "JOINT"
    );
    payload["RELATIVE_DTL"] = removedKeysRelativeDeatilsData?.map((row) => ({
      ...row,
      SALARIED: row.SALARIED === true || row.SALARIED === "Y" ? "Y" : "N",
      SELF_EMPLOYED:
        row.SELF_EMPLOYED === true || row.SELF_EMPLOYED === "Y" ? "Y" : "N",
    }));
    const btnDataList = btnData
      ? [btnData?.["TERMLOAN_BTN_MAC"], btnData?.["TERMLOAN_BTN_VEH"]].filter(
          (obj) => obj && Object.keys(obj).length > 0
        )
      : [];
    if (btnDataList.length > 0) {
      payload["TERMLOAN_BTN_DTL"] = btnDataList;
    }
    const ENTRY_TYPE = "1";
    payload = {
      ...payload,
      SCREEN_REF,
      IsNewRow,
      REQ_CD,
      REQ_FLAG,
      SAVE_FLAG,
      CUSTOMER_ID,
      ACCT_TYPE,
      ACCT_CD,
      COMP_CD,
      BRANCH_CD,
      ENTRY_TYPE,
    };
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("DOSHAREAPPLICATIONENTRYDML", payload);
    if (status === "0") {
      return data;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  }
};

export const getJointTabData = async (formData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSHAREAPPJOINTTABDTL", formData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const confirmShareEntry = async (formData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOSHAREAPPLICATIONCONFIRMATION", formData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateShareEntry = async (formData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATESHAREAPPENTRY", formData);
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
