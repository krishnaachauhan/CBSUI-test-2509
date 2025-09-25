import {
  Alert,
  queryClient,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { Dialog } from "@mui/material";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import { gridMetadata } from "./gridMetaData";
import { AuthContext } from "pages_audit/auth";
import { useDialogContext } from "../../payslip-issue-entry/DialogContext";
import { cloneDeep } from "lodash";
import { format, parse } from "date-fns";
import { t } from "i18next";
import {
  getFormattedDate,
  getGridRowData,
} from "components/agGridTable/utils/helper";
import AgGridTableWrapper from "components/AgGridTableWrapper";

const formattedDate = (dateString) =>
  dateString
    ? format(
        parse(dateString, "dd/MM/yyyy", new Date()),
        "dd/MMM/yyyy"
      ).toUpperCase()
    : null;

export const LockerWaitingList = ({
  setIsDialogOpen,
  isDialogOpen,
  waitListDtlPayload,
}) => {
  const gridRef = useRef<any>();
  const dataChangesRef = useRef<any>({ originalData: [], deletedData: [] });

  const { MessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const { trackDialogClass } = useDialogContext();

  const [activeFlag, setActiveFlag] = useState<boolean>(true);
  const [referenceData, setReferenceData] = useState<any>([]);
  const [renderData, setRenderData] = useState<any>([]);

  useEffect(() => {
    if (isDialogOpen) trackDialogClass("waitingList");
    return () => {
      trackDialogClass("main");
      dataChangesRef.current = { originalData: [], deletedData: [] };
    };
  }, [isDialogOpen]);

  const { isLoading, isError, error, refetch, isFetching } = useQuery(
    ["getLockerWaitingListDtl", waitListDtlPayload],
    () => API.getLockerWaitingListDtl(waitListDtlPayload),
    {
      enabled: isDialogOpen && !!waitListDtlPayload,
      retry: 1,
      refetchOnWindowFocus: false,
      onSuccess: (fetchedData) => {
        const updatedFetchData = fetchedData?.map((d) => ({
          ...d,
          ID_CUST_NM: d?.CUSTOMER_ID ? d?.ID_CUST_NM : d?.CUST_NM,
          ID_ADDRESS: d?.CUSTOMER_ID ? d?.ID_ADDRESS : d?.ADDRESS,
          ID_CONTACT2: d?.CUSTOMER_ID ? d?.ID_CONTACT2 : d?.CONTACT2,
        }));
        dataChangesRef.current.originalData = cloneDeep(updatedFetchData);
        setReferenceData(updatedFetchData);
        setRenderData(updatedFetchData.filter(({ ALLOTED }) => !ALLOTED));
      },
    }
  );

  const locTypeWaitListDML = useMutation(
    "locTypeWaitListDml",
    API.locTypeWaitListDml,
    {
      onError: async (error: any) => {
        await MessageBox({
          messageTitle: t("Error"),
          message: error?.error_msg ?? "",
          icon: "ERROR",
        });
      },
      onSuccess: async (data) => {
        setIsDialogOpen(false);
      },
    }
  );

  const handleClose = async () => {
    let currentData = getGridRowData(gridRef) || [];
    currentData = currentData.filter(
      (obj) => !(Object.keys(obj).length === 1 && obj.TRAN_DT)
    );

    let row: (typeof currentData)[number] | null = null;
    let rowIndex = -1;

    for (let i = 0; i < currentData.length; i++) {
      if (
        !currentData[i].CUSTOMER_ID &&
        (!currentData[i].ID_CUST_NM ||
          !currentData[i].ID_CONTACT2 ||
          !currentData[i].ID_ADDRESS)
      ) {
        row = currentData[i];
        rowIndex = i + 1;
        break;
      }
    }

    if (row) {
      if ((!row.TRAN_CD && !row.ID_CUST_NM) || !row.ID_CUST_NM) {
        await MessageBox({
          messageTitle: t("inValidName"),
          message: t(`inValidNameInRow`, { rowIndex }),
          icon: "INFO",
        });
        return;
      }
      if ((!row.TRAN_CD && !row.ID_CONTACT2) || !row.ID_CONTACT2) {
        await MessageBox({
          messageTitle: t("inValidMobile"),
          message: t(`inValidMobileInRow`, { rowIndex }),
          icon: "INFO",
        });
        return;
      }
      if (
        (!row.TRAN_CD && row.ID_CONTACT2.length !== 10) ||
        row.ID_CONTACT2.length !== 10
      ) {
        await MessageBox({
          messageTitle: t("inValidMobile"),
          message: t(`notValidMobileInRow`, { rowIndex }),
          icon: "INFO",
        });
        return;
      }
      if ((!row.TRAN_CD && !row.ID_ADDRESS) || !row.ID_ADDRESS) {
        await MessageBox({
          messageTitle: t("inValidAddress"),
          message: t(`inValidAddressInRow`, { rowIndex }),
          icon: "INFO",
        });
        return;
      }
    }

    const reqData = requestData(dataChangesRef.current, currentData);

    if (
      reqData?.newRowData?.length > 0 ||
      reqData?.updatedRowData?.length > 0 ||
      reqData?.deletedRowData?.length > 0
    ) {
      let btnAction = await MessageBox({
        messageTitle: t("confirmation"),
        message: t("doYouWantToSaveChanges"),
        buttonNames: ["Yes", "No", "Cancel"],
        defFocusBtnName: "Yes",
        icon: "CONFIRM",
      });

      if (btnAction === "Yes") {
        const newRowData = Array.isArray(reqData?.newRowData)
          ? reqData?.newRowData?.map(({ isNewRow, ...rowData }) => ({
              ...rowData,
              ALLOTED: rowData?.ALLOTED
                ? rowData.ALLOTED === true
                  ? "Y"
                  : "N"
                : "N",
              CUSTOMER_ID: rowData?.CUSTOMER_ID ?? "",
              CUST_NM: rowData?.ID_CUST_NM ?? "",
              CONTACT2: rowData?.ID_CONTACT2 ?? "",
              ADDRESS: rowData?.ID_ADDRESS ?? "",
              REMARKS: rowData?.REMARKS ?? "",
              TRAN_DT: rowData?.TRAN_DT ? formattedDate(rowData?.TRAN_DT) : "",
            }))
          : [];

        const deleteRowData = Array.isArray(reqData?.deletedRowData)
          ? reqData?.deletedRowData?.map((row) => ({
              ...row,
              ALLOTED: row?.ALLOTED === true ? "Y" : "N",
            }))
          : [];

        const payload = {
          ...waitListDtlPayload,
          DETAILS_DATA: {
            isNewRow: newRowData ?? [],
            isUpdatedRow: reqData?.updatedRowData ?? [],
            isDeleteRow: deleteRowData ?? [],
          },
        };

        locTypeWaitListDML.mutate(payload);
      } else if (btnAction === "No") {
        setIsDialogOpen(false);
      }
    } else {
      setIsDialogOpen(false);
    }
  };

  const handleToggle = () => {
    setActiveFlag((prevFlag) => {
      const newFlag = !prevFlag;
      const currentData = getGridRowData(gridRef);
      const currentTranCds = Array.isArray(currentData)
        ? currentData.map((item) => item.TRAN_CD)
        : [];

      const filteredReferenceData = referenceData.filter(
        (refItem) => !currentTranCds.includes(refItem.TRAN_CD)
      );

      const updatedData = newFlag
        ? currentData?.filter(({ ALLOTED }) => !ALLOTED)
        : [...filteredReferenceData, ...currentData];

      setRenderData(updatedData);
      gridRef.current?.api?.setRowData(updatedData);

      return newFlag;
    });
  };

  const handleSave = async () => {
    let currentData = getGridRowData(gridRef) || [];
    currentData = currentData.filter(
      (obj) => !(Object.keys(obj).length === 1 && obj.TRAN_DT)
    );

    let row: (typeof currentData)[number] | null = null;
    let rowIndex = -1;

    for (let i = 0; i < currentData.length; i++) {
      if (
        !currentData[i].CUSTOMER_ID &&
        (!currentData[i].ID_CUST_NM ||
          !currentData[i].ID_CONTACT2 ||
          !currentData[i].ID_ADDRESS)
      ) {
        row = currentData[i];
        rowIndex = i + 1;
        break;
      }
    }

    if (row) {
      if ((!row.TRAN_CD && !row.ID_CUST_NM) || !row.ID_CUST_NM) {
        await MessageBox({
          messageTitle: t("inValidName"),
          message: t(`inValidNameInRow`, { rowIndex }),
          icon: "INFO",
        });
        return;
      }
      if ((!row.TRAN_CD && !row.ID_CONTACT2) || !row.ID_CONTACT2) {
        await MessageBox({
          messageTitle: t("inValidMobile"),
          message: t(`inValidMobileInRow`, { rowIndex }),
          icon: "INFO",
        });
        return;
      }
      if (
        (!row.TRAN_CD && row.ID_CONTACT2.length !== 10) ||
        row.ID_CONTACT2.length !== 10
      ) {
        await MessageBox({
          messageTitle: t("inValidMobile"),
          message: t(`notValidMobileInRow`, { rowIndex }),
          icon: "INFO",
        });
        return;
      }
      if ((!row.TRAN_CD && !row.ID_ADDRESS) || !row.ID_ADDRESS) {
        await MessageBox({
          messageTitle: t("inValidAddress"),
          message: t(`inValidAddressInRow`, { rowIndex }),
          icon: "INFO",
        });
        return;
      }
    }
    setRenderData(currentData);
    const reqData = requestData(dataChangesRef.current, currentData);

    if (
      reqData?.newRowData?.length > 0 ||
      reqData?.updatedRowData?.length > 0 ||
      reqData?.deletedRowData?.length > 0
    ) {
      let btnAction = await MessageBox({
        messageTitle: t("Confirmation"),
        message: t("AreYouSureToSaveTheData"),
        buttonNames: ["Yes", "No"],
        defFocusBtnName: "Yes",
        icon: "CONFIRM",
      });

      if (btnAction === "Yes") {
        const newRowData = Array.isArray(reqData?.newRowData)
          ? reqData?.newRowData?.map(({ isNewRow, ...rowData }) => ({
              ...rowData,
              ALLOTED: rowData?.ALLOTED
                ? rowData.ALLOTED === true
                  ? "Y"
                  : "N"
                : "N",
              CUSTOMER_ID: rowData?.CUSTOMER_ID ?? "",
              CUST_NM: rowData?.ID_CUST_NM ?? "",
              CONTACT2: rowData?.ID_CONTACT2 ?? "",
              ADDRESS: rowData?.ID_ADDRESS ?? "",
              REMARKS: rowData?.REMARKS ?? "",
              TRAN_DT: rowData?.TRAN_DT ? formattedDate(rowData?.TRAN_DT) : "",
            }))
          : [];

        const deleteRowData = Array.isArray(reqData?.deletedRowData)
          ? reqData?.deletedRowData?.map((row) => ({
              ...row,
              ALLOTED: row?.ALLOTED === true ? "Y" : "N",
            }))
          : [];

        const payload = {
          ...waitListDtlPayload,
          DETAILS_DATA: {
            isNewRow: newRowData ?? [],
            isUpdatedRow: reqData?.updatedRowData ?? [],
            isDeleteRow: deleteRowData ?? [],
          },
        };

        locTypeWaitListDML.mutate(payload);
      }
    }
  };

  const handleNew = async () => {
    let currentData = getGridRowData(gridRef) || [];
    currentData = currentData.filter(
      (obj) => !(Object.keys(obj).length === 1 && obj.TRAN_DT)
    );

    let row =
      currentData.length > 0 ? currentData[currentData.length - 1] : null;
    let rowIndex = currentData.indexOf(row) + 1;

    if (row) {
      if (
        (!row.ID_CUST_NM && !row.TRAN_CD && !row.CUSTOMER_ID) ||
        (!row.ID_CUST_NM && !row.CUSTOMER_ID)
      ) {
        await MessageBox({
          messageTitle: t("inValidName"),
          message: t(`inValidNameInRow`, { rowIndex }),
          icon: "INFO",
        });
        return;
      }
      if (
        (!row.ID_CONTACT2 && !row.TRAN_CD && !row.CUSTOMER_ID) ||
        (!row.ID_CONTACT2 && !row.CUSTOMER_ID)
      ) {
        await MessageBox({
          messageTitle: t("inValidMobile"),
          message: t(`inValidMobileInRow`, { rowIndex }),
          icon: "INFO",
        });
        return;
      }
      if (
        (row.ID_CONTACT2.length !== 10 && !row.TRAN_CD && !row.CUSTOMER_ID) ||
        (row.ID_CONTACT2.length !== 10 && !row.CUSTOMER_ID)
      ) {
        await MessageBox({
          messageTitle: t("inValidMobile"),
          message: t(`notValidMobileInRow`, { rowIndex }),
          icon: "INFO",
        });
        return;
      }
      if (
        (!row.ID_ADDRESS && !row.TRAN_CD && !row.CUSTOMER_ID) ||
        (!row.ID_ADDRESS && !row.CUSTOMER_ID)
      ) {
        await MessageBox({
          messageTitle: t("inValidAddress"),
          message: t(`inValidAddressInRow`, { rowIndex }),
          icon: "INFO",
        });
        return;
      }
    }
    gridRef.current.applyTransaction({
      add: [
        {
          ID_CUST_NM: "",
          ID_CONTACT2: "",
          ID_ADDRESS: "",
          TRAN_DT: getFormattedDate(authState?.workingDate) ?? "",
          ALLOW_EDIT: "Y",
          TRAN_CD: "",
          REMARKS: "",
          isNewRow: true,
        },
      ],
    });

    setTimeout(() => {
      gridRef.current.setFocusedCell(currentData.length, "CUSTOMER_ID");
      gridRef.current.startEditingCell({
        rowIndex: currentData.length,
        colKey: "CUSTOMER_ID",
      });
    }, 100);
  };

  const handleDelete = async (params) => {
    const { context, node, api } = params;

    if (node?.data?.TRAN_CD && node?.data?.ALLOTED === true) {
      return await MessageBox({
        messageTitle: t("notAllowed"),
        message: t("allotedEntryCanNotBeDeleted"),
        icon: "INFO",
      });
    }

    const rowData: any[] = [];
    api.forEachNode((node) => rowData.push(node.data));

    let res = await context.MessageBox({
      messageTitle: t("confirmation"),
      message: t("areYouSureWantToDeleteRow"),
      buttonNames: ["Yes", "No"],
      defFocusBtnName: "Yes",
      icon: "CONFIRM",
    });
    if (res === "Yes") {
      api.applyTransaction({ remove: [node.data] });
      context.updatePinnedBottomRow();

      dataChangesRef.current.deletedData.push({
        ...node.data,
        isDeletedRow: true,
      });

      setReferenceData((prevVal) =>
        prevVal.filter((row) => row?.TRAN_CD !== node?.data?.TRAN_CD)
      );
    }
  };

  function requestData(mainData, currentData) {
    const originalData = mainData?.originalData ?? [];
    const deletedDataList = mainData?.deletedData ?? [];
    const currentList = currentData ?? [];

    const deletedTranIDs = Array.isArray(deletedDataList)
      ? deletedDataList?.map((d) => d.TRAN_CD)
      : [];

    const deletedRowData = originalData.filter((record) =>
      deletedTranIDs.includes(record.TRAN_CD)
    );

    const newRowData: any[] = [];
    const existingRecords: any[] = [];

    for (const record of currentList) {
      if (record.TRAN_CD === "" && record.isNewRow === true) {
        const { TRAN_CD, errors, ...newRecord } = record;
        newRowData.push(newRecord);
      } else {
        existingRecords.push(record);
      }
    }

    function normalizeUpdatedRecord(record: any, originalData: any[]) {
      const keyMap = {
        ID_CONTACT2: "CONTACT2",
        ID_CUST_NM: "CUST_NM",
        ID_ADDRESS: "ADDRESS",
      };

      const updatedCols = record._UPDATEDCOLUMNS || [];
      const oldRow = record._OLDROWVALUE || {};

      for (const [idKey, mainKey] of Object.entries(keyMap)) {
        const isUpdated =
          updatedCols.includes(idKey) || updatedCols.includes(mainKey);

        if (isUpdated) {
          if (record[idKey] !== undefined) {
            record[mainKey] = record[idKey];
            delete record[idKey];
          }
          const original = originalData?.find(
            (o) => o.TRAN_CD === record.TRAN_CD
          );

          if (original) {
            const originalMain = original[mainKey];
            const originalId = original[idKey];

            if (originalMain === "" || originalMain === undefined) {
              oldRow[mainKey] = "";
            } else if (originalId !== undefined) {
              oldRow[mainKey] = originalId;
            }
          }

          delete oldRow[idKey];

          const idx = updatedCols.indexOf(idKey);
          if (idx !== -1) updatedCols[idx] = mainKey;
        }
      }

      record._UPDATEDCOLUMNS = [...new Set(updatedCols)];
      record._OLDROWVALUE = oldRow;

      return record;
    }

    const updatedRowData = existingRecords.reduce((acc, currRecord) => {
      let { isNewRow, newRow, errors, ...record } = currRecord;

      let originalRecord = originalData.find(
        ({ isNewRow, newRow, errors, ...orig }) =>
          orig.TRAN_CD === record.TRAN_CD
      );

      originalRecord = {
        ...originalRecord,
        ALLOTED: originalRecord?.ALLOTED === true ? "Y" : "N",
      };

      record = {
        ...record,
        ALLOTED: record?.ALLOTED === true ? "Y" : "N",
      };

      let transformed = utilFunction.transformDetailsData(
        record,
        originalRecord
      );

      transformed = normalizeUpdatedRecord(
        { ...record, ...transformed },
        originalData
      );

      if (transformed?._UPDATEDCOLUMNS?.length > 0) {
        acc.push(transformed);
      }

      return acc;
    }, []);

    return {
      newRowData,
      updatedRowData,
      deletedRowData,
    };
  }

  useEffect(() => {
    if (isDialogOpen) {
      queryClient.invalidateQueries(["getLockerWaitingListDtl"]);
      refetch();
    }
  }, [isDialogOpen, refetch]);

  const updatePinnedBottomRow = () => {
    const totalGridRecords = getGridRowData(gridRef)?.length;
    const summaryRow = {
      ALLOTED: null,
      REMARKS: `Total Records : ${totalGridRecords}`,
    };
    gridRef?.current?.setGridOption("pinnedBottomRowData", [summaryRow]);
  };

  useEffect(() => {
    updatePinnedBottomRow();
  }, [renderData, updatePinnedBottomRow]);

  const agGridProps = {
    id: "locker-waiting-list",
    columnDefs: gridMetadata.columns(
      authState,
      gridRef,
      "new",
      MessageBox,
      handleDelete
    ),
    rowData: renderData,
    onCellValueChnaged: updatePinnedBottomRow,
  };

  return (
    <Fragment>
      {isError && (
        <Alert
          severity="error"
          errorMsg={(error as any)?.error_msg ?? "Something went wrong"}
          errorDetail={(error as any)?.error_detail}
          color="error"
        />
      )}

      <AgGridTableWrapper
        agGridProps={agGridProps}
        gridConfig={gridMetadata.gridConfig}
        defaultView="new"
        loading={isFetching || isLoading}
        buttons={[
          {
            label: "Save",
            onClick: handleSave,
            variant: "contained",
            color: "secondary",
          },
          {
            label: activeFlag ? "View All" : "View Pending",
            onClick: handleToggle,
            variant: "contained",
            color: "secondary",
          },
          {
            label: "Close",
            onClick: handleClose,
            variant: "contained",
            color: "secondary",
          },
        ]}
        getGridApi={gridRef}
        height={"calc(100vh - 28vh)"}
        handleAddNewRow={handleNew}
        updatePinnedBottomRow={updatePinnedBottomRow}
      />
    </Fragment>
  );
};

export const LockerWaitingListConfig = ({
  setIsDialogOpen,
  isDialogOpen,
  waitListDtlPayload,
}) => {
  return (
    <Dialog
      open={isDialogOpen}
      className="waitingList"
      fullWidth
      maxWidth="xl"
      style={{ height: "auto" }}
      PaperProps={{
        style: { width: "100%", padding: "7px" },
      }}
    >
      <LockerWaitingList
        setIsDialogOpen={setIsDialogOpen}
        isDialogOpen={isDialogOpen}
        waitListDtlPayload={waitListDtlPayload}
      />
    </Dialog>
  );
};
