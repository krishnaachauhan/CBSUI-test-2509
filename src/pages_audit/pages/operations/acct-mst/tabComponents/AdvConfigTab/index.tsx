import React from "react";
import TabNavigate from "../../TabNavigate";
import { advConfGridMetaData } from "./AdvConfigMetaData";
import useAdvConfig from "./useAdvConfig";
import { AdvConfMstForm } from "./advConfMstForm/advConfMstForm";
import AgGridTableWrapper from "components/AgGridTableWrapper";

export const AdvConfigTab = () => {
  const {
    agGridProps,
    gridApiRef,
    authState,
    AcctMSTState,
    handleAddNewRow,
    openDialog,
    setGridData,
    gridData,
    initialData,
    acountNum,
    setOpenDialg,
    handleSave,
  } = useAdvConfig();
  return (
    <>
      <AgGridTableWrapper
        agGridProps={agGridProps}
        gridConfig={advConfGridMetaData.GridMetaDataType}
        getGridApi={gridApiRef}
        gridContext={{ authState, mode: AcctMSTState?.formmodectx ?? "new" }}
        defaultView={"new"}
        handleAddNewRow={handleAddNewRow}
        isNewButtonVisible={AcctMSTState?.formmodectx !== "view"}
        height={"calc(100vh - 400px)"}
      />
      {openDialog && (
        <AdvConfMstForm
          setGridData={setGridData}
          gridData={gridData}
          initialData={initialData}
          acountNum={acountNum}
          closeDialog={() => setOpenDialg(false)}
        />
      )}

      <TabNavigate
        handleSave={handleSave}
        displayMode={AcctMSTState?.formmodectx ?? "new"}
        isNextLoading={false}
      />
    </>
  );
};
