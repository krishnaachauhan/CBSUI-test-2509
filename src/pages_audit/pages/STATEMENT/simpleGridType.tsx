import { Grid, Typography } from "@mui/material";
// import { FormatCurrency } from "@acuteinfo/common-base";
const formatCurrency = (
  amount,
  symbol,
  currencyFormat = "en-IN",
  decimalCount = 2,
  symbolPosi = "start"
) => {
  const formattedAmount = new Intl.NumberFormat(currencyFormat, {
    minimumFractionDigits: decimalCount,
    // currency: "ZAR",
  }).format(amount);
  if (symbolPosi === "start") {
    return `${symbol} ${formattedAmount}`;
  } else if (symbolPosi === "end") {
    return `${formattedAmount} ${symbol}`;
  } else {
    return `${symbol} ${formattedAmount}`;
  }
};
const SimpleGridType = ({ data }) => {
  const typographyStyle = {
    padding: "06px",
    fontFamily: "Roboto, sans-serif",
    fontWeight: "900",
  };

  const collapseableBox = {
    height: "auto",
    width: "100%",
    display: "flex",
    margin: "10px 0px",
  };

  return (
    <Grid container sx={collapseableBox}>
      {data?.DETAILS?.map((item, index) => {
        const convertedInNumber = Number(item?.VALUE);

        return (
          <Grid
            key={index}
            item
            xs={12}
            sm={12}
            md={6}
            lg={3}
            xl={3}
            sx={{ display: "flex" }}
          >
            <Grid
              item
              xs={8}
              sm={8}
              md={8}
              lg={8}
              xl={8}
              sx={{
                height: "80%",
                borderRight: "1px solid",
                borderColor: "var(--theme-color4)",
              }}
            >
              <Typography variant="h6" sx={typographyStyle}>
                {item.LABEL}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  padding: "06px",
                  fontFamily: "Roboto, sans-serif",
                  fontWeight: "900",
                  color: "var(--theme-color1)",
                }}
              >
                {item?.CURRENCY ? (
                  <>{formatCurrency(convertedInNumber, item.CURRENCY)}</>
                ) : (
                  item?.VALUE
                )}
              </Typography>
            </Grid>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default SimpleGridType;
