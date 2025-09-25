import styled from "@emotion/styled";
import { Avatar, tooltipClasses } from "@mui/material";
import { utilFunction } from "@acuteinfo/common-base";
import { AuthContext } from "pages_audit/auth";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import { Tooltip } from "reactstrap";
import { getBankimgAndProfileimgs } from "./api";
import { useStyles } from "./style";
import Logo from "assets/images/easy_bankcore_Logo.png";
import USER_PROFILE_DEFAULT from "assets/images/USER_PROFILE_DEFAULT.png";
const useLogoPics = () => {
  const [pictureURL, setPictureURL] = useState<any | null>({
    bank: "",
    profile: "",
    logo: "",
    version: "",
  });
  const authController = useContext(AuthContext);
  const urlObj = useRef<any>({ bank: "", profile: "", logo: "" });
  const classes = useStyles();
  const imagesData = useQuery<any, any>(["getBankimgAndProfileimg"], () =>
    getBankimgAndProfileimgs({
      userID: authController?.authState?.user?.id,
      companyID: authController?.authState?.access_token?.companyID,
    })
  );

  useEffect(() => {
    if (Boolean(imagesData.data?.[0]?.PROFILE_PHOTO)) {
      let blob = utilFunction.base64toBlob(imagesData.data?.[0]?.PROFILE_PHOTO);
      urlObj.current = {
        ...urlObj.current,
        profile:
          typeof blob === "object" && Boolean(blob)
            ? URL.createObjectURL(blob)
            : "",
      };
      setPictureURL((old) => {
        return { ...old, profile: urlObj.current?.profile };
      });
    }
  }, [imagesData.data?.[0]?.PROFILE_PHOTO]);

  useEffect(() => {
    if (Boolean(imagesData.data?.[0]?.DHLOGO)) {
      let blob = utilFunction.base64toBlob(imagesData.data?.[0]?.DHLOGO);
      urlObj.current = {
        ...urlObj.current,
        logo:
          typeof blob === "object" && Boolean(blob)
            ? URL.createObjectURL(blob)
            : "",
      };
      setPictureURL((old) => {
        return { ...old, logo: urlObj.current?.logo };
      });
    }
  }, [imagesData.data?.[0]?.DHLOGO]);

  useEffect(() => {
    if (Boolean(imagesData.data?.[0]?.BANK_LOGO)) {
      let blob = utilFunction.base64toBlob(imagesData.data?.[0]?.BANK_LOGO);
      urlObj.current = {
        ...urlObj.current,
        bank:
          typeof blob === "object" && Boolean(blob)
            ? URL.createObjectURL(blob)
            : "",
      };
      setPictureURL((old) => {
        return { ...old, bank: urlObj.current?.bank };
      });
    }
  }, [imagesData.data?.[0]?.BANK_LOGO]);

  useEffect(() => {
    if (Boolean(imagesData.data?.[0]?.VERSION)) {
      const updatedVersion = imagesData?.data?.[0]?.VERSION;
      setPictureURL((old) => {
        return { ...old, version: updatedVersion };
      });
    }
  }, [imagesData.data?.[0]?.VERSION]);

  return pictureURL;
};

export default useLogoPics;
