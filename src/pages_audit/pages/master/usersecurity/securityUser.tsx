import { UserSecurity } from "./metaDataGrid";
import { Fragment, useCallback, useContext, useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import * as API from "./api";
import { Typography } from "@mui/material";
import { SecurityContextWrapper } from "./context/SecuityForm";
import Steppers from "./stepper/stepper";

import {
  ClearCacheContext,
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  queryClient,
} from "@acuteinfo/common-base";
import { t } from "i18next";
import { AuthContext } from "pages_audit/auth";

const actions: ActionTypes[] = [
  {
    actionName: "add",
    actionLabel: "Add",
    multiple: undefined,
    alwaysAvailable: true,
    rowDoubleClick: false,
  },
  {
    actionName: "edit",
    actionLabel: "Edit Detail",
    multiple: false,
    alwaysAvailable: false,
    rowDoubleClick: true,
  },
];

const Securityuser = () => {
  const navigate = useNavigate();
  const { getEntries } = useContext(ClearCacheContext);
  const { authState } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [intialAction, setintialAction] = useState(actions);
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getSecurityUserGrid"], () =>
    API.getSecurityUserGrid({
      USERROLE: authState?.role,
      USERNAME: authState?.user?.id,
    })
  );
  useEffect(() => {
    if (authState?.hoLogin !== "Y") {
      setintialAction([
        {
          actionName: "edit",
          actionLabel: "Edit Detail",
          multiple: false,
          alwaysAvailable: false,
          rowDoubleClick: true,
        },
      ]);
    } else {
      setintialAction([
        {
          actionName: "add",
          actionLabel: "Add",
          multiple: undefined,
          alwaysAvailable: true,
          rowDoubleClick: false,
        },
        {
          actionName: "edit",
          actionLabel: "Edit Detail",
          multiple: false,
          alwaysAvailable: false,
          rowDoubleClick: true,
        },
      ]);
    }
  }, [actions]);
  const setCurrentAction = useCallback(
    (data) => {
      const queriesForClear = [
        "getapplicationaccess",
        "getUserAccessBranch",
        "getproductaccess",
        "getLoginShiftAccess",
        "getBiometric",
      ];
      queriesForClear.forEach((key) => {
        queryClient.removeQueries(key);
      });
      if (data.name === "add") {
        navigate(data.name);
      } else if (data.name === "edit") {
        navigate(data.name, {
          state: data?.rows,
        });
      } else {
        navigate(data?.name);
      }
    },
    [navigate]
  );
  useEffect(() => {
    return () => {
      let entries = getEntries() as any[];
      if (Array.isArray(entries) && entries.length > 0) {
        entries.forEach((one) => {
          queryClient.removeQueries(one);
        });
      }
      queryClient.removeQueries(["getSecurityUserGrid"]);
    };
  }, [getEntries]);
  return (
    <Fragment>
      {isError && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? t("Somethingwenttowrong")}
          errorDetail={error?.error_detail}
          color="error"
        />
      )}
      <GridWrapper
        key={`SecurityUserGrid` + intialAction}
        finalMetaData={UserSecurity as GridMetaDataType}
        data={data ?? []}
        actions={intialAction}
        loading={isFetching || isLoading}
        setData={() => null}
        setAction={setCurrentAction}
        refetchData={() => refetch()}
      />
    </Fragment>
  );
};

const UserSecurityWrapper = () => {
  return (
    <SecurityContextWrapper>
      <Routes>
        <Route
          path="add"
          element={<Steppers defaultView={"new"} flag={"addMode"} />}
        />
        <Route
          path="edit"
          element={<Steppers defaultView={"view"} flag={"editMode"} />}
        />
        <Route path="/*" element={<Securityuser />} />
      </Routes>
    </SecurityContextWrapper>
  );
};

export default UserSecurityWrapper;
