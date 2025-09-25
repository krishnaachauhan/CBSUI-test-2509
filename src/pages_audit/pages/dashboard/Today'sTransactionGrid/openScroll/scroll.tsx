import { Dialog, Grid, Typography } from "@mui/material";
import { scrollMetaData } from "./metaData";
import Report, { ReportGrid } from "@acuteinfo/common-base";
import * as API from "./api";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const Scroll = ({ open, handleCloseDialog, data }) => {
  const [scrollData, setScrollData] = useState<any>([]);

  const { SCROLL1, COMP_CD, BRANCH_CD } = data?.[0]?.data;
  const scroll = SCROLL1;
  const { t } = useTranslation();

  const updatedMetaData = {
    ...scrollMetaData,
    title: `Scroll: ${scroll}`,
  };

  const count = scrollData?.reduce(
    (countObj, obj) => {
      if (obj.DEBIT !== "") {
        countObj.debitCount++;
      }
      if (obj.CREDIT !== "") {
        countObj.creditCount++;
      }
      return countObj;
    },
    { debitCount: 0, creditCount: 0 }
  );

  return (
    <Dialog
      open={open}
      maxWidth={"xl"}
      sx={{
        "& .MuiToolbar-root": { width: "100%" },
      }}
    >
      <ReportGrid
        reportID={"scrollDetail"}
        reportName={"scrollDetail"}
        dataFetcher={API.ScrollDetailData}
        metaData={updatedMetaData}
        maxHeight={window.innerHeight - 250}
        title={updatedMetaData?.title}
        options={{
          disableGroupBy: updatedMetaData?.disableGroupBy,
        }}
        hideFooter={updatedMetaData?.hideFooter}
        hideAmountIn={updatedMetaData?.hideAmountIn}
        retrievalType={updatedMetaData?.retrievalType}
        initialState={{
          groupBy: updatedMetaData?.groupBy ?? [],
        }}
        onClose={handleCloseDialog}
        otherAPIRequestPara={{
          COMP_CD,
          BRANCH_CD,
          SCROLL1,
        }}
        dataTransformer={(data) => {
          if (data?.length) setScrollData(data);
          return data;
        }}
      />
      <Grid
        sx={{
          height: "32px",
          // border: "2px solid var(--theme-color3)",
          display: "flex",
          alignItems: "center",
          gap: "3.4rem",
          marginTop: "2px",
        }}
      >
        <Typography marginLeft={"10px"} fontWeight={"bold"}>
          {t("CreditCount")} : {count?.creditCount}{" "}
        </Typography>
        <Typography fontWeight={"bold"}>
          {t("DebitCount")} :{count?.debitCount}{" "}
        </Typography>
      </Grid>
    </Dialog>
  );
};

export default Scroll;
