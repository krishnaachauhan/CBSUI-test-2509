import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const stopPayDetail = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSTPGRIDDATADISP", {
      ...apiReqPara,
    });
  if (status === "0") {
    // return data;

    const dataStatus = data;
    dataStatus.map((item) => {
      item.FLAG =
        item.FLAG === "S"
          ? (item.FLAG = "Surrender Cheque")
          : item.FLAG === "D"
          ? (item.FLAG = "PDC")
          : item.FLAG === "P"
          ? (item.FLAG = "Stop Payment")
          : item.FLAG;

      item.CONFIRMED_DISPLAY =
        item?.CONFIRMED === "Y" ? "Confirmed" : "Pending";

      if (item?.ALLOW_RELEASE === "Y") {
        item._rowColor = "rgb(255, 225, 225)";
      }

      return item;
    });
    return dataStatus;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const reasonDropdown = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSTPREASONDDW", {
      ...apiReqPara,
    });
  if (status === "0") {
    let responseData = data;

    if (Array.isArray(responseData)) {
      responseData = responseData.map(
        ({ DISLAY_REASON, REASON_CD, ...other }) => {
          return {
            value: REASON_CD,
            label: DISLAY_REASON,
            ...other,
          };
        }
      );
    }
    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const chequeValidate = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCHQBKSERIES", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const crudStopPayment = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOSTOPPAYMENTDML", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateInsert = async (apiReqPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATESTPDATA", {
      ...apiReqPara,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const stopPaymentConfirm = async (apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOSTOPPYTCONFIRMATION", { ...apireq });
  if (status === "99") {
    return { status: status, message: message };
  } else if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const stoppedChequeDetailsdata = async (apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETSTPCHQISSUEUSED", { ...apireq });
  if (status === "99") {
    return { status: status, message: message };
  } else if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
