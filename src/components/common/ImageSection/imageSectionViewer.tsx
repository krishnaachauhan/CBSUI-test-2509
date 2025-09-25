import React from "react";
import { Box, Paper, Theme, Tooltip, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { t } from "i18next";
import { utilFunction } from "@acuteinfo/common-base";
import CustomAppBar from "../CustomAppBar";

const useTypeStyles = makeStyles((theme: Theme) => ({
  imgSecPaper: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    overflow: "hidden",
    height: "90%",
    padding: "0 10px 10px 10px",
    "@media (max-width: 1024px)": {
      flex: "0 0 auto",
      width: "100%",
      margin: "8px 0",
      height: "350px",
    },
  },
  imgContainer: {
    flex: "1 1 90%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    background: "var(--theme-color4)",
    "@media (max-width: 1024px)": {
      height: "100%",
    },
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "fill",
    cursor: "zoom-in",
  },
  imgLabel: {
    textAlign: "center",
    flex: "0 0 10%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: "450px",
    flexDirection: "row",
    gap: "8px",
    padding: "0 8px",
    "@media (max-width: 1024px)": {
      flexDirection: "column",
      height: "auto",
    },
  },
}));

interface ImageSection {
  label: string;
  imageKey: string;
  altText: string;
}

interface PhotoSignImageViewerProps {
  data: any;
  imageSections?: ImageSection[];
  onImageClick?: (imageUrl: string) => void;
  showAppBar?: boolean;
  appBarTitle?: string;
  closeButtonText?: string;
  noImageMessage?: (status?: string, message?: string) => string;
  customStyles?: any;
  children?: React.ReactNode;
  onClose: () => void;
}

const ImageSectionViewer: React.FC<PhotoSignImageViewerProps> = ({
  data,
  imageSections = [],
  onImageClick,
  showAppBar = true,
  appBarTitle,
  closeButtonText = "Close",
  noImageMessage = (status, message) =>
    status === "999" ? message : t("NoImageFound"),
  customStyles,
  children,
  onClose,
}) => {
  const headerClasses = useTypeStyles();

  const renderImageSection = (
    item: any,
    label: string,
    imageKey: string,
    altText: string
  ) => (
    <Paper className={headerClasses?.imgSecPaper}>
      <Typography
        variant="h6"
        component="div"
        className={headerClasses?.imgLabel}
      >
        {label}
      </Typography>
      <Box className={headerClasses?.imgContainer}>
        {item?.[imageKey] ? (
          <Tooltip
            title={t("ToZoomInOnTheImagesClickOnItOnce")}
            placement="top"
            arrow
          >
            <Box
              component="img"
              src={URL.createObjectURL(
                utilFunction?.base64toBlob(item?.[imageKey])
              )}
              alt={altText}
              className={headerClasses?.img}
              onClick={() => {
                if (onImageClick) {
                  onImageClick(
                    URL.createObjectURL(
                      utilFunction?.base64toBlob(item?.[imageKey])
                    )
                  );
                }
              }}
            />
          </Tooltip>
        ) : (
          <Typography
            variant="h6"
            width="200px"
            fontSize="26px"
            margin="25px"
            sx={{ textAlign: "center" }}
          >
            {noImageMessage(item?.O_STATUS, item?.O_MESSAGE)}
          </Typography>
        )}
      </Box>
    </Paper>
  );

  return (
    <div id="draggable-dialog-title" style={{ cursor: "move" }}>
      {showAppBar && (
        <CustomAppBar
          title={appBarTitle || ""}
          actions={[
            {
              label: t(closeButtonText),
              onClick: onClose,
            },
          ]}
          backgroundColor={customStyles?.appBar?.backgroundColor}
          className={customStyles?.appBar?.className}
        />
      )}
      <Box
        className={headerClasses?.contentContainer}
        sx={{
          overflow: "auto",
          width: "100%",
          ...customStyles?.contentContainer,
        }}
      >
        {data &&
          Array.isArray(imageSections) &&
          imageSections?.length > 0 &&
          imageSections?.map((section, index) => (
            <React.Fragment key={index}>
              {renderImageSection(
                data,
                section?.label,
                section?.imageKey,
                section?.altText
              )}
            </React.Fragment>
          ))}
        {children}
      </Box>
    </div>
  );
};

export default ImageSectionViewer;
