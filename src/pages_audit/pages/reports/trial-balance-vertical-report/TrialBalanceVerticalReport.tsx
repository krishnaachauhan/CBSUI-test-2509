import GroupedTableWrapper from "components/groupedReportComponent";
import { sections, jsondata } from "./sample-data";
import { useMemo } from "react";

const constructColumns = (columns, showNoOfAcc = false) => {
  const newColumns = columns.map((item) => {
    const key = Object.keys(item)[0];
    return {
      accessor: key,
      columnName: item[key],
      alignment: key === "balance" || key === "noofac" ? "right" : "left",
    };
  });

  return showNoOfAcc
    ? newColumns
    : newColumns.filter((item) => item.accessor !== "noofac");
};

const TrialBalanceVerticalReport = () => {
  const showNoOfAcc = true;
  const columns = useMemo(
    () => constructColumns(jsondata.columnsLabel, showNoOfAcc),
    [jsondata.columnsLabel, showNoOfAcc]
  );

  return (
    <GroupedTableWrapper
      data={jsondata.sections}
      columns={columns}
      showNoOfAcc={showNoOfAcc}
    />
  );
};

export default TrialBalanceVerticalReport;
