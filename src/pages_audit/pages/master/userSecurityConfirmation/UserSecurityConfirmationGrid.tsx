import { Fragment, useCallback, useContext, useEffect, useState } from "react";
import { SecurityUserConfirmationGrid } from "./metaDataGrid";
import * as API from "./api";
import { useQuery } from "react-query";
import { Route, Routes, useNavigate } from "react-router-dom";
import { SecurityContextWrapper } from "../usersecurity/context/SecuityForm";
import Steppers from "../usersecurity/stepper/stepper";
import {
  ClearCacheContext,
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  queryClient,
} from "@acuteinfo/common-base";

const actions: ActionTypes[] = [
  {
    actionName: "confirmation",
    actionLabel: "View-Detail",
    multiple: false,
    rowDoubleClick: true,
  },
];
const SecurityUserConfirmation = () => {
  const { getEntries } = useContext(ClearCacheContext);
  const [rowsData, setRowsData] = useState([]);
  const navigate = useNavigate();
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getPendingSecurityUserData"], () => API.getPendingSecurityUserData());
  const setCurrentAction = useCallback(
    async (data) => {
      if (data.name === "confirmation") {
        setRowsData(data?.rows);
        navigate(data.name, {
          state: data?.rows,
        });
      } else {
        navigate(data?.name, { state: data?.rows });
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
      queryClient.removeQueries(["getPendingSecurityUserData"]);
    };
  }, [getEntries]);
  return (
    <Fragment>
      <GridWrapper
        key={`SecurityUserConfirmationGrid`}
        finalMetaData={SecurityUserConfirmationGrid as GridMetaDataType}
        actions={actions}
        setAction={setCurrentAction}
        data={data ?? []}
        loading={isFetching || isLoading}
        refetchData={() => refetch()}
        setData={() => {}}
        hideHeader={true}
      />
    </Fragment>
  );
};
const UserSecurityConfirmationWrapper = () => {
  return (
    <SecurityContextWrapper>
      <Routes>
        <Route
          path="confirmation"
          element={<Steppers defaultView={"view"} flag={"viewMode"} />}
        />
        <Route path="/*" element={<SecurityUserConfirmation />} />
      </Routes>
    </SecurityContextWrapper>
  );
};

export default UserSecurityConfirmationWrapper;
