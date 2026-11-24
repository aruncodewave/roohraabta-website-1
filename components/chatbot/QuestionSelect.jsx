import React, { useState } from 'react';
import Select from 'react-select';
import './QuestionSelect.css';
import './inputfield.css';

const QuestionSelect = ({ 
  questionText, 
  options = [], 
  selectedValue, 
  selectedValues = [],
  onChange, 
  onMultiChange,
  isMultiSelect = false,
  disabled = false,
  isCityQuestion = false
}) => {
  const [searchValue, setSearchValue] = useState('');

  // Convert options to react-select format
  const selectOptions = options.map((option) => ({
    value: option.id,
    label: option.label
  }));

  const isCity = isCityQuestion;

  let filteredOptions = selectOptions;
  let menuIsOpen;

  if (isCity) {
    const trimmedSearch = searchValue.trim();

    if (trimmedSearch) {
      const lowercaseSearch = trimmedSearch.toLowerCase();
      filteredOptions = selectOptions
        .filter((option) => option.label.toLowerCase().includes(lowercaseSearch))
        .slice(0, 10);
      menuIsOpen = filteredOptions.length > 0;
    } else {
      filteredOptions = [];
      menuIsOpen = false;
    }
  }

  const handleInputChange = (value, actionMeta) => {
    if (!isCity) {
      return value;
    }

    if (actionMeta.action === 'input-change') {
      setSearchValue(value);
    }

    if (actionMeta.action === 'menu-close' || actionMeta.action === 'input-blur') {
      setSearchValue('');
    }

    return value;
  };

  // Convert selectedValue to react-select format
  const selectedOption = selectedValue 
    ? selectOptions.find(opt => opt.value === selectedValue)
    : null;

  // Custom styles matching CustomSelect component but smaller
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      border: '1px solid #1A1A1A',
      borderRadius: "10px",
      backgroundColor: 'transparent',
      boxShadow: 'none',
      fontSize: '16px',
      color: '#1d184c',
      minHeight: 'auto',
      cursor: 'pointer',
      padding: '0',
      '&:hover': {
        // borderBottom: `2px solid #651514`,
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '12px',
    }),
    input: (provided) => ({
      ...provided,
      margin: '0',
      padding: '0',
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      paddingRight: '12px',
      paddingTop: '0',
      paddingBottom: '0',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#FFFFFF',
      borderRadius: '4px',
      marginTop: '4px',
      marginBottom: '0',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    }),
    menuList: (provided) => ({
      ...provided,
      backgroundColor: '#FFFFFF',
      borderRadius: '4px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused || state.isSelected 
        ? '#F6F6F6' 
        : '#FFFFFF',
      color: '#1d184c',
      fontSize: '15px',
      padding: '10px 14px',
      cursor: 'pointer',
      fontFamily: 'var(--font-mulish-regular)',
      '&:active': {
        backgroundColor: '#F6F6F6',
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#1d184c',
      fontSize: '16px',
      fontFamily: 'var(--font-mulish-regular)',
      cursor: 'pointer',
      margin: '0',
      padding: '0',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#1d184c',
      opacity: 0.5,
      fontSize: '16px',
      fontFamily: 'var(--font-mulish-regular)',
      cursor: 'pointer',
      margin: '0',
      padding: '0',
    }),
    dropdownIndicator: (provided) =>
      isCity
        ? {
            ...provided,
            display: 'none',
          }
        : {
            ...provided,
            color: '#651514',
            padding: '0 6px',
            cursor: 'pointer',
            '&:hover': {
              color: '#651514',
            },
          },
    indicatorSeparator: () => ({
      display: 'none',
    }),
  };

  if (isMultiSelect) {
    return (
      <div className="question-select-container">
        <label className="question-label">{questionText}</label>
        <div className="multi-select-wrapper">
          {options.map((option) => {
            const isChecked = selectedValues.includes(option.id);
            return (
              <label 
                key={option.id} 
                className={`multi-select-option ${isChecked ? 'checked' : ''}`}
              >
                <input
                  type="checkbox"
                  value={option.id}
                  checked={isChecked}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onMultiChange([...selectedValues, option.id]);
                    } else {
                      onMultiChange(selectedValues.filter(id => id !== option.id));
                    }
                  }}
                  disabled={disabled}
                />
                <span className="option-label">{option.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="question-select-container">
      {questionText && (
        <label className="text-[14px] uppercase text-[#757575] opacity-50 block font-mulish-regular mb-1">
          {questionText}
        </label>
      )}
      <Select
        options={isCity ? filteredOptions : selectOptions}
        value={selectedOption}
        onChange={(selected) => {
          if (isCity) {
            setSearchValue('');
          }
          onChange(selected ? selected.value : '');
        }}
        onInputChange={handleInputChange}
        styles={{
          ...customStyles,
          menuPortal: (base) => ({
            ...base,
            zIndex: 10000,
          }),
        }}
        placeholder={isCity ? 'please enter the city' : 'Select an option'}
        isDisabled={disabled}
        isSearchable={true}
        openMenuOnClick={!isCity}
        openMenuOnFocus={!isCity}
        menuIsOpen={isCity ? menuIsOpen : undefined}
        classNamePrefix="custom-select"
        menuPlacement="top"
      />
    </div>
  );
};

export default QuestionSelect;

