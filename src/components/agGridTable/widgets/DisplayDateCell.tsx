import { format, isValid, parse } from "date-fns";
import { isEmpty } from "lodash";
import React, { useEffect } from "react";
import { dynamicRowHeight, getFormattedDate } from "../utils/helper";
import ErrorComponent from "./ErrorComponent";
import { usePropertiesConfigContext } from "@acuteinfo/common-base";
import { CircularProgress } from "@mui/material";

const DisplayDateCell = (params) => {
  const errors = params.node?.data?.errors || [];
  const fieldError = errors.find((err) => err.field === params.colDef.field);

  //* Extract loader state for cell
  const loaderArray = params.node.data?.loader || [];
  const loadingField = loaderArray?.find(
    (err) => err.field === params.colDef.field
  );

  const { commonDateFormat = "dd/MM/yyyy" } = usePropertiesConfigContext();

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
  const isCellVisible =
    typeof params?.colDef?.shouldExclude === "function"
      ? params?.colDef?.shouldExclude(params)
      : false;

  return !isCellVisible ? (
    <div style={{ display: "flex", flexDirection: "column" }}>
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
                {params.value ? (
                  getFormattedDate(params.value, commonDateFormat)
                ) : (
                  <span className="cell-placeholder">DD/MM/YYYY</span>
                )}{" "}
              </div>{" "}
              {loadingField?.loader && params.value ? (
                <CircularProgress
                  size={20}
                  color="secondary"
                  style={{ marginLeft: 1, marginTop: 6 }}
                />
              ) : null}
            </div>
            {!isEmpty(fieldError?.message) && fieldError.touched && (
              <ErrorComponent fieldError={fieldError} value={params.value} />
            )}
          </div>
        ) : (
          <span className="cell-placeholder">
            {isEditable ? "DD/MM/YYYY" : null}
          </span>
        )}
      </span>
    </div>
  ) : null;
};
export default DisplayDateCell;
