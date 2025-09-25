import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import {
  Box,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import { GradientButton } from "@acuteinfo/common-base";
import { t } from "i18next";

const WebCamImage = ({ isOpen = false, onActionNo, onSaveImage }) => {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);

  useEffect(() => {
    setIsWebcamActive(true);
    setCapturedImage(null); // Reset captured image
    setWebcamError(null); // Reset webcam error
  }, [isOpen]);

  const capture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
    }
  };

  const handleWebcamError = () => {
    setWebcamError("Webcam not found. Please attach a webcam.");
    setIsWebcamActive(false);
  };

  const handleSave = () => {
    if (capturedImage) {
      onSaveImage(capturedImage); // Pass captured image to parent component
    }
    onActionNo();
  };
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Dialog open={isOpen} onClose={onActionNo} maxWidth="md" fullWidth>
        <DialogTitle>Webcam</DialogTitle>

        <DialogContent>
          <Box display="flex" justifyContent="center" mb={2}>
            <Box
              sx={{
                width: "400px",
                height: "300px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                border: "2px solid black",
                marginRight: "10px",
              }}
            >
              {isWebcamActive && !webcamError && (
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  style={{ width: "100%", height: "100%" }}
                  onUserMediaError={handleWebcamError}
                />
              )}
              {webcamError && (
                <Typography variant="h6" component="div" color="error">
                  {webcamError}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                width: "400px",
                height: "300px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                border: "2px solid black",
              }}
            >
              {capturedImage ? (
                <Box
                  component="img"
                  src={capturedImage}
                  alt="Captured"
                  sx={{ width: "100%", height: "100%" }}
                />
              ) : (
                <Typography variant="h6" component="div">
                  No image captured
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          {isWebcamActive && !webcamError && (
            <>
              <GradientButton onClick={capture}>Capture Photo</GradientButton>
              <GradientButton onClick={handleSave}>Save</GradientButton>
              <GradientButton onClick={onActionNo}>Close</GradientButton>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WebCamImage;
