import React, { useContext, useState } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { styled } from "@mui/system";
import { AuthContext } from "pages_audit/auth";
import { GradientButton } from "@acuteinfo/common-base";
import { useLocation, useNavigate } from "react-router-dom";
import lockIconGif from "assets/images/Failed.gif";
import { t } from "i18next";
// Custom styled components for the card and icon
const AccessDeniedCard = styled(Paper)({
  maxWidth: 400,
  width: "100%",
  borderRadius: "12px",
  boxShadow:
    "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
  overflow: "hidden",
});

const AccessDeniedIconContainer = styled(Box)({
  // Reduced size of the container
  width: "150px",
  height: "150px",
  backgroundColor: "var(--theme-color2)",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  // Reduced bottom margin
  margin: "0 auto",
  padding: "0px",
});

const NotHaveAccess = () => {
  const location = useLocation();
  // Simulate a user role with insufficient privileges
  const { authState } = useContext(AuthContext);

  const navigate = useNavigate();
  // Access denied message component
  const AccessDeniedMessage = () => (
    <Box
      sx={{
        minHeight: "70vh",
        bgcolor: "rgba(250, 251, 255, 0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <AccessDeniedCard>
        <Box sx={{ p: 4, textAlign: "center" }}>
          <AccessDeniedIconContainer>
            {/* Added a style to the image to ensure it fits without extra space */}
            <img
              src={lockIconGif}
              alt="Access Denied Lock GIF"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </AccessDeniedIconContainer>

          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: "bold", color: "var(--theme-color1)", mb: 2 }}
          >
            {t("AccessDenied")}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "var(--theme-color3)",
              mb: 3,
              fontSize: "1.2rem",
              lineHeight: "1.3rem",
            }}
          >
            {t("doNotHaveAccessOfScreen", {
              docCD: location?.state?.DOC_CD ?? "",
              interpolation: { escapeValue: false },
            })}
          </Typography>

          <Box
            sx={{
              bgcolor: "var(--theme-color2)",
              border: "1px solid",
              borderColor: "var(--report-export-theme)",
              borderRadius: "8px",
              p: 2,
              mb: 3,
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: "700", fontSize: "medium", mb: 0.5 }}
            >
              {t("CurrentRole")}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "semibold" }}>
              {authState?.user?.name} -{" "}
              {`${authState?.roleName}(${authState?.role})`}
            </Typography>
          </Box>

          <GradientButton
            onClick={() => navigate("/EnfinityCore/dashboard")}
            startIcon={<ArrowBackIcon />}
          >
            {t("Dashboard")}
          </GradientButton>
        </Box>
      </AccessDeniedCard>
    </Box>
  );

  return (
    <Box sx={{ fontFamily: "sans-serif" }}>
      <AccessDeniedMessage />
    </Box>
  );
};

export default NotHaveAccess;
