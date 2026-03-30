import SelectBox from './SelectBox';

const YEAR_OPTIONS  = Array.from({ length: 100 }, (_, i) => ({ value: String(2025 - i), label: `${2025 - i}년` }));
const MONTH_OPTIONS = Array.from({ length: 12  }, (_, i) => ({ value: String(i + 1),    label: `${i + 1}월` }));
const DAY_OPTIONS   = Array.from({ length: 31  }, (_, i) => ({ value: String(i + 1),    label: `${i + 1}일` }));

function BirthdaySelect({ year, month, day, onYearChange, onMonthChange, onDayChange, isError = false }) {
    return (
        <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 3, minWidth: 0 }}>
                <SelectBox
                    options={YEAR_OPTIONS}
                    value={year}
                    onChange={onYearChange}
                    placeholder="년도"
                    isSearchable
                    isError={isError}
                />
            </div>
            <div style={{ flex: 2, minWidth: 0 }}>
                <SelectBox
                    options={MONTH_OPTIONS}
                    value={month}
                    onChange={onMonthChange}
                    placeholder="월"
                    isSearchable={false}
                    isError={isError}
                />
            </div>
            <div style={{ flex: 2, minWidth: 0 }}>
                <SelectBox
                    options={DAY_OPTIONS}
                    value={day}
                    onChange={onDayChange}
                    placeholder="일"
                    isSearchable={false}
                    isError={isError}
                />
            </div>
        </div>
    );
}

export default BirthdaySelect;
