import { Fragment, useRef, useContext } from "react";
import { useMutation } from "react-query";
import { useSnackbar } from "notistack";
import { AuthContext } from "pages_audit/auth";
import { PasswordChangeMetaData } from "./metaData";
import * as API from "../api";
import { Box, CircularProgress, Dialog } from "@mui/material";
import { DialogActions } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  GradientButton,
  FormWrapper,
  MetaDataType,
} from "@acuteinfo/common-base";

interface UpdatePasswordFnType {
  data: object;
  displayData?: object;
  endSubmit?: any;
  userID?: any;
}

const updatePasswordFnWrapper =
  (updatePassword) =>
  async ({ data, userID }: UpdatePasswordFnType) => {
    return updatePassword({ ...data, userID });
  };

export const ChangePassword = () => {
  const { enqueueSnackbar } = useSnackbar();
  const authCtx = useContext(AuthContext);
  const formRef = useRef<any>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const handleNavigate = () => {
    navigate("/EnfinityCore/login");
  };
  const onSubmitHandler = (data, displayData, endSubmit) => {
    mutation.mutate({
      data,
      displayData,
      endSubmit,
      userID: authCtx?.authState?.user?.id,
    });
  };

  const mutation = useMutation(
    updatePasswordFnWrapper(API.changeEmployeePassword),
    {
      onError: (error: any, { endSubmit }) => {
        let errorMsg = "Unknown Error occured";
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
        endSubmit(false, errorMsg, error?.error_detail ?? "");
        enqueueSnackbar(errorMsg, {
          variant: "error",
        });
      },
      onSuccess: (data, { endSubmit }) => {
        endSubmit(true, "");
        enqueueSnackbar("Password changed successfully", {
          variant: "success",
        });
        handleNavigate();
      },
    }
  );

  return (
    <Fragment>
      <Box sx={{ width: 370, margin: "auto" }}>
        <FormWrapper
          key="passwordChange"
          metaData={PasswordChangeMetaData as MetaDataType}
          initialValues={{}}
          onSubmitHandler={onSubmitHandler}
          displayMode={"new"}
          hideDisplayModeInTitle={true}
          formStyle={{
            background: "white",
            height: "auto",
          }}
          formState={{
            authState: authCtx?.authState,
          }}
          ref={formRef}
          hideHeader={true}
          containerstyle={{ padding: "11px" }}
        />
        <DialogActions>
          <GradientButton
            disabled={mutation.isLoading}
            endIcon={mutation.isLoading ? <CircularProgress size={20} /> : null}
            starticon={"SyncLock"}
            rotateIcon={"scale(1.4) rotate(360deg)"}
            onClick={(e) => {
              formRef.current?.handleSubmit?.(e);
            }}
          >
            {t("profileChangePassword")}
          </GradientButton>
        </DialogActions>
      </Box>
    </Fragment>
  );
};
