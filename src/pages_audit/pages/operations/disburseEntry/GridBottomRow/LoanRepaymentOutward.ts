import { t } from "i18next";
import React, { useEffect } from "react";

const useGridLoanRepayment = ({ gridApi, dilogueOpen, gridData }) => {
  const updateBottomRow = () => {
    if (!gridApi.current) return;

    const totalInst = Number(gridData?.[0]?.INST_NO) || 0;
    let totalNoOfInstallments = 0;
    const rowData: any[] = [];

    gridApi.current.forEachNode((node: any) => {
      const fromInst = Number(node.data?.FROM_INST) || 0;
      const toInst = Number(node.data?.TO_INST) || 0;
      if (fromInst > 0 && toInst >= fromInst) {
        const noOfInstallments = toInst - fromInst + 1;

        if (totalNoOfInstallments + noOfInstallments <= totalInst) {
          totalNoOfInstallments += noOfInstallments;
        } else {
          const allowed = totalInst - totalNoOfInstallments;
          totalNoOfInstallments += Math.max(allowed, 0);
        }

        rowData.push(node?.data);
      }
    });

    const remainingInst = Math.max(totalInst - totalNoOfInstallments, 0);

    gridApi.current.setGridOption("pinnedBottomRowData", [
      {
        INS_START_DT: `${t("TotalRows")}: ${rowData?.length}`,
        TO_INST: `${t("RemainInst")}: ${remainingInst}`,
        INST_NO: `${t("NoOfInst")}: ${totalNoOfInstallments}`,
      },
    ]);
  };

  useEffect(() => {
    if (gridApi.current && gridData?.length) {
      updateBottomRow();
    }
  }, [gridApi.current, gridData]);

  return {
    updateBottomRow,
  };
};

export default useGridLoanRepayment;
