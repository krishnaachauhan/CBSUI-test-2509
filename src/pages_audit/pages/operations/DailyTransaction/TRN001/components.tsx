import {
  Autocomplete,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormHelperText,
  InputAdornment,
  Paper,
  PaperProps,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState, useCallback, Fragment, useRef, useEffect } from "react";
import "./Trn001.css";
import { getCurrencySymbol } from "@acuteinfo/common-base";
import Draggable from "react-draggable";
import { NumberFormatCustom } from "components/custom/NumberFormatCustom";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
// const useAutocompleteHandlers = (onChangeCallback) => {
//   // const [highlightedOption, setHighlightedOption] = useState(null);
//   const highlightedOptionRef = useRef<any>(null);

//   const handleHighlightChange = useCallback((event, option, reason) => {
//     highlightedOptionRef.current = option;
//   }, []);

//   console.log("highlightedOptionRef", highlightedOptionRef);
//   const handleKeyDown = useCallback(
//     (event, unqID, flag) => {
//       if (event?.key === "Tab" && highlightedOptionRef?.current) {
//         switch (flag) {
//           case "BRANCH_CD":
//             onChangeCallback({
//               updUnqId: unqID,
//               branchVal: highlightedOptionRef?.current,
//             });
//             break;
//           case "ACCT_TYPE":
//             onChangeCallback({
//               updUnqId: unqID,
//               value: highlightedOptionRef?.current,
//             });
//             break;
//           case "TRX":
//             onChangeCallback(event, highlightedOptionRef?.current, unqID);
//             break;
//           case "SDC":
//             onChangeCallback({
//               updUnqId: unqID,
//               value: highlightedOptionRef?.current,
//             });
//             break;
//           default:
//             onChangeCallback({
//               updUnqId: unqID,
//               value: highlightedOptionRef?.current,
//             });
//         }
//       }
//     },
//     [highlightedOptionRef?.current, onChangeCallback]
//   );

//   return {
//     handleHighlightChange,
//     handleKeyDown,
//   };
// };

const useAutocompleteHandlers = (onChangeCallback) => {
  const highlightedOptionRef = useRef<any>(null);

  // Handle highlight change (this updates the highlighted option)
  const handleHighlightChange = useCallback((event, option, reason) => {
    highlightedOptionRef.current = option; // Update the highlighted option when changed
  }, []);

  // Handle keydown events (this handles the logic when the user presses "Tab" or other keys)
  const handleKeyDown = useCallback(
    (event, unqID, flag) => {
      // Check if the Tab key was pressed
      if (event?.key === "Tab") {
        const highlightedOption = highlightedOptionRef.current; // Always use the latest highlighted option

        if (highlightedOption) {
          // Perform actions based on the flag (like "BRANCH_CD", "ACCT_TYPE", etc.)
          switch (flag) {
            case "BRANCH_CD":
              onChangeCallback({
                updUnqId: unqID,
                branchVal: highlightedOption,
              });
              break;
            case "ACCT_TYPE":
              onChangeCallback({
                updUnqId: unqID,
                value: highlightedOption,
              });
              break;
            case "TRX":
              onChangeCallback(event, highlightedOption, unqID);
              break;
            case "SDC":
              onChangeCallback({
                updUnqId: unqID,
                value: highlightedOption,
              });
              break;
            default:
              onChangeCallback({
                updUnqId: unqID,
                value: highlightedOption,
              });
          }
        }
      }
    },
    [onChangeCallback] // `highlightedOptionRef.current` is always up-to-date because it's a ref
  );

  return {
    handleHighlightChange,
    handleKeyDown,
  };
};

export default useAutocompleteHandlers;

export const DynFormHelperText = ({ msg }) => {
  return (
    <FormHelperText
      style={{
        color: "#f44336",
        padding: "0 4px",
      }}
    >
      {msg}
    </FormHelperText>
  );
};

interface CustomAutocompleteProps {
  value: any;
  size?: "small" | "medium";
  options: Array<{ label: string; value: any }>;
  onChange: (event: React.ChangeEvent<{}>, value: any) => void;
  onHighlightChange?: (
    event: React.ChangeEvent<{}>,
    option: any,
    reason: any
  ) => void;
  disabled?: boolean;
  popupIcon?: React.ReactNode;
  width?: string | number;
  style?: React.CSSProperties;
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
  autoFocus?: boolean;
  isLoading?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  errorMsg?: string;
  readOnly?: boolean;
}

export const CustomeAutocomplete = ({
  value,
  size = "small",
  options,
  onChange,
  onHighlightChange,
  disabled,
  popupIcon,
  width = "120px",
  style,
  onBlur,
  onKeyDown,
  autoFocus,
  isLoading,
  inputRef,
  errorMsg,
  readOnly,
}: CustomAutocompleteProps) => {
  let selectedOptionValue: any = options?.filter((obj) => obj?.value === value);
  const getOptionLabel = (option) => option?.label ?? "";

  return (
    <Autocomplete
      // value={value ? value : null}
      value={value ? options.find((opt) => opt.value === value) ?? null : null}
      fullWidth
      autoHighlight
      autoComplete={false}
      size={size}
      options={options}
      onChange={onChange}
      onHighlightChange={onHighlightChange}
      disabled={disabled}
      popupIcon={popupIcon}
      readOnly={readOnly}
      isOptionEqualToValue={(option, value) => {
        if (!option || !value) return false;
        return option?.value?.trim() === value?.value?.trim();
      }}
      renderInput={(params) => (
        <>
          <TextField
            {...params}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            variant="outlined"
            autoFocus={autoFocus}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "gray",
                  borderWidth: "1px",
                },
                "&:hover fieldset, &.Mui-focused fieldset": {
                  borderColor: "#00458e",
                  borderWidth: "1px",
                },
                paddingRight: "35px !important",
                paddingLeft: "0px !important",
                backgroundColor: disabled
                  ? "rgb(238, 238, 238)"
                  : "transparent",
              },
            }}
            InputProps={{
              ...params?.InputProps,
              endAdornment: (
                <Fragment>
                  {Boolean(isLoading) ? (
                    <CircularProgress
                      sx={{ position: "absolute", right: "0.5rem" }}
                      size={25}
                      color="secondary"
                      variant="indeterminate"
                    />
                  ) : (
                    params?.InputProps?.endAdornment
                  )}
                </Fragment>
              ),
            }}
            inputRef={inputRef}
          />
          {errorMsg ? (
            <DynFormHelperText msg={errorMsg} />
          ) : (
            selectedOptionValue?.[0]?.actLabel && (
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 400,
                  fontSize: "9.5px",
                  lineHeight: "10px",
                  letterSpacing: "0.03333em",
                  textAlign: "left",
                  marginTop: "3px",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  // whiteSpace: "nowrap",
                  wordBreak: "break-word",
                }}
              >
                {selectedOptionValue?.[0]?.actLabel}
              </Typography>
            )
          )}
        </>
      )}
      PaperComponent={({ children }) => {
        return (
          <div
            // style={paperStyles}
            style={{
              width: "max-content",
              background: "white",
              boxShadow:
                "rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px",
              overflowX: "scroll",
              maxWidth: "320px",
              // width: "200px",
              // minWidth: "max(160px, 100%)",
            }}
          >
            {children}
          </div>
        );
      }}
      filterOptions={(options, state) => {
        const inputValue = state?.inputValue?.toLowerCase();
        const filtered = options?.filter((option) =>
          option?.label?.toLowerCase()?.includes(inputValue)
        );
        return filtered.sort((a, b) => {
          const aStartsWith = a?.label?.toLowerCase()?.startsWith(inputValue);
          const bStartsWith = b?.label?.toLowerCase()?.startsWith(inputValue);

          if (aStartsWith && !bStartsWith) {
            return -1;
          }
          if (!aStartsWith && bStartsWith) {
            return 1;
          }
          return 0;
        });
      }}
      renderOption={(props, option, other) => {
        props["key"] = props["id"];
        let { selected, inputValue } = other;

        let label = getOptionLabel(option);
        const matches = match(label, inputValue);
        const parts = parse(label, matches);
        const labelJSX = parts.map((part, index) => (
          <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
            {part.text}
          </span>
        ));
        return (
          //@ts-ignore
          <Tooltip title={label}>
            <li
              style={{
                whiteSpace: "pre",
                width: "max-content",
                minWidth: "100%",
              }}
              {...props}
            >
              {labelJSX}
            </li>
          </Tooltip>
        );
      }}
    />
  );
};

interface CustomAmountFieldProps {
  value: any;
  placeHolder?: any;
  size?: "small" | "medium";
  disabled?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
  inputRef?: React.Ref<HTMLInputElement>;
  loadingState?: boolean;
  errorMsg?: string;
  maxAmount?: any;
  customParameter?: any;
  readOnly?: boolean;
}

export const CustomAmountField = ({
  value,
  placeHolder,
  size = "small",
  disabled,
  readOnly,
  onChange,
  onBlur,
  inputRef,
  loadingState,
  errorMsg,
  customParameter,
  maxAmount,
  ...rest
}: CustomAmountFieldProps) => {
  const { dynamicAmountSymbol, dynamicAmountGroupStyle, decimalCount } =
    customParameter ?? {};
  return (
    <>
      <TextField
        value={value}
        fullWidth={true}
        id="txtRight"
        placeholder={placeHolder}
        size={size}
        variant="outlined"
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={(event) => {
          const input = event?.target;
          if (input.value) {
            input?.select();
          }
        }}
        // style={{
        //   backgroundColor: disabled ? "rgb(238, 238, 238)" : "transparent",
        // }}
        InputProps={{
          readOnly: readOnly,
          inputComponent: NumberFormatCustom,
          inputProps: {
            FormatProps: {
              thousandSeparator: true,
              thousandsGroupStyle: dynamicAmountGroupStyle ?? "lakh",
              allowNegative: false,
              allowLeadingZeros: false,
              decimalScale: decimalCount ?? 2,
              fixedDecimalScale: true,
              autoComplete: "off",
              maxAmount,
              isAllowed: ({ floatValue, value }) =>
                // value === "" || (!/^00/.test(value) && floatValue <= maxAmount),
                value === "" ||
                (!/^00/.test(value) &&
                  floatValue <=
                    (typeof maxAmount !== "undefined" ? maxAmount : Infinity)),
            },
            inputRef: inputRef,
          },
          startAdornment: (
            <Fragment>
              <InputAdornment
                position="start"
                sx={{
                  height: "17px",
                  margin: "6px 0px !important",
                  padding: "0 0.6rem 0 0.6rem",
                  maxHeight: "36px",
                  borderRight: "2px dashed #BABABA",
                }}
              >
                {getCurrencySymbol(dynamicAmountSymbol ?? "INR")}
              </InputAdornment>
              {Boolean(loadingState) && (
                <CircularProgress
                  sx={{
                    position: "absolute",
                    left: "2rem",
                  }}
                  size={25}
                  color="secondary"
                  variant="indeterminate"
                />
              )}
            </Fragment>
          ),
          ...rest,
        }}
        sx={{
          "& .MuiInputBase-root": {
            padding: "0",
            "& .MuiInputBase-input": {
              padding: "0.6rem",
            },
            backgroundColor: disabled
              ? "rgb(238, 238, 238) !important"
              : "transparent",
          },
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "gray",
              borderWidth: "1px",
            },
            "&:hover fieldset, &.Mui-focused fieldset": {
              borderColor: "#00458e",
              borderWidth: "1px",
            },
          },
          paddingRight: "0px !important",
          paddingLeft: "0px !important",
        }}
      />
      {errorMsg && <DynFormHelperText msg={errorMsg} />}
    </>
  );
};

interface CustomTextFieldProps {
  value: any;
  onKeyUp?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onDoubleClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  size?: "small" | "medium";
  type?: "text" | "number" | "password" | "email";
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  loadingState?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  errorMsg?: string;
  id?: string;
  alignment?: "right" | "left";
  onKeyDown?: any;
  readOnly?: boolean;
}

export const CustomTextField = ({
  value,
  size = "small",
  type,
  onChange,
  disabled,
  readOnly,
  onKeyUp,
  onDoubleClick,
  onBlur,
  loadingState,
  inputRef,
  errorMsg,
  id,
  alignment = "right",
  onKeyDown,
}: CustomTextFieldProps) => {
  return (
    <>
      <TextField
        value={value}
        fullWidth={true}
        size={size}
        type={type}
        onChange={onChange}
        onKeyUp={onKeyUp}
        onDoubleClick={onDoubleClick}
        disabled={disabled}
        onBlur={onBlur}
        variant="outlined"
        id={id}
        autoComplete="off"
        style={{
          backgroundColor: disabled ? "rgb(238, 238, 238)" : "transparent",
        }}
        onKeyDown={onKeyDown}
        sx={{
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "gray",
              borderWidth: "1px",
              paddingRight: "0px !important",
            },
            "&:hover fieldset, &.Mui-focused fieldset": {
              borderColor: "#00458e",
              borderWidth: "1px",
            },
            backgroundColor: disabled
              ? "rgb(238, 238, 238) !important"
              : "transparent",
          },
        }}
        onFocus={(event) => {
          const input = event?.target;
          if (input?.value) {
            input?.select();
          }
        }}
        InputProps={{
          readOnly: readOnly,
          endAdornment: (
            <Fragment>
              {Boolean(loadingState) ? (
                <CircularProgress
                  sx={{
                    position: "absolute",
                    [alignment as string]: "0.5rem",
                  }}
                  size={25}
                  color="secondary"
                  variant="indeterminate"
                />
              ) : null}
            </Fragment>
          ),
        }}
        inputRef={inputRef}
      />
      {errorMsg && <DynFormHelperText msg={errorMsg} />}
    </>
  );
};

export const PaperComponent = (props: PaperProps) => {
  return (
    //@ts-ignore
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
};
