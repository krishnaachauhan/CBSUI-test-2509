import { Dialog } from "@mui/material";
import { GridMetaDataType, GridWrapper } from "@acuteinfo/common-base";
import { AuditMetadata } from "./gridMetadata";
import { useQuery } from "react-query";
import * as API from "./api";
import { useCallback, useContext, useEffect } from "react";
import { AuthContext } from "pages_audit/auth";
import { useNavigate } from "react-router-dom";
import {
  ClearCacheContext,
  queryClient,
  ActionTypes,
} from "@acuteinfo/common-base";
const actions: ActionTypes[] = [
  {
    actionName: "close",
    actionLabel: "Close",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];
const AuditDetail = ({ open, onClose, rowsData }) => {
  const { getEntries } = useContext(ClearCacheContext);
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  const { data, isLoading, isFetching } = useQuery<any, any>(
    ["getParaAuditHistory"],
    () =>
      API.getParaAuditHistory({
        para_cd: rowsData?.PARA_CD,
        comp_cd: authState?.companyID,
        branch_cd: rowsData?.BRANCH_CD,
      })
  );
  const setCurrentAction = useCallback(
    async (data) => {
      if (data.name === "close") {
        onClose(onClose);
      } else {
        navigate(data?.name);
      }
    },
    [navigate]
  );
  AuditMetadata.gridConfig.gridLabel =
    "Para Code = " + rowsData?.PARA_CD + " " + rowsData?.PARA_NM;
  useEffect(() => {
    return () => {
      let entries = getEntries() as any[];
      if (Array.isArray(entries) && entries.length > 0) {
        entries.forEach((one) => {
          queryClient.removeQueries(one);
        });
      }
      queryClient.removeQueries(["getParaAuditHistory"]);
    };
  }, [getEntries]);

  return (
    <>
      <Dialog
        open={open}
        PaperProps={{
          style: {
            maxWidth: "1200px",
          },
        }}
      >
        <GridWrapper
          key={"parametersGridAudit"}
          finalMetaData={AuditMetadata as GridMetaDataType}
          data={data ?? []}
          enableExport={true}
          actions={actions}
          setAction={setCurrentAction}
          setData={() => null}
          loading={isLoading || isFetching}
        />
      </Dialog>
    </>
  );
};
export default AuditDetail;
