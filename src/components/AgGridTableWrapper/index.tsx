import { AgGridTable } from "components/agGridTable";
import React from "react";
import ShortCutKeys from "./GeneralComponents/ShortCutKeys";
import useGridHelper from "./useGridHelper";

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
};

const AgGridTableWrapper: React.FC<AgGridTableWrapperProps> = (props) => {
  const {
    headingWithButton,
    dialogState,
    handleDialogClose,
    handleShortKeys,
    acctData,
    getTabDetails,
    getAccountDetails,
  } = useGridHelper(props);

  return (
    <>
      <AgGridTable {...props} handleShortKeys={handleShortKeys} />
      <ShortCutKeys
        dialogState={dialogState}
        handleDialogClose={handleDialogClose}
        acctData={acctData}
        getTabDetails={getTabDetails}
        getAccountDetails={getAccountDetails}
        headingWithButton={headingWithButton}
      />
    </>
  );
};

export default AgGridTableWrapper;
