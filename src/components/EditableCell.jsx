import { useState } from 'react';

function formatLKR(n) {
  return 'LKR ' + n.toLocaleString('en-LK');
}

// Handles both editable (Admin) and read-only (View) rendering for a single
// price-list cell. `type` is 'money' for numeric LKR fields, 'text' for
// free-form fields like Discount (e.g. "5%", "1000 off", or blank).
export default function EditableCell({ value, onChange, isLowest, editable, type = 'money', placeholder = '—' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');

  const display = value == null || value === '' ? placeholder : type === 'money' ? formatLKR(value) : value;

  if (!editable) {
    return (
      <span className={`block text-right px-2 py-1 text-sm ${isLowest ? 'bg-green-50 text-green-700 font-semibold rounded' : 'text-gray-700'}`}>
        {display}
      </span>
    );
  }

  if (editing) {
    return (
      <input
        autoFocus
        type={type === 'money' ? 'number' : 'text'}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          onChange(draft);
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onChange(draft);
            setEditing(false);
          }
        }}
        className="w-24 border border-brand-red rounded px-1 py-0.5 text-right text-sm outline-none"
      />
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(value ?? '');
        setEditing(true);
      }}
      className={`w-full text-right px-2 py-1 rounded text-sm hover:bg-gray-100 ${
        isLowest ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700'
      }`}
      title="Click to edit"
    >
      {value == null || value === '' ? <span className="text-gray-300">{placeholder}</span> : display}
    </button>
  );
}
