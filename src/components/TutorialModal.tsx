import Button from './Button';
import Modal, { ModalProps } from './Modal';

const TutorialModal = ({ showModal, setShowModal }: ModalProps) => {
  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <Modal
      showModal={showModal}
      setShowModal={setShowModal}
      title='How it works'
    >
      <div className='mb-4 flex flex-col'>
        <span>
          Pump prevents rugs by making sure that all created tokens are safe.
        </span>
        <span>
          Each coin on pump is a <strong>fair-launch</strong> with{' '}
          <strong>no presale</strong> and <strong>no team allocation</strong>.
        </span>
      </div>
      <div className='flex flex-col gap-4'>
        <div>step 1: pick a coin that you like</div>
        <div> step 2: buy the coin on the bonding curve</div>
        <div> step 3: sell at any time to lock in your profits or losses</div>
        <div>
          {' '}
          step 4: when enough people buy on the bonding curve it reaches a
          market cap of $69k
        </div>
        <div>
          step 5: $12k of liquidity is then deposited in Dusa and burned
        </div>
      </div>
      <br />

      <Button text="I'm ready to pump" variant='text' onClick={closeModal} />
    </Modal>
  );
};

export default TutorialModal;
