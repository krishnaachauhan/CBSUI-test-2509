import * as API from "../api";
import {
  getCommunityList,
  getCustomerGroupOptions,
  getOccupationDTL,
  getPMISCData,
  getRangeOptions,
  validateGSTIN,
} from "../api";
import { format, isValid } from "date-fns";
import { greaterThanDate, utilFunction } from "@acuteinfo/common-base";
import { t } from "i18next";
import { GeneralAPI } from "registry/fns/functions";
import { validateHOBranch } from "components/utilFunction/function";
import { REGEX } from "components/utilFunction/constant";

const handleValidateShareMemAcct = async (reqParameters, formState) => {
  const postData = await API.validateShareMemAcct(reqParameters);
  for (const obj of postData?.MSG ?? []) {
    if (
      obj?.O_STATUS === "999" ||
      obj?.O_STATUS === "99" ||
      obj?.O_STATUS === "9"
    ) {
      const buttonName = await formState?.MessageBox({
        messageTitle: obj?.O_MSG_TITLE?.length
          ? obj?.O_MSG_TITLE
          : obj?.O_STATUS === "9"
          ? "Alert"
          : obj?.O_STATUS === "99"
          ? "Confirmation"
          : "ValidationFailed",
        message: obj?.O_MESSAGE ?? "",
        buttonNames: obj?.O_STATUS === "99" ? ["Yes", "No"] : ["Ok"],
        icon:
          obj?.O_STATUS === "999"
            ? "ERROR"
            : obj?.O_STATUS === "99"
            ? "CONFIRM"
            : obj?.O_STATUS === "9"
            ? "WARNING"
            : "INFO",
      });
      if (
        obj?.O_STATUS === "999" ||
        (obj?.O_STATUS === "99" && buttonName === "No")
      ) {
        break;
      }
    } else if (obj?.O_STATUS === "0") {
      return postData;
    }
  }
  return false;
};

export const main_tab_metadata = {
  form: {
    name: "main_tab_form",
    label: "",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "sequence",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 6,
        },
        container: {
          direction: "row",
          spacing: 0.5,
        },
      },
    },
    componentProps: {
      textField: {
        fullWidth: true,
      },
      select: {
        fullWidth: true,
      },
      datePicker: {
        fullWidth: true,
      },
      numberFormat: {
        fullWidth: true,
      },
      inputMask: {
        fullWidth: true,
      },
      datetimePicker: {
        fullWidth: true,
      },
      Divider: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "hidden",
      },
      name: "HIDDEN_CUSTOMER_ID",
      ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "CUSTOMER_ID",
      label: "CustomerId",
      placeholder: "EnterCustomerID",
      validate: (currentField, dependentFields, formState) => {
        if (!Boolean(currentField?.value) && formState?.PARAM320 === "Y") {
          return "CustomerIDisrequired";
        } else return "";
      },
      maxLength: 12,
      FormatProps: {
        isAllowed: (values) => {
          const value = values?.value;
          if (value === "") return true;
          return Boolean(
            /^[0-9]+$/.test(value) &&
              !value?.startsWith("0") &&
              value?.length <= 12
          );
        },
      },
      autoComplete: "off",
      GridProps: { xs: 12, sm: 3, md: 2, lg: 2, xl: 2 },
      dependentFields: ["HIDDEN_CUSTOMER_ID", "MEM_ACCT_CD"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (Boolean(field?.value)) {
          if (
            field?.value === dependentFieldsValues?.HIDDEN_CUSTOMER_ID?.value
          ) {
            return {};
          }
          formState?.handleTabIconDisable(true);

          const data = await API.getCustomerData({
            CUSTOMER_ID: field.value,
            ACCT_TYPE: formState?.ACCT_TYPE ?? "",
            COMP_CD: authState?.companyID ?? "",
            SCREEN_REF: formState.docCD ?? "",
          });
          formState?.handleTabIconDisable(false);

          formState.flag = true;
          let response_messages: any[] = [];
          if (data && data?.[0]?.MSG && Array.isArray(data?.[0]?.MSG)) {
            response_messages = data?.[0]?.MSG;
          }
          if (response_messages?.length > 0) {
            const messagebox = async (msgTitle, msg, buttonNames, status) => {
              let buttonName = await formState.MessageBox({
                messageTitle: msgTitle,
                message: msg,
                buttonNames: buttonNames,
                icon:
                  status === "9"
                    ? "WARNING"
                    : status === "99"
                    ? "CONFIRM"
                    : status === "999"
                    ? "ERROR"
                    : status === "0" && "SUCCESS",
              });
              return { buttonName, status };
            };

            for (let i = 0; i < response_messages?.length; i++) {
              if (response_messages[i]?.O_STATUS !== "0") {
                let btnName = await messagebox(
                  response_messages[i]?.O_STATUS === "999"
                    ? response_messages[i]?.O_MSG_TITLE || "ValidationFailed"
                    : response_messages[i]?.O_STATUS === "99"
                    ? response_messages[i]?.O_MSG_TITLE || "Confirmed"
                    : response_messages[i]?.O_STATUS === "9"
                    ? response_messages[i]?.O_MSG_TITLE || "Alert"
                    : "Alert",
                  response_messages[i]?.O_MESSAGE,
                  response_messages[i]?.O_STATUS === "99"
                    ? ["Yes", "No"]
                    : ["Ok"],
                  response_messages[i]?.O_STATUS
                );
                if (btnName?.status === "999" || btnName?.buttonName === "No") {
                  return {
                    CUSTOMER_ID: {
                      value: "",
                      isFieldFocused: true,
                      ignoreUpdate: false,
                    },
                  };
                }
              } else {
                const jointDtlData = await API.getCustomerJointDetail({
                  CUSTOMER_ID: field.value,
                  COMP_CD: authState?.companyID ?? "",
                });
                if (jointDtlData) {
                  formState?.setDataOnFieldChange("JOINT_DATA", jointDtlData);
                }

                if (data?.[0]?.ACCOUNT_DTL) {
                  const CustomerData = data?.[0]?.ACCOUNT_DTL;
                  let isValid;
                  if (
                    CustomerData?.MEM_ACCT_CD &&
                    CustomerData?.MEM_ACCT_TYPE &&
                    field?.value
                  ) {
                    const reqParameters = {
                      COMP_CD: authState?.companyID ?? "",
                      BRANCH_CD:
                        dependentFieldsValues?.MEM_ACCT_CD?.value ?? "",
                      ACCT_TYPE: CustomerData?.MEM_ACCT_TYPE ?? "",
                      ACCT_CD: CustomerData?.MEM_ACCT_CD ?? "",
                      CUSTOMER_ID: field?.value ?? "",
                      WORKING_DATE: authState?.workingDate ?? "",
                      USERNAME: authState?.user?.id ?? "",
                      USERROLE: authState?.role ?? "",
                      SCREEN_REF: formState?.docCD ?? "",
                    };
                    if (formState?.SCREEN_FLAG !== "S") {
                      formState?.handleTabIconDisable(true);

                      isValid = await handleValidateShareMemAcct(
                        reqParameters,
                        formState
                      );
                      formState?.handleTabIconDisable(false);
                    }
                  }
                  if (formState?.SCREEN_FLAG !== "S") {
                    formState?.setDataOnFieldChange("DOC_DATA", {
                      customerId: field?.value,
                    });
                  }
                  return {
                    HIDDEN_CUSTOMER_ID: { value: field?.value },
                    CUSTOMER_TYPE: {
                      value: CustomerData?.CUSTOMER_TYPE ?? "",
                    },
                    GSTIN: { value: CustomerData?.GSTIN ?? "" },
                    MARITAL_STATUS: {
                      value: CustomerData?.MARITAL_STATUS ?? "",
                    },
                    CONTACT2: { value: CustomerData?.CONTACT2 ?? "" },
                    MASKED_CONTACT2: {
                      value: CustomerData?.MASKED_CONTACT2 ?? "",
                    },
                    MASKED_CONTACT1: {
                      value: CustomerData?.MASKED_CONTACT1 ?? "",
                      ignoreUpdate: true,
                    },
                    MASKED_CONTACT3: {
                      value: CustomerData?.MASKED_CONTACT3 ?? "",
                      ignoreUpdate: true,
                    },
                    MASKED_CONTACT4: {
                      value: CustomerData?.MASKED_CONTACT4 ?? "",
                      ignoreUpdate: true,
                    },
                    REMARKS: { value: CustomerData?.REMARKS ?? "" },
                    PIN_CODE: {
                      value: CustomerData?.PIN_CODE ?? "",
                      ignoreUpdate: true,
                    },
                    FIRST_NM: {
                      value: CustomerData?.FIRST_NM ?? "",
                    },
                    GROUP_CD: { value: CustomerData?.GROUP_CD ?? "" },
                    AREA_CD: {
                      value: CustomerData?.AREA_CD ?? "",
                      ignoreUpdate: true,
                    },
                    CITY_CD: { value: CustomerData?.CITY_CD ?? "" },
                    PASSPORT_NO: { value: CustomerData?.PASSPORT_NO ?? "" },
                    MOTHER_MAIDEN_NM: {
                      value: CustomerData?.MOTHER_MAIDEN_NM ?? "",
                    },
                    SHARE_ACCT_TYPE: {
                      value: CustomerData?.MEM_ACCT_TYPE ?? "",
                      ignoreUpdate: true,
                    },
                    UNIQUE_ID: { value: CustomerData?.UNIQUE_ID ?? "" },
                    MASKED_UNIQUE_ID: {
                      value: CustomerData?.MASKED_UNIQUE_ID ?? "",
                    },
                    MASKED_PASSPORT_NO: {
                      value: CustomerData?.MASKED_PASSPORT_NO ?? "",
                      ignoreUpdate: true,
                    },
                    ADD3: { value: CustomerData?.ADD3 ?? "" },
                    ADD1: { value: CustomerData?.ADD1 ?? "" },
                    ADD2: { value: CustomerData?.ADD2 ?? "" },
                    COMMU_CD: { value: CustomerData?.COMMU_CD ?? "" },
                    BIRTH_DT: { value: CustomerData?.BIRTH_DT ?? "" },
                    TRADE_CD: { value: CustomerData?.TRADE_CD ?? "" },
                    SHARE_ACCT_CD: {
                      value: isValid ? CustomerData?.MEM_ACCT_CD ?? "" : "",
                      ignoreUpdate: true,
                    },
                    GENDER: { value: CustomerData?.GENDER ?? "" },
                    CONTACT3: { value: CustomerData?.CONTACT3 ?? "" },
                    CONTACT1: { value: CustomerData?.CONTACT1 ?? "" },
                    SURNAME: {
                      value: CustomerData?.SURNAME ?? "",
                    },
                    CONTACT4: { value: CustomerData?.CONTACT4 ?? "" },
                    LAST_NM: {
                      value: CustomerData?.LAST_NM ?? "",
                    },
                    LF_NO: { value: CustomerData?.LF_NO ?? "" },
                    E_MAIL_ID: {
                      value: CustomerData?.E_MAIL_ID ?? "",
                      ignoreUpdate: true,
                    },
                    MOBILE_REG: {
                      value: Boolean(
                        CustomerData?.MOBILE_REG &&
                          CustomerData?.MOBILE_REG === "Y"
                      )
                        ? true
                        : false,
                    },
                    FORM_60: { value: CustomerData?.FORM_60 ?? "" },
                    PAN_NO: { value: CustomerData?.PAN_NO ?? "" },
                    MASKED_PAN_NO: { value: CustomerData?.MASKED_PAN_NO ?? "" },
                    TRADE_INFO: { value: CustomerData?.TRADE_INFO ?? "" },
                    AGE: { value: CustomerData?.AGE ?? "" },
                    CKYC_NUMBER: { value: CustomerData?.KYC_NUMBER ?? "" },
                    ACCT_NM: { value: CustomerData?.ACCT_NM ?? "" },
                    // CLASS_CD: { value: CustomerData?.RISK_CATEG ?? "" },
                    CUST_RISK_CATEG: {
                      value: CustomerData?.RISK_CATEG ?? "",
                    },
                    CATEG_CD: { value: CustomerData?.CATEG_CD ?? "" },
                    NEW_CATEG_CD: { value: CustomerData?.CATEG_CD ?? "" },
                    RATING_CD: { value: CustomerData?.RATE_CD ?? "" },
                    CITY: {
                      value: CustomerData?.CITY_NM ?? "",
                    },
                    DISTRICT: {
                      value: CustomerData?.DISTRICT_CD ?? "",
                    },
                    STATE: {
                      value: CustomerData?.STATE_CD ?? "",
                    },
                    COUNTRY: {
                      value: CustomerData?.COUNTRY_CD ?? "",
                    },
                    PATH_PHOTO: {
                      value: isValid
                        ? isValid?.ACCT_NM ?? ""
                        : CustomerData?.PATH_PHOTO ?? "",
                    },
                  };
                }
              }
            }
          }
        } else {
          return {
            HIDDEN_CUSTOMER_ID: { value: "" },
            CUSTOMER_TYPE: { value: "" },
            GSTIN: { value: "" },
            MARITAL_STATUS: { value: "" },
            REMARKS: { value: "" },
            PIN_CODE: { value: "" },
            FIRST_NM: { value: "" },
            GROUP_CD: { value: "" },
            AREA_CD: { value: "" },
            // CUSTOMER_ID: {v ""},
            CITY_CD: { value: "" },
            PASSPORT_NO: { value: "" },
            MOTHER_MAIDEN_NM: { value: "" },
            SHARE_ACCT_TYPE: { value: "" },
            MASKED_UNIQUE_ID: { value: "" },
            MASKED_PASSPORT_NO: { value: "" },
            ADD3: { value: "" },
            ADD1: { value: "" },
            ADD2: { value: "" },
            COMMU_CD: { value: "" },
            BIRTH_DT: { value: "" },
            TRADE_CD: { value: "" },
            SHARE_ACCT_CD: { value: "" },
            GENDER: { value: "" },
            CONTACT3: { value: "" },
            CONTACT2: { value: "" },
            MASKED_CONTACT2: { value: "" },
            MASKED_CONTACT1: { value: "" },
            MASKED_CONTACT3: { value: "" },
            MASKED_CONTACT4: { value: "" },
            CONTACT1: { value: "" },
            SURNAME: { value: "" },
            CONTACT4: { value: "" },
            LAST_NM: { value: "" },
            LF_NO: { value: "", ignoreUpdate: true },
            E_MAIL_ID: { value: "" },
            MOBILE_REG: { value: false },
            FORM_60: { value: "N" },
            PAN_NO: { value: "" },
            MASKED_PAN_NO: { value: "" },
            TRADE_INFO: { value: "" },
            AGE: { value: "" },
            CKYC_NUMBER: { value: "" },
            CLASS_CD: { value: "" },
            CATEG_CD: { value: "" },
            RATING_CD: { value: "" },
            CITY: { value: "" },
            DISTRICT: { value: "" },
            STATE: { value: "" },
            COUNTRY: { value: "" },
            PATH_PHOTO: { value: "" },
            ACCT_NM: { value: "" },
          };
        }
      },
      runPostValidationHookAlways: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CUSTOMER_TYPE",
      // ignoreInSubmit: true,
      shouldExclude: true,
    },
    {
      render: {
        componentType: "textField",
      },
      name: "FIRST_NM",
      label: "FirstName",
      placeholder: "EnterFirstName",
      type: "text",
      txtTransform: "uppercase",
      maxLength: 30,
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      autoComplete: "off",
      preventSpecialChars: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
      runPostValidationHookAlways: true,
      inputProps: {
        onInput: (event) => {
          event.target.value = event.target.value.replace(/[^a-zA-Z]/g, "");
        },
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "LAST_NM",
      label: "MiddleName",
      maxLength: 50,
      placeholder: "EnterMiddleName",
      type: "text",
      txtTransform: "uppercase",
      GridProps: { xs: 12, sm: 5, md: 3, lg: 2.4, xl: 2 },
      autoComplete: "off",
      preventSpecialChars: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
      inputProps: {
        onInput: (event) => {
          event.target.value = event.target.value.replace(/[^a-zA-Z]/g, "");
        },
      },
      runPostValidationHookAlways: true,
    },
    {
      render: {
        componentType: "textField",
      },
      name: "SURNAME",
      label: "SurnameFirm",
      maxLength: 100,
      placeholder: "EnterSurnameName",
      type: "text",
      txtTransform: "uppercase",
      required: true,
      autoComplete: "off",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["SurnameFirmIsRequired"] }],
      },
      GridProps: { xs: 12, sm: 6, md: 4, lg: 2.4, xl: 2 },
      preventSpecialChars: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
      inputProps: {
        onInput: (event) => {
          event.target.value = event.target.value.replace(/[^a-zA-Z]/g, "");
        },
      },
      runPostValidationHookAlways: true,
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ACCT_NM",
      label: "FullName",
      isReadOnly: true,
      GridProps: { xs: 12, sm: 6, md: 6, lg: 2.8, xl: 4 },
      dependentFields: ["FIRST_NM", "LAST_NM", "SURNAME"],

      setValueOnDependentFieldsChange: (dependentFieldsValues) => {
        const first = dependentFieldsValues?.FIRST_NM?.value ?? "";
        const last = dependentFieldsValues?.LAST_NM?.value ?? "";
        const surname = dependentFieldsValues?.SURNAME?.value ?? "";
        return `${first} ${last} ${surname}`.trim();
      },
    },
    {
      render: {
        componentType: "select",
      },
      name: "GENDER",
      label: "Gender",
      defaultOptionLabel: "SelectGender",
      options: [
        { label: "MALE", value: "M" },
        { label: "FEMALE", value: "F" },
        { label: "OTHER", value: "O" },
        { label: "TRANSGENDER", value: "T" },
      ],
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "BIRTH_DT",
      label: "DateOfBirth",
      setFieldLabel: (dependentValue) => {
        const custType = dependentValue?.CUSTOMER_TYPE?.value ?? "";
        const gender = dependentValue?.GENDER?.value ?? "";

        if (Boolean(custType)) {
          if (gender === "M" || gender === "F" || gender === "T") {
            return {
              label: "DateOfBirth",
              placeholder: "",
            };
          } else {
            return {
              label: "InceptionDate",
              placeholder: "",
            };
          }
        }
      },
      placeholder: "DD/MM/YYYY",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      isMaxWorkingDate: true,
      validate: (value, allField, flag) => {
        if (Boolean(value?.value)) {
          if (
            !utilFunction.isValidDate(utilFunction.getParsedDate(value?.value))
          ) {
            return "Mustbeavaliddate";
          } else if (
            greaterThanDate(value?.value, value?._maxDt, {
              ignoreTime: true,
            })
          ) {
            return t("DateShouldBeLessThanEqualToWorkingDT");
          }
        }
      },
      dependentFields: ["CUSTOMER_TYPE", "LF_NO", "GENDER"],
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (currentField?.value) {
          const reqParameters = {
            COMP_CD: authState?.companyID ?? "",
            BRANCH_CD: authState.user.branchCode ?? "",
            BIRTH_DT: Boolean(currentField?.value)
              ? format(
                  utilFunction.getParsedDate(currentField?.value),
                  "dd/MMM/yyyy"
                ).toUpperCase()
              : "",
            WORKING_DATE: authState?.workingDate ?? "",
            CUSTOMER_TYPE: dependentFieldValues?.CUSTOMER_TYPE?.value ?? "",
          };
          formState?.handleTabIconDisable(true);

          const postData = await API.getMinorMajorAgeData(reqParameters);
          formState?.handleTabIconDisable(false);

          let btn99, returnVal;
          const getButtonName = async (obj) => {
            let btnName = await formState.MessageBox(obj);
            return { btnName, obj };
          };
          for (let i = 0; i < postData.length; i++) {
            if (postData[i]?.O_STATUS === "999") {
              await getButtonName({
                messageTitle: postData?.[i]?.O_MSG_TITLE
                  ? postData?.[i]?.O_MSG_TITLE
                  : "ValidationFailed",
                message: postData?.[i]?.O_MESSAGE,
                icon: "ERROR",
              });
              returnVal = "";
            } else if (postData[i]?.O_STATUS === "9") {
              if (btn99 !== "No") {
                await getButtonName({
                  messageTitle: postData?.[i]?.O_MSG_TITLE
                    ? postData?.[i]?.O_MSG_TITLE
                    : "Alert",
                  message: postData?.[i]?.O_MESSAGE,
                  icon: "WARNING",
                });
              }
              returnVal = postData[i];
            } else if (postData[i]?.O_STATUS === "99") {
              const { btnName } = await getButtonName({
                messageTitle: postData?.[i]?.O_MSG_TITLE
                  ? postData?.[i]?.O_MSG_TITLE
                  : "Confirmation",
                message: postData?.[i]?.O_MESSAGE,
                buttonNames: ["Yes", "No"],
                icon: "CONFIRM",
              });

              btn99 = btnName;
              if (btnName === "No") {
                returnVal = "";
              }
            } else if (postData[i]?.O_STATUS === "0") {
              if (btn99 !== "No") {
                returnVal = postData[i];
              } else {
                returnVal = "";
              }
            }
          }
          btn99 = 0;

          const ageFinal = Math.floor(Number(returnVal?.AGE ?? "0")).toString();
          return {
            BIRTH_DT: returnVal
              ? {
                  value: currentField?.value,
                  isFieldFocused: false,
                  ignoreUpdate: true,
                }
              : {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
            LF_NO:
              formState?.LF_NO === "Minor/Major"
                ? {
                    value: returnVal?.LF_NO ?? "",
                    ignoreUpdate: false,
                  }
                : {
                    value: dependentFieldValues?.LF_NO?.value ?? "",
                    ignoreUpdate: false,
                  },
            AGE: { value: ageFinal ?? "", ignoreUpdate: false },
          };
        } else if (!currentField?.value) {
          return {
            LF_NO: {
              value: "",
              ignoreUpdate: false,
            },
            AGE: { value: "", ignoreUpdate: false },
          };
        }
        return {};
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "AGE",
      label: "Age",
      type: "text",
      isReadOnly: true,
      // ignoreInSubmit: true,
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete", /// Check 0003 account Type and check in old CBS that ledger No. is set when enter birthdate
      },
      name: "LF_NO",
      label: "MinorMajor",
      options: [
        { label: "Minor", value: "M" },
        { label: "Major", value: "J" },
        { label: "Sr. Citizen", value: "S" },
      ],
      _optionsKey: "MinorMajorDDW",
      placeholder: "selectMinorMajor",
      type: "text",
      // isReadOnly(fieldData, dependentFieldsValues, formState) {
      //   return formState?.SCREEN_FLAG !== "S";
      // },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "TIN",
      label: "TIN",
      placeholder: "EnterTIN",
      autoComplete: "off",
      maxLength: 15,
      txtTransform: "uppercase",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return formState?.SCREEN_FLAG === "S";
      },
    },
    {
      render: {
        componentType: "divider",
      },
      name: "persondtldivider_ignoreField",
      label: "PersonalDetails",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return formState?.SCREEN_FLAG === "S";
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "MOTHER_MAIDEN_NM",
      label: "MothersMaidenName",
      autoComplete: "off",
      maxLength: 100,
      placeholder: "EnterMothersMaidenName",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 8, md: 6, lg: 2.4, xl: 2 },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return formState?.SCREEN_FLAG === "S";
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "MASKED_PASSPORT_NO",
      label: "PassportNo",
      type: "text",
      maxLength: 20,
      showMaxLength: false,
      txtTransform: "uppercase",
      autoComplete: "off",
      placeholder: "EnterPassportNo",
      // ignoreInSubmit: true,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      validate: (columnValue) => {
        if (columnValue?.value?.includes(" ")) {
          return "SpaceNotAllowed";
        }
        if (columnValue?.value) {
          if (!REGEX?.ALPHA_NUMERIC?.test(columnValue?.value)) {
            return "PleaseEnterAlphanumericValue";
          }
        }
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        return {
          PASSPORT_NO: {
            value: currentField?.value ?? "",
          },
        };
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return formState?.SCREEN_FLAG === "S";
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "PASSPORT_NO",
      label: "PassportNo",
      autoComplete: "off",
      maxLength: 20,
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "MONTHLY_HOUSEHOLD_INCOME",
      label: "MonthlyHouseholdIncome",
      options: () => API.getMonthlyHouseHoldIncomeDDW("MAIN"),
      _optionsKey: "monIncomeMainOp",
      placeholder: "SelectMonthlyHouseholdIncome",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return formState?.SCREEN_FLAG === "S";
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "EDUCATION_QUALIFICATION",
      label: "EduQualification",
      maxLength: 100,
      placeholder: "EnterEduQualification",
      autoComplete: "off",
      type: "text",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 8, md: 6, lg: 2.4, xl: 2 },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return formState?.SCREEN_FLAG === "S";
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "MARITAL_STATUS",
      label: "MaritalStatus",
      options: () => getPMISCData("Marital"),
      _optionsKey: "maritalMainOp",
      placeholder: "SelectMaritalStatus",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return formState?.SCREEN_FLAG === "S";
      },
    },
    {
      render: {
        componentType: "divider",
      },
      name: "professionaldtldivider_ignoreField",
      label: "ProfessionalDetails",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return formState?.SCREEN_FLAG === "S";
      },
    },
    {
      render: {
        componentType: "checkbox",
      },
      defaultValue: false,
      name: "SALARIED",
      label: "Salaried",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return formState?.SCREEN_FLAG === "S";
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DESIGNATION_CD",
      label: "Designation",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      maxLength: 50,
      placeholder: "EnterDesignation",
      autoComplete: "off",
      GridProps: { xs: 12, sm: 8, md: 3, lg: 2.4, xl: 2 },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return formState?.SCREEN_FLAG === "S";
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "FIRM_NM",
      label: "FirmName",
      maxLength: 100,
      placeholder: "EnterFirmName",
      autoComplete: "off",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 8, md: 6, lg: 2.4, xl: 2 },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return formState?.SCREEN_FLAG === "S";
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "DATE_OF_RETIREMENT",
      label: "DateOfRetirement",
      placeholder: "DD/MM/YYYY",
      validate: (value) => {
        if (
          Boolean(value?.value) &&
          !utilFunction.isValidDate(utilFunction.getParsedDate(value?.value))
        ) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return formState?.SCREEN_FLAG === "S";
      },
    },

    {
      render: {
        componentType: "checkbox",
      },
      defaultValue: false,
      name: "HANDICAP_FLAG",
      label: "Handicap",
      validationRun: "onChange",
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (!Boolean(currentField?.value)) {
          return {
            HANDICAP_DESCIRPTION: { value: "" },
          };
        }
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return formState?.SCREEN_FLAG === "S";
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "HANDICAP_DESCIRPTION",
      label: "HandicapDescription",
      placeholder: "EnterHandicapDescription",
      autoComplete: "off",
      dependentFields: ["HANDICAP_FLAG"],
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (Boolean(dependentFields?.HANDICAP_FLAG?.value)) {
          return false;
        }
        return true;
      },
      maxLength: 100,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 8, md: 6, lg: 2.4, xl: 2 },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return formState?.SCREEN_FLAG === "S";
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "DATE_OF_DEATH",
      label: "DateOfDeath",
      placeholder: "DD/MM/YYYY",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      isMaxWorkingDate: true,
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        const deathDate = new Date(currentField?.value);
        if (Boolean(currentField?.value)) {
          if (!isValid(deathDate)) {
            await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("Mustbeavaliddate"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            return {
              DATE_OF_DEATH: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          } else if (
            greaterThanDate(deathDate, new Date(formState?.workingDate), {
              ignoreTime: true,
            })
          ) {
            const buttonName = await formState?.MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("DateofDeathcannotbeFutureDate"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                DATE_OF_DEATH: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
              };
            }
          }
        }
      },
      __NEW__: {
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return true;
        },
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return formState?.SCREEN_FLAG === "S";
      },
    },
    {
      render: {
        componentType: "divider",
      },
      name: "addressdivider_ignoreField",
      label: "Address",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ADD1",
      label: "Line1",
      placeholder: "EnterLine1",
      autoComplete: "off",
      maxLength: 100,
      type: "text",
      txtTransform: "uppercase",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 3.2, xl: 3.3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ADD2",
      label: "Line2",
      placeholder: "EnterLine2",
      autoComplete: "off",
      maxLength: 100,
      type: "text",
      txtTransform: "uppercase",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 3.2, xl: 3.3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "ADD3",
      label: "Line3",
      placeholder: "EnterLine3",
      autoComplete: "off",
      maxLength: 55,
      type: "text",
      txtTransform: "uppercase",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 3.2, xl: 3.3 },
    },
    {
      render: {
        componentType: "numberFormat",
      },
      name: "PIN_CODE",
      label: "PIN",
      placeholder: "EnterPIN",
      autoComplete: "off",
      // maxLength: 12,
      FormatProps: {
        allowNegative: false,
        // allowLeadingZeros: false,
        decimalScale: 0,
        isAllowed: (values) => {
          if (values?.value?.length > 12) {
            return false;
          }
          return true;
        },
      },
      validate: (columnValue) => {
        const PIN = columnValue.value;
        if (Boolean(PIN) && PIN.length > 12) {
          return "valuelargerforthiscolumn";
        }
      },
      textFieldStyle: {
        "& .MuiInputBase-input": {
          textAlign: "right",
        },
      },
      type: "text",
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (field.value) {
          let postdata = await API.getAreaListDDW(
            field?.value,
            formState,
            dependentFieldsValues,
            authState
          );
          return {
            AREA_CD: {
              value: postdata?.[0]?.value ?? "",
              ignoreUpdate: true,
            },
            AREA_PIN_FLAG: {
              value: postdata,
              ignoreUpdate: false,
            },
          };
        } else {
          return {
            AREA_CD: {
              value: "",
              ignoreUpdate: true,
            },
            AREA_PIN_FLAG: {
              value: "",
              ignoreUpdate: false,
            },
          };
        }
      },
      GridProps: { xs: 12, sm: 6, md: 3, lg: 2.4, xl: 2.1 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "AREA_PIN_FLAG",
      ignoreInSubmit: true,
      dependentFields: ["PIN_CODE", "AREA_CD"],
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        authState,
        dependent
      ) => {
        if (formState?.isSubmitting) return {};

        if (Array.isArray(field?.value) && field?.value?.length > 0) {
          return {
            CITY: {
              value: field?.value?.[0]?.CITY_NM ?? "",
            },
            CITY_CD: {
              value: field?.value?.[0]?.CITY_CD ?? "",
            },
            DISTRICT: {
              value: field?.value?.[0]?.DIST_NM ?? "",
            },
            STATE: {
              value: field?.value?.[0]?.STATE_NM ?? "",
            },
            COUNTRY: {
              value: field?.value?.[0]?.COUNTRY_NM ?? "",
            },
          };
        } else if (field?.value === "AC") {
          return {
            CITY: {
              value: dependent?.AREA_CD?.optionData?.[0]?.CITY_NM ?? "",
            },
            CITY_CD: {
              value: dependent?.AREA_CD?.optionData?.[0]?.CITY_CD ?? "",
            },
            DISTRICT: {
              value: dependent?.AREA_CD?.optionData?.[0]?.DIST_NM ?? "",
            },
            STATE: {
              value: dependent?.AREA_CD?.optionData?.[0]?.STATE_NM ?? "",
            },
            COUNTRY: {
              value: dependent?.AREA_CD?.optionData?.[0]?.COUNTRY_NM ?? "",
            },
          };
        } else if (field?.value === "iniFlagVal") {
          return;
        } else {
          return {
            CITY: {
              value: "",
            },
            CITY_CD: {
              value: "",
            },
            DISTRICT: {
              value: "",
            },
            STATE: {
              value: "",
            },
            COUNTRY: {
              value: "",
            },
          };
        }
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      runPostValidationHookAlways: true,
      name: "AREA_CD",
      validationRun: "onChange",
      label: "Area",
      dependentFields: ["PIN_CODE"],
      disableCaching: true,
      enableVirtualized: true,
      options: (dependentValue, formState, _, authState) => {
        return API.getAreaListDDW(
          _?.["PIN_CODE"]?.value,
          formState,
          _,
          authState
        );
      },
      _optionsKey: "AreaDDW",
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        authState,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (field?.value) {
          return {
            PIN_CODE: {
              value: Boolean(field.value)
                ? field?.optionData?.[0]?.PIN_CODE
                : "",
              ignoreUpdate: true,
            },
            AREA_PIN_FLAG: {
              value: "AC",
              ignoreUpdate: false,
            },
          };
        } else {
          return {
            PIN_CODE: {
              value: "",
              ignoreUpdate: true,
            },
            AREA_PIN_FLAG: {
              value: "",
              ignoreUpdate: false,
            },
          };
        }
      },
      placeholder: "selectArea",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CITY",
      label: "City",
      isReadOnly: true,
      placeholder: "",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CITY_CD",
    },
    {
      render: {
        componentType: "textField",
      },
      name: "DISTRICT",
      label: "DistrictName",
      isReadOnly: true,
      // ignoreInSubmit: true,
      placeholder: "",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "STATE",
      label: "State",
      isReadOnly: true,
      // ignoreInSubmit: true,
      placeholder: "",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "COUNTRY",
      label: "Country",
      isReadOnly: true,
      // ignoreInSubmit: true,
      placeholder: "",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "MASKED_UNIQUE_ID",
      label: "UIDAadhaar",
      isReadOnly: true,
      type: "text",
      // ignoreInSubmit: true,
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "GSTIN",
      label: "Gstin",
      placeholder: "EnterGSTIN",
      autoComplete: "off",
      maxLength: 15,
      type: "text",
      txtTransform: "uppercase",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      validate: (columnValue, allField, flag) =>
        validateGSTIN(columnValue, allField, flag),
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return formState?.SCREEN_FLAG === "S";
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "CKYC_NUMBER",
      label: "CKYCNO",
      type: "text",
      isReadOnly: true,
      // ignoreInSubmit: true,
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return formState?.SCREEN_FLAG === "S";
      },
    },
    //   {
    //     render: {
    //         componentType: "Divider",
    //     },
    //     dividerText: "Address",
    //     name: "addressdivider_ignoreField",
    //     label: "addDivider"
    // },
    {
      render: {
        componentType: "divider",
      },
      name: "contactDivider_ignoreField",
      label: "Contact",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "MASKED_CONTACT1",
      label: "PhoneO",
      placeholder: "EnterPhoneO",
      autoComplete: "off",
      maxLength: 20,
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: true,
      },
      // ignoreInSubmit: true,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      validate: (value) => {
        if (Boolean(value?.value) && value?.value.length < 11) {
          return "PhoneMinimumdigitValidation";
        }
        return "";
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentField
      ) => {
        if (formState?.isSubmitting) return {};
        return {
          CONTACT1: {
            value: currentField.value ?? "",
          },
        };
      },
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CONTACT1",
    },
    {
      render: {
        componentType: "textField",
      },
      name: "MASKED_CONTACT4",
      label: "PhoneR",
      // ignoreInSubmit: true,
      placeholder: "EnterPhoneR",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: true,
      },
      autoComplete: "off",
      maxLength: 20,
      validate: (value) => {
        if (Boolean(value?.value) && value?.value.length < 11) {
          return "PhoneRMinimumdigitValidation";
        }
        return "";
      },
      type: "text",
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentField
      ) => {
        if (formState?.isSubmitting) return {};
        return {
          CONTACT4: {
            value: currentField.value ?? "",
          },
        };
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CONTACT4",
    },
    {
      render: {
        componentType: "textField",
      },
      name: "MASKED_CONTACT2",
      isReadOnly: true,
      // ignoreInSubmit: true,
      label: "MobileNo",
      // type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CONTACT2",
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "MOBILE_REG",
      label: "MobileRegistration",
      dependentFields: ["CONTACT2", "VALIDATE_MOBILE_NO"],
      validationRun: "onChange",
      runPostValidationHookAlways: true,
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return formState?.SCREEN_FLAG === "S";
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        return {
          VALIDATE_MOBILE_NO: { value: Date.now() },
        };
      },
      GridProps: { xs: 12, sm: 3, md: 3, lg: 2.4, xl: 1.3 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "MASKED_CONTACT3",
      label: "AlternatePhone",
      placeholder: "EnterAlternatePhone",
      autoComplete: "off",
      // ignoreInSubmit: true,
      maxLength: 20,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      FormatProps: {
        allowNegative: false,
        allowLeadingZeros: true,
      },
      validate: (value) => {
        if (Boolean(value?.value) && value?.value.length < 11) {
          return "AlternatePhoneMinimumdigitValidation";
        }
        return "";
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentField
      ) => {
        if (formState?.isSubmitting) return {};
        return {
          CONTACT3: {
            value: currentField.value ?? "",
          },
        };
      },
      type: "text",
      // validate: (columnValue, allField, flag) => API.validateMobileNo(columnValue, allField, flag),
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "CONTACT3",
    },
    {
      render: {
        componentType: "textField",
      },
      name: "E_MAIL_ID",
      label: "EmailId",
      placeholder: "EnterEmailId",
      autoComplete: "off",
      maxLength: 60,
      // validate: (columnValue, allField, flag) =>
      //   API.ValidateEmailId(columnValue),
      postValidationSetCrossFieldValues: async (
        field,
        formState,
        ___,
        dependentFieldsValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (field?.value) {
          formState?.handleTabIconDisable(true);

          const postData = await API.ValidateEmailId({
            columnValue: field,
            flag: "N",
          });
          formState?.handleTabIconDisable(false);

          const EMAIL_ID_STATUS = postData?.[0]?.EMAIL_ID_STATUS;
          if (EMAIL_ID_STATUS === "0") {
            const btnName = await formState.MessageBox({
              messageTitle: "ValidationFailed",
              message: "PleaseEnterValidEmailID",
              icon: "ERROR",
            });
            if (btnName === "Ok") {
              return {
                E_MAIL_ID: {
                  value: "",
                  ignoreUpdate: false,
                  isFieldFocused: true,
                },
              };
            }
          }
        }
      },
      type: "text",
      txtTransform: "lowercase",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 5, md: 6, lg: 4.8, xl: 2.7 },
    },
    {
      render: {
        componentType: "divider",
      },
      name: "Divider_ignoreField",
      label: "",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return formState?.SCREEN_FLAG !== "S";
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "FORM_60",
      label: "Form6061",
      isReadOnly: true,
      placeholder: "",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      options: [
        { label: "Form 60", value: "Y" },
        { label: "Form 61", value: "F" },
        { label: "No", value: "N" },
      ],
      // dependentFields: ["DAILY_AMT"],
      // runValidationOnDependentFieldsChange: true,
      // validate: (currentField, dependentFields) => {
      //     if(Number(dependentFields?.DAILY_AMT?.value) >
      //     Number(currentField?.value)) {
      //         return "Weekly Limit should greater than or equal to Daily Limit";
      //     } else {
      //         return "";
      //     }
      // }
    },
    {
      render: {
        componentType: "textField",
      },
      name: "MASKED_PAN_NO",
      label: "PanNum",
      isReadOnly: true,
      // ignoreInSubmit: true,
      type: "text",
      txtTransform: "uppercase",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      schemaValidation: {
        type: "string",
        rules: [
          {
            name: "pancard",
            params: ["PleaseEnterValidPANNumber"],
          },
        ],
      },
      dependentFields: ["FORM_60"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          Boolean(dependentFieldsValues?.FORM_60?.value) &&
          dependentFieldsValues?.FORM_60?.value === "N"
        ) {
          return false;
        } else {
          return true;
        }
      },
      maxLength: 10,
    },

    {
      render: {
        componentType: "hidden",
      },
      name: "PAN_NO",
    },
    {
      render: { componentType: "autocomplete" },
      name: "NEW_CATEG_CD",
      label: "Constitution",
      required: true,
      placeholder: "selectCategory",
      _optionsKey: "getCategoryDDWdata",
      options: (dependentValue, formState, _, authState) => {
        return API.getCategoryTypeOP({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        });
      },
      fullWidth: true,
      GridProps: { xs: 3, sm: 3, md: 3, lg: 2, xl: 2 },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return formState?.SCREEN_FLAG !== "S";
      },
      schemaValidation: {
        type: "string",
        rules: [
          {
            name: "required",
            params: ["ConstitutionIsRequired"],
          },
        ],
      },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "TRADE_CD",
      label: "Occupation",
      options: (dependentValue, formState, _, authState) =>
        getOccupationDTL(
          authState?.companyID,
          authState?.user?.branchCode,
          "A"
        ),
      _optionsKey: "occupationMainOp",
      placeholder: "SelectOccupation",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "GROUP_CD",
      label: "Group",
      options: (dependentValue, formState, _, authState) =>
        getCustomerGroupOptions(
          authState?.companyID,
          authState?.user?.branchCode
        ),
      _optionsKey: "GroupdtlMainOp",
      placeholder: "SelectGroup",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "ACCT_MODE",
      label: "AcctMode",
      isFieldFocused: false,
      required: true,
      options: (dependentValue, formState, _, authState) => {
        return API.getAcctModeOptions({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        });
      },
      _optionsKey: "acctModeOp",
      placeholder: "SelectAcctMode",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["AcctModeIsRequired"] }],
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "LEAN_AMT",
      label: "LienAmt",
      type: "text",
      placeholder: "0.00",
      isReadOnly: true,
      ignoreInSubmit: true,
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return false;
      },
      __NEW__: {
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return true;
        },
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "COMMU_CD",
      label: "Community",
      options: (dependentValue, formState, _, authState) =>
        getCommunityList(
          authState?.companyID,
          authState?.user?.branchCode,
          "A"
        ),
      _optionsKey: "CommunityMainOp",
      placeholder: "SelectCommunity",
      type: "text",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return formState?.SCREEN_FLAG === "S";
      },
    },

    {
      render: {
        componentType: "divider",
      },
      name: "nominalShareDivider_ignoreField",
      label: "NominalShareMember",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return formState?.SCREEN_FLAG === "S";
      },
    },
    // {
    //     render: {
    //       componentType: "typography",
    //     },
    //     name: "Customer_Details",
    //     label: "Customer Details",
    //     // GridProps: { xs: 4, sm: 3, md: 2 },
    // },
    {
      render: {
        componentType: "textField",
      },
      name: "MEM_ACCT_TYPE",
      label: "ACNo",
      placeholder: "COMPCD",
      autoComplete: "off",
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        return {
          MEM_ACCT_CD: { value: "" },
          SHARE_ACCT_TYPE: { value: "" },
          SHARE_ACCT_CD: { value: "" },
          PATH_PHOTO: { value: "" },
        };
      },
      maxLength: 4,
      GridProps: { xs: 12, sm: 2, md: 1.5, lg: 1, xl: 1 },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return formState?.SCREEN_FLAG === "S";
      },
    },
    {
      render: { componentType: "_accountNumber" },
      branchCodeMetadata: {
        name: "MEM_ACCT_CD",
        label: "",
        required: false,
        runPostValidationHookAlways: true,
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return formState?.SCREEN_FLAG === "S";
        },
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          const isHOBranch = await validateHOBranch(
            currentField,
            formState?.MessageBox,
            authState
          );
          if (isHOBranch) {
            return {
              MEM_ACCT_CD: {
                value: "",
                isFieldFocused: true,
                ignoreUpdate: false,
              },
            };
          }
          return {
            PATH_PHOTO: { value: "" },
            SHARE_ACCT_TYPE: { value: "" },
            SHARE_ACCT_CD: { value: "", ignoreUpdate: false },
          };
        },
        schemaValidation: {},
        GridProps: { xs: 12, sm: 2, md: 1.5, lg: 1, xl: 1 },
      },
      accountTypeMetadata: {
        name: "SHARE_ACCT_TYPE",
        runPostValidationHookAlways: true,
        label: "",
        placeholder: "AccountType",
        required: false,
        disableCaching: true,
        dependentFields: ["MEM_ACCT_CD"],
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return formState?.SCREEN_FLAG === "S";
        },
        options: (dependentValue, formState, _, authState) => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID ?? "",
            BRANCH_CD: dependentValue?.MEM_ACCT_CD?.value ?? "",
            USER_NAME: authState?.user?.id ?? "",
            DOC_CD: "SHARE",
          });
        },
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            currentField?.value &&
            !dependentFieldValues?.MEM_ACCT_CD?.value?.trim()
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "enterBranchCode",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });

            if (buttonName === "Ok") {
              return {
                SHARE_ACCT_TYPE: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
                MEM_ACCT_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
              };
            }
          }
          return {
            SHARE_ACCT_CD: { value: "", ignoreUpdate: false },
            PATH_PHOTO: { value: "" },
          };
        },
        schemaValidation: {},
        GridProps: { xs: 12, sm: 3, md: 1.5, lg: 1, xl: 1 },
      },
      accountCodeMetadata: {
        name: "SHARE_ACCT_CD",
        dependentFields: ["SHARE_ACCT_TYPE", "MEM_ACCT_CD", "CUSTOMER_ID"],
        label: "",
        placeholder: "AccountNumber",
        required: false,
        runPostValidationHookAlways: true,
        shouldExclude(fieldData, dependentFieldsValues, formState) {
          return formState?.SCREEN_FLAG === "S";
        },
        postValidationSetCrossFieldValues: async (
          currentField,
          formState,
          authState,
          dependentFieldValues
        ) => {
          if (formState?.isSubmitting) return {};
          if (
            currentField.value &&
            dependentFieldValues?.SHARE_ACCT_TYPE?.value?.length === 0
          ) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "EnterAccountType",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            if (buttonName === "Ok") {
              return {
                SHARE_ACCT_TYPE: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: true,
                },
                SHARE_ACCT_CD: {
                  value: "",
                  isFieldFocused: false,
                  ignoreUpdate: false,
                },
              };
            }
          } else if (
            currentField?.value &&
            dependentFieldValues?.MEM_ACCT_CD?.value &&
            dependentFieldValues?.SHARE_ACCT_TYPE?.value
          ) {
            const reqParameters = {
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: dependentFieldValues?.MEM_ACCT_CD?.value ?? "",
              ACCT_TYPE: dependentFieldValues?.SHARE_ACCT_TYPE?.value ?? "",
              ACCT_CD:
                utilFunction.getPadAccountNumber(
                  currentField?.value,
                  dependentFieldValues?.SHARE_ACCT_TYPE?.optionData?.[0]
                ) ?? "",
              CUSTOMER_ID: dependentFieldValues?.CUSTOMER_ID?.value ?? "",
              WORKING_DATE: authState?.workingDate ?? "",
              USERNAME: authState?.user?.id ?? "",
              USERROLE: authState?.role ?? "",
              SCREEN_REF: formState?.docCD ?? "",
            };
            formState?.handleTabIconDisable(true);

            const isValid = await handleValidateShareMemAcct(
              reqParameters,
              formState
            );
            formState?.handleTabIconDisable(false);

            if (isValid) {
              return {
                SHARE_ACCT_CD: {
                  value:
                    utilFunction.getPadAccountNumber(
                      currentField?.value,
                      dependentFieldValues?.SHARE_ACCT_TYPE?.optionData?.[0]
                    ) ?? {},
                  isFieldFocused: false,
                  ignoreUpdate: true,
                },

                PATH_PHOTO: {
                  value: isValid?.ACCT_NM ?? "",
                },
              };
            } else {
              return {
                SHARE_ACCT_CD: {
                  value: "",
                  isFieldFocused: true,
                  ignoreUpdate: false,
                },
                PATH_PHOTO: { value: "" },
              };
            }
          } else if (!currentField?.value) {
            return {
              PATH_PHOTO: { value: "" },
            };
          }
          return {};
        },
        fullWidth: true,
        schemaValidation: {},
        GridProps: { xs: 12, sm: 5, md: 2, lg: 2.3, xl: 1.5 },
      },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "PATH_PHOTO",
      label: "",
      isReadOnly: true,
      // ignoreInSubmit: true,
      GridProps: { xs: 12, sm: 6, md: 4.5, lg: 2.4, xl: 2 },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return formState?.SCREEN_FLAG === "S";
      },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REMARKS",
      label: "Remarks",
      placeholder: "EnterRemarks",
      autoComplete: "off",
      maxLength: 300,
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      GridProps: { xs: 12, sm: 6, md: 6, lg: 4.3, xl: 3.5 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "TRADE_INFO",
      label: "TypeOfAcct",
      options: () => API.getTypeofAccountDDW(),
      _optionsKey: "getTypeofAccountDDW",
      required: true,
      placeholder: "SelectTypeOfAcct",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["TypeOfAcctIsRequired"] }],
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (
          Boolean(
            (formState?.VISIBLE_TRADE_INFO &&
              formState?.VISIBLE_TRADE_INFO === "Y") ||
              formState?.SCREEN_FLAG === "S"
          )
        ) {
          return false;
        } else return true;
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "textField",
      },
      name: "UDYAM_REG_NO",
      label: "URNUAN",
      type: "text",
      maxLength: 20,
      txtTransform: "uppercase",
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
      preventSpecialChars: () => {
        return sessionStorage.getItem("specialChar") || "";
      },
      postValidationSetCrossFieldValues: async (currentField, formState) => {
        if (formState?.isSubmitting) return {};
        if (currentField?.value) {
          formState?.handleTabIconDisable(true);

          const validationMSG = await API.getUdyamRegNoStatus(
            currentField.value
          );
          formState?.handleTabIconDisable(false);

          if (Boolean(validationMSG)) {
            let buttonName = await formState?.MessageBox({
              messageTitle: "UdyamValidationFailed",
              message: validationMSG ?? "",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            if (buttonName === "Ok") {
              return {
                UDYAM_REG_NO: {
                  value: "",
                  ignoreUpdate: true,
                  isFieldFocused: true,
                },
              };
            }
          }
        }
        return {};
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.CCTLCA === "Y") {
          return false;
        } else {
          return true;
        }
      },
      placeholder: "EnterURNUAN",
      autoComplete: "off",
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "UDYAM_REG_DT",
      label: "URDUAD",
      placeholder: "DD/MM/YYYY",
      validate: (value) => {
        if (
          Boolean(value?.value) &&
          !utilFunction.isValidDate(utilFunction.getParsedDate(value?.value))
        ) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.CCTLCA === "Y") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "ANNUAL_TURNOVER_SR_CD",
      label: "Turnover",
      options: (dependentValue, formState, _, authState) =>
        getRangeOptions(authState?.companyID, authState?.user?.branchCode),
      _optionsKey: "turnoverMainOp",
      placeholder: "SelectTurnover",
      type: "text",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.CCTLCA === "Y") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "INVEST_IN_PLANT",
      label: "InvestmentPlantMachinery",
      maxLength: 15,
      FormatProps: {
        decimalScale: 2,
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.CCTLCA === "Y") {
          return false;
        } else {
          return true;
        }
      },
      placeholder: "EnterInvestmentPlantMachinery",
      autoComplete: "off",
      dependentFields: ["SHARE_ACCT_TYPE"],
      StartAdornment: (dependentFields) => {
        return (
          dependentFields?.SHARE_ACCT_TYPE?.optionData?.[0]?.CURRENCY_CD ?? ""
        );
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "divider",
      },
      name: "additionaldtldivider_ignoreField",
      label: "AdditionalDetails",
      DividerProps: {
        sx: { color: "var(--theme-color1)", fontWeight: "500" },
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.IS_NBFC === "Y") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "SECTOR",
      label: "Sector",
      options: () => getPMISCData("SECTOR"),
      _optionsKey: "sectorDynamicDDW",
      placeholder: "SelectSector",
      type: "text",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.IS_NBFC === "Y") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "RF_RAITING",
      label: "RFRating",
      options: () => getPMISCData("RF_RATING"),
      _optionsKey: "rfRatingDynamicDDW",
      placeholder: "SelectRFRating",
      type: "text",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.IS_NBFC === "Y") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "SECTORAL_ANALYSIS",
      label: "SectoralAnalysis",
      placeholder: "SelectSectoralAnalysis",
      options: () => getPMISCData("SECTORAL_ANALYS"),
      _optionsKey: "sectoralAnalysisDynamicDDW",
      type: "text",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.IS_NBFC === "Y") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "EXPOSURE_TO_SENSITIVE_SECTOR",
      label: "ExposureToSensitiveSector",
      options: () => getPMISCData("EXPOSURE_TO_SEN"),
      _optionsKey: "ExposureToSensitiveSectorDynamicDDW",
      placeholder: "SelectExposureToSensitiveSector",
      type: "text",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.IS_NBFC === "Y") {
          return false;
        } else {
          return true;
        }
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "amountField",
      },
      name: "SECURITY_DEPOSIT",
      label: "SecurityDeposit",
      placeholder: "0.00",
      type: "text",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (formState?.IS_NBFC === "Y") {
          return false;
        } else {
          return true;
        }
      },
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "select",
      },
      name: "STATUS",
      label: "AcStatus",
      defaultOptionLabel: "SelectAcStatus",
      options: (dependentValue, formState, _, authState) => {
        const labels = {
          F: "Freezed",
          O: "Open",
          U: "Un-Claimed",
          D: "Dormant",
          I: "In-Operative",
        };
        const optionData = [...formState?.STATUS_DDDW]
          .filter((status) => labels[status])
          .map((status) => ({ label: labels[status], value: status }));
        return optionData;
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return Boolean(
          formState?.closeAcctStatus === "C" ||
            formState?.closeAcctStatusRetrieve === "C"
        );
      },
      _optionsKey: "AcStatusDDW",
      __NEW__: {
        defaultValue: "O",
        shouldExclude() {
          return true;
        },
      },
      isReadOnly: (fieldValue, dependentFields, formState) => {
        if (formState?.ALLOW_STATUS_EDIT === "Y") {
          return false;
        }
        return true;
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },

    {
      render: {
        componentType: "textField",
      },
      name: "STATUS_FLAG",
      label: "AcStatus",
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return !Boolean(formState?.closeAcctStatus === "C");
      },
      __NEW__: {
        shouldExclude: true,
        ignoreInSubmit: true,
        defaultValue: "Closed",
      },
      isReadOnly: true,
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "autocomplete",
      },
      name: "CLOSE_REASON_CD",
      label: "Reason",
      dependentFields: ["STATUS"],
      options: (dependentValue, formState, _, authState) =>
        API.getFreezeReasonDDW({
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: authState?.user?.branchCode ?? "",
          STATUS: formState?.closeAcctStatus === "C" ? "C" : "F",
        }),
      _optionsKey: "getFreezeReasonDDW",
      placeholder: "SelectReason",
      __NEW__: {
        shouldExclude() {
          return true;
        },
        ignoreInSubmit: true,
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return !Boolean(formState?.closeAcctStatus === "C");
      },
      setValueOnDependentFieldsChange: (dependentFieldsValues) => {
        if (dependentFieldsValues?.STATUS?.value === "O") {
          return "";
        }
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "CLOSE_DT",
      label: "Close Date",

      ignoreInSubmit: true,

      isReadOnly: true,
      defaultValue: (formState) => {
        return formState?.workingDate ?? "";
      },
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        return !Boolean(formState?.closeAcctStatus === "C");
      },
      GridProps: { xs: 12, sm: 4, md: 3, lg: 2.4, xl: 2 },
    },
    {
      render: {
        componentType: "hidden", // Set value when get data from customer id in category field value set
      },
      name: "CATEG_CD",
    },
    {
      render: {
        componentType: "hidden", // Set value when get data from customer id in risk category field value set
      },
      name: "CLASS_CD",
    },
    {
      render: {
        componentType: "hidden", // Set value when get data from customer id in risk category field value set
      },
      name: "CUST_RISK_CATEG",
      // ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden", // Set value when get data from customer id in risk category field value set
      },
      name: "RATING_CD",
      // ignoreInSubmit: true,
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "UNIQUE_ID", // Original Unique Id
      label: "UIDAadhaar",
    },
    {
      render: {
        componentType: "hidden", // Used to stop validate Mobile registration field when get data from customer Id
      },
      ignoreInSubmit: true,
      name: "VALIDATE_MOBILE_NO",
      dependentFields: ["CONTACT2", "MOBILE_REG"],
      validationRun: "all",
      postValidationSetCrossFieldValues: async (
        currentField,
        formState,
        authState,
        dependentFieldValues
      ) => {
        if (formState?.isSubmitting) return {};
        if (
          Boolean(dependentFieldValues?.MOBILE_REG?.value) &&
          dependentFieldValues?.CONTACT2?.value === ""
        ) {
          let buttonName = await formState?.MessageBox({
            messageTitle: "Invalid Data",
            message: "Please Enter Mobile Number.",
            buttonNames: ["Ok"],
            icon: "ERROR",
          });
          if (buttonName === "Ok") {
            return {
              MOBILE_REG: {
                value: false,
                isFieldFocused: false,
                ignoreUpdate: false,
              },
            };
          }
        }
        return {};
      },
    },
  ],
};
