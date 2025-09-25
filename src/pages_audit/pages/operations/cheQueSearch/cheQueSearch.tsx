import { AuthContext } from "pages_audit/auth";
import { Fragment, useCallback, useContext, useRef, useState } from "react";
import { RetrievalParameterFormMetaData } from "./formMetaData";
import { format } from "date-fns";
import * as API from "./api";
import { useMutation } from "react-query";
import { RetrieveGridMetaData } from "./gridMetaData";
import { useLocation, useNavigate } from "react-router-dom";
import { ReturnChequeForm } from "./returnChequeForm";
import { t } from "i18next";

import { enqueueSnackbar } from "notistack";
import {
  usePopupContext,
  GridWrapper,
  ActionTypes,
  GridMetaDataType,
  Alert,
  SubmitFnType,
  FormWrapper,
  MetaDataType,
  ClearCacheProvider,
  utilFunction,
} from "@acuteinfo/common-base";
import { AppBar, LinearProgress, Toolbar, Typography } from "@mui/material";
import { Theme } from "@mui/system";
import { makeStyles } from "@mui/styles";

const actions: ActionTypes[] = [
  {
    actionName: "view-details",
    actionLabel: "View Detail",
    multiple: false,
    rowDoubleClick: true,
  },
];
const useTypeStyles: any = makeStyles((theme: Theme) => ({
  root: {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    background: "var(--theme-color5)",
  },
  title: {
    flex: "1 1 100%",
    color: "var(--white)",
    letterSpacing: "1px",
    fontSize: "1.5rem",
  },
}));
const ChequeSearchMain = () => {
  let currentPath = useLocation().pathname;
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const formRef = useRef<any>(null);
  const navigate = useNavigate();
  const [returnChequeForm, setReturnChequeForm] = useState(false);
  const headerClasses = useTypeStyles();
  const setCurrentAction = useCallback(
    async (data) => {
      if (data?.name === "view-details") {
        if (data?.rows[0]?.data?.ALLOW_RETURN === "Y") {
          checkDuplicateMutation.mutate({
            A_COMP_CD: authState?.companyID,
            A_BRANCH_CD: authState?.user?.branchCode,
            A_ACCT_TYPE: data?.rows[0]?.data?.ACCT_TYPE,
            A_ACCT_CD: data?.rows[0]?.data?.ACCT_CD,
            A_TRAN_TYPE: "W",
            A_TRAN_DT: format(new Date(authState?.workingDate), "dd/MMM/yyyy"),
            A_BANK_CD: data?.rows[0]?.data?.BANK_CD,
            A_CHEQUE_NO: data?.rows[0]?.data?.CHEQUE_NO,
            A_AMOUNT: data?.rows[0]?.data?.AMOUNT,
            A_LANG: "en",
          });
        }
      }
      navigate(data?.name, {
        state: data?.rows,
      });
    },
    [navigate]
  );

  const checkDuplicateMutation = useMutation(API.getCheckDuplicate, {
    onSuccess: async (response) => {
      if (response[0]?.O_MESSAGE === "SUCCESS") {
        const buttonName = await MessageBox({
          messageTitle: "Confirmation",
          message: t("GenerateOutwardReturnEntry"),
          icon: "CONFIRM",
          buttonNames: ["Yes", "No"],
        });
        if (buttonName === "Yes") {
          setReturnChequeForm(true);
        }
      } else {
        await MessageBox({
          messageTitle: "ValidationFailed",
          message: response[0]?.O_MESSAGE ?? "",
          icon: "ERROR",
          buttonNames: ["Ok"],
        });
      }
    },
    onError: (error: any) => {},
  });

  const retrieveMutation = useMutation(API.getChequeSearchData, {
    onSuccess: (data) => {},
    onError: (error: any) => {
      let errorMsg = "Unknownerroroccured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      CloseMessageBox();
    },
  });

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
      FROM_DATE: data?.FROM_DT,
      TO_DATE: data?.TO_DT,
      TRAN_TYPE: data?.TRAN_TYPE,
      CHEQUE_NO: data?.CHEQUE_NO,
      COMP_CD: authState.companyID,
      BRANCH_CD: authState.user.branchCode,
    };

    retrieveMutation.mutate(data);
    endSubmit(true);
  };

  return (
    <Fragment>
      <AppBar position="relative" color="secondary">
        <Toolbar className={headerClasses.root} variant="dense">
          <Typography
            className={headerClasses.title}
            color="inherit"
            variant="h6"
            component="div"
          >
            {utilFunction.getDynamicLabel(
              currentPath,
              authState?.menulistdata,
              true
            )}
          </Typography>
        </Toolbar>
      </AppBar>
      {checkDuplicateMutation.isLoading ? <LinearProgress /> : ""}

      <FormWrapper
        key="retrieveForm"
        metaData={RetrievalParameterFormMetaData as MetaDataType}
        initialValues={{
          FROM_DT: authState?.workingDate ?? "",
          TO_DT: authState?.workingDate ?? "",
        }}
        onSubmitHandler={onSubmitHandler}
        formStyle={{
          background: "white",
        }}
        hideHeader={true}
        onFormButtonClickHandel={(id) => {
          let event: any = { preventDefault: () => {} };
          if (id === "RETRIEVE") {
            formRef?.current?.handleSubmit(event, "RETRIEVE");
          }
        }}
        ref={formRef}
      />
      {retrieveMutation.isError && (
        <Alert
          severity="error"
          errorMsg={
            retrieveMutation.error?.error_msg ?? "Something went to wrong.."
          }
          errorDetail={retrieveMutation.error?.error_detail}
          color="error"
        />
      )}
      <GridWrapper
        key={"chequesearchGrid"}
        finalMetaData={RetrieveGridMetaData as GridMetaDataType}
        data={retrieveMutation?.data ?? []}
        setData={() => null}
        loading={retrieveMutation.isLoading}
        actions={actions}
        setAction={setCurrentAction}
        hideHeader={true}
      />
      {returnChequeForm ? (
        <ReturnChequeForm
          open={returnChequeForm}
          onclose={() => setReturnChequeForm(false)}
        />
      ) : (
        ""
      )}
    </Fragment>
  );
};

export const ChequeSearch = () => {
  return (
    <ClearCacheProvider>
      <ChequeSearchMain />
    </ClearCacheProvider>
  );
};
