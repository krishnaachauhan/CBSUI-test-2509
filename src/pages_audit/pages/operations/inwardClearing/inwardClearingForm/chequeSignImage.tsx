import { FC, useEffect, useRef, useState } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { utilFunction } from "@acuteinfo/common-base";
import noPhotoAvailble from "../../../../../assets/images/noPhotoAvailble.png";
import AvatarEditor from "react-avatar-editor";
import { GradientButton } from "@acuteinfo/common-base";
import { makeStyles } from "@mui/styles";
import { useTranslation } from "react-i18next";
import RotateRightIcon from "@mui/icons-material/RotateRight"; // Import right rotation icon
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { useReactToPrint } from "react-to-print";
import {
  AppBar,
  Card,
  CardContent,
  Dialog,
  Grid,
  Theme,
  Toolbar,
  Typography,
} from "@mui/material";

const useTypeStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    background: "var(--theme-color5)",
  },
  title: {
    flex: "1 1 100%",
    color: "var(--white)",
    letterSpacing: "1px",
    fontSize: "1.2rem",
  },
  refreshiconhover: {},
  paper: {
    padding: theme.spacing(1),
    height: "100%",
    borderRadius: "10px",
  },
}));
export const ChequeSignImage: FC<{
  imgData?: any;
  loading?: any;
  error?: any;
  acSignImage?: any;
  formData?: any;
}> = ({ imgData, acSignImage, formData }) => {
  const [chequeImageURL, setChequeImageURL] = useState<any>(null);
  const [signImageURL, setSignImageURL] = useState<any>();
  const urlObj = useRef<any>(null);
  const [isOpen, setIsOpen] = useState<any>(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [rotateImg, setRotate] = useState<number>(0);
  const { t } = useTranslation();
  const canvasRef = useRef<any>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const printRef = useRef<any>(null);
  const headerClasses = useTypeStyles();

  const handleZoomIn = () => setZoomLevel((prev) => prev * 1.2);
  const handleZoomOut = () => setZoomLevel((prev) => prev / 1.2);

  const handleRotateChange = () => {
    const newRotateValue = (rotateImg + 90) % 360;
    setRotate(newRotateValue);
  };
  useEffect(() => {
    const img = new Image();
    img.src = selectedImageUrl;
    img.onload = () => {
      const canvas: any = canvasRef.current;
      const context = canvas.getContext("2d");

      // Set canvas dimensions based on rotation and zoom level
      context.clearRect(0, 0, canvas.width, canvas.height);

      canvas.width =
        rotateImg % 180 === 0 ? img.width * zoomLevel : img.height * zoomLevel;
      canvas.height =
        rotateImg % 180 === 0 ? img.height * zoomLevel : img.width * zoomLevel;

      context.clearRect(0, 0, canvas.width, canvas.height);
      // Apply transformations (rotation and zoom)
      context.translate(canvas.width / 2, canvas.height / 2); // Translate to the center of the canvas
      context.rotate((rotateImg * Math.PI) / 180); // Apply rotation
      context.scale(zoomLevel, zoomLevel); // Apply zoom

      context.drawImage(img, -img.width / 2, -img.height / 2); // Center the image after transformations

      context.setTransform(1, 0, 0, 1, 0, 0); // Reset the transformation matrix to default
    };
  }, [rotateImg, zoomLevel, selectedImageUrl, canvasRef.current]);

  const getCanvasImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      return canvas.toDataURL(); // Get the canvas content as an image
    }
    return "";
  };
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforeGetContent: () => {
      // Get the current canvas image (with transformations)
      const imageUrl = getCanvasImage();

      // Set the image source inside the print container (using canvas data URL)
      const imgElement = printRef.current.querySelector("img");
      if (imgElement) {
        imgElement.src = imageUrl; // Update the image source to canvas data URL
      }

      if (printRef.current) {
        printRef.current.style.overflow = "hidden";
      }

      return Promise.resolve();
    },
    onAfterPrint: () => {
      if (printRef.current) {
        printRef.current.style.overflow = "scroll";
      }
    },
  });

  useEffect(() => {
    if (Boolean(imgData?.[0])) {
      const images: any = [];
      for (let i = 0; i < imgData?.length; i++) {
        const imageProps = [
          { prop: "FR_GREY_IMG", label: "FrontGrey" },
          { prop: "FR_BW_IMG", label: "BlackWhite" },
          { prop: "BACK_IMG", label: "BackImage" },
        ];

        imageProps.forEach(({ prop, label }) => {
          if (Boolean(imgData[i]?.[prop])) {
            const blob = utilFunction.base64toBlob(imgData[i][prop]);
            const url =
              typeof blob === "object" && Boolean(blob)
                ? URL.createObjectURL(blob)
                : "";

            if (url) {
              images.push({ url, label }); // Store both url and label
            }
          }
        });
      }
      setChequeImageURL(images);
    }

    if (Boolean(acSignImage)) {
      let blob = utilFunction.base64toBlob(acSignImage);
      urlObj.current =
        typeof blob === "object" && Boolean(blob)
          ? URL.createObjectURL(blob)
          : "";
      setSignImageURL(urlObj.current);
    } else if (acSignImage?.length === 0) {
      setSignImageURL(null);
    } else if (Boolean(imgData?.[0]?.SIGN_IMG)) {
      let blob = utilFunction.base64toBlob(imgData?.[0]?.SIGN_IMG);
      urlObj.current =
        typeof blob === "object" && Boolean(blob)
          ? URL.createObjectURL(blob)
          : "";
      setSignImageURL(urlObj.current);
    }
  }, [imgData, acSignImage]);
  return (
    <>
      {" "}
      <Grid container spacing={0} justifyContent="center" alignItems="center">
        <Grid item xs={12} md={8} sm={8} lg={8} xl={8}>
          <Carousel
            showArrows={false}
            showThumbs={false}
            showStatus={false}
            showIndicators={true}
            useKeyboardArrows={true}
            // statusFormatter={(current, total): any => (
            //   <div
            //     style={{
            //       padding: "10px",
            //       fontSize: "17px",
            //       position: "relative",
            //       top: "17.4em",
            //     }}
            //   >{`${current} "of" ${total}`}</div>
            // )}
            renderIndicator={(onClickHandler, isSelected, index) => {
              // Ensure chequeImageURL is defined and has images at the current index
              if (!chequeImageURL || chequeImageURL?.length <= index)
                return null;
              // Get the image object for the current index
              const imageInfo = chequeImageURL[index];

              if (!imageInfo?.label) return null;

              return (
                <>
                  <label
                    style={{
                      marginLeft: "20px",
                      color: "var(--theme-color2)",
                    }}
                    key={index}
                  >
                    {t(imageInfo?.label)}
                    <input
                      type="radio"
                      name="carouselIndicator"
                      checked={isSelected}
                      onClick={onClickHandler}
                      style={{
                        cursor: "pointer",
                        position: "relative",
                        top: "2px",
                        left: "5px",
                        color: isSelected
                          ? "var(--theme-color1)"
                          : "var(--theme-color2)",
                      }}
                    />
                  </label>
                  {/* {isSelected && ( // Only show status when the indicator is selected
                    <span
                      style={{
                        marginLeft: "10px",
                        padding: "4px 8px",
                        background: "var(--theme-color1)",
                        color: "#fff",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                    >
                      {`${current} of ${total}`}
                    </span>
                  )} */}
                </>
              );
            }}
            infiniteLoop={false}
            centerMode={true}
            centerSlidePercentage={100}
            selectedItem={0}
            emulateTouch={false}
            // @ts-ignore
            style={{
              paddingLeft: "40px !important",
            }}
            width="90%"
          >
            {chequeImageURL && chequeImageURL.length > 0 ? (
              chequeImageURL.map((imageUrl, index) => (
                <div
                  key={index}
                  style={{
                    paddingLeft: "40px",
                    marginBottom: "5px",
                  }}
                >
                  <Card
                    key={index}
                    sx={{
                      color: "white",
                      background: "var(--theme-color1)",
                      cursor: "grab",
                      Width: "100%",
                    }}
                  >
                    <CardContent
                      style={{
                        padding: "2px 2px 30px 2px",
                      }}
                    >
                      <div
                        ref={printRef}
                        style={{
                          width: "100%",
                          height: "100%",
                          cursor: "zoom-in",
                        }}
                        onClick={() => {
                          setSelectedImageUrl(imageUrl?.url); // Set the clicked image URL
                          setIsOpen(true); // Open the dialog
                        }}
                      >
                        <img
                          src={imageUrl?.url}
                          alt={`image-${index}`}
                          // style={{ height: "100%", width: "100%" }}
                        />
                      </div>
                    </CardContent>
                  </Card>{" "}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "6px", // Adjust as needed
                      right: "10px", // Adjust as needed
                      color: "#fff",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      fontSize: "15px",
                    }}
                  >
                    {`${index + 1} of ${chequeImageURL.length}`}
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  paddingLeft: "40px",
                  marginBottom: "5px",
                }}
              >
                <Card
                  sx={{
                    color: "white",
                    background: "var(--theme-color1)",
                    cursor: "grab",
                  }}
                >
                  <CardContent>
                    <div
                      style={{
                        width: "fit-content",
                        margin: "0 auto",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={noPhotoAvailble}
                        style={{ width: "100%", height: "100%" }} // Set image width and height to 100% to fill its container
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </Carousel>{" "}
        </Grid>
        <>
          {formData?.WITH_SIGN === "Y" ? (
            <>
              <Grid item xs={12} md={4} sm={4} lg={4} xl={4}>
                <div style={{ paddingRight: "40px" }}>
                  <Card
                    sx={{
                      color: "white",
                      background: "var(--theme-color1)",
                      display: "block",
                      margin: "0 auto",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <CardContent
                      style={{
                        padding: "2px",
                        overflow: "hidden",
                      }}
                    >
                      {signImageURL ? (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            justifyContent: "center",
                            cursor: "zoom-in",
                          }}
                          onClick={() => {
                            setSelectedImageUrl(signImageURL); // Set the clicked image URL
                            setIsOpen(true); // Open the dialog
                          }}
                        >
                          <img
                            src={Boolean(signImageURL) ? signImageURL : ""}
                            alt="Sign"
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <img src={noPhotoAvailble} alt="No Photo Available" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </Grid>
            </>
          ) : null}
        </>
      </Grid>
      <>
        <Dialog
          open={isOpen}
          PaperProps={{ style: { width: "100%" } }}
          maxWidth="md"
        >
          <AppBar
            position="static"
            sx={{
              height: "auto",
              background: "var(--theme-color5)",
              margin: "10px",
              width: "auto",
            }}
          >
            <Toolbar className={headerClasses.root} variant={"dense"}>
              <Typography
                className={headerClasses.title}
                color="inherit"
                variant={"h4"}
                component="div"
              >
                {formData?.CHEQUE_NO +
                  "|" +
                  formData?.MICR_TRAN_CD +
                  "|" +
                  formData?.AC_NO +
                  "|" +
                  (formData?.AMOUNT
                    ? parseFloat(formData?.AMOUNT).toFixed(2)
                    : "0.00") +
                  "|" +
                  formData?.OTHER_REMARKS}
              </Typography>
              <GradientButton onClick={handleRotateChange}>
                <RotateRightIcon
                  style={{
                    transform: `rotate(${rotateImg}deg)`,
                    transition: "transform 0.3s ease",
                  }}
                />
              </GradientButton>

              <GradientButton variant="contained" onClick={handleZoomIn}>
                <ZoomInIcon />
              </GradientButton>

              <GradientButton variant="contained" onClick={handleZoomOut}>
                <ZoomOutIcon />
              </GradientButton>

              <GradientButton onClick={handlePrint}>Print</GradientButton>

              <GradientButton
                variant="contained"
                onClick={() => setIsOpen(false)}
              >
                Close
              </GradientButton>
            </Toolbar>
          </AppBar>

          <div
            style={{
              display: "flex",
              height: "100%",
              width: "100%",
              border: "1px solid #ddd",
            }}
          >
            <canvas
              ref={canvasRef}
              style={{ display: "flex", margin: "0 auto" }}
            />
          </div>
        </Dialog>
      </>
    </>
  );
};
