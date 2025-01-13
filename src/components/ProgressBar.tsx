import clsx from 'clsx/lite';

interface ProgressBarProps {
  progress: number;
  variant: 'green' | 'orange';
}

const ProgressBar = ({ progress, variant = 'orange' }: ProgressBarProps) => {
  return (
    <div
      aria-valuemax={100}
      aria-valuemin={0}
      role='progressbar'
      data-state='indeterminate'
      data-max={100}
      className='relative h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-slate-300'
    >
      <div
        data-state='indeterminate'
        data-max={100}
        className={clsx(
          'h-full w-full flex-1 transition-all',
          variant === 'green' ? 'bg-green-400' : 'bg-orange-400'
        )}
        style={{ transform: `translateX(${progress - 100}%)` }}
      />
    </div>
  );
};

export default ProgressBar;
