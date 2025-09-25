import React, { useContext, useEffect } from "react";
import { AuthContext } from "pages_audit/auth";
import * as API from "./api";
import { useQuery } from "react-query";
import {
  Alert,
  GridMetaDataType,
  GridWrapper,
  queryClient,
  utilFunction,
} from "@acuteinfo/common-base";
import { UserLoginDtlGridMetaData } from "./Metadata/userLoginDetail";

export const UserDetail = () => {
  const { authState } = useContext(AuthContext);

  const userActivityData = useQuery<any, any, any>(["GETUSERACTIVITY"], () =>
    API.getUserLoginDetails({ userID: authState?.user?.id })
  );
  let newdata = userActivityData?.data?.map((item) => {
    return {
      ...item,
      LOGIN_DT: item?.LOGIN_DT
        ? utilFunction.getParsedDate(item?.LOGIN_DT)
        : "",
      LOGOUT_DT: item?.LOGOUT_DT
        ? utilFunction.getParsedDate(item?.LOGOUT_DT)
        : "",
      RELEASED_DT: item?.RELEASED_DT
        ? utilFunction.getParsedDate(item?.RELEASED_DT)
        : "",
    };
  });

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["GETEMPLOYEEDTL"]);
    };
  }, []);

  return (
    <>
      {userActivityData?.isError ? (
        <Alert
          severity="error"
          errorMsg={
            userActivityData.error?.error_msg ?? "Unknown Error occured"
          }
          errorDetail={userActivityData.error?.error_detail ?? ""}
        />
      ) : null}
      <GridWrapper
        key={`user-Detail`}
        finalMetaData={UserLoginDtlGridMetaData as GridMetaDataType}
        data={newdata ?? []}
        setData={() => null}
        loading={userActivityData.isLoading}
        headerToolbarStyle={{
          background: "var(--theme-color2)",
          color: "black",
        }}
      />
    </>
  );
};
