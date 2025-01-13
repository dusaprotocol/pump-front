import { ReactNode, useContext, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Header from 'components/Header';
import AccountWrapper from 'components/AccountWrapper';
import { ToastContainer } from 'react-toastify';
import TutorialModal from 'components/TutorialModal';
import UserWrapper from 'components/UserWrapper';
import TrpcClientWrapper from 'components/TrpcClientWrapper';
import ScrollToTop from 'components/ScrollToTop';
import { TrpcClientWrapperContext } from 'context/TrpcClient';
import { trpc } from 'utils/trpc';
import 'react-toastify/dist/ReactToastify.css';
import { FEATURE_FLAGS } from 'utils/config';
import PauseScreen from 'components/PauseScreen';

const App = () => {
  const tutorialKey = 'hideTutorial';
  const shouldShowTutorial = localStorage.getItem(tutorialKey) !== 'true';
  const [showTutorial, setShowTutorial] = useState(shouldShowTutorial);

  useEffect(() => {
    if (!showTutorial) localStorage.setItem(tutorialKey, 'true');
  }, [showTutorial]);

  if (FEATURE_FLAGS.PAUSE_SCREEN) {
    return <PauseScreen />;
  }

  return (
    <>
      <TrpcClientWrapper>
        <Providers>
          <AccountWrapper>
            <UserWrapper>
              {showTutorial && (
                <TutorialModal
                  showModal={showTutorial}
                  setShowModal={setShowTutorial}
                />
              )}
              <Header />
              <main className='mx-4 my-4 flex flex-grow justify-center sm:mx-10'>
                <Outlet />
              </main>
              {/* <Footer /> */}
            </UserWrapper>
          </AccountWrapper>
        </Providers>
      </TrpcClientWrapper>
      <ToastContainer pauseOnHover={false} theme='dark' />
    </>
  );
};

export default App;

const Providers = ({ children }: { children: ReactNode }) => {
  const { trpcClient } = useContext(TrpcClientWrapperContext);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { refetchOnWindowFocus: false }
    }
  });

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        {children}
        <ScrollToTop />
      </QueryClientProvider>
    </trpc.Provider>
  );
};
