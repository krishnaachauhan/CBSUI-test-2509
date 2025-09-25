import React, { Fragment, useContext } from "react";
import { t } from "i18next";
import { AuthContext } from "pages_audit/auth";
import useGridLoanRepayment from "../GridBottomRow/LoanRepaymentOutward";
import { loanRepaymentMetadata } from "./LoanRepaymentMetaData";
import AgGridTableWrapper from "components/AgGridTableWrapper";

const LoanRepayment = ({ formRef, gridData, loanRepaymentApi }) => {
  const { authState } = useContext(AuthContext);

  const handleloanRepaymentKeyDown = async (
    params,
    lastColumn
  ): Promise<boolean | undefined> => {
    const {
      event,
      column: { colDef },
      api,
      node,
      context,
    } = params;

    const totalInst = Number(gridData?.[0]?.INST_NO) || 0;
    let totalNoOfInstallments = 0;
    let previousToInst = 0;
    let rowCount = loanRepaymentApi.current.getDisplayedRowCount();

    for (let i = 0; i < rowCount; i++) {
      const rowNode = loanRepaymentApi.current.getDisplayedRowAtIndex(i);
      const data = rowNode?.data || {};
      const fromInst = Number(data?.FROM_INST) || 0;
      const toInst = Number(data?.TO_INST) || 0;

      if (fromInst && toInst && toInst < fromInst) {
        const btn = await context.MessageBox({
          message: "ToInstallmentGreaterFromInstallment",
          messageTitle: t("ValidationFailed"),
          icon: "ERROR",
        });
        if (btn === "Ok") {
          rowNode.setData({ ...data, TO_INST: "" });
          api.setFocusedCell(i, "TO_INST");
          await api.startEditingCell({ rowIndex: i, colKey: "TO_INST" });
          return;
        }
      }

      if (fromInst && fromInst !== previousToInst + 1 && fromInst !== 1) {
        const btn = await context.MessageBox({
          message: `From Installment should be greater than previous ${previousToInst}`,
          messageTitle: t("ValidationFailed"),
          icon: "ERROR",
        });
        if (btn === "Ok") {
          rowNode.setData({ ...data, FROM_INST: "" });
          api.setFocusedCell(i, "FROM_INST");
          await api.startEditingCell({ rowIndex: i, colKey: "FROM_INST" });
          return;
        }
      }

      if (toInst && toInst > totalInst) {
        const btn = await context.MessageBox({
          message: `To Installment cannot exceed total Installments (${totalInst})`,
          messageTitle: t("ValidationFailed"),
          icon: "ERROR",
        });
        if (btn === "Ok") {
          rowNode.setData({ ...data, TO_INST: "" });
          api.setFocusedCell(i, "TO_INST");
          await api.startEditingCell({ rowIndex: i, colKey: "TO_INST" });
          return true;
        }
      }

      if (fromInst && toInst) {
        totalNoOfInstallments += toInst - fromInst + 1;
      }

      previousToInst = toInst || previousToInst;
    }

    if (totalNoOfInstallments > totalInst) {
      const btn = await context.MessageBox({
        message: `Total No. of Installment should not exceed ${totalInst}`,
        messageTitle: t("ValidationFailed"),
        icon: "ERROR",
      });

      if (btn === "Ok") {
        params?.node.setData({
          ...params.node.data,
          [params?.colDef?.field]: "",
        });
        api.setFocusedCell(params.node.rowIndex, [params?.colDef?.field]);
        await api.startEditingCell({
          rowIndex: params.node.rowIndex,
          colKey: [params?.colDef?.field],
        });
        return;
      }
    }

    updateBottomRow();

    const remainingInst = Math.max(totalInst - totalNoOfInstallments, 0);

    if (
      colDef.field === "INST_RS" &&
      (event.key === "Tab" || event.key === "Enter") &&
      remainingInst > 0
    ) {
      api.applyTransaction({ add: [{}] });
      api.setFocusedCell(params.node.rowIndex + 1, "FROM_INST");
      await api.startEditingCell({
        rowIndex: params.node.rowIndex + 1,
        colKey: "FROM_INST",
      });
    }
  };

  const { updateBottomRow } = useGridLoanRepayment({
    gridApi: loanRepaymentApi,
    dilogueOpen: true,
    gridData,
  });

  const agGridProps = {
    id: `loanRepaymentGrid` + gridData,
    columnDefs: loanRepaymentMetadata.columns({ authState, formRef }),
    rowData: gridData ?? [],
    onCellValueChanged: updateBottomRow,
  };
  return (
    <Fragment>
      <AgGridTableWrapper
        agGridProps={agGridProps}
        gridConfig={loanRepaymentMetadata.GridMetaDataType}
        getGridApi={loanRepaymentApi}
        autoSelectFirst={true}
        defaultView={"new"}
        newButtonLabel="AddRow"
        updatePinnedBottomRow={updateBottomRow}
        handleCustomCellKeyDown={handleloanRepaymentKeyDown}
        loading={false}
        height={"calc(100vh - 82vh)"}
        subLabel={t("loanRepaymentSchedule")}
      />
    </Fragment>
  );
};

export default LoanRepayment;
