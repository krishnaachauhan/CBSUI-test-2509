import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  TextField,
  InputAdornment,
  CircularProgress,
  FormHelperText,
  Tooltip,
} from "@mui/material";
import { NumericFormat } from "react-number-format";
import { isArray } from "lodash";
import { t } from "i18next";
import {
  getCurrencySymbol,
  usePropertiesConfigContext,
} from "@acuteinfo/common-base";

const CustomCurrencyEditor = forwardRef((props: any, ref) => {
  const {
    value = 0,
    colDef: {
      cellEditorParams: {
        postValidationSetCrossAccessorValues,
        maxLength,
        isCurrencySymbol = true,
        isAllowed,
        decimalScale = 2,
      },
      field,
    },
    node,
    api,
    onValueChange,
    context,
    initialValue,
  } = props;

  const [selectedValue, setSelectedValue] = useState(value);

  const [loading, setLoading] = useState(false); // Track loading state
  const { dynamicAmountSymbol } = usePropertiesConfigContext();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.select();
      }, 0);
    }
  }, []);
  //* Expose `getValue` to AG Grid
  useImperativeHandle(ref, () => ({
    getValue: () => selectedValue,
    setValue: (newValue: string) => {
      setSelectedValue(newValue);
    },
  }));

  const handleChange = (val) => {
    // `reason` helps too, e.g. "event" (typing), "input" etc.

    // only trigger when value is different
    if (Number(val.floatValue) !== Number(selectedValue)) {
      setSelectedValue(val.floatValue);

      const newData = {
        ...node.data,
        [field]: val.floatValue,
      };
      node.setData(newData);
      onValueChange(val.floatValue);
    }
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
      if (selectedValue !== initialValue) {
        await postValidationSetCrossAccessorValues(
          selectedValue,
          node,
          api,
          field,
          onValueChange,
          context
        );
        if (typeof context.updatePinnedBottomRow === "function") {
          setTimeout(() => {
            context.updatePinnedBottomRow();
          }, 300);
        }
      }
      //* Set loader false
      node.setData({
        ...node.data,
        loader: [...updatedLoader, { field, loader: false }],
      });
    }
  };

  if (node?.rowPinned) {
    return null;
  }

  const fieldError = node.data?.errors?.find((item) => item.field === field);

  return (
    <>
      <NumericFormat
        value={selectedValue}
        thousandSeparator={true}
        decimalScale={decimalScale}
        fixedDecimalScale
        allowNegative={false}
        customInput={TextField}
        variant="outlined"
        fullWidth
        size="small"
        inputRef={inputRef}
        onFocus={() => {
          if (inputRef.current) inputRef.current.select();
        }}
        onValueChange={handleChange}
        onBlur={handleBlur}
        sx={{
          "& input": {
            textAlign: "right",
            border: "none",
            padding: "4px 4px",
          },
          "& fieldset": { border: "none" },
        }}
        InputProps={{
          style: { textAlign: "right" },
          startAdornment: isCurrencySymbol ? (
            <InputAdornment position="start">
              {getCurrencySymbol(dynamicAmountSymbol)}
            </InputAdornment>
          ) : null,

          endAdornment: (
            <InputAdornment position="end">
              {loading && <CircularProgress color="secondary" size={20} />}
            </InputAdornment>
          ),
        }}
        valueIsNumericString={false}
        isAllowed={isAllowed}
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

export default CustomCurrencyEditor;
