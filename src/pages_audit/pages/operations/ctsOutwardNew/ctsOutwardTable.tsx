import React, { useEffect } from "react";
import { CtsOutwardColumn } from "./ctsOutwardColumn";
import useCtsOutward from "./Hooks/useCtsOutward";
import AgGridTableWrapper from "components/AgGridTableWrapper";

interface CtsOutWardTableProps {
  gridApi?: any;
  defaultView?: any;
  formState?: any;
  authState?: any;
  setOpenAddBankForm?: any;
  setBankData?: any;
  data?: any;
  getOutwardClearingData?: any;
  handleCustomCellKeyDown?: any;
  setCurrentRowIndex?: any;
  zoneTranType?: any;
  chequeReqData?: any;
  hiddenColumns?: string[];
}

const CtsOutWardTable: React.FC<CtsOutWardTableProps> = React.memo(
  ({
    gridApi,
    defaultView,
    formState,
    authState,
    setOpenAddBankForm,
    setBankData,
    data,
    getOutwardClearingData,
    handleCustomCellKeyDown,
    setCurrentRowIndex,
    zoneTranType,
    chequeReqData,
    hiddenColumns = [],
  }) => {
    const { updatePinnedBottomRow, agGridProps, handleAddNewRow } =
      useCtsOutward({
        gridApi,
        defaultView,
        formState,
        authState,
        setOpenAddBankForm,
        setBankData,
        data,
        getOutwardClearingData,
        setCurrentRowIndex,
        zoneTranType,
      });
    return (
      <AgGridTableWrapper
        agGridProps={agGridProps}
        gridConfig={CtsOutwardColumn.gridConfig}
        getGridApi={gridApi}
        autoSelectFirst={true}
        defaultView={defaultView}
        updatePinnedBottomRow={updatePinnedBottomRow}
        handleCustomCellKeyDown={handleCustomCellKeyDown}
        gridContext={{
          chequeReqData: chequeReqData,
          dateData: data,
          authState,
        }}
        handleAddNewRow={handleAddNewRow}
        isNewButtonVisible={defaultView === "new"}
        newButtonLabel="Add Row"
        height={"calc(100vh - 550px)"}
        hiddenColumns={hiddenColumns}
      />
    );
  }
);

export default CtsOutWardTable;
