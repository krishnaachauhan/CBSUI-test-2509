import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  findFirstDisplayColumn,
  findLastDisplayColumn,
  generateInitialErrors,
  getGridRowData,
} from "./utils/helper";
import useTableContext from "./useTableContext";
import { commonComponents } from "./widgets/CommonComponents";
import { parseYupSchemaAndAttachMethod } from "./utils/attachYupschema";
import { GridDataContext } from ".";
import { useTranslation } from "react-i18next";
import transformToAgGridColumn from "./utils/transformAgGridMetadata";
import { usePopupContext } from "@acuteinfo/common-base";

const useGridTable = (props) => {
  const {
    agGridProps: { columnDefs, rowData, id, onCellValueChanged = () => {} },
    loading,
    defaultView,
    updatePinnedBottomRow = () => {},
    handleCustomCellKeyDown,
    handleAddNewRow,
    customOnCellEditingStopped,
    hiddenColumns = [],
    handleShortKeys = () => {},
  } = props;
  const { i18n } = useTranslation();

  const gridApi = useRef<any>();
  const [tableId, setTableId] = useState(id);
  const allColumns = useMemo(
    () => transformToAgGridColumn(columnDefs, i18n, hiddenColumns),
    [columnDefs, i18n]
  );

  const { MessageBox } = usePopupContext();
  const { setGridData, gridData } = useContext(GridDataContext);

  const gridContext = useTableContext({
    MessageBox,
    updatePinnedBottomRow: updatePinnedBottomRow,
    gridContext: props?.gridContext,
  });

  const onGridReady = useCallback(
    (parameters: any) => {
      const { api } = parameters;
      gridApi.current = api;
      const gridRowData = rowData || gridData;
      if (gridRowData?.length === 0) {
        api.showNoRowsOverlay();
      } else {
        api.hideOverlay();
      }
      api.autoSizeAllColumns();
      if (props.getGridApi) {
        props.getGridApi.current = api;
      }
    },
    [props.getGridApi]
  );

  // TODO : handle this while row selection
  const onFirstDataRendered = useCallback(
    (parameters: any) => {
      const { api } = parameters;
      const gridRowData = getGridRowData(gridApi) || rowData || gridData;
      if (gridRowData?.length === 0) {
        api.showNoRowsOverlay();
      } else {
        api.hideOverlay();
      }
      api.autoSizeAllColumns();
      updatePinnedBottomRow();
      let errors = generateInitialErrors(allColumns);

      api.forEachNode((node) => {
        const { loader, ...rest } = node.data || {};

        const matchedErrors: any[] = [];
        errors.forEach((err) => {
          const val = rest[err.field];
          const isMissing =
            !rest.hasOwnProperty(err.field) ||
            val === null ||
            val === undefined ||
            val === "";

          if (isMissing) {
            matchedErrors.push(err);
          }
        });

        node.setData({
          ...node.data,
          errors: matchedErrors,
        });
      });

      if (props.autoSelectFirst) {
        api.deselectAll();
        let node = api.getRowNode(0);
        node?.setSelected(true, true);
      }
    },
    [props.autoSelectFirst]
  );

  const wrapperHandleAddRow = () => {
    if (typeof handleAddNewRow === "function") {
      handleAddNewRow();
    } else {
      gridApi.current.applyTransaction({
        add: [{}],
      });
    }
    let rowNode: any[] = [];
    gridApi.current.forEachNode((node: any) => rowNode.push(node));

    const node = rowNode[rowNode?.length - 1];

    const errors = generateInitialErrors(allColumns);
    const existingErrors = node.data.errors || [];

    const updatedErrors = [...existingErrors, ...errors];

    node.setData({
      ...node.data,
      errors: updatedErrors,
    });
  };

  const onCellKeyDown = async (params: any) => {
    const {
      event,
      column: { colDef },
      api,
      node,
    } = params;
    //changed by nidhi
    if (defaultView === "view") return;
    typeof handleShortKeys === "function" && handleShortKeys(params);
    if (event.key === "Tab" && event.shiftKey) return;
    if (event.key !== "Tab" && event.key !== "Enter") return;

    const lastColumn = findLastDisplayColumn(gridApi, params);
    const firstColumn = findFirstDisplayColumn(gridApi, params);

    if (typeof handleCustomCellKeyDown === "function") {
      const handled = await handleCustomCellKeyDown(params, lastColumn);
      if (handled === true) return; // ✅ skip the rest if custom handler returns true
    }
    if (event.key === "Enter" && event.shiftKey) {
      //* Move to the previous cell on Shift + Enter
      setTimeout(() => {
        api.tabToPreviousCell();
      }, 50);
      return;
    }

    if (colDef.field === lastColumn.colDef?.field) {
      const allData = api.getDisplayedRowCount();

      //* Check if there is already an empty row
      const isEmptyRowPresent = api.getRowNode(allData - 1)?.data
        ? Object.values(api.getRowNode(allData - 1).data).every(
            (value) => value === null || value === undefined || value === ""
          )
        : false;

      //* If no empty row exists, add a new one
      const currentRowIndex = node.rowIndex + 1;
      if (!isEmptyRowPresent && allData === currentRowIndex) {
        wrapperHandleAddRow();

        setTimeout(() => {
          api.setFocusedCell(node.rowIndex + 1, firstColumn?.colDef?.field);
          gridApi.current.startEditingCell({
            rowIndex: node.rowIndex + 1,
            colKey: firstColumn?.colDef?.field,
          });
        }, 50);
      }
    } else {
      //* Move to the next cell for "Enter"
      setTimeout(() => {
        event.key === "Enter" && api.tabToNextCell();
      }, 50);
    }
  };

  const onAddClick = () => {
    wrapperHandleAddRow();
    const rowData: any[] = [];
    gridApi.current.forEachNode((node) => rowData.push(node.data));

    const params = {
      node: {
        data: rowData[rowData?.length - 1],
      },
    };
    const focusedColumns = gridApi.current
      .getAllDisplayedColumns()
      .filter((col) => col.colDef?.cellEditorParams?.isFieldFocused)?.[0];
    const firstColumn = findFirstDisplayColumn(gridApi, params);

    setTimeout(() => {
      gridApi.current.setFocusedCell(
        rowData.length - 1,
        focusedColumns
          ? focusedColumns?.colDef?.field
          : firstColumn?.colDef?.field
      );
      gridApi.current.startEditingCell({
        rowIndex: rowData.length - 1,
        colKey: focusedColumns
          ? focusedColumns?.colDef?.field
          : firstColumn?.colDef?.field,
      });
      if (typeof updatePinnedBottomRow === "function") updatePinnedBottomRow();
    }, 100);
  };

  const onCellEditingStopped = async (params) => {
    const {
      colDef: { field, schemaValidation, validate },
      node,
      api,
      value,
    } = params;
    const currentVal = value ?? node?.data[field];
    setGridData((prevData) =>
      prevData.map((row, index) =>
        index === node.rowIndex ? { ...row, [field]: currentVal } : row
      )
    );
    if (typeof updatePinnedBottomRow === "function") {
      updatePinnedBottomRow();
    }

    if (schemaValidation) {
      const validateFn = parseYupSchemaAndAttachMethod(
        schemaValidation,
        node,
        field
      );

      if (validateFn) {
        const validationResult = await validateFn(currentVal, node, field);
      }
    }
    if (typeof customOnCellEditingStopped === "function") {
      return customOnCellEditingStopped(params);
    }
    if (validate) {
      const errorMessage = validate(params);
      if (errorMessage) {
        const existingErrors = node.data.errors || [];

        const updatedErrors = [
          ...existingErrors.filter((err) => err.field !== field),
          { field, message: errorMessage, touched: true },
        ];

        node.setData({
          ...node.data,
          errors: updatedErrors,
        });
      } else {
        const updatedErrors = (node.data.errors || []).filter(
          (err) => err.field !== field
        );

        node.setData({
          ...node.data,
          errors: updatedErrors,
        });
      }
    }
  };

  const onCellFocused = (params) => {
    if (!params.forceBrowserFocus) {
      return;
    }
    if (
      params.context?.gridContext?.mode === "view" ||
      params.column.colDef?.cellEditor === "agCheckboxCellEditor"
    ) {
      return;
    }

    params.api.startEditingCell({
      rowIndex: params.rowIndex,
      colKey: params.column.colId,
    });
  };

  const onCellClicked = async (params) => {
    const colDef = params.colDef;

    if (
      colDef?.cellEditor === "agCheckboxCellEditor" &&
      colDef?.field &&
      params.node
    ) {
      setTimeout(() => {
        params.api.stopEditing();
      }, 100);
    }
  };

  const components = useMemo(() => {
    return commonComponents;
  }, []);

  const noDataComponent = () => {
    return (
      <span style={{ fontStyle: "italic", color: "rgba(133, 130, 130, 0.8)" }}>
        {i18n.t("NoDataFound")}
      </span>
    );
  };

  useEffect(() => {
    if (!id) {
      setTableId(`table-${String(Math.random() * 10e16).substring(0, 15)}`);
    } else {
      setTableId(id);
    }
  }, [id]);

  useEffect(() => {
    if (gridApi.current) {
      if (!rowData?.length) {
        gridApi.current.showNoRowsOverlay();
      }
    }
  }, [gridApi.current, rowData]);

  useEffect(() => {
    const handleResize = () => {
      if (gridApi.current) {
        setTimeout(() => {
          gridApi?.current.sizeColumnsToFit();
        }, 100);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [gridApi]);

  useEffect(() => {
    if (gridApi.current) {
      gridApi.current?.refreshHeader();
      gridApi.current.redrawRows();
    }
  }, [i18n.language]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!gridApi.current) return;

      const gridElement = document.getElementById(tableId);
      const autocompletePopup = document.querySelector(
        ".MuiAutocomplete-popper"
      );

      if (
        gridElement &&
        !gridElement.contains(event.target as Node) &&
        !(autocompletePopup && autocompletePopup.contains(event.target as Node))
      ) {
        gridApi.current.stopEditing();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [tableId]);

  return {
    gridApi,
    tableId,
    allColumns,
    gridContext,
    onGridReady,
    onFirstDataRendered,
    onCellKeyDown,
    onAddClick,
    components,
    onCellEditingStopped,
    noDataComponent,
    onCellValueChanged,
    i18n,
    onCellFocused,
    onCellClicked,
  };
};

export default useGridTable;
