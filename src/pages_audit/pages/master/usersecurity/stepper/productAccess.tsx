import {
  Fragment,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { productaccess } from "./metaData/metaDataGrid";
import * as API from "./api/api";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
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

export const ProductAccess = forwardRef<any, any>(
  ({ defaultView, username, flag }, ref) => {
    const Username = username?.USER_NAME;
    const { authState } = useContext(AuthContext);
    const { userState, dispatchCommon, updateoldData2 } =
      useContext(SecurityContext);
    const [gridData, setGridData] = useState<any>([]);
    const [populateDataset, setpopulateDataset] = useState<any>([]);
    const [grid1Data, setGrid1Data] = useState<any>([]);
    const [combinedData, setCombinedData] = useState<any>([]);
    const [rowsData, setRowsData] = useState<any>([]);
    const [Modes, setModes] = useState(defaultView);
    const [actionMenu, setActionMenu] = useState(actions);
    const navigate = useNavigate();

    const {
      data: newData,
      isLoading: newloading,
      isFetching: newfetching,
      isError: newisError,
      error: newerror,
      refetch: newRefetch,
    }: any = useQuery<any, any>(
      ["getNewUserProductAccess", Username],
      () =>
        API.getNewUserProductAccess({
          base_branch_cd: authState?.user?.baseBranchCode,
          base_comp_cd: authState?.baseCompanyID,
        }),
      { enabled: flag === "addMode" }
    );

    const {
      data: productData,
      isLoading: editloading,
      isFetching: editfetching,
      isError: editisError,
      error: editerror,
      refetch: editRefetch,
    }: any = useQuery<any, any>(
      ["getproductaccess", Username],
      () => API.getproductaccess({ userid: Username }),
      { enabled: flag === "editMode" || flag === "viewMode" }
    );

    const mutation = useMutation(API.getNewUserProductAccess, {
      onError: (error: any) => {
        let errorMsg = "Unknown Error occurred";
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
      },
      onSuccess: (data) => {
        const updatedGrid1Data = data?.map((gridItem) => ({
          ...gridItem,
          ACCT_TYPE: gridItem?.ACCT_TYPE,
          ACCESS: gridItem?.ACCESS === "Y" ? true : false,
        }));
        let filteredGrid1Data = updatedGrid1Data?.filter(
          (gridItem) =>
            !productData?.some(
              (dataItem) => dataItem.TYPE_NM === gridItem?.TYPE_NM
            )
        );
        const last = filteredGrid1Data?.map((row) => ({
          ...row,
          _isNewRow: true,
        }));
        const MergeData = [...productData, ...last];
        setpopulateDataset(MergeData);
      },
    });

    useEffect(() => {
      if (flag === "addMode") {
        if (userState?.productUpdatedData?.length > 0) {
          setGridData(userState?.productUpdatedData);
        } else {
          setGridData(newData);
        }
      }
    }, [defaultView, userState?.productUpdatedData, newData]);

    useEffect(() => {
      if (flag === "editMode" || flag === "viewMode") {
        if (
          userState?.productUpdatedData.length === 0 &&
          populateDataset.length === 0
        ) {
          setGridData(productData);
          dispatchCommon("commonType", { oldproductContextData: productData });
        } else if (populateDataset.length > 0) {
          setGridData(populateDataset);
        } else {
          setGridData(userState?.productUpdatedData);
        }
      }
    }, [
      userState?.productUpdatedData,
      productData,
      populateDataset,
      defaultView,
    ]);
    const setCurrentAction = useCallback(
      (data) => {
        if (data.name === "populate") {
          setRowsData(data?.rows);
          mutation.mutate({
            base_branch_cd: authState?.user?.baseBranchCode ?? "",
            base_comp_cd: authState?.baseCompanyID ?? "",
          });
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
      [navigate, mutation, authState]
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
              extractGridMetaData(productaccess, Modes) as GridMetaDataType
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
