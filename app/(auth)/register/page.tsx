import { registerAction } from "../actions";
import Link from "next/link";

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex bg-slate-950">
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700" />
                <div className="relative z-10 flex flex-col justify-between p-12 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-xl">
                            H
                        </div>
                        <span className="text-2xl font-semibold tracking-tight">HRFlow</span>
                    </div>
                    <div className="space-y-6">
                        <h1 className="text-4xl font-bold leading-tight max-w-md">
                            Join your team on HRFlow
                        </h1>
                        <p className="text-indigo-100 text-lg max-w-sm">
                            One platform for attendance, leave, communication and people management.
                        </p>
                    </div>
                    <p className="text-sm text-indigo-200/70">Secure · Modern · Built for teams</p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-white tracking-tight">Create account</h2>
                        <p className="mt-2 text-slate-400">Get started with HRFlow</p>
                    </div>

                    <form action={registerAction} className="space-y-5">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-1.5">
                                Full name
                            </label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                placeholder="Jane Doe"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                placeholder="you@company.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1.5">
                                Phone <span className="text-slate-500">(optional)</span>
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                placeholder="+234 800 000 0000"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={8}
                                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                placeholder="Minimum 8 characters"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition shadow-lg shadow-indigo-600/25"
                        >
                            Create account
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-400">
                        Already have an account?{" "}
                        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}