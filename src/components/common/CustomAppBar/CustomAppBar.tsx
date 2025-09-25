import React from "react";
import { AppBar, Toolbar, Typography, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { GradientButton } from "@acuteinfo/common-base";

const useAppBarStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingLeft: theme?.spacing(1.5),
    paddingRight: theme?.spacing(1.5),
    background: "var(--theme-color5)",
  },
  title: {
    flex: "1 1 100%",
    color: "var(--white)",
    letterSpacing: "1px",
    fontSize: "1.2rem",
  },
}));

interface AppBarAction {
  label: string;
  onClick: () => void;
  visible?: boolean;
  variant?: "contained" | "outlined" | "text";
}

interface DynamicAppBarProps {
  title: string;
  actions?: AppBarAction[];
  className?: string;
  toolbarClassName?: string;
  titleClassName?: string;
  backgroundColor?: string;
  position?: "fixed" | "absolute" | "sticky" | "static" | "relative";
  variant?: "regular" | "dense";
  color?: "default" | "inherit" | "primary" | "secondary" | "transparent";
}

const CustomAppBar: React.FC<DynamicAppBarProps> = ({
  title,
  actions = [],
  className,
  toolbarClassName,
  titleClassName,
  backgroundColor = "var(--theme-color2)",
  position = "relative",
  variant = "dense",
  color = "secondary",
}) => {
  const classes = useAppBarStyles();

  return (
    <AppBar
      className={`form__header ${className || ""}`}
      position={position}
      color={color}
      sx={{
        padding: "0 8px",
        backgroundColor: backgroundColor,
        boxShadow: "none",
      }}
    >
      <Toolbar
        className={`${classes?.root} ${toolbarClassName || ""}`}
        variant={variant}
      >
        <Typography
          className={`${classes?.title} ${titleClassName || ""}`}
          color="inherit"
          variant={"h4"}
          component="div"
        >
          {title}
        </Typography>
        {Array.isArray(actions) &&
          actions?.map((action: any, index: any) => {
            if (action?.visible === false) return null;
            return (
              <GradientButton
                key={index}
                onClick={action?.onClick}
                variant={action?.variant}
              >
                {action?.label}
              </GradientButton>
            );
          })}
      </Toolbar>
    </AppBar>
  );
};

export default CustomAppBar;
