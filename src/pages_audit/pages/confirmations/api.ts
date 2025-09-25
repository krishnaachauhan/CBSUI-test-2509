import { DefaultErrorObject } from "@acuteinfo/common-base";
import { CUSTOM_SCREEN_FLAG } from "components/utilFunction/constant";
import { AuthSDK } from "registry/fns/auth";

export const getConfirmationGridData = async (apiReqPara) => {
  let APIURL;
  let parameters = {};
  if (apiReqPara?.screenFlag === "chequebookCFM") {
    APIURL = "GETCHQCNFDATADISP";
    parameters = {
      FROM_DATE: apiReqPara?.FROM_DATE ?? apiReqPara?.workingDate,
      TO_DATE: apiReqPara?.TO_DATE ?? apiReqPara?.workingDate,
      FLAG: apiReqPara?.FLAG ?? "B",
    };
  } else if (apiReqPara?.screenFlag === "limitCFM") {
    APIURL = "GETLMTCNFDATADISP";
  } else if (apiReqPara?.screenFlag === "stockCFM") {
    APIURL = "GETSTOCKCNFDATADISP";
  } else if (apiReqPara?.screenFlag === "stopPaymentCFM") {
    APIURL = "GETSTOPCNFDATADISP";
  } else if (apiReqPara?.screenFlag === "lienCFM") {
    APIURL = "GETLIENCNFDATADISP";
  } else if (apiReqPara?.screenFlag === "tempOdCFM") {
    APIURL = "GETTEMPODAGCNFDATAGRID";
  } else if (apiReqPara?.screenFlag === "insuranceCFM") {
    APIURL = "GETINSURANCECNFDATADISP";
    parameters = {
      ENT_COMP_CD: apiReqPara?.COMP_CD,
      ENT_BRANCH_CD: apiReqPara?.BRANCH_CD,
      GD_DATE: apiReqPara?.workingDate,
    };
  } else if (apiReqPara?.screenFlag === "disburseCFM") {
    APIURL = "GETDISBCONFGRID";
    parameters = {
      WORKING_DATE: apiReqPara?.workingDate ?? "",
    };
  } else if (apiReqPara?.screenFlag === "unclaimedCFM") {
    APIURL = "GETUNCLAIMPAYMENTDATA";
    parameters = {
      ACCT_TYPE: "",
      ACCT_CD: "",
      FLAG: "",
      CONFIRMED: "0",
      LOGIN_BRANCH: apiReqPara?.BRANCH_CD ?? "",
      FOR: "D",
      WORKING_DATE: apiReqPara?.workingDate ?? "",
      USERNAME: apiReqPara?.USERNAME ?? "",
      USERROLE: apiReqPara?.USERROLE ?? "",
      SCREEN_REF: apiReqPara?.SCREEN_REF ?? "",
    };
  } else if (apiReqPara?.screenFlag === "photosignatureCFM") {
    APIURL = "GETCUSTSIGNPHOTOCONFGRID";
  } else if (apiReqPara?.screenFlag === CUSTOM_SCREEN_FLAG.SHARE_APP_ENTRY) {
    APIURL = "GETSHAREAPPMAINTABDTL";
    parameters = {
      WORKING_DATE: apiReqPara?.workingDate ?? "",
      SCREEN_REF: apiReqPara?.SCREEN_REF ?? "",
    };
  }

  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(APIURL, {
      ...parameters,
      COMP_CD: apiReqPara?.COMP_CD,
      BRANCH_CD: apiReqPara?.BRANCH_CD,
    });

  if (status === "0") {
    // return data;
    return data.map((item, index) => {
      //chequeboook
      item._rowColor =
        (item.AUTO_CHQBK_PRINT_FLAG && item.CONFIRMED === "N") ||
        (apiReqPara?.screenFlag === "stockCFM" && item.CONFIRMED === "N")
          ? "rgb(225, 0, 0)"
          : "";
      item.SERVICE_TAX = item.SERVICE_TAX
        ? parseFloat(item.SERVICE_TAX).toFixed(2)
        : "0.00";
      item.ACCT_BAL = item?.TRAN_BAL;
      item.DISPLAY_AUTO_CHQBK_FLAG =
        item?.AUTO_CHQBK_FLAG === "Y"
          ? "Yes"
          : item?.AUTO_CHQBK_FLAG === "N"
          ? "No"
          : "";
      item.FULL_ACCT_NO =
        item.COMP_CD +
        " " +
        item.BRANCH_CD +
        " " +
        item.ACCT_TYPE +
        " " +
        item.ACCT_CD;

      //limit

      item.INT_RATE = item.INT_RATE
        ? parseFloat(item.INT_RATE).toFixed(2)
        : "0.00";
      item.PENAL_RATE = item.PENAL_RATE
        ? parseFloat(item.PENAL_RATE).toFixed(2)
        : "0.00";
      item.AD_HOC_LIMIT_FLG =
        item.AD_HOC_LIMIT_FLG === "N"
          ? "Normal Limit"
          : item.AD_HOC_LIMIT_FLG === "A"
          ? "Ad-Hoc Limit"
          : null;

      item.EXPIRED_FLAG =
        item.EXPIRED_FLAG === "A"
          ? "Active"
          : item.EXPIRED_FLAG === "E"
          ? "Expired"
          : item.EXPIRED_FLAG;

      if (item.STATUS_FLAG === "E") {
        item._rowColor = "rgb(255, 225, 225)";
      }

      //stock

      item.STOCK_VALUE = item.STOCK_VALUE
        ? parseFloat(item.STOCK_VALUE).toFixed(2)
        : "0.00";
      item.MARGIN = item.MARGIN ? parseFloat(item.MARGIN).toFixed(2) : "0.00";
      item.DRAWING_POWER = item.DRAWING_POWER
        ? parseFloat(item.DRAWING_POWER).toFixed(2)
        : "0.00";

      //stopPayment

      item.CHEQUE_FROM_TO = item.CHEQUE_FROM + " - " + item.CHEQUE_TO;
      if (item.FLAG === "P") {
        item._rowColor = "#ebdcef";
      }
      if (item.FLAG === "S") {
        item._rowColor = "#cee0ef";
      }
      if (item.FLAG === "D") {
        item._rowColor = "#daefe2";
      }

      //lien

      item.PARENT_CD_NM = item.PARENT_CD + " - " + item.LEAN_NM;
      item.LIEN_STATUS_DISPLAY =
        item.LIEN_STATUS === "A"
          ? "Active"
          : item.LIEN_STATUS === "E"
          ? "Expired"
          : null;
      item.UNIQUE_NUM = Math.floor(Math.random() * 100000) + item?.SR_CD;

      // temporary OD against

      if (apiReqPara?.screenFlag === "disburseCFM") {
        item.UNIQUE_NO = index + 1;
      }

      // Unclaimed Account Payment
      item.FROM_ACCT_NO =
        item.FROM_COMP_CD ??
        "" + " " + item.FROM_BRANCH_CD ??
        "" + " " + item.FROM_ACCT_TYPE ??
        "" + " " + item.FROM_ACCT_CD ??
        "";

      item.TO_ACCT_NO =
        item.TO_COMP_CD ??
        "" + " " + item.TO_BRANCH_CD ??
        "" + " " + item.TO_ACCT_TYPE ??
        "" + " " + item.TO_ACCT_CD ??
        "";

      return item;
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
