import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  memo,
} from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import {
  Alert,
  GridWrapper,
  ActionTypes,
  queryClient,
  ClearCacheProvider,
  usePopupContext,
} from "@acuteinfo/common-base";

import { RetrievedinfoGridMetaData } from "./RetrivalInfoGridMetadata";
import { AuthContext } from "pages_audit/auth";
import * as API from "./api";
import { DataRetrival } from "./RetriveData";
import { PayslipConfirmationFormDetails } from "./payslipConfirmationForm";
import i18n from "components/multiLanguage/languagesConfiguration";
import { useEnter } from "components/custom/useEnter";

const actions: ActionTypes[] = [
  {
    actionName: "retrive",
    actionLabel: "Retrieve",
    alwaysAvailable: true,
    multiple: undefined,
  },
  {
    actionName: "close",
    actionLabel: "Close",
    alwaysAvailable: true,
    multiple: undefined,
  },
  {
    actionName: "view-details",
    actionLabel: "View Details",
    multiple: false,
    rowDoubleClick: true,
  },
];

interface PayslipData {
  TRAN_CD: string;
  AMOUNT: string;
  TOTAL_AMT?: number;
}
interface PayslipRetrieveParams {
  ENT_COMP_CD: string;
  ENT_BRANCH_CD: string;
  GD_DATE: string;
  FROM_DT: string;
  TO_DT: string;
  FLAG: string;
  A_LANG: string;
}

interface Props {
  onClose: () => void;
}

const PayslipissueconfirmationGrid = memo(({ onClose }: Props) => {
  const { authState } = useContext(AuthContext);
  const { MessageBox } = usePopupContext();
  const navigate = useNavigate();
  const [gridData, setGridData] = useState<PayslipData[]>([]);
  const [dateDialog, setDateDialog] = useState(true);
  const isDataChangedRef = useRef(false);
  const retrievalParaRef = useRef<PayslipRetrieveParams | null>(null);
  const queryKey = ["getPayslipCnfRetrieveData"];

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    PayslipData[]
  >(
    queryKey,
    () =>
      API.getPayslipCnfRetrieveData({
        A_LANG: i18n.resolvedLanguage ?? "",
        ENT_COMP_CD: authState?.companyID ?? "",
        ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
        GD_DATE: authState?.workingDate ?? "",
        FROM_DT: authState?.workingDate ?? "",
        TO_DT: authState?.workingDate ?? "",
        FLAG: "A",
      }),
    { refetchOnWindowFocus: false }
  );

  const retrieveDataMutation = useMutation(API.getPayslipCnfRetrieveData, {
    onError: async (err: any) => {
      setGridData([]);
      await MessageBox({
        message: err?.error_msg ?? "Error occurred",
        messageTitle: "Error",
        icon: "ERROR",
        buttonNames: ["Ok"],
      });
    },
    onSuccess: (res) => {
      setGridData(res.length > 1 ? res : []);
    },
  });

  useEffect(() => {
    if (data && !isLoading && !isFetching) setGridData(data);
  }, [data, isLoading, isFetching]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries(queryKey);
    };
  }, []);

  const handleAction = useCallback(
    ({ name, rows }: { name: string; rows?: PayslipData[] }) => {
      switch (name) {
        case "retrive":
          setGridData([]);
          setDateDialog(true);
          retrievalParaRef.current = null;
          break;
        case "close":
          onClose();
          break;
        case "view-details":
          navigate("view-details", { state: rows });
          break;
      }
    },
    [navigate, onClose]
  );

  const handleDialogClose = useCallback(() => {
    navigate(".");
    if (isDataChangedRef.current) {
      retrievalParaRef.current
        ? retrieveDataMutation.mutate(retrievalParaRef.current)
        : refetch();
      isDataChangedRef.current = false;
    }
  }, [navigate, refetch, retrieveDataMutation]);

  const handleSelectData = (params: PayslipRetrieveParams) => {
    setDateDialog(false);
    retrievalParaRef.current = params;
    retrieveDataMutation.mutate(params);
  };

  useEnter("main");

  return (
    <Fragment>
      {isError && (
        <Alert
          severity="error"
          errorMsg={(error as Error)?.message ?? "Something went wrong"}
          errorDetail={(error as Error)?.message}
        />
      )}

      <div className="main">
        <GridWrapper
          key={"PayslipCnfRetrieveDataGrid" + gridData.length}
          finalMetaData={RetrievedinfoGridMetaData}
          data={gridData}
          setData={setGridData}
          actions={actions}
          loading={isLoading || isFetching || retrieveDataMutation.isLoading}
          setAction={handleAction}
          refetchData={refetch}
        />
      </div>

      <Routes>
        <Route
          path="view-details/*"
          element={
            <PayslipConfirmationFormDetails
              closeDialog={handleDialogClose}
              isDataChangedRef={isDataChangedRef}
            />
          }
        />
      </Routes>

      {dateDialog && (
        <DataRetrival
          closeDialog={() => setDateDialog(false)}
          onUpload={handleSelectData}
        />
      )}
    </Fragment>
  );
});

export const Payslipissueconfirmation = ({ onClose }: Props) => (
  <ClearCacheProvider>
    <PayslipissueconfirmationGrid onClose={onClose} />
  </ClearCacheProvider>
);
