export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  required = false,
  ...props
}: {
  label: string;
  required?: boolean;
}) => {
  return (
    <div className='form-group'>
      <label htmlFor={props.id} className='mb-1 block'>
        {label}
        {required && <span className='text-red-500'>*</span>}
      </label>
      <input
        {...props}
        className='w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-white hover:border-gray-500 focus:outline-none'
      />
    </div>
  );
};

export default FormInput;
