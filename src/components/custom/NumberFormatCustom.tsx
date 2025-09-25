import { forwardRef } from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
export const NumberFormatCustom = forwardRef<any, any>((props, ref) => {
  const { inputRef, onChange, FormatProps, ...other } = props;
  const { formattedValue, ...others } = FormatProps;
  return (
    <NumericFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange(
          {
            target: {
              name: props.name,
              value: Boolean(formattedValue)
                ? values.formattedValue
                : values.value,
              formattedValue: values.formattedValue,
            },
          },
          values.formattedValue
        );
      }}
      /**
       * Altaf Shaikh - 15/Feb/2024
       * added valueIsNumericString prop to avoid issue of zero prefixd and cursor moves to start of field
       * when pressed decimal point
       */
      valueIsNumericString={false}
      {...others}
    />
  );
});
