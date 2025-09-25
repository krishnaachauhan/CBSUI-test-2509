import {
  ActionTypes,
  Alert,
  LoaderPaperComponent,
  queryClient,
  SubmitFnType,
  utilFunction,
} from "@acuteinfo/common-base";
import { useMutation, useQuery } from "react-query";
import * as API from "../api";
import { t } from "i18next";
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AuthContext } from "pages_audit/auth";
import { FormWrapper, MetaDataType } from "@acuteinfo/common-base";
import { GridWrapper } from "@acuteinfo/common-base";
import { GridMetaDataType } from "@acuteinfo/common-base";
import { format } from "date-fns";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { usePopupContext } from "@acuteinfo/common-base";
import { retrieveForm, RetrieveGrid } from "./retrieveFormMetadata";
import FdPrintDynamicNew from "../fdPrintDynamicNew";
import { Box } from "@mui/material";

const actionSequence = [
  { name: "view-new", label: "View Only New", filter: "ONLY_NEW" },
  { name: "view-only-renew", label: "View only Renew", filter: "ONLY_RENEW" },
  {
    name: "view-manual-renew",
    label: "View Manual Renew",
    filter: "MANUAL_RENEW",
  },
  { name: "view-auto-renew", label: "View Auto Renew", filter: "AUTO_RENEW" },
  { name: "view-all", label: "View All" },
  { name: "view-pending", label: "View Pending", filter: "PENDING" },
];

const actions: ActionTypes[] = [
  {
    actionName: "print",
    actionLabel: "Print",
    multiple: true,
    rowDoubleClick: true,
    alwaysAvailable: false,
  },
  {
    actionName: actionSequence[0].name,
    actionLabel: actionSequence[0].label,
    multiple: false,
    rowDoubleClick: undefined,
    alwaysAvailable: true,
  },
];

const FdPrintingRetrieve = () => {
  const { authState } = useContext(AuthContext);
  const [gridData, setGridData] = useState<any>([]);
  const formRef = useRef<any>(null);
  const dataRef = useRef<any>([]);
  const paraRef = useRef<any>({});
  const [selectedRowsData, setSelectedRowsData] = useState([]);
  const [printingData, setPrintingData] = useState([]);
  const [dilogueOpen, setDilogueOpen] = useState(false);
  const [componentToShow, setComponentToShow] = useState("");
  const { MessageBox } = usePopupContext();
  const navigate = useNavigate();
  let currentPath = useLocation().pathname;
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(
    ["getDDprintPara"],
    () =>
      API.getDDprintPara({
        comp_cd: authState?.companyID ?? "",
        branch_cd: authState?.user?.branchCode ?? "",
        user_level: authState?.role ?? "",
      }),
    {
      onSuccess: (data) => {
        paraRef.current = data?.[0];
      },
    }
  );
  const mutation = useMutation(
    "getPaySlipRetrieveData",
    API.retrieveFdPrintData,
    {
      onSuccess: (data, { endSubmit }) => {
        if (data?.length <= 0) {
          endSubmit(
            false,
            MessageBox({
              message: "No Transaction Found!",
              messageTitle: "Validation",
              buttonNames: ["Ok"],
            })
          );
        } else {
          dataRef.current = data;
          setGridData(data.filter((item) => item.PENDING === "Y"));
        }
      },
      onError: (error: any, { endSubmit }) => {
        endSubmit(
          false,
          error?.error_msg ?? t("UnknownErrorOccured"),
          error?.error_detail ?? ""
        );
      },
    }
  );
  const printingDTL = useMutation(
    "getPaySlipRetrieveData",
    API.getFDPrintConfigDTL,
    {
      onSuccess: (data) => {
        setPrintingData(data);
      },
      onError: (error: any, { endSubmit }) => {
        endSubmit(
          false,
          error?.error_msg ?? t("UnknownErrorOccured"),
          error?.error_detail ?? ""
        );
      },
    }
  );

  const updateActions = (currentAction) => {
    const actionIndex = actionSequence.findIndex(
      (a) => a.name === currentAction.name
    );
    const nextAction =
      actionSequence[(actionIndex + 1) % actionSequence.length];
    actions[1] = {
      actionName: nextAction.name,
      actionLabel: nextAction.label,
      multiple: false,
      rowDoubleClick: false,
      alwaysAvailable: true,
    };
    if (nextAction.filter) {
      setGridData(
        dataRef.current.filter((item) => item[nextAction.filter] === "Y")
      );
    } else {
      setGridData(dataRef.current);
    }
  };
  const setCurrentAction = useCallback(async (data) => {
    if (data.name === "print") {
      setComponentToShow("ViewDetail");
      setDilogueOpen(true);
      setSelectedRowsData(data.rows);
      const FormRefData = await formRef?.current?.getFieldData();
      const MapSelectedRecord = data.rows.map((row) => {
        return {
          BRANCH_CD: row?.data.BRANCH_CD ?? "",
          ACCT_TYPE: row?.data.ACCT_TYPE ?? "",
          ACCT_CD: row?.data.ACCT_CD ?? "",
          FD_NO: row?.data.FD_NO ?? "",
        };
      });
      printingDTL.mutate({
        A_ENT_COMP_CD: authState?.companyID ?? "",
        A_ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
        A_PRINT_DTL_CLOB: [...MapSelectedRecord],
        A_FROM_DT: format(new Date(FormRefData?.FROM), "dd/MMM/yyyy") ?? "",
        A_TO_DT: format(new Date(FormRefData?.TO), "dd/MMM/yyyy") ?? "",
        A_DOC_TEMPLATE_CD: FormRefData?.PRINT_TEMPLATE ?? "",
      });
    } else {
      updateActions(data);
    }
  }, []);

  const onSubmitHandler: SubmitFnType = (data: any, displayData, endSubmit) => {
    let apiReq = {
      COMP_CD: authState?.companyID,
      BRANCH_CD: authState?.user?.branchCode,
      FROM_DT: data?.FROM ? format(new Date(data?.FROM), "dd-MMM-yyyy") : "",
      TO_DT: data?.TO ? format(new Date(data?.TO), "dd-MMM-yyyy") : "",
    };
    mutation.mutate({
      ...apiReq,
      endSubmit,
    });
    endSubmit(true);
  };
  const resetAction = () => {
    actions[1] = {
      actionName: actionSequence[0].name,
      actionLabel: actionSequence[0].label,
      multiple: false,
      rowDoubleClick: false,
      alwaysAvailable: true,
    };
    setGridData(dataRef.current.filter((item) => item.PENDING === "Y"));
  };
  retrieveForm.form.label =
    utilFunction?.getDynamicLabel(currentPath, authState?.menulistdata, true) +
    " ";
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getDDprintPara"]);
    };
  }, []);
  const ParameterSet =
    paraRef?.current?.FD_ALLOW_DUPLICATE === "0"
      ? "1"
      : paraRef?.current?.FD_ALLOW_DUPLICATE;
  return (
    <Fragment>
      {(isError || mutation?.isError) && (
        <Alert
          severity="error"
          errorMsg={
            error?.error_msg ?? mutation?.error?.error_msg ?? "Unknow Error"
          }
          errorDetail={
            error?.error_detail ?? mutation?.error?.error_detail ?? ""
          }
          color="error"
        />
      )}
      {isLoading ? (
        <LoaderPaperComponent />
      ) : (
        <FormWrapper
          key="retrieve-Form"
          metaData={retrieveForm as MetaDataType}
          initialValues={{
            PRINT_TEMPLATE: ParameterSet,
          }}
          onSubmitHandler={onSubmitHandler}
          formStyle={{ background: "white" }}
          hideHeader={true}
          formState={paraRef}
          onFormButtonClickHandel={() => {
            let event: any = { preventDefault: () => {} };
            formRef?.current?.handleSubmit(event, "BUTTON_CLICK");
            resetAction();
          }}
          ref={formRef}
        />
      )}
      <Box
        style={{
          padding: "0 10px 0px 10px",
        }}
      >
        <GridWrapper
          key={"retrieve-grid-" + actions[1].actionLabel}
          finalMetaData={RetrieveGrid as GridMetaDataType}
          data={gridData ?? []}
          setData={() => null}
          loading={mutation.isLoading || printingDTL.isLoading}
          actions={actions}
          setAction={setCurrentAction}
        />
        {componentToShow === "ViewDetail" && Boolean(dilogueOpen) ? (
          <FdPrintDynamicNew
            handleClose={() => setDilogueOpen(false)}
            PrintingData={printingData}
            OpenDialog={printingDTL?.isLoading}
          />
        ) : null}
      </Box>
    </Fragment>
  );
};

export default FdPrintingRetrieve;
