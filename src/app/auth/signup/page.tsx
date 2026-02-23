'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function SignupPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        campus: '',
        age: '',
        gender: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            // Auto-login the user after successful signup
            const signInResult = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (signInResult?.error) {
                // If login fails, still redirect to verify email but user will need to login later
                console.error('Auto-login failed:', signInResult.error);
            }

            // Redirect to email verification
            router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}&token=${data.token || ''}`);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Signup failed';
            setError(message);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center px-6">
            <div className="glass rounded-2xl p-8 max-w-md w-full">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold gradient-text mb-2">Join GCET Campus</h2>
                    <p className="text-gray-400">Connect with fellow students</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Campus Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Select Your Campus *
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {['GCET', 'GU', 'GCOP'].map((campus) => (
                                <button
                                    key={campus}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, campus })}
                                    className={`py-3 rounded-lg font-semibold transition-all ${formData.campus === campus
                                        ? 'bg-purple-600 text-white hover-glow'
                                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                                        }`}
                                >
                                    {campus}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                            placeholder="John Doe"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email *
                            <span className="text-gray-500 font-normal ml-1">(personal or college)</span>
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                            placeholder="john@gmail.com"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                            placeholder="9876543210"
                        />
                    </div>

                    {/* Age & Gender */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Age *
                            </label>
                            <input
                                type="number"
                                required
                                min="18"
                                max="30"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                                placeholder="20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Gender *
                            </label>
                            <select
                                required
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                            >
                                <option value="">Select</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="NON_BINARY">Non-Binary</option>
                                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                            </select>
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Password *
                        </label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                            placeholder="Minimum 8 characters"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Must contain uppercase, lowercase, and number
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all hover-glow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>

                    <p className="text-center text-gray-400 text-sm">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-purple-400 hover:text-purple-300">
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
