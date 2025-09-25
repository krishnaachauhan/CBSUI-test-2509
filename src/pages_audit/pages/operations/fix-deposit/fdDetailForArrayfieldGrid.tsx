import { useCallback, useContext, useMemo } from "react";
import {
  GridWrapper,
  ActionTypes,
  GridMetaDataType,
  usePopupContext,
} from "@acuteinfo/common-base";
import { FDDetailForArrayFieldMetaData } from "./FDDetailGridForArrayFieldMetaData";
import { FDContext } from "./context/fdContext";

// Render actions
const actions: ActionTypes[] = [
  {
    actionName: "edit",
    actionLabel: "Edit",
    multiple: false,
    rowDoubleClick: true,
  },
  {
    actionName: "delete",
    actionLabel: "Delete",
    multiple: false,
    rowDoubleClick: false,
  },
];

export const FDDetailGridForArrayField = ({
  gridData,
  setGridData,
  editingSRNORef,
  setFdDtlRefresh,
}) => {
  const { updateIniDtlFormDataNewFD } = useContext(FDContext);
  const { MessageBox } = usePopupContext();

  const handleDelete = useCallback(
    async (rowData: any) => {
      const btnName = await MessageBox({
        message: "DeleteData",
        messageTitle: "Confirmation",
        buttonNames: ["Yes", "No"],
        icon: "CONFIRM",
      });

      if (btnName === "Yes" && rowData?.SR_NO) {
        setGridData((prevData: any[]) => {
          const filteredData = prevData.filter(
            (row) => row?.SR_NO !== rowData?.SR_NO
          );
          if (filteredData.length === 0) {
            return [];
          }
          return filteredData.map((row, index) => ({
            ...row,
            SR_NO: index + 1,
          }));
        });
      }
    },
    [MessageBox, setGridData]
  );

  const handleEdit = useCallback(
    (rowData: any) => {
      editingSRNORef.current = rowData;
      updateIniDtlFormDataNewFD({ ...rowData });
      setFdDtlRefresh((prev: number) => prev + 1);
    },
    [editingSRNORef, updateIniDtlFormDataNewFD, setFdDtlRefresh]
  );

  const setCurrentAction = useCallback(
    async (data) => {
      const { name, rows } = data;
      const rowData = rows[0]?.data;
      if (!rowData) return;

      if (name === "edit") {
        handleEdit(rowData);
      } else if (name === "delete") {
        await handleDelete(rowData);
      }
    },
    [handleEdit, handleDelete]
  );

  const gridKey = useMemo(
    () =>
      `FDDetailForArrayField_${gridData?.length}_${
        editingSRNORef?.current?.SR_NO || "new"
      }`,
    [gridData?.length, editingSRNORef?.current?.SR_NO]
  );

  return (
    <GridWrapper
      key={gridKey}
      finalMetaData={FDDetailForArrayFieldMetaData as GridMetaDataType}
      data={gridData}
      setData={() => null}
      actions={actions}
      setAction={setCurrentAction}
      hideHeader={true}
    />
  );
};
