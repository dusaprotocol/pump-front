import clsx from 'clsx/lite';

interface IncludeNSFWProps {
  includeNSFW: boolean;
  setIncludeNSFW: (value: boolean) => void;
}

const IncludeNSFW = ({ includeNSFW, setIncludeNSFW }: IncludeNSFWProps) => {
  return (
    <div className='flex items-center gap-2'>
      <span className='whitespace-nowrap'>Include nsfw:</span>
      <div className='flex items-center gap-1'>
        <div
          className={clsx(
            'cursor-pointer rounded-sm px-1',
            includeNSFW && 'bg-green-400 text-black'
          )}
          onClick={() => setIncludeNSFW(true)}
        >
          On
        </div>
        <div
          className={clsx(
            'cursor-pointer rounded-sm px-1',
            !includeNSFW && 'bg-green-400 text-black'
          )}
          onClick={() => setIncludeNSFW(false)}
        >
          Off
        </div>
      </div>
    </div>
  );
};

export default IncludeNSFW;
