import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { TourLayout } from "./layouts/TourLayout";
import { TourWelcome } from "./pages/TourWelcome";
import { RoomTour } from "./pages/RoomTour";
import { AskHomeGuide } from "./pages/AskHomeGuide";
import { Gallery } from "./pages/Gallery";
import { Features } from "./pages/Features";
import { FloorPlan } from "./pages/FloorPlan";

// The admin dashboard (and everything it pulls in, like pdfjs-dist for
// listing import) is only ever needed by the agent, never by a public
// tour visitor — code-split it so the public tour's bundle stays lean.
const AdminLayout = lazy(() => import("./layouts/AdminLayout").then((m) => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard })));
const AdminProperties = lazy(() => import("./pages/admin/AdminProperties").then((m) => ({ default: m.AdminProperties })));
const CreateProperty = lazy(() => import("./pages/admin/CreateProperty").then((m) => ({ default: m.CreateProperty })));
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia").then((m) => ({ default: m.AdminMedia })));
const AdminScripts = lazy(() => import("./pages/admin/AdminScripts").then((m) => ({ default: m.AdminScripts })));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings").then((m) => ({ default: m.AdminSettings })));

function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-offwhite text-sm text-text-secondary">
      Loading admin…
    </div>
  );
}

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

      <Route
        path="/admin"
        element={
          <Suspense fallback={<AdminLoading />}>
            <AdminLayout />
          </Suspense>
        }
      >
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
