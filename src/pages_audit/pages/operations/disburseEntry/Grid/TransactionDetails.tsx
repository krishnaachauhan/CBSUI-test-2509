import React, { Fragment, useContext } from "react";
import { t } from "i18next";
import useGridTransactionSummary from "../GridBottomRow/TransactionSummaryOutward";
import { AuthContext } from "pages_audit/auth";
import { transactionMetadata } from "./TransactionDetailsMetaData";
import AgGridTableWrapper from "components/AgGridTableWrapper";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";

const TransactionDetails = ({ formRef, gridData, transactionApi }) => {
  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const handletransactionKeyDown = async (params, lastColumn) => {
    const {
      event,
      column: { colDef },
      api,
      node,
      value,
      context,
    } = params;
    const gridData1: any = gridData?.[0];
    if (
      colDef.field === "DISB_AMT" &&
      gridData1?.DISB_AMT &&
      value > gridData1?.DISB_AMT
    ) {
      node.setDataValue("errors", [
        ...(node.data.errors || []),
        "TransactionAmountGreater",
      ]);
      const buttons = context?.MessageBox({
        message: "TransactionAmountGreater",
        messageTitle: t("ValidationFailed"),
        icon: "ERROR",
      });
      node.setDataValue("DISB_AMT", "");
      if (buttons === "Ok") {
        params?.node.setData({
          ...params.node.data,
          [params?.colDef?.field]: "",
        });
        params.api.setFocusedCell(node.rowIndex, [params?.colDef?.field]);
        await params.api.startEditingCell({
          rowIndex: node.rowIndex,
          colKey: [params?.colDef?.field],
        });
        return;
      }
      return;
    }

    if (node?.data?.SDC === "DISB") {
      const typeCd = node?.data?.TYPE_CD;

      if (typeCd === "3") {
        context?.MessageBox({
          message: "CreditNotAllowedforDisbursement",
          messageTitle: t("ValidationFailed"),
          icon: "ERROR",
        });

        node.setDataValue("DISB", " ");
        params?.api.setFocusedCell(node.rowIndex, [params?.colDef?.field]);
        await params.api.startEditingCell({
          rowIndex: node.rowIndex,
          colKey: [params?.colDef?.field],
        });

        return;
      }
    }
    updatePinnedBottomRow();
    return;
  };

  const { updatePinnedBottomRow } = useGridTransactionSummary({
    gridApi: transactionApi,
    dilogueOpen: true,
  });

  const agGridProps = {
    id: `transactionGrid` + gridData,
    columnDefs: transactionMetadata.columns({ authState, formRef }),
    rowData: gridData ?? [],
    onCellValueChanged: updatePinnedBottomRow,
  };

  return (
    <Fragment>
      <AgGridTableWrapper
        agGridProps={agGridProps}
        gridConfig={transactionMetadata.GridMetaDataType}
        getGridApi={transactionApi}
        autoSelectFirst={true}
        defaultView={"new"}
        gridContext={{
          authState,
          acctDtlReqPara: {
            OPP_ACCT_CD: {
              ACCT_TYPE: "OPP_ACCT_TYPE",
              BRANCH_CD: authState?.user?.branchCode ?? "",
              SCREEN_REF: docCD ?? "",
            },
          },
        }}
        newButtonLabel="AddRow"
        updatePinnedBottomRow={updatePinnedBottomRow}
        handleCustomCellKeyDown={handletransactionKeyDown}
        loading={false}
        height={"calc(100vh - 75vh)"}
        subLabel={t("DisbursementTransactionDetails")}
      />
    </Fragment>
  );
};

export default TransactionDetails;
