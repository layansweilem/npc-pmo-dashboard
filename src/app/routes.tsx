import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { ExecutiveOverview } from './pages/ExecutiveOverviewTabbed';
import { PortfolioDeepDive } from './pages/PortfolioDeepDive';
import { ProjectManagerView } from './pages/ProjectManagerView';
import { ProjectDetails } from './pages/ProjectDetails';
import { ExecutivePortfolioDashboard } from './pages/ExecutivePortfolioDashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><ExecutiveOverview /></Layout>,
  },
  {
    path: '/executive-portfolio',
    element: <ExecutivePortfolioDashboard />,
  },
  {
    path: '/portfolio',
    element: <Layout><PortfolioDeepDive /></Layout>,
  },
  {
    path: '/portfolio-deep-dive',
    element: <Layout><PortfolioDeepDive /></Layout>,
  },
  {
    path: '/project-manager',
    element: <Layout><ProjectManagerView /></Layout>,
  },
  {
    path: '/project-details',
    element: <Layout><ProjectDetails /></Layout>,
  },
]);