import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { DocsPage } from '../pages/Docs/DocsPage';
import { HomePage as CalendarPage } from '../pages/Home/HomePage';
import { LandingPage } from '../pages/Landing/LandingPage';
import { NotFoundPage } from '../pages/NotFound/NotFoundPage';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="catalog" element={<Navigate to="/docs" replace />} />
          <Route path="docs" element={<DocsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
