import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, isValid, parse } from "date-fns";
import { isArray } from "lodash";
import { FormHelperText, Tooltip } from "@mui/material";
import { t } from "i18next";
import { parseDate } from "../utils/helper";
import { usePropertiesConfigContext } from "@acuteinfo/common-base";

const CustomDatePickerEditor = React.memo(
  forwardRef((props: any, ref) => {
    const {
      value,
      colDef: { field, cellEditorParams },
      node,
      api,
      onValueChange,
      context,
    } = props;

    const {
      postValidationSetCrossAccessorValues,
      selectTodayDate = true,
      minDate,
    } = cellEditorParams || {};
    const { commonDateFormat = "dd/MM/yyyy" } = usePropertiesConfigContext();

    const parsedMinDate = minDate
      ? parse(minDate, "dd/MMM/yyyy", new Date())
      : undefined;

    const getInitialDate = () => {
      const parsedDate = parseDate(value);
      return isValid(parsedDate) ? parsedDate : null;
    };

    const [selectedDate, setSelectedDate] = useState<Date | null>(
      getInitialDate
    );
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useImperativeHandle(ref, () => ({
      getValue: () =>
        selectedDate ? format(selectedDate, commonDateFormat) : "",
      isPopup: () => true,
    }));

    useEffect(() => {
      if (inputRef.current) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      }
    }, []);

    useEffect(() => {
      if (!value && selectTodayDate) {
        const today = new Date();
        setSelectedDate(today);
        const formattedDate = format(today, commonDateFormat);
        const newData = {
          ...node.data,
          [field]: formattedDate,
        };
        node.setData(newData);
        onValueChange?.(formattedDate);
      }
    }, [value]);

    const handleChange = (newDate: Date | null) => {
      if (newDate && isValid(newDate)) {
        setSelectedDate(newDate);
        const formattedDate = format(newDate, commonDateFormat);
        const newData = {
          ...node.data,
          [field]: formattedDate,
        };
        node.setData(newData);
        onValueChange?.(formattedDate);
      } else {
        const newData = {
          ...node.data,
          [field]: "",
        };
        node.setData(newData);
        onValueChange?.("");
      }
    };

    const handleBlurDate = async (
      event: React.FocusEvent<HTMLInputElement>
    ) => {
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
        await postValidationSetCrossAccessorValues(
          selectedDate,
          node,
          api,
          field,
          onValueChange,
          context,
          event.target.value,
          props.initialValue
        );

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
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            minDate={parsedMinDate}
            // ref={inputRef}
            format="dd/MM/yyyy"
            value={selectedDate}
            onChange={handleChange}
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            slotProps={{
              textField: {
                inputRef: inputRef,
                onBlur: handleBlurDate,
                variant: "outlined",
                fullWidth: true,
                size: "small",
              },
              openPickerButton: {
                onMouseDown: (e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                },
                onClick: (e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(true);
                },
              },
              popper: {
                onMouseDown: (e: React.MouseEvent) => {
                  e.stopPropagation();
                },
              },
            }}
            sx={{
              "& .MuiInputBase-root ": {
                paddingRight: "7px",
              },
              "& input": {
                border: "none",
                padding: "4px 4px 4px 2px",
                textAlign: "center",
                fontSize: "0.875rem",
              },
              "& fieldset": { border: "none" },
              "& .MuiInputAdornment-root": {
                marginLeft: "0px",
              },
              "& .MuiSvgIcon-root": {
                fontSize: "20px",
              },
              "& .MuiButtonBase-root": {
                padding: "0px",
              },
            }}
          />
        </LocalizationProvider>
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
  })
);
export default CustomDatePickerEditor;
