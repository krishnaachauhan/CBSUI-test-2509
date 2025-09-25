import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { FormHelperText, TextField, Tooltip } from "@mui/material";
import { isArray } from "lodash";
import { t } from "i18next";

const NumberFormat = forwardRef((props: any, ref) => {
  const {
    value = "",
    colDef: {
      cellEditorParams: {
        postValidationSetCrossAccessorValues = () => {},
        uppercase = false,
        defaultValue = "",
        isNumber = false, // New prop to allow number or text
        inputProps = {},
        allowNegative = true,
        allowLeadingZeros = true,
        isAllowed = () => true,
        allowAlphaNumeric = false,
        allowDecimal = true,
        preventSpecialChars = "",
      } = {},
      field,
      alignment = "left",
    },
    node,
    api,
    onValueChange,
    context,
    initialValue,
  } = props;

  const [inputValue, setInputValue] = useState(value);
  const [forceValidate, setForceValidate] = useState(false); // New flag
  const inputRef = useRef<HTMLInputElement | null>(null);

  //* Expose `getValue` to AG Grid
  useImperativeHandle(ref, () => ({
    getValue: () => inputValue,
    setValue: (newValue: string) => {
      setInputValue(newValue);
      setForceValidate(true);
    },
  }));

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.select();
      }, 0);
    }
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.value;

    if (isNumber) {
      // Allow only numbers, optional dot, dash, and space
      newValue = newValue.replace(/[^0-9.\- ]/g, "");

      // Prevent decimals if not allowed
      if (!allowDecimal) {
        newValue = newValue.replace(/\./g, "");
      } else {
        // Prevent multiple dots if decimals are allowed
        if ((newValue.match(/\./g) || []).length > 1) {
          return;
        }
      }

      // Prevent negative sign if not allowed
      if (!allowNegative && newValue.startsWith("-")) {
        return;
      } else {
        // If negatives are allowed, ensure "-" only at start
        newValue = newValue.replace(/(?!^)-/g, "");
      }

      // Remove leading zeros if not allowed
      if (!allowLeadingZeros) {
        newValue = newValue.replace(/^0+/, "");
      }
    } else if (allowAlphaNumeric) {
      newValue = newValue;
    } else {
      // Allow only letters
      newValue = newValue.replace(/[^a-zA-Z ]/g, "");
    }

    // Convert to uppercase if required
    if (uppercase) {
      newValue = newValue.toUpperCase();
    }

    // Check custom isAllowed condition
    if (isAllowed && !isAllowed({ value: newValue })) {
      return;
    }

    if (
      newValue &&
      preventSpecialChars &&
      // Case 1: when it's a string
      ((typeof preventSpecialChars === "string" &&
        preventSpecialChars
          .split("")
          .some((char) => newValue.includes(char))) ||
        // Case 2: when it's a function
        (typeof preventSpecialChars === "function" &&
          preventSpecialChars()
            .split("")
            .some((char) => newValue.includes(char))))
    ) {
      return;
    }

    setInputValue(newValue);
    const newData = {
      ...node.data,
      [field]: newValue,
    };
    node.setData(newData);
    onValueChange?.(newValue);
  };

  const handleBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (typeof postValidationSetCrossAccessorValues === "function") {
      //* Set loader true
      const existingLoaders = node.data.loader || [];

      const updatedLoader = [
        ...existingLoaders.filter((err) => err.field !== field),
      ];

      node.setData({
        ...node.data,
        loader: [...updatedLoader, { field, loader: true }],
      });
      if (inputValue !== initialValue || forceValidate) {
        await postValidationSetCrossAccessorValues(
          inputValue,
          node,
          api,
          field,
          onValueChange,
          context,
          initialValue
        );
      }
      //* Set loader false
      node.setData({
        ...node.data,
        loader: [...updatedLoader, { field, loader: false }],
      });
    }
  };

  const fieldError = node.data?.errors?.find((item) => item.field === field);
  return (
    <>
      <TextField
        defaultValue={defaultValue}
        variant="outlined"
        fullWidth
        size="small"
        value={inputValue}
        inputRef={inputRef}
        onFocus={() => {
          inputRef.current?.select();
          node.setDataValue("disableChequeDate", undefined);
        }}
        InputProps={{
          ...inputProps,
        }}
        sx={{
          "& input": {
            textAlign: alignment,
            border: "none",
            padding: "4px 4px",
          },
          "& fieldset": { border: "none" },
        }}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {isArray(node.data?.errors) && fieldError && fieldError?.touched ? (
        <Tooltip title={t(fieldError.message)} arrow>
          <FormHelperText
            style={{
              marginTop: "0px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            error={true}
          >
            {t(fieldError.message)}
          </FormHelperText>
        </Tooltip>
      ) : null}
    </>
  );
});

export default NumberFormat;
