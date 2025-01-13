import React, { ReactNode, useEffect, useRef } from 'react';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export interface ModalProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  title?: string;
  children?: ReactNode;
}

const Modal = ({ showModal, setShowModal, title, children }: ModalProps) => {
  const background = useRef<HTMLDivElement>(null);

  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'auto';
  };

  useEffect(() => {
    if (showModal) document.body.style.overflow = 'hidden';
  }, [showModal]);

  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      e.key === 'Escape' && closeModal();
    };

    document.addEventListener('keydown', onKeydown);

    return () => {
      document.removeEventListener('keydown', onKeydown);
    };
  }, []);

  return (
    <div className='relative z-50'>
      <div
        className='fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50 backdrop-filter'
        ref={background}
        onMouseDown={(e) => background.current === e.target && closeModal()}
      >
        <div className='mx-2 flex max-w-[90vw] flex-col gap-2 rounded-lg bg-gray-800 p-2 text-white'>
          <div className='flex justify-between'>
            <span className='font-semibold'>{title}</span>
            <button onClick={closeModal}>
              <FontAwesomeIcon icon={faXmark} className='text-xl' />
            </button>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
