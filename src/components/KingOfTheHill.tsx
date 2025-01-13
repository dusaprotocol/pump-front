import { TokenFull } from 'utils/trpc';
import TokenLink from './TokenLink';

const KingOfTheHill = ({ token }: { token: TokenFull }) => {
  return (
    <div className='flex max-w-[500px] scale-[80%] flex-col gap-2'>
      <span className='text-center text-2xl font-semibold italic text-yellow-300 opacity-90'>
        King of the Hill 👑
      </span>
      <TokenLink key={token.address} token={token} />
    </div>
  );
};

export default KingOfTheHill;
