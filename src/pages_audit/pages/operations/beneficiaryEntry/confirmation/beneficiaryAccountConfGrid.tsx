import {
  useRef,
  useCallback,
  useContext,
  Fragment,
  useState,
  useEffect,
} from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import { BeneficiaryAccountConfirmFormWrapper } from "./beneficiaryAccountConfForm";
import { BenefiAccountConfirmGridMetaData } from "./ConfirmationMetadata";
import { AuthContext } from "pages_audit/auth";
import { t } from "i18next";
import {
  utilFunction,
  ClearCacheContext,
  ClearCacheProvider,
  queryClient,
  ActionTypes,
  Alert,
  GridWrapper,
} from "@acuteinfo/common-base";

const actions: ActionTypes[] = [
  {
    actionName: "view-detail",
    actionLabel: t("ViewDetail"),
    multiple: false,
    rowDoubleClick: true,
  },
  {
    actionName: "view-all",
    actionLabel: t("ViewAll"),
    multiple: false,
    rowDoubleClick: true,
    alwaysAvailable: true,
  },
];

const BeneficiAccountConfGrid = () => {
  const { authState } = useContext(AuthContext);
  const indexRef = useRef(1);
  const navigate = useNavigate();
  const isDataChangedRef = useRef(false);
  let currentPath = useLocation().pathname;
  const [paraType, setParaType] = useState("P");
  const [actionMenu, setActionMenu] = useState(actions);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getBenficiaryAccountGridDtlData", paraType], () =>
    API.getBenficiaryAccountGridDtlData({
      COMP_CD: authState?.companyID,
      BRANCH_CD: authState?.user?.branchCode ?? "",
      ACCT_TYPE: "",
      ACCT_CD: "",
      FLAG: paraType,
      WORKING_DATE: authState?.workingDate,
    })
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getBenficiaryAccountGridDtlData", paraType]);
    };
  }, []);

  const setCurrentAction = useCallback((data) => {
    if (data?.name === "view-detail") {
      indexRef.current = Number(data?.rows?.[0].id);
      navigate("view-detail", {
        state: {
          gridData: data?.rows?.[0]?.data,
          index: indexRef.current,
          formMode: "view",
        },
      });
    } else if (data.name === "pending") {
      setActionMenu((values) =>
        values.map((item) =>
          item.actionName === "pending"
            ? { ...item, actionName: "view-all", actionLabel: t("ViewAll") }
            : item
        )
      );
      setParaType("P");
    } else if (data.name === "view-all") {
      setActionMenu((values) =>
        values.map((item) =>
          item.actionName === "view-all"
            ? { ...item, actionName: "pending", actionLabel: "Pending" }
            : item
        )
      );

      setParaType("A");
    }
  }, []);

  const handleDialogClose = () => {
    if (isDataChangedRef.current === true) {
      isDataChangedRef.current = true;
      refetch();
      isDataChangedRef.current = false;
    }
    navigate(".");
  };

  const handlePrev = useCallback(() => {
    navigate(".");
    if (indexRef.current > 1) {
      indexRef.current -= 1;
      const index = indexRef.current;
      setTimeout(() => {
        setCurrentAction({
          name: "view-detail",
          rows: [{ data: data[index - 1], id: String(index) }],
        });
      }, 0);
    }
  }, [data, indexRef.current]);

  const handleNext = useCallback(() => {
    navigate(".");
    const index = indexRef.current++;
    setTimeout(() => {
      setCurrentAction({
        name: "view-detail",
        rows: [{ data: data[index], id: String(index + 1) }],
      });
    }, 0);
  }, [data, indexRef.current]);

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
        key={"BeneficiAccountConfirmGrid" + actionMenu + paraType}
        finalMetaData={BenefiAccountConfirmGridMetaData}
        data={data ?? []}
        setData={() => null}
        loading={isLoading || isFetching}
        actions={actionMenu}
        setAction={setCurrentAction}
        refetchData={refetch}
      />
      <Routes>
        <Route
          path="view-detail/*"
          element={
            <BeneficiaryAccountConfirmFormWrapper
              handleDialogClose={handleDialogClose}
              handlePrev={handlePrev}
              handleNext={handleNext}
              currentIndexRef={indexRef}
              totalData={data?.length ?? 0}
              isDataChangedRef={isDataChangedRef}
              formLabel={utilFunction.getDynamicLabel(
                currentPath,
                authState?.menulistdata,
                true
              )}
            />
          }
        />
      </Routes>
    </>
  );
};
export const BeneficiAccountConfirmGridWrapper = () => {
  return (
    <ClearCacheProvider>
      <BeneficiAccountConfGrid />
    </ClearCacheProvider>
  );
};
