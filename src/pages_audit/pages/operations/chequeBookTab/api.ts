import { DefaultErrorObject } from "@acuteinfo/common-base";
import { AuthSDK } from "registry/fns/auth";

export const getChequebookData = async ({ otherAPIRequestPara }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("CHEQUEBKDATA", {
      ...otherAPIRequestPara,
      // TRAN_CD: "1",
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getChequebookDTL = async (chequeDTLRequestPara) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCHEQUEBOOK", {
      ...chequeDTLRequestPara,
      // TRAN_CD: "1",
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const saveChequebookData = async (otherAPIRequestPara2) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOCHEQUEBKISSUE", {
      ...otherAPIRequestPara2,
      // TRAN_CD: "1",
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const chequebookCharge = async (Apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCHQBOOKCHARGE", {
      ...Apireq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateDeleteData = async (Apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDDELETECHQDATA", {
      ...Apireq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const chequeGridDTL = async (Apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCHQVIEWDETAILS", {
      ...Apireq,
    });
  if (status === "0") {
    return data.map((item, index) => {
      if (item.FLAG === "P") {
        item._rowColor = "#B2FF66";
        item.FLAG_DISPLAY = "Processed";
      }
      if (item.FLAG === "T") {
        item._rowColor = "#FFE1E1";
        item.FLAG_DISPLAY = "Stop Payment";
      }
      if (item.FLAG === "S") {
        item._rowColor = "#D3D3D3";
        item.FLAG_DISPLAY = "Surrender";
      }
      if (item.FLAG === "R") {
        // item._rowColor = "#ebdcef";
        item.FLAG_DISPLAY = "Cheque Return";
      }
      if (item.FLAG === "N") {
        item.FLAG_DISPLAY = "Not Processed";
      }
      if (item.FLAG === "D") {
        item._rowColor = "#66B2FF";
        item.FLAG_DISPLAY = "PDC";
      }

      return {
        ...item,
        index: index,
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getChequeBookFlag = async () => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETRETRIVECHQBKFLAG", {});
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const chequeBkConfirmGrid = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCHQCNFDATADISP", { ...apiReq });
  if (status === "0") {
    const dataStatus = data;
    dataStatus.map((item) => {
      item.SERVICE_TAX = item.SERVICE_TAX
        ? parseFloat(item.SERVICE_TAX).toFixed(2)
        : "0.00";
      item.FULL_ACCT_NO =
        item.BRANCH_CD + " " + item.ACCT_TYPE + " " + item.ACCT_CD;
      item.CHEQUE_SERIES = item.CHEQUE_FROM + " - " + item.CHEQUE_TO;
      return item;
    });
    return dataStatus;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const chequeBookCfm = async (apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("DOCHQBKCONFIRMATION", { ...apireq });
  if (status === "99") {
    return { status: status, message: message };
  } else if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateInsert = async (apiReq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATESAVECHQDATA", {
      ...apiReq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const issuedChequeBkDTL = async (apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCHEQUEBOOKISSUED", {
      ...apireq,
    });
  if (status === "0") {
    // return data;
    return data.map((item) => {
      if (item?.CONFIRMED === "Y") {
        item._rowColor = "rgb(9 132 3 / 51%)";
        item.CONFIRMED_DISPLAY = "Confirm";
      } else {
        item.CONFIRMED_DISPLAY = "Pending";
      }
      return item;
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const validateCheqbkCfm = async (apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("VALIDATECHQBKCONFRIMATIONDATA", {
      ...apireq,
    });
  if (status === "0") {
    return data;
    // return [
    //   {
    //     MSG: [
    //       {
    //         O_MESSAGE: "message - 9 ",
    //         O_STATUS: "9",
    //       },
    //       {
    //         O_MESSAGE: "message - 99",
    //         O_STATUS: "99",
    //       },
    //       {
    //         O_MESSAGE: "message - 9 ",
    //         O_STATUS: "9",
    //       },
    //       {
    //         O_MESSAGE: "message -999",
    //         O_STATUS: "999",
    //       },
    //       {
    //         O_MESSAGE: "msg - 999",
    //         O_STATUS: "999",
    //       },
    //       {
    //         O_MESSAGE: "SUCCESS",
    //         O_STATUS: "0",
    //       },
    //     ],
    //     CATEG_CD: "01  ",
    //     LIMIT_AMT: "83200",
    //     NPA_CD: "01B ",
    //     SANCTION_AMT: "180000",
    //     MOBILE_REG: "Y",
    //     OP_DATE: "2022-08-18 00:00:00.0",
    //     CUSTOMER_ID: "212923",
    //     ACCT_NM: "SHOEB M RAFIQ SHAIKH",
    //     WIDTH_BAL: "290005",
    //     CHEQUE_NO: "",
    //     STATUS: "O",
    //     TYPE_CD: "1",
    //     TRAN_BAL: "290005",
    //     CLOSE_DT: "",
    //   },
    // ];
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getTodayClearing = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDLYTRNTODAYCLEARBTN", reqData);
  if (status === "0") {
    let responseData = data;
    responseData.map((item, index) => {
      item.index = index;
    });

    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getReturnHistory = async (reqData) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDLYTRNCHQRTNBTN", reqData);
  if (status === "0") {
    let responseData = data;
    responseData.map((item, index) => {
      item.index = index;
    });

    return responseData;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const branchIsEditable = async (Apireq) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETCHEQUEBOOKPARA", {
      ...Apireq,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
