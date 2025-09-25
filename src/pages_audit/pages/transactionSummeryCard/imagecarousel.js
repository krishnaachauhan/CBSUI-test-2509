import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import {
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  Table,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import Left from "assets/images/pre-next.png";
import "./imagecarousel.css";
import * as API from "./api";
import { useQuery } from "react-query";
const Rescarousel = () => {
  const { data, isLoading, isFetching, refetch } = useQuery(
    ["GETTRANSACTIONSUMMARY"],
    () => API.getTransSumCardData()
  );
  // console.log("GETTRANSACTIONSUMMARY", data?.[0]?.TYPE_CD);

  // const [value, setValue] = React.useState(0);
  // const handleChange = (event, newValue) => {
  //   setValue(newValue);
  // };
  function createData(name, calories, fat) {
    return { name, calories, fat };
  }
  const rows = [
    createData("Frozen yoghurt", 159, 6.0),
    createData("Ice-cream sandwich", 237, 9.0),
    createData("Eclair", 262, 16.0),
  ];
  const items = [1, 2, 3, 4, 5, 6, 7];

  const arrowStyles = {
    position: "absolute",
    zIndex: 2,
    top: "calc(50% - 30px)",
    width: 36,
    height: 36,
    cursor: "pointer",
    outline: "none",
    background: "#ECEFF9",
    borderRadius: "10px",
    border: "none",
    transition: "opacity 0.2s ease-in-out",
    boxShadow: "0px 5px 10px rgba(8, 15, 35, 0.2)",
    transform: "matrix(-1, 0, 0, 1, 0, 0)",
  };

  const arrowPrevStyles = {
    ...arrowStyles,
    left: 1,
  };

  const arrowNextStyles = {
    ...arrowStyles,
    right: 1,
  };
  return (
    <>
      <Carousel
        showArrows={true}
        showThumbs={false}
        showStatus={false}
        infiniteLoop={true}
        centerMode={true}
        centerSlidePercentage={33.33}
        swipeScrollTolerance={5}
        selectedItem={1}
        emulateTouch={true}
        width="100%"
        renderArrowPrev={(onClickHandler, hasPrev, label) =>
          hasPrev && (
            <button
              type="button"
              onClick={onClickHandler}
              title={label}
              style={arrowPrevStyles}
            >
              <img src={Left} />
            </button>
          )
        }
        renderArrowNext={(onClickHandler, hasNext, label) =>
          hasNext && (
            <button
              type="button"
              onClick={onClickHandler}
              title={label}
              style={arrowNextStyles}
            >
              <img src={Left} style={{ transform: "rotate(180deg)" }} />
            </button>
          )
        }
      >
        {items.map((val, index) => {
          return (
            <Card
              key={index}
              sx={{
                color: "white",
                // mx: 2,
                // mb: 5,
                margin: "16px 16px 40px 16px",
                background:
                  "linear-gradient(61.76deg, #4285F4 8.02%, #885DF5 108.35%)",
                borderRadius: "20px",
              }}
            >
              <CardContent>
                <Typography ml={1} variant="h5" align="left" component="div">
                  {index + 1}
                </Typography>
                <Table aria-label="caption table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ p: 1, color: "white" }}>Type</TableCell>
                      <TableCell sx={{ p: 1, color: "white" }}>
                        Amount
                      </TableCell>
                      <TableCell sx={{ p: 1, color: "white" }}>Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.name}>
                        <TableCell
                          sx={{ p: 1, color: "white", border: "none" }}
                          component="th"
                          scope="row"
                        >
                          {row.name}
                        </TableCell>
                        <TableCell
                          sx={{ p: 1, color: "white", border: "none" }}
                        >
                          {row.calories}
                        </TableCell>
                        <TableCell
                          sx={{ p: 1, color: "white", border: "none" }}
                        >
                          {row.fat}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </Carousel>
    </>
  );
};

export default Rescarousel;
