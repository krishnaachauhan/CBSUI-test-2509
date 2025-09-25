import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FullScreenLoader } from "@acuteinfo/common-base";
import {
  updatenewPassword,
  veirfyUsernameandMobileNo,
  verifyOTPForPWDReset,
} from "./api";
import { GeneralAPI } from "registry/fns/functions";
import { useQuery } from "react-query";
import * as API from "./api";
import { MultiLanguages } from "./multiLanguages";
import { ForgotPasswordControllerWrapper } from "@acuteinfo/common-screens";
import TotpEnbaledDisabled from "pages_audit/pages/profile/totp/totp-enabled-disable";

export const ForgotPasswordController = ({ screenFlag }) => {
  const navigate = useNavigate();
  const {
    data: imageData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<any, any>(["getLoginImageData"], () => API.getImageData());

  const {
    data: content,
    isLoading: isContentLoading,
    isFetching: isContentFetching,
  } = useQuery<any, any>(["getLoginContentData"], () => API.getContentData());

  useEffect(() => {
    GeneralAPI.setDocumentName("Password Reset");
  }, []);
  return (
    <>
      {isLoading || isFetching || isContentLoading || isContentFetching ? (
        <FullScreenLoader />
      ) : (
        <>
          <ForgotPasswordControllerWrapper
            OTPResendRequest={API.OTPResendRequest}
            validatePasswordFn={API.validatePasswords}
            navigate={navigate}
            bannerDetails={{
              bannerImg: imageData?.[0]?.BANK_LOGO ?? "",
              bannerTitle: content?.[0]?.APP_NM ?? "",
              bannerNote: content?.[0]?.NOTE ?? "",
            }}
            logoUrl={imageData?.[0]?.DASHBOARD_APP_LOGO}
            LanguageComponent={MultiLanguages}
            screenFlag={screenFlag}
            updatenewPassword={updatenewPassword}
            veirfyUsernameandMobileNo={veirfyUsernameandMobileNo}
            verifyOTPForPWDReset={verifyOTPForPWDReset}
            loginPageEndpoint="login"
            TotpEnbaledDisabled={TotpEnbaledDisabled}
          />
        </>
      )}
    </>
  );
};
