import { Alert } from "@acuteinfo/common-base";
import { ParameterModal } from "./ParameterModal";
import { CashRemiReciForm } from "./cashRemiReciForm";
import DenominationTableDialog from "../CashRemittancePayment/DenominationTableDilog";
import useCashRemiReceipt from "./useCashRemiReceipt";
import { cashRemiReceiptMetadata } from "./CashRemiReceiptMetadata";
import AgGridTableWrapper from "components/AgGridTableWrapper";
import { DenominationReceiptMetaData } from "./DenominationReceiptMetaData";

const CashRemittanceReceipt = () => {
  const {
    isErrorExist,
    errorMessages,
    agGridProps,
    gridApiRef,
    authState,
    docCD,
    handleAddNewRow,
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
    setRemainingAmt,
    denoDisplayMode,
    codeRef,
    formMutate,
    formData,
    handleSaveData,
    gridMutate,
    gridIsLoading,
    formIsLoading,
    openCodeDialog,
    setOpenCodeDialog,
    retriveConfData,
    retrieveConfLoader,
    handleCustomCellKeyDown,
  } = useCashRemiReceipt();

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
      <>
        {docCD !== "TRN/624" && (
          <CashRemiReciForm
            authState={authState}
            ref={codeRef}
            formMutate={formMutate}
            formData={formData}
            formIsLoading={formIsLoading}
            openCodeDialog={openCodeDialog}
          />
        )}
        <AgGridTableWrapper
          agGridProps={agGridProps}
          gridConfig={cashRemiReceiptMetadata.GridMetaDataType}
          getGridApi={gridApiRef}
          gridContext={{
            authState,
            docCD,
            formData,
            codeData: codeRef?.current,
            acctDtlReqPara: {
              TO_ACCT_CD: {
                ACCT_TYPE: "TO_ACCT_TYPE",
                BRANCH_CD: "TO_BRANCH_CD",
                SCREEN_REF: docCD ?? "",
              },
            },
          }}
          defaultView={"new"}
          refetchData={
            formData?.[0]?.TRAN_CD && docCD !== "TRN/624"
              ? async () =>
                  await gridMutate({
                    TRAN_CD: formData?.[0]?.TRAN_CD,
                    COMP_CD: formData?.[0]?.FROM_COMP_CD,
                    LOGIN_BRANCH: authState.user?.branchCode,
                    BRANCH_CD: formData?.[0]?.FROM_BRANCH_CD,
                  })
              : async () =>
                  await retriveConfData({
                    COMP_CD: authState?.companyID,
                    BRANCH_CD: authState.user?.branchCode,
                  })
          }
          handleAddNewRow={handleAddNewRow}
          isNewButtonVisible={formData?.[0]?.TRAN_CD ? true : false}
          height={"calc(100vh - 400px)"}
          hiddenColumns={
            docCD === "TRN/624"
              ? ["TO_BRANCH_CD"]
              : ["ENTERED_BY", "CHEQUE_NO", "CONFIRM_ROW", "BRANCH_CD"]
          }
          hideHeader={
            formData?.[0]?.TRAN_CD || docCD === "TRN/624" ? false : true
          }
          loading={gridIsLoading || retrieveConfLoader}
          handleCustomCellKeyDown={handleCustomCellKeyDown}
        />
      </>
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
        handleSave={handleSaveData}
        title={"CashRemittanceReceipt"}
        metaData={DenominationReceiptMetaData}
      />
      <ParameterModal
        onClose={() => setOpenCodeDialog(false)}
        isOpen={openCodeDialog}
        ref={codeRef}
      />
    </>
  );
};

export default CashRemittanceReceipt;
