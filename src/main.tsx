import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import App from './App';
import { mappedRoutes } from './routes';
import './index.css';

Sentry.init({
  dsn: 'https://d5a6933a55d84e6942a01c7a46c67772@o4508049985241088.ingest.de.sentry.io/4508049990811728',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration()
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0 // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

const container = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<App />}>
        {mappedRoutes.map((route, index: number) => (
          <Route
            path={route.path}
            key={'route-key-' + index}
            element={<Suspense fallback={null}>{<route.component />}</Suspense>}
          />
        ))}
      </Route>
    </Routes>
  </BrowserRouter>
);

// @notice: allow JSON.stringify on objects containing BigInt
// must be defined at the root level

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
BigInt.prototype.toJSON = function (): string {
  return String(this);
};
