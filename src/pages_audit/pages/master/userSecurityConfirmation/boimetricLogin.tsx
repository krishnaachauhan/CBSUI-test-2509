import { AuthContext } from "pages_audit/auth";
import { forwardRef, Fragment, useContext } from "react";
import { useQuery } from "react-query";
import * as API from "./api";
import { biometric, loginShift } from "./metaDataGrid";
import { GridWrapper, GridMetaDataType } from "@acuteinfo/common-base";

export const BiometricLoginConfirmation = forwardRef<any, any>(
  ({ userId }, ref) => {
    let Username = userId?.USER_NAME;
    const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
      any,
      any
    >(["getBiometric", Username], () =>
      API.getBiometric({
        userid: Username,
      })
    );
    return (
      <Fragment>
        <GridWrapper
          key={`LoginShift`}
          finalMetaData={biometric as GridMetaDataType}
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
