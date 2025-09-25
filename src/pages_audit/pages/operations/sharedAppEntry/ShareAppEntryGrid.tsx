import { CUSTOM_SCREEN_FLAG } from "components/utilFunction/constant";
import ConfirmationGridWrapper from "pages_audit/pages/confirmations";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ShareAppEntryGrid = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!location.state?.fromClose) {
      navigate("new-entry", {
        replace: true,
        state: {
          ...location.state,
          rows: [
            {
              data: {},
            },
          ],
          from: "new-entry",
          formmode: "new",
        },
      });
    }
  }, [navigate, location.state, location.key]);
  return (
    <ConfirmationGridWrapper screenFlag={CUSTOM_SCREEN_FLAG.SHARE_APP_ENTRY} />
  );
};

export default ShareAppEntryGrid;
