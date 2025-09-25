import React, { useContext, useEffect, useState } from "react";
import { GradientButton } from "@acuteinfo/common-base";
import { CircularProgress, Grid } from "@mui/material";
import { t } from "i18next";
import { AcctMSTContext } from "./AcctMSTContext";

const TabNavigate = ({ handleSave, displayMode, isNextLoading }) => {
  const [isDisabled, setIsDisabled] = useState(false);
  const { AcctMSTState: state, handleColTabChangectx } =
    useContext(AcctMSTContext);
  const steps: any[] = state?.tabsApiResctx.filter((tab) => tab.isVisible);
  const totalTab: any | number = Array.isArray(steps) && steps.length;
  // console.log(state?.colTabValuectx, "wieugufwefw", totalTab, Array.isArray(state?.tabNameList), state?.tabNameList.length, state?.tabNameList)
  useEffect(() => {
    setIsDisabled(state?.currentFormctx.isLoading);
  }, [state?.currentFormctx.isLoading]);
  return (
    <Grid
      container
      item
      sx={{
        justifyContent: "flex-end",
        position: "sticky",
        bottom: "0",
        // backgroundColor: "var(--theme-color2)",
        padding: "5px",
        zIndex: 1000,
        // boxShadow: "0 -2px 6px rgba(0,0,0,0.1)",
      }}
    >
      {/* {Boolean(state?.colTabValuectx && state?.colTabValuectx > 0) && (
        <GradientButton
          sx={{ mr: 2 }}
          disabled={state?.currentFormctx.isLoading || isDisabled}
          onClick={(e) => handleColTabChangectx(state?.colTabValuectx - 1)}
        >
          {t("Previous")}
        </GradientButton>
      )}
      {displayMode === "new" ? (
        <GradientButton
          sx={{ mr: 2 }}
          disabled={state?.currentFormctx.isLoading || isDisabled}
          onClick={handleSave}
          endIcon={
            state?.currentFormctx.isLoading ? (
              <CircularProgress size={20} />
            ) : null
          }
        >
          {totalTab - 1 === state?.colTabValuectx ? t("Save") : t("Next")}
        </GradientButton>
      ) : displayMode == "edit" ? (
        <GradientButton
          sx={{ mr: 2 }}
          disabled={state?.currentFormctx.isLoading || isDisabled}
          onClick={handleSave}
        >
          {
            // (totalTab - 1) === state?.colTabValuectx
            // ? state?.fromctx === "new-draft" ? "Save" : "Update"
            // : (state?.colTabValuectx === 2) ? t("Update & Next") : t("Next")
            totalTab - 1 === state?.colTabValuectx ? t("Update") : t("Next")
          }
        </GradientButton>
      ) : (
        displayMode == "view" &&
        totalTab - 1 !== state?.colTabValuectx && (
          <GradientButton
            sx={{ mr: 2 }}
            disabled={state?.currentFormctx.isLoading || isDisabled}
            onClick={(e) => {
              handleColTabChangectx(state?.colTabValuectx + 1);
            }}
          >
            {t("Next")}
          </GradientButton>
        )
      )} */}
    </Grid>
  );
};

export default TabNavigate;
