import React, { useContext, useEffect, useState } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import "./accDetails.css";
import { AuthContext } from "pages_audit/auth";
import {
  GradientButton,
  formatCurrency,
  getCurrencySymbol,
  usePropertiesConfigContext,
} from "@acuteinfo/common-base";
import { DailyTransTabsWithDialog } from "../DailyTransTabs";
import { getOccupiedHeight } from "../dynamicDailyTransTabs/dynamicDailyTranTabs";

const useStyles = makeStyles((theme) => ({
  // cardContainer: {
  //   backgroundColor: "#FFF",
  //   color: "var(--theme-color1)",
  //   //@ts-ignore
  //   marginBottom: theme.spacing(2),
  //   //@ts-ignore
  //   borderRadius: theme.spacing(2),
  //   //@ts-ignore
  //   padding: theme.spacing(2),
  //   display: "flex",
  //   flexDirection: "column",
  //   justifyContent: "space-between",
  //   height: "38vh",
  // },
  // cardHeading: {
  //   display: "flex",
  //   justifyContent: "space-between",
  //   alignItems: "center",
  //   background: "var(--theme-color5)",
  // },
  // cardContent: {
  //   flex: 1,
  //   overflowY: "auto",
  // },
  cardLabel: {
    fontWeight: "bold",
    fontSize: "12px",
  },
}));

const cardDimensions = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 3000 },
    items: 2,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

export const AccDetails = ({
  cardsData,
  hideCust360Btn = false,
  occupiedHeight,
  screenFlag,
}: {
  cardsData: any;
  hideCust360Btn?: boolean;
  occupiedHeight?: any;
  screenFlag?: string;
}) => {
  const [cardName, setCardName] = useState<any>([]);
  const [isOpenCust360, setIsOpenCust360] = useState<boolean>(false);
  const [rowsDatas, setRowsDatas] = useState<any>([]);
  const classes = useStyles();
  const customParameter = usePropertiesConfigContext();
  const { currencyFormat, decimalCount } = customParameter;
  const { authState } = useContext(AuthContext);
  let cardsInfo = cardsData ?? [];

  useEffect(() => {
    let arr2 = cardsInfo?.length > 0 && cardsInfo?.map((a) => a.CARD_NAME);
    let arr3 = arr2 && arr2?.filter((a, i) => arr2?.indexOf(a) == i);
    setCardName(arr3);
    const customerIDObj = cardsData?.find(
      (item) => item?.COL_NAME === "CUSTOMER_ID"
    );
    const customerID = customerIDObj ? customerIDObj?.COL_VALUE : null;
    setRowsDatas([
      {
        data: {
          COMP_CD: authState?.companyID,
          A_FLAG: "",
          BRANCH_CD: "",
          ACCT_TYPE: "",
          ACCT_CD: "",
          CUSTOMER_ID: customerID,
        },
      },
    ]);
  }, [cardsData]);

  const filteredCardsInfo1 = cardsInfo?.filter((card) => card.CARD_NO === "1");
  const filteredCardsInfo2 = cardsInfo?.filter((card) => card.CARD_NO === "2");
  const filteredCardsInfo3 = cardsInfo?.filter((card) => card.CARD_NO === "3");

  const isOddTotal1 = filteredCardsInfo1?.length % 2 === 1;
  const isOddTotal2 = filteredCardsInfo2?.length % 2 === 1;
  const isOddTotal3 = filteredCardsInfo3?.length % 2 === 1;
  const handleClose = () => {
    setIsOpenCust360(false);
  };

  const style = React.useMemo(() => {
    if (!occupiedHeight) return {};
    let newOccupiedHeight = getOccupiedHeight(
      occupiedHeight,
      screenFlag,
      "ACCOUNT"
    );
    return {
      minHeight: `calc(100vh - ${
        parseInt(newOccupiedHeight.min, 10) -
        (screenFlag === "ACCTINQ" ? 105 : 55)
      }px)`,
      maxHeight: `calc(100vh - ${
        parseInt(newOccupiedHeight.max, 10) -
        (screenFlag === "ACCTINQ" ? 105 : 55)
      }px)`,
    };
  }, [occupiedHeight]);

  return (
    <div key={`accountDetailsMainDiv`} style={style}>
      {cardName?.length > 0 ? (
        <Carousel responsive={cardDimensions} className="custom-carousel">
          {cardName?.length > 0 &&
            cardName?.map((a, i) => {
              let filteredCardsInfo;
              let isOddTotal;
              if (a === "Basic Information") {
                filteredCardsInfo = filteredCardsInfo1;
                isOddTotal = isOddTotal1;
              } else if (a === "Balance Information") {
                filteredCardsInfo = filteredCardsInfo2;
                isOddTotal = isOddTotal2;
              } else if (a === "Account Information") {
                filteredCardsInfo = filteredCardsInfo3;
                isOddTotal = isOddTotal3;
              }

              return (
                <Card key={"" + i} id="cardContainer" style={style}>
                  {/* <div id={"cardHeadingParent"}>
                    <div id="cardHeading">
                      <Typography
                        variant="h6"
                        component="div"
                        style={{ color: "var(--theme-color2)" }}
                      >
                        {a}
                      </Typography>
                      <div id={"headingIcons"}>
                        {a === "Basic Information" && <InfoOutlinedIcon />}
                        {a === "Account Information" && (
                          <AccountCircleOutlinedIcon />
                        )}
                        {a === "Balance Information" && (
                          <AccountBalanceWalletOutlinedIcon />
                        )}
                      </div>
                    </div>
                  </div> */}
                  <CardContent>
                    <Grid container spacing={1}>
                      {filteredCardsInfo?.map((b, i2) => {
                        return b?.COMPONENT_TYPE === "hidden" ? null : (
                          <Grid
                            item
                            xs={6}
                            key={"" + i2}
                            sx={{
                              overflowWrap: "break-word",
                              borderBottom: "1px solid var(--theme-color4)",
                              paddingBottom: "4px",
                            }}
                          >
                            <>
                              <Typography className={classes?.cardLabel}>
                                {b?.COL_LABEL}
                              </Typography>
                              <Typography sx={{ fontSize: "12px" }}>
                                {b?.COMPONENT_TYPE === "amountField" ? (
                                  Boolean(b?.ENABLE_BLINK === "Y") ? (
                                    <span
                                      style={
                                        {
                                          animation: "blinkingText 1s infinite",
                                          ["--dynamic-color" as any]:
                                            b?.FORE_COLOR ?? "",
                                          fontWeight: "bold",
                                        } as React.CSSProperties
                                      }
                                    >
                                      {formatCurrency(
                                        parseFloat(b.COL_VALUE),
                                        getCurrencySymbol(b.CURRENCY_CD),
                                        currencyFormat,
                                        decimalCount
                                      )}
                                    </span>
                                  ) : b?.FORE_COLOR ? (
                                    <span
                                      style={
                                        {
                                          color: b?.FORE_COLOR,
                                          fontWeight: "bold",
                                        } as React.CSSProperties
                                      }
                                    >
                                      {formatCurrency(
                                        parseFloat(b.COL_VALUE),
                                        getCurrencySymbol(b.CURRENCY_CD),
                                        currencyFormat,
                                        decimalCount
                                      )}
                                    </span>
                                  ) : (
                                    <span>
                                      {formatCurrency(
                                        parseFloat(b.COL_VALUE),
                                        getCurrencySymbol(b.CURRENCY_CD),
                                        currencyFormat,
                                        decimalCount
                                      )}
                                    </span>
                                  )
                                ) : (
                                  <>
                                    {b?.ENABLE_BLINK === "Y" ? (
                                      <span
                                        style={
                                          {
                                            animation:
                                              "blinkingText 1s infinite",
                                            ["--dynamic-color" as any]:
                                              b?.FORE_COLOR || "black",
                                            fontWeight: "bold",
                                          } as React.CSSProperties
                                        }
                                      >
                                        {b?.COL_VALUE}
                                      </span>
                                    ) : b?.FORE_COLOR ? (
                                      <span
                                        style={
                                          {
                                            color: b?.FORE_COLOR,
                                            fontWeight: "bold",
                                          } as React.CSSProperties
                                        }
                                      >
                                        {b?.COL_VALUE}
                                      </span>
                                    ) : (
                                      <span>{b?.COL_VALUE}</span>
                                    )}
                                    <span>
                                      {!hideCust360Btn &&
                                        b?.COL_NAME === "CUSTOMER_ID" && (
                                          <GradientButton
                                            style={{ height: "1.5rem" }}
                                            onClick={() => {
                                              setIsOpenCust360(true);
                                            }}
                                          >
                                            Customer 360
                                          </GradientButton>
                                        )}
                                    </span>
                                  </>
                                )}
                              </Typography>
                            </>
                          </Grid>
                        );
                      })}
                      {isOddTotal && (
                        <Grid
                          item
                          xs={6}
                          sx={{
                            borderBottom: "1px solid var(--theme-color4)",
                          }}
                        ></Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              );
            })}
        </Carousel>
      ) : (
        <Card
          // style={{
          //   width: "100%",
          //   height: "35vh",
          //   // height: "48vh",
          //   display: "flex",
          //   justifyContent: "center",
          // }}
          id="cardContainer"
          style={style}
        >
          <div style={{ paddingTop: "10%" }}></div>
        </Card>
      )}
      {isOpenCust360 && (
        <DailyTransTabsWithDialog
          handleClose={handleClose}
          rowsData={rowsDatas}
          setRowsData={setRowsDatas}
          occupiedHeight={occupiedHeight}
          screenFlag={"CUST360"}
          isViewGrid={true}
          isShowFilterButton={true}
        />
      )}
    </div>
  );
};
