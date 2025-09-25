import { lazy } from "react";
import { Route, Routes } from "react-router-dom";

const CardRateMaster = lazy(() => import("./cardRateMaster"));
const Master = () => {
  return (
    <>
      <Routes>
        <Route path="card-rate-master/*" element={<CardRateMaster />} />
      </Routes>
    </>
  );
};
export default Master;
