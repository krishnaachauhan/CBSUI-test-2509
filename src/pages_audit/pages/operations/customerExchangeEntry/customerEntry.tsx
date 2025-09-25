import {
  CustomerEntryTableMetdata,
  CustomerFormMetadata,
} from "./customerEntryMetadata";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "pages_audit/auth";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import CashierExchangeTable from "../cashierExchangeEntry/tableComponent/tableComponent";
import { AppBar, LinearProgress } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import {
  Alert,
  ClearCacheContext,
  FormWrapper,
  GradientButton,
  MetaDataType,
  queryClient,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";

const CustomerEntry = () => {
  const { authState } = useContext(AuthContext);
  const TableRef = useRef<any>([]);
  const submitEventRef = useRef(null);
  const FormRef = useRef<any>(null);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [footerTotals, setFooterTotals] = useState<any>({});
  const { getEntries } = useContext(ClearCacheContext);
  const [calculationdata, setCalculationData] = useState(false);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  let currentPath = useLocation().pathname;
  const [disableButton, setDisableButton] = useState(false);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const [formReset, setFormReset] = useState(false);
  const [tableData, setTableData] = useState([]);
  const getData: any = useMutation(API.getCashDeno, {
    onSuccess: (data) => {
      setTableData(data);
      setFormReset(false);
    },
    onError: (error: any, variables?: any) => {},
  });
  useEffect(() => {
    getData.mutate({
      BRANCH_CD: authState?.user?.branchCode ?? "",
      COMP_CD: authState?.companyID ?? "",
      TRAN_DT: authState?.workingDate ?? "",
      USER_NAME: authState?.user?.id ?? "",
    });
  }, []);
  const insertCashierEntry = useMutation(API.customerInsert, {
    onError: async (error: any) => {
      let errorMsg = "Unknown Error occurred";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      if (data?.[0]?.O_STATUS === "999") {
        MessageBox({
          messageTitle: "ValidationFailed",
          message: data?.[0]?.O_MESSAGE,
          icon: "ERROR",
          buttonNames: ["Ok"],
        });
      } else {
        handleReset();
        CloseMessageBox();
        enqueueSnackbar(data?.[0]?.O_MESSAGE, {
          variant: "success",
        });
      }
    },
  });
  const handleReset = () => {
    setFormReset(true);
    setTableData([]);
    queryClient.removeQueries(["getCashDeno"]);
    getData.mutate({
      BRANCH_CD: authState?.user?.branchCode ?? "",
      COMP_CD: authState?.companyID ?? "",
      TRAN_DT: authState?.workingDate ?? "",
      USER_NAME: authState?.user?.id ?? "",
    });
  };
  const handleSaves = async (e) => {
    submitEventRef.current = e;
    const FormRefData = await FormRef?.current?.getFieldData();
    const TableData = TableRef?.current?.saveData();
    if (
      !TableData ||
      !TableData?.tableData ||
      TableData?.tableData?.length === 0
    ) {
      await MessageBox({
        message: "PleaseenterdatatheCustomerExchangeTablebeforesaving",
        messageTitle: "DataRequired",
        buttonNames: ["Ok"],
        icon: "ERROR",
      });
      return;
    }
    const TableDataMap = TableData?.tableData?.map((row) => ({
      DENO_TRAN_CD: row?.TRAN_CD ?? "",
      DENO_QTY: row?.DENO_QTY ?? "",
      DENO_VAL: row?.DENO_VAL ?? "",
    }));
    const Request = {
      ENTERED_COMP_CD: authState?.companyID ?? "",
      ENTERED_BRANCH_CD: authState?.user?.branchCode ?? "",
      REMARKS: FormRefData?.REMARKS ?? "",
      DENO_DTL: [...TableDataMap],
      SCREEN_REF: docCD ?? "",
    };
    const Check = await MessageBox({
      message: "SaveData",
      messageTitle: "Confirmation",
      buttonNames: ["Yes", "No"],
      loadingBtnName: ["Yes"],
    });
    if (Check === "Yes") {
      insertCashierEntry.mutate(Request);
    }
  };
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getCashDeno"]);
    };
  }, []);
  const MetaData = CustomerFormMetadata;
  MetaData.form.label = utilFunction.getDynamicLabel(
    currentPath,
    authState?.menulistdata,
    true
  );
  const handleButtonDisable = (disable) => {
    setDisableButton(disable);
  };
  return (
    <Fragment>
      {getData?.isError ? (
        <div style={{ paddingRight: "10px", paddingLeft: "10px" }}>
          <AppBar position="relative" color="primary">
            <Alert
              severity="error"
              errorMsg={getData?.error?.error_msg ?? "Unknow Error"}
              errorDetail={getData?.error?.error_detail ?? ""}
              color="error"
            />
          </AppBar>
        </div>
      ) : null}
      <FormWrapper
        key={"CustomerEntryForm" + formReset}
        metaData={CustomerFormMetadata as MetaDataType}
        ref={FormRef}
        formStyle={{
          height: "auto",
        }}
        formState={{
          handleButtonDisable: handleButtonDisable,
          MessageBox: MessageBox,
          docCD: docCD,
          acctDtlReqPara: {
            ACCT_CD: {
              ACCT_TYPE: "ACCT_TYPE",
              BRANCH_CD: "BRANCH_CD",
              SCREEN_REF: docCD ?? "",
            },
          },
        }}
        initialValues={{ A_COMP_CD: authState?.companyID }}
        onSubmitHandler={() => {}}
      >
        <GradientButton onClick={handleSaves} disabled={disableButton}>
          Save
        </GradientButton>
      </FormWrapper>
      {getData?.isLoading && <LinearProgress color="secondary" />}
      {tableData?.length > 0 && (
        <CashierExchangeTable
          key={JSON.stringify(tableData)}
          data={tableData ?? []}
          metadata={CustomerEntryTableMetdata}
          TableLabel={"Customer Exchange Table"}
          hideHeader={true}
          ignoreMinusValue={false}
          showFooter={true}
          ref={TableRef}
          tableState={{
            MessageBox,
            FormRef,
            authState,
            docCD,
            insertCashierEntry,
          }}
          isCalculationZero={setCalculationData}
        />
      )}
    </Fragment>
  );
};
export default CustomerEntry;
