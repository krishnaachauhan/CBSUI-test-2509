import {
  ClearCacheContext,
  ClearCacheProvider,
  queryClient,
  GridMetaDataType,
  ActionTypes,
  GridWrapper,
  utilFunction,
} from "@acuteinfo/common-base";
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as API from "./api";
import { ParametersGridMetaData } from "./gridMetadata";
import { useLocation, useNavigate } from "react-router-dom";
import EditDetail from "./editParaDetails/editDetail";
import { useQuery } from "react-query";
import { Alert } from "@acuteinfo/common-base";
import { AuthContext } from "pages_audit/auth";
import { Dialog, Typography } from "@mui/material";
import AuditDetail from "./AuditDetail";

const actions: ActionTypes[] = [
  {
    actionName: "global",
    actionLabel: "Global Level",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
    shouldExclude: (rows) => {
      return false;
    },
  },
  {
    actionName: "edit-detail",
    actionLabel: "Edit Details",
    multiple: false,
    rowDoubleClick: true,
  },
];

const Parameters = () => {
  const navigate = useNavigate();
  let currentPath = useLocation().pathname;
  const { getEntries } = useContext(ClearCacheContext);
  const { authState } = useContext(AuthContext);
  const [rowsData, setRowsData] = useState([]);
  const [acctOpen, setAcctOpen] = useState(false);
  const [paraType, setParaType] = useState("H");
  const [componentToShow, setComponentToShow] = useState("");
  const [actionMenu, setActionMenu] = useState(actions);
  const [openDilogue, setOpenDilogue] = useState(false);
  const [auditData, setAuditData] = useState([]);
  const setCurrentAction = useCallback(
    async (data) => {
      if (data.name === "global") {
        setActionMenu((values) =>
          values.map((item) =>
            item.actionName === "global"
              ? { ...item, actionName: "ho", actionLabel: "HO Level" }
              : item
          )
        );
        setParaType("G");
      } else if (data.name === "ho") {
        setActionMenu((values) =>
          values.map((item) =>
            item.actionName === "ho"
              ? { ...item, actionName: "global", actionLabel: "Global Level" }
              : item
          )
        );
        setParaType("H");
      } else if (data.name === "edit-detail") {
        setComponentToShow("editDetail");
        setAcctOpen(true);
        setRowsData(data?.rows);
      } else {
        navigate(data?.name, { state: data?.rows });
      }
    },
    [navigate]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getParametersGridData", paraType], () =>
    API.getParametersGridData({
      para_type: paraType,
      comp_cd: authState?.companyID,
      branch_cd: authState.user.branchCode,
      conf_type: "A",
    })
  );
  const validation = () => {
    if (authState.user.branchCode === authState.user.baseBranchCode) {
      return actionMenu;
    } else {
      return actionMenu.filter((action) => action.actionName === "edit-detail");
    }
  };
  ParametersGridMetaData.gridConfig.gridLabel =
    paraType === "H"
      ? // ? "Parameter Master [HO Level]"
        // : "Parameter Master [Global Level]";
        `${utilFunction.getDynamicLabel(
          currentPath,
          authState?.menulistdata,
          true
        )} [HO Level]`
      : `${utilFunction.getDynamicLabel(
          currentPath,
          authState?.menulistdata,
          true
        )} [Global Level]`;
  useEffect(() => {
    return () => {
      let entries = getEntries() as any[];
      if (Array.isArray(entries) && entries.length > 0) {
        entries.forEach((one) => {
          queryClient.removeQueries(one);
        });
      }
      queryClient.removeQueries(["getParametersGridData"]);
    };
  }, [getEntries]);

  return (
    <Fragment>
      {isError && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? "Something went wrong.."}
          errorDetail={error?.error_detail}
          color="error"
        />
      )}
      <GridWrapper
        key={"parametersGrid" + paraType}
        finalMetaData={ParametersGridMetaData as GridMetaDataType}
        data={data ?? []}
        enableExport={true}
        actions={validation()}
        setAction={setCurrentAction}
        setData={() => null}
        loading={isLoading || isFetching}
        refetchData={() => refetch()}
        onClickActionEvent={(index, id, data) => {
          setOpenDilogue(true);
          setAuditData(data);
        }}
      />
      {openDilogue ? (
        <AuditDetail
          rowsData={auditData}
          open={openDilogue}
          onClose={() => setOpenDilogue(false)}
        />
      ) : null}
      {componentToShow === "editDetail" ? (
        <EditDetail
          rowsData={rowsData}
          open={acctOpen}
          onClose={() => setAcctOpen(false)}
          formView={"view"}
          refetch={refetch}
        />
      ) : null}
    </Fragment>
  );
};

export const ParametersGridWrapper = () => {
  return (
    <ClearCacheProvider>
      <Parameters />
    </ClearCacheProvider>
  );
};
export default Parameters;
