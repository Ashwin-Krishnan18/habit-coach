import React from "react";
import { Glassmorphism } from "@/components/ui/glassmorphism";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  onConfirm,
  onCancel
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center">
      <Glassmorphism className="rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4">Delete Habit</h3>
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete this habit? Removing it will subtract 10 points from your total.
        </p>
        <div className="flex justify-end space-x-4">
          <button 
            className="px-4 py-2 bg-dark-600 hover:bg-dark-500 transition-colors rounded-lg font-medium"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-accent-danger hover:bg-red-600 transition-colors rounded-lg font-medium"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </Glassmorphism>
    </div>
  );
}
