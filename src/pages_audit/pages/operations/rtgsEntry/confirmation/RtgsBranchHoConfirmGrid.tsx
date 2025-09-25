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
import { RTGSBranchHoConfirmFormWrapper } from "./RtgsBranchHoConfirmForm";
import {
  RetrieveFormConfigMetaData,
  RtgsConfirmGridMetaData,
} from "./ConfirmationMetadata";
import { AuthContext } from "pages_audit/auth";
import { format } from "date-fns";
import { ClearCacheContext, ClearCacheProvider } from "@acuteinfo/common-base";
import { useTranslation } from "react-i18next";
import { t } from "i18next";

import {
  utilFunction,
  Alert,
  GridWrapper,
  FormWrapper,
  ActionTypes,
  queryClient,
  MetaDataType,
  SubmitFnType,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";

const actions: ActionTypes[] = [
  {
    actionName: "view-detail",
    actionLabel: t("ViewDetail"),
    multiple: false,
    rowDoubleClick: true,
  },
];

const RtgsConfirmationGrid = ({ flag, screenFlag }) => {
  const { authState } = useContext<any>(AuthContext);
  const formRef = useRef<any>(null);
  const indexRef = useRef(0);
  const navigate = useNavigate();
  const isDataChangedRef = useRef(false);
  const [formData, setFormData] = useState<any>();
  const { getEntries } = useContext(ClearCacheContext);
  const { t } = useTranslation();
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const getDynamicLabel = (path: string, data: any, setScreenCode: boolean) => {
    const relativePath = path.replace("/EnfinityCore/", "");
    let cleanedPath;

    if (relativePath.includes("/")) {
      cleanedPath = relativePath.split("/").slice(0, 2).join("/");
    } else {
      cleanedPath = relativePath;
    }
    let screenList = utilFunction.GetAllChieldMenuData(data, true);
    const matchingPath = screenList.find((item) => item.href === cleanedPath);

    if (matchingPath) {
      return setScreenCode
        ? `${matchingPath.label} (${matchingPath.user_code.trim()})`
        : `${matchingPath.label}`;
    }

    return "";
  };
  const mutation: any = useMutation(
    "getRetrievalClearingData",
    API.getRtgsRetrBranchConfirmData,
    {
      onSuccess: (data) => {},
      onError: (error: any) => {},
    }
  );
  // const mutation: any = useMutation(
  //   "getRtgsBranchConfirmOrderingData",
  //   API.getRtgsBranchConfirmOrderingData,
  //   {
  //     onSuccess: (data) => {
  //     },
  //     onError: (error: any) => { },
  //   }
  // );
  // const mutation: any = useMutation(
  //   "getRetrievalClearingData",
  //   API.getRtgsBenDetailBranchConfirmData,
  //   {
  //     onSuccess: (data) => {
  //     },
  //     onError: (error: any) => { },
  //   }
  // );
  // const mutation: any = useMutation(
  //   "getRetrievalClearingData",
  //   API.getRtgsRetrBranchConfirmData,
  //   {
  //     onSuccess: (data) => {
  //     },
  //     onError: (error: any) => { },
  //   }
  // );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getBussinessDate"]);
      let entries = getEntries() as any[];
      if (Array.isArray(entries) && entries.length > 0) {
        entries.forEach((one) => {
          queryClient.removeQueries(one);
        });
      }
      queryClient.removeQueries(["getRetrievalClearingData", flag]);
    };
  }, [getEntries]);

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
    delete data["VIEW_ALL"];
    if (Boolean(data["FROM_DT"])) {
      data["FROM_DT"] = format(new Date(data["FROM_DT"]), "dd/MMM/yyyy");
    }
    if (Boolean(data["TO_DT"])) {
      data["TO_DT"] = format(new Date(data["TO_DT"]), "dd/MMM/yyyy");
    }
    data = {
      ...data,
      COMP_CD: authState.companyID,
      BRANCH_CD: authState.user.branchCode,
      FLAG:
        flag === "BO"
          ? actionFlag === "RETRIEVE"
            ? "P"
            : "A"
          : actionFlag === "RETRIEVE"
          ? "RTGSHO"
          : "A",
      FLAG_RTGSC: flag === "BO" ? "RTGSBO" : "RTGSHO",
      SCREEN_REF: docCD ?? "",
    };
    mutation.mutate(data);
    endSubmit(true);
    setFormData(data);
  };
  const handleDialogClose = () => {
    if (isDataChangedRef.current === true) {
      isDataChangedRef.current = true;
      const initialData = {
        FROM_DT: format(new Date(authState?.workingDate), "dd/MMM/yyyy"),
        TO_DT: format(new Date(authState?.workingDate), "dd/MMM/yyyy"),
        COMP_CD: authState.companyID,
        BRANCH_CD: authState.user.branchCode,
        FLAG: flag === "BO" ? "P" : "RTGSHO",
        FLAG_RTGSC: flag === "BO" ? "RTGSBO" : "RTGSHO",
        SCREEN_REF: docCD ?? "",
      };
      mutation.mutate({
        ...(formData || initialData),
      });
      isDataChangedRef.current = false;
    }
    navigate(".");
  };

  useEffect(() => {
    mutation.mutate({
      FROM_DT: format(new Date(authState?.workingDate), "dd/MMM/yyyy"),
      TO_DT: format(new Date(authState?.workingDate), "dd/MMM/yyyy"),
      COMP_CD: authState.companyID,
      BRANCH_CD: authState.user.branchCode,
      FLAG: flag === "BO" ? "P" : "RTGSHO",
      FLAG_RTGSC: flag === "BO" ? "RTGSBO" : "RTGSHO",
      SCREEN_REF: docCD ?? "",
    });
  }, [docCD]);
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

  return (
    <Fragment>
      {/* {isLoading ? (
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
      ) : ( */}
      <>
        <FormWrapper
          key={`retrieveForm` + flag}
          metaData={
            (flag === "BO"
              ? RetrieveFormConfigMetaData
              : RetrieveFormConfigMetaData) as unknown as MetaDataType
          }
          initialValues={{
            FROM_DT: authState?.workingDate,
            TO_DT: authState?.workingDate,
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
          formState={{ ZONE_TRAN_TYPE: flag }}
          ref={formRef}
        />
        <Fragment>
          {mutation.isError && (
            <Alert
              severity="error"
              errorMsg={mutation.error?.error_msg ?? "Somethingwenttowrong"}
              errorDetail={mutation.error?.error_detail}
              color="error"
            />
          )}
          {/* {mutation?.data ? ( */}
          <GridWrapper
            key={"rtgsConfirmGrid" + flag}
            finalMetaData={RtgsConfirmGridMetaData}
            data={mutation?.data ?? []}
            setData={() => null}
            loading={mutation.isLoading || mutation.isFetching}
            actions={actions}
            setAction={setCurrentAction}
          />

          {/* ) : null} */}
        </Fragment>
      </>
      {/* )} */}
      <Routes>
        <Route
          path="view-detail/*"
          element={
            <RTGSBranchHoConfirmFormWrapper
              flag={flag}
              screenFlag={screenFlag}
              handleDialogClose={handleDialogClose}
              handlePrev={handlePrev}
              handleNext={handleNext}
              currentIndexRef={indexRef}
              totalData={mutation?.data?.length ?? 0}
              isDataChangedRef={isDataChangedRef}
              formLabel={getDynamicLabel(
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
export const RtgsBranchHoConfirmationGrid = ({ flag, screenFlag }) => {
  return (
    <ClearCacheProvider>
      <RtgsConfirmationGrid
        key={flag + "-CtsOutwardClearingGrid"}
        flag={flag}
        screenFlag={screenFlag}
      />
    </ClearCacheProvider>
  );
};
