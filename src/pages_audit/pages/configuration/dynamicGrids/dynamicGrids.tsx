import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useMutation, useQueries, useQuery } from "react-query";
import * as API from "./api";
import { AuthContext } from "pages_audit/auth";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import {
  PopupMessageAPIWrapper,
  ActionTypes,
  LoaderPaperComponent,
  Alert,
  queryClient,
  GridWrapper,
  GridMetaDataType,
} from "@acuteinfo/common-base";
import { DynamicFormWrapper } from "../dynamicFormWrapper/dynamicFormwrapper";

interface updateAUTHDetailDataType {
  DOC_CD: any;
  COMP_CD: any;
  BRANCH_CD: any;
}
const updateAUTHDetailDataWrapperFn =
  (updateAUTHDetailData) =>
  async ({ DOC_CD, COMP_CD, BRANCH_CD }: updateAUTHDetailDataType) => {
    return updateAUTHDetailData({ DOC_CD, COMP_CD, BRANCH_CD });
  };
const actions: ActionTypes[] = [];
export const DynamicGrids = () => {
  const { authState } = useContext(AuthContext);
  const isDataChangedRef = useRef(false);
  const isDeleteDataRef = useRef<any>(null);
  const [isDelete, SetDelete] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const docID = id;
  const { enqueueSnackbar } = useSnackbar();
  const {
    data: metaData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<any, any>(["getDynamicGridMetaData", docID], () =>
    API.getDynamicGridMetaData({
      docID,
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
    })
  );

  const docCd = metaData?.DOC_CD ?? "";
  const result = useQueries([
    {
      queryKey: ["getDynGridData", docCd],
      queryFn: () =>
        API.getDynGridData({
          doccd: docCd || "",
          companyID: authState?.companyID ?? "",
          branchID: authState?.user?.branchCode ?? "",
          userRole: authState?.role ?? "",
          userName: authState?.user?.name ?? "",
        }),
    },
  ]);

  const loading = result[0].isLoading || result[0].isFetching;
  const mutation = useMutation(
    updateAUTHDetailDataWrapperFn(API.getDynActionButtonData),
    {
      onError: (error: any) => {},
      onSuccess: (data) => {},
    }
  );

  const deleteMutation = useMutation(API.getDynamicFormData(), {
    onError: (error: any) => {},
    onSuccess: (data) => {
      isDataChangedRef.current = true;
      enqueueSnackbar("Records successfully deleted", {
        variant: "success",
      });
      // closeDialog();
      SetDelete(false);
      result[0]?.refetch();
      // refetch();
    },
  });

  useEffect(() => {
    if (!mutation?.isLoading) {
      const newActions = (mutation?.data || []).map((item) => {
        // Check the conditions before mapping
        if (
          (metaData?.USER_ACC_INS > authState?.role &&
            item?.actionName === "Add") ||
          (metaData?.USER_ACC_UPD > authState?.role &&
            item?.actionName === "View-Detail") ||
          (metaData?.USER_ACC_DEL > authState?.role &&
            item?.actionName === "Delete")
        ) {
          return null;
        } else {
          return {
            actionName: item.actionName,
            actionLabel: item.actionLabel,
            multiple:
              item?.actionLabel === "Add"
                ? (item.multiple = undefined)
                : item.multiple,
            rowDoubleClick: item.rowDoubleClick,
            alwaysAvailable: item.alwaysAvailable,
          };
        }
      });

      actions.length = 0;
      actions.push(...newActions.filter(Boolean));
    }
  }, [
    actions,
    mutation?.data,
    metaData?.USER_ACC_INS,
    metaData?.USER_ACC_UPD,
    metaData?.USER_ACC_DEL,
    authState?.role,
  ]);

  const setCurrentAction = useCallback(
    (data) => {
      if (data?.name === "Delete") {
        isDeleteDataRef.current = data?.rows?.[0];
        SetDelete(true);
      } else {
        navigate(data?.name, {
          state: data?.rows,
        });
      }
    },
    [navigate]
  );
  // const setCurrentAction = useCallback(
  //   (data) => {
  //     navigate(data?.name, {
  //       state: data?.rows,
  //     });
  //   },
  //   [navigate]
  // );
  const handleDialogClose = () => {
    if (isDataChangedRef.current === true) {
      isDataChangedRef.current = true;
      result[0]?.refetch();
      isDataChangedRef.current = false;
    }
    navigate(".");
  };

  useEffect(() => {
    if (docCd || "" === null) {
      const mutationArguments: any = {
        DOC_CD: docCd || "",
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
      };
      mutation.mutate(mutationArguments);
    }
  }, [docCd]);
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getDynamicGridMetaData", docID]);
      queryClient.removeQueries(["getDynGridData"]);
    };
  }, [docID]);
  const onAcceptDelete = (rows) => {
    deleteMutation.mutate({ ...rows?.data, _isDeleteRow: true, DOC_CD: docID });
  };

  return (
    <>
      {isLoading || isFetching ? (
        <LoaderPaperComponent />
      ) : isError ? (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? "Error"}
          errorDetail={""}
          color="error"
        />
      ) : (
        <>
          <GridWrapper
            key={`DynamicGrid` + docID + actions}
            finalMetaData={metaData as GridMetaDataType}
            data={result[0].data ?? []}
            setData={() => null}
            loading={loading || isLoading}
            actions={actions}
            setAction={setCurrentAction}
            refetchData={() => result[0].refetch()}
            // refetchData={() => refetch()}

            // ref={myGridRef}
          />
        </>
      )}
      <Routes>
        {(mutation?.data || []).map((item) => {
          if (item.actionName === "Delete") {
            return null;
          }
          return (
            <Route
              key={item.actionName}
              path={`/${item.actionName}`}
              element={
                <DynamicFormWrapper
                  handleDialogClose={handleDialogClose}
                  isDataChangedRef={isDataChangedRef}
                  item={item}
                  docID={docID}
                  existingData={result[0].data}
                  defaultView={item.actionName === "Add" ? "add" : "view"}
                  alertMessage={item?.ALRT_MSG}
                />
              }
            />
          );
        })}
      </Routes>

      {/* <Routes>
        {(mutation?.data || []).map((item) => (
          <Route
            key={item.actionName}
            path={`/${item.actionName}`}
            element={
              <DynamicFormWrapper
                handleDialogClose={handleDialogClose}
                isDataChangedRef={isDataChangedRef}
                item={item}
                docID={docID}
                gridData={result?.[0]}
              />
            }
          />
        ))}
      </Routes> */}
      {isDelete ? (
        <PopupMessageAPIWrapper
          MessageTitle="Confirmation"
          Message="Are you sure to delete selected row?"
          onActionYes={(rows) => onAcceptDelete(rows)}
          onActionNo={() => SetDelete(false)}
          rows={isDeleteDataRef.current}
          open={isDelete}
          loading={mutation.isLoading}
        />
      ) : null}
    </>
  );
};
