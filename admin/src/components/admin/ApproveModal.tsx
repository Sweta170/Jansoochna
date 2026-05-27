import React, { useState } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import type { AccessRequest } from '../../hooks/useAccessRequests';


interface ApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: AccessRequest;
  onConfirm: (role: 'state_admin' | 'district_admin') => Promise<void>;
  isConfirming: boolean;
}

export default function ApproveModal({
  isOpen,
  onClose,
  request,
  onConfirm,
  isConfirming,
}: ApproveModalProps) {
  const [role, setRole] = useState<'state_admin' | 'district_admin'>('district_admin');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(role);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/55 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Content Card */}
      <div className="bg-[#1a2535] border border-white/10 rounded-2xl shadow-2xl z-10 w-full max-w-md p-6 relative text-white">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#1d9e75]/15 border border-[#1d9e75]/30 flex items-center justify-center text-[#1D9E75]">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Approve Access Request</h3>
            <p className="text-slate-400 text-xs mt-0.5">Assign administrative role for the officer</p>
          </div>
        </div>

        {/* Officer Details Info */}
        <div className="bg-[#111d2a] p-4 rounded-xl border border-white/5 space-y-2 mb-5 text-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Officer Name</span>
            <span className="font-semibold text-slate-200">{request.full_name}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Official Email</span>
            <span className="font-mono text-slate-300">{request.email}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/5">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Jurisdiction State</span>
              <span className="text-slate-300 font-semibold">{request.state}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Jurisdiction District</span>
              <span className="text-slate-300 font-semibold">{request.district || 'N/A'}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Picker Segmented Radio buttons/pills */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mb-2 block">
              Select Administrative Role
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <label 
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border cursor-pointer transition-all ${
                  role === 'district_admin' 
                    ? 'border-[#1D9E75] bg-[#1d9e75]/10 text-white' 
                    : 'border-white/10 bg-[#111d2a] text-slate-400 hover:text-slate-200'
                }`}
              >
                <input 
                  type="radio" 
                  name="role" 
                  value="district_admin"
                  checked={role === 'district_admin'}
                  onChange={() => setRole('district_admin')}
                  className="sr-only"
                />
                <span className="text-xs font-bold">District Admin</span>
                <span className="text-[9px] text-slate-400 mt-1 text-center font-normal">
                  Access restricted to {request.district}
                </span>
              </label>

              <label 
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border cursor-pointer transition-all ${
                  role === 'state_admin' 
                    ? 'border-[#1D9E75] bg-[#1d9e75]/10 text-white' 
                    : 'border-white/10 bg-[#111d2a] text-slate-400 hover:text-slate-200'
                }`}
              >
                <input 
                  type="radio" 
                  name="role" 
                  value="state_admin"
                  checked={role === 'state_admin'}
                  onChange={() => setRole('state_admin')}
                  className="sr-only"
                />
                <span className="text-xs font-bold">State Admin</span>
                <span className="text-[9px] text-slate-400 mt-1 text-center font-normal">
                  Access to all districts in {request.state}
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              disabled={isConfirming}
              className="flex-1 py-2.5 border border-white/10 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition-colors hover:bg-white/5"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isConfirming}
              className="flex-1 py-2.5 bg-[#1D9E75] hover:bg-[#1a8d68] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors shadow-md shadow-[#1D9E75]/10"
            >
              {isConfirming ? 'Approving...' : 'Confirm Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
