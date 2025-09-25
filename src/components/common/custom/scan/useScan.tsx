import { GradientButton, utilFunction } from "@acuteinfo/common-base";
import { AppBar, Dialog, Toolbar, Tooltip, Typography } from "@mui/material";
import { t } from "i18next";
import { useEffect, useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";
import Rotate90DegreesCcwIcon from "@mui/icons-material/Rotate90DegreesCcw";
import Rotate90DegreesCwIcon from "@mui/icons-material/Rotate90DegreesCw";

export const useScan = () => {
  const [thumbnails, setThumbnails] = useState<any>();
  const [previewScan, setPreviewScan] = useState<boolean>(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const startWebSocketConnection = () => {
    const ws = new WebSocket("ws://localhost:8181/");

    ws.onopen = () => {
      setIsScanning(true);
      ws.send("1100"); // Send scan command on open
    };

    // const handleDownload = () => {
    //   const zipUrl = `${window.location.origin}/scan/ScanApps.zip`; // Correct path
    //   const a = document.createElement("a");
    //   a.href = zipUrl;
    //   a.download = "ScanApps.zip"; // Just the file name
    //   document.body.appendChild(a);
    //   a.click();
    //   document.body.removeChild(a);
    //   // localStorage.setItem("ScanDownload", "Y");
    // };

    ws.onmessage = async (event) => {
      if (event.data instanceof Blob) {
        const imgId = `upl_image${thumbnails?.length + 1}`;
        const newThumbnail = {
          id: imgId,
          // src: (await utilFunction.convertBlobToBase64(event.data))?.[1],
          src: URL.createObjectURL(event.data as any),
          caption: `Scan ${thumbnails?.length + 1}`,
        };
        setThumbnails([newThumbnail]);
        setPreviewScan(true);
      }
    };

    ws.onerror = (error) => {
      // const value = localStorage.getItem("ScanDownload");
      // if (value !== "Y") {
      //   alert("Please Install app from download file and scan again");
      //   handleDownload();
      // } else {
      // }
      if (socket) socket.close();
      const a = document.createElement("a");
      a.href = "acuteScanApp://open";
      a.click();
      setIsScanning(false);
    };

    ws.onclose = (close) => {
      if (socket) socket.close();
      setIsScanning(false);
    };

    setSocket(ws);
  };

  const handleScan = () => {
    setThumbnails([]); // Clear previous thumbnails
    startWebSocketConnection(); // Start a new WebSocket connection
  };

  return {
    thumbnails,
    isScanning,
    handleScan,
    startWebSocketConnection,
    previewScan,
    setPreviewScan,
  };
};

interface PreviewScanProps {
  imageData: { id: string; src: any; caption: string }[];
  previewScan: boolean;
  setPreviewScan: (value: boolean) => void;
  setScanImage: (value: any) => void;
}

export const PreviewScan: React.FC<PreviewScanProps> = ({
  imageData,
  previewScan,
  setPreviewScan,
  setScanImage,
}) => {
  const [rotation, setRotation] = useState(0);
  const editor = useRef<any>(null);
  const [zoom, setZoomValue] = useState<number>(1);
  // Function to  Increase rotation angle
  const handleRotate = (rotate) => {
    if (rotate === "plus") {
      setRotation((prev) => prev + 90);
    } else if (rotate === "minus") {
      setRotation((prev) => prev - 90);
    } else if (rotate === "P") {
      setRotation((prev) => prev + 1);
    } else if (rotate === "M") {
      setRotation((prev) => prev - 1);
    }
  };
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth * 0.27, // 27vw
    height: window.innerHeight * 0.63, // 63vh
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth * 0.27,
        height: window.innerHeight * 0.63,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <Dialog
      open={previewScan}
      fullWidth
      PaperProps={{
        style: {
          maxWidth: "45%",
          minHeight: "85%",
          textAlign: "center",
        },
      }}
      onKeyDown={(e) => {
        if (e.shiftKey && e.ctrlKey && e.key === "+") {
          setZoomValue((old) => {
            let newZoom = old + 0.1; // Increase or
            return Math.max(newZoom, 0.1); // Allow zooming down to 10% of
          });
        } else if (e.shiftKey && e.ctrlKey && e.key === "-") {
          setZoomValue((old) => {
            let newZoom = old + -0.1; // Increase or
            return Math.max(newZoom, 0.1); // Allow zooming down to 10% of
          });
        } else if (e.shiftKey && e.key === "+") {
          handleRotate("P");
        } else if (e.shiftKey && e.key === "-") {
          handleRotate("M");
        }
      }}
    >
      <div style={{ padding: "10px" }}>
        <AppBar position="relative" sx={{ background: "var(--primary-bg)" }}>
          <Toolbar
            variant="dense"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              minHeight: "40px !important",
            }}
          >
            <Typography component="div" variant="h6" color="primary">
              Scanned Image
            </Typography>
            <div>
              <Tooltip title="Rotate">
                <GradientButton
                  color={"primary"}
                  sx={{ minWidth: "30px !important" }}
                  variant="contained"
                  onClick={() => handleRotate("plus")}
                >
                  <Rotate90DegreesCcwIcon />
                </GradientButton>
              </Tooltip>
              <Tooltip title="Rotate">
                <GradientButton
                  sx={{ minWidth: "30px !important" }}
                  color={"primary"}
                  variant="contained"
                  onClick={() => handleRotate("minus")}
                >
                  <Rotate90DegreesCwIcon />
                </GradientButton>
              </Tooltip>
              <Tooltip title="Send">
                <GradientButton
                  color={"primary"}
                  variant="contained"
                  onClick={async (e) => {
                    if (Boolean(editor.current)) {
                      const canvasScaled =
                        editor.current.getImageScaledToCanvas();
                      canvasScaled.toBlob(async (blob) => {
                        let imageData: any =
                          await utilFunction.convertBlobToBase64(blob);
                        setScanImage(imageData?.[1]);
                      }, "image/png");
                    }
                    setPreviewScan(false);
                  }}
                >
                  {t("Send")}
                </GradientButton>
              </Tooltip>
              <Tooltip title="Close">
                <GradientButton
                  color={"primary"}
                  variant="contained"
                  onClick={() => setPreviewScan(false)}
                >
                  {t("close")}
                </GradientButton>
              </Tooltip>
            </div>
          </Toolbar>
        </AppBar>
      </div>
      <Tooltip
        sx={{ fontSize: "30px" }}
        title={
          <>
            Zoom :- Ctrl + Shift + "+/-" <br />
            Rotate :- Shift + +/-"
          </>
        }
      >
        <div
          style={{
            margin: "auto",
          }}
          onWheel={(event) => {
            setZoomValue((old) => {
              let newZoom = old + (event.deltaY < 0 ? 0.1 : -0.1); // Increase or
              return Math.max(newZoom, 0.1); // Allow zooming down to 10% of
            });
          }}
        >
          <AvatarEditor
            ref={editor}
            image={imageData?.[0]?.src}
            height={dimensions.height}
            width={dimensions.width}
            border={[3, 3]}
            color={[0, 0, 0, 1]}
            scale={zoom}
            rotate={rotation}
            disableHiDPIScaling={true}
          />
        </div>
      </Tooltip>
    </Dialog>
  );
};
