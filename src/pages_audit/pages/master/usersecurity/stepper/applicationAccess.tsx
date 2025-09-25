import {
  Fragment,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useMutation, useQuery } from "react-query";
import * as API from "./api/api";
import { applicationAccess } from "./metaData/metaDataGrid";
import { useNavigate } from "react-router-dom";
import { SecurityContext } from "../context/SecuityForm";

import {
  extractGridMetaData,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  Alert,
} from "@acuteinfo/common-base";
import { Box } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
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
const NewApplicationAccess = forwardRef<any, any>(
  ({ defaultView, username, flag }, ref) => {
    const Username = username?.USER_NAME;
    const [gridData, setGridData] = useState<any>([]);
    const [populateDataset, setpopulateDataset] = useState<any>([]);
    const { userState, dispatchCommon } = useContext(SecurityContext);
    const [Modes, setModes] = useState(defaultView);
    const [actionMenu, setActionMenu] = useState(actions);
    const { authState } = useContext(AuthContext);
    const navigate = useNavigate();

    // Get API for New User.
    const {
      data: newData,
      isLoading: newloading,
      isFetching: newfetching,
      isError: newisError,
      error: newerror,
      refetch: newRefetch,
    }: any = useQuery<any, any>(
      ["getnewapplicationaccess", userState?.formData?.USER_NAME],
      () => {
        if (flag === "addMode") {
          return API.getnewapplicationaccess({ userid: "" });
        }
      }
    );

    // Get API for Existing User.
    const {
      data: applicationData,
      isLoading: editloading,
      isFetching: editfetching,
      isError: editisError,
      error: editerror,
      refetch: editRefetch,
    }: any = useQuery(["getapplicationaccess", Username], () => {
      if (flag === "editMode" || flag === "viewMode") {
        return API.getapplicationaccess({ userid: Username });
      }
    });
    const mutation = useMutation(API.getnewapplicationaccess, {
      onError: (error: any) => {
        let errorMsg = "Unknown Error occurred";
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
      },
      onSuccess: (data) => {
        const updatedGrid1Data = data?.map((gridItem) => ({
          ...gridItem,
          APP_TRAN_CD: gridItem?.TRAN_CD,
          LOGIN_ACCESS: gridItem?.LOGIN_ACCESS === "Y" ? true : false,
        }));
        let filteredGrid1Data = updatedGrid1Data?.filter(
          (gridItem) =>
            !applicationData?.some(
              (dataItem) => dataItem.APP_NM === gridItem.APP_NM
            )
        );
        const last = filteredGrid1Data?.map((row) => ({
          ...row,
          _isNewRow: true,
        }));
        const MergeData = [...applicationData, ...last];
        setpopulateDataset(MergeData);
      },
    });
    useEffect(() => {
      if (flag === "addMode") {
        if (userState?.appUpdatedData?.length > 0) {
          setGridData(userState?.appUpdatedData);
        } else {
          setGridData(newData);
        }
      }
    }, [defaultView, userState?.appUpdatedData, newData]);
    useEffect(() => {
      if (flag === "editMode" || flag === "viewMode") {
        if (
          userState?.appUpdatedData.length === 0 &&
          populateDataset.length === 0
        ) {
          setGridData(applicationData);
          dispatchCommon("commonType", { oldappContextData: applicationData });
        } else if (populateDataset.length > 0) {
          setGridData(populateDataset);
        } else {
          setGridData(userState?.appUpdatedData);
        }
      }
    }, [
      userState?.appUpdatedData,
      applicationData,
      populateDataset,
      defaultView,
    ]);
    const setCurrentAction = useCallback(
      (data) => {
        if (data.name === "populate") {
          mutation.mutate({ userid: "" });
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
          navigate(data.name, { state: data.rows });
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
              extractGridMetaData(applicationAccess, Modes) as GridMetaDataType
            }
            actions={
              flag === "editMode" && authState?.role >= "4" ? actionMenu : []
            }
            setAction={setCurrentAction}
            data={gridData || []}
            loading={
              newloading ||
              editloading ||
              newfetching ||
              editfetching ||
              mutation?.isLoading
            }
            setData={setGridData}
            ref={ref}
            refetchData={() => {
              newRefetch();
              editRefetch();
            }}
          />
        </Box>
      </Fragment>
    );
  }
);

export default NewApplicationAccess;
