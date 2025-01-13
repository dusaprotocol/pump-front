import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { printAddress } from 'utils/methods';

type DropdownVariant = 'default' | 'address';

interface DropdownProps {
  item: string;
  items: string[];
  onClick: (item: string) => void;
  variant?: DropdownVariant;
  className?: string;
}

const Dropdown = (props: DropdownProps) => {
  const { item, items, onClick, variant = 'default', className } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(item);
  const selectRef = useRef<HTMLDivElement>(null);

  const isDefault = variant === 'default';
  const isAddress = variant === 'address';

  const handleItemClick = (str: string) => {
    setSelectedItem(str);
    setIsOpen(false);
    onClick(str);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        event.target instanceof Node &&
        !selectRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={clsx('relative', className)} ref={selectRef}>
      <div
        role='button'
        aria-haspopup='listbox'
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex w-full cursor-pointer items-center gap-2 rounded-lg border border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-500 focus:border-white focus:outline-none focus:ring-2 focus:ring-green-400',
          {
            'justify-center p-1': isAddress,
            'justify-between border border-gray-600 bg-gray-800 p-2': isDefault
          }
        )}
      >
        <div>{isAddress ? printAddress(item) : item}</div>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={clsx(
            'h-3 w-3 transform transition-transform duration-200',
            { 'rotate-180': isOpen }
          )}
        />
      </div>
      {isOpen && (
        <div
          role='listbox'
          className={clsx(
            'absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-300 bg-gray-800 shadow-lg',
            { 'text-center': isAddress }
          )}
        >
          {items.map((_item, index) => (
            <div
              key={index}
              role='option'
              aria-selected={selectedItem === _item}
              onClick={() => handleItemClick(_item)}
              className={clsx('cursor-pointer px-4 py-2 hover:bg-gray-700', {
                'bg-slate-700': selectedItem === _item
              })}
            >
              {isAddress ? printAddress(_item) : _item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
