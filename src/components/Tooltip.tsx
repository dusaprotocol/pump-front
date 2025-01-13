import clsx from 'clsx/lite';

interface TooltipProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

const Tooltip = ({ trigger, children, position = 'right' }: TooltipProps) => {
  return (
    <div className='group relative'>
      <div className='cursor-pointer'>{trigger}</div>
      <div
        className={clsx(
          'absolute hidden rounded border border-white bg-gray-800 px-2 py-1 text-white group-hover:block',
          position === 'top' &&
            'bottom-full left-1/2 mb-2 -translate-x-1/2 transform',
          position === 'bottom' &&
            'left-1/2 top-full mt-2 -translate-x-1/2 transform',
          position === 'left' &&
            'right-full top-1/2 mr-2 -translate-y-1/2 transform',
          position === 'right' &&
            'left-full top-1/2 ml-2 -translate-y-1/2 transform'
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default Tooltip;
