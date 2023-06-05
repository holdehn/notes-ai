import Datepicker from 'react-tailwindcss-datepicker';
import { DateValueType } from 'react-tailwindcss-datepicker/dist/types';

interface IStartDatePickerProps {
  onStartDateChange: (date: DateValueType) => void;
  startDate: Date;
}
let date = new Date();
let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

interface IDueDatePickerProps {
  onDueDateChange: (date: DateValueType) => void;
  date: DateValueType;
}

const DueDatePicker: React.FC<IDueDatePickerProps> = ({
  date,
  onDueDateChange,
}) => {
  return (
    <div className="mt-2">
      <Datepicker
        value={date as DateValueType}
        onChange={(date) => onDueDateChange(date)}
        startFrom={new Date()}
        displayFormat="MM/DD/YYYY"
        placeholder="Today"
        minDate={firstDay}
        maxDate={lastDay}
        inputClassName=" w-full cursor-pointer bg-gray-100 row-span-4 bg-gray-200 pl-1.5 rounded-md border-0 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-500 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      />
    </div>
  );
};

export default DueDatePicker;
