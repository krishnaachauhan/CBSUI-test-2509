import SuccessImg from "assets/images/success.svg";
import { useNavigate } from "react-router";
import { useStyles } from "./style";
import Button from "@mui/material/Button";

export const ErrorPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const returnToHomePage = () => {
    navigate("/EnfinityCore");
  };
  return (
    <div className={classes.wrapper}>
      <img alt="" src={SuccessImg} className={classes.successImg} />
      <div className={classes.center}>
        <h3 className="theme-color2">Something Unexpected Happened</h3>
      </div>
      <Button onClick={returnToHomePage} color="primary">
        Return to Home Page
      </Button>
    </div>
  );
};
