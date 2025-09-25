import { FC, useMemo, useState } from "react";
import clsx from "clsx";
import { SearchBar } from "@acuteinfo/common-base";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useStylesSideBar } from "./style";
import { filterMetaDataByValue } from "./filterMetaData";
import { SideBarNav } from "./sideBarNavigation";
import { SideBarRendererType } from "./types";
import { ListItem, ListItemIcon, ListItemText } from "@mui/material";

interface NewSideBarNav extends SideBarRendererType {
  label: string;
  icon?: any;
  placeholder?: any;
}

export const SearchViewNavigation: FC<NewSideBarNav> = ({
  metaData,
  handleDrawerOpen,
  drawerOpen,
  setView,
  label,
  icon,
  placeholder = "Search Reports...",
}) => {
  const [search, setSearch] = useState("");
  const filteredMetaData = useMemo(() => {
    return filterMetaDataByValue(search, metaData.navItems, [
      "label",
      "secondaryLabel",
    ]);
  }, [search, metaData.navItems]);
  const classes = useStylesSideBar();

  const myIcon = icon ? (
    <ListItemIcon className={classes.listIcon}>
      <ArrowBackIosNewIcon />
    </ListItemIcon>
  ) : null;
  const handleClick = () => {
    if (!drawerOpen) {
      handleDrawerOpen();
    }
  };
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <ListItem
        button
        className={clsx({
          [classes.item]: true,
          [classes.nestedMenuLevel1]: true,
          [classes.linktext]: true,
        })}
        onClick={() => setView("/")}
      >
        {myIcon}
        <ListItemText primary={label} className={classes.link} />
      </ListItem>
      {/* <div onClick={handleDrawerOpen}> */}
      <SearchBar
        sx={{ overflow: "hidden" }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onClick={handleClick}
        placeholder={Boolean(placeholder) ? placeholder : "Search Reports..."}
        autoFocus={drawerOpen}
      />
      {/* </div> */}
      <SideBarNav
        handleDrawerOpen={handleDrawerOpen}
        drawerOpen={drawerOpen}
        setView={setView}
        metaData={{
          navItems: filteredMetaData,
          config: { rel: "", target: "_blank" },
        }}
        slimSize={true}
        isFromSeparetView={true}
      />
    </div>
  );
};
