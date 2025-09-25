import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import {
  LoanScheduleDetailsGridMetadata,
  LoanScheduleGridMetaData,
} from "./gridMetadata";
import { LoanRegenerateFormWrapper } from "./form/loanRegenerate";
import { LoanRescheduleFormWrapper } from "./form/loanReschedule";
import { AuthContext } from "pages_audit/auth";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import { RetrievalFormWrapper } from "./form/retrieveForm";
import {
  Alert,
  queryClient,
  GridWrapper,
  ActionTypes,
  GridMetaDataType,
  ClearCacheProvider,
} from "@acuteinfo/common-base";
import { LoanReviseFormWrapper } from "./form/loanReviseForm";
import {
  DialogProvider,
  useDialogContext,
} from "../payslip-issue-entry/DialogContext";
import { useEnter } from "components/custom/useEnter";

const LoanScheduleGridMain = () => {
  const isDataChangedRef = useRef(false);
  const retrievalParaRef = useRef<any>(null);
  const headerDataRef = useRef<any>(null);
  const { authState } = useContext(AuthContext);
  const [editOpen, setEditOpen] = useState(false);
  const [srCd, setSrCd] = useState<any>(null);
  const [headerGridData, setHeaderGridData] = useState<any>([]);
  const [detailsGridData, setDetailsGridData] = useState<any>([]);
  const [reviseData, setReviseData] = useState<any>(null);
  const [previousRowData, setPreviousRowData] = useState<any>(null);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const navigate = useNavigate();
  const [className, setClassName] = useState<any>("main");
  const { commonClass, trackDialogClass, dialogClassNames } =
    useDialogContext();
  const [actions, setActions] = useState<ActionTypes[]>([
    {
      actionName: "retrieve",
      actionLabel: "Retrieve",
      multiple: undefined,
      rowDoubleClick: false,
      alwaysAvailable: true,
    },
  ]);

  //For Enter key
  useEffect(() => {
    const newData =
      commonClass !== null
        ? commonClass
        : dialogClassNames
        ? `${dialogClassNames}`
        : "main";

    setClassName(newData);
  }, [commonClass, dialogClassNames]);

  useEffect(() => {
    if (Boolean(headerGridData) && headerGridData.length === 0) {
      setActions([
        {
          actionName: "retrieve",
          actionLabel: "Retrieve",
          multiple: undefined,
          rowDoubleClick: false,
          alwaysAvailable: true,
        },
      ]);
    } else if (retrievalParaRef.current?.ALLOW_REGERATE === "N") {
      setActions([
        {
          actionName: "retrieve",
          actionLabel: "Retrieve",
          multiple: undefined,
          rowDoubleClick: false,
          alwaysAvailable: true,
        },
        {
          actionName: "reschedule",
          actionLabel: "Reschedule",
          multiple: undefined,
          rowDoubleClick: false,
          alwaysAvailable: true,
        },
      ]);
    } else if (retrievalParaRef.current?.ALLOW_RESCHEDULE === "N") {
      setActions([
        {
          actionName: "retrieve",
          actionLabel: "Retrieve",
          multiple: undefined,
          rowDoubleClick: false,
          alwaysAvailable: true,
        },
        {
          actionName: "regenerate",
          actionLabel: "Regenerate",
          multiple: undefined,
          rowDoubleClick: false,
          alwaysAvailable: true,
        },
      ]);
    } else {
      setActions([
        {
          actionName: "retrieve",
          actionLabel: "Retrieve",
          multiple: undefined,
          rowDoubleClick: false,
          alwaysAvailable: true,
        },
        {
          actionName: "regenerate",
          actionLabel: "Regenerate",
          multiple: undefined,
          rowDoubleClick: false,
          alwaysAvailable: true,
        },
        {
          actionName: "reschedule",
          actionLabel: "Reschedule",
          multiple: undefined,
          rowDoubleClick: false,
          alwaysAvailable: true,
        },
      ]);
    }

    if (Boolean(headerGridData) && headerGridData.length > 0) {
      const branchCode = headerGridData[0]?.BRANCH_CD?.trim() ?? "";
      const accountType = headerGridData[0]?.ACCT_TYPE?.trim() ?? "";
      const accountNo = headerGridData[0]?.ACCT_CD?.trim() ?? "";
      const companyCode = headerGridData[0]?.COMP_CD?.trim() ?? "";
      const accountName = headerGridData[0]?.ACCT_NM ?? "";
      LoanScheduleGridMetaData.gridConfig.gridLabel = `Loan Schedule of A/c No.:\u00A0${companyCode}-${branchCode}-${accountType}-${accountNo}\u00A0\u00A0 Name: ${accountName}`;
    }
    return () => {
      LoanScheduleGridMetaData.gridConfig.gridLabel = "";
    };
  }, [headerGridData, headerGridData.length]);

  const loanScheduleHeaderData = useMutation(API.getLoanScheduleHeaderData, {
    onSuccess: (data) => {
      trackDialogClass("main");
      setSrCd(data?.[0]?.SR_CD);
      setHeaderGridData(data);
      headerDataRef.current = data;
    },
    onError: (error: any) => {},
  });

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery<
    any,
    any
  >(
    ["getLoanScheduleDetails", authState?.user?.branchCode, srCd],
    () =>
      API.getLoanScheduleDetails({
        BRANCH_CD: authState?.user?.branchCode ?? "",
        COMP_CD: authState?.companyID ?? "",
        ACCT_TYPE: retrievalParaRef.current?.ACCT_TYPE ?? "",
        ACCT_CD: retrievalParaRef.current?.ACCT_CD ?? "",
        TRAN_CD: srCd ?? "",
        GD_DATE: authState?.workingDate ?? "",
        USER_LEVEL: authState?.role ?? "",
      }),
    {
      enabled: Boolean(srCd),
      onSuccess(data) {
        if (Array.isArray(data) && data.length > 0) {
          const updatedData = data.map((item) => ({
            ...item,
            INT_RATE: Number(item?.INT_RATE ?? 0).toFixed(2),
          }));
          setDetailsGridData(updatedData);
        } else {
          setDetailsGridData([]);
        }
      },
    }
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getLoanScheduleDetails",
        authState?.user?.branchCode,
        srCd,
      ]);
    };
  }, []);

  const setCurrentAction = useCallback(
    async (data) => {
      if (data?.name === "retrieve") {
        trackDialogClass("retrieveDlg");
        navigate(data?.name, {
          state: [],
        });
        setHeaderGridData([]);
        setDetailsGridData([]);
        setSrCd(null);
        headerDataRef.current = null;
        LoanScheduleGridMetaData.gridConfig.gridLabel = "";
      } else if (data?.name === "regenerate") {
        trackDialogClass("regenerateDlg");
        navigate(data?.name, {
          state: headerDataRef.current,
        });
      } else if (data?.name === "reschedule") {
        trackDialogClass("rescheduleDlg");
        navigate(data?.name, {
          state: data?.rows?.[0]?.data,
        });
      } else if (data?.name === "_rowChanged") {
        setSelectedRowData(data?.rows?.[0]);
        setSrCd(data?.rows?.[0]?.data?.SR_CD);
      } else {
        navigate(data?.name, {
          state: data?.rows,
        });
      }
    },
    [navigate]
  );

  useEffect(() => {
    navigate("retrieve");
    trackDialogClass("retrieveDlg");
  }, []);

  const selectedDatas = (dataObj) => {
    navigate(".");
    if (dataObj) retrievalParaRef.current = dataObj;
    const retrieveData: any = {
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: retrievalParaRef.current?.BRANCH_CD ?? "",
      ACCT_TYPE: retrievalParaRef.current?.ACCT_TYPE ?? "",
      ACCT_CD: retrievalParaRef.current?.ACCT_CD ?? "",
      ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
      ENT_COMP_CD: authState?.companyID ?? "",
      GD_DATE: authState?.workingDate ?? "",
    };
    loanScheduleHeaderData.mutate(retrieveData);
  };

  const handleDialogClose = useCallback(() => {
    navigate(".");
    trackDialogClass("main");
  }, [navigate]);

  const handleFormClose = useCallback(() => {
    navigate(".");
    trackDialogClass("main");
    if (isDataChangedRef.current === true) {
      navigate("retrieve");
      trackDialogClass("retrieveDlg");
      setHeaderGridData([]);
      setDetailsGridData([]);
      setSrCd(null);
      headerDataRef.current = null;
      isDataChangedRef.current = false;
    }
  }, [navigate]);

  const handleEditClose = () => {
    setEditOpen(false);
    if (isDataChangedRef.current === true) {
      refetch();
      isDataChangedRef.current = false;
    }
  };

  useEnter(`${className}`);

  return (
    <>
      {loanScheduleHeaderData.isError && (
        <Alert
          severity="error"
          errorMsg={
            loanScheduleHeaderData?.error?.error_msg ??
            "Something went to wrong.."
          }
          errorDetail={loanScheduleHeaderData?.error?.error_detail}
          color="error"
        />
      )}
      <GridWrapper
        key={`loanScheduleGrid` + headerGridData.length + actions}
        finalMetaData={LoanScheduleGridMetaData as GridMetaDataType}
        data={headerGridData}
        setData={setHeaderGridData}
        loading={loanScheduleHeaderData?.isLoading}
        actions={actions}
        setAction={setCurrentAction}
        disableMultipleRowSelect={true}
        defaultSelectedRowId={
          headerGridData?.length > 0 ? headerGridData?.[0]?.SR_CD : ""
        }
      />
      {isError && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? "Something went to wrong.."}
          errorDetail={error?.error_detail}
          color="error"
        />
      )}
      <GridWrapper
        key={`LoanScheduleDetails` + data}
        finalMetaData={LoanScheduleDetailsGridMetadata as GridMetaDataType}
        data={detailsGridData}
        setData={setDetailsGridData}
        loading={isLoading || isFetching}
        onClickActionEvent={async (index, id, data) => {
          if (id === "EDIT_BTN") {
            setReviseData({
              ...data,
              TOTAL_RECORDS: String(detailsGridData.length),
            });
            setEditOpen(true);
            if (index > 0 && Boolean(data.SR_CD)) {
              const previousRowData = detailsGridData[index - 1];
              setPreviousRowData(previousRowData);
            }
          }
        }}
      />
      <Routes>
        <Route
          path="regenerate/*"
          element={
            <LoanRegenerateFormWrapper
              isDataChangedRef={isDataChangedRef}
              closeDialog={handleFormClose}
            />
          }
        />
        <Route
          path="reschedule/*"
          element={
            <LoanRescheduleFormWrapper
              isDataChangedRef={isDataChangedRef}
              closeDialog={handleDialogClose}
              handleFormClose={handleFormClose}
              formFlag={"RESCHEDULE"}
            />
          }
        />
        <Route
          path="retrieve/*"
          element={
            <RetrievalFormWrapper
              closeDialog={handleDialogClose}
              retrievalParaValues={selectedDatas}
            />
          }
        />
      </Routes>

      {editOpen && (
        <LoanReviseFormWrapper
          isDataChangedRef={isDataChangedRef}
          closeDialog={handleEditClose}
          reviseData={reviseData}
          previousRowData={previousRowData}
          selectedRowData={selectedRowData}
        />
      )}
    </>
  );
};

export const LoanScheduleGrid = () => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <div className="main">
          <LoanScheduleGridMain />
        </div>
      </DialogProvider>
    </ClearCacheProvider>
  );
};
