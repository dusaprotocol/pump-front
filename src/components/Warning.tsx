import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface WarningProps {
  text: string;
}

const Warning = ({ text }: WarningProps) => {
  return (
    <div className='flex items-center gap-2 rounded-lg bg-orange-400 px-2 py-1 text-sm text-black'>
      <FontAwesomeIcon icon={faExclamationTriangle} />
      {text}
    </div>
  );
};

export default Warning;
