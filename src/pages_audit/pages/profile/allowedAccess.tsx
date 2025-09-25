import React, { useContext, useEffect } from "react";
import { AuthContext } from "pages_audit/auth";
import { useQuery } from "react-query";
import { Grid } from "@mui/material";
import * as API from "./api";
import {
  Alert,
  GridWrapper,
  GridMetaDataType,
  queryClient,
} from "@acuteinfo/common-base";
import { userAccesstypeMetadata } from "./Metadata/userAccessType";
import { userAccessbranchMetadata } from "./Metadata/userAccessBranch";

export const AllowedAccess = () => {
  const { authState } = useContext(AuthContext);

  const userAccessBranch = useQuery<any, any, any>(["GETUSERACESSBRNCH"], () =>
    API.getUserAccessBranch({ userID: authState?.user?.id })
  );

  const userAccessType = useQuery<any, any, any>(["GETUSERACESSTYPE"], () =>
    API.getUserAccessType({ userID: authState?.user?.id })
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["GETUSERACESSBRNCH"]);
      queryClient.removeQueries(["GETUSERACESSTYPE"]);
    };
  }, []);

  return (
    <>
      <Grid
        container
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 1,
          height: "fit-content",
        }}
      >
        <Grid
          item
          xs={5.9}
          md={5.9}
          sx={{
            boxShadow:
              "rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset",
          }}
        >
          {userAccessBranch?.isError ? (
            <Alert
              severity="error"
              errorMsg={
                userAccessBranch.error?.error_msg ?? "Unknown Error occured"
              }
              errorDetail={userAccessBranch.error?.error_detail ?? ""}
            />
          ) : null}
          <GridWrapper
            key={`user-Access-branch` + userAccessBranch.isSuccess}
            finalMetaData={userAccessbranchMetadata as GridMetaDataType}
            data={userAccessBranch.data || []}
            setData={() => null}
            loading={userAccessBranch.isLoading}
            headerToolbarStyle={{
              background: "var(--theme-color2)",
              color: "black",
              fontSize: "20px",
            }}
          />
        </Grid>
        <Grid
          item
          xs={5.9}
          md={5.9}
          sx={{
            boxShadow:
              "rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset",
          }}
        >
          {userAccessType?.isError ? (
            <Alert
              severity="error"
              errorMsg={
                userAccessType.error?.error_msg ?? "Unknown Error occured"
              }
              errorDetail={userAccessType.error?.error_detail ?? ""}
            />
          ) : null}
          <GridWrapper
            key={`user-Access-type` + userAccessType.isSuccess}
            finalMetaData={userAccesstypeMetadata as GridMetaDataType}
            data={userAccessType.data || []}
            setData={() => null}
            loading={userAccessType.isLoading}
            headerToolbarStyle={{
              background: "var(--theme-color2)",
              color: "black",
              fontSize: "20px",
            }}
          />
        </Grid>
      </Grid>
    </>
  );
};
