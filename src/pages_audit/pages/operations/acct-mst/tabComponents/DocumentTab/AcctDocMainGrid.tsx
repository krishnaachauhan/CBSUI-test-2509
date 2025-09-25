import { Fragment } from "react";
import TabNavigate from "../../TabNavigate";
import { AcctDocMainGridMetaData } from "./AcctDocMainGridMetaData";
import AcctModalGridUpload from "./AcctModalGridUpload";
import useAcctMainGrid from "./Hooks/useAcctMainGrid";
import AgGridTableWrapper from "components/AgGridTableWrapper";

const AcctDocMainGrid = () => {
  const {
    isModalOpen,
    currentRowData,
    loading,
    displayMode,
    handleSave,
    handleAddNewRow,
    agGridProps,
    updatePinnedBottomRow,
    gridApiRef,
    authState,
    setIsModalOpen,
    docTemplatePayload,
    docTemplateMutation,
    validateDocuments,
    AcctMSTState,
  } = useAcctMainGrid();

  const customOnCellEditingStopped = (params) => {
    return "";
  };

  return (
    <Fragment>
      <AgGridTableWrapper
        agGridProps={agGridProps}
        gridConfig={AcctDocMainGridMetaData.GridMetaDataType}
        getGridApi={gridApiRef}
        gridContext={{ mode: displayMode, authState }}
        defaultView={"new"}
        handleAddNewRow={handleAddNewRow}
        loading={loading}
        isNewButtonVisible={displayMode !== "view"}
        updatePinnedBottomRow={updatePinnedBottomRow}
        customOnCellEditingStopped={customOnCellEditingStopped}
        refetchData={
          displayMode === "new"
            ? () => docTemplateMutation.mutate(docTemplatePayload)
            : undefined
        }
        height={"calc(100vh - 400px)"}
      />

      {isModalOpen && (
        <AcctModalGridUpload
          onClose={() => setIsModalOpen(false)}
          currentRowData={currentRowData}
          isOpen={isModalOpen}
          displayMode={displayMode}
          validateDocuments={validateDocuments}
          flag={"AcctDocuments"}
          AcctMSTState={AcctMSTState}
        />
      )}

      <TabNavigate
        handleSave={handleSave}
        displayMode={displayMode ?? "new"}
        isNextLoading={false}
      />
    </Fragment>
  );
};

export default AcctDocMainGrid;
