import { lazy } from 'react';
import withPageTitle from './components/PageTitle';

const Home = lazy(() => import('./pages/Home'));
const Trade = lazy(() => import('./pages/Trade'));
const Create = lazy(() => import('./pages/Create'));
const Profile = lazy(() => import('./pages/Profile'));
const ErrorPage = lazy(() => import('./pages/ErrorPage'));

export const routeNames = {
  home: '/',
  trade: '/trade/:tokenAddress',
  create: '/create',
  profile: '/profile/:address',
  error: '*'
} as const;

interface Route {
  path: (typeof routeNames)[keyof typeof routeNames];
  title: string;
  component: React.FC;
}

const routes: Array<Route> = [
  {
    path: routeNames.home,
    title: 'Home',
    component: Home
  },
  {
    path: routeNames.trade,
    title: 'Trade',
    component: Trade
  },
  {
    path: routeNames.create,
    title: 'Create Token',
    component: Create
  },
  {
    path: routeNames.profile,
    title: 'Profile',
    component: Profile
  },
  {
    path: routeNames.error,
    title: 'Error',
    component: ErrorPage
  }
];

export const mappedRoutes = routes.map((route) => {
  const title = route.title ? `${route.title} • Pump` : 'Pump.Fun';

  const wrappedComponent = withPageTitle(title, route.component);

  return {
    path: route.path,
    component: wrappedComponent
  };
});
