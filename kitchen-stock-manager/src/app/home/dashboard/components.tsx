"use client";
import React from "react";
import { Save, X, Trash2, Plus } from "lucide-react";

// Reusable Button Components for Dashboard
interface ActionButtonProps {
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  saving?: boolean;
  children?: React.ReactNode;
}

export const SaveButton = ({ onClick, disabled, saving }: ActionButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className='px-2 py-1 text-xs rounded disabled:opacity-50 flex items-center gap-1 hover:bg-green-50'
    style={{ color: '#16a34a' }}
  >
    {saving ? <span className='animate-spin'>⏳</span> : <Save className='w-3 h-3' />}
    บันทึก
  </button>
);

export const CancelButton = ({ onClick }: ActionButtonProps) => (
  <button
    onClick={onClick}
    className='px-2 py-1 text-xs rounded hover:bg-gray-100'
    style={{ color: '#4b5563' }}
  >
    ยกเลิก
  </button>
);

export const DeleteButton = ({ onClick, children }: ActionButtonProps) => (
  <button
    onClick={onClick}
    className='px-2 py-1 text-xs rounded flex items-center gap-1 hover:bg-red-50'
    style={{ color: '#dc2626' }}
  >
    <Trash2 className='w-3 h-3' />
    {children || 'ลบ'}
  </button>
);

export const AddNoteButton = ({ onClick, label = "เพิ่มโน้ต" }: { onClick: (e: React.MouseEvent) => void; label?: string }) => (
  <button
    onClick={onClick}
    className='group/btn w-full px-2 py-1 text-xs text-orange-600 border border-dashed border-orange-300 rounded hover:bg-orange-50 flex items-center justify-center gap-1 transition-all duration-300 ease-in-out active:scale-95'
  >
    <Plus className='w-3 h-3 transition-transform duration-300 group-hover/btn:rotate-180 group-hover/btn:scale-110' />
    {label}
  </button>
);

// Reusable Note Form Component
interface NoteFormProps {
  value: string;
  onChange: (value: string) => void;
  onSave: (e: React.MouseEvent) => void;
  onCancel: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  placeholder?: string;
  saving?: boolean;
  showDelete?: boolean;
}

export const PackagingNoteForm = ({
  value,
  onChange,
  onSave,
  onCancel,
  onDelete,
  placeholder = "เพิ่มโน้ต...",
  saving,
  showDelete
}: NoteFormProps) => (
  <div className='mb-2 p-2 bg-gray-50 rounded border border-gray-200'>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className='w-full text-xs p-2 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-black'
      rows={2}
      onClick={(e) => e.stopPropagation()}
    />
    <div className='flex justify-end gap-1 mt-1'>
      {showDelete && onDelete && <DeleteButton onClick={onDelete} />}
      <SaveButton onClick={onSave} disabled={saving} saving={saving} />
      <CancelButton onClick={onCancel} />
    </div>
  </div>
);

// Packaging Item Display
interface PackagingItemProps {
  label: string;
  value: number;
  bgClass: string;
  textClass: string;
}

export const PackagingItem = ({ label, value, bgClass, textClass }: PackagingItemProps) => {
  if (value <= 0) return null;
  return (
    <div className={`flex justify-between items-center py-1 px-2 ${bgClass} rounded mb-1`}>
      <span className={`font-semibold ${textClass}`}>{label}</span>
      <span className={`font-bold ${textClass}`}>{value}</span>
    </div>
  );
};
