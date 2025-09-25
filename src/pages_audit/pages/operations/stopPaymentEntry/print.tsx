import { GradientButton } from "@acuteinfo/common-base";
import { Box, Dialog, FormLabel, Grid, Stack, TextField } from "@mui/material";
import { t } from "i18next";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

export const PrintDeatil = ({ navigate }) => {
  const printRef = useRef<any>(null);

  const handlePrintPage = useReactToPrint({
    content: () => printRef.current,
  });
  return (
    <Dialog open={true} fullScreen>
      <Stack
        display={"flex"}
        justifyContent={"center"}
        direction="row"
        p={"10px"}
        spacing={2}
      >
        <GradientButton onClick={() => handlePrintPage()}>
          {t("Print")}
        </GradientButton>
        <GradientButton
          onClick={() => {
            navigate(".");
          }}
        >
          {t("close")}
        </GradientButton>
      </Stack>
      <Box
        ref={printRef}
        sx={{
          padding: "15px",
          alignSelf: "center",
          height: "calc(100vh - 76px)",
          width: "calc(100vw - 50px)",
          border: "1.5px solid black",
        }}
      >
        <Grid item xs={12} spacing={1}>
          <FormLabel>{t("Surname")} :</FormLabel>
          <TextField
            disabled
            value={"cardData?.SUR_NAME ?? "}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12}>
          <FormLabel> {t("FirstName")} : </FormLabel>
          <TextField
            disabled
            value={"cardData?.FIRST_NAME ??"}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12}>
          <FormLabel>{t("LastName")} : </FormLabel>
          <TextField
            disabled
            value={"cardData?.MIDDLE_NAME ??"}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            disabled
            value={"cardData?.ADDRESS1 ??"}
            variant="outlined"
          />
        </Grid>
      </Box>
    </Dialog>
  );
};
