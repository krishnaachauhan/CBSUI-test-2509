import { getFormattedDate } from "components/agGridTable/utils/helper";
import * as API from "./api";
import { t } from "i18next";

export const validateField = (params, accessor) => {
  const value = params?.newValue?.toString().trim();

  if (accessor === "ID_CUST_NM") {
    if (!value) {
      return "Enter Name";
    }
    if (/[*:&]/.test(value)) {
      params?.node?.setData({
        ...params.node.data,
        ID_CUST_NM: "",
      });
      return "Not allowed *:#";
    }
  }

  if (accessor === "ID_CONTACT2") {
    if (!value) {
      return "Enter Mobile No.";
    }
    if (!/^\d{10}$/.test(value)) {
      params?.node?.setDataValue("ID_CONTACT2", "");
      return "Not Valid Number";
    }
  }

  if (accessor === "ID_ADDRESS") {
    if (!value) {
      return "Enter Address";
    }
    if (/[*:&]/.test(value)) {
      params?.node?.setData({
        ...params.node.data,
        ID_ADDRESS: "",
      });
      return `Not allowed *:#`;
    }
  }
};

export const handleCrossAccessorPostValidation = async ({
  value,
  node,
  api,
  accessor,
  authState,
  MessageBox,
}) => {
  if (accessor === "CUSTOMER_ID") {
    const custId = value?.toString()?.trim();
    const compCd = authState?.companyID ?? "";

    if (!custId || isNaN(custId) || !Number(custId) || !compCd) return;

    try {
      const CustomerIdAPI = await API.getCustomerValidate({
        COMP_CD: compCd,
        CUST_ID: custId,
      });
      const status = CustomerIdAPI?.[0]?.CUST_STATUS ?? "";
      if (Array.isArray(CustomerIdAPI) && status.length === 0) {
        const setData = await API.getCustomerDtl({
          COMP_CD: compCd ?? "",
          CUSTOMER_ID: custId ?? "",
        });

        node.setData({
          ...node.data,
          ID_CUST_NM: setData?.[0]?.ACCT_NM || setData?.[0]?.ID_CUST_NM || "",
          ID_CONTACT2: setData?.[0]?.CONTACT2 ?? "",
          ID_ADDRESS: setData?.[0]?.ID_ADDRESS ?? "",
          TRAN_DT: getFormattedDate(authState?.workingDate) ?? "",
          ALLOTED: node?.data?.ALLOTED ?? "",
          ALLOW_EDIT: "Y",
          CUSTOMER_ID: custId,
          TRAN_CD: node?.data?.TRAN_CD ?? "",
          REMARKS: "",
          newRow: true,
          errors: [],
        });
      } else {
        const btnName = await MessageBox({
          message: status,
          messageTitle: t("ValidationFailed"),
          icon: "ERROR",
          buttonNames: ["Ok"],
        });

        if (btnName === "Ok") {
          if (node.data.CUSTOMER_ID !== "") {
            api.setFocusedCell(node?.rowIndex, "CUSTOMER_ID");
            node.setData({
              ...node.data,
              CUSTOMER_ID: "",
              ID_CUST_NM: "",
              ID_CONTACT2: "",
              ID_ADDRESS: "",
              REMARKS: "",
              TRAN_DT: node.data.TRAN_DT,
              ALLOW_EDIT: node.data.ALLOW_EDIT,
            });
          }
        }
      }
    } catch (error) {
      console.error("Validation API failed", error);
    }
  }
};
