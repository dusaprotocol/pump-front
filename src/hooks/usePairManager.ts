import { Fraction } from '@dusalabs/sdk';
import { useQuery } from '@tanstack/react-query';
import { fetchPairAddress, fetchPairReserves } from 'utils/datastoreFetcher';
import { Token } from 'utils/types';

interface PairManagerProps {
  token: Token | undefined;
}

const usePairManager = ({ token }: PairManagerProps) => {
  const pairAddressQuery = useQuery(
    ['pairAddress', token?.address],
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    () => fetchPairAddress(token!.address),
    {
      enabled: !!token
    }
  );
  const pairAddress = pairAddressQuery.data || '';

  const pairReservesQuery = useQuery(
    ['pairReserves', pairAddress],
    () => fetchPairReserves(pairAddress),
    {
      enabled: !!pairAddress
    }
  );
  const pairReserves = pairReservesQuery.data;

  const price = pairReserves
    ? new Fraction(
        pairReserves.reserve_mas * 10n ** 9n,
        pairReserves.reserve_token
      )
    : new Fraction(1n);

  return {
    pairAddress,
    pairReserves,
    price,
    updateReservesAndPrice: pairReservesQuery.refetch
  };
};

export default usePairManager;
