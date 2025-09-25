import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { siasExecutedGridMetadata } from "./metaData/gridMetaData";
import { AuthContext } from "pages_audit/auth";
import * as API from "./api";
import { CircularProgress, Dialog } from "@mui/material";
import { siasExecute } from "./metaData/metaData";
import { FormWrapper, MetaDataType } from "@acuteinfo/common-base";
import { useMutation } from "react-query";
import { enqueueSnackbar } from "notistack";
import { t } from "i18next";
import {
  GridWrapper,
  ActionTypes,
  usePopupContext,
  GradientButton,
  queryClient,
  utilFunction,
  GridMetaDataType,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";

const actions: ActionTypes[] = [];

const SIAsExcutedGrid = ({ open, onClose }) => {
  const authController = useContext(AuthContext);
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const formRef = useRef<any>(null);
  const [apiData, setApiData] = useState<any>(null);
  const [oldData, setOldData] = useState(null);
  const isErrorFuncRef = useRef<any>(null);
  const [formMode, setFormMode] = useState("add");
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const showData = async () => {
    const formdata = await formRef?.current?.getFieldData();
    if (formdata.ACCT_TYPE && formdata.ACCT_CD) {
      showMutation.mutate({
        companyID: authController?.authState?.companyID ?? "",
        branchCode: authController?.authState?.user?.branchCode ?? "",
        acct_type: formdata.ACCT_TYPE ?? "",
        acct_cd: formdata.ACCT_CD ?? "",
      });
    }
  };

  const showMutation = useMutation(API.getSIAsExcutedData, {
    onError: (error: any) => {
      let errorMsg = t("Unknownerroroccured");
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      CloseMessageBox();
    },
    onSuccess: (data) => {
      setApiData(data);
      setOldData(data);
      setFormMode("add");
      CloseMessageBox();
    },
  });

  const handleAllExecutedClick = async () => {
    if (apiData) {
      const btnName = await MessageBox({
        message: t("CannotRevertBack"),
        messageTitle: t("Confirmation"),
        buttonNames: ["Yes", "No"],
        icon: "CONFIRM",
      });
      if (btnName === "Yes") {
        const updatedData = apiData.map((item) => ({
          ...item,
          SI_EXECUTE_FLG: "C",
        }));
        setApiData(updatedData);
      }
    }
  };

  const mutation = useMutation(API.updateSiAsExecute, {
    onError: (error: any) => {
      let errorMsg = t("Unknownerroroccured");
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      CloseMessageBox();
    },
    onSuccess: (data) => {
      enqueueSnackbar(t("insertSuccessfully"), {
        variant: "success",
      });
      showData();
      CloseMessageBox();
    },
  });

  const saveData = async () => {
    if (apiData) {
      const olddata: any = oldData;
      const newData: any = apiData;
      const UpdatedNewData = newData.map((rowData) => {
        const {
          COMP_CD,
          DR_ACCT_CD,
          CR_COMP_CD,
          SI_AMOUNT,
          CR_BRANCH_CD,
          CR_ACCT_CD,
          LAST_MODIFIED_DATE,
          EXECUTE_DT,
          DR_ACCT_TYPE,
          LAST_ENTERED_BY,
          BRANCH_CD,
          ENTERED_DATE,
          LAST_MACHINE_NM,
          CR_ACCT_TYPE,
          _displaySequence,
          _error,
          _isTouchedCol,
          _oldData,
          _touched,
          ...others
        } = rowData;
        return { ...others };
      });
      const UpdatedOldData = olddata.map((rowData) => {
        const {
          COMP_CD,
          DR_ACCT_CD,
          CR_COMP_CD,
          SI_AMOUNT,
          CR_BRANCH_CD,
          CR_ACCT_CD,
          LAST_MODIFIED_DATE,
          EXECUTE_DT,
          DR_ACCT_TYPE,
          LAST_ENTERED_BY,
          BRANCH_CD,
          ENTERED_DATE,
          LAST_MACHINE_NM,
          CR_ACCT_TYPE,
          _displaySequence,
          _error,
          _isTouchedCol,
          _oldData,
          _touched,
          ...others
        } = rowData;
        return { ...others };
      });

      const updatedNewData = UpdatedNewData
        ? UpdatedNewData.map((item) => {
            if (item.SI_EXECUTE_FLG === "C") {
              return {
                ...item,
                PROCESS_DT: authController?.authState?.workingDate,
              };
            } else {
              return item;
            }
          })
        : [];
      let updPara: any = utilFunction.transformDetailDataForDML(
        UpdatedOldData ? UpdatedOldData : [],
        updatedNewData ? updatedNewData : [],
        ["INDEX"]
      );
      isErrorFuncRef.current = {
        data: {
          _isNewRow: false,
          DETAILS_DATA: {
            ...updPara,
          },
        },
      };

      const btnName = await MessageBox({
        message: t("SaveData"),
        messageTitle: t("Confirmation"),
        buttonNames: ["Yes", "No"],
        icon: "CONFIRM",
        loadingBtnName: ["Yes"],
      });

      if (btnName === "Yes") {
        mutation.mutate({
          data: { ...isErrorFuncRef.current?.data },
        });
      }
    }
  };

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getSIAsExcutedData"]);
    };
  }, []);

  return (
    <Fragment>
      <Dialog
        open={open}
        PaperProps={{ style: { width: "100%", overflow: "auto" } }}
        maxWidth="lg"
      >
        <FormWrapper
          key={"siasExecute"}
          metaData={siasExecute as MetaDataType}
          onSubmitHandler={(data) => showData()}
          formStyle={{ background: "white" }}
          ref={formRef}
          onFormButtonClickHandel={(id) => {
            let event: any = { preventDefault: () => {} };
            if (id === "SUBMIT") {
              showData();
            }
          }}
          formState={{ MessageBox: MessageBox, docCd: docCD }}
        />

        <GridWrapper
          key={"standingInsructionViewGridMetaData"}
          finalMetaData={siasExecutedGridMetadata as GridMetaDataType}
          loading={showMutation.isLoading}
          data={apiData ?? []}
          setData={setApiData}
          actions={actions}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "end",
            margin: "0 20px 10px 0",
          }}
        >
          <GradientButton onClick={handleAllExecutedClick}>
            {t("allSIasExecute")}
          </GradientButton>
          <GradientButton
            onClick={saveData}
            endIcon={mutation.isLoading ? <CircularProgress size={20} /> : null}
          >
            {t("Save")}
          </GradientButton>
          <GradientButton onClick={onClose}> Close </GradientButton>
        </div>
      </Dialog>
    </Fragment>
  );
};

export default SIAsExcutedGrid;
