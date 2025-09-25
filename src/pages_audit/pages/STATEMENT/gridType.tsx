import { GridWrapper } from "@acuteinfo/common-base";
import { GridMetaDataType } from "@acuteinfo/common-base";

const GridType = ({ data }) => {
  const getMetadata = (reqdata) => {
    let metaData = {
      gridConfig: {
        dense: true,
        gridLabel: reqdata?.TITLE ?? "",
        rowIdColumn: "U_ID",
        defaultColumnConfig: {
          width: 200,
          maxWidth: 300,
          minWidth: 200,
        },
        allowColumnReordering: false,
        disableSorting: false,
        hideHeader: true,
        disableGroupBy: true,
        enablePagination: Boolean(reqdata?.ENABLE_PAGINATION),
        pageSizes: [20, 40, 50],
        defaultPageSize: 20,
        containerHeight: {
          min: "33vh",
          max: "33vh",
        },
        allowFilter: false,
        allowColumnHiding: false,
        allowRowSelection: false,
        isCusrsorFocused: true,
        hideFooter: false,
      },
    };
    let columns = reqdata?.METADATA?.map((item) => {
      return {
        accessor: item?.ACCESSOR,
        columnName: item?.LABEL,
        sequence: item?.SEQ,
        alignment: item?.ALINGMENT ?? "left",
        componentType:
          item?.ACCESSOR === "TRN_DATE" || item?.ACCESSOR === "VALUE_DT"
            ? "date"
            : item?.COMPONENT_TYPE,
        width: item?.WIDTH ?? 200,
        minWidth: item?.MIN_WIDTH ?? 200,
        maxWidth: item?.MAX_WIDTH ?? 400,
        color: item?.FORE_COLOR ?? "",
        format:
          item?.ACCESSOR === "TRN_DATE" || item?.ACCESSOR === "VALUE_DT"
            ? "dd/MM/yyyy"
            : "",
        showTooltip: item?.ACCESSOR === "REMARKS" ? true : false,
      };
    });
    metaData["columns"] = columns;
    return metaData as any;
  };
  return (
    <>
      <GridWrapper
        key={`statementdetails`}
        finalMetaData={getMetadata(data) as GridMetaDataType}
        data={data?.DATA ?? []}
        setData={() => null}
        headerToolbarStyle={{
          background: "inherit",
          color: "black",
        }}
      />
    </>
  );
};

export default GridType;
