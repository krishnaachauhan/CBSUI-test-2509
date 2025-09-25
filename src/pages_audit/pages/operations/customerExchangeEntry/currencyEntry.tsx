import {
  Alert,
  FormWrapper,
  GradientButton,
  MetaDataType,
  queryClient,
  usePopupContext,
} from "@acuteinfo/common-base";
import { AppBar, LinearProgress } from "@mui/material";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import CashierExchangeTable from "../cashierExchangeEntry/tableComponent/tableComponent";
import {
  CurrencyFormMetadata,
  CurrencyTableMetadata,
} from "./customerEntryMetadata";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import { AuthContext } from "pages_audit/auth";
import { enqueueSnackbar } from "notistack";
const CurrencyExchangeEntry = () => {
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const [formReset, setFormReset] = useState(false);
  const [tableData, setTableData] = useState([]);
  const TableRef = useRef<any>([]);
  const submitEventRef = useRef(null);
  const FormRef = useRef<any>(null);
  const [disableButton, setDisableButton] = useState(false);
  const [calculationdata, setCalculationData] = useState(false);
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
  const handleSaves = async () => {
    // submitEventRef.current = e;
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
    } else {
      const formRefValues = {
        REF_DOC_NO: FormRefData?.REF_DOC_NO ?? "",
        REF_DOC_TYPE: FormRefData?.REF_DOC_TYPE ?? "",
        TENDERER: FormRefData?.TENDERER ?? "",
        BRANCH_CD: FormRefData?.BRANCH_CD ?? "",
        ACCT_TYPE: FormRefData?.ACCT_TYPE ?? "",
        ACCT_CD: FormRefData?.ACCT_CD ?? "",
      };
      const TableDataMap = TableData?.tableData?.map((row) => ({
        ...formRefValues,
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
    }
  };
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getCashDeno"]);
    };
  }, []);
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
        key={"CurrencyEntryForm" + formReset}
        metaData={CurrencyFormMetadata as MetaDataType}
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
          metadata={CurrencyTableMetadata}
          TableLabel={"Currency Exchange Table"}
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
export default CurrencyExchangeEntry;
