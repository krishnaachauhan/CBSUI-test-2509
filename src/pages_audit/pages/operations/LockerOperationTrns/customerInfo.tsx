import {
  GridMetaDataType,
  GridWrapper,
  Alert,
  queryClient,
  ActionTypes,
} from "@acuteinfo/common-base";
import { useCallback, useContext, useEffect } from "react";
import { useQuery } from "react-query";
import * as API from "./api";
import { AuthContext } from "pages_audit/auth";
import { t } from "i18next";
import { useEnter } from "components/custom/useEnter";
import { customerLockerInfoMetadata } from "./gridMetaData";
import { Dialog } from "@mui/material";
const actions: ActionTypes[] = [
  {
    actionName: "close",
    actionLabel: "Close",
    multiple: undefined,
    alwaysAvailable: true,
  },
];
const CustomerInfo = ({ open, closeDialog }) => {
  const { authState } = useContext(AuthContext);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getCustomerLockerInfo"], () =>
    API.getCustomerLockerInfo({
      WORKING_DATE: authState?.workingDate,
      BRANCH_CD: authState?.user?.branchCode,
      COMP_CD: authState?.companyID,
    })
  );
  const setCurrentAction = useCallback(async (data) => {
    if (data?.name === "close") {
      closeDialog();
    }
  }, []);
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getCustomerLockerInfo"]);
    };
  }, []);
  useEnter("main");
  return (
    <div className="main">
      <Dialog
        open={true}
        PaperProps={{
          style: {
            width: "100%",
            overflow: "auto",
          },
        }}
        maxWidth="xl"
      >
        {isError && (
          <Alert
            severity="error"
            errorMsg={error?.error_msg ?? t("Somethingwenttowrong")}
            errorDetail={error?.error_detail}
            color="error"
          />
        )}
        <GridWrapper
          key={"getCustomerLockerInfo"}
          finalMetaData={customerLockerInfoMetadata as GridMetaDataType}
          data={data ?? []}
          setData={() => null}
          actions={actions ?? []}
          loading={isLoading || isFetching}
          setAction={setCurrentAction}
          refetchData={() => refetch()}
        />
      </Dialog>
    </div>
  );
};

export default CustomerInfo;
