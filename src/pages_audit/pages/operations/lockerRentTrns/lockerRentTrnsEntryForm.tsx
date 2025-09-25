import {
  Alert,
  ClearCacheProvider,
  extractMetaData,
  FormWrapper,
  MetaDataType,
  queryClient,
  SubmitFnType,
  usePopupContext,
} from "@acuteinfo/common-base";
import { useContext, useEffect, useRef, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { entryFormMetadata } from "./formMetadata/entryFormMetadata";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import { AuthContext } from "pages_audit/auth";
import { useDataContext } from "./DataContext";
import { useMutation } from "react-query";
import { getLockerViewMst } from "../LockerOperationTrns/api";

import { t } from "i18next";
import {
  Collapse,
  Grid,
  IconButton,
  LinearProgress,
  Typography,
} from "@mui/material";
import { GridExpandMoreIcon } from "@mui/x-data-grid";
import PhotoSignWithHistory from "components/common/custom/photoSignWithHistory/photoSignWithHistory";
import { SearchLockerNoData } from "./viewLockerNoGrid";
import { lockerRentTransactionDML } from "./api";

const LockerRentTrnsEntry = () => {
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const { data, setContextState } = useDataContext();
  const formRef = useRef<any>(null);
  const formstateRef = useRef(null);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const [dialogState, setDialogState] = useState<any>({
    setValueOnDoubleClick: () => {},
    lockerType: "",
    formMode: "",
    isPhotoSignOpen: false,
    searchLockerNoGrid: false,
    reqParaObj: {},
    refreshCount: 0,
  });

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData: any,
    endSubmit,
    setFieldError
  ) => {
    delete data?.TYPE_CD;
    const buttonName = await MessageBox({
      message: t("AreYouSureToProcced"),
      messageTitle: "Confirmation",
      icon: "CONFIRM",
      loadingBtnName: ["Yes"],
      buttonNames: ["Yes", "No"],
    });
    endSubmit(true);
    const dataObj = {
      ...data,
      ACCT_CD: data?.LST_ACCT_CD,
      TYPE_CD: data?.TRX_CD,
    };
    if (buttonName === "Yes") {
      saveDataMutation.mutate({
        ...dataObj,
        COMP_CD: authState?.companyID,
        BRANCH_CD: authState?.user?.branchCode,
        SCREEN_REF: docCD,
        TRAN_DT: authState?.workingDate,
        TRN_COMP_CD: authState?.companyID,
        _isNewRow: true,
      });
    }
  };
  //@ts-ignore
  const { ACCT_CD, ACCT_TYPE } = data?.reqData;

  const viewMasterMutation = useMutation(getLockerViewMst, {
    onError: async (error: any) => {
      CloseMessageBox();
    },
    onSuccess: (data) => {
      formstateRef.current = {
        ...data,
      };
    },
  });

  const handleReset = () => {
    setDialogState((prevState) => ({
      ...prevState,
      formMode: "add",
    }));
    // let event: any = { preventDefault: () => {} };
    // formRef?.current?.handleFormReset(event, "RESET");
    formRef?.current?.handleFormReset({ preventDefault: () => {} });
    setContextState({
      reqData: {},
      formData: [],
      activeView: "master",
      retrievalPara: {},
      isSubmit: false,
    });
  };

  const saveDataMutation = useMutation(lockerRentTransactionDML, {
    onError: async (error: any) => {
      CloseMessageBox();
    },
    onSuccess: (data) => {
      setDialogState((prevState) => ({
        ...prevState,
        refreshCount: dialogState?.refreshCount + 1,
      }));
      handleReset();
      MessageBox({
        messageTitle: t("VouchersConfirmation"),
        message: data[0]?.MESSAGE,
        icon: "INFO",
      });
    },
  });

  useEffect(() => {
    if (ACCT_CD && ACCT_TYPE) {
      viewMasterMutation?.mutate({
        COMP_CD: authState?.companyID,
        BRANCH_CD: authState?.user?.branchCode,
        ACCT_CD,
        ACCT_TYPE,
        WORKING_DATE: authState?.workingDate,
      });
    }
  }, [data?.reqData]);

  useEffect(() => {
    if (viewMasterMutation?.data) {
      setContextState({
        formData: viewMasterMutation?.data,
      });
    } else {
      setContextState({
        formData: [],
      });
    }
  }, [viewMasterMutation?.data]);

  useEffect(() => {
    if (Boolean(data?.isSubmit)) {
      let event: any = { preventDefault: () => {} };
      formRef?.current?.handleSubmit(event, "BUTTON_CLICK");
    }
    setContextState({
      isSubmit: false,
    });
  }, [data?.isSubmit]);

  const errorDataa: any = [
    { error: viewMasterMutation?.error, isError: viewMasterMutation?.isError },
    { error: saveDataMutation?.error, isError: saveDataMutation?.isError },
  ];
  const hasError = errorDataa.some(({ isError }) => isError);

  entryFormMetadata.fields[1].handleKeyDown = (
    e,
    dependent,
    authstate,
    formstate,
    setFieldDataFn
  ) => {
    if (e.key === "F9" && e.target?.value) {
      e.preventDefault();
      setDialogState((prevState) => ({
        ...prevState,
        isPhotoSignOpen: true,
      }));
    }
    if (e.key === "F5") {
      e.preventDefault();
      setDialogState((prevState) => ({
        ...prevState,
        searchLockerNoGrid: true,
        setValueOnDoubleClick: setFieldDataFn,
      }));
    }
  };

  return (
    <Fragment>
      {hasError
        ? errorDataa.map(
            ({ error, isError }, index) =>
              isError && (
                <Alert
                  key={index}
                  severity="error"
                  errorMsg={error?.error_msg || t("Somethingwenttowrong")}
                  errorDetail={error?.error_detail ?? ""}
                  color="error"
                />
              )
          )
        : null}
      {viewMasterMutation?.isLoading ? (
        <LinearProgress color="secondary" />
      ) : null}
      <Grid
        sx={{
          backgroundColor: "var(--theme-color2)",
          boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
          margin: "0px 0px 0px 10px",
          padding: "0px",
          border: "1px dotted rgba(0,0,0,0.12)",
          borderRadius: "20px",
        }}
        container
        item
        xs={11.8}
        direction={"column"}
      >
        <Grid container item>
          <Typography
            sx={{
              color: "var(--theme-color3)",
              marginLeft: "15px",
              marginTop: "6px",
            }}
            gutterBottom={true}
            variant={"h6"}
          >
            {t("newEntry")}
          </Typography>

          <IconButton onClick={() => {}}>
            <GridExpandMoreIcon />
          </IconButton>
        </Grid>
        <Collapse in={true}>
          <Grid item></Grid>
        </Collapse>
      </Grid>
      <FormWrapper
        key={
          "lockerTrnsEntryFormMetadata" +
          dialogState?.formMode +
          dialogState?.refreshCount
        }
        metaData={
          extractMetaData(
            entryFormMetadata,
            dialogState?.formMode
          ) as MetaDataType
        }
        displayMode={dialogState?.formMode}
        onSubmitHandler={onSubmitHandler}
        hideHeader={true}
        initialValues={{}}
        formState={{
          MessageBox: MessageBox,
          docCD: docCD,
          refID: formstateRef,
        }}
        setDataOnFieldChange={(action, payload) => {
          if (action === "VIEWMST_PAYLOAD") {
            setContextState({
              reqData: payload,
            });
          }
        }}
        onFormDataChange={(data, field) => {
          setDialogState((prevState) => ({
            ...prevState,
            lockerType: field?.value,
          }));
        }}
        formStyle={{
          background: "white",
        }}
        ref={formRef}
      />
      {dialogState?.isPhotoSignOpen ? (
        <PhotoSignWithHistory
          data={{
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            ACCT_CD,
            ACCT_TYPE,
          }}
          onClose={() => {
            setDialogState((prevState) => ({
              ...prevState,
              isPhotoSignOpen: false,
            }));
          }}
          screenRef={docCD}
        />
      ) : null}
      {dialogState?.searchLockerNoGrid ? (
        <SearchLockerNoData
          acctType={dialogState?.lockerType}
          open={dialogState?.searchLockerNoGrid}
          close={(fieldData) => {
            if (fieldData) {
              dialogState?.setValueOnDoubleClick(fieldData);
            }
            setDialogState((prevState) => ({
              ...prevState,
              searchLockerNoGrid: false,
            }));
          }}
        />
      ) : null}
    </Fragment>
  );
};

export const LockerRentTrnsEntryForm = () => {
  return (
    <>
      <ClearCacheProvider>
        <LockerRentTrnsEntry />
      </ClearCacheProvider>
    </>
  );
};
