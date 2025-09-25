import {
  ActionTypes,
  Alert,
  GridWrapper,
  queryClient,
  utilFunction,
} from "@acuteinfo/common-base";
import { Box, Dialog } from "@mui/material";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { releaseGridMetaData } from "./metadata";
import ReleaseSubGrid from "./releaseSubGrid";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import * as API from "../api";
import { AuthContext } from "pages_audit/auth";
import { useCacheWithMutation } from "pages_audit/pages/operations/DailyTransaction/TRNHeaderTabs/cacheMutate";
import * as CommonAPI from "../../api";
import DailyTransTabs from "pages_audit/pages/operations/DailyTransaction/TRNHeaderTabs";
import { useDialogContext } from "pages_audit/pages/operations/payslip-issue-entry/DialogContext";
const actions: ActionTypes[] = [
  {
    actionName: "cancle",
    actionLabel: "Cancel",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "release",
    actionLabel: "Release",
    multiple: true,
    rowDoubleClick: true,
  },
];

const ReleaseMainGrid = ({ setOpenGrid }) => {
  const [cardTabsReq, setCardTabsReq] = useState({});
  const [cardDetails, setCardDetails] = useState([]);
  const navigate = useNavigate();
  const { authState } = useContext(AuthContext);
  const currentPath = useLocation()?.pathname;
  const controllerRef = useRef<AbortController>();
  const [openRelease, setOpenRelease] = useState(false);

  const reqObject = {
    COMP_CD: authState?.companyID,
    BRANCH_CD: authState?.user?.branchCode,
  };
  const {
    error: tabsErorr,
    data: tabsDetails,
    fetchData: fetchTabsData,
    isError: isTabsError,
    isLoading: isTabsLoading,
  }: any = useCacheWithMutation(
    "releaseMainData",
    CommonAPI.getTabsByParentType
  );

  const {
    data,
    isLoading,
    isFetching,
    refetch: refetchMainGrid,
    error,
    isError,
  } = useQuery<any, any>(["releaseMainData", { ...reqObject }], () =>
    API?.getReleaseGridData({ ...reqObject })
  );

  const getCarousalCards = useMutation(CommonAPI.getCarousalCards, {
    onSuccess: (data) => {
      setCardDetails(data);
    },
    onError: (error: any) => {
      setCardDetails([]);
    },
  });
  const { trackDialogClass } = useDialogContext();
  const setCurrentAction = useCallback(
    (data) => {
      let row = data?.rows[0]?.data;
      if (data?.name === "_rowChanged") {
        let obj: any = {
          COMP_CD: row?.COMP_CD,
          ACCT_TYPE: row?.ACCT_TYPE,
          ACCT_CD: row?.ACCT_CD,
          PARENT_TYPE: row?.PARENT_TYPE ?? "",
          PARENT_CODE: row?.PARENT_CODE ?? "",
          BRANCH_CD: row?.BRANCH_CD,
        };
        setCardTabsReq(obj);
        let reqData = {
          COMP_CD: obj?.COMP_CD,
          ACCT_TYPE: obj?.ACCT_TYPE,
          BRANCH_CD: obj?.BRANCH_CD,
        };
        if (controllerRef.current) {
          controllerRef?.current?.abort();
        }
        // Create a new AbortController
        controllerRef.current = new AbortController();
        fetchTabsData({
          cacheId: reqData?.ACCT_TYPE,
          reqData: reqData,
          controllerFinal: controllerRef?.current,
        });
        getCarousalCards?.mutate({
          reqData: obj,
          controllerFinal: controllerRef?.current,
        });
      } else if (data?.name === "cancle") {
        setOpenGrid(false);
      } else if (data?.name === "release") {
        navigate("", {
          state: data?.rows[0]?.data,
        });
        setOpenRelease(true);
        trackDialogClass("ReleaseGrid");
      }
    },
    [actions, navigate]
  );

  const handleRlsSubgridClose = () => {
    setOpenRelease(false);
    trackDialogClass("main");
  };

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["releaseMainData", { ...reqObject }]);
    };
  }, []);

  return (
    <>
      <Box margin={"0px 16px"}>
        <DailyTransTabs
          heading={utilFunction?.getDynamicLabel(
            currentPath,
            authState?.menulistdata,
            true
          )}
          tabsData={tabsDetails}
          cardsData={cardDetails}
          reqData={cardTabsReq}
          screenFlag="RELEASEMAIN"
        />
        {isError ? (
          <Alert
            severity={error?.severity ?? "error"}
            errorMsg={error?.error_msg ?? "Error"}
            errorDetail={error?.error_detail ?? ""}
          />
        ) : null}
        {getCarousalCards?.isError &&
        (!getCarousalCards?.error?.error_msg?.includes("Timeout") ||
          !getCarousalCards?.error?.error_msg?.includes("AbortError")) ? (
          <Alert
            severity={getCarousalCards?.error?.severity ?? "error"}
            errorMsg={getCarousalCards?.error?.error_msg ?? "Error"}
            errorDetail={getCarousalCards?.error?.error_detail ?? ""}
          />
        ) : null}
        {isTabsError ? (
          <Alert
            severity={tabsErorr?.severity ?? "error"}
            errorMsg={tabsErorr?.error_msg ?? "Error"}
            errorDetail={tabsErorr?.error_detail ?? ""}
          />
        ) : null}
        <GridWrapper
          key={`releaseGridMetaData` + isLoading}
          finalMetaData={releaseGridMetaData}
          data={data ?? []}
          loading={
            isLoading ||
            isFetching ||
            isTabsLoading ||
            getCarousalCards?.isLoading
          }
          setData={() => {}}
          actions={actions}
          setAction={setCurrentAction}
          hideHeader={false}
          refetchData={() => refetchMainGrid()}
          disableMultipleRowSelect={true}
          enableExport={true}
          defaultSelectedRowId={data?.length > 0 ? data?.[0]?.MCT_TRAN_CD : ""}
        />
      </Box>

      {openRelease ? (
        <Dialog
          open={true}
          fullWidth={true}
          onKeyUp={(event) => {
            if (event.key === "Escape") handleRlsSubgridClose();
          }}
          PaperProps={{
            style: {
              width: "100%",
              overflow: "auto",
            },
          }}
          maxWidth="lg"
        >
          <ReleaseSubGrid
            handleRlsSubClose={handleRlsSubgridClose}
            refetchMainGrid={refetchMainGrid}
          />
        </Dialog>
      ) : null}
    </>
  );
};

export default ReleaseMainGrid;
