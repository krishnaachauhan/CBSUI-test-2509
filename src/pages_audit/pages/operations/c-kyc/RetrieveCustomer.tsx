import { AppBar, Dialog, Grid, Toolbar, Typography } from "@mui/material";
import { CustRetrieveFormMetadata, ckyc_retrieved_meta_data } from "./metadata";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useMutation } from "react-query";
import { AuthContext } from "pages_audit/auth";
import * as API from "./api";

import {
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  FormWrapper,
  MetaDataType,
  InitialValuesType,
  usePopupContext,
} from "@acuteinfo/common-base";
import FormModal from "./formModal/formModal";
import InsuranceComp from "./InsuranceComp";
import BankDTLComp from "./BankDTLComp";
import CreditCardDTLComp from "./CreditCardDTLComp";
import OffencesDTLComp from "./OffencesDTLComp";
import AssetDTLComp from "./AssetDTLComp";
import FinancialDTLComp from "./FinancialDTLComp";
import Dependencies from "pages_audit/acct_Inquiry/dependencies";
import ControllingPersonComp from "./ControllingPersonComp";
import { getdocCD } from "components/utilFunction/function";
import { CkycContext } from "./CkycContext";
import { t } from "i18next";
import ClonedCkycProvider, {
  ClonedCkycContext,
} from "./formModal/formDetails/formComponents/legalComps/ClonedCkycContext";
import { PaperComponent } from "../DailyTransaction/TRN001/components";

const RetrieveCustomer = ({ isModal }) => {
  const navigate = useNavigate();
  const { authState } = useContext(AuthContext);
  const [rowsData, setRowsData] = useState<any[]>([]);
  const [formErr, setFormErr] = useState<{
    severity: any;
    error_msg: string;
    error_detail?: string;
  } | null>(null);

  const { state, handleUpdCustRetData } = useContext(
    isModal ? ClonedCkycContext : CkycContext
  );
  const retrieveFormRef = useRef<any>(null);
  const [formData, setFormData] = useState<any>({});
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const { MessageBox } = usePopupContext();
  const routeLocation = useLocation();
  const path = routeLocation.pathname;
  const shouldHideMainUI = path.includes("view-detail");
  const allowUpdateRef = useRef({
    allowDocUpdate: true,
    allowPhotoUpdate: true,
    allowTabsUpdate: true,
    allowTDSUpdate: true,
  });

  const actions: ActionTypes[] = [
    {
      actionName: "view-detail",
      actionLabel: "View Detail",
      multiple: false,
      rowDoubleClick: true,
    },
    // {
    //   actionName: "insurance",
    //   actionLabel: "Insurance",
    //   multiple: false,
    //   rowDoubleClick: false,
    // },
    // {
    //   actionName: "bank-details",
    //   actionLabel: "Bank Details",
    //   multiple: false,
    //   rowDoubleClick: false,
    // },
    // {
    //   actionName: "credit-card",
    //   actionLabel: "Credit Card",
    //   multiple: false,
    //   rowDoubleClick: false,
    // },
    // {
    //   actionName: "offences-details",
    //   actionLabel: "Offences",
    //   multiple: false,
    //   rowDoubleClick: false,
    // },
    // {
    //   actionName: "asset-details",
    //   actionLabel: "Asset Details",
    //   multiple: false,
    //   rowDoubleClick: false,
    // },
    // {
    //   actionName: "financial-details",
    //   actionLabel: "Financial Details",
    //   multiple: false,
    //   rowDoubleClick: false,
    // },
    {
      actionName: "dependencies",
      actionLabel: "Dependencies",
      multiple: false,
      rowDoubleClick: false,
    },
    // {
    //   actionName: "controlling-person-details",
    //   actionLabel: "Controlling Person",
    //   multiple: false,
    //   rowDoubleClick: false,
    // },
  ];

  const setCurrentAction = useCallback(
    async (data) => {
      if (data?.name === "view-detail") {
        if (data?.rows?.[0]?.data?.CUSTOMER_TYPE === "") {
          const btnName = await MessageBox({
            messageTitle: "ValidationFailed",
            message: t("CustomerTypeNotFound", {
              customerId: data?.rows?.[0]?.data?.CUSTOMER_ID,
            }),
            icon: "ERROR",
          });
        } else {
          setRowsData(data?.rows);
          if (isModal) return;
          navigate(data?.name, {
            state: data?.rows,
          });
        }
      } else {
        setRowsData(data?.rows);
        if (isModal) return;
        navigate(data?.name, {
          state: data?.rows,
        });
      }
    },
    [navigate]
  );

  const mutation: any = useMutation(API.getRetrieveData, {
    onSuccess: (data) => {
      handleUpdCustRetData(data);
    },
    onError: (error: any) => {},
  });

  const onSubmitHandler = (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag,
    hasError
  ) => {
    const allValuesEmpty = Object?.values(data)?.every(
      (value: any) => !Boolean(value) || value?.trim() === ""
    );

    if (Boolean(allValuesEmpty)) {
      setFormErr({
        severity: "error",
        error_msg: t("PleaseEnterAnyValue"),
      });
    } else {
      setFormErr({
        severity: "",
        error_msg: "",
      });
      let A_PARA: any[] = [];
      Object.keys(data).forEach((fieldKey) => {
        if (Boolean(data[fieldKey])) {
          A_PARA.push({
            COL_NM: fieldKey,
            COL_VAL: data[fieldKey],
          });
        }
      });
      setFormData(data);
      let reqData = {
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        A_PARA: A_PARA,
      };
      mutation.mutate(reqData);
    }
    endSubmit(true);
  };

  useEffect(() => {
    return () => {
      handleUpdCustRetData([]);
    };
  }, []);

  return (
    <Grid>
      {mutation.isError && (
        <Alert
          severity={mutation.error?.severity ?? "error"}
          errorMsg={mutation.error?.error_msg ?? "Something went to wrong.."}
          errorDetail={mutation.error?.error_detail}
          color="error"
        />
      )}
      {!shouldHideMainUI && (
        <>
          <Grid
            sx={{
              backgroundColor: "var(--theme-color2)",
              padding: (theme) => theme.spacing(1),
              boxSizing: "border-box",
              border: (theme) => `2px dashed ${theme.palette.grey[500]}`,
              borderRadius: "20px",
              margin: "0 0 10px 0",
            }}
            my={(theme) => theme.spacing(3)}
            direction={"column"}
          >
            {formErr?.error_msg && (
              <Alert
                severity={formErr.severity ?? "error"}
                errorMsg={formErr.error_msg}
                errorDetail={formErr.error_detail}
              />
            )}
            <div
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  let event: any = { preventDefault: () => {} };
                  retrieveFormRef?.current?.handleSubmit(event);
                }
              }}
            >
              <AppBar
                position="relative"
                color="secondary"
                sx={{ boxShadow: "none", backgroundColor: "inherit" }}
              >
                <Toolbar variant="dense">
                  <Typography
                    component="div"
                    variant="h6"
                    sx={{ color: "var(--theme-color3)" }}
                  >
                    {t("RetrieveTitle")}
                  </Typography>
                </Toolbar>
              </AppBar>
              <FormWrapper
                key={`custRetrieveForm` + formData}
                metaData={CustRetrieveFormMetadata as MetaDataType}
                initialValues={formData as InitialValuesType}
                onSubmitHandler={onSubmitHandler}
                formState={{
                  state,
                  authState,
                  MessageBox,
                  loading: mutation.isLoading || mutation.isFetching,
                }}
                formStyle={{
                  height: "auto",
                }}
                onFormButtonClickHandel={(buttonId) => {
                  if (buttonId === "RETRIEVE") {
                    let event: any = { preventDefault: () => {} };
                    retrieveFormRef?.current?.handleSubmit(event);
                  }
                }}
                hideHeader={true}
                ref={retrieveFormRef}
              />
            </div>
          </Grid>

          <GridWrapper
            key={`RetrieveCustEntries`}
            finalMetaData={ckyc_retrieved_meta_data as GridMetaDataType}
            data={state?.custRetData ?? []}
            setData={() => null}
            loading={mutation.isLoading || mutation.isFetching}
            actions={actions}
            setAction={setCurrentAction}
            // refetchData={() => refetch()}
            // ref={myGridRef}
          />
        </>
      )}

      <Routes>
        <Route
          path="view-detail/*"
          element={
            <FormModal
              onClose={() => navigate(".")}
              formmode={"view"}
              from={"retrieve-entry"}
              setRetFormData={setFormData}
            />
          }
        />

        <Route
          path="insurance/*"
          element={
            <InsuranceComp
              // rowsData={rowsData}
              open={true}
              onClose={() => {
                // setInsuranceOpen(false)
                navigate(".");
              }}
            />
          }
        />
        <Route
          path="bank-details/*"
          element={
            <BankDTLComp
              // rowsData={rowsData}
              open={true}
              onClose={() => {
                navigate(".");
              }}
            />
          }
        />

        <Route
          path="credit-card/*"
          element={
            <CreditCardDTLComp
              // rowsData={rowsData}
              open={true}
              onClose={() => {
                navigate(".");
              }}
            />
          }
        />

        <Route
          path="offences-details/*"
          element={
            <OffencesDTLComp
              // rowsData={rowsData}
              open={true}
              onClose={() => {
                navigate(".");
              }}
            />
          }
        />

        <Route
          path="asset-details/*"
          element={
            <AssetDTLComp
              // rowsData={rowsData}
              open={true}
              onClose={() => {
                navigate(".");
              }}
            />
          }
        />

        <Route
          path="financial-details/*"
          element={
            <FinancialDTLComp
              // rowsData={rowsData}
              open={true}
              onClose={() => {
                navigate(".");
              }}
            />
          }
        />

        <Route
          path="dependencies/*"
          element={
            <Dependencies
              rowsData={rowsData}
              open={true}
              screenRef={docCD}
              onClose={() => {
                navigate(".");
              }}
            />
          }
        />

        <Route
          path="controlling-person-details/*"
          element={
            <ControllingPersonComp
              // rowsData={rowsData}
              open={true}
              onClose={() => {
                navigate(".");
              }}
            />
          }
        />
      </Routes>
    </Grid>
  );
};

export default RetrieveCustomer;
