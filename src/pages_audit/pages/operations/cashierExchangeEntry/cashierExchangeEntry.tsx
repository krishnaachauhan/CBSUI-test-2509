import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { cashierEntryFormMetaData } from "./cashierEntryMetadata";
import {
  usePopupContext,
  GradientButton,
  MetaDataType,
  FormWrapper,
  utilFunction,
  queryClient,
} from "@acuteinfo/common-base";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import * as API from "./api";
import { LinearProgress } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { format, parse } from "date-fns";
import CashierExchangeTable from "./tableComponent/tableComponent";
import { CashierMetaData } from "./CashierTableMetadata";
import { useLocation } from "react-router-dom";
import { Button } from "reactstrap";
import { getdocCD } from "components/utilFunction/function";
const CashierExchangeEntry = () => {
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const submitEventRef = useRef(null);
  const FormRef = useRef<any>(null);
  const TableRef = useRef<any>([]);
  const { authState } = useContext(AuthContext);
  const [tableData, setTableData] = useState([]);
  const [statess, setStatess] = useState(false);
  const [formReset, setFormReset] = useState(false);
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const getData: any = useMutation(API.getCashDeno, {
    onSuccess: (data) => {
      setTableData(data);
      setFormReset(false);
    },
    onError: (error: any, variables?: any) => {
      enqueueSnackbar(error?.error_msg, {
        variant: "error",
      });
    },
  });
  useEffect(() => {
    getData.mutate({
      BRANCH_CD: authState?.user?.branchCode,
      COMP_CD: authState?.companyID,
      TRAN_DT: authState?.workingDate,
      USER_NAME: "",
    });
  }, []);
  const handleReset = () => {
    setFormReset(true);
    setTableData([]);
    queryClient.removeQueries(["getCashDeno"]);
    getData.mutate({
      BRANCH_CD: authState?.user?.branchCode,
      COMP_CD: authState?.companyID,
      TRAN_DT: authState?.workingDate,
      USER_NAME: "",
    });
  };
  const insertCashierEntry = useMutation(API.insertCashierEntry, {
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
        CloseMessageBox();
        MessageBox({
          messageTitle: "ValidationFailed",
          message: data?.[0]?.O_MESSAGE,
          buttonNames: ["Ok"],
          icon: "ERROR",
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
  const handleSaves = async (e) => {
    submitEventRef.current = e;
    const FormRefData = await FormRef?.current?.getFieldData();
    const TableData = TableRef?.current?.saveData();
    if (FormRefData?.From_User?.length === 0) {
      await MessageBox({
        message: "PleaseenterFromCashier",
        messageTitle: "ValidationFailed",
        buttonNames: ["Ok"],
      });
      return;
    } else if (FormRefData?.To?.length === 0) {
      await MessageBox({
        message: "PleaseenterToCashier",
        messageTitle: "ValidationFailed",
        buttonNames: ["Ok"],
      });
      return;
    } else if (
      !TableData ||
      !TableData.tableData ||
      TableData.tableData.length === 0
    ) {
      await MessageBox({
        message: "PleaseenterDenomination",
        messageTitle: "ValidationFailed",
        buttonNames: ["Ok"],
      });
      return;
    }

    const TableDataMap = TableData?.tableData?.map((row) => ({
      DENO_TRAN_CD: row?.TRAN_CD,
      DENO_QTY: row?.DENO_QTY,
      DENO_AMOUNT: row?.DENO_AMOUNT,
    }));
    const Request = {
      DENO_DTL: [...TableDataMap],
      TOTAL_TO_AMT:
        TableData?.tablefooter?.total?.DENO_AMOUNT?.toString() ?? "",
      ENTERED_COMP_CD: authState?.companyID ?? "",
      ENTERED_BRANCH_CD: authState?.user?.branchCode ?? "",
      TO_USER: FormRefData?.To ?? "",
      FROM_USER: FormRefData?.From_User ?? "",
      SCREEN_REF: docCD ?? "",
    };
    const Check = await MessageBox({
      message: "SaveData",
      messageTitle: "Confirmation",
      buttonNames: ["Yes", "No"],
      icon: "CONFIRM",
      loadingBtnName: ["Yes"],
    });
    if (Check === "Yes") {
      insertCashierEntry.mutate(Request);
    }
  };
  cashierEntryFormMetaData.form.label = utilFunction.getDynamicLabel(
    currentPath,
    authState?.menulistdata,
    true
  );
  return (
    <Fragment>
      <FormWrapper
        key={"CashierExchangeEntryForm" + formReset}
        metaData={cashierEntryFormMetaData as MetaDataType}
        ref={FormRef}
        formStyle={{
          height: "auto",
        }}
        formState={{
          MessageBox: MessageBox,
        }}
        setDataOnFieldChange={async (action, payload) => {
          if (action === "FROM_USER" && payload?.value?.length > 0) {
            const formattedDate = format(
              parse(authState?.workingDate, "dd/MMM/yyyy", new Date()),
              "dd/MMM/yyyy"
            ).toUpperCase();
            getData.mutate({
              BRANCH_CD: authState?.user?.branchCode,
              COMP_CD: authState?.companyID,
              TRAN_DT: formattedDate,
              USER_NAME: payload?.value,
            });
          }
        }}
        initialValues={{}}
        onSubmitHandler={() => {}}
      >
        <GradientButton onClick={handleSaves}>Save</GradientButton>
      </FormWrapper>
      {getData?.isLoading && <LinearProgress color="secondary" />}
      {tableData?.length > 0 && (
        <CashierExchangeTable
          key={JSON.stringify(tableData)}
          data={tableData ?? []}
          metadata={CashierMetaData}
          TableLabel={"Cashier Exchange Table"}
          hideHeader={true}
          showFooter={true}
          tableState={{ MessageBox, auth: authState }}
          ref={TableRef}
          isCalculationZero={setStatess}
        />
      )}
    </Fragment>
  );
};
export default CashierExchangeEntry;
