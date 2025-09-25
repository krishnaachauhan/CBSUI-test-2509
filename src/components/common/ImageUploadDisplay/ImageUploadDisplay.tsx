import React from "react";
import { Box, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import { GradientButton } from "@acuteinfo/common-base";

interface ImageActionButtonsProps {
  type: "photo" | "sign";
  onImport: () => void;
  onScan: () => void;
  onWebcam: () => void;
  onReset: () => void;
  disabled: boolean;
  variant?: "compact" | "full";
  t: any;
}

// Reusable Action Buttons Component
export const ImageActionButtons: React.FC<ImageActionButtonsProps> = ({
  type,
  onImport,
  onScan,
  onWebcam,
  onReset,
  disabled,
  variant = "compact",
  t,
}) => {
  if (variant === "full") {
    return (
      <Box display={"flex"}>
        <GradientButton
          onClick={onScan}
          sx={{ minWidth: "8rem", mt: 2 }}
          disabled={disabled}
        >
          {t(type === "photo" ? "ScanPhoto" : "ScanSignature")}
        </GradientButton>
        <GradientButton
          onClick={onWebcam}
          sx={{ minWidth: "8rem", mt: 2 }}
          disabled={disabled}
        >
          {t(type === "photo" ? "WebcamPhoto" : "WebcamSignature")}
        </GradientButton>
        <GradientButton
          onClick={onReset}
          sx={{ minWidth: "8rem", mt: 2 }}
          disabled={disabled}
        >
          Reset
        </GradientButton>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      gap={1}
      sx={{
        marginTop: "8px",
        justifyContent: "center",
        minHeight: "32px",
      }}
    >
      <GradientButton
        onClick={onImport}
        sx={{
          minWidth: "65px",
          maxWidth: "65px",
          fontSize: "0.875rem",
          height: "28px",
        }}
        disabled={disabled}
      >
        Import
      </GradientButton>
      <GradientButton
        onClick={onScan}
        sx={{
          minWidth: "65px",
          maxWidth: "65px",
          fontSize: "0.875rem",
          height: "28px",
        }}
        disabled={disabled}
      >
        Scan
      </GradientButton>
      <GradientButton
        onClick={onWebcam}
        sx={{
          minWidth: "65px",
          maxWidth: "65px",
          fontSize: "0.875rem",
          height: "28px",
        }}
        disabled={disabled}
      >
        Webcam
      </GradientButton>
      <GradientButton
        onClick={onReset}
        sx={{
          minWidth: "65px",
          maxWidth: "65px",
          fontSize: "0.875rem",
          height: "28px",
        }}
        disabled={disabled}
      >
        Reset
      </GradientButton>
    </Box>
  );
};

interface ImageDisplayContainerProps {
  fileURL: any;
  type: "photo" | "sign";
  onImport: () => void;
  disabled: boolean;
  variant?: "compact" | "full";
  classes?: any;
  t: any;
  onImageClick?: () => void;
}

export const ImageDisplayContainer: React.FC<ImageDisplayContainerProps> = ({
  fileURL,
  type,
  onImport,
  disabled,
  variant = "compact",
  classes,
  t,
  onImageClick,
}) => {
  if (variant === "full") {
    return (
      <div
        className={classes?.uploadWrapper}
        style={{
          width: "300px",
          height: "190px",
          background: "#cfcfcf",
          cursor: "pointer",
          padding: "4px",
          border: "2px dashed var(--theme-color6)",
        }}
      >
        <Grid container spacing={0} justifyContent="center" alignItems="center">
          {Boolean(fileURL?.current) && onImageClick ? (
            <Tooltip
              title="Click to zoom in on the image"
              placement="top"
              arrow
            >
              <Box
                component="img"
                src={fileURL?.current}
                alt={`${type} Image`}
                style={{
                  maxWidth: "300px",
                  minWidth: "300px",
                  maxHeight: "190px",
                  minHeight: "190px",
                  cursor: "zoom-in",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
                onClick={() => {
                  onImageClick && onImageClick();
                }}
              />
            </Tooltip>
          ) : (
            <img
              src={Boolean(fileURL?.current) ? fileURL?.current : ""}
              style={{
                maxWidth: "300px",
                minWidth: "300px",
                maxHeight: "190px",
                minHeight: "190px",
              }}
            />
          )}
        </Grid>
        <div
          className="image-upload-icon"
          onClick={onImport}
          style={{
            width: "300px",
            height: "190px",
            borderRadius: "5%",
            pointerEvents: disabled ? "none" : "auto",
          }}
        >
          <IconButton>
            <AddAPhotoIcon htmlColor="white" />
          </IconButton>
          <Typography
            component={"span"}
            style={{
              margin: "0",
              color: "white",
              lineHeight: "1.5",
              fontSize: "0.75rem",
              fontFamily: "Public Sans,sans-serif",
              fontWeight: "400",
            }}
          >
            {t(type === "photo" ? "UploadPhotoImage" : "UploadSignatureImage")}
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "320px",
        height: "220px",
        borderRadius: "8px",
        position: "relative",
        overflow: "hidden",
        border: "2px solid #e0e0e0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      {Boolean(fileURL?.current) ? (
        onImageClick ? (
          <Tooltip title="Click to zoom in on the image" placement="top" arrow>
            <Box
              component="img"
              src={fileURL?.current}
              alt={`${type} Image`}
              style={{
                maxWidth: "320px",
                minWidth: "320px",
                maxHeight: "220px",
                minHeight: "220px",
                borderRadius: "4px",
                objectFit: "cover",
                cursor: "zoom-in",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
              onClick={() => {
                onImageClick && onImageClick();
              }}
            />
          </Tooltip>
        ) : (
          <img
            src={fileURL?.current}
            style={{
              maxWidth: "320px",
              minWidth: "320px",
              maxHeight: "220px",
              minHeight: "220px",
              borderRadius: "4px",
              objectFit: "cover",
            }}
          />
        )
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          sx={{
            width: "100%",
            height: "100%",
            color: "#9e9e9e",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <AddAPhotoIcon sx={{ fontSize: 48, mb: 1, color: "#bdbdbd" }} />
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#757575",
              lineHeight: 1.2,
            }}
          >
            No {type === "photo" ? "Photo" : "Signature"}
            <br />
            Image Available
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.75rem",
              color: "#9e9e9e",
              mt: 0.5,
            }}
          >
            Click Import to add {type === "photo" ? "photo" : "signature"}
          </Typography>
        </Box>
      )}
    </div>
  );
};

interface ImageUploadDisplayProps {
  type: "photo" | "sign";
  title: string;
  fileURL: any;
  fileSize?: number;
  uploadControlRef: any;
  submitBtnRef?: any;
  filecnt?: number;
  classes?: any;
  onFileSelect: (e: any, type: string) => void;
  onImport: () => void;
  onScan: () => void;
  onWebcam: () => void;
  onReset: () => void;
  disabled: boolean;
  t: any;
  variant?: "compact" | "full";
  showFileSize?: boolean;
  onImageClick?: () => void;
}

// Main Image Upload Display Component
export const ImageUploadDisplay: React.FC<ImageUploadDisplayProps> = ({
  type,
  title,
  fileURL,
  fileSize = 0,
  uploadControlRef,
  submitBtnRef,
  filecnt,
  classes,
  onFileSelect,
  onImport,
  onScan,
  onWebcam,
  onReset,
  disabled,
  t,
  variant = "compact",
  showFileSize = true,
  onImageClick,
}) => {
  if (variant === "full") {
    return (
      <Grid item xs={12} sm={6} md={6} style={{ paddingBottom: "10px" }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          sx={{ margin: "10px" }}
        >
          <Typography color="inherit" variant={"h6"} component="div">
            {title}
          </Typography>
          <Tooltip
            key={"tooltip-" + filecnt}
            title={`Click to upload the ${
              type === "photo" ? "Photo" : "Signature"
            } Image`}
            placement={"top"}
            arrow={true}
          >
            <>
              <ImageDisplayContainer
                fileURL={fileURL}
                type={type}
                onImport={() => uploadControlRef?.current?.click()}
                disabled={disabled}
                variant="full"
                classes={classes}
                t={t}
                onImageClick={onImageClick}
              />
              <input
                name="fileselect"
                type="file"
                style={{ display: "none" }}
                ref={uploadControlRef}
                onChange={(event) => onFileSelect(event, type)}
                accept="image/*"
                onClick={(e) => {
                  //@ts-ignore
                  e.target.value = "";
                }}
              />
              <ImageActionButtons
                type={type}
                onImport={() => uploadControlRef?.current?.click()}
                onScan={onScan}
                onWebcam={onWebcam}
                onReset={onReset}
                disabled={disabled}
                variant="full"
                t={t}
              />
            </>
          </Tooltip>
        </Box>
      </Grid>
    );
  }

  return (
    <Grid item xs={12} sm={12} md={6}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        sx={{
          margin: "10px",
          minHeight: "320px",
          padding: "10px",
          border: "2px solid #e0e0e0",
          borderRadius: "12px",
          background: "linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)",
          boxShadow:
            "0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.06)",
        }}
      >
        <Typography
          color="inherit"
          variant={"h6"}
          component="div"
          sx={{
            marginBottom: "2px",
            color: "#2c3e50",
            fontWeight: 600,
            textAlign: "center",
            fontSize: "1.2rem",
          }}
        >
          {title}
        </Typography>

        {/* Image Display Container */}
        <div ref={submitBtnRef} key={"div" + filecnt}>
          <ImageDisplayContainer
            fileURL={fileURL}
            type={type}
            onImport={() => uploadControlRef?.current?.click()}
            disabled={disabled}
            variant="compact"
            classes={classes}
            t={t}
            onImageClick={onImageClick}
          />
        </div>

        <input
          name="fileselect"
          type="file"
          style={{ display: "none" }}
          ref={uploadControlRef}
          onChange={(event) => onFileSelect(event, type)}
          accept="image/*"
          onClick={(e) => {
            //@ts-ignore
            e.target.value = "";
          }}
        />

        {/* File Size Display */}
        {showFileSize && fileSize > 0 && (
          <Typography
            variant="caption"
            sx={{
              mt: 1,
              mb: 0,
              color: "text.secondary",
              textAlign: "center",
              fontSize: "0.8rem",
              height: "20px",
            }}
          >
            {t(type === "photo" ? "PhotoSize" : "SignatureSize")}:{" "}
            {fileSize?.toFixed(2)} kb
          </Typography>
        )}
        {showFileSize && !fileSize && <Box sx={{ height: "20px" }} />}

        {/* Action Buttons */}
        <ImageActionButtons
          type={type}
          onImport={() => uploadControlRef?.current?.click()}
          onScan={onScan}
          onWebcam={onWebcam}
          onReset={onReset}
          disabled={disabled}
          variant="compact"
          t={t}
        />
      </Box>
    </Grid>
  );
};

export default ImageUploadDisplay;
