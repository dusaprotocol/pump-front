import { useContext } from 'react';
import Modal from 'components/Modal';
import { AccountWrapperContext } from 'context/Account';
import station from 'assets/station.svg';
import bearby from 'assets/bearby.svg';

const ConnectModal = () => {
  const {
    showModal,
    setShowModal,
    setSelectedProvider,
    providerList,
    fetchAccounts,
    openBearbyWallet
  } = useContext(AccountWrapperContext);
  return (
    <Modal
      showModal={showModal}
      setShowModal={setShowModal}
      title='Connect a wallet'
    >
      <div className=''>
        <div className='flex flex-col gap-4'>
          <div className='mt-4 flex w-[90vw] max-w-80 flex-col gap-1 overflow-hidden rounded-xl'>
            {[
              {
                name: 'Massa Station',
                icon: station,
                downloadLink: 'https://station.massa.net',
                providerName: 'massastation'
              },
              {
                name: 'Bearby',
                icon: bearby,
                downloadLink: 'https://bearby.io',
                providerName: 'bearby'
              }
            ].map((method, i) => {
              const provider = providerList?.find(
                (p) => p.name().toLowerCase() === method.providerName
              );
              const disabled = provider === undefined;

              return (
                <button
                  className='flex cursor-pointer items-center justify-between px-3 py-4 hover:bg-gray-700'
                  style={{
                    fontStyle: disabled ? 'italic' : 'normal'
                  }}
                  onClick={async () => {
                    if (disabled) {
                      window.open(method.downloadLink, '_blank');
                    } else {
                      setSelectedProvider(provider);
                      if (method.name === 'Bearby') {
                        openBearbyWallet(provider);
                        return;
                      }
                      fetchAccounts(provider);
                    }
                  }}
                  key={i}
                >
                  <div className='flex items-center gap-3'>
                    <img
                      src={method.icon}
                      alt={method.name}
                      className='h-10 w-10'
                    />
                    <span>{method.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConnectModal;
