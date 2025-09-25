import { format } from "date-fns";
import { AuthSDK } from "registry/fns/auth";
import { AuthStateType } from "./type";
import { DefaultErrorObject, utilFunction } from "@acuteinfo/common-base";
import CRC32C from "crc-32";
export const ResetPassword = async (
  username,
  password,
  newpassword,
  accessToken,
  token_type
) => {
  const { data, status, message, messageDetails, responseType, access_token } =
    await AuthSDK.internalFetcherPreLogin(
      "CHANGEPASSWORD",
      {
        USER_ID: username,
        OLD_PASSWORD: password,
        NEW_PASSWORD: newpassword,
      },
      {
        Authorization: utilFunction.getAuthorizeTokenText(
          accessToken,
          token_type
        ),
        USER_ID: username,
      }
    );
  return { status, data, message, messageDetails };
};

export const validatePasswords = async ({ ...request }: any) => {
  const { status, data, message, messageDetails } =
    await AuthSDK.internalFetcherPreLogin("VALIDATEPASSWORD", {
      ...request,
    });
  if (status === "0") {
    return { validateStatus: status, validateData: data[0] };
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const veirfyUsernameandPassword = async (
  username: any,
  password: any
) => {
  //console.log(CryptoSDK.GetEncryptData(password));
  const { data, status, message, messageDetails, responseType, access_token } =
    await AuthSDK.internalFetcherPreLogin("LOGIN", {
      USER_ID: username,
      PASSWORD: password,
      APP_TRAN_CD: 51,
    });
  if (status === "0") {
    return {
      data: data[0],
      status,
      message,
      messageDetails,
      responseType,
      access_token,
    };
  } else {
    return { status, data, message, messageDetails };
  }

  // return {
  //   data: {
  //     REQUEST_CD: "110432",
  //     AUTH_TYPE: "OTP",
  //   },
  //   status: "0",
  //   message: "OTP Sent successfully.",
  //   messageDetails: "OTP Sent successfully.",
  //   responseType: "D",
  //   access_token: {
  //     access_token: "7cf0b9ce-a9bc-490a-923d-82bf56e2e285",
  //     token_type: "bearer",
  //     expires_in: "299",
  //   },
  // };
};
export const verifyOTP = async (
  transactionId,
  username,
  otpnumber,
  access_token,
  token_type,
  authType,
  bioflag = "N"
) => {
  //console.log(transactionId, username, otpnumber);
  const {
    data,
    status,
    message,
    messageDetails,
    access_token: accesstoken,
  } = await AuthSDK.internalFetcherPreLogin(
    "VERIFYOTP",
    {
      USER_ID: username,
      REQUEST_CD: transactionId || "00",
      OTP: otpnumber,
      AUTH_TYPE: authType,
      APP_TRAN_CD: 51,
      BIO_FLAG: bioflag,
    },
    {
      Authorization: utilFunction.getAuthorizeTokenText(
        access_token,
        token_type
      ),
    }
  );
  if (status === "0") {
    let transformData = transformAuthData(data[0], {
      generateTime: utilFunction.getCurrentDateinLong(),
      ...accesstoken,
    });

    return {
      data: transformData,
      status,
      message,
      messageDetails,
    };
    // let {
    //   status: statusa,
    //   data: dataa,
    //   message: messagea,
    //   messageDetails: messageDetailsa,
    // } = await GetMenuData({
    //   userID: transformData?.user?.id,
    //   COMP_CD: transformData?.companyID,
    //   BRANCH_CD: transformData?.user?.branchCode,
    //   GROUP_NAME: transformData?.roleName,
    //   fulldata: transformData,
    // });
    // if (statusa === "0") {
    //   transformData.menulistdata = dataa;
    //  return {
    //     data: transformData,
    //     status,
    //     message,
    //     messageDetails,
    //   };
    // } else {
    //   return {
    //     status: statusa,
    //     data: dataa,
    //     message: messagea,
    //     messageDetails: messageDetailsa,
    //   };
    // }
  } else {
    return { status, data, message, messageDetails };
  }
};

const setTokenStatusInStorage = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

export const RefreshTokenData = async (refreshToken) => {
  setTokenStatusInStorage("token_status", "refreshing");
  const { status, access_token } = await AuthSDK.internalFetcherPreLogin(
    "LOGIN",
    {
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }
  );
  localStorage.removeItem("token_status");

  //console.log(status, !Boolean(status), typeof status, typeof access_token);
  if (Boolean(status) && status === "0") {
    return {
      generateTime: utilFunction.getCurrentDateinLong(),
      ...access_token,
    };
  } else if (!Boolean(status) || status === "undefined") {
    return {
      generateTime: utilFunction.getCurrentDateinLong(),
      ...access_token,
    };
  } else {
    return null;
  }
};
export const LogoutAPI = async (apiReq) => {
  const { data, status, message } = await AuthSDK.internalFetcher(
    "LOGOUTUSER",
    {
      // USER_ID: userID,
      // APP_TRAN_CD: 51,
      ...apiReq,
    }
  );
  if (status !== "0") {
    return { message, status };
    //} else {
    //  throw DefaultErrorObject(message, messageDetails);
  }
};
// export const verifyPasswordAndLogin = async (
//   transactionId,
//   username,
//   password
// ) => {
//   const { data, status } = await AuthSDK.internalFetcher(
//     `./los/employee/login`,
//     {
//       body: JSON.stringify({
//         request_data: {
//           transactionId: transactionId,
//           password: password,
//           userId: username,
//         },
//         channel: "W",
//       }),
//     }
//   );
//   if (status === "success") {
//     return {
//       status,
//       data: transformAuthData(data?.response_data),
//     };
//   } else {
//     return { status, data: data?.error_data };
//   }
// };

// export const verifyToken = async (token) => {
//   const { data, status } = await AuthSDK.internalFetcher(
//     `./los/employee/token/verify`,
//     {
//       body: JSON.stringify({
//         request_data: {
//           tokenID: token,
//         },
//         channel: "W",
//       }),
//     }
//   );
//   if (status === "success") {
//     return { status, data: data?.response_data };
//   } else {
//     return { status, data: data instanceof Error ? data : data?.error_data };
//   }
// };

const transformAuthData = (data: any, access_token: any): AuthStateType => {
  return {
    access_token: access_token,
    role: data?.USER_LEVEL,
    roleName: data?.USER_ROLE,
    isLoggedIn: false,
    isBranchSelect: false,
    companyName: data?.COMPANYNAME,
    companyID: data?.COMPANYID,
    baseCompanyID: data?.BASECOMPANYID,
    workingDate: data?.WORKINGDATE,
    minDate: data?.MINDATE,
    groupName: data?.GROUP_NAME,
    menulistdata: [],
    uniqueAppId: data?.UNIQUE_APP_ID,
    user: {
      branch: data?.BRANCH,
      branchCode: data?.BRANCHCODE,
      defaultSelectBranch: data?.BRANCHCODE,
      baseBranchCode: data?.BASEBRANCHCODE,
      isUpdDefBranch: data?.ISUPDDEFBRANCH,
      lastLogin: data?.LASTLOGINDATE,
      name: data?.NAME,
      //type: data?.user?.flag,
      // firstName: data?.user?.firstName,
      // lastName: data?.user?.lastName,
      // middleName: data?.user?.middleName,
      id: data?.ID,
      employeeID: data?.EMP_ID,
      allowChat: data?.ALLOW_CHAT,
    },
    idealTimer: data?.IDLE_TIMER,
    hoLogin:
      data?.BRANCHCODE === data?.BASEBRANCHCODE &&
      data?.COMPANYID === data?.BASECOMPANYID
        ? "Y"
        : "N",
    access: {},
  };
};

// const transformRoles = (data: any[]) => {
//   if (!Array.isArray(data)) {
//     return {};
//   }
//   let result = data.reduce((prev, current) => {
//     let products = current.accessCategory as any[];
//     products.reduce((prev, current) => {
//       return (prev[current.categoryCode] = current.categoryName);
//     }, {});

//     return (prev[current?.branchCode] = { ...current, products });
//   }, {});
//   console.log(result);
//   return result;
// };

// const transformRoles = (data: any[]) => {
//   if (!Array.isArray(data)) {
//     return { entities: {}, products: [] };
//   }
//   let products;
//   let result = data.reduce((prev, current) => {
//     let { entityType, accessCategory, ...others } = current;
//     products = accessCategory;
//     if (Array.isArray(prev[entityType])) {
//       prev[entityType].push(others);
//     } else {
//       prev[entityType] = [others];
//     }
//     return prev;
//   }, {});
//   return { entities: result, products: products };
// };
export const veirfyUsernameandMobileNo = async (
  username: any,
  MobileNo: any,
  screenFlag: any
) => {
  const { data, status, message, messageDetails, responseType, access_token } =
    await AuthSDK.internalFetcherPreLogin("FORGOTPASSWORD", {
      USER_ID: username,
      MOBILE_NO: MobileNo,
      SCREEN_FLAG: screenFlag,
    });
  if (status === "0") {
    return {
      data: data[0],
      status,
      message,
      messageDetails,
      responseType,
      access_token,
    };
  } else {
    return { status, data, message, messageDetails };
  }
  // return {
  //   status: "0",
  //   message: "OTP Sent successfully.",
  //   RESPONSE_TYPE: "D",
  //   data: {
  //     REQUEST_CD: 111909,
  //     AUTH_TYPE: "O",
  //   },

  //   COLOR: "0",
  //   messageDetails: "OTP Sent successfully.",
  // };
};

export const verifyOTPForPWDReset = async (
  transactionId,
  username,
  otpnumber,
  auth_Type,
  screenFlag
) => {
  // return {
  //   status: "0",
  //   message: "OTP Verified successfully.",
  //   RESPONSE_TYPE: "D",
  //   data: {
  //     STATUS: "S",
  //     REMARKS: "OTP successfully verified.",
  //   },

  //   COLOR: "0",
  //   messageDetails: "OTP Verified successfully.",
  // };
  const {
    data,
    status,
    message,
    messageDetails,
    access_token: accesstoken,
  } = await AuthSDK.internalFetcherPreLogin("FORGOTPWDOTPVERIFY", {
    USER_ID: username,
    REQUEST_CD: transactionId,
    OTP: otpnumber,
    AUTH_TYPE: auth_Type,
    SCREEN_FLAG: screenFlag,
  });
  if (status === "0") {
    return {
      data: data[0],
      status,
      message,
      messageDetails,
    };
  } else {
    return { status, data, message, messageDetails };
  }
};

export const updatenewPassword = async (transactionId, username, password) => {
  const {
    data,
    status,
    message,
    messageDetails,
    access_token: accesstoken,
  } = await AuthSDK.internalFetcherPreLogin("UPDATEFORGETNEWPASSWORD", {
    USER_NAME: username,
    REQUEST_CD: transactionId,
    USER_PASSWORD: password,
  });
  if (status === "0") {
    return {
      data: data[0],
      status,
      message,
      messageDetails,
    };
  } else {
    return { status, data, message, messageDetails };
  }
  // return {
  //   status: "0",
  //   message: "OTP Verified successfully.",
  //   RESPONSE_TYPE: "D",
  //   data: {
  //     STATUS: "S",
  //     REMARKS: "OTP successfully verified.",
  //   },

  //   COLOR: "0",
  //   messageDetails: "OTP Verified successfully.",
  // };
};

export const OTPResendRequest = async (
  companyID,
  branch_cd,
  contact,
  tran_type,
  validUpto,
  username
) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcherPreLogin("GETGENERATEOTP", {
      COMP_CD: companyID,
      BRANCH_CD: branch_cd,
      CONTACT2: contact,
      VALID_UPTO: validUpto,
      TRN_TYPE: tran_type,
      USER_ID: username,
    });
  if (status === "0") {
    return {
      data: data[0],
      status,
      message,
      messageDetails,
    };
  } else {
    return { status, data, message, messageDetails };
  }
};
// export const OTPResendRequest = async (
//   transactionId,
//   username,
//   tran_type,
//   companyID,
//   branch_cd
// ) => {
//   const { data, status, message, messageDetails } =
//     await AuthSDK.internalFetcherPreLogin("OTPRESEND", {
//       USER_ID: username,
//       TRAN_CD: transactionId,
//       TRN_TYPE: tran_type,
//       COMP_CD: companyID,
//       BRANCH_CD: branch_cd,
//     });
//   if (status === "0") {
//     return {
//       data: data[0],
//       status,
//       message,
//       messageDetails,
//     };
//   } else {
//     return { status, data, message, messageDetails };
//   }
// };

export const capture = async () => {
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
// export const verifyUserFinger = async (username, token) => {
//   const { data, status } = await AuthSDK.internalFetcher(
//     `./cbs/employee/verifyFinger`,
//     {
//       body: JSON.stringify({
//         requestData: {
//           userID: username,
//         },
//         channel: "W",
//       }),
//     },
//     token
//   );
//   if (status === "success") {
//     return { status, data: data?.responseData };
//   } else {
//     return { status, data: data?.errorData };
//   }
// };

export const biometricStatusUpdate = async (username, token, verifyStatus) => {
  const { data, status } = await AuthSDK.internalFetcher(
    `./cbs/employee/updateBiometricStatus`,
    {
      body: JSON.stringify({
        requestData: {
          userID: username,
          status: verifyStatus,
        },
        channel: "W",
      }),
    },
    token
  );
  return { status, data };
};
export const saveRecentScreenData = async ({
  branchCode,
  docCd,
  openTime,
  closeTime,
  tranDt,
  flag,
  uniqueAppId,
}) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "SAVERECENTSCREENDATA",
    {
      BRANCH_CD: branchCode,
      DOC_CD: docCd,
      OPEN_TIME: openTime,
      CLOSE_TIME: closeTime,
      UNIQUE_APP_ID: uniqueAppId,
      TRAN_DT: tranDt,
      FLAG: flag,
      APP_TRAN_CD: 51,
    }
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000;

const cacheImageData = async (imageURL, cacheName = "image-cache") => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLOGINIMAGEDATA", {
      APP_TRAN_CD: "51",
    });
  if (status === "0") {
    if ("caches" in window) {
      const cache = await caches.open(cacheName);

      const cachedResponse = {
        data: data,
        cachedAt: Date.now(),
      };

      await cache.put(imageURL, new Response(JSON.stringify(cachedResponse)));
    }
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

const getCachedImageData = async (imageURL, cacheName = "image-cache") => {
  if ("caches" in window) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(imageURL);
    if (cachedResponse) {
      const { data, cachedAt } = await cachedResponse.json();
      const isExpired = Date.now() - cachedAt > CACHE_EXPIRY_TIME;

      if (!isExpired) {
        return data;
      } else {
        await cache.delete(imageURL);
        return null;
      }
    }
  }
  return null;
};

const processImageData = async () => {
  let data = await getCachedImageData("/imageData");
  if (Boolean(data)) {
    return data;
  }
  if (!data) {
    data = await cacheImageData("/imageData");
  }
  return data;
};

export const getImageData = async () => {
  return await processImageData();
};

export const getContentData = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETLOGINPAGEDTL", {
      APP_TRAN_CD: "51",
    });
  if (status === "0") {
    const GenerateCRC32 = async (str) => {
      let fingerprint = await AuthSDK.Getfingerprintdata();
      return String(CRC32C.str((str || "") + fingerprint));
    };
    sessionStorage.setItem("specialChar", data?.[0]?.SPECIAL_CHAR ?? "");
    sessionStorage.setItem(
      "charchecksum",
      await GenerateCRC32(data?.[0]?.SPECIAL_CHAR ?? "")
    );
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
