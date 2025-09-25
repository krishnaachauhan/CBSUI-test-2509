import { isEmpty } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { dynamicRowHeight, trimString } from "../utils/helper";
import ErrorComponent from "./ErrorComponent";
import { CircularProgress } from "@mui/material";

const DisplaySelectCell = (params) => {
  const {
    value,
    colDef: {
      cellEditorParams,
      field,
      editable,
      headerName,
      name,
      isOption = false,
      isSetDependantValueSet,
      defaultValueKey,
    },
    node,
    context,
  } = params;

  const errors = node?.data?.errors || [];
  const fieldError = errors.find((err) => err.field === field);
  if (errors) dynamicRowHeight(errors, params);

  const loaderArray = node.data?.loader || [];
  const loadingField = loaderArray?.find((err) => err.field === field);

  const isEditable =
    typeof editable === "function" ? editable(params) : editable;

  const hasFetchedRef = useRef(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  const fetchOptions = async () => {
    // Prevent multiple calls across grid
    if (!context.loadingFields) context.loadingFields = new Set();

    if (context.loadingFields.has(field)) return;
    context.loadingFields.add(field);

    try {
      setIsLoadingOptions(true);
      if (typeof cellEditorParams?.options === "function") {
        const data = await cellEditorParams.options(params);
        context.updateState(field, data);

        let matchingOption = data.find((option) => option?.value === value);
        if (defaultValueKey && data.length && data[0]?.[defaultValueKey]) {
          matchingOption = data.find(
            (option) => option?.value === option[defaultValueKey]
          );
        }
        if (matchingOption) {
          node.setData({
            ...node.data,
            [name]: matchingOption?.label,
            [field]: matchingOption?.value,
            ...(isOption && { [`${field}_OPT`]: matchingOption }),
            ...(isSetDependantValueSet &&
              isSetDependantValueSet(matchingOption)),
          });
        }
      }
    } finally {
      setIsLoadingOptions(false);
      context.loadingFields.delete(field);
    }
  };

  useEffect(() => {
    const listData = context.state?.[field] || [];

    if (!hasFetchedRef.current && isEmpty(listData)) {
      hasFetchedRef.current = true;
      fetchOptions();
    } else {
      const matchingOption = listData.find((option) => option?.value === value);
      if (matchingOption) {
        node.setData({
          ...node.data,
          [name]: matchingOption?.label,
          [field]: matchingOption?.value,
          ...(isOption && { [`${field}_OPT`]: matchingOption }),
          ...(isSetDependantValueSet && isSetDependantValueSet(matchingOption)),
        });
      }
    }
  }, [context.state?.[field]]);

  useEffect(() => {
    if (params.eGridCell) {
      params.eGridCell.style.backgroundColor = isEditable
        ? "transparent"
        : "var(--theme-color7)";
    }
  }, [isEditable, params.eGridCell]);

  if (node?.rowPinned) return;

  const isCellVisible =
    typeof params?.colDef?.shouldExclude === "function"
      ? params?.colDef?.shouldExclude(params)
      : false;

  return !isCellVisible ? (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span>
        {node.data?.[name] || value || !isEmpty(fieldError?.message) ? (
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
                title={node.data?.[name] || value || ""}
                style={{
                  display: "inline-block",
                  maxWidth: "100%",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  flexGrow: 1,
                }}
              >
                {node.data?.[name] || value ? (
                  node.data?.[name] || value
                ) : (
                  <span className="cell-placeholder">
                    Select {trimString(headerName)}
                  </span>
                )}
              </div>

              {isLoadingOptions || (loadingField?.loader && params.value) ? (
                <CircularProgress
                  size={20}
                  color="secondary"
                  style={{ marginLeft: 8 }}
                />
              ) : null}
            </div>

            {!isEmpty(fieldError?.message) && fieldError.touched && (
              <ErrorComponent fieldError={fieldError} value={params.value} />
            )}
          </div>
        ) : (
          <span className="cell-placeholder">
            {isEditable ? `Select ${headerName}` : null}
          </span>
        )}
      </span>
    </div>
  ) : null;
};

export default DisplaySelectCell;
