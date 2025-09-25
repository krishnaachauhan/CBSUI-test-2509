import { retrievePayslip } from "./retrieveMetadata";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import { t } from "i18next";
import { useCallback, useContext, useRef, useState } from "react";
import { AuthContext } from "pages_audit/auth";
import { RetrieveGridMetadata } from "./retrieveGridMetadata";
import { format } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import PlaySlipDraftPrintingNew from "./ddPrinting/payslipDraftPrinting";
import i18n from "components/multiLanguage/languagesConfiguration";
import {
  usePopupContext,
  GridWrapper,
  FormWrapper,
  MetaDataType,
  ActionTypes,
  SubmitFnType,
  GridMetaDataType,
  utilFunction,
} from "@acuteinfo/common-base";
const actions: ActionTypes[] = [
  {
    actionName: "print",
    actionLabel: "OK",
    multiple: true,
    rowDoubleClick: true,
    alwaysAvailable: false,
  },
  {
    actionName: "view-all",
    actionLabel: "View All",
    multiple: false,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];
const PlaySlipRetrieve = () => {
  const { authState } = useContext(AuthContext);
  const [gridData, setGridData] = useState<any>([]);
  const viewAllRef = useRef<any>([]);
  const formRef = useRef<any>(null);
  const [selectedRowsData, setSelectedRowsData] = useState([]);
  const navigate = useNavigate();
  const paraRef = useRef<any>([]);
  const [dilogueOpen, setDilogueOpen] = useState(false);
  const [componentToShow, setComponentToShow] = useState("");
  const { MessageBox } = usePopupContext();
  const [printingData, setPrintingData] = useState([]);
  let currentPath = useLocation().pathname;
  const updateFnWrapper =
    (update) =>
    async ({ data }) => {
      return update({
        ...data,
      });
    };
  const {
    data: para,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<any, any>(
    ["getDDPrintPara"],
    () =>
      API.getDDPrintPara({
        comp_cd: authState?.companyID,
        branch_cd: authState?.user?.branchCode,
        user_level: authState?.role,
      }),
    {
      onSuccess: (data) => {
        paraRef.current = data;
      },
    }
  );
  const mutation: any = useMutation(
    "getPaySlipRetrieveData",
    updateFnWrapper(API.retrieveData),
    {
      onSuccess: (data, { endSubmit }: any) => {
        if (data?.length <= 0) {
          endSubmit(
            false,
            MessageBox({
              message: "No Transaction Found!",
              messageTitle: "Validation",
              buttonNames: ["Ok"],
            })
          );
          setGridData([]);
        } else if (Array.isArray(data) && data?.length > 0) {
          const filteredData = data.filter((item) => !item.PRINT_CNT);
          setGridData(filteredData);
          viewAllRef.current = data;
        }
      },
      onError: (error: any, { endSubmit }: any) => {
        let errorMsg = t("UnknownErrorOccured");
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
        endSubmit(false, errorMsg, error?.error_detail ?? "");
      },
    }
  );
  const printingDTL = useMutation(
    "getPayslipPrintConfigDTL",
    API.getPayslipPrintConfigDTL,
    {
      onSuccess: (data: any) => {
        setPrintingData(data);
      },
      onError: (error: any, { endSubmit }: any) => {
        endSubmit(
          false,
          error?.error_msg ?? t("UnknownErrorOccured"),
          error?.error_detail ?? ""
        );
      },
    }
  );
  const setCurrentAction = useCallback(
    async (data) => {
      if (data.name === "print") {
        setComponentToShow("ViewDetail");
        setDilogueOpen(true);
        setSelectedRowsData(data?.rows);
        // rowsDataRef.current = data?.rows?.[0]?.data;
        const FormRefData = await formRef?.current?.getFieldData();
        // const MapSelectedRecord = data.rows.map((row) => {
        //   return {
        //     // A_ENT_COMP_CD: row?.data?.COMP_CD,
        //     // format(new Date(FormRefData?.FROM), "dd/MMM/yyyy"),
        //     // A_ENT_BRANCH_CD: row?.data.BRANCH_CD,
        //     // A_COMM_TYPE_CD: row?.data.COMM_TYPE_CD,
        //     // A_PRINT_DTL_CLOB: row?.data.ACCT_CD,
        //     TRAN_DT: format(new Date(row?.data?.TRAN_DT))
        //   };
        // });
        const MapSelectedRecord = data.rows.map((row) => {
          const transactionDate = row?.data?.TRAN_DT;
          return {
            TRAN_DT: transactionDate
              ? format(new Date(transactionDate), "dd/MMM/yyyy")
              : null,
            TRAN_CD: row?.data?.TRAN_CD,
            SR_CD: row?.data?.SR_CD,
          };
        });
        const CommTypeCD = data.rows.map((row) => {
          return {
            A_COMM_TYPE_CD: row?.data?.COMM_TYPE_CD,
          };
        });
        printingDTL.mutate({
          A_ENT_COMP_CD: authState?.companyID ?? "",
          A_ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
          A_COMM_TYPE_CD: CommTypeCD?.[0].A_COMM_TYPE_CD,
          A_PRINT_DTL_CLOB: [...MapSelectedRecord],
        });
      } else if (data.name === "view-all") {
        setGridData(viewAllRef.current);
      } else {
        navigate(data?.name, {
          state: data?.rows,
        });
      }
    },
    [navigate]
  );
  const onSubmitHandler: SubmitFnType = (data: any, displayData, endSubmit) => {
    let apiReq = {
      COMP_CD: authState?.companyID,
      BRANCH_CD: authState?.user?.branchCode,
      DEF_TRAN_CD: data?.TYPE,
      FROM_DT: data?.FROM ? format(new Date(data?.FROM), "dd-MMM-yyyy") : "",
      TO_DT: data?.TO ? format(new Date(data?.TO), "dd-MMM-yyyy") : "",
      USER_LEVEL: authState?.role,
      ALLOW_DUPLICATE: paraRef?.current?.[0]?.ALLOW_DUPLICATE ?? "",
      A_LANG: i18n.resolvedLanguage,
    };
    mutation.mutate({
      data: apiReq,
      endSubmit,
    });
    endSubmit(true);
  };
  const handleClose = () => {
    setDilogueOpen(false);
  };
  retrievePayslip.form.label = utilFunction.getDynamicLabel(
    currentPath,
    authState?.menulistdata,
    true
  );
  return (
    <>
      <FormWrapper
        key={`retrieve-Form`}
        metaData={retrievePayslip as MetaDataType}
        initialValues={[]}
        onSubmitHandler={onSubmitHandler}
        formStyle={{
          background: "white",
        }}
        formState={{ para: para }}
        onFormButtonClickHandel={() => {
          let event: any = { preventDefault: () => {} };
          formRef?.current?.handleSubmit(event, "BUTTON_CLICK");
        }}
        ref={formRef}
      >
        {({ isSubmitting, handleSubmit }) => <></>}
      </FormWrapper>
      <GridWrapper
        key={`retrieve-grid`}
        finalMetaData={RetrieveGridMetadata as GridMetaDataType}
        data={gridData ?? []}
        setData={() => null}
        loading={mutation.isLoading}
        actions={actions}
        setAction={setCurrentAction}
        headerToolbarStyle={{
          fontSize: "1.20rem",
        }}
      />
      {componentToShow === "ViewDetail" && Boolean(dilogueOpen) ? (
        <PlaySlipDraftPrintingNew
          handleClose={handleClose}
          PrintingData={printingData}
          OpenDialog={printingDTL?.isLoading}
        />
      ) : null}
    </>
  );
};
export default PlaySlipRetrieve;
