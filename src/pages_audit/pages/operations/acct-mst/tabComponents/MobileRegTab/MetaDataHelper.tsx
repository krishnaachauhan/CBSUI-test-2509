import { updateNodeDataAndFocus } from "components/agGridTable/utils/helper";
import { validateMobileNo } from "pages_audit/pages/master/usersecurity/stepper/api/api";

export const isMobileFieldEditable = (data) => data?.REG_TYPE === "M";
export const isEmailFieldEditable = (data) => data?.REG_TYPE === "E";
export const isEditable = (data, checkFn, mode) => {
  if (mode === "edit" && !data?._isNewRow) {
    return true;
  }
  return !checkFn(data);
};

export const handleValidationMessage = async ({
  context,
  message,
  node,
  api,
  IsFocusField,
  focusedAccessor,
}) => {
  const existingErrors = node.data.errors || [];

  const updatedErrors = [
    ...existingErrors.filter((err) => err.field !== focusedAccessor),
    { field: focusedAccessor, message: message },
  ];
  const updatedData = {
    ...node.data,
    [focusedAccessor]: "",
    errors: updatedErrors,
  };
  if (focusedAccessor === "MASKED_MOBILE_NO") {
    updatedData.MOBILE_NO = "";
  }
  if (IsFocusField) {
    updateNodeDataAndFocus(node, updatedData, api, {
      isFieldFocused: true,
      focusedAccessor,
    });
    api.refreshCells({ rowNodes: [node], columns: [focusedAccessor] });
  } else {
    updateNodeDataAndFocus(node, updatedData);
  }
};

export const handleBlurMobNo = async (
  value,
  node,
  api,
  accessor,
  onValueChange,
  context
) => {
  if (value) {
    node.setData({
      ...node.data,
      MOBILE_NO: value,
    });
    const request = {
      MOBILE_NO: value,
      SCREEN: context?.gridContext?.docCD,
      STD_CD: "",
      FLAG: "",
    };
    const postData = await validateMobileNo({ request });
    const message = postData?.[0]?.MOBILE_STATUS;
    if (message?.length > 0) {
      await handleValidationMessage({
        context,
        message,
        node,
        api,
        IsFocusField: true,
        focusedAccessor: "MASKED_MOBILE_NO",
      });
    } else {
      const updatedErrors = (node.data.errors || []).filter(
        (err) => err.field !== accessor
      );

      node.setData({
        ...node.data,
        errors: updatedErrors,
      });
    }
  } else if (!value && node.data?.MOBILE_REG_FLAG) {
    await handleValidationMessage({
      context,
      message: "Please enter Mobile No.",
      node,
      api,
      IsFocusField: false,
      focusedAccessor: "MASKED_MOBILE_NO",
    });
  } else {
    const updatedErrors = (node.data.errors || []).filter(
      (err) => err.field !== accessor
    );

    node.setData({
      ...node.data,
      errors: updatedErrors,
    });
  }
};

export const validateEmail = ({ node, api, value }) => {
  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (value && !emailRegex.test(value)) {
    updateNodeDataAndFocus(node, { E_MAIL_ID: "" }, api, {
      isFieldFocused: true,
      focusedAccessor: "E_MAIL_ID",
    });
    return "Please enter valid Email ID";
  } else if (!value && node.data?.MOBILE_REG_FLAG) {
    return "Please enter Email.";
  }
  return "";
};

export const handleBlurRegFlag = async ({ newValue, node, api, context }) => {
  const isMobileMissing =
    newValue && !node.data?.MOBILE_NO && node.data.REG_TYPE === "M";
  const isEmailMissing =
    newValue && !node.data?.E_MAIL_ID && node.data.REG_TYPE === "E";

  if (isMobileMissing) {
    await handleValidationMessage({
      context,
      message: "Please enter Mobile No.",
      node,
      api,
      IsFocusField: true,
      focusedAccessor: "MASKED_MOBILE_NO",
    });
  } else if (isEmailMissing) {
    await handleValidationMessage({
      context,
      message: "Please enter Email.",
      node,
      api,
      IsFocusField: true,
      focusedAccessor: "E_MAIL_ID",
    });
  }
};

export const handleBlurRegType = async (
  value,
  node,
  api,
  accessor,
  onValueChange,
  context
) => {
  const regType = node.data[accessor];
  if (regType === "E") {
    await updateNodeDataAndFocus(
      node,
      {
        EMAIL_TYPE: "E",
        DISPLAY_EMAIL_TYPE: "External (TO)",
        MOBILE_NO: "",
        REG_NO: "",
      },
      api,
      { isFieldFocused: true, focusedAccessor: "EMAIL_TYPE" }
    );
  } else if (regType === "M") {
    await node.setData({
      ...node.data,
      EMAIL_TYPE: "",
      DISPLAY_EMAIL_TYPE: "",
      E_MAIL_ID: "",
    });
  }
};
