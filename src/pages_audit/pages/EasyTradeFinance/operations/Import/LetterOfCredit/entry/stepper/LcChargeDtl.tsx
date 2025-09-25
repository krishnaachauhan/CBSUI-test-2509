import React, {
  forwardRef,
  Fragment,
  useContext,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { t } from "i18next";
import { AuthContext } from "pages_audit/auth";
import AgGridTableWrapper from "components/AgGridTableWrapper";
import {
  setAgGridRowData,
  validateGridAndGetData,
} from "components/agGridTable/utils/helper";
import { SecurityContext } from "../context/SecuityForm";
import { lcChargeDetailMetadata } from "./metaData/metaDataGrid";
import {
  ClearCacheContext,
  displayNumber,
  queryClient,
} from "@acuteinfo/common-base";
import { useQuery } from "react-query";
import * as API from "../api";
import { useLocation } from "react-router-dom";
const LCChargeDtl = forwardRef<any, any>(
  ({ formRef, gridData, initialVal }, ref) => {
    const gridApiRef = React.useRef<any>(null);
    const { authState } = useContext(AuthContext);
    const stepData = React.useRef<any>(initialVal);
    const { getEntries } = useContext<any>(ClearCacheContext);
    const { state: rows } = useLocation();
    const [rowData, setRowData] = useState<any[]>(initialVal || []);
    const { userState, setActiveStep, dispatchCommon } =
      useContext(SecurityContext);

    const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
      any,
      any
    >(
      ["getTFChargeCal"],
      () =>
        API.getTFChargeCal({
          A_COMP_CD: authState?.companyID,
          A_BRANCH_CD: authState?.user?.branchCode,
          A_BRANCH_BASE: authState?.user?.baseBranchCode,
          A_CUST_ID: rows?.CUSTOMER_ID,
          A_FUNC_ID: rows?.function_id,
          A_AMOUNT: gridData?.[0]?.A_AMOUNT,
          A_DOC_TRAN_CD: gridData?.[0]?.LC_TRAN_CD?.TRAN_CD,
          A_TODATE: authState?.workingDate,
          A_ROUND: "Y",
          A_SPECIAL: "G",
          A_CHARGE_CD: 0,
          A_TAX_TYPE: "S",
        }),
      {
        onSuccess: (data) => {
          setRowData((old) => ({ ...old, data }));
        },
      }
    );

    const isServiceTaxRequired = Array.isArray(data)
      ? data.some((row) => row.SERVICE_TAX === "Y")
      : false;

    const {
      data: serviceTaxData,
      isLoading: loading,
      refetch: refetchValue,
    } = useQuery<any, any>(
      ["getTFServiceTax", authState?.user?.branchCode],
      () =>
        API.getTFServiceTax({
          A_COMP_CD: authState?.companyID ?? "",
          A_BRANCH_CD: authState?.user?.branchCode ?? "",
          A_BRANCH_BASE: authState?.user?.baseBranchCode,
          A_ASON_DT: authState?.workingDate ?? "",
          A_AMOUNT: data?.[0]?.AMOUNT ?? "",
          A_CONV_AMT: 0,
          A_BRANCH_CODE: "",
          A_ACCT_TYPE: "",
          A_ACCT_CD: "",
        }),

      {
        onSuccess: (data) => {
          const formattedData = data?.map((item) => ({
            ...item,
            DISP_CHARGE_TYPE: "GST",
          }));

          setRowData((old) => ({ ...old, data }));
        },
        enabled: isServiceTaxRequired,
      }
    );

    const { data: ConfigData, refetch: refetchConfig } = useQuery<any, any>(
      ["getTFContingentac", authState?.user?.branchCode],
      () =>
        API.getTFContingentac({
          A_COMP_CD: authState?.companyID ?? "",
          A_BASE_BRANCH_CD: authState?.user?.branchCode ?? "",
          A_BRANCH_CD: authState?.user?.branchCode ?? "",
          A_DOC_TRAN_CD: gridData?.[0]?.LC_TRAN_CD?.TRAN_CD,
          A_FUNC_ID: rows?.function_id,
          A_CUST_ID: rows?.CUSTOMER_ID,
        })
    );

    const transformConfig = (ConfigData: any[]) => {
      if (!Array.isArray(ConfigData)) return [];
      return ConfigData.flatMap((row: any) => {
        const creditRow = {
          ...row,
          FLAG: "CREDIT",
          CR_BRANCH_CD: row.CR_BRANCH_CD,
          CR_ACCT_CD: row.CR_ACCT_CD,
          CR_ACCT_TYPE: row.CR_ACCT_TYPE,
        };

        const debitRow = {
          ...row,
          FLAG: "DEBIT",
          DR_BRANCH_CD: row.DR_BRANCH_CD,
          DR_ACCT_CD: row.DR_ACCT_CD,
          DR_ACCT_TYPE: row.DR_ACCT_TYPE,
          // copy DR → CR
          CR_BRANCH_CD: row.DR_BRANCH_CD,
          CR_ACCT_CD: row.DR_ACCT_CD,
          CR_ACCT_TYPE: row.DR_ACCT_TYPE,
        };

        return [creditRow, debitRow];
      });
    };

    useEffect(() => {
      if (data && Array.isArray(data)) {
        const defaultRow = {
          CHARGE_TYPE: "6",
          GST_AC: false,
          CURRENCY_CD: "INR",
          AMOUNT: 0,
        };

        const transformedConfigRows = transformConfig(ConfigData || []);

        const configRows = Array.isArray(transformedConfigRows)
          ? transformedConfigRows.map((item) => ({
              ...item,
              AMOUNT: gridData?.[0]?.A_AMOUNT ?? 0,
            }))
          : [];

        let merged = [
          defaultRow,
          ...data,
          ...(Array.isArray(serviceTaxData)
            ? serviceTaxData?.map((item) => ({
                ...item,
                DISP_CHARGE_TYPE: "GST",
              }))
            : []),
          ...configRows?.map((item) => ({
            ...item,
            DISP_CHARGE_TYPE: "Contingen",
          })),
        ];

        const finalData = merged.map((item) => ({
          ...item,
          CURRENCY_CD: "INR",
        }));

        setRowData(finalData);
      }
    }, [data, serviceTaxData, ConfigData]);

    const useGridBottom = ({ gridApi }) => {
      const updatePinnedBottomRow = () => {
        if (!gridApi?.current)
          return { totalDiffFinalAmount: 0, CreditDebitDiff: 0 };

        let totalDebitAmount = 0;
        let totalCreditAmount = 0;
        let totalChargesAmount = 0;
        let totalGSTAmount = 0;

        gridApi.current.forEachNode((node) => {
          let typeCd = node.data.CHARGE_TYPE?.value || node.data.CHARGE_TYPE;
          let disbAmt = node.data?.AMOUNT?.value || node.data?.AMOUNT;

          if (typeCd?.trim() === "C") totalChargesAmount += Number(disbAmt);
          if (typeCd?.trim() === "S") totalGSTAmount += Number(disbAmt);
          if (typeCd?.trim() === "6")
            totalDebitAmount += parseFloat(disbAmt ?? 0);
          if (typeCd?.trim() === "3")
            totalCreditAmount += parseFloat(disbAmt ?? 0);
        });

        const totalDiffFinalAmount = totalChargesAmount + totalGSTAmount;
        const totalFinalAmount = totalDebitAmount - totalCreditAmount;
        const CreditDebitDiff = totalDiffFinalAmount - totalFinalAmount;

        gridApi.current.setGridOption("pinnedBottomRowData", [
          {
            CR_ACCT_NM: `${t("Cr./Dr. Diff.")}: ${displayNumber(
              CreditDebitDiff
            )}`,
            AMOUNT: `${t("Total Charges")}: ${displayNumber(
              totalDiffFinalAmount
            )}`,
          },
        ]);

        return { totalDiffFinalAmount, CreditDebitDiff };
      };

      return { updatePinnedBottomRow };
    };

    useEffect(() => {
      return () => {
        let entries = getEntries() as any[];
        if (Array.isArray(entries) && entries.length > 0) {
          entries.forEach((one) => {
            queryClient.removeQueries();
          });
        }
        queryClient.removeQueries(["getTFChargeCal"]);
      };
    }, [getEntries]);

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
          "Transaction amount can not be greater than New disbursement amount",
        ]);
        const buttons = context?.MessageBox({
          message:
            "Transaction amount can not be greater than New disbursement amount",
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
      return;
    };

    const handleSave = () => {
      const result = validateGridAndGetData(gridApiRef);
      const isError = result?.isError ?? false;
      if (isError) return;
      stepData.current = {
        ...stepData.current,
        field: { ...result?.rowData, isError },
        isError,
      };
      setActiveStep(userState.activeStep + 1);
    };

    useImperativeHandle(ref, () => ({
      getFieldData: () => {
        const result = validateGridAndGetData(gridApiRef);
        const isError = result?.isError ?? false;

        stepData.current = {
          ...stepData.current,
          field: result?.rowData ?? [],
          isError,
        };

        return stepData.current?.field || [];
      },
      handleSubmit: (e) => handleSave(),
      isError: () => {
        const result = validateGridAndGetData(gridApiRef);
        const isError = result?.isError ?? false;
        return isError;
      },
    }));

    const { updatePinnedBottomRow } = useGridBottom({ gridApi: gridApiRef });

    useEffect(() => {
      if (rowData.length > 0 && gridApiRef.current) {
        const { totalDiffFinalAmount } = updatePinnedBottomRow();

        const updated = rowData.map((row) =>
          row.CHARGE_TYPE === "6"
            ? { ...row, AMOUNT: String(totalDiffFinalAmount) }
            : row
        );
        setRowData(updated);
      }
    }, [rowData.length, gridApiRef]);

    const handleCellValueChanged = () => {
      const { totalDiffFinalAmount }: any = updatePinnedBottomRow();

      setRowData((prev) =>
        prev.map((row) =>
          row.CHARGE_TYPE === "6"
            ? { ...row, AMOUNT: totalDiffFinalAmount }
            : row
        )
      );
    };

    const agGridProps = {
      id: `transactionGrid` + gridData,
      columnDefs: lcChargeDetailMetadata?.columns({ authState, formRef }),
      // rowData: rowData,
      onCellValueChanged: handleCellValueChanged,
    };

    useEffect(() => {
      if (rowData?.length > 0 && gridApiRef.current) {
        setAgGridRowData(gridApiRef, rowData);
      }
    }, [rowData, gridApiRef.current]);

    const handleRetrieve = async () => {
      setRowData([]);

      const { data: newData } = await refetch();
      const { data: newInitialData } = await refetchValue();
      const { data: ConfigData } = await refetchConfig();

      const defaultRow = {
        CHARGE_TYPE: "6",
        GST_AC: false,
        CURRENCY_CD: "INR",
        AMOUNT: 0,
      };

      let merged = [defaultRow];

      if (newData && Array.isArray(newData)) {
        merged = [...merged, ...newData];
      }

      if (newInitialData && Array.isArray(newInitialData)) {
        // merged = [...merged, ...newInitialData];
        merged = [
          ...merged,
          ...newInitialData?.map((item) => ({
            ...item,
            DISP_CHARGE_TYPE: "GST",
          })),
        ];
      }

      if (ConfigData && Array.isArray(ConfigData)) {
        const transformedConfigRows = transformConfig(ConfigData);

        const configRows = Array.isArray(transformedConfigRows)
          ? transformedConfigRows.map((item) => ({
              ...item,
              AMOUNT: gridData?.[0]?.A_AMOUNT ?? 0,
            }))
          : [];
        merged = [
          ...merged,
          ...configRows?.map((item) => ({
            ...item,
            DISP_CHARGE_TYPE: "Contingen",
          })),
        ];
      }
      const finalData = merged?.map((item) => ({
        ...item,
        CURRENCY_CD: "INR",
      }));

      setRowData(finalData);
    };

    const handleAddNewRow = () => {
      gridApiRef.current?.applyTransaction?.({
        add: [
          {
            GST_AC: false,
            CURRENCY_CD: "INR",
          },
        ],
      });
    };
    return (
      <Fragment>
        <AgGridTableWrapper
          agGridProps={agGridProps}
          gridConfig={lcChargeDetailMetadata?.GridMetaDataType}
          getGridApi={gridApiRef}
          autoSelectFirst={true}
          defaultView={"new"}
          newButtonLabel="Add Row"
          updatePinnedBottomRow={updatePinnedBottomRow}
          handleCustomCellKeyDown={handletransactionKeyDown}
          loading={false}
          height={"calc(100vh - 50vh)"}
          handleAddNewRow={handleAddNewRow}
          buttons={[
            {
              label: "Refresh",
              onClick: () => {
                handleRetrieve();
              },
            },
          ]}
          gridContext={{
            authState,
            AMOUNT: gridData?.[0]?.A_AMOUNT,
            gridApiRef: gridApiRef,
            data: gridData,
            rowData: rows,
          }}
        />
      </Fragment>
    );
  }
);

export default LCChargeDtl;
