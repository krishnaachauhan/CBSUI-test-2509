import useCkycDocuments from "./useCkycDocuments";
import { Fragment } from "react";
import { AcctDocMainGridMetaData } from "pages_audit/pages/operations/acct-mst/tabComponents/DocumentTab/AcctDocMainGridMetaData";
import TabNavigate from "../formDetails/formComponents/TabNavigate";
import AcctModalGridUpload from "pages_audit/pages/operations/acct-mst/tabComponents/DocumentTab/AcctModalGridUpload";
import AgGridTableWrapper from "components/AgGridTableWrapper";

const KycDocuments = ({ formMode, isModal }: any) => {
  const {
    agGridProps,
    gridApiRef,
    displayMode,
    authState,
    handleAddNewRow,
    docTemplatePayload,
    isModalOpen,
    setIsModalOpen,
    currentRowData,
    ckycState,
    validateDocuments,
    handleSave,
    loading,
  } = useCkycDocuments({ isModal });

  return (
    <Fragment>
      <AgGridTableWrapper
        agGridProps={agGridProps}
        gridConfig={AcctDocMainGridMetaData.GridMetaDataType}
        getGridApi={gridApiRef}
        gridContext={{ mode: formMode, authState }}
        defaultView={"new"}
        hiddenColumns={[
          "ACTIVE",
          "DOC_TYPE",
          "DOC_AMOUNT",
          "DOCUMENT_TYPE",
          "DOC_WEIGHTAGE",
        ]}
        handleAddNewRow={handleAddNewRow}
        loading={loading}
        isNewButtonVisible={Boolean(formMode !== "view")}
        height={"calc(100vh - 400px)"}
      />

      {isModalOpen && (
        <AcctModalGridUpload
          onClose={() => setIsModalOpen(false)}
          currentRowData={currentRowData}
          isOpen={isModalOpen}
          displayMode={formMode ?? "new"}
          validateDocuments={validateDocuments}
          flag={"CKYCDocuments"}
          AcctMSTState={ckycState}
        />
      )}

      <TabNavigate
        handleSave={handleSave}
        displayMode={ckycState?.formmodectx ?? "new"}
        isModal={isModal}
      />
    </Fragment>
  );
};

export default KycDocuments;
