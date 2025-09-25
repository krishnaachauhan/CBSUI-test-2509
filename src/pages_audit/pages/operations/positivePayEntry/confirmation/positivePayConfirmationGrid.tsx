import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import { useQuery } from "react-query";
import * as API from "../api";
import { PositivePayEntryGridMetaData } from "../gridMetadata";
import { PositivePayEntryFormWrapper } from "../form";
import {
  Alert,
  GridWrapper,
  queryClient,
  ActionTypes,
  GridMetaDataType,
  ClearCacheProvider,
} from "@acuteinfo/common-base";
import {
  DialogProvider,
  useDialogContext,
} from "../../payslip-issue-entry/DialogContext";
import { useEnter } from "components/custom/useEnter";
const Actions: ActionTypes[] = [
  {
    actionName: "view-details",
    actionLabel: "ViewDetails",
    multiple: false,
    rowDoubleClick: true,
  },
];

const PositivePayConfirmationGridMain = ({ screenFlag }) => {
  const isDataChangedRef = useRef(false);
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  const [className, setClassName] = useState<any>("main");
  const { commonClass, trackDialogClass, dialogClassNames } =
    useDialogContext();

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

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getPositivePayConfirmationDetail", authState?.user?.branchCode], () =>
    API.getPositivePayCnfDtl({
      enterCompanyID: authState?.companyID ?? "",
      enterBranchCode: authState?.user?.branchCode ?? "",
    })
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getPositivePayConfirmationDetail",
        authState?.user?.branchCode,
      ]);
    };
  }, []);

  const setCurrentAction = useCallback(
    async (data) => {
      if (data?.name === "view-details") {
        trackDialogClass("formDlg");
        navigate(data?.name, {
          state: data?.rows,
        });
      }
    },
    [navigate]
  );

  const handleDialogClose = useCallback(() => {
    navigate(".");
    trackDialogClass("main");
    if (isDataChangedRef.current === true) {
      refetch();
      isDataChangedRef.current = false;
    }
  }, [navigate]);

  useEnter(`${className}`);

  return (
    <>
      {isError && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? "Something went to wrong.."}
          errorDetail={error?.error_detail}
          color="error"
        />
      )}
      <GridWrapper
        key={`positivePayConfirmationGrid`}
        finalMetaData={PositivePayEntryGridMetaData as GridMetaDataType}
        data={data ?? []}
        setData={() => {}}
        loading={isLoading || isFetching}
        actions={Actions}
        setAction={setCurrentAction}
        refetchData={() => refetch()}
      />
      <Routes>
        <Route
          path="view-details/*"
          element={
            <PositivePayEntryFormWrapper
              isDataChangedRef={isDataChangedRef}
              closeDialog={handleDialogClose}
              defaultView={"view"}
              screenFlag={screenFlag}
            />
          }
        />
      </Routes>
    </>
  );
};

export const PositivePayConfirmationGrid = ({ screenFlag }) => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <div className="main">
          <PositivePayConfirmationGridMain screenFlag={screenFlag} />
        </div>
      </DialogProvider>
    </ClearCacheProvider>
  );
};
