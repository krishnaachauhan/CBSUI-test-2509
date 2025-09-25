import { singletonFunctionRegisrationFactory } from "@acuteinfo/common-base";
import { GeneralAPI } from "./functions";
const { registerFn } = singletonFunctionRegisrationFactory;

registerFn("GetMiscValue", GeneralAPI.GetMiscValue);
registerFn("getValidateValue", GeneralAPI.getValidateValue);
registerFn("getCustType", GeneralAPI.getCustType);
registerFn("getAccountTypeList", GeneralAPI.getAccountTypeList);
registerFn("getCustomerIdValidate", GeneralAPI.getCustomerIdValidate);
registerFn(
  "retrieveStatementDtlFullAcctNo",
  GeneralAPI.retrieveStatementDtlFullAcctNo
);
registerFn("retrieveStatementDtlAcctCd", GeneralAPI.retrieveStatementDtlAcctCd);

registerFn("getBranchCodeList", GeneralAPI.getBranchCodeList);
registerFn("retrieveStatementDetails", GeneralAPI.retrieveStatementDetails);
registerFn("getReportAccountType", GeneralAPI.getReportAccountType);
registerFn("getTbgDocMstData", GeneralAPI.getTbgDocMstData);
registerFn("getActionDetailsData", GeneralAPI.getActionDetailsData);
registerFn("getquickViewList", GeneralAPI.getquickViewList);
registerFn("getMetadataList", GeneralAPI.getMetadataList);
registerFn("getKYCDocTypes", GeneralAPI.getKYCDocTypes);
registerFn("getTabelListData", GeneralAPI.getTabelListData);
registerFn("getChequeLeavesList", GeneralAPI.getChequeLeavesList);
registerFn("getDynDropdownData", GeneralAPI.getDynDropdownData);
registerFn("getDependentFieldList", GeneralAPI.getDependentFieldList);
registerFn("getProMiscData", GeneralAPI.getProMiscData);
registerFn("getZoneListData", GeneralAPI.getZoneListData);
registerFn("getMatureInstDetail", GeneralAPI.getMatureInstDetail);
registerFn("getAccNoValidation", GeneralAPI.getAccNoValidation);
registerFn("get_Account_Type", GeneralAPI.get_Account_Type);
registerFn("getChequeNoValidation", GeneralAPI.getChequeNoValidation);
registerFn("getPhotoSignHistory", GeneralAPI.getPhotoSignHistory);
registerFn("getCustAccountLatestDtl", GeneralAPI.getCustAccountLatestDtl);
registerFn("getCalGstAmountData", GeneralAPI.getCalGstAmountData);
registerFn("getCalGstAmountData", GeneralAPI.getDateWithCurrentTime);
registerFn("getHoldChargeDropDown", GeneralAPI.getHoldChargeDropDown);
