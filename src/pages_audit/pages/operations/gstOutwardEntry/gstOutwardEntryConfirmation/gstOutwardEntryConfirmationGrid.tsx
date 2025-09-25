import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AuthContext } from "pages_audit/auth";
import { Route, Routes, useNavigate } from "react-router-dom";
import { gstOutwardEntryConfirmationGrid } from "./gstConfirmationGridMetaData";
import * as API from "./api";
import { useMutation, useQuery } from "react-query";
import {
  queryClient,
  GridWrapper,
  Alert,
  ActionTypes,
  ClearCacheContext,
  GridMetaDataType,
} from "@acuteinfo/common-base";
import { GstOutwardMasterDetailFormNew } from "../../GstOutwardEntryNew/GstOutwardEntry/gstOutWardMasterDetailFormNew";
const actions: ActionTypes[] = [
  {
    actionName: "view-details",
    actionLabel: "ViewDetails",
    multiple: false,
    rowDoubleClick: true,
  },
  {
    actionName: "view-all",
    actionLabel: "View All",
    multiple: false,
    alwaysAvailable: true,
    rowDoubleClick: false,
  },
];
export const GstOutwardConfirmationGrid = ({ screenFlag }) => {
  const { authState } = useContext(AuthContext);
  const { getEntries } = useContext(ClearCacheContext);
  const navigate = useNavigate();
  const myGridRef = useRef<any>(null);
  const [gridData, setGridData] = useState([]);
  const [mutateData, setMutateData] = useState([]);
  const isDataChangedRef = useRef(false);
  const {
    data: mainData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<any, any>(["getGstOutwardConfirmationRetrive"], () =>
    API.getGstOutwardConfirmationRetrive({
      comp_cd: authState?.companyID,
      branch_cd: authState?.user?.branchCode,
      flag: "",
      gd_date: authState?.workingDate,
      user_level: authState?.role,
      user_name: authState?.user?.id,
    })
  );
  const mutation = useMutation(API.getGstOutwardHeaderRetrive, {
    onError: async (error: any) => {
      let errorMsg = "Unknown Error occurred";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
    },
    onSuccess: (data) => {
      const mutateData = data;
      setMutateData(mutateData);
    },
  });
  const setCurrentAction = useCallback(
    (data) => {
      if (data?.name === "view-all") {
        mutation.mutate({
          comp_cd: authState?.companyID,
          branch_cd: authState?.user?.branchCode,
          flag: "A",
          gd_date: authState?.workingDate,
          user_level: authState?.role,
          user_name: authState?.user?.name,
        });
      }
      navigate(data?.name, {
        state: data?.rows,
      });
    },
    [navigate]
  );
  useEffect(() => {
    if (mutateData?.length > 0) {
      setGridData(mutateData);
    } else {
      setGridData(mainData);
    }
  }, [gridData, mutateData, mainData]);
  const handleDialogClose = () => {
    if (isDataChangedRef.current === true) {
      isDataChangedRef.current = true;
      refetch();
      isDataChangedRef.current = false;
    }
    navigate(".");
  };
  useEffect(() => {
    return () => {
      let entries = getEntries() as any[];
      if (Array.isArray(entries) && entries.length > 0) {
        entries.forEach((one) => {
          queryClient.removeQueries(one);
        });
      }
      queryClient.removeQueries(["getGstOutwardConfirmationRetrive"]);
    };
  }, [getEntries]);
  return (
    <Fragment>
      {isError && (
        <Alert
          severity="error"
          errorMsg={
            error?.error_msg ??
            mutation?.error?.error_msg ??
            "Something went to wrong.."
          }
          errorDetail={error?.error_detail ?? mutation?.error?.error_detail}
          color="error"
        />
      )}
      <GridWrapper
        key={`GstOutwardgridConfirmation`}
        finalMetaData={gstOutwardEntryConfirmationGrid as GridMetaDataType}
        data={gridData ?? []}
        setData={() => null}
        loading={isLoading || isFetching || mutation?.isLoading}
        actions={actions}
        setAction={setCurrentAction}
        refetchData={() => refetch()}
        ref={myGridRef}
      />
      <Routes>
        <Route
          path="view-details"
          element={
            <GstOutwardMasterDetailFormNew
              ClosedEventCall={handleDialogClose}
              defaultView={"view"}
              screenFlag={screenFlag}
              refetchData={refetch}
            />
          }
        />
      </Routes>
    </Fragment>
  );
};
export default GstOutwardConfirmationGrid;
