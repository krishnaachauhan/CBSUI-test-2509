import { DashboardLayout } from "./dashboard-layout";
import { Box, Card, CardContent, Fab } from "@mui/material";
import { DashboardBox } from "components/dashboard/dashboardBox";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import { Fragment, useContext, useState } from "react";
import { QuickAccessTableGridWrapper } from "./QuickAccessTableGrid/QuickAccessTableGrid";
import Grid from "@mui/material/Grid";
import { TodaysTransactionTableGridWrapper } from "./Today'sTransactionGrid/TodaysTransactionTableGrid";
import { useEffect } from "react";
import { Transactions } from "components/dashboard/transactions";
import { AccountStatus } from "components/dashboard/account-status";

import { AuthContext } from "pages_audit/auth";
import { MessageBox } from "components/dashboard/messageBox/messageBox";
import {
  queryClient,
  LoaderPaperComponent,
  Alert,
} from "@acuteinfo/common-base";
import { useTranslation } from "react-i18next";
interface updateAUTHDetailDataType {
  userID: any;
  COMP_CD: any;
  BRANCH_CD: any;
  A_FLAG?: any;
}

const updateAUTHDetailDataWrapperFn =
  (updateMasterData) => async (req: any) => {
    return updateMasterData(req);
  };

const Dashboard = () => {
  const { authState } = useContext(AuthContext);
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getDashboardData"], () => API.getDashboardData());
  const [optionValue, setOptionValue] = useState("T");

  const mutation = useMutation(
    updateAUTHDetailDataWrapperFn(API.TodaysTransactionTableGrid),
    {
      onError: (error: any) => {},
      onSuccess: (data) => {},
    }
  );
  useEffect(() => {
    if (data?.[0]?.CHART1?.ISVISIBLE) {
      const mutationArguments: any = {
        USERNAME: authState?.user?.id ?? "",
        USERROLE: authState?.role ?? "",
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        A_FLAG: optionValue,
      };
      mutation.mutate(mutationArguments);
    }
  }, [data?.[0]?.CHART1?.ISVISIBLE, optionValue]);
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getDashboardData"]);
      queryClient.removeQueries(["TodaysTransactionTableGrid"]);
    };
  }, []);

  // const handleClick = () => {
  //   setIsOpenSave(true);
  //   // console.log("test");
  // };
  // const handleDialogClose = () => {
  //   // console.log("test");
  //   setIsOpenSave(false);
  // };

  const { t } = useTranslation();
  return (
    <>
      <Box
        component="main"
        sx={{
          background: "rgba(250, 251, 255, 0.9)",
          // height: "83vh",
          flexGrow: 1,
        }}
      >
        <div style={{ padding: "15px 10px 0 10px" }}>
          <Grid container spacing={2}>
            {isLoading || isFetching ? (
              <Grid item lg={12} md={12} xl={12} xs={12}>
                <LoaderPaperComponent />
              </Grid>
            ) : isError ? (
              <Fragment>
                <div style={{ width: "100%", paddingTop: "10px" }}>
                  <Alert
                    severity={error?.severity ?? "error"}
                    errorMsg={error?.error_msg ?? "Error"}
                    errorDetail={error?.error_detail ?? ""}
                  />
                </div>
              </Fragment>
            ) : (
              <>
                {/* {data?.[0]?.BOXES?.map((item, index) => (
                  <Grid item xl={3} lg={3} sm={6} md={4} xs={12} key={index}>
                    <DashboardBox
                      key={"board" + index}
                      body={item?.DEFAULT_VAL}
                      title={item?.TITLE}
                      isSequencs={item?.DISPLAY_SEQ}
                      icon={item?.ICON}
                      isBackground={item?.BACKGROUND_COLOUR}
                      apiName={item?.API_NAME}
                    />
                  </Grid>
                ))} */}
                {Array.from(Array(8)).map((_, index) => {
                  const item = data?.[0]?.BOXES?.[index];
                  const isVisible = !!item;

                  const seqKey = item?.DISPLAY_SEQ
                    ? `DisplaySeq${item.DISPLAY_SEQ}`
                    : null;
                  const titleKey =
                    seqKey && t(seqKey) !== seqKey ? t(seqKey) : item?.TITLE;

                  return (
                    <Grid
                      item
                      xl={3}
                      lg={3}
                      sm={6}
                      md={4}
                      xs={12}
                      key={index}
                      style={{
                        ...(isVisible && {
                          borderBottom: "2px solid #EBEDEE",
                          borderRight: "2px solid #EBEDEE",
                          paddingRight: "10px",
                          paddingBottom: "10px",
                          paddingTop: "10px",
                        }),
                        ...(!isVisible &&
                          data?.[0]?.BOXES?.length >= 5 && {
                            height: "100px",
                            width: "100%",
                            backgroundColor: "transparent",
                          }),
                      }}
                    >
                      {isVisible ? (
                        <DashboardBox
                          key={"board" + index}
                          body={item.DEFAULT_VAL}
                          title={titleKey}
                          isSequencs={item.DISPLAY_SEQ}
                          icon={item.ICON}
                          isBackground={item.BACKGROUND_COLOUR}
                          apiName={item.API_NAME}
                          visibility={!isVisible}
                        />
                      ) : null}
                    </Grid>
                  );
                })}

                {data?.[0]?.QUICK_ACCESS?.ISVISIBLE ? (
                  <Grid item lg={8} md={12} xl={8} xs={12}>
                    <Box
                      className="quick-access-card"
                      sx={{
                        background: "var(--theme-color2)",
                        border: "2px solid #EBEDEE",
                        borderRadius: "20px",
                        padding: "05px",
                      }}
                    >
                      <QuickAccessTableGridWrapper />
                    </Box>
                  </Grid>
                ) : null}
                {data?.[0]?.MESSAGE_BOX?.ISVISIBLE ? (
                  <Grid item lg={4} md={12} xl={4} xs={12}>
                    <Card
                      className="notification-card"
                      style={{
                        borderRadius: "20px",
                        boxShadow: "0px 11px 70px rgba(226, 236, 249, 0.5)",
                        overflowY: "auto",
                      }}
                    >
                      <CardContent style={{ padding: "10px", height: "486px" }}>
                        <Grid item lg={12} md={12} xl={12} xs={12}>
                          <MessageBox screenFlag={"Announcement"} />
                          <MessageBox screenFlag={"Tips"} />
                          <MessageBox screenFlag={"Notes"} />
                          <MessageBox screenFlag={"Alert"} />
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ) : null}
                {data?.[0]?.CHART1?.ISVISIBLE ? (
                  <Grid item lg={8} md={12} xl={8} xs={12}>
                    <Transactions
                      mutation={mutation}
                      optionValue={optionValue}
                      setOptionValue={setOptionValue}
                    />
                  </Grid>
                ) : null}
                {data?.[0]?.CHART2?.ISVISIBLE ? (
                  <Grid item lg={4} md={12} xl={4} xs={12}>
                    <AccountStatus sx={{ height: "100%" }} />
                  </Grid>
                ) : null}
                {/* {data?.[0]?.TODAY_TRN?.ISVISIBLE ? (
                  <Grid item lg={12} md={12} xl={12} xs={12}>
                    <Box
                      className="transaction-details-card"
                      sx={{
                        background: "var(--theme-color2)",
                        // border: "2px solid #EBEDEE",
                        boxShadow: "0px 11px 70px rgba(226, 236, 249, 0.5)",
                        borderRadius: "20px",
                        marginTop: "10px",
                        padding: "10px",
                      }}
                    >
                      <TodaysTransactionTableGridWrapper mutation={mutation} />
                    </Box>
                  </Grid>
                ) : null} */}
              </>
            )}
          </Grid>
        </div>
      </Box>
    </>
  );
};

Dashboard.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Dashboard;
