import { CircularProgress, Tooltip } from "@mui/material";
import { isEmpty } from "lodash";
import { dynamicRowHeight, trimString } from "../utils/helper";
import ErrorComponent from "./ErrorComponent";
import { useEffect } from "react";

const DisplayCell = (params) => {
  //* Extract errors for Cell
  const errors = params.node?.data?.errors || [];
  const fieldError = errors.find((err) => err.field === params.colDef.field);

  //* Extract loader state for cell
  const loaderArray = params.node.data?.loader || [];
  const loadingField = loaderArray?.find(
    (err) => err.field === params.colDef.field
  );

  //* dynamically Change row height based on errors
  if (errors) dynamicRowHeight(errors, params);

  const isEditable =
    typeof params.colDef.editable === "function"
      ? params.colDef.editable(params)
      : params.colDef.editable;

  useEffect(() => {
    if (params.eGridCell) {
      params.eGridCell.style.backgroundColor = isEditable
        ? "transparent"
        : "var(--theme-color7)";
    }
  }, [isEditable, params.eGridCell]);

  if (params.node?.rowPinned) return params.value ?? null;

  //* Hide cell content
  const isCellVisible =
    typeof params?.colDef?.shouldExclude === "function"
      ? params?.colDef?.shouldExclude(params)
      : false;

  return !isCellVisible ? (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <span>
        {params.value || !isEmpty(fieldError?.message) ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              className="cell-value"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: params.colDef?.alignment || "center",
                height: "100%",
                width: "100%",
              }}
            >
              <div
                title={params?.value}
                style={{
                  display: "inline-block",
                  maxWidth: "100%",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  flexGrow: 1,
                }}
              >
                {params?.value ? (
                  params?.value
                ) : (
                  <span className="cell-placeholder">
                    {trimString(params.colDef?.headerName)}
                  </span>
                )}
              </div>{" "}
              {loadingField?.loader && params.value ? (
                <CircularProgress
                  size={20}
                  color="secondary"
                  style={{ marginLeft: 6, marginTop: 4 }}
                />
              ) : null}
            </div>
            {!isEmpty(fieldError?.message) && fieldError.touched && (
              <ErrorComponent fieldError={fieldError} value={params.value} />
            )}
          </div>
        ) : (
          <span className="cell-placeholder">
            {isEditable ? params.colDef?.headerName : null}
          </span>
        )}
      </span>
    </div>
  ) : null;
};

export default DisplayCell;
