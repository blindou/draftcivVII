import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CreateDraftPage from './pages/CreateDraftPage';
import DraftPage from './pages/DraftPage';
import DraftPhasePage from './pages/DraftPhasePage';
import SummaryPage from './pages/SummaryPage';
import StatsPage from './pages/StatsPage';
import CivilizationsPage from './pages/CivilizationsPage';
import CivilizationDetailPage from './pages/CivilizationDetailPage';
import LeadersPage from './pages/LeadersPage';
import LeaderDetailPage from './pages/LeaderDetailPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create-draft" element={<CreateDraftPage />} />
          <Route path="/draft/:id" element={<DraftPage />} />
          <Route path="/draft/:id/phase/:phaseType" element={<DraftPhasePage />}>
            <Route path="ban-civ" />
            <Route path="ban-leader" />
            <Route path="ban-souvenir-1" />
            <Route path="pick-civ" />
            <Route path="pick-leader" />
            <Route path="ban-souvenir-2" />
          </Route>
          <Route path="/summary/:id" element={<SummaryPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/stats/civilizations" element={<CivilizationsPage />} />
          <Route path="/stats/civilizations/:id" element={<CivilizationDetailPage />} />
          <Route path="/stats/leaders" element={<LeadersPage />} />
          <Route path="/stats/leaders/:id" element={<LeaderDetailPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;