import React, { useState, useRef } from 'react';

const keys = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['z','x','c','v','b','n','m','@', '_', '-', '.'],
  ['1','2','3','4','5','6','7','8','9','0'],
  ['Space', 'Borrar']
];

export default function VirtualKeyboard({ onChange }) {
  const [visible, setVisible] = useState(false);
  const inputRef = useRef(null);

  const handleKeyPress = (key) => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;
    let newValue = input.value;

    if (key === 'Borrar') {
      newValue = newValue.slice(0, start - 1) + newValue.slice(end);
      input.setSelectionRange(start - 1, start - 1);
    } else if (key === 'Space') {
      newValue = newValue.slice(0, start) + ' ' + newValue.slice(end);
      input.setSelectionRange(start + 1, start + 1);
    } else {
      newValue = newValue.slice(0, start) + key + newValue.slice(end);
      input.setSelectionRange(start + key.length, start + key.length);
    }

    input.value = newValue;
    input.focus();

    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <input
        type="text"
        ref={inputRef}
        onChange={(e) => onChange?.(e.target.value)}
        style={{ padding: '0.5rem', fontSize: '1rem', width: '100%' }}
        placeholder="Tap here to type"
        className='text-gray-300 border-b border-gray-300 focus:border-[#00BFA6] focus:ring-[#00BFA6]'
      />

      <button type='button' onClick={() => setVisible(!visible)} className='text-gray-300' style={{ marginTop: '1rem', padding: '0.5rem' }}>
        {visible ? 'Ocultar Teclado' : 'Mostrar Teclado'}
      </button>

      {visible && (
        <div style={{ marginTop: '1rem', background: '#f0f0f0', padding: '1rem', borderRadius: '0.5rem' }} className='w-full'>
          {keys.map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
              {row.map((key) => (
                <button
                  type='button'
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  style={{
                    margin: '0.25rem',
                    padding: '1rem',
                    fontSize: '1rem',
                    borderRadius: '0.25rem',
                    minWidth: key === 'Space' ? '200px' : '40px',
                    background: '#ddd',
                    border: '1px solid #aaa'
                  }}
                >
                  {key === 'Space' ? '␣' : key}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
