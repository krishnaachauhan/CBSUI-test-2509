import {
  ClearCacheProvider,
  FormWrapper,
  GradientButton,
  LoaderPaperComponent,
  TextField,
  usePopupContext,
} from "@acuteinfo/common-base";
import { Dialog, Grid, Paper } from "@mui/material";
import { AppBar, Toolbar, Typography } from "@mui/material";
import { Theme } from "@mui/system";
import { makeStyles } from "@mui/styles";
import { Fragment, useRef, useState } from "react";
import { useMutation } from "react-query";
import { generateDecryptedReq } from "./api";
import { t } from "i18next";
import IconButton from "@mui/material/IconButton";
import LockIcon from "@mui/icons-material/Lock";

// Styles
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
    fontSize: "1.5rem",
  },
  textField: {
    width: "50%",
    marginBottom: "10px",
  },
}));

const ReqDecryptForm = ({ close }) => {
  const headerClasses = useTypeStyles();
  const [request, setRequest] = useState<string>("");
  const formRef = useRef<string>(request);
  const [data, setData] = useState<any>(null);
  const { MessageBox, CloseMessageBox } = usePopupContext();

  // Mutation for decrypting the request
  const decryptReqMutation = useMutation(generateDecryptedReq, {
    onError: async (error: any) => {
      const btnName = await MessageBox({
        messageTitle: "ERROR",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
      CloseMessageBox();
    },
    onSuccess: (data) => {
      setData(JSON.stringify(data, null, 2));
    },
  });

  const handleDecrypt = () => {
    if (formRef.current) {
      try {
        const parsedData = JSON.parse(formRef.current);
        decryptReqMutation.mutate(parsedData);
      } catch (error: any) {
        MessageBox({
          messageTitle: "Invalid JSON",
          message: "Please Enter Valid JSON",
          icon: "ERROR",
        });
      }
    }
  };

  return (
    <Fragment>
      <AppBar position="relative" color="secondary">
        <Toolbar className={headerClasses.root} variant="dense">
          <Typography
            className={headerClasses.title}
            color="inherit"
            variant="h6"
            component="div"
          >
            {"Request Decryptor Master"}
          </Typography>

          <GradientButton
            disabled={request === ""}
            onClick={handleDecrypt}
            color={"primary"}
          >
            Decrypt
          </GradientButton>
          <GradientButton onClick={() => close()} color={"primary"}>
            Close
          </GradientButton>
        </Toolbar>
      </AppBar>

      {decryptReqMutation.isLoading ? (
        <Dialog
          fullWidth
          maxWidth="lg"
          open={true}
          style={{ height: "100%", width: "100%" }}
          PaperProps={{
            style: { width: "100%", height: "auto" },
          }}
        >
          <Paper sx={{ display: "flex", justifyContent: "center" }}>
            <LoaderPaperComponent />
          </Paper>
        </Dialog>
      ) : (
        ""
      )}

      <Grid container>
        <Grid item xs={12}></Grid>
        <Grid
          item
          xs={12}
          xl={12}
          sx={{ m: 2 }}
          style={{ padding: "10px", display: "flex" }}
        >
          <TextField
            id="encrypted-request"
            label="Encrypted Request"
            placeholder="Paste Encrypted Request"
            multiline
            sx={{ m: 2 }}
            rows={20}
            variant="standard"
            color="secondary"
            className={headerClasses.textField}
            InputLabelProps={{
              shrink: true,
            }}
            value={request ?? ""}
            onChange={(e) => {
              setRequest(e.target.value.trimStart());
              formRef.current = e.target.value;
            }}
          />
          <TextField
            id="decrypted-request"
            label="Decrypted Request"
            value={data && data}
            placeholder="Request Decrypting..."
            multiline
            rows={20}
            disabled={false}
            sx={{ m: 2 }}
            variant="standard"
            color="secondary"
            className={headerClasses.textField}
            InputLabelProps={{
              shrink: true,
            }}
            onChange={() => {}}
          />
        </Grid>
      </Grid>
    </Fragment>
  );
};

export const ReqDecryptFormMain = () => {
  const [openDialogue, setOpenDialogue] = useState(false);

  return (
    <>
      <div
        style={{
          zIndex: 1000000,
          position: "fixed",
          bottom: "4rem",
          left: "1rem",
          boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
          borderRadius: "50%",
        }}
      >
        <IconButton
          onClick={() => {
            setOpenDialogue(true);
          }}
        >
          <LockIcon />
        </IconButton>
      </div>

      {openDialogue ? (
        <Dialog
          open={openDialogue}
          onClose={() => setOpenDialogue(false)}
          PaperProps={{
            style: {
              width: "100%",
              overflow: "hidden",
              padding: "8px",
            },
          }}
          maxWidth="lg"
        >
          <ReqDecryptForm
            close={() => {
              setOpenDialogue(false);
            }}
          />
        </Dialog>
      ) : (
        ""
      )}
    </>
  );
};
