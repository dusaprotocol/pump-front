import { TradeContext } from 'pages/Trade';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { routeNames } from 'routes';
import { printAddress } from 'utils/methods';
import { User } from 'utils/trpc';

// prettier-ignore
const colors = ["FFF7D1", "FFD09B", "FFB0B0", "A5B68D", "C1CFA1", "CDC1FF", "D2E0FB", "FF8A8A", "DFD3C3", "F1EF99", "FFCF96","FDCEDF"];
function hashStringToNumber(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i);
    hash = (hash << 5) - hash + charCode;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
function generateNumberFromString(input: string): number {
  const hashValue = hashStringToNumber(input);
  // Ensure the value is positive and between 1 and 10
  const randomNumber = (Math.abs(hashValue) % colors.length) + 1;
  return randomNumber;
}

interface UserTagProps {
  user: User;
  displayDev?: boolean;
}

const UserTag = ({ user, displayDev = true }: UserTagProps) => {
  const color = '#' + colors[generateNumberFromString(user.address)];

  const { devAddress } = useContext(TradeContext);
  const { username, address } = user;
  return (
    <Link
      to={routeNames.profile.split(':')[0] + address}
      className='whitespace-nowrap rounded bg-green-500 px-2 py-1 text-xs font-medium text-black hover:underline'
      style={{ backgroundColor: color }}
    >
      {username && '@'}
      {username || printAddress(address)}{' '}
      {address === devAddress && displayDev && '💻 (dev)'}
    </Link>
  );
};

export default UserTag;
