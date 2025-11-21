import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { Footer } from "./components/layout/Footer";
import { DashboardPage } from "./pages/DashboardPage";
import { ExplorePage } from "./pages/ExplorePage";
import { CreateGroupPage } from "./pages/CreateGroupPage";
import { ProfilePage } from "./pages/ProfilePage";
import { GroupDetailsPage } from "./pages/GroupDetailsPage";
import { GroupManagementPage } from "./pages/GroupManagementPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { PiggyBanksPage } from "./pages/PiggyBanksPage";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white relative overflow-hidden flex flex-col">
        {/* Enhanced animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        {/* Header */}
        <Header />

        {/* Main Layout with Sidebar */}
        <div className="flex flex-1 relative z-10">
          <Sidebar />
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/create-group" element={<CreateGroupPage />} />
              <Route path="/piggy-banks" element={<PiggyBanksPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:address" element={<ProfilePage />} />
              <Route path="/group/:id" element={<GroupDetailsPage />} />
              <Route path="/group/:id/manage" element={<GroupManagementPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
