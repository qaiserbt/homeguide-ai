import { Navigate, Route, Routes } from "react-router-dom";
import { TourLayout } from "./layouts/TourLayout";
import { TourWelcome } from "./pages/TourWelcome";
import { RoomTour } from "./pages/RoomTour";
import { AskHomeGuide } from "./pages/AskHomeGuide";
import { Gallery } from "./pages/Gallery";
import { Features } from "./pages/Features";
import { FloorPlan } from "./pages/FloorPlan";
import { AdminLayout } from "./layouts/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminProperties } from "./pages/admin/AdminProperties";
import { CreateProperty } from "./pages/admin/CreateProperty";
import { AdminMedia } from "./pages/admin/AdminMedia";
import { AdminScripts } from "./pages/admin/AdminScripts";
import { AdminSettings } from "./pages/admin/AdminSettings";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/tour/236-pringle" replace />} />

      <Route path="/tour/:propertyId" element={<TourLayout />}>
        <Route index element={<TourWelcome />} />
        <Route path="room/:roomId" element={<RoomTour />} />
        <Route path="ask" element={<AskHomeGuide />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="features" element={<Features />} />
        <Route path="floor-plan" element={<FloorPlan />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="properties" element={<AdminProperties />} />
        <Route path="properties/new" element={<CreateProperty />} />
        <Route path="properties/:propertyId/edit" element={<CreateProperty />} />
        <Route path="media" element={<AdminMedia />} />
        <Route path="ai-scripts" element={<AdminScripts />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/tour/236-pringle" replace />} />
    </Routes>
  );
}

export default App;
