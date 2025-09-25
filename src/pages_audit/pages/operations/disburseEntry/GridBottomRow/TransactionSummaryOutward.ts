import { displayNumber } from "components/agGridTable/utils/helper";
import { t } from "i18next";
import React, { useEffect } from "react";

const useGridTransactionSummary = ({ gridApi, dilogueOpen }) => {
  const updatePinnedBottomRow = () => {
    if (!gridApi.current) return;

    let totalDebitAmount = 0;
    let totalCreditAmount = 0;
    let rowData: any[] = [];

    gridApi.current.forEachNode((node) => {
      let typeCd = node.data.TYPE_CD?.value || node.data.TYPE_CD;
      let disbAmt = node.data?.DISB_AMT?.value || node.data?.DISB_AMT;
      let gst = node.data?.GST?.value || node.data?.GST;

      rowData.push(node?.data);

      if (typeCd?.trim() !== "3") {
        totalDebitAmount += parseFloat(disbAmt ?? 0) + parseFloat(gst ?? 0);
      }
      if (typeCd?.trim() === "3") {
        totalCreditAmount += parseFloat(disbAmt ?? 0) + parseFloat(gst ?? 0);
      }
    });

    const totalFinalAmount = totalDebitAmount - totalCreditAmount;

    gridApi.current.setGridOption("pinnedBottomRowData", [
      {
        TYPE_CD: `${t("TotalRows")}: ${rowData?.length}`,
        DISB_AMT: `${t("Debit")}: ${displayNumber(totalDebitAmount)}`,
        REMARKS: `${t("Credit")}: ${displayNumber(totalCreditAmount)}`,
        OPP_ACCT_TYPE: `${t("NetDebit")}: ${displayNumber(totalFinalAmount)}`,
      },
    ]);
  };

  useEffect(() => {
    if (gridApi && dilogueOpen) {
      updatePinnedBottomRow();
    }
  }, [gridApi, dilogueOpen]);

  return { updatePinnedBottomRow };
};

export default useGridTransactionSummary;
