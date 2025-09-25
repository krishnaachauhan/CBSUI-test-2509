import { useContext, useEffect, useRef, useState } from "react";
import branchSelectionSideImage from "assets/images/sideImage.png";
import * as API from "./api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import Logo from "assets/images/easy_bankcore_Logo.png";
import useLogoPics from "components/logoPics/logoPics";
import { BranchSelectionGridWrapper } from "@acuteinfo/common-screens";
import { useQuery } from "react-query";
import { getImageData } from "../api";
import { utilFunction } from "@acuteinfo/common-base";
import { isBase64 } from "components/utilFunction/function";

export const BranchSelectionGrid = ({ selectionMode }) => {
  const { authState, isBranchSelected, branchSelect, isLoggedIn, logout } =
    useContext(AuthContext);
  const navigate = useNavigate();
  const [dashboardLogoURL, setDashboardLogoURL] = useState<any | null>(null);
  const urlObj = useRef<any>(null);
  const logos = useLogoPics();
  const {
    data: imageData,
    isLoading,
    isFetching,
  } = useQuery<any, any>(["getLoginImageData"], () => getImageData());
  useEffect(() => {
    if (Boolean(imageData && !isLoading)) {
      const logoUrl = imageData?.[0]?.DASHBOARD_APP_LOGO;
      if (isBase64(logoUrl)) {
        let blob = utilFunction.base64toBlob(logoUrl);
        urlObj.current =
          typeof blob === "object" && Boolean(blob)
            ? URL.createObjectURL(blob)
            : "";
        setDashboardLogoURL(urlObj.current);
      } else {
        setDashboardLogoURL(logoUrl);
      }
    }
  }, [imageData, isLoading]);

  return (
    <>
      <BranchSelectionGridWrapper
        BranchSelectionGridDataApiFn={API.BranchSelectionGridData}
        GetMenuDataApiFn={API.GetMenuData}
        authState={authState}
        branchSelectFn={branchSelect}
        isBranchSelectedFn={isBranchSelected}
        isLoggedInFn={isLoggedIn}
        logoutFn={logout}
        dashboardUrl="/EnfinityCore/dashboard"
        loginUrl="/EnfinityCore/login"
        logos={logos}
        navigate={navigate}
        selectionMode={selectionMode}
        sideImage={branchSelectionSideImage}
        logo={dashboardLogoURL}
        appTranCd="51"
      />
    </>
  );
};
