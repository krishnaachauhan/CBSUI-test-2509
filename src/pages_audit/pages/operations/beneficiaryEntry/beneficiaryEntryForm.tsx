import {
  ActionTypes,
  Alert,
  ClearCacheProvider,
  extractMetaData,
  FormWrapper,
  GradientButton,
  GridMetaDataType,
  GridWrapper,
  LoaderPaperComponent,
  MetaDataType,
  SubmitFnType,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { CircularProgress, Dialog } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import {
  accountFindmetaData,
  AuditBenfiDetailFormMetadata,
} from "./gridMetaData";
import {
  Fragment,
  useEffect,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { AddNewBenfiDetailGridMetadata } from "./gridMetaData";
import * as API from "./api";
import { useMutation, useQuery } from "react-query";
import { enqueueSnackbar } from "notistack";
import { t } from "i18next";
import { useLocation } from "react-router-dom";
import { IfscAllListSearch } from "../rtgsEntry/ifscCodeAllListSearch";
import { getdocCD } from "components/utilFunction/function";
import BeneficiaryEntryFormModal from "./beneficiaryEntryFormModal";

const actions: ActionTypes[] = [
  {
    actionName: "add",
    actionLabel: t("Add"),
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "view-detail",
    actionLabel: t("ViewDetails"),
    multiple: undefined,
    rowDoubleClick: true,
  },
];

export const BeneficiaryEnrtyForm = () => {
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const [isBenGridData, setIsBenGridData] = useState<any>([]);
  const { t } = useTranslation();
  const [gridData, setGridData] = useState<any>({});
  const [isAddOpen, setisAddOpen] = useState<any>(false);
  const controllerRef = useRef<AbortController>();
  const previousRowData = useRef<any>(null);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const [formMode, setFormMode] = useState<any>("new");
  const isErrorFuncRef = useRef<any>(null);
  const gridDataRef = useRef<any>({});

  let currentPath = useLocation().pathname;
  const [retrieveData, setRetrieveData] = useState<any>({});
  const [retrieveDataRefresh, setRetrieveDataRefresh] = useState<any>(0);
  const [ifscAllList, setIfscAllList] = useState<any>(false);

  const { data, isLoading, isFetching, refetch, error, isError, status } =
    useQuery<any, any>(
      ["getBenficiaryDtlData"],
      () =>
        API.getBenficiaryDtlData({
          BRANCH_CD: gridDataRef.current?.BRANCH_CD,
          ACCT_CD: gridDataRef.current?.ACCT_CD,
          ACCT_TYPE: gridDataRef.current?.ACCT_TYPE,
          FLAG: "D",
          COMP_CD: authState?.companyID,
          WORKING_DATE: authState?.workingDate,
        }),
      {
        enabled: false, // The query only runs when isOpenRetrieve is true
      }
    );
  useEffect(() => {
    if (Array.isArray(data)) {
      setIsBenGridData(data);
    } else {
      setIsBenGridData([]);
    }
  }, [data]);

  const getIfscBenAcDetail: any = useMutation(API.getIfscBenDetail, {
    onError: (error: any) => {
      let errorMsg = "Unknown Error occured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
    },

    onSuccess: (data) => {
      if (data?.[0]?.O_STATUS === "999") {
        MessageBox({
          messageTitle: "Alert",
          message: data?.[0]?.O_MESSAGE,
          icon: "WARNING",
        });
      }
    },
  });
  const getAuditDml: any = useMutation(API.getAuditDml, {
    onError: (error: any) => {
      let errorMsg = "Unknown Error occured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      CloseMessageBox();
    },

    onSuccess: (data) => {
      setisAddOpen(false);
      refetch();
      enqueueSnackbar(data, {
        variant: "success",
      });
      CloseMessageBox();
    },
  });

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    // @ts-ignore
    endSubmit(true);
    if (formMode === "new") {
      delete data["ACTIVE_FLAG"];
      delete data["INACTIVE"];
    } else {
      data["ACTIVE_FLAG"] = Boolean(data["ACTIVE_FLAG"]) ? "Y" : "N";
    }
    isErrorFuncRef.current = {
      data: {
        _isNewRow: formMode === "new" ? true : false,
        COMP_CD: formMode === "new" ? authState?.companyID : gridData?.COMP_CD,
        BRANCH_CD:
          formMode === "new"
            ? gridDataRef.current?.BRANCH_CD
            : gridData?.BRANCH_CD,
        TRAN_CD: formMode === "new " ? "" : gridData?.TRAN_CD,
        ACCT_TYPE:
          formMode === "new"
            ? gridDataRef.current?.ACCT_TYPE ?? ""
            : gridData?.ACCT_TYPE,
        ACCT_CD:
          formMode === "new"
            ? gridDataRef.current?.ACCT_CD ?? ""
            : gridData?.ACCT_CD,
        ...data,
        FLAG: Boolean(data["FLAG"]) ? "Y" : "N",
      },
      displayData,
      endSubmit,
      setFieldError,
    };
    const buttonName = await MessageBox({
      messageTitle: t("Confirmation"),
      message:
        formMode === "new"
          ? t("AreYouSaveThisRecord")
          : t("AreYouSureInactiveThisRecord"),
      buttonNames: ["Yes", "No"],
      loadingBtnName: ["Yes"],
      icon: "CONFIRM",
    });
    if (buttonName === "Yes") {
      getAuditDml.mutate(isErrorFuncRef?.current?.data);
    }
  };

  const setCurrentAction = useCallback((data) => {
    if (
      data?.name === "add" &&
      Object.entries(gridDataRef.current).length > 0
    ) {
      setisAddOpen(true);
      setFormMode("new");
    } else if (data?.name === "view-detail") {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      controllerRef.current = new AbortController();
      let rowsData = data?.rows?.[0]?.data;
      setGridData(rowsData);
      if (
        Boolean(rowsData) &&
        JSON.stringify(rowsData) !== JSON.stringify(previousRowData?.current)
      ) {
        previousRowData.current = rowsData;
        getIfscBenAcDetail.mutate({
          IFSC_CODE: rowsData?.TO_IFSCCODE ?? "",
          ENTRY_TYPE: "",
          USERNAME: authState?.user?.id ?? "",
          USERROLE: authState?.role ?? "",
        });
      }
      setFormMode("edit");
      setisAddOpen(true);
    }
  }, []);

  accountFindmetaData.form.label = utilFunction.getDynamicLabel(
    currentPath,
    authState?.menulistdata,
    true
  );

  return (
    <>
      <FormWrapper
        key={"recAccountFindmetaData"}
        metaData={accountFindmetaData as MetaDataType}
        formStyle={{
          height: "100px",
        }}
        controlsAtBottom={true}
        onSubmitHandler={() => {}}
        formState={{
          MessageBox: MessageBox,
          setIsBenGridData: setIsBenGridData,
          acctDtlReqPara: {
            ACCT_CD: {
              ACCT_TYPE: "ACCT_TYPE",
              BRANCH_CD: "BRANCH_CD",
              SCREEN_REF: docCD ?? "",
            },
          },
        }}
        setDataOnFieldChange={(action, payload) => {
          if (action === "API_REQ") {
            gridDataRef.current = payload;
            if (payload && payload.BRANCH_CD && payload.ACCT_CD) {
              refetch(); // Manually trigger the API call
            }
          } else if (action === "GRID_DETAIL") {
            setIsBenGridData([]);
          }
        }}
      />

      <>
        {isError ? (
          <Fragment>
            <div style={{ width: "100%", paddingTop: "10px" }}>
              <Alert
                severity={error?.severity ?? "error"}
                errorMsg={error?.error_msg ?? "Error"}
                errorDetail={error?.error_detail ?? ""}
              />
            </div>
          </Fragment>
        ) : null}
        <GridWrapper
          key={`AddNewBenfiDetailGrid`}
          finalMetaData={AddNewBenfiDetailGridMetadata as GridMetaDataType}
          data={isBenGridData ?? []}
          setData={() => null}
          actions={actions}
          setAction={setCurrentAction}
          loading={isLoading || isFetching}
          refetchData={refetch}
        />
      </>
      {isAddOpen ? (
        <BeneficiaryEntryFormModal
          MessageBox={MessageBox}
          formMode={formMode}
          getIfscBenAcDetail={getIfscBenAcDetail}
          gridData={gridData}
          ifscAllList={ifscAllList}
          onSubmitHandler={onSubmitHandler}
          retrieveData={retrieveData}
          retrieveDataRefresh={retrieveDataRefresh}
          setIfscAllList={setIfscAllList}
          setRetrieveData={setRetrieveData}
          setRetrieveDataRefresh={setRetrieveDataRefresh}
          setisAddOpen={setisAddOpen}
          docCD={docCD}
          authState={authState}
          gridDataRef={gridDataRef}
        />
      ) : null}
    </>
  );
};
export const BeneficiaryEnrtyFormWrapper = () => {
  return (
    <ClearCacheProvider>
      <BeneficiaryEnrtyForm />
    </ClearCacheProvider>
  );
};
