import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./authContext";
import { veirfyUsernameandPassword, verifyOTP } from "./api";
import * as API from "./api";
import { useQuery } from "react-query";
import { GeneralAPI } from "registry/fns/functions";
import { MultiLanguages } from "./multiLanguages";
import { FullScreenLoader } from "@acuteinfo/common-base";
import { AuthControllerWrapper } from "@acuteinfo/common-screens";

export const AuthLoginController = () => {
  const [specialChar, setSpecialChar] = useState(
    sessionStorage.getItem("specialChar") || ""
  );
  const { isLoggedIn, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    if (isLoggedIn()) {
      navigate("/EnfinityCore", { replace: true });
    }
  }, [navigate, isLoggedIn]);

  const {
    data: imageData,
    isLoading,
    isFetching,
  } = useQuery<any, any>(["getLoginImageData"], () => API.getImageData(), {
    enabled,
  });

  const {
    data: content,
    isLoading: isContentLoading,
    isFetching: isContentFetching,
  } = useQuery<any, any>(["getLoginContentData"], () => API.getContentData(), {
    enabled,
  });

  useEffect(() => {
    setEnabled(true);
    GeneralAPI.setDocumentName("Enfinity");
  }, []);

  useEffect(() => {
    setSpecialChar(sessionStorage.getItem("specialChar") || "");
    // Harshit made changed
    sessionStorage.setItem("encReqDecFlag", imageData?.[0]?.ENCRYPT_REQ);
  }, [imageData]);

  return (
    <>
      {isLoading || isFetching || isContentLoading || isContentFetching ? (
        <FullScreenLoader />
      ) : (
        <>
          <AuthControllerWrapper
            bannerDetails={{
              bannerImg: imageData?.[0]?.BANK_LOGO ?? "",
              bannerTitle: content?.[0]?.APP_NM ?? "",
              bannerNote: content?.[0]?.NOTE ?? "",
            }}
            logoUrl={imageData?.[0]?.DASHBOARD_APP_LOGO ?? ""}
            logoTitle="Enfinity Core v1.1.17"
            veirfyUsernameandPassword={veirfyUsernameandPassword}
            verifyOTP={verifyOTP}
            loginFn={login}
            OTPResendRequest={API.OTPResendRequest}
            ResetPassword={API.ResetPassword}
            validatePasswordFn={API.validatePasswords}
            LanguageComponent={MultiLanguages}
            forgotPasswordEndpoint="forgotpassword"
            preventSpecialChars={specialChar ?? ""}
          />
        </>
      )}
    </>
  );
};
