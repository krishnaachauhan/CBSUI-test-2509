import { FC, useContext, useMemo, useState } from "react";
import { reportMetaData } from "./reportMetaData";
import { SideBarNav } from "components/navigation/sideBarNavigation";
import { SearchViewNavigation } from "components/navigation/searchViewNavigation";
import { AuthContext } from "pages_audit/auth";
import "./icons";
import { transformMetaDataAsPerRole } from "./transformer";
import { Stack, Typography, FormGroup, Switch, styled } from "@mui/material";

/* eslint-disable react-hooks/exhaustive-deps */
export const MySideBar: FC<{
  handleDrawerOpen: Function;
  open: boolean;
}> = ({ handleDrawerOpen, open }) => {
  const { authState } = useContext(AuthContext);
  const [view, setView] = useState("/");
  const [NewFilterView, setNewFilterView] = useState<any>({});
  const [NewFilterData, setNewFilterData] = useState([]);

  const branches = useMemo(() => {
    let myBranches = authState?.access?.entities?.Branch ?? [];
    if (Array.isArray(myBranches) && myBranches.length >= 0) {
      return myBranches.map((one) => one.branchCode);
    } else {
      return [];
    }
  }, []);

  const products = useMemo(() => {
    let myProducts = authState?.access?.products ?? [];
    if (Array.isArray(myProducts) && myProducts.length >= 0) {
      return myProducts.map((one) => one.categoryCode);
    } else {
      return [];
    }
  }, []);
  let newMetaData = { navItems: authState.menulistdata };
  let filteredMetaDataSideBar = transformMetaDataAsPerRole(
    newMetaData,
    Number(authState.role),
    branches,
    authState.companyID,
    authState.access,
    products
  );

  let filteredReportsMetaData = transformMetaDataAsPerRole(
    {
      config: { rel: "", target: "_blank" },
      navItems: reportMetaData,
    },
    Number(authState.role),
    branches,
    authState.companyID,
    authState.access,
    products
  );
  const AntSwitch = styled(Switch)(({ theme }) => ({
    width: 37,
    height: 25,
    borderRadius: 12,
    padding: 0,
    display: "flex",
    "&:active": {
      "& .MuiSwitch-thumb": {
        width: 15,
      },
      "& .MuiSwitch-switchBase.Mui-checked": {
        transform: "translateX(9px)",
      },
    },
    "& .MuiSwitch-switchBase": {
      padding: 2,
      "&.Mui-checked": {
        transform: "translateX(12px)",
        color: "#fff",
        "& + .MuiSwitch-track": {
          opacity: 1,
          backgroundColor:
            theme.palette.mode === "dark" ? "#177ddc" : "#1890ff",
        },
      },
    },
    "& .MuiSwitch-thumb": {
      boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
      width: 20,
      height: 20,
      borderRadius: 23,
      transition: theme.transitions.create(["width"], {
        duration: 200,
      }),
    },
    "& .MuiSwitch-track": {
      borderRadius: 16 / 2,
      opacity: 1,
      backgroundColor:
        theme.palette.mode === "dark"
          ? "rgba(255,255,255,.35)"
          : "rgba(0,0,0,.25)",
      boxSizing: "border-box",
    },
  }));
  return view === "report" ? (
    <SearchViewNavigation
      metaData={filteredReportsMetaData}
      handleDrawerOpen={handleDrawerOpen}
      drawerOpen={open}
      setView={setView}
      label="Reports"
      icon="table"
    />
  ) : view === "newfilterview" ? (
    <SearchViewNavigation
      metaData={{
        config: { rel: "", target: "_blank" },
        navItems: NewFilterData,
      }}
      handleDrawerOpen={handleDrawerOpen}
      drawerOpen={open}
      setView={setView}
      label={NewFilterView?.label ?? "Reports"}
      icon="table"
      placeholder={NewFilterView?.placeholder}
    />
  ) : (
    <>
      <SideBarNav
        metaData={filteredMetaDataSideBar}
        handleDrawerOpen={handleDrawerOpen}
        drawerOpen={open}
        setView={setView}
        slimSize={true}
        setNewFilterData={setNewFilterData}
        setNewFilterView={setNewFilterView}
      />
      {/* {open ? (
        <FormGroup style={{ marginBottom: "10px" }}>
          <Stack
            style={{ margin: "auto" }}
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <Typography>Light</Typography>
            <AntSwitch
              defaultChecked
              inputProps={{ "aria-label": "ant design" }}
            />
            <Typography>Dark</Typography>
          </Stack>
        </FormGroup>
      ) : (
        <FormGroup style={{ marginBottom: "10px" }}>
          <Stack
            style={{ margin: "auto" }}
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <AntSwitch
              defaultChecked
              inputProps={{ "aria-label": "ant design" }}
            />
          </Stack>
        </FormGroup>
      )} */}
    </>
  );
};
