import { cashRemiPaymentMetadata } from "./CashRemiPaymentMetadata";
import { Alert } from "@acuteinfo/common-base";
import DenominationTableDialog from "./DenominationTableDilog";
import PrintDialog from "./PrintDialog";
import useCashRemiPayment from "./useCashRemiPayment";
import AgGridTableWrapper from "components/AgGridTableWrapper";
import { DenominationTableMetaData } from "./DenominationTableMetaData";

const CashRemittancePayment = () => {
  const {
    isErrorExist,
    errorMessages,
    agGridProps,
    gridApiRef,
    authState,
    docCD,
    isLoading,
    saveCashRemiPayment,
    refetch,
    handleAddNewRow,
    handleCustomCellKeyDown,
    TableRef,
    isOpenDenomination,
    tableData,
    setIsOpenDenomination,
    setTableData,
    currentRowData,
    remainingAmt,
    denoLoader,
    retrieveDenoLoader,
    denoIsError,
    retrieveIsError,
    denoError,
    retrieveError,
    openPdfViewer,
    printBlob,
    printLoader,
    setOpenPdfViewer,
    setPrintBlob,
    printIsError,
    printError,
    setRemainingAmt,
    isFetching,
    denoDisplayMode,
  } = useCashRemiPayment();
  return (
    <>
      {isErrorExist && (
        <>
          <Alert
            severity={errorMessages?.severity ?? "error"}
            errorMsg={errorMessages?.error_msg ?? "Something went to wrong.."}
            errorDetail={errorMessages?.error_detail}
            color="error"
          />
        </>
      )}
      <AgGridTableWrapper
        agGridProps={agGridProps}
        gridConfig={cashRemiPaymentMetadata.GridMetaDataType}
        getGridApi={gridApiRef}
        gridContext={{
          authState,
          docCD,
          acctDtlReqPara: {
            FROM_ACCT_CD: {
              ACCT_TYPE: "FROM_ACCT_TYPE",
              BRANCH_CD: authState?.user?.branchCode ?? "",
              SCREEN_REF: docCD ?? "",
            },
          },
        }}
        defaultView={"new"}
        loading={isLoading || saveCashRemiPayment?.isLoading || isFetching}
        refetchData={async () => await refetch()}
        handleAddNewRow={handleAddNewRow}
        handleCustomCellKeyDown={handleCustomCellKeyDown}
        isNewButtonVisible={docCD !== "TRN/623"}
        height={"calc(100vh - 200px)"}
      />
      <DenominationTableDialog
        TableRef={TableRef}
        authState={authState}
        docCD={docCD}
        open={isOpenDenomination}
        tableData={tableData}
        handleClose={async () => {
          setIsOpenDenomination(false);
          setTableData([]);
          const node = currentRowData?.current?.node;

          const api = currentRowData?.current?.api;
          setRemainingAmt(0);
          if (!node?.data?.DENO_DTL) {
            const rowNode = gridApiRef?.current?.getDisplayedRowAtIndex(
              node?.rowIndex
            );
            if (rowNode) {
              rowNode.setDataValue("AMOUNT", "");
              await api.setFocusedCell(node.rowIndex, "AMOUNT");
              await api.startEditingCell({
                rowIndex: node.rowIndex,
                colKey: "AMOUNT",
              });
            }
          }
        }}
        remainingAmt={remainingAmt}
        denoLoader={denoLoader || retrieveDenoLoader}
        denoIsError={denoIsError || retrieveIsError}
        denoError={denoError || retrieveError}
        currentRowData={currentRowData}
        denoDisplayMode={denoDisplayMode}
        title={"CashRemittancePayment"}
        metaData={DenominationTableMetaData}
      />
      <PrintDialog
        openPdfViewer={openPdfViewer}
        printBlob={printBlob}
        printLoader={printLoader}
        setOpenPdfViewer={setOpenPdfViewer}
        setPrintBlob={setPrintBlob}
        printIsError={printIsError}
        printError={printError}
      />
    </>
  );
};

export default CashRemittancePayment;
