import {
  DefaultErrorObject,
  formatCurrency,
  getCurrencySymbol,
  utilFunction,
} from "@acuteinfo/common-base";
import i18n from "components/multiLanguage/languagesConfiguration";
import { format } from "date-fns";
import { AuthSDK } from "registry/fns/auth";

/**
 * This function is used for dynamic screen ref for menu list API.
 * @param path Screen's main url (useLocation().pathname)
 * @param data Pass authState?.menulistdata
 * @returns Screen ref of perticular screen
 */
export const getdocCD = (path: string, data: any) => {
  const relativePath = path.replace("/EnfinityCore/", "");
  let cleanedPath;

  if (relativePath.includes("/")) {
    cleanedPath = relativePath.split("/").slice(0, 2).join("/");
  } else {
    cleanedPath = relativePath;
  }
  let screenList = utilFunction?.GetAllChieldMenuData(data, true);
  const matchingPath = screenList.find((item) => item.href === cleanedPath);

  if (matchingPath) {
    return `${matchingPath.user_code.trim()}`;
  }
  return "";
};

/**
 * This function is used to validate the branch code when selecting the HO branch from another branch.
 * @param currentField pass currentField
 * @param messageBox pass formState?.MessageBox
 * @param authState pass authState
 * @returns Boolean value
 */
export const validateHOBranch = async (
  currentField: any,
  messageBox: any,
  authState: any,
  errorMessage?: any
) => {
  if (!currentField?.value) return;
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETBRANCHVALIDATE", {
      LOGIN_BRANCH_CD: authState?.user?.branchCode ?? "",
      BASE_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
      BRANCH_CD: currentField?.value ?? "",
      COMP_CD: authState?.companyID ?? "",
      LANG: i18n.resolvedLanguage ?? "",
    });
  if (status === "0") {
    if (data?.[0]?.ALLOW_HO !== "Y") {
      const buttonName = await messageBox({
        messageTitle: "HOBranchValidMessageTitle",
        message: data?.[0]?.ALLOW_HO ?? "HOBranchValidMessage",
        buttonNames: ["Ok"],
        icon: "ERROR",
      });
      if (buttonName === "Ok") {
        return true;
      }
    }
    return false;
  } else {
    if (errorMessage) {
      const buttonName = await messageBox({
        messageTitle: messageDetails?.trim()
          ? messageDetails?.trim()
          : "ValidationFailed",
        message: message ?? "Somethingwenttowrong",
        buttonNames: ["Ok"],
        icon: "ERROR",
      });
      if (buttonName === "Ok") {
        return true;
      }
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  }
};

export const getPadAccountNumber = (accountNo, optionData) => {
  return accountNo
    ?.trim()
    ?.padStart(optionData?.PADDING_NUMBER ?? 6, "0")
    .padEnd(20, " ");
};

export const isBase64 = (str = ""): boolean => {
  if (typeof str !== "string") {
    return false;
  }
  const base64Regex =
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

  return base64Regex.test(str);
};

/**
 * This function is used to display common validation message in message box.
 * @param data pass api response in array format with O_STATUS, O_MSG_TITLE, O_MESSAGE keys required.
 * @param messageBox pass MessageBox function from usePopupContext
 * @param options pass options for custom logic on Yes/No button click with onYes/onNo keys. Its optional for perform any action on Yes/No button click.
 * @returns Object with O_STATUS, O_MSG_TITLE, O_MESSAGE keys or null if no data is found.
 */
export const handleDisplayMessages = async (
  data: any,
  MessageBox: any,
  options: any = {}
) => {
  let response = {};
  for (const obj of data ?? []) {
    const status = obj?.O_STATUS;
    if (status === "999") {
      await MessageBox({
        messageTitle: obj?.O_MSG_TITLE?.length
          ? obj?.O_MSG_TITLE
          : "ValidationFailed",
        message: obj?.O_MESSAGE ?? "",
        icon: "ERROR",
      });
      response = {};
    } else if (status === "9") {
      await MessageBox({
        messageTitle: obj?.O_MSG_TITLE?.length ? obj?.O_MSG_TITLE : "Alert",
        message: obj?.O_MESSAGE ?? "",
        icon: "WARNING",
      });
      response = obj;
    } else if (status === "99") {
      const buttonName = await MessageBox({
        messageTitle: obj?.O_MSG_TITLE?.length
          ? obj?.O_MSG_TITLE
          : "Confirmation",
        message: obj?.O_MESSAGE ?? "",
        buttonNames: ["Yes", "No"],
        defFocusBtnName: "Yes",
        icon: "CONFIRM",
      });

      if (buttonName === "Yes") {
        if (typeof options.onYes === "function") {
          response = await options.onYes(obj);
        } else {
          response = obj;
        }
      }

      if (buttonName === "No") {
        if (typeof options.onNo === "function") {
          response = await options.onNo(obj);
        } else {
          response = {};
          break;
        }
      }
    } else if (status === "0") {
      response = obj;
    }
  }
  return response;
};

export const convertValueStringBooleans = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(convertValueStringBooleans);
  } else if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        convertValueStringBooleans(value),
      ])
    );
  } else if (typeof obj === "string") {
    if (obj.toLowerCase() === "true") return true;
    if (obj.toLowerCase() === "false") return false;
    return obj;
  }
  return obj;
};

export const parseAndReplaceGridMetdata = (jsonString) => {
  // Step 1: Parse the JSON string into a JavaScript object
  let metadata;
  try {
    metadata = JSON.parse(jsonString);
  } catch (error) {
    console.error("Invalid JSON string:", error);
    return null;
  }

  // Step 2: Convert string booleans to real booleans (recursively)
  metadata = convertValueStringBooleans(metadata);

  // Step 3: Replace stringified functions in columns
  if (Array.isArray(metadata.columns)) {
    metadata.columns = metadata.columns.map((column) => {
      if (typeof column.shouldExclude === "string") {
        column.shouldExclude = new Function(`return ${column.shouldExclude}`)();
      }
      if (typeof column.setFooterValue === "string") {
        column.setFooterValue = new Function(
          "formatCurrency",
          "getCurrencySymbol",
          `return ${column.setFooterValue}`
        )(formatCurrency, getCurrencySymbol);
      }
      return column;
    });
  }

  // Step 4: Return the actual JSON object
  return metadata;
};

export const formatDateMinusDays = (
  date: string | Date,
  daysToSubtract: number
): string => {
  const baseDate = new Date(date ?? new Date());

  const resultDate = new Date(baseDate);
  resultDate.setDate(baseDate.getDate() - daysToSubtract);

  return format(resultDate, "dd-MMM-yyyy");
};

/**
 * Returns a new object where specific numeric keys
 * are formatted like oldData's values.
 *
 * @param {object} newData - The new values
 * @param {object} oldData - The old values (source of format)
 * @param {string[]} keys - Keys to format
 * @returns {object} - New data with formatted values
 */
export const preserveOldFormat = (
  newData: Record<string, any>,
  oldData: Record<string, any>,
  keys: string[]
) => {
  const result = { ...newData };

  keys.forEach((key) => {
    const oldVal = oldData?.[key];
    const newVal = newData?.[key];

    // If value is empty string, null, or undefined → skip
    if (newVal === "" || oldVal === "" || newVal == null || oldVal == null)
      return;

    // Check if both are numeric-like
    if (!isNaN(Number(oldVal)) && !isNaN(Number(newVal))) {
      const normOld = Number(oldVal);
      const normNew = Number(newVal);

      // If numerically equal → preserve old format
      if (normOld === normNew) {
        result[key] = oldVal.toString();
      }
    }
  });

  return result;
};
