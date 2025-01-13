import clsx from 'clsx/lite';

interface TabsProps<T extends string> {
  tab: T;
  setTab: React.Dispatch<React.SetStateAction<T>>;
  tabs: T[];
  variant: 'classic' | 'swapCard' | 'small';
}

const Tabs = <T extends string>({
  tab,
  setTab,
  tabs,
  variant
}: TabsProps<T>) => {
  return (
    <div
      className={clsx(
        'flex w-full text-black',
        variant === 'small' && 'flex-col gap-2 sm:flex-row'
      )}
    >
      {tabs.map((t) => (
        <button
          key={t}
          className={clsx(
            variant === 'small' && 'px-2',
            'w-full whitespace-nowrap',
            tab === t ? 'bg-green-400' : 'bg-gray-200'
          )}
          // className={`${
          //   tab === t
          //     ? tabs.indexOf(t) === 0 || variant === 'classic'
          //       ? 'bg-green-400'
          //       : 'bg-red-500'
          //     : 'bg-gray-200'
          // } px-4 py-2 w-full`}
          onClick={() => setTab(t)}
        >
          {t}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
