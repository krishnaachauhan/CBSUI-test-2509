import { ColDef } from "ag-grid-community";
import { AgGridMetaData } from "../types";

function transformToAgGridColumn(
  metaData: (AgGridMetaData | ColDef)[],
  i18n,
  excludedAccessors?: string[]
): ColDef[] {
  return metaData
    .filter((meta: any) => {
      // Apply filtering only if excludedAccessors is provided and not empty
      if (excludedAccessors?.length) {
        return !excludedAccessors.includes(meta.accessor);
      }
      return true;
    })
    .map((meta: any) => {
      const {
        accessor,
        columnName,
        componentType,
        FormatProps,
        className,
        hide,
        displayComponentType,
        headerTooltip,
        postValidationSetCrossAccessorValues,
        isVisible,
        options,
        isReadOnly,
        children,
        ...rest
      } = meta;

      const transformedCol = {
        headerName: i18n.t(columnName),
        headerTooltip: i18n.t(headerTooltip),
        headerValueGetter: () => i18n.t(columnName),
        field: accessor,
        cellEditor: componentType || undefined,
        cellEditorParams: {
          postValidationSetCrossAccessorValues,
          ...FormatProps,
          options,
        },
        className,
        hide: isVisible === false,
        cellRenderer: displayComponentType || "DisplayCell",
        singleClickEdit: true,
        cellStyle: (params) => {
          if (meta.alignment) {
            return { textAlign: meta.alignment };
          }
          return { textAlign: "left" };
        },
        ...(meta?.isCheckBox && {
          onCellValueChanged: async (params) => {
            if (typeof postValidationSetCrossAccessorValues === "function") {
              await postValidationSetCrossAccessorValues(params);
            }
          },
          cellRendererSelector: (params) => {
            const isPinned = params.node?.rowPinned;

            if (!isPinned) {
              return { component: "agCheckboxCellRenderer" };
            }
            return (params) => "";
          },
        }),
        editable: (params) => {
          if (
            typeof rest?.shouldExclude === "function" &&
            rest?.shouldExclude(params)
          ) {
            return false;
          }
          const mode = params.context?.gridContext?.mode ?? "new";

          const modeMeta = {
            edit: meta.__EDIT__,
            view: meta.__VIEW__,
            new: meta.__NEW__,
          }[mode.toLowerCase()];

          if (typeof modeMeta?.isReadOnly === "function") {
            return !modeMeta.isReadOnly(params);
          }
          if (typeof modeMeta?.isReadOnly === "boolean") {
            return !modeMeta.isReadOnly;
          }
          if (typeof isReadOnly === "function") {
            return !isReadOnly(params);
          }
          if (typeof isReadOnly === "boolean") {
            return !isReadOnly;
          }

          return true;
        },
        ...rest,
      };

      // Recursively transform children if present
      if (Array.isArray(children) && children.length > 0) {
        transformedCol.children = transformToAgGridColumn(
          children,
          i18n,
          excludedAccessors
        );
      }

      return transformedCol;
    });
}

export default transformToAgGridColumn;
