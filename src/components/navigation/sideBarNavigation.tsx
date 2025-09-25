import { FC } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavItemType, SideBarRendererType } from "./types";
import { useStylesSideBar } from "./style";
import ScrollBar from "react-perfect-scrollbar";
import { GeneralAPI } from "registry/fns/functions";
import {
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
let localdrawerOpen = true;
export const SideBarNav: FC<SideBarRendererType> = ({
  metaData,
  handleDrawerOpen,
  drawerOpen,
  setView,
  slimSize,
  setNewFilterData,
  setNewFilterView,
  isFromSeparetView = false,
}) => {
  const classes = useStylesSideBar();
  let result: JSX.Element[] | null = null;
  localdrawerOpen = drawerOpen;
  if (Array.isArray(metaData.navItems)) {
    result = metaData.navItems.map((one) => {
      if (one?.seperateView === true) {
        return (
          <SeperateListView
            key={one.label}
            item={one}
            setView={setView}
            classes={classes}
            level={0}
            slimSize={slimSize}
            setNewFilterData={setNewFilterData}
            setNewFilterView={setNewFilterView}
          />
        );
      } else if (Array.isArray(one.children)) {
        return (
          <NestedListItem
            key={one.label}
            item={one}
            classes={classes}
            level={0}
            handleDrawerOpen={handleDrawerOpen}
            drawerOpen={drawerOpen}
            slimSize={slimSize}
          />
        );
      } else {
        return (
          <SingleListItem
            key={one.label}
            item={one}
            classes={classes}
            level={0}
            slimSize={slimSize}
            drawerOpen={drawerOpen}
          />
        );
      }
    });
  }
  return (
    <List
      component="nav"
      disablePadding
      className={
        isFromSeparetView ? classes.navLinksforseparateView : classes.navLinks
      }
    >
      <ScrollBar>{result}</ScrollBar>
    </List>
  );
};

const SeperateListView: FC<{
  item: NavItemType;
  setView: any;
  classes: ReturnType<typeof useStylesSideBar>;
  level: number;
  slimSize?: boolean;
  setNewFilterData?: any;
  setNewFilterView?: any;
}> = ({
  item,
  setView,
  level,
  classes,
  slimSize,
  setNewFilterData,
  setNewFilterView,
}) => {
  let labelStart: any =
    (item.label || "").toLowerCase().substring(0, 1) || "circle";
  const icon = item.icon ? (
    <ListItemIcon className={classes.listIcon}>
      <FontAwesomeIcon icon={["fas", labelStart]} />
    </ListItemIcon>
  ) : null;
  const levelClassName =
    level === 1
      ? classes.nestedMenuLevel1
      : level === 2
      ? classes.nestedMenuLevel2
      : "";

  return (
    <ListItem
      button
      disableGutters
      className={clsx({
        [classes.item]: true,
        [levelClassName]: Boolean(levelClassName),
        [classes.slimList]: Boolean(slimSize),
        [classes.drawerIconSize]: !localdrawerOpen,
      })}
      onClick={() => {
        if (item.viewName === "newfilterview" && Array.isArray(item.children)) {
          setNewFilterView({
            label: item.label,
            placeholder: "Search " + item.label + " Screen...",
          });
          let newChield = item.children.map((item1) => {
            return { ...item1, secondaryLabel: item1.user_code };
          });
          setNewFilterData(newChield);
        }
        setView(item.viewName);
      }}
    >
      <Tooltip
        title={item.label}
        arrow={true}
        placement={localdrawerOpen ? "bottom-start" : "right"}
      >
        <span>{icon}</span>
      </Tooltip>
      {(localdrawerOpen && item.label.length > 27) || !Boolean(icon) ? (
        <Tooltip
          title={item.label}
          arrow={true}
          placement={localdrawerOpen ? "bottom-start" : "right"}
        >
          <ListItemText
            primary={item.label}
            className={classes.link}
            secondary={item.secondaryLabel ?? null}
          ></ListItemText>
        </Tooltip>
      ) : localdrawerOpen ? (
        <ListItemText
          primary={item.label}
          className={classes.link}
          secondary={item.secondaryLabel ?? null}
        ></ListItemText>
      ) : null}
    </ListItem>
  );
};

const SingleListItem: FC<{
  item: NavItemType;
  classes: ReturnType<typeof useStylesSideBar>;
  level: number;
  slimSize?: boolean;
  drawerOpen?: any;
}> = ({ item, classes, level, slimSize, drawerOpen }) => {
  const navigate = useNavigate();
  const isActiveMenu = isActiveMenuFromhref(
    window.location?.pathname ?? "",
    item?.href ?? "",
    item?.navigationProps
  );
  if (isActiveMenu) {
    GeneralAPI.setDocumentName(item.label);
  }
  let labelStart: any =
    (item.label || "").toLowerCase().substring(0, 1) || "circle";

  const icon =
    item.icon.toLowerCase() === "process.gif" ? (
      <ListItemIcon className={classes.listIcon}>
        <FontAwesomeIcon icon={["fas", labelStart]} />
      </ListItemIcon>
    ) : (
      <ListItemIcon className={classes.listIcon}>
        <FontAwesomeIcon icon={["fas", item.icon]} />
      </ListItemIcon>
    );
  const levelClassName =
    level === 1
      ? classes.nestedMenuLevel1
      : level === 2
      ? classes.nestedMenuLevel2
      : "";
  return (
    <ListItem
      button
      disableGutters
      className={clsx({
        [classes.item]: true,
        [levelClassName]: Boolean(levelClassName),
        [classes.slimList]: Boolean(slimSize),
        [classes.activeMenuItem]: isActiveMenu,
        [classes.drawerIconSize]: !localdrawerOpen,
      })}
      onClick={(e) => {
        e.preventDefault();
        if (item.isRouterLink) {
          let path = item.href;
          path =
            item.href?.substring(0, 1) === "/"
              ? item.href.substring(1)
              : item.href;
          if (item.passNavigationPropsAsURLParmas) {
            let urlParms = new URLSearchParams(item?.navigationProps);
            navigate(`${path}?${urlParms.toString()}`);
          } else {
            navigate(`${path}` as string, {
              state: { ...item?.navigationProps },
            });
          }
        } else if (Boolean(item.href)) {
          window.open(item.href, item.rel ?? "_newtab");
        }
      }}
    >
      <Tooltip
        title={item.label}
        arrow={true}
        placement={localdrawerOpen ? "bottom-start" : "right"}
      >
        <span>{icon}</span>
      </Tooltip>
      {/* {console.log(localdrawerOpen, item.label.length)} */}
      {(localdrawerOpen && item.label.length > 27) || !Boolean(icon) ? (
        <Tooltip
          title={item.label}
          arrow={true}
          placement={localdrawerOpen ? "bottom-start" : "right"}
        >
          <ListItemText
            primary={item.label}
            className={classes.link}
            secondary={item.secondaryLabel ?? null}
          ></ListItemText>
        </Tooltip>
      ) : localdrawerOpen ? (
        <ListItemText
          primary={item.label}
          className={classes.link}
          secondary={item.secondaryLabel ?? null}
        ></ListItemText>
      ) : null}
      {/* <ListItemText
        primary={item.label}
        className={classes.link}
        secondary={item.secondaryLabel ?? null}
      ></ListItemText> */}
    </ListItem>
  );
};

const NestedListItem: FC<{
  item: NavItemType;
  classes: ReturnType<typeof useStylesSideBar>;
  level: number;
  handleDrawerOpen: Function;
  drawerOpen: boolean;
  slimSize?: boolean;
}> = ({ item, classes, level, handleDrawerOpen, drawerOpen, slimSize }) => {
  const [open, setOpen] = useState(false);
  const handleClick = () => {
    if (!drawerOpen) {
      // handleDrawerOpen();
    }
    setOpen(!open);
  };
  const childrens = item.children?.map((one) => {
    if (Array.isArray(one.children)) {
      return (
        <NestedListItem
          key={one.label}
          item={one}
          classes={classes}
          level={level + 1}
          handleDrawerOpen={handleDrawerOpen}
          drawerOpen={drawerOpen}
          slimSize={slimSize}
        />
      );
    } else {
      return (
        <SingleListItem
          key={one.label}
          item={one}
          classes={classes}
          level={level + 1}
          slimSize={slimSize}
        />
      );
    }
  });
  let labelStart: any =
    (item.label || "").toLowerCase().substring(0, 1) || "circle";

  const icon =
    item.icon === "Process.gif" ? (
      <ListItemIcon className={classes.listIcon}>
        <FontAwesomeIcon icon={["fas", labelStart]} />
      </ListItemIcon>
    ) : (
      <ListItemIcon className={classes.listIcon}>
        <FontAwesomeIcon icon={["fas", item.icon]} />
      </ListItemIcon>
    );

  const levelClassName =
    level === 1
      ? classes.nestedMenuLevel1
      : level === 2
      ? classes.nestedMenuLevel2
      : "";
  return (
    <>
      <ListItem
        button
        onClick={handleClick}
        disableGutters
        className={
          open
            ? clsx({
                [classes.item]: true,
                [levelClassName]: Boolean(levelClassName),
                [classes.slimList]: Boolean(slimSize),
                [classes.openCurrent]: true,
                [classes.drawerIconSize]: !localdrawerOpen,
              })
            : clsx({
                [classes.item]: true,
                [levelClassName]: Boolean(levelClassName),
                [classes.slimList]: Boolean(slimSize),
                [classes.drawerIconSize]: !localdrawerOpen,
              })
        }
      >
        <Tooltip
          title={item.label}
          arrow={true}
          placement={localdrawerOpen ? "bottom-start" : "right"}
        >
          <span>{icon}</span>
        </Tooltip>
        {/* {icon} */}
        {drawerOpen || !Boolean(icon) ? (
          <>
            <ListItemText
              primary={item.label}
              secondary={item.secondaryLabel ?? null}
              color="primary"
              className={classes.link}
            ></ListItemText>
            {open ? <ExpandLess /> : <ExpandMore />}
          </>
        ) : null}
      </ListItem>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List
          component="div"
          disablePadding
          className={open ? classes.openList : ""}
        >
          {childrens}
        </List>
      </Collapse>
    </>
  );
};
const isActiveMenuFromhref = (location, menuhref, navigationProps) => {
  if (
    (location === "/EnfinityCore" || location === "/EnfinityCore/") &&
    menuhref === "dashboard"
  ) {
    return true;
  } else if (menuhref === "report") {
    try {
      let urlParms = new URLSearchParams(navigationProps);
      if ("?" + urlParms.toString() === window.location.search) {
        return true;
      }
    } catch (error) {
      console.log(error);
    }
    return false;
  } else if (
    location !== "/EnfinityCore" &&
    location !== "/" &&
    Boolean(menuhref) &&
    location.includes(menuhref)
  ) {
    return true;
  }
  return false;
};
