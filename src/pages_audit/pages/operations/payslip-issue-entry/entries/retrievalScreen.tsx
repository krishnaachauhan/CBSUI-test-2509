import {
  Alert,
  FormWrapper,
  GradientButton,
  GridWrapper,
  MetaDataType,
  SubmitFnType,
} from "@acuteinfo/common-base";
import { t } from "i18next";
import { EntryForm } from "./entryForm";
import { Route, Routes, useNavigate } from "react-router-dom";
import { cloneDeep } from "lodash";
import { RetrieveFormConfigMetaData, RetrieveGridMetaData } from "./metaData";
import { useContext, useMemo, useRef } from "react";
import { AuthContext } from "pages_audit/auth";
import i18n from "components/multiLanguage/languagesConfiguration";

export const RetrievalDefaultContent = ({
  close,
  mutation,
  actions,
  setCurrentAction,
  headerLabel,
  screenFlag,
  indexRef,
  handlePrev,
  handleNext,
  apiReqFlag,
  trans_type,
}: any) => {
  const { authState } = useContext(AuthContext);
  const formRef = useRef<any>(null);
  const isErrorFuncRef = useRef<any>(null);
  const navigate = useNavigate();

  const formMeta = useMemo(() => {
    const cloned = cloneDeep(RetrieveFormConfigMetaData);
    cloned.form.label = headerLabel;
    return cloned;
  }, [headerLabel]);

  const gridMeta = useMemo(() => {
    const cloned = cloneDeep(RetrieveGridMetaData);
    cloned.gridConfig.gridLabel = t("enterRetrivalPara");
    return cloned;
  }, []);
  const handleDialogClose = () => {
    let event: any = { preventDefault: () => {} };
    formRef?.current?.handleSubmit(event, "RETRIEVE");
    navigate(".");
  };

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    delete data["RETRIEVE"];
    isErrorFuncRef.current = {
      data: {
        ...data,
        A_COMP_CD: authState.companyID,
        A_ENT_BRANCH_CD: authState?.user?.branchCode,
        A_BRANCH_CD: data?.BRANCH_CD,
        A_PAYSLIP_NO: data?.PAYSLIP_NO,
        A_DEF_TRAN_CD: data?.DEF_TRAN_CD,
        A_ENTRY_MODE:
          screenFlag === "REALIZEENTRY"
            ? data?.REALIZE
            : screenFlag === "CANCELENTRY"
            ? data?.CANCEL
            : screenFlag === "STOPPAYMENT"
            ? data?.STOPPAYMENT
            : screenFlag === "CANCELCONFIRM"
            ? data?.CANCELCONFRM
            : screenFlag === "REALIZECONFIRM"
            ? data?.REALIZECONF
            : "",
        ALL_BRANCH: "N",
        A_TRAN_TYPE: trans_type,
        A_GD_DATE: authState?.workingDate,
        A_USER: authState?.user?.id,
        A_USER_LEVEL: authState?.role,
        A_SCREEN_REF: apiReqFlag,
        A_LANG: i18n.resolvedLanguage,
      },
      displayData,
      endSubmit,
      setFieldError,
    };
    mutation.mutate({ ...isErrorFuncRef.current?.data });
    endSubmit(true);
  };
  return (
    <>
      <FormWrapper
        key={`retrieveForm`}
        metaData={formMeta as MetaDataType}
        initialValues={{
          SCREEN_REF: screenFlag ?? "",
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
          <GradientButton
            onClick={() => {
              close();
            }}
          >
            {t("Close")}
          </GradientButton>
        )}
      </FormWrapper>
      {mutation.isError && (
        <Alert
          severity="error"
          errorMsg={mutation.error?.error_msg ?? "Something went to wrong.."}
          errorDetail={mutation.error?.error_detail}
          color="error"
        />
      )}
      <GridWrapper
        key={"RetrieveGridMetaData"}
        finalMetaData={gridMeta}
        data={mutation?.data ?? []}
        hideHeader={false}
        setData={() => {}}
        loading={mutation.isLoading || mutation.isFetching}
        actions={actions}
        setAction={setCurrentAction}
      />
      <Routes>
        <Route
          path="view-detail/*"
          element={
            <EntryForm
              onClose={handleDialogClose}
              currentIndexRef={indexRef}
              handlePrev={handlePrev}
              handleNext={handleNext}
              headerLabel={headerLabel}
              screenFlag={screenFlag}
              trans_type={trans_type}
              apiReqFlag={apiReqFlag}
              totalData={mutation?.data?.length ?? 0}
              defaultView={"view"}
            />
          }
        />
      </Routes>
    </>
  );
};
