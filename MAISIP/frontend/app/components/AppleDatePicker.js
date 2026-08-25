'use client';
import React, { forwardRef, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './AppleDatePicker.module.css';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

// Helper to parse date strings into a valid Date object (local time)
function parseDateValue(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    // Check YYYY-MM-DD or YYYY/MM/DD
    const ymdMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (ymdMatch) {
      const y = parseInt(ymdMatch[1], 10);
      const m = parseInt(ymdMatch[2], 10) - 1;
      const d = parseInt(ymdMatch[3], 10);
      const date = new Date(y, m, d);
      if (date.getFullYear() === y && date.getMonth() === m && date.getDate() === d) {
        return date;
      }
    }

    // Check DD-MM-YYYY or DD/MM/YYYY
    const dmyMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    if (dmyMatch) {
      const d = parseInt(dmyMatch[1], 10);
      const m = parseInt(dmyMatch[2], 10) - 1;
      const y = parseInt(dmyMatch[3], 10);
      const date = new Date(y, m, d);
      if (date.getFullYear() === y && date.getMonth() === m && date.getDate() === d) {
        return date;
      }
    }

    const fallback = new Date(trimmed);
    if (!isNaN(fallback.getTime())) {
      return fallback;
    }
  }
  return null;
}

// ForwardRef input allowing both direct typing and opening the calendar popup
const CustomInput = forwardRef(({ 
  value, 
  onClick, 
  onChange, 
  onBlur, 
  onFocus, 
  onKeyDown, 
  placeholder, 
  disabled, 
  style, 
  className 
}, ref) => (
  <div className={styles.inputWrapper} style={style}>
    <input
      type="text"
      value={value || ''}
      onClick={onClick}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={`${styles.appleInput} ${className || ''}`}
      disabled={disabled}
      ref={ref}
      autoComplete="off"
    />
    <button
      type="button"
      className={styles.calendarIconButton}
      onClick={onClick}
      disabled={disabled}
      tabIndex={-1}
      aria-label="Open Calendar"
    >
      <svg className={styles.calendarIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    </button>
  </div>
));
CustomInput.displayName = 'CustomInput';

export default function AppleDatePicker({ 
  value, 
  onChange, 
  name,
  placeholder = "DD-MM-YYYY",
  disabled = false,
  className = "",
  style = {},
  wrapperClassName = "",
  dateFormat = "dd-MM-yyyy",
  minDate = null,
  maxDate = null,
  startYear = 1920,
  endYear = new Date().getFullYear() + 15,
  ...rest
}) {
  
  // Parse incoming value string (YYYY-MM-DD or DD-MM-YYYY) into a Date object
  const selectedDate = useMemo(() => parseDateValue(value), [value]);

  // Generate list of years for the dropdown (descending for quick past/current selection)
  const years = useMemo(() => {
    const list = [];
    for (let y = endYear; y >= startYear; y--) {
      list.push(y);
    }
    return list;
  }, [startYear, endYear]);

  const handleChange = (date) => {
    if (!date) {
      if (onChange) {
        onChange({ target: { name, value: '' } });
      }
      return;
    }
    
    if (isNaN(date.getTime())) {
      return;
    }
    
    // Format to YYYY-MM-DD for standard backend consistency
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const formattedValue = `${yyyy}-${mm}-${dd}`;
    
    if (onChange) {
      onChange({ target: { name, value: formattedValue } });
    }
  };

  const handleRawChange = (e) => {
    if (!e || !e.target) return;
    const rawVal = e.target.value;
    if (!rawVal || rawVal.trim() === '') {
      if (onChange) {
        onChange({ target: { name, value: '' } });
      }
      return;
    }

    const parsed = parseDateValue(rawVal);
    if (parsed) {
      const yyyy = parsed.getFullYear();
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const dd = String(parsed.getDate()).padStart(2, '0');
      const formattedValue = `${yyyy}-${mm}-${dd}`;
      if (onChange) {
        onChange({ target: { name, value: formattedValue } });
      }
    }
  };

  return (
    <div className={`${styles.datePickerContainer} ${wrapperClassName}`}>
      <DatePicker
        selected={selectedDate}
        onChange={handleChange}
        onChangeRaw={handleRawChange}
        dateFormat={["dd-MM-yyyy", "dd/MM/yyyy", "yyyy-MM-dd", "d-M-yyyy", "d/M/yyyy"]}
        placeholderText={placeholder}
        disabled={disabled}
        fixedHeight
        minDate={minDate ? parseDateValue(minDate) : undefined}
        maxDate={maxDate ? parseDateValue(maxDate) : undefined}
        customInput={
          <CustomInput 
            style={style} 
            className={className} 
            disabled={disabled} 
            placeholder={placeholder}
          />
        }
        calendarClassName={styles.appleCalendar}
        popperClassName={styles.applePopper}
        showPopperArrow={false}
        popperPlacement="bottom-start"
        renderCustomHeader={({
          date,
          changeYear,
          changeMonth,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled
        }) => (
          <div className={styles.customHeader}>
            <button
              type="button"
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              className={styles.navButton}
              aria-label="Previous Month"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <div className={styles.headerSelectors}>
              <div className={styles.selectWrapper}>
                <select
                  value={MONTHS[date.getMonth()]}
                  onChange={({ target: { value: selectedMonth } }) => changeMonth(MONTHS.indexOf(selectedMonth))}
                  className={styles.headerSelect}
                  aria-label="Select Month"
                >
                  {MONTHS.map((monthName) => (
                    <option key={monthName} value={monthName}>
                      {monthName}
                    </option>
                  ))}
                </select>
                <svg className={styles.selectChevron} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              <div className={styles.selectWrapper}>
                <select
                  value={date.getFullYear()}
                  onChange={({ target: { value: selectedYear } }) => changeYear(Number(selectedYear))}
                  className={styles.headerSelect}
                  aria-label="Select Year"
                >
                  {years.map((yearNum) => (
                    <option key={yearNum} value={yearNum}>
                      {yearNum}
                    </option>
                  ))}
                </select>
                <svg className={styles.selectChevron} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>

            <button
              type="button"
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              className={styles.navButton}
              aria-label="Next Month"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        )}
        {...rest}
      />
    </div>
  );
}
