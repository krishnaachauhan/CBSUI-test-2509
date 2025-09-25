import React, { useContext } from "react";
import { CkycContext } from "../../../CkycContext";
import { GradientButton } from "@acuteinfo/common-base";
import { CircularProgress, Grid } from "@mui/material";
import { t } from "i18next";
import { ClonedCkycContext } from "./legalComps/ClonedCkycContext";

const TabNavigate = ({
  handleSave,
  displayMode,
  isModal,
}: {
  handleSave: any;
  displayMode: string;
  isModal?: boolean;
}) => {
  const { state, handleColTabChangectx, handleUpdateViewedTabs } = useContext(
    isModal ? ClonedCkycContext : CkycContext
  );
  const steps: any[] = state?.tabsApiResctx.filter((tab) => tab.isVisible);
  const totalTab: any | number = Array.isArray(steps) && steps.length;
  return !state?.customerIDctx?.trim() ? (
    <Grid
      container
      item
      sx={{
        position: "fixed",
        bottom: { xs: "5px", sm: "10px" },
        right: { xs: "0", sm: "30px" },
        width: { xs: "100%", sm: "auto" },
        justifyContent: { xs: "center", sm: "flex-end" },
        padding: { xs: "8px", sm: "10px 16px" },
        zIndex: 1000,
        gap: 1,
        flexWrap: "wrap",
      }}
    >
      {/* {Boolean(state?.colTabValuectx && state?.colTabValuectx > 0) && (
        <GradientButton
          sx={{ mr: 2, mb: 2 }}
          disabled={state?.isButtonDisable}
          onClick={(e) => handleSave(e, "PREVIOUS")}
        >
          {t("Previous")}
        </GradientButton>
      )} */}

      {displayMode === "new" && state?.colTabValuectx > 0 ? (
        <GradientButton
          disabled={state?.isButtonDisable}
          onClick={(e) => handleSave(e, "PREVIOUS")}
        >
          {t("Previous")}
        </GradientButton>
      ) : displayMode == "edit" && state?.colTabValuectx > 0 ? (
        <GradientButton
          disabled={state?.isButtonDisable}
          onClick={(e) => handleSave(e, "PREVIOUS")}
        >
          {t("Previous")}
        </GradientButton>
      ) : (
        displayMode == "view" &&
        state?.colTabValuectx > 0 && (
          <GradientButton
            disabled={state?.isButtonDisable}
            onClick={(e) => {
              handleColTabChangectx(state?.colTabValuectx - 1);
            }}
          >
            {t("Previous")}
          </GradientButton>
        )
      )}

      {displayMode === "new" ? (
        <GradientButton
          disabled={state?.isButtonDisable}
          onClick={(e) => handleSave(e, "NEXT")}
        >
          {totalTab - 1 === state?.colTabValuectx
            ? t("Save")
            : state?.colTabValuectx === 2
            ? t("SaveandNext")
            : t("Next")}
        </GradientButton>
      ) : displayMode == "edit" ? (
        <GradientButton
          disabled={state?.isButtonDisable}
          onClick={(e) => handleSave(e, "NEXT")}
        >
          {totalTab - 1 === state?.colTabValuectx
            ? t("Update")
            : state?.colTabValuectx === 2
            ? t("UpdateAndNext")
            : t("Next")}
        </GradientButton>
      ) : (
        displayMode == "view" &&
        totalTab - 1 !== state?.colTabValuectx && (
          <GradientButton
            disabled={state?.isButtonDisable}
            onClick={(e) => {
              handleColTabChangectx(state?.colTabValuectx + 1);
              const updatedTabNameList = (state?.tabNameList || []).map(
                (tab, idx) =>
                  idx === Number(state?.colTabValuectx) + 1
                    ? { ...tab, isViewed: true }
                    : tab
              );
              handleUpdateViewedTabs({
                tabNameList: updatedTabNameList,
              });
            }}
          >
            {t("Next")}
          </GradientButton>
        )
      )}
    </Grid>
  ) : null;
};

export default TabNavigate;
