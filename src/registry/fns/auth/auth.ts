import { CommonFetcherPreLoginResponse, CommonFetcherResponse } from "../type";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { GetAPIURLFromAction } from "./apiMapping";
import { utilFunction } from "@acuteinfo/common-base";
import { format } from "date-fns";
import { decryptResponse, encryptRequest } from "utils/Encryption";
import platform from "platform";

const authAPI = () => {
  let baseURL: URL | null = null;
  let websocketURL: URL | null = null;
  let PackageName: string = "";
  let loginuserDetailsData: any = {};
  let browserFingerPrint = "";
  let machineName = "";
  let accessToken: any | null = null;
  let displayLanguage = "en";
  let webSocketEnableFlag: String = "N";

  const initiateWebSocketEnableFlag = (WEBSOCKET_ENABLED: String) => {
    webSocketEnableFlag = WEBSOCKET_ENABLED;
  };

  const getWebSocketEnableFlag = () => {
    return webSocketEnableFlag === "Y";
  };

  const apiURL = () => {
    return baseURL;
  };
  const getWebsocketURL = () => {
    return websocketURL;
  };

  const inititateAPI = (APIURL: string, PACKAGE_NAME: string) => {
    baseURL = new URL(APIURL);
    PackageName = PACKAGE_NAME;
    GetBrowserFingerPrint();
  };
  const inititateWebSocketUrl = (WEBSOCKET_URL: string) => {
    websocketURL = new URL(WEBSOCKET_URL);
  };

  const Getfingerprintdata = async () => {
    let retvalue = browserFingerPrint;
    if (!Boolean(browserFingerPrint)) {
      retvalue = await GetBrowserFingerPrint();
    }
    return retvalue;
  };
  const GetBrowserFingerPrint = async () => {
    let fingerprintdata = "";

    await FingerprintJS.load()
      .then((Fingerprint) => Fingerprint.get())
      .then((result) => {
        fingerprintdata = result.visitorId;
      })
      .catch((e) => console.log(e));

    browserFingerPrint = fingerprintdata;
    return fingerprintdata;
  };
  const GetMachineName = () => {
    if (!Boolean(machineName)) {
      // Get browser information
      const browserInfo = platform.name + " " + platform.version;

      // Get operating system information
      const osInfo = platform.os.family + " " + platform.os.version;

      // Get device information
      const deviceInfo = platform.product;

      let machineInfo =
        (Boolean(browserInfo) ? browserInfo + "-" : "") +
        (Boolean(osInfo) ? osInfo + "-" : "") +
        (Boolean(deviceInfo) ? deviceInfo : "");
      machineInfo = machineInfo.substring(0, 25);
      machineInfo = machineInfo.endsWith("-")
        ? machineInfo.substring(0, machineInfo?.length - 1)
        : machineInfo;

      machineName = machineInfo;
      return machineInfo;
    }
    return machineName;
  };
  const setDisplayLanguage = (code) => {
    displayLanguage = code;
  };
  const loginUserDetails = ({
    role,
    user: { id, branchCode, baseBranchCode },
    baseCompanyID,
    companyID,
    workingDate,
  }) => {
    loginuserDetailsData = {
      USERNAME: id,
      USERROLE: role,
      BROWSER_FINGERPRINT: browserFingerPrint,
      MACHINE_NAME: GetMachineName(),
      BRANCH_CD: branchCode,
      BASE_BRANCH_CD: baseBranchCode,
      COMP_CD: companyID,
      BASE_COMP_CD: baseCompanyID,
      THROUGH_CHANNEL: "E_CBS",
      WORKING_DATE: workingDate ?? "",
      // WORKING_DT: workingDate ?? "",
      HO_LOGIN:
        companyID.trim() === baseCompanyID.trim() &&
        branchCode.trim() === baseBranchCode.trim()
          ? "Y"
          : "N",
    };
  };
  const setToken = (argaccessToken) => {
    accessToken = argaccessToken;
  };
  const removeToken = () => {
    accessToken = null;
  };
  const getToken = () => {
    return accessToken;
  };
  const internalFetcherPreLogin = async (
    url: string,
    payload: any,
    header: any = {},
    timeout: number | null = null,
    controller: AbortController = new AbortController()
  ): Promise<CommonFetcherPreLoginResponse> => {
    if (baseURL === null) {
      return {
        status: "999",
        message: "API not inititated",
        messageDetails: "",
        data: [],
      };
    }
    try {
      //*** Set Api Url */
      let apiurl = GetAPIURLFromAction(url, PackageName);

      if (!Boolean(timeout)) {
        timeout = 360000;
      }
      const APIRequestFormat = JSON.stringify({
        ACTION: "",
        DISPLAY_LANGUAGE: displayLanguage,
        BROWSER_FINGERPRINT: browserFingerPrint,
        LOGINUSERDETAILS: {
          USERNAME: payload.USER_ID ?? loginuserDetailsData?.USERNAME ?? "",
          USERROLE: loginuserDetailsData?.USERROLE ?? "role",
          BROWSER_FINGERPRINT: browserFingerPrint,
          MACHINE_NAME_FRONT: "",
          BRANCH_CD: loginuserDetailsData?.BRANCH_CD ?? "",
          THROUGH_CHANNEL: "E_CBS",
          WORKING_DATE: loginuserDetailsData?.WORKING_DATE ?? "",
          BASE_BRANCH_CD: loginuserDetailsData?.BASE_BRANCH_CD ?? "",
          COMP_CD: loginuserDetailsData?.COMP_CD ?? "",
          BASE_COMP_CD: loginuserDetailsData?.BASE_COMP_CD ?? "",
        },
        ...payload,
      });
      let Request;
      if (process.env.NODE_ENV === "production") {
        const Encryption = await encryptRequest(APIRequestFormat);
        Request = JSON.stringify(Encryption?.encryptedRequestData);
      } else {
        Request = APIRequestFormat;
      }
      const getByteLength = (str) => {
        const encoder = new TextEncoder();
        const encodedStr = encoder.encode(str);
        return encodedStr.length;
      };
      let response = await fetchWithTimeout(new URL(apiurl, baseURL).href, {
        method: "POST",
        headers: {
          DISPLAY_LANGUAGE: displayLanguage,
          ...header,
          "Content-Type": "application/json",
          CheckSumLength: `${getByteLength(APIRequestFormat)}`,
        },
        body: Request,
        timeout: timeout,
        controller: controller,
      });
      if (String(response.status) === "200") {
        let data = await response.json();
        if (response.headers.get("encFlag") === "Y") {
          const DecryptResponse = await decryptResponse(
            data?.RESPONSE,
            Request?.key
          );
          data = JSON.parse(DecryptResponse);
        } else if (Array.isArray(data)) {
          data = data[0];
        }
        return {
          status: String(data.STATUS),
          message: data?.MESSAGE ?? "",
          data: data?.RESPONSE ?? [],
          messageDetails: data?.RESPONSEMESSAGE ?? "",
          responseType: data?.RESPONSE?.[0]?.RESPONSE_TYPE ?? "",
          access_token: data?.ACCESS_TOKEN ?? data,
        };
      } else {
        return {
          status: "999",
          message: await GetStatusMessage(response),
          data: [],
          messageDetails: GetDetailsMessage(
            response.status,
            response?.statusText ?? "",
            new URL(apiurl, baseURL).href
          ),
        };
      }
    } catch (e) {
      return {
        status: "999",
        data: [],
        message: String(e),
        messageDetails: "",
      };
    }
  };

  const waitForToken = (key: string) => {
    return new Promise((res) => {
      if (localStorage.getItem(key) === null) res("no data set yet");
      const intervalId = setInterval(() => {
        const localVal = localStorage.getItem(key);

        if (localVal !== "refreshing") {
          clearInterval(intervalId);
          localStorage.removeItem(key);
          res("ok");
        }
      }, 200);
    });
  };

  const appendUniqueID = (data) => {
    const returnData =
      data?.ISDATACOMPRESSED === "Y"
        ? utilFunction.uncompressApiResponse(data?.RESPONSE?.[0]?.DATA ?? "") ??
          []
        : data?.RESPONSE ?? [];

    if (
      data?.STATUS === "0" &&
      returnData?.length > 0 &&
      data?.REPORT_PERSONALIZATION_ID
    ) {
      returnData[0].REPORT_PERSONALIZATION_ID = data?.REPORT_PERSONALIZATION_ID;
    }
    return returnData;
  };

  const internalFetcher = async (
    url: string,
    payload: any,
    header: any = {},
    timeout: number | null = null,
    controller: AbortController = new AbortController()
  ): Promise<CommonFetcherResponse> => {
    if (baseURL === null) {
      return {
        status: "999",
        message: "API not inititated",
        messageDetails: "",
        data: [],
      };
    }
    try {
      //*** Set Api Url */
      let apiurl = GetAPIURLFromAction(url, PackageName);

      if (!Boolean(timeout)) {
        timeout = 360000;
      }

      let localbaseURL = baseURL;
      // if (
      //   apiurl ===
      //   "./adminPanelCommonServiceAPI/DMLOPRATION/SERVICE_CHARGE_OPERATION"
      // ) {
      //   localbaseURL = new URL("http://localhost:8088/");
      // }
      await waitForToken("token_status");
      const SaveRequest = JSON.stringify({
        ACTION: "",
        DISPLAY_LANGUAGE: displayLanguage,
        LOGINUSERDETAILS: loginuserDetailsData,
        ...payload,
      });
      let Request;
      if (url === "GETDECRYPTEDRESPONSE") {
        Request = SaveRequest;
      } else if (process.env.NODE_ENV === "production") {
        const Encryption = await encryptRequest(SaveRequest);
        Request = JSON.stringify(Encryption?.encryptedRequestData);
      } else {
        Request = SaveRequest;
      }
      const getByteLength = (str) => {
        const encoder = new TextEncoder();
        const encodedStr = encoder.encode(str);
        return encodedStr.length;
      };
      let response = await fetchWithTimeout(
        new URL(apiurl, localbaseURL).href,
        {
          method: "POST",
          headers: {
            DISPLAY_LANGUAGE: displayLanguage,
            ...header,
            "Content-Type": "application/json",
            Authorization: utilFunction.getAuthorizeTokenText(
              accessToken?.access_token,
              accessToken?.token_type
            ),
            CheckSumLength: `${getByteLength(SaveRequest)}`,
            UniqueID: browserFingerPrint,
            USER_ID: loginuserDetailsData?.USERNAME,
          },
          body: Request,
          timeout: timeout,
          controller: controller,
        }
      );

      if (String(response.status) === "200") {
        if (response.headers.get("Content-Type") === "application/pdf") {
          let data = await response.blob();
          return {
            status: "0",
            message: "",
            data,
            messageDetails: "",
            isPrimaryKeyError: false,
          };
        } else {
          let data = await response.json();
          if (response.headers.get("encFlag") === "Y") {
            const DecryptResponse = await decryptResponse(
              data?.RESPONSE,
              Request?.key
            );
            data = JSON.parse(DecryptResponse);
          } else if (Array.isArray(data)) {
            data = data[0];
          }
          return {
            status: String(data.STATUS),
            message: data?.MESSAGE ?? "",
            data: appendUniqueID(data),
            // data:
            //   data?.ISDATACOMPRESSED === "Y"
            //     ? utilFunction?.uncompressApiResponse(
            //         data?.RESPONSE?.[0]?.DATA ?? ""
            //       ) ?? []
            //     : data?.RESPONSE ?? [],
            messageDetails: data?.RESPONSEMESSAGE ?? "",
            isPrimaryKeyError:
              String(data.STATUS) === "0"
                ? false
                : (data?.RESPONSEMESSAGE ?? "").indexOf(
                    "ORA-00001: unique constraint"
                  ) >= 0
                ? true
                : false,
          };
        }
      } else if (String(response.status) === "401" && url !== "LOGOUTUSER") {
        console.log("logout-due-to 401, notlogout outside");
        //@ts-ignore
        if (typeof window.__logout === "function") {
          console.log("logout-due-to 401, notlogout inside");
          //@ts-ignore
          window.__logout();
        }
        return {
          status: "999",
          message: await GetStatusMessage(response),
          data: [],
          messageDetails: GetDetailsMessage(
            response.status,
            response?.statusText ?? "",
            new URL(apiurl, baseURL).href
          ),
        };
      } else {
        return {
          status: "999",
          message: await GetStatusMessage(response),
          data: [],
          messageDetails: GetDetailsMessage(
            response.status,
            response?.statusText ?? "",
            new URL(apiurl, baseURL).href
          ),
        };
      }
    } catch (e) {
      return {
        status: "999",
        data: [],
        message: String(e),
        messageDetails: "",
      };
    }
  };
  const fetchWithTimeout = async (resource: string, options?: any) => {
    const isCustomAbortHandler = !!options?.controller;
    const { timeout = 90000, controller = new AbortController() } = options;

    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(resource, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);

      if (response.status === 503) {
        throw new Error("Service unavailable (503)");
      }

      return response;
    } catch (err: any) {
      clearTimeout(id);

      console.log("Fetch error:", err);

      if (err.name === "AbortError" && !isCustomAbortHandler) {
        throw new Error(
          "Timeout: Your request has been timed out or cancelled by the user."
        );
      } else if (err instanceof TypeError) {
        throw new Error(
          "The system cannot process your request right now. Please retry after sometime. If the issue persists or is urgent, please contact IT support."
        );
      } else {
        throw err;
      }
    }
  };
  const GetStatusMessage = async (response) => {
    let responsedata = await response?.json();

    if (response.status === 404 && process.env.NODE_ENV !== "production") {
      return "'????? ???? ??? ?? ???? ????' ???, ?? ???? ???? ??! ????? ... ?? ??? ?????? ??????? ??? ?? ?????? ??, ??????? ?? ????? ????? ???? ???? ??!";
    } else if (Boolean(responsedata)) {
      let message = Array.isArray(responsedata)
        ? responsedata?.[0]?.MESSAGE
        : "";
      if (Boolean(message)) {
        return message;
      } else {
        return "Something went to wrong ! Please try after some time.";
      }
    } else {
      return "Something went to wrong ! Please try after some time.";
    }
  };
  const GetDetailsMessage = (status, statusMessage, url) => {
    if (status === 404 && process.env.NODE_ENV !== "production") {
      return (
        "API URL : " +
        url +
        (Boolean(statusMessage) ? " Status Message :" + statusMessage : "")
      );
    }
    return "";
  };
  return {
    inititateAPI,
    inititateWebSocketUrl,
    internalFetcher,
    loginUserDetails,
    internalFetcherPreLogin,
    setToken,
    removeToken,
    getToken,
    Getfingerprintdata,
    setDisplayLanguage,
    apiURL,
    getWebsocketURL,
    initiateWebSocketEnableFlag,
    getWebSocketEnableFlag,
  };
};

export const AuthSDK = authAPI();
