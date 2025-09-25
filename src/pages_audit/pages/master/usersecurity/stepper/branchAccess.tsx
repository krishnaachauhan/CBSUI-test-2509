import {
  Fragment,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { userAccessbranch } from "./metaData/metaDataGrid";
import * as API from "./api/api";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import { useNavigate } from "react-router-dom";
import { SecurityContext } from "../context/SecuityForm";

import {
  extractGridMetaData,
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
} from "@acuteinfo/common-base";
import { Box } from "@mui/material";

const actions: ActionTypes[] = [
  {
    actionName: "populate",
    actionLabel: "Populate",
    multiple: undefined,
    alwaysAvailable: true,
    rowDoubleClick: false,
  },
  {
    actionName: "edit",
    actionLabel: "Edit",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
    shouldExclude: (rows) => {
      return false;
    },
  },
];

const BranchAccessRights = forwardRef<any, any>(
  ({ defaultView, username, flag }, ref) => {
    const { authState } = useContext(AuthContext);
    const { userState, dispatchCommon } = useContext(SecurityContext);
    let Username = username?.USER_NAME;
    const [gridData, setGridData] = useState<any>([]);
    const [populateDataset, setpopulateDataset] = useState<any>([]);
    const [Modes, setModes] = useState(defaultView);
    const [actionMenu, setActionMenu] = useState(actions);
    const navigate = useNavigate();
    const {
      data: mainData,
      isLoading: newloading,
      isFetching: newfetching,
      isError: newisError,
      error: newerror,
      refetch: newRefetch,
    }: any = useQuery<any, any>(["getNewUserBranchAccess", Username], () => {
      if (flag === "addMode") {
        return API.getNewUserBranchAccess({
          comp_cd: authState?.companyID,
        });
      }
    });
    const {
      data: branchData,
      isLoading: editloading,
      isFetching: editfetching,
      isError: editisError,
      error: editerror,
      refetch: editRefetch,
    }: any = useQuery<any, any>(["getUserAccessBranch", Username], () => {
      if (flag === "editMode" || flag === "viewMode") {
        return API.getUserAccessBranch({
          userid: Username,
        });
      }
    });
    const mutation = useMutation(API.getNewUserBranchAccess, {
      onError: (error: any) => {
        let errorMsg = "Unknown Error occured";
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
      },
      onSuccess: (data) => {
        const updatedGrid1Data = data?.map((gridItem) => ({
          ...gridItem,
          BRANCH_CD: gridItem?.BRANCH_CD,
          LOGIN_ACCESS: gridItem?.LOGIN_ACCESS === "Y" ? true : false,
          REPORT_ACCESS: gridItem?.REPORT_ACCESS === "Y" ? true : false,
        }));
        let filteredGrid1Data = updatedGrid1Data?.filter(
          (gridItem) =>
            !branchData?.some(
              (dataItem) => dataItem.BRANCH_NM === gridItem?.BRANCH_NM
            )
        );
        const last = filteredGrid1Data?.map((row) => ({
          ...row,
          _isNewRow: true,
        }));
        const MergeData = [...branchData, ...last];
        setpopulateDataset(MergeData);
      },
    });
    useEffect(() => {
      if (flag === "addMode") {
        if (userState?.branchUpdatedData?.length > 0) {
          setGridData(userState?.branchUpdatedData);
        } else {
          setGridData(mainData);
        }
      }
    }, [defaultView, userState?.branchUpdatedData, mainData]);
    useEffect(() => {
      if (flag === "editMode" || flag === "viewMode") {
        if (
          userState?.branchUpdatedData.length === 0 &&
          populateDataset.length === 0
        ) {
          setGridData(branchData);
          dispatchCommon("commonType", { oldbranchContextData: branchData });
        } else if (populateDataset.length > 0) {
          setGridData(populateDataset);
        } else {
          setGridData(userState?.branchUpdatedData);
        }
      }
    }, [
      userState?.branchUpdatedData,
      branchData,
      populateDataset,
      defaultView,
    ]);
    const setCurrentAction = useCallback(
      (data) => {
        if (data.name === "populate") {
          mutation.mutate({ comp_cd: authState?.companyID });
        } else if (data.name === "edit") {
          setActionMenu((values) =>
            values.map((item) =>
              item.actionName === "edit"
                ? { ...item, actionName: "view", actionLabel: "View" }
                : item
            )
          );
          setModes("edit");
        } else if (data.name === "view") {
          setActionMenu((values) =>
            values.map((item) =>
              item.actionName === "view"
                ? { ...item, actionName: "edit", actionLabel: "Edit" }
                : item
            )
          );
          setModes("view");
        } else {
          navigate(data?.name, {
            state: data?.rows,
          });
        }
      },
      [navigate]
    );
    return (
      <Fragment>
        {newisError ||
          (editisError && (
            <Alert
              severity="error"
              errorMsg={
                newerror?.error_msg ??
                editerror?.error_msg ??
                "Somethingwenttowrong"
              }
              errorDetail={newerror?.error_detail ?? editerror?.error_detail}
              color="error"
            />
          ))}
        <Box
          style={{
            padding: "0 10px 0px 10px",
          }}
        >
          <GridWrapper
            key={`userAccessbranch` + Modes}
            finalMetaData={
              extractGridMetaData(userAccessbranch, Modes) as GridMetaDataType
            }
            data={gridData || []}
            actions={
              flag === "editMode" && authState?.role >= "4" ? actionMenu : []
            }
            setAction={setCurrentAction}
            loading={
              newloading ||
              editloading ||
              newfetching ||
              editfetching ||
              mutation?.isLoading
            }
            setData={setGridData}
            refetchData={() => {
              newRefetch();
              editRefetch();
            }}
            ref={ref}
          />
        </Box>
      </Fragment>
    );
  }
);

export default BranchAccessRights;
