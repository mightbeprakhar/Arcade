import { lazy, Suspense, type ComponentType } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { PresenterProvider } from './state/presenter';
import { Resettable } from './components/GameShell';
import Hub from './pages/Hub';

const Results = lazy(() => import('./pages/Results'));
const Ultimatum = lazy(() => import('./games/ultimatum/UltimatumGame'));
const Chicken = lazy(() => import('./games/chicken/ChickenGame'));
const Advertising = lazy(() => import('./games/advertising/AdvertisingGame'));
const Attrition = lazy(() => import('./games/attrition/AttritionGame'));
const Startup = lazy(() => import('./games/startup/StartupGame'));

function Game({ C }: { C: ComponentType }) {
  return <Resettable>{(k) => <C key={k} />}</Resettable>;
}

function Loading() {
  return <div className="grid min-h-screen place-items-center text-xl text-slate-400">Loading…</div>;
}

export default function App() {
  const loc = useLocation();
  return (
    <PresenterProvider>
      <Suspense fallback={<Loading />}>
        <Routes location={loc}>
          <Route path="/" element={<Hub />} />
          <Route path="/ultimatum" element={<Game C={Ultimatum} />} />
          <Route path="/chicken" element={<Game C={Chicken} />} />
          <Route path="/advertising" element={<Game C={Advertising} />} />
          <Route path="/attrition" element={<Game C={Attrition} />} />
          <Route path="/startup" element={<Game C={Startup} />} />
          <Route path="/results" element={<Results />} />
          <Route path="*" element={<Hub />} />
        </Routes>
      </Suspense>
    </PresenterProvider>
  );
}
