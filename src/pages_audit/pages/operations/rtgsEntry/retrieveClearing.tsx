import {
  FC,
  useRef,
  useCallback,
  useContext,
  Fragment,
  useState,
  useEffect,
} from "react";
import { useMutation } from "react-query";
import * as API from "./api";
import { RetrieveFormConfigMetaData, RetrieveGridMetaData } from "./metaData";
import { Dialog } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import { format } from "date-fns";
import { t } from "i18next";
import { useTranslation } from "react-i18next";
import {
  ActionTypes,
  Alert,
  GridWrapper,
  GradientButton,
  SubmitFnType,
  FormWrapper,
  MetaDataType,
  ClearCacheProvider,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";
const actions: ActionTypes[] = [
  {
    actionName: "view-details",
    actionLabel: t("ViewDetails"),
    multiple: false,
    rowDoubleClick: true,
  },
];
export const RetrieveClearing: FC<{
  onClose?: any;
}> = ({ onClose }) => {
  const { authState } = useContext(AuthContext);
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const formRef = useRef<any>(null);
  const { t } = useTranslation();
  const setCurrentAction = useCallback((data) => {
    onClose("action", data?.rows);
  }, []);

  const mutation: any = useMutation(
    "getRtgsRetrieveData",
    API.getRtgsRetrieveData,
    {
      onSuccess: (data) => {},
      onError: (error: any) => {},
    }
  );

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
      FLAG: actionFlag === "RETRIEVE" ? "P" : "A",
      FLAG_RTGSC: "",
      SCREEN_REF: docCD ?? "",
    };
    mutation.mutate(data);
    endSubmit(true);
  };
  useEffect(() => {
    mutation.mutate({
      FROM_DT: format(new Date(authState?.workingDate), "dd/MMM/yyyy"),
      TO_DT: format(new Date(authState?.workingDate), "dd/MMM/yyyy"),
      COMP_CD: authState.companyID,
      BRANCH_CD: authState.user.branchCode,
      FLAG: "P",
      SCREEN_REF: docCD ?? "",
      FLAG_RTGSC: "",
    });
  }, [docCD]);

  return (
    <>
      <>
        <Dialog
          open={true}
          PaperProps={{
            style: {
              overflow: "hidden",
            },
          }}
          maxWidth="xl"
        >
          <FormWrapper
            key={`retrieveForm`}
            metaData={RetrieveFormConfigMetaData as unknown as MetaDataType}
            initialValues={{
              FROM_DT: authState?.workingDate ?? "",
              TO_DT: authState?.workingDate ?? "",
            }}
            onSubmitHandler={onSubmitHandler}
            formStyle={{
              background: "white",
            }}
            onFormButtonClickHandel={(id) => {
              let event: any = { preventDefault: () => {} };
              if (id === "RETRIEVE") {
                formRef?.current?.handleSubmit(event, "RETRIEVE");
              } else if (id === "VIEW_ALL") {
                formRef?.current?.handleSubmit(event, "VIEW_ALL");
              }
            }}
            ref={formRef}
          >
            {({ isSubmitting, handleSubmit }) => (
              <>
                <GradientButton
                  onClick={() => {
                    onClose();
                  }}
                >
                  {t("Close")}
                </GradientButton>
              </>
            )}
          </FormWrapper>
          <Fragment>
            {mutation.isError && (
              <Alert
                severity="error"
                errorMsg={mutation.error?.error_msg ?? "Somethingwenttowrong"}
                errorDetail={mutation.error?.error_detail}
                color="error"
              />
            )}
            <GridWrapper
              key={"RetrieveGridMetaData"}
              finalMetaData={RetrieveGridMetaData}
              data={mutation?.data ?? []}
              setData={() => null}
              loading={mutation.isLoading || mutation.isFetching}
              actions={actions}
              setAction={setCurrentAction}
            />
          </Fragment>
        </Dialog>
      </>
    </>
  );
};

export const RetrieveClearingForm = ({ onClose }) => {
  return (
    <ClearCacheProvider>
      <RetrieveClearing onClose={onClose} />
    </ClearCacheProvider>
  );
};
