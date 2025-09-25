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
import { CtsOutwardClearingConfirmForm } from "./CtsOutwardClearingForm";
import {
  CtsOutwardClearingConfirmGridMetaData,
  RetrieveFormConfigMetaData,
} from "./ConfirmationMetadata";
import { AuthContext } from "pages_audit/auth";
import { format } from "date-fns";
import { AppBar } from "@mui/material";
import { t } from "i18next";
import {
  utilFunction,
  ClearCacheContext,
  ClearCacheProvider,
  queryClient,
  LoaderPaperComponent,
  MetaDataType,
  FormWrapper,
  SubmitFnType,
  ActionTypes,
  Alert,
  GridWrapper,
} from "@acuteinfo/common-base";
import getDynamicLabel from "components/common/custom/getDynamicLabel";
import { getdocCD } from "components/utilFunction/function";

const actions: ActionTypes[] = [
  {
    actionName: "view-detail",
    actionLabel: t("ViewDetail"),
    multiple: false,
    rowDoubleClick: true,
  },
];

const CtsOutwardClearingGrid = ({ zoneTranType }) => {
  const { authState } = useContext(AuthContext);
  const formRef = useRef<any>(null);
  const indexRef = useRef(1);
  const navigate = useNavigate();
  const isDataChangedRef = useRef(false);
  const { getEntries } = useContext(ClearCacheContext);
  let currentPath = useLocation().pathname;
  const [formData, setFormData] = useState<any>({});
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const [zoneValue, setZoneValue] = useState<any>();
  const { data, isLoading, isError, error } = useQuery<any, any>(
    ["getBussinessDate"],
    () =>
      API.getBussinessDate({
        SCREEN_REF: docCD,
      })
  );
  const mutation: any = useMutation(
    "getRetrievalClearingData",
    API.getRetrievalClearingData,
    {
      onSuccess: (data) => {},
      onError: (error: any) => {},
    }
  );
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getBussinessDate"]);
      let entries = getEntries() as any[];
      if (Array.isArray(entries) && entries.length > 0) {
        entries.forEach((one) => {
          queryClient.removeQueries(one);
        });
      }
      queryClient.removeQueries(["getRetrievalClearingData", zoneTranType]);
    };
  }, [getEntries]);

  useEffect(() => {
    if (Boolean(zoneValue)) {
      mutation.mutate({
        FROM_TRAN_DT: format(
          new Date(data?.[0]?.TRAN_DATE ?? ""),
          "dd/MMM/yyyy"
        ),
        TO_TRAN_DT: format(new Date(data?.[0]?.TRAN_DATE ?? ""), "dd/MMM/yyyy"),
        BATCH_ID: "",
        COMP_CD: authState.companyID,
        BRANCH_CD: authState.user.branchCode,
        TRAN_TYPE: zoneTranType,
        CONFIRMED: "N",
        BANK_CD: "",
        ZONE: zoneValue,
        SLIP_CD: "",
        CHEQUE_NO: "",
        CHEQUE_AMOUNT: "",
      });
    }
  }, [zoneValue]);
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
    }
  }, []);

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    delete data["RETRIEVE"];
    if (Boolean(data["FROM_TRAN_DT"])) {
      data["FROM_TRAN_DT"] = format(
        new Date(data["FROM_TRAN_DT"]),
        "dd/MMM/yyyy"
      );
    }
    if (Boolean(data["TO_TRAN_DT"])) {
      data["TO_TRAN_DT"] = format(new Date(data["TO_TRAN_DT"]), "dd/MMM/yyyy");
    }
    data["BANK_CD"] = data["BANK_CD"].padEnd(10, " ");

    data = {
      ...data,
      BATCH_ID: "",
      COMP_CD: authState.companyID,
      BRANCH_CD: authState.user.branchCode,
      TRAN_TYPE: zoneTranType,
      CONFIRMED: actionFlag === "RETRIEVE" ? "N" : "0",
    };
    mutation.mutate(data);
    setFormData(data);
    endSubmit(true);
  };

  const handleDialogClose = () => {
    if (isDataChangedRef.current) {
      const defaultData = {
        FROM_TRAN_DT: format(
          new Date(data?.[0]?.TRAN_DATE ?? ""),
          "dd/MMM/yyyy"
        ),
        TO_TRAN_DT: format(new Date(data?.[0]?.TRAN_DATE ?? ""), "dd/MMM/yyyy"),
        BATCH_ID: "",
        COMP_CD: authState.companyID,
        BRANCH_CD: authState.user.branchCode,
        TRAN_TYPE: zoneTranType,
        CONFIRMED: "0",
        BANK_CD: "",
        ZONE: zoneValue,
        SLIP_CD: "",
        CHEQUE_NO: "",
        CHEQUE_AMOUNT: "",
      };
      mutation.mutate(
        formData && Object.keys(formData).length > 0
          ? { ...formData }
          : defaultData
      );
      isDataChangedRef.current = false;
    }
    navigate(".");
  };

  const handlePrev = useCallback(() => {
    if (indexRef.current > 1) {
      indexRef.current -= 1;
      const index = indexRef.current;
      setTimeout(() => {
        setCurrentAction({
          name: "view-detail",
          rows: [{ data: mutation?.data[index - 1], id: String(index) }],
        });
      }, 0);
    }
  }, [mutation?.data, indexRef.current]);

  const handleNext = useCallback(() => {
    const index = indexRef.current++;
    setTimeout(() => {
      setCurrentAction({
        name: "view-detail",
        rows: [{ data: mutation?.data[index], id: String(index + 1) }],
      });
    }, 0);
  }, [mutation?.data, indexRef.current]);

  const typeDefaults = {
    R: { label: "Inward Return Retrieve Information" },
    S: { label: "Clearing Retrieve Information" },
    W: { label: "Outward Return Retrieve Information" },
  };

  const defaultValues = typeDefaults[zoneTranType];
  if (defaultValues) {
    RetrieveFormConfigMetaData.form.label = defaultValues.label;
  }
  return (
    <Fragment>
      {isLoading ? (
        <div style={{ height: 100, paddingTop: 10 }}>
          <div style={{ padding: 10 }}>
            <LoaderPaperComponent />
          </div>
        </div>
      ) : isError ? (
        <>
          <div
            style={{
              paddingRight: "10px",
              paddingLeft: "10px",
              height: 100,
              paddingTop: 10,
            }}
          >
            <AppBar position="relative" color="primary">
              <Alert
                severity="error"
                errorMsg={error?.error_msg ?? "Unknow Error"}
                errorDetail={error?.error_detail ?? ""}
                color="error"
              />
            </AppBar>
          </div>
        </>
      ) : (
        <>
          <FormWrapper
            key={`retrieveForm` + zoneTranType}
            metaData={
              (zoneTranType === "S"
                ? RetrieveFormConfigMetaData
                : RetrieveFormConfigMetaData) as unknown as MetaDataType
            }
            initialValues={{
              FROM_TRAN_DT: data?.[0]?.TRAN_DATE,
              TO_TRAN_DT: data?.[0]?.TRAN_DATE,
              DISABLE_TRAN_DATE: data?.[0]?.DISABLE_TRAN_DATE,
            }}
            onSubmitHandler={onSubmitHandler}
            formStyle={{
              background: "white",
            }}
            onFormButtonClickHandel={(id) => {
              let event: any = { preventDefault: () => {} };
              // if (mutation?.isLoading) {
              if (id === "RETRIEVE") {
                formRef?.current?.handleSubmit(event, "RETRIEVE");
              } else if (id === "VIEW_ALL") {
                formRef?.current?.handleSubmit(event, "VIEW_ALL");
              }
              // }
            }}
            setDataOnFieldChange={(action, payload) => {
              if (action === "ZONE_VALUE") {
                setZoneValue(payload);
              }
            }}
            formState={{ ZONE_TRAN_TYPE: zoneTranType }}
            ref={formRef}
          />
          <Fragment>
            {mutation.isError && (
              <Alert
                severity="error"
                errorMsg={
                  mutation.error?.error_msg ?? "Something went to wrong.."
                }
                errorDetail={mutation.error?.error_detail}
                color="error"
              />
            )}
            {/* {mutation?.data ? ( */}
            <GridWrapper
              key={"CtsOutwardClearingConfirmGrid" + zoneTranType}
              finalMetaData={
                zoneTranType === "S"
                  ? CtsOutwardClearingConfirmGridMetaData
                  : CtsOutwardClearingConfirmGridMetaData
              }
              data={mutation?.data ?? []}
              setData={() => null}
              loading={mutation.isLoading || mutation.isFetching}
              actions={actions}
              setAction={setCurrentAction}
            />

            {/* ) : null} */}
          </Fragment>
        </>
      )}
      <Routes>
        <Route
          path="view-detail/*"
          element={
            <CtsOutwardClearingConfirmForm
              chequeMicrVisible={data?.[0]?.CHQ_MICR_VISIBLE}
              zoneTranType={zoneTranType}
              handleDialogClose={handleDialogClose}
              handlePrev={handlePrev}
              handleNext={handleNext}
              currentIndexRef={indexRef}
              totalData={mutation?.data?.length ?? 0}
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
    </Fragment>
  );
};
export const CtsOutwardClearingConfirmGrid = ({ zoneTranType }) => {
  return (
    <ClearCacheProvider>
      <CtsOutwardClearingGrid
        key={zoneTranType + "-CtsOutwardClearingGrid"}
        zoneTranType={zoneTranType}
      />
    </ClearCacheProvider>
  );
};
