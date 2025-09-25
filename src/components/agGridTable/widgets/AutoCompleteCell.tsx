import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react";
import {
  Autocomplete,
  TextField,
  Tooltip,
  FormHelperText,
} from "@mui/material";
import { isArray, isEmpty } from "lodash";
import { t } from "i18next";
import { trimString } from "../utils/helper";

const AutoCompleteCellEditor = forwardRef((props: any, ref) => {
  const {
    value,
    colDef: {
      cellEditorParams,
      field,
      name,
      isOption = false,
      headerName,
      validationRun = "onBlur",
      defaultValueKey,
    },
    node,
    onValueChange,
    api,
    context,
  } = props;

  const { postValidationSetCrossAccessorValues = () => {} } =
    cellEditorParams || {};

  const selectRef = useRef<HTMLInputElement | null>(null);
  const indexRef = useRef<number>(-1);
  const initialValueRef = useRef(value);

  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOptions = async () => {
    if (typeof cellEditorParams?.options === "function") {
      setLoading(true);
      try {
        const data = await cellEditorParams.options(props);
        props.context.updateState(field, data);
        setOptions(data || []);
      } catch (error) {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }
  };
  useEffect(() => {
    if (!cellEditorParams?.refetchOnFocus) {
      let listData = props.context.state?.[field] || [];
      if (listData?.length) {
        setOptions(listData);
        setLoading(false);
      } else {
        fetchOptions();
      }
    }
  }, []);

  const getInitialValue = () => {
    if (!value || (typeof value === "object" && isEmpty(value))) {
      if (defaultValueKey && options.length && options[0]?.[defaultValueKey]) {
        const defaultOption = options.find(
          (option) => option?.value === option[defaultValueKey]
        );
        // indexRef.current = options.indexOf(defaultOption);
        return defaultOption;
      }
      return null;
    }
    return (
      options.find(
        (option: any) => option.value === value?.value || option.value === value
      ) || null
    );
  };

  const [selectedValue, setSelectedValue] = useState<any>(getInitialValue());

  useEffect(() => {
    setSelectedValue(getInitialValue());
  }, [options]);

  const handleChange = (event: any, newValue: any, reason: any) => {
    if (newValue && reason !== "clear") {
      setSelectedValue(newValue);

      const newData = {
        ...node.data,
        [field]: newValue?.value,
        [name]: newValue?.label,
        ...(isOption && { [`${field}_OPT`]: newValue }),
      };
      node.setData(newData);
      onValueChange(newValue?.value);

      if (validationRun === "onChange" || validationRun === "all") {
        handleLoaderState(event, newValue);
      }
    } else {
      indexRef.current = -1;
      setSelectedValue(null);
      const newData = {
        ...node.data,
        [field]: "",
        [name]: "",
      };
      node.setData(newData);
      onValueChange("");
    }
  };

  useImperativeHandle(ref, () => ({
    getValue: () => (selectedValue ? selectedValue.value : null),
  }));

  const handleLoaderState = async (event, value) => {
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

      const finalValue = value || selectedValue || options[indexRef.current];

      if (finalValue?.value !== initialValueRef.current) {
        await postValidationSetCrossAccessorValues(
          finalValue,
          node,
          api,
          field,
          onValueChange,
          context,
          props.initialValue
        );
      }
      //* Set loader false
      node.setData({
        ...node.data,
        loader: [...updatedLoader, { field, loader: false }],
      });
      initialValueRef.current = finalValue?.value;
    }
  };

  const handleBlur = async (e) => {
    setOpen(false);

    // Exit early if no validation function
    if (typeof postValidationSetCrossAccessorValues !== "function") return;

    // Only act if a selection via keyboard or programmatic highlight exists
    const selectedOption =
      indexRef.current !== -1 ? options[indexRef.current] : null;

    if (
      defaultValueKey &&
      (!value || (typeof value === "object" && isEmpty(value)))
    ) {
      await handleChange(e, selectedValue, "");
    }

    if (selectedOption && selectedOption.value !== selectedValue?.value) {
      await handleChange(e, selectedOption, "");
    }

    // Post-validation should only run once
    if (validationRun === "onBlur" || validationRun === "all") {
      await handleLoaderState(e, "");
    }
  };

  const handleFocus = async () => {
    if (cellEditorParams?.refetchOnFocus) {
      await fetchOptions(); // refetch options dynamically
    }
    if (isEmpty(value)) {
      const newData = {
        ...node.data,
        [field]: undefined,
      };
      node.setData(newData);
      onValueChange(undefined);
      setSelectedValue(undefined);
    }
  };

  useEffect(() => {
    if (selectRef.current) {
      selectRef.current.focus();
    }
  }, []);

  if (node?.rowPinned) {
    return null;
  }
  const fieldError = node.data?.errors?.find((item) => item.field === field);

  return (
    <>
      <Autocomplete
        id="item-cell-editor"
        value={selectedValue}
        onChange={handleChange}
        options={options}
        loading={loading}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => {
          return option.value === value?.value;
        }}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        onHighlightChange={(e: any, option: any) => {
          if (e?.type !== "mousemove") {
            indexRef.current = options.indexOf(option);
          } else {
            indexRef.current = -1;
          }
        }}
        autoHighlight
        fullWidth
        sx={{
          padding: "0px",
          "& .MuiAutocomplete-popupIndicator, & .MuiAutocomplete-clearIndicator":
            {
              padding: "1px",
            },
          "& .MuiAutocomplete-popupIndicator svg, & .MuiAutocomplete-clearIndicator":
            {
              fontSize: "16px",
              width: "16px",
              height: "16px",
            },
        }}
        renderOption={(props, option) => (
          <li {...props} title={option.label}>
            <span
              style={{
                display: "inline-block",
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {option.label}
            </span>
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            inputRef={selectRef}
            onFocus={handleFocus}
            onClick={handleFocus}
            onBlur={handleBlur}
            placeholder={`Select ${trimString(headerName)}`}
            InputProps={{
              ...params.InputProps,
            }}
            inputProps={{
              ...params.inputProps,
              title: selectedValue?.label || "",
              style: {
                paddingRight: "40px",
                whiteSpace: "nowrap",
                overflow: "hidden !important",
                textOverflow: "ellipsis",
              },
            }}
          />
        )}
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

export default AutoCompleteCellEditor;
