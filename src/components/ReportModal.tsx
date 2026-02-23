'use client';

import { useState } from 'react';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportedUserId: string;
    chatId?: string;
    userName: string;
}

const REASONS = [
    { value: 'HARASSMENT', label: 'Harassment or Bullying' },
    { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate Content' },
    { value: 'SPAM', label: 'Spam or Misleading' },
    { value: 'FAKE_PROFILE', label: 'Fake Profile / impersonation' },
    { value: 'UNDERAGE', label: 'Underage User' },
    { value: 'OTHER', label: 'Other' },
];

export default function ReportModal({ isOpen, onClose, reportedUserId, chatId, userName }: ReportModalProps) {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!reason) return;

        try {
            setLoading(true);
            const response = await fetch('/api/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reportedUserId,
                    reason,
                    description,
                    chatId,
                }),
            });

            if (response.ok) {
                setSubmitted(true);
                setTimeout(() => {
                    onClose();
                    setSubmitted(false);
                    setReason('');
                    setDescription('');
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to submit report:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`glass w-full max-w-md rounded-3xl p-6 transition-all transform ${submitted ? 'scale-95 opacity-50' : 'scale-100'}`}>
                {submitted ? (
                    <div className="text-center py-8 space-y-4">
                        <div className="text-4xl">✅</div>
                        <h2 className="text-xl font-bold text-white">Report Submitted</h2>
                        <p className="text-gray-400">Thank you for helping keep our campus safe. We will review this report shortly.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Report {userName}</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Reason for report</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {REASONS.map((r) => (
                                        <button
                                            key={r.value}
                                            onClick={() => setReason(r.value)}
                                            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${reason === r.value
                                                ? 'bg-purple-600/30 text-purple-300 border-2 border-purple-600/50'
                                                : 'bg-white/5 text-gray-300 border-2 border-transparent hover:bg-white/10'}`}
                                        >
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Additional details (optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Tell us more about the issue..."
                                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-white text-sm min-h-[100px] resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 rounded-2xl font-semibold glass hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !reason}
                                    className="flex-1 px-6 py-3 rounded-2xl font-semibold bg-red-600 hover:bg-red-700 transition-all hover-glow disabled:opacity-50"
                                >
                                    {loading ? 'Sending...' : 'Submit Report'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
