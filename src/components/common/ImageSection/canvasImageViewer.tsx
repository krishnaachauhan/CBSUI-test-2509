import { GradientButton } from "@acuteinfo/common-base";
import { AppBar, Container, Theme, Toolbar, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useReactToPrint } from "react-to-print";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

const useTypeStyles = makeStyles((theme: Theme) => ({
  title: {
    flex: "1 1 100%",
    color: "var(--white)",
    letterSpacing: "1px",
    fontSize: "1.2rem",
  },
  appbar: {
    background: "var(--theme-color5)",
    width: "100%",
    position: "relative",
    "@media print": {
      display: "none !important",
    },
  },
  canvasContainer: {
    height: "70vh",
    overflow: "auto",
    position: "relative",
  },
  printContainer: {
    width: "100%",
    height: "100%",
    cursor: "zoom-in",
    display: "none",
    "@media print": {
      display: "block !important",
    },
  },
}));

type AccountData = {
  CUSTOMER_ID: string;
  CUST_NM: string;
};

type CanvasImageViewerProps = {
  imageUrl?: string;
  isOpen?: boolean;
  onClose?: () => void;
  data?: AccountData;
  printContent?: React.ReactNode;
  headerContent?: String;
};

const CanvasImageViewer: React.FC<CanvasImageViewerProps> = ({
  imageUrl,
  isOpen,
  onClose,
  data,
  printContent,
  headerContent,
}) => {
  const canvasRef = useRef<any>(null);
  const printableRef = useRef<any>(null);
  const [rotateAngle, setRotateAngle] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [dragging, setDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [startY, setStartY] = useState<number>(0);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>(
    imageUrl || ""
  );
  const { t } = useTranslation();
  const headerClasses = useTypeStyles();

  useEffect(() => {
    setOriginalImageUrl(imageUrl || "");
  }, [imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      const img = new Image();
      img.src = imageUrl ?? "";

      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);

        canvas.width =
          rotateAngle % 180 === 0
            ? img.width * zoomLevel
            : img.height * zoomLevel;
        canvas.height =
          rotateAngle % 180 === 0
            ? img.height * zoomLevel
            : img.width * zoomLevel;

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate((rotateAngle * Math.PI) / 180);
        context.scale(zoomLevel, zoomLevel);
        context.drawImage(img, -img.width / 2, -img.height / 2);
        context.setTransform(1, 0, 0, 1, 0, 0);
      };
    }
  }, [imageUrl, rotateAngle, zoomLevel, offsetX, offsetY, isOpen]);

  // Handle print logic, without transformations applied
  const handlePrint = useReactToPrint({
    content: () => printableRef.current,
    onBeforeGetContent: () => {
      const img = new Image();
      img.src = originalImageUrl;

      img.onload = () => {
        const context = printableRef.current
          .querySelector("canvas")
          ?.getContext("2d");
        if (context) {
          context.clearRect(0, 0, context.canvas.width, context.canvas.height);
          context.drawImage(img, 0, 0);
        }
      };

      const imgElement = printableRef.current.querySelector("img");
      if (imgElement) {
        imgElement.src = originalImageUrl;
      }

      if (printableRef.current) {
        printableRef.current.style.overflow = "hidden";
      }

      return Promise.resolve();
    },
    onAfterPrint: () => {
      // Reset the state of the canvas and viewer after printing
      if (printableRef.current) {
        printableRef.current.style.overflow = "scroll";
      }
    },
  });

  // Handle mouse down event to start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
  };

  // Handle mouse move event for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const deltaX = (e.clientX - startX) / zoomLevel;
    const deltaY = (e.clientY - startY) / zoomLevel;
    setOffsetX((prev) => prev + deltaX);
    setOffsetY((prev) => prev + deltaY);
    setStartX(e.clientX);
    setStartY(e.clientY);
  };

  // Handle mouse up event to stop dragging
  const handleMouseUp = () => {
    setDragging(false);
  };

  // Reset rotation and zoom to initial state (0 rotation and 1 zoom)
  const handleReset = () => {
    setRotateAngle(0);
    setZoomLevel(1);
    setOffsetX(0);
    setOffsetY(0);
  };

  // Handle keyboard events (left, right, up, down arrow keys)
  const handleKeyDown = (e: KeyboardEvent) => {
    const step = 10 / zoomLevel;
    if (e.key === "ArrowUp") {
      setOffsetY((prev) => prev + step);
    } else if (e.key === "ArrowDown") {
      setOffsetY((prev) => prev - step);
    } else if (e.key === "ArrowLeft") {
      setOffsetX((prev) => prev + step);
    } else if (e.key === "ArrowRight") {
      setOffsetX((prev) => prev - step);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleRotateChange = () => {
    const newRotateValue = (rotateAngle + 90) % 360;
    setRotateAngle(newRotateValue);
  };

  return isOpen ? (
    <Container
      sx={{
        width: "100%",
        overflow: "hidden",
        padding: "0 8px !important",
        margin: "0 !important",
      }}
    >
      <AppBar className={`form__header ${headerClasses.appbar}`}>
        <Toolbar variant="dense" sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            className={headerClasses.title}
            color="inherit"
            variant={"h4"}
            component="div"
          >
            {headerContent ?? ""}
          </Typography>
          <GradientButton onClick={handleRotateChange}>
            <RotateRightIcon
              style={{
                transform: `rotate(${rotateAngle}deg)`,
                transition: "transform 0.3s ease",
              }}
            />
          </GradientButton>
          <GradientButton onClick={() => setZoomLevel((prev) => prev * 1.2)}>
            <ZoomInIcon />
          </GradientButton>
          <GradientButton onClick={() => setZoomLevel((prev) => prev / 1.2)}>
            <ZoomOutIcon />
          </GradientButton>
          <GradientButton onClick={handleReset}>{t("Reset")}</GradientButton>
          <GradientButton onClick={handlePrint}>{t("Print")}</GradientButton>
          <GradientButton onClick={onClose}>{t("Close")}</GradientButton>
        </Toolbar>
      </AppBar>

      {/* Canvas container with scrollable area */}
      <div className={headerClasses.canvasContainer}>
        {/* Canvas for the image */}
        <canvas
          ref={canvasRef}
          style={{ display: "flex", margin: "2% auto" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* This container will be hidden in normal UI but used for print */}
      <div
        className={headerClasses.printContainer}
        ref={printableRef}
        style={{
          transform: "none",
          width: "100%",
        }}
      >
        {printContent ?? null}
        <img src="" alt="Image for print" style={{ width: "100%" }} />
      </div>
    </Container>
  ) : null;
};

export default CanvasImageViewer;
