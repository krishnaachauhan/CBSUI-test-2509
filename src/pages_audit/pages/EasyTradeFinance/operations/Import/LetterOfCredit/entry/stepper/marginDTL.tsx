import React, {
  forwardRef,
  Fragment,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { t } from "i18next";
import { AuthContext } from "pages_audit/auth";
import { marginDtlMetadata } from "./metaData/metaDataGrid";
import AgGridTableWrapper from "components/AgGridTableWrapper";
import { getGridRowData } from "components/agGridTable/utils/helper";
import { SecurityContext } from "../context/SecuityForm";
import { useQuery } from "react-query";
import { ETFGeneralAPI } from "pages_audit/pages/EasyTradeFinance/generalAPI/general";
import { queryClient, usePopupContext } from "@acuteinfo/common-base";
import { grid } from "@mui/system";
import { displayNumber } from "@acuteinfo/common-base";
import { isNumber } from "lodash";

const LCMarginDetail = forwardRef<any, any>(
  ({ formRef, gridData, initialVal, sharing }, ref) => {
    const gridApiRef = React.useRef<any>(null);
    const { authState } = useContext(AuthContext);
    const stepData = React.useRef<any>(initialVal);
    const { userState, setActiveStep, dispatchCommon, setFlag, tabRefs } =
      useContext(SecurityContext);
    const { MessageBox, CloseMessageBox } = usePopupContext();

    const { data: acctData, isLoading } = useQuery<any, any>(
      ["getCustACCTList"],
      async () =>
        await ETFGeneralAPI.getCustACCTList({
          COMP_CD: authState?.companyID ?? "",
          CUST_ID: sharing?.CUSTOMER_ID ?? "",
          PARENT_TYPE: "IMAR",
        })
    );

    const acctDataList = Array.isArray(acctData)
      ? acctData.map((item) => ({
          FD_BRANCH_CD: item.BRANCH_CD?.trim(),
          FD_ACCT_TYPE: item.ACCT_TYPE?.trim(),
          FD_ACCT_CD: item.ACCT_CD?.trim(),
          ACCT_NM: item.ACCT_NM?.trim(),
          MARGIN_AMOUNT: gridData?.[0]?.MARGIN_AMOUNT ?? 0,
          MARGIN_TYPE: "L",
        }))
      : [];
    useEffect(() => {
      return () => {
        queryClient.removeQueries(["getCustACCTList"]);
      };
    }, []);

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
        colDef.field === "MARGIN_AMOUNT" &&
        gridData1?.MARGIN_AMOUNT //&&value > gridData1?.MARGIN_AMOUNT
      ) {
        const totalMarginAmount = getGridRowData(gridApiRef).reduce(
          (acc, row) => acc + parseFloat(row.MARGIN_AMOUNT || 0),
          0
        );

        if (
          Number(totalMarginAmount).toFixed(2) >
          Number(gridData1?.MARGIN_AMOUNT).toFixed(2)
        ) {
          node.setDataValue("errors", [
            ...(node.data.errors || []),
            "Margin Amount Should be less than or Equal to " +
              gridData1?.MARGIN_AMOUNT,
          ]);

          const buttons = context?.MessageBox({
            message:
              "Margin Amount Should be less than or Equal to " +
              gridData1?.MARGIN_AMOUNT,
            messageTitle: t("ValidationFailed"),
            icon: "ERROR",
          });
          node.setDataValue("MARGIN_AMOUNT", "");
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
      }
      // updatePinnedBottomRow();
      return;
    };

    const handleValidation = async () => {
      const gridData1: any = gridData?.[0];
      if (
        gridData1?.MARGIN_AMOUNT //&&value > gridData1?.MARGIN_AMOUNT
      ) {
        const totalMarginAmount = getGridRowData(gridApiRef).reduce(
          (acc, row) => acc + parseFloat(row.MARGIN_AMOUNT || 0.0),
          0.0
        );

        if (
          Number(totalMarginAmount).toFixed(2) !==
          Number(gridData1?.MARGIN_AMOUNT).toFixed(2)
        ) {
          // await MessageBox({
          // messageTitle: "ValidationFailed",
          // message: `Total amount equal to Margin Amount ${gridData1?.MARGIN_AMOUNT}`,
          // buttonNames: ["Ok"],
          // icon: "ERROR",
          // });
          tabRefs.current = false;
          return;
        }
      }
      tabRefs.current = true;
    };

    const handleSave = async () => {
      const gridData = getGridRowData(gridApiRef);
      stepData.current = { ...stepData.current, field: gridData };
      handleValidation();
    };

    useImperativeHandle(ref, () => ({
      getFieldData: () => {
        return stepData.current?.field || [];
      },
      handleSubmit: (e) => handleSave(),
    }));
    const { updatePinnedBottomRow } = useGridBottom({
      gridApi: gridApiRef,
    });

    const agGridProps = {
      id: `transactionGrid` + acctDataList,
      columnDefs: marginDtlMetadata.columns({ authState, formRef }),
      rowData:
        gridData?.[0]?.MARGIN_AMOUNT === "0" ? [] : initialVal ?? acctDataList,
      onCellValueChanged: updatePinnedBottomRow,
    };

    return (
      <Fragment>
        <AgGridTableWrapper
          agGridProps={agGridProps}
          gridConfig={marginDtlMetadata.GridMetaDataType}
          getGridApi={gridApiRef}
          autoSelectFirst={true}
          defaultView={"new"}
          newButtonLabel="Add Row"
          updatePinnedBottomRow={updatePinnedBottomRow}
          handleCustomCellKeyDown={handletransactionKeyDown}
          loading={false}
          height={"calc(100vh - 75vh)"}
        />
      </Fragment>
    );
  }
);

export default LCMarginDetail;

export const handleBlurChargeAmount = async (
  value,
  node,
  api,
  field,
  onValueChange,
  formState,
  authState
) => {
  try {
    const res = await formState?.current?.getFieldData();
    node.setData({
      ...node.data,
      TAX_AMOUNT: res.TAX_AMOUNT,
    });
    api.refreshCells({ rowNodes: [node], columns: ["TAX_AMOUNT"] });
  } catch (error) {
    console.error("Error fetching TAX_AMOUNT:", error);
  }
};

const useGridBottom = ({ gridApi }) => {
  //* Function to update pinned row dynamically
  const updatePinnedBottomRow = () => {
    if (!gridApi) return;

    let totalMarginAmount = 0;

    gridApi.current.forEachNode((node) => {
      totalMarginAmount += parseFloat(node.data?.MARGIN_AMOUNT ?? 0);
    });

    gridApi.current.setGridOption("pinnedBottomRowData", [
      {
        TEMP_DISP: "Total",
        MARGIN_AMOUNT: displayNumber(totalMarginAmount),
      },
    ]);
  };

  // useEffect(() => {
  //   if (gridApi) {
  //     updatePinnedBottomRow();
  //   }
  // }, [gridApi]);

  return {
    updatePinnedBottomRow,
  };
};
