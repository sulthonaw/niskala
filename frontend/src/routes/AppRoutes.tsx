import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { AboutPage } from '../pages/About/AboutPage';
import { HomePage } from '../pages/Home/HomePage';
import { NotFoundPage } from '../pages/NotFound/NotFoundPage';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
