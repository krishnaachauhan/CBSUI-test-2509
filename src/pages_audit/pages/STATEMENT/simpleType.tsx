import { Grid, Typography } from "@mui/material";

const SimpleType = ({ data }) => {
  return (
    <Grid container sx={{ marginBottom: "10px" }}>
      {data?.DETAILS?.map((item, index) => (
        <>
          <Grid
            item
            xs={12}
            sm={12}
            md={6}
            lg={6}
            xl={6}
            key={item.LABEL}
            style={{
              borderBottom: "1px solid var(--theme-color4)",
              padding: "10px",
            }}
          >
            <Grid container>
              <Grid
                item
                xs={6}
                sm={6}
                md={6}
                lg={6}
                xl={6}
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <Typography
                  sx={{
                    fontWeight: "bold",
                    fontFamily: "Roboto, sans-serif",
                  }}
                >
                  {item?.LABEL}
                </Typography>
                <Typography
                  sx={{
                    fontWeight: "bold",
                    fontFamily: "Roboto, sans-serif",
                  }}
                >
                  :
                </Typography>
              </Grid>
              <Grid
                item
                xs={6}
                sm={6}
                md={6}
                lg={6}
                xl={6}
                style={{
                  textAlign:
                    item?.LABEL === "Hold balance" || item?.LABEL === "Limit"
                      ? "right"
                      : "left",
                }}
              >
                <Typography sx={{ padding: "0px 10px" }}>
                  {item?.LABEL === "Hold balance" || item?.LABEL === "Limit"
                    ? Number(item?.VALUE ?? 0)?.toFixed(2)
                    : item?.VALUE}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          {data?.detail?.length === index + 1 && index % 2 == 0 ? (
            <Grid
              item
              xs={0}
              sm={0}
              md={6}
              lg={6}
              xl={6}
              key={item.LABEL}
              style={{ borderBottom: "1px solid var(--theme-color4)" }}
            ></Grid>
          ) : (
            <></>
          )}
          {/* <Grid item>
            <Divider />
          </Grid> */}
        </>
      ))}
    </Grid>
  );
};

export default SimpleType;
