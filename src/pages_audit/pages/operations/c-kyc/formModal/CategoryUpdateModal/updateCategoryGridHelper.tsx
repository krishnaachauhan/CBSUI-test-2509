import * as API from "../../api";

export const handleBlurUpdFlag = async ({
  newValue,
  node,
  api,
  accessor,
  onValueChange,
  context,
}) => {
  const setIfGreaterThanZero = (newVal, oldVal) => {
    return parseFloat(newVal) > 0 ? newVal : oldVal ?? 0;
  };
  if (newValue) {
    const formData =
      await context.gridContext?.formRef?.current?.getFieldData();

    const apiData = node.data["APIDATA"];

    const PARENT_CODE = apiData?.SYS_TYPE ?? "";
    const INST_RS = apiData?.NEW_INST_RS ?? "";
    const DUE_AMT = apiData?.NEW_DUE_AMT ?? "";
    let reqObj = {
      CUSTOMER_ID: context.gridContext?.CUSTOMER_ID ?? "",
      COMP_CD: context.gridContext?.authState?.companyID ?? "",
      BRANCH_CD: context.gridContext?.authState?.user?.branchCode ?? "",

      ACCT_TYPE: apiData?.ACCT_TYPE ?? "",
      ACCT_CD: apiData?.ACCT_CD ?? "",
      CATEG_CD: formData?.NEW_CATEG_CD,
      PARENT_TYPE: apiData?.PARENT_TYPE ?? "",
      PARENT_CODE: PARENT_CODE,
      SANCTIONED_AMT: apiData?.SANCTIONED_AMT ?? "",
      INST_NO: apiData?.INST_NO ?? "",
      INST_RS: INST_RS,
      INSTALLMENT_TYPE: apiData?.INSTALLMENT_TYPE ?? "",
      LIMIT_AMOUNT: apiData?.LIMIT_AMOUNT ?? "",
      DUE_AMT: DUE_AMT,
      INT_RATE: node.data.NEW_INT_RATE ?? "",
      PENAL_RATE: node.data.NEW_PENAL_RATE?.value ?? "",
      AG_CLR_RATE: node.data.NEW_AG_CL_RATE?.value ?? "",
      INSURANCE_EXPIRY_PENAL_RT: node.data.NEW_INS_EXPIRY_PENAL_RATE ?? "",
      TYPE_CD: apiData?.TYPE_CD ?? "",
    };
    const response = await API.getCalculatedRate(reqObj);

    for (const obj of response?.data?.[0]?.MSG ?? []) {
      if (obj?.O_STATUS === "999") {
        await context.MessageBox({
          messageTitle: obj?.O_MSG_TITLE?.length ? obj?.O_MSG_TITLE : "Alert",
          message: obj?.O_MESSAGE ?? "",
          icon: "ERROR",
        });
        break;
      } else if (obj?.O_STATUS === "9") {
        await context.MessageBox({
          messageTitle: obj?.O_MSG_TITLE?.length ? obj?.O_MSG_TITLE : "Alert",
          message: obj?.O_MESSAGE ?? "",
          icon: "INFO",
        });
        continue;
      } else if (obj?.O_STATUS === "99") {
        await context.MessageBox({
          messageTitle: obj?.O_MSG_TITLE?.length ? obj?.O_MSG_TITLE : "Alert",
          message: obj?.O_MESSAGE ?? "",
          icon: "ERROR",
          buttonNames: ["Ok"],
        });
        break;
      } else if (obj?.O_STATUS === "0") {
        const {
          NEW_PENAL_RATE,
          NEW_AGCLR_RATE,
          NEW_DUE_AMT,
          NEW_INT_RATE,
          NEW_INSU_PENAL_RATE,
          NEW_INST_RS,
        } = response?.data?.[0];
        node.setData({
          ...node.data,
          NEW_AG_CL_RATE: setIfGreaterThanZero(
            NEW_AGCLR_RATE,
            node.data?.NEW_AG_CL_RATE
          ),
          NEW_INST_RS: setIfGreaterThanZero(
            NEW_INST_RS,
            node.data?.NEW_INST_RS
          ),
          NEW_INS_EXPIRY_PENAL_RATE: setIfGreaterThanZero(
            NEW_INSU_PENAL_RATE,
            node.data?.NEW_INS_EXPIRY_PENAL_RATE
          ),
          NEW_INT_RATE: setIfGreaterThanZero(
            NEW_INT_RATE,
            node.data?.NEW_INT_RATE
          ),
          NEW_PENAL_RATE: setIfGreaterThanZero(
            NEW_PENAL_RATE,
            node.data?.NEW_PENAL_RATE
          ),
          NEW_DUE_AMT: setIfGreaterThanZero(
            NEW_DUE_AMT,
            node.data?.NEW_DUE_AMT
          ),
        });
      }
    }
  } else {
    node.setData({
      ...node.data,
      NEW_AG_CL_RATE: 0,
      NEW_INST_RS: 0,
      NEW_INS_EXPIRY_PENAL_RATE: 0,
      NEW_INT_RATE: 0,
      NEW_PENAL_RATE: 0,
      NEW_DUE_AMT: 0,
    });
  }
};
