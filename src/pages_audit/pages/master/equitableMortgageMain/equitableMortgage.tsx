import {
  ActionTypes,
  Alert,
  ClearCacheProvider,
  GridWrapper,
  queryClient,
} from "@acuteinfo/common-base";
import { useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { t } from "i18next";
import {
  DialogProvider,
  useDialogContext,
} from "pages_audit/pages/operations/payslip-issue-entry/DialogContext";
import { useEnter } from "components/custom/useEnter";
import { EquitableMortgageForm } from "./equitableMortgageEntryForm";
import { EquitableMortgageGridMetadata } from "./netadata/gridMetadata";
import * as API from "./api";
import { Box } from "@mui/system";

const actions: ActionTypes[] = [
  {
    actionName: "add",
    actionLabel: "Add",
    multiple: undefined,
    alwaysAvailable: true,
  },
  {
    actionName: "view-details",
    actionLabel: "View Detail",
    multiple: false,
    rowDoubleClick: true,
  },
  {
    actionName: "Delete",
    actionLabel: "Delete",
    multiple: false,
  },
];
const EquitableMortgageMain = () => {
  const { authState } = useContext<any>(AuthContext);
  const isDataChangedRef = useRef<any>(null);
  const { commonClass, dialogClassNames } = useDialogContext();
  const navigate = useNavigate();

  const [state, setState] = useState<any>({
    classForEnterFn: "main",
  });
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getgetEquitableMortgageData"], () =>
    API.getEquitableMortgageData({
      COMP_CD: authState?.companyID,
      BRANCH_CD: authState?.user?.branchCode,
    })
  );

  const setCurrentAction = useCallback(
    async (data) => {
      navigate(data?.name, {
        state: data?.rows,
      });
    },
    [navigate]
  );

  const ClosedEventCall = () => {
    if (isDataChangedRef.current === true) {
      isDataChangedRef.current = true;
      refetch();
      isDataChangedRef.current = false;
    }
    navigate(".");
  };

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getgetEquitableMortgageData"]);
    };
  }, []);
  useEffect(() => {
    const newData = commonClass ?? dialogClassNames ?? "main";

    setState((prevState) => ({
      ...prevState,
      classForEnterFn: newData,
    }));
  }, [commonClass, dialogClassNames]);

  useEnter(`${state?.classForEnterFn}`);
  return (
    <Fragment>
      {isError && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? t("Somethingwenttowrong")}
          errorDetail={error?.error_detail}
          color="error"
        />
      )}
      <GridWrapper
        key={"getgetEquitableMortgageData"}
        finalMetaData={EquitableMortgageGridMetadata}
        data={data ?? []}
        setData={() => null}
        actions={actions}
        loading={isLoading || isFetching}
        setAction={setCurrentAction}
        refetchData={() => refetch()}
        variant="contained"
      />
      <Routes>
        <Route
          path="add/*"
          element={
            <EquitableMortgageForm
              closeDialog={ClosedEventCall}
              defaultView={"add"}
              isDataChangedRef={isDataChangedRef}
            />
          }
        />
        <Route
          path="view-details/*"
          element={
            <EquitableMortgageForm
              closeDialog={ClosedEventCall}
              defaultView={"view"}
              isDataChangedRef={isDataChangedRef}
            />
          }
        />
      </Routes>
    </Fragment>
  );
};
export const EquitableMortgage = () => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <Box className="main">
          <EquitableMortgageMain />
        </Box>
      </DialogProvider>
    </ClearCacheProvider>
  );
};
