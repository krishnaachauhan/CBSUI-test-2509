import { utilFunction } from "@acuteinfo/common-base";
import { padding } from "@mui/system";
import { validatePasswords } from "pages_audit/auth/api";

export const PasswordChangeMetaData = {
  form: {
    name: "passwordChange",
    label: "Change Password",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 3,
          md: 3,
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
    },
  },
  fields: [
    {
      render: { componentType: "passwordField", group: 0 },
      name: "currentPassword",
      sequence: 1,
      type: "text",
      label: "CurrentPassword",
      placeholder: "CurrentPassword",
      GridProps: { xs: 12, md: 12, sm: 12, xl: 12, lg: 12 },
      fullWidth: true,
      required: true,
      autoComplete: "off",
      allowToggleVisiblity: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ThisFieldisrequired"] }],
      },
    },
    {
      render: { componentType: "passwordField", group: 0 },
      name: "password",
      sequence: 2,
      type: "password",
      label: "NewPassword",
      placeholder: "NewPassword",
      GridProps: {
        style: { paddingTop: "0px" },
        xs: 12,
        md: 12,
        sm: 12,
        xl: 12,
        lg: 12,
      },
      fullWidth: true,
      required: true,
      autoComplete: "off",
      allowToggleVisiblity: true,
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ThisFieldisrequired"] }],
      },
      dependentFields: ["currentPassword"],
      runValidationOnDependentFieldsChange: true,
      validate: async (currentField, dependentFields, formState) => {
        if (
          Boolean(currentField?.value) &&
          currentField?.value === dependentFields?.currentPassword?.value
        ) {
          return "newPasswordCantbeSameasOldPassword";
        } else if (
          currentField?.value?.length > 0 &&
          dependentFields?.currentPassword?.value
        ) {
          let apireq = {
            USER_ID: formState?.authState?.user?.id,
            PASSWORD: currentField?.value,
            SCREEN_REF: "PROFILE_CHANGE_PWD",
          };
          let resp = await validatePasswords(apireq);
          if (resp?.validateData?.O_STATUS !== "0") {
            return resp?.validateData?.O_MESSAGE;
          } else {
            return "";
          }
        } else {
          return "";
        }
      },
    },
    {
      render: { componentType: "passwordField", group: 0 },
      name: "confirmPassword",
      sequence: 3,
      type: "password",
      label: "ConfirmPassword",
      placeholder: "ConfirmPassword",
      GridProps: {
        style: { paddingTop: "0px" },
        xs: 12,
        md: 12,
        sm: 12,
        xl: 12,
        lg: 12,
      },
      fullWidth: true,
      required: true,
      autoComplete: "off",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ThisFieldisrequired"] }],
      },
      dependentFields: ["password"],
      runValidationOnDependentFieldsChange: true,
      validate: (currentField, dependentFields) => {
        if (currentField?.value !== dependentFields?.password?.value) {
          return "NewPasswordandConfirmPassworddidnotmatched";
        } else {
          return "";
        }
      },
    },
  ],
};
