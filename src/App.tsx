import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { SetupPage } from "./pages/SetupPage";
import { TournamentPage } from "./pages/TournamentPage";
import { ResultsPage } from "./pages/ResultsPage";
import { TournamentProvider } from "./hooks/useTournament";
import { HistoryPage } from "./pages/HistoryPage";
import React from "react";

export const App = () => {
  return (
    <TournamentProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/tournament" element={<TournamentPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/results/:id" element={<ResultsPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </BrowserRouter>
    </TournamentProvider>
  );
};