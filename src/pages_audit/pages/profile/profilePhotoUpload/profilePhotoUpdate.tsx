import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Slider,
  Typography,
} from "@mui/material";
import { useRef, CSSProperties, useState, useMemo, useEffect } from "react";
import { useStyles } from "./style";
import AvatarEditor from "react-avatar-editor";
import { useMutation } from "react-query";
import * as API from "../api";
import {
  utilFunction,
  transformFileObject,
  Transition,
  GradientButton,
} from "@acuteinfo/common-base";
import { useSnackbar } from "notistack";
const style = ({ disabled }): CSSProperties => ({
  pointerEvents: disabled ? "none" : "all",
  opacity: disabled ? 0.5 : 1,
});

export const ProfilePhotoUpdate = ({ open, onClose, files, userID }) => {
  const fileURL = useRef<any | null>(null);
  const classes = useStyles();
  const editor = useRef<any>(null);
  const [filesdata, setFilesData] = useState<any>([]);
  const [zoom, setZoomValue] = useState<number>(1);
  const [rotate, setRotate] = useState<number>(0);
  const { enqueueSnackbar } = useSnackbar();
  const componentMounted = useRef(true);
  const customTransformFileObj = (currentObj) => {
    return transformFileObject({})(currentObj);
  };
  const mutation = useMutation(API.updateUserProfilePic, {
    onError: (error: any) => {
      let errorMsg = "Unknown Error occured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
    },
    onSuccess: (data, { blob }) => {
      enqueueSnackbar("Profile picture updated successfully.", {
        variant: "success",
      });
      onClose("Y", blob);
    },
  });
  const onDropFile = async (files) => {
    let resdata = files.map((one) => customTransformFileObj(one));
    if (resdata.length > 0) {
      let filesObj: any = await Promise.all(resdata);
      fileURL.current =
        typeof filesObj?.[0]?.blob === "object" && Boolean(filesObj?.[0]?.blob)
          ? await URL.createObjectURL(filesObj?.[0]?.blob as any)
          : null;
      setFilesData(filesObj);
    } else {
      setFilesData([]);
      fileURL.current = null;
    }
  };
  const handleChange = (event: any, newValue: number | number[]) => {
    setZoomValue(newValue as number);
  };
  const handleRotateChange = (event: any, newValue: number | number[]) => {
    setRotate(newValue as number);
  };
  useEffect(() => {
    return () => {
      componentMounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (componentMounted.current) {
      onDropFile(files);
    }
  }, [files, onDropFile]);

  return (
    <Dialog
      open={open}
      //@ts-ignore
      TransitionComponent={Transition}
      fullWidth={false}
    >
      <DialogTitle>Upload Profile Photo</DialogTitle>
      <DialogContent>
        <div
          style={style({ disabled: false })}
          className={classes.uploadWrapper}
        >
          {filesdata.length > 0 ? (
            <>
              <Grid
                container
                spacing={0}
                justifyContent="center"
                alignItems="center"
              >
                <Grid item xs={9} md={9} sm={9}>
                  <AvatarEditor
                    ref={editor}
                    image={fileURL.current}
                    width={250}
                    height={250}
                    border={[10, 10]}
                    scale={zoom}
                    borderRadius={150}
                    rotate={rotate}
                  />
                </Grid>
                <Grid item xs={9} md={9} sm={9}>
                  <div>
                    <Typography>Zoom:</Typography>
                    <Slider
                      value={zoom}
                      onChange={handleChange}
                      aria-labelledby="continuous-slider"
                      color="secondary"
                      defaultValue={1}
                      step={0.1}
                      min={0.2}
                      max={3}
                    />
                  </div>
                </Grid>
                <Grid item xs={9} md={9} sm={9}>
                  <Typography>Rotate :</Typography>

                  <Slider
                    value={rotate}
                    onChange={handleRotateChange}
                    aria-labelledby="continuous-slider"
                    color="secondary"
                    defaultValue={0}
                    step={1}
                    min={0}
                    max={360}
                  />
                </Grid>
              </Grid>
            </>
          ) : (
            <Typography>File not found</Typography>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <GradientButton disabled={mutation.isLoading} onClick={onClose}>
          Close
        </GradientButton>
        {filesdata.length > 0 ? (
          <GradientButton
            disabled={mutation.isLoading}
            endIcon={mutation.isLoading ? <CircularProgress size={20} /> : null}
            onClick={async (e) => {
              if (Boolean(editor.current)) {
                const canvasScaled = editor.current.getImageScaledToCanvas();
                canvasScaled.toBlob(async (blob) => {
                  let imageData: any = await utilFunction.convertBlobToBase64(
                    blob
                  );
                  mutation.mutate({
                    userID: userID,
                    imageData: imageData[1],
                    blob: blob,
                  });
                }, filesdata?.[0]?.mimeType ?? "image/png");
              }
            }}
          >
            Update
          </GradientButton>
        ) : null}
      </DialogActions>
    </Dialog>
  );
};
