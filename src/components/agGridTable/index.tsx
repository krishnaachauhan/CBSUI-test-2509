import { GradientButton } from "@acuteinfo/common-base";
import RefreshIcon from "@mui/icons-material/Refresh";
import { IconButton, LinearProgress, Toolbar, Typography } from "@mui/material";
import { Box } from "@mui/system";
import {
  AllCommunityModule,
  ClientSideRowModelModule,
  ModuleRegistry,
  PinnedRowModule,
  RowApiModule,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { isEmpty } from "lodash";
import React, { createContext, useState } from "react";
import "./style.css";
import useGridTable from "./useGridTable";
import HeaderButtonGroup from "./widgets/HeaderButtonGroup";

// Register ag-Grid modules
ModuleRegistry.registerModules([
  AllCommunityModule,
  ClientSideRowModelModule,
  RowApiModule,
  PinnedRowModule,
]);
type AgGridTableWrapperProps = {
  autoSelectFirst?: boolean;
  getGridApi: any;
  components?: Record<string, any>;
  gridConfig: any;
  subLabel?: string;
  onClickOnAdd?: () => void;
  onCellValueChanged?: any;
  context?: any;
  onCellKeyDown?: any;
  defaultColDef?: any;
  stopEditingWhenCellsLoseFocus?: any;
  suppressCellSelection?: any;
  defaultView?: any;
  loading?: boolean;
  agGridProps: any;
  hideHeader?: boolean;
  updatePinnedBottomRow?: any;
  handleCustomCellKeyDown?: any;
  gridContext?: any;
  buttons?: any;
  handleAddNewRow?: () => Promise<void> | void;
  height?: any;
  isNewButtonVisible?: boolean;
  newButtonLabel?: string;
  refetchData?: () => any;
  getRowClass?: any;
  customOnCellEditingStopped?: any;
  hiddenColumns?: string[];
  handleShortKeys?: (params: {
    event: KeyboardEvent;
    column: any;
    api: any;
    node: any;
    context: any;
  }) => Promise<void> | void;
};
// Define Context for Grid Data
export const GridDataContext = createContext({
  gridData: [],
  setGridData: (data: any) => {},
});

const AgGridTable: React.FC<AgGridTableWrapperProps> = React.memo((props) => {
  const [gridData, setGridData] = useState<any>(
    props.agGridProps.rowData || []
  );

  const {
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
    i18n,
    onCellValueChanged,
    onCellFocused,
    onCellClicked,
  } = useGridTable({ ...props, gridData, setGridData });

  const defaultColDef = {
    ...props.agGridProps?.defaultColDef,
    flex: 1,
    suppressMovable: true,
    unSortIcon: false,
    resizable: true,
    suppressSizeToFit: true,
  };

  const {
    hideHeader = false,
    agGridProps = {},
    defaultView = "new",
    gridConfig = {},
    buttons = [],
    isNewButtonVisible = true,
    newButtonLabel,
    refetchData,
    loading,
  } = props;

  return (
    <GridDataContext.Provider value={{ gridData, setGridData }}>
      <div className="main-container">
        {!hideHeader && (
          <Toolbar
            style={{
              padding: "8px 24px",
              background: "var(--primary-bg)",
              borderTopLeftRadius: "4px",
              borderTopRightRadius: "4px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "nowrap",
              gap: "8px",
              minHeight: "fit-content",
            }}
          >
            <Typography
              style={{
                color: "var(--white)",
                fontWeight: "500",
                fontSize: "1.5rem !important",
                lineHeight: "1.6 !important",
                letterSpacing: "0.0075em !important",
                alignSelf: "center",
              }}
              color="inherit"
              variant={"h6"}
            >
              {gridConfig.gridLabel} {props.subLabel}
            </Typography>
            <div
              style={{
                display: "flex",
                gap: "2px",
                flexShrink: 0,
                alignItems: "center",
              }}
            >
              {typeof refetchData === "function" ? (
                <IconButton
                  aria-label="more"
                  aria-controls="long-menu"
                  aria-haspopup="true"
                  //@ts-ignore
                  onClick={refetchData}
                  color="primary"
                >
                  <RefreshIcon />
                </IconButton>
              ) : null}
              {isNewButtonVisible && (
                <GradientButton onClick={onAddClick}>
                  {" "}
                  {newButtonLabel ? i18n.t(newButtonLabel) : i18n.t("new")}
                </GradientButton>
              )}
              <HeaderButtonGroup buttons={buttons} />
            </div>
          </Toolbar>
        )}
        {loading && (
          <Box sx={{ width: "100%" }}>
            <LinearProgress color="secondary" />
          </Box>
        )}
        <div
          className="ag-theme-alpine custom-grid"
          style={{
            height: props.height || "400px",
            width: "100%",
            minHeight: "20vh",
          }}
          id={tableId}
        >
          <AgGridReact
            key={tableId}
            onGridReady={onGridReady}
            {...agGridProps}
            onCellValueChanged={onCellValueChanged}
            defaultColDef={defaultColDef}
            columnDefs={allColumns}
            onFirstDataRendered={onFirstDataRendered}
            context={{ ...gridContext, gridData, setGridData }} // Pass context to Grid
            rowData={isEmpty(gridData) ? props.agGridProps?.rowData : gridData}
            rowHeight={30}
            headerHeight={35}
            onCellKeyDown={onCellKeyDown}
            suppressClickEdit={!isNewButtonVisible}
            suppressCellFocus={!isNewButtonVisible}
            suppressHeaderFocus={true}
            components={components}
            onCellEditingStopped={onCellEditingStopped}
            suppressMovableColumns={true}
            noRowsOverlayComponent={noDataComponent}
            onCellFocused={onCellFocused}
            onCellClicked={onCellClicked}
          />
        </div>
      </div>
    </GridDataContext.Provider>
  );
});

export { AgGridTable };
