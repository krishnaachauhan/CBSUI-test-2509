import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const checkUsername = async (...reqdata) => {
  reqdata?.[1]?.formState?.handleButtonDisable(true);
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("CHECKUSERNAME", {
      USER_NM: reqdata?.[0]?.value,
    });
  if (status === "0") {
    reqdata?.[1]?.formState?.handleButtonDisable(false);
    return { data, status };
  } else {
    reqdata?.[1]?.formState?.handleButtonDisable(false);
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getCustomerId = async (...reqdata) => {
  reqdata?.[1]?.formState?.handleButtonDisable(true);
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCUSTIDVAL", {
      COMP_CD: reqdata?.[1]?.COMP_CD,
      CUSTOMER_ID: reqdata?.[1]?.CUSTOMER_ID,
    });
  if (status === "0") {
    reqdata?.[1]?.formState?.handleButtonDisable(false);
    return data;
  } else {
    reqdata?.[1]?.formState?.handleButtonDisable(false);
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const ValidateCustomerId = async (...reqdata) => {
  reqdata?.[1]?.formState?.handleButtonDisable(true);
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATECUSTID", {
      COMP_CD: reqdata?.[1]?.COMP_CD,
      CUST_ID: reqdata?.[1]?.CUST_ID,
    });
  if (status === "0") {
    reqdata?.[1]?.formState?.handleButtonDisable(false);
    return data;
  } else {
    reqdata?.[1]?.formState?.handleButtonDisable(false);
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getsecmstgrpdrpdwn = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSECMSTGRPNMDDW", {});
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ GROUP_NAME, USER_NAME, ...others }) => {
          return {
            ...others,
            value: GROUP_NAME,
            label: GROUP_NAME,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getSecmstBankcd = async (...req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSECMSTCOMPDDW", {
      COMP_CD: req?.[3]?.companyID,
    });
  if (status === "0") {
    let responseDatas = data;
    if (Array.isArray(responseDatas)) {
      responseDatas = responseDatas.map(
        ({ COMP_CD, DESCRIPTION, ...others }) => {
          return {
            ...others,
            value: COMP_CD,
            label: DESCRIPTION,
          };
        }
      );
    }
    return responseDatas;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getSecmstBranchcd = async (...req) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSECMSTBRANCHDDW", {
      COMP_CD: req?.[3]?.companyID,
    });
  if (status === "0") {
    let responseDatas = data;
    if (Array.isArray(responseDatas)) {
      responseDatas = responseDatas.map(({ BRANCH_CD, DISP_NM, ...others }) => {
        return {
          ...others,
          value: BRANCH_CD,
          label: DISP_NM,
        };
      });
    }
    return responseDatas;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getDigitalSignConfigddw = async (...reqData) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSECUSERDIGITALSIGN", {
      COMP_CD: reqData?.[0],
      BRANCH_CD: reqData?.[1],
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ TRAN_CD, CONFIG_NM }) => {
        return {
          value: TRAN_CD,
          label: CONFIG_NM,
        };
      });
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getnewapplicationaccess = async ({ userid }) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETNEWUSERSECAPPACCESS", {
      USER_NAME: userid,
    });
  if (status === "0") {
    return data.map((item) => {
      return {
        ...item,
        ACTIVE: item.ACTIVE === "Y" || item.ACTIVE === true ? true : false,
        LOGIN_ACCESS:
          item.LOGIN_ACCESS === "Y" || item.LOGIN_ACCESS === true
            ? true
            : false,
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getapplicationaccess = async ({ userid }) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSECAPPLIACCESS", {
      USER_NAME: userid,
    });
  if (status === "0") {
    return data.map((item) => {
      return {
        ...item,
        LOGIN_ACCESS: item.LOGIN_ACCESS === "Y" ? true : false,
        TRAN_CD: item.APP_TRAN_CD,
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getNewUserBranchAccess = async ({ comp_cd }) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETNEWSECUSERBRANCHACCESS", {
      COMP_CD: comp_cd,
    });
  if (status === "0") {
    return data.map((item) => {
      return {
        ...item,
        LOGIN_ACCESS:
          item.LOGIN_ACCESS === "Y" || item.LOGIN_ACCESS === true
            ? true
            : false,
        REPORT_ACCESS: item.REPORT_ACCESS === "Y" ? true : false,
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getUserAccessBranch = async ({ userid }) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSECUSERBRANCHACCESS", {
      USER_NAME: userid,
    });
  if (status === "0") {
    return data.map((item) => {
      return {
        ...item,
        LOGIN_ACCESS: item.LOGIN_ACCESS === "Y" ? true : false,
        REPORT_ACCESS: item.REPORT_ACCESS === "Y" ? true : false,
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getNewUserProductAccess = async ({
  base_branch_cd,
  base_comp_cd,
}) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETNEWSECUSERPRODUCTACCESS", {
      GI_BASE_BRANCH: base_branch_cd,
      GI_BASE_COMP: base_comp_cd,
    });
  if (status === "0") {
    return data.map((item) => {
      return {
        ...item,
        ACCESS: item.ACCESS === "Y" ? true : false,
        TYPE_ACCESS: item.TYPE_ACCESS === "Y" ? true : false,
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getproductaccess = async ({ userid }) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSECUSERRODUCTACCESS", {
      USER_NAME: userid,
    });
  if (status === "0") {
    return data.map((item) => {
      return {
        ...item,
        ACCESS: item.ACCESS === "Y" ? true : false,
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getLoginShiftddw = async ({ COMP_CD, BRANCH_CD }) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSECUSERLOGINSHIFTDDW", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ TRAN_CD: SHIFT_TRAN_CD, DESCRIPTION, ...rest }) => {
          return { rest, value: SHIFT_TRAN_CD, label: DESCRIPTION };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getLoginShiftAccess = async ({ userid, comp_cd }) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSECUSERLOGINSHIFTEXIST", {
      USER_NAME: userid,
      COMP_CD: comp_cd,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getBiometric = async ({ userid }) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSECUSERBIODTL", {
      USER_NAME: userid,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const validatePasswords = async ({ request }) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATEPASSWORD", {
      ...request,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const BioCapture = async () => {
  var MFS100Request = {
    Quality: 60,
    TimeOut: 10,
  };
  var jsondata = JSON.stringify(MFS100Request);
  const rawResponse = await fetch("http://localhost:8004/mfs100/capture", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: jsondata,
  });
  const content = await rawResponse.json();
  return content;
};

export const validateMobileNo = async ({ request }) => {
  request?.formState?.handleButtonDisable(true);
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETMOBILESTATUS", {
      ...request,
    });
  if (status === "0") {
    request?.formState?.handleButtonDisable(false);
    return data;
  } else {
    request?.formState?.handleButtonDisable(false);
    throw DefaultErrorObject(message, messageDetails);
  }
};
