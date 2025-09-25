import React, { forwardRef, useImperativeHandle } from "react";
import { Button } from "@mui/material";

const CustomButtonCellEditor = forwardRef((props: any, ref) => {
  const { value, node, colDef = {}, api, context = {} } = props;
  const { cellRendererParams = {}, shouldExclude } = colDef;
  const {
    disabled = false,
    handleButtonClick = () => {},
    buttonName = "Remove",
  } = cellRendererParams;
  useImperativeHandle(ref, () => ({
    getValue: () => value,
  }));

  const handleClick = async () => {
    await handleButtonClick(props);
  };

  const isDisabled =
    typeof disabled === "function" ? disabled(props) : disabled;

  if (node?.rowPinned) {
    return null;
  }

  const isButtonVisible =
    typeof shouldExclude === "function" ? shouldExclude(props) : false;
  const displayButtonLabel =
    typeof buttonName === "function" ? buttonName(props) : buttonName;

  return !isButtonVisible ? (
    <Button
      fullWidth
      variant="contained"
      color="secondary"
      style={{
        height: "23px",
        backgroundColor: isDisabled
          ? "var(--theme-color7) !important"
          : "var(--theme-color1) !important",
      }}
      onClick={handleClick}
      disabled={isDisabled}
    >
      {displayButtonLabel}
    </Button>
  ) : null;
});

export default CustomButtonCellEditor;
