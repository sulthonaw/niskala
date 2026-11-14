import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { AboutPage } from '../pages/About/AboutPage';
import { CatalogPage } from '../pages/Catalog/CatalogPage';
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
          <Route path="about" element={<AboutPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="docs" element={<DocsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
