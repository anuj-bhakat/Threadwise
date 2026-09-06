import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import PeopleDirectory from "./pages/PeopleDirectory";
import ThreadsPage from "./pages/ThreadsPage";
import ThreadView from "./pages/ThreadView";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={
            token ? (
              <Navigate to="/home" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/people"
          element={
            <ProtectedRoute>
              <PeopleDirectory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/threads"
          element={
            <ProtectedRoute>
              <ThreadsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/thread-view"
          element={
            <ProtectedRoute>
              <ThreadView />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;