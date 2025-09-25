import { AuthContext } from "pages_audit/auth";
import { forwardRef, Fragment, useContext } from "react";
import { useQuery } from "react-query";
import * as API from "./api";
import { loginShift } from "./metaDataGrid";
import { GridWrapper, GridMetaDataType } from "@acuteinfo/common-base";

export const LoginShiftConfirmation = forwardRef<any, any>(
  ({ userId }, ref) => {
    let Username = userId?.USER_NAME;
    console.log(userId);

    const { authState } = useContext(AuthContext);
    const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
      any,
      any
    >(["getLoginShiftAccess", Username], () =>
      API.getLoginShiftAccess({
        userid: Username,
        comp_cd: authState?.companyID,
      })
    );
    return (
      <Fragment>
        <GridWrapper
          key={`LoginShift`}
          finalMetaData={loginShift as GridMetaDataType}
          data={data || []}
          loading={isFetching || isLoading}
          setData={() => {}}
          hideHeader={true}
          ref={ref}
          refetchData={() => {
            refetch();
          }}
        />
      </Fragment>
    );
  }
);
