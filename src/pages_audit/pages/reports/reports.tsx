import { lazy } from "react";
import { Routes, Route } from "react-router-dom";

const StaticAdminUserReports = lazy(() => import("./staticReports"));
const TrialBalance924 = lazy(() => import("./trialBalance924"));
// const TrialBalanceVerticalReport = lazy(
//   () => import("./trial-balance-vertical-report")
// );

export const Reports = () => (
  <Routes>
    {/* <Route path="trial-balance/" element={<TrialBalanceVerticalReport />} /> */}
    <Route path="*" element={<StaticAdminUserReports />} />
    <Route path="/trial-balance-924/*" element={<TrialBalance924 />} />
  </Routes>
);
