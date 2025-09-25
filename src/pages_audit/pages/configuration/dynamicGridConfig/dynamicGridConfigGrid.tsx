import { useQuery } from "react-query";
import {
  Fragment,
  useEffect,
  useContext,
  useRef,
  useCallback,
  useState,
} from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import * as API from "./api";
import { DynamicGridConfigGridMData } from "./gridMetadata";
import { DynamicGridConfigWrapper } from "./dynamicGridConfigCrud/DynGridConfig";
import { AuthContext } from "pages_audit/auth";
import {
  ActionTypes,
  GridMetaDataType,
  GridWrapper,
  Alert,
  queryClient,
  ClearCacheContext,
} from "@acuteinfo/common-base";
const actions: ActionTypes[] = [
  {
    actionName: "add",
    actionLabel: "Add",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "view-details",
    actionLabel: "Edit Detail",
    multiple: false,
    rowDoubleClick: true,
  },
];
export const DynamicGridConfig = () => {
  const isDataChangedRef = useRef(false);
  const myGridRef = useRef<any>(null);
  const { getEntries } = useContext(ClearCacheContext);
  const navigate = useNavigate();
  const { authState } = useContext(AuthContext);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<"add" | "view">("add");
  const [rowData, setRowData] = useState<any>(null);

  const setCurrentAction = useCallback(
    (data) => {
      setRowData(data?.rows);
      setDialogMode(data?.name === "add" ? "add" : "view");
      setDialogOpen(true);
    },
    [navigate]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getDynamicGridConfigGridData"], () =>
    API.getDynamicGridConfigGridData({
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
    })
  );

  useEffect(() => {
    return () => {
      let entries = getEntries() as any[];
      if (Array.isArray(entries) && entries.length > 0) {
        entries.forEach((one) => {
          queryClient.removeQueries(one);
        });
      }
      queryClient.removeQueries(["getDynamicGridConfigGridData"]);
    };
  }, [getEntries]);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    if (isDataChangedRef.current === true) {
      refetch();
      isDataChangedRef.current = false;
    }
  }, [refetch]);

  return (
    <Fragment>
      {isError && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? "Something went to wrong.."}
          errorDetail={error?.error_detail}
          color="error"
        />
      )}
      <GridWrapper
        key={"dynGridConfigGrid"}
        finalMetaData={DynamicGridConfigGridMData as GridMetaDataType}
        data={data ?? []}
        setData={() => null}
        loading={isLoading || isFetching}
        actions={actions}
        setAction={setCurrentAction}
        refetchData={() => refetch()}
        ref={myGridRef}
        // defaultSortOrder={[{ id: "TRAN_CD", desc: false }]}
      />
      {dialogOpen && (
        <DynamicGridConfigWrapper
          isDataChangedRef={isDataChangedRef}
          closeDialog={handleCloseDialog}
          defaultView={dialogMode}
          data={rowData}
        />
      )}
    </Fragment>
  );
};
