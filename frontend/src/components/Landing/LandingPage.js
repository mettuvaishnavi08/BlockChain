import React, { useState, useEffect } from 'react';
import { Shield, Award, Users, CheckCircle, ArrowRight, Globe, Lock, Zap, Star, ChevronDown } from 'lucide-react';

const LandingPage = () => {
    const handleNavigation = (path) => {
        // In actual implementation, this would use React Router's navigate
        console.log(`Navigate to: ${path}`);
        window.location.hash = path;
    };
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeTestimonial, setActiveTestimonial] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTestimonial((prev) => (prev + 1) % 3);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const features = [
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Blockchain Security",
            description: "Immutable credential storage with cryptographic verification ensuring complete tamper-proof records."
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: "Instant Verification",
            description: "Real-time credential verification in seconds, eliminating lengthy background check processes."
        },
        {
            icon: <Globe className="w-8 h-8" />,
            title: "Global Recognition",
            description: "Universal credential acceptance across institutions worldwide with standardized verification protocols."
        },
        {
            icon: <Lock className="w-8 h-8" />,
            title: "Privacy First",
            description: "Zero-knowledge proofs ensure credential verification without exposing sensitive personal data."
        }
    ];

    const stats = [
        { number: "50K+", label: "Verified Credentials" },
        { number: "200+", label: "Partner Institutions" },
        { number: "99.9%", label: "Uptime Guarantee" },
        { number: "15+", label: "Countries Served" }
    ];

    const testimonials = [
        {
            name: "Dr. Sarah Chen",
            role: "Dean of Engineering, MIT",
            content: "This platform has revolutionized how we issue and verify academic credentials. The blockchain integration provides unparalleled security.",
            rating: 5
        },
        {
            name: "Michael Rodriguez",
            role: "HR Director, Google",
            content: "Credential verification that used to take weeks now happens in seconds. This has transformed our hiring process completely.",
            rating: 5
        },
        {
            name: "Prof. James Wilson",
            role: "Academic Registrar, Oxford",
            content: "The global recognition and standardization this platform provides is exactly what higher education needed.",
            rating: 5
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-900/95 backdrop-blur-lg border-b border-purple-500/20' : 'bg-transparent'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-white">CredVerify</span>
                        </div>

                        <div className="hidden md:flex space-x-8">
                            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</a>
                            <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</a>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={() => handleNavigation('/auth/login')}
                                className="px-4 py-2 text-white hover:text-purple-300 transition-colors"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => handleNavigation('/auth/register')}
                                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center space-x-2 bg-purple-500/20 rounded-full px-4 py-2 mb-8">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-purple-300 text-sm">Now Live on Blockchain</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                            Verify Credentials
                            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent block">
                                Instantly & Securely
                            </span>
                        </h1>

                        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Revolutionary blockchain-powered platform that transforms how educational and professional credentials are issued, stored, and verified globally.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <button
                                onClick={() => handleNavigation('/auth/register')}
                                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                            >
                                <span>Start Verifying</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleNavigation('/verify')}
                                className="px-8 py-4 border-2 border-purple-500 text-purple-300 rounded-xl font-semibold hover:bg-purple-500/10 transition-all"
                            >
                                Verify a Credential
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                                    <div className="text-gray-400 text-sm">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Cutting-Edge Features
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Experience the future of credential verification with our advanced blockchain technology
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="group">
                                <div className="bg-gradient-to-br from-slate-800/50 to-purple-900/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 h-full hover:border-purple-400/40 transition-all duration-300 hover:transform hover:scale-105">
                                    <div className="text-purple-400 mb-6 group-hover:text-purple-300 transition-colors">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Simple three-step process to secure and verify credentials
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            {
                                step: "01",
                                title: "Issue Credentials",
                                description: "Educational institutions securely issue digital credentials on the blockchain with cryptographic signatures.",
                                icon: <Award className="w-12 h-12" />
                            },
                            {
                                step: "02",
                                title: "Store Securely",
                                description: "Credentials are immutably stored on the blockchain, ensuring they cannot be altered or falsified.",
                                icon: <Lock className="w-12 h-12" />
                            },
                            {
                                step: "03",
                                title: "Verify Instantly",
                                description: "Anyone can verify credentials in real-time using our global verification network.",
                                icon: <CheckCircle className="w-12 h-12" />
                            }
                        ].map((step, index) => (
                            <div key={index} className="text-center">
                                <div className="bg-gradient-to-br from-purple-500 to-blue-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-white">
                                    {step.icon}
                                </div>
                                <div className="text-purple-400 font-bold text-lg mb-2">STEP {step.step}</div>
                                <h3 className="text-2xl font-semibold text-white mb-4">{step.title}</h3>
                                <p className="text-gray-300 leading-relaxed">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Trusted Worldwide
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            See what leading institutions and organizations say about our platform
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gradient-to-br from-slate-800/50 to-purple-900/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 md:p-12">
                            <div className="text-center">
                                <div className="flex justify-center mb-6">
                                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                                        <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                                    ))}
                                </div>

                                <blockquote className="text-xl md:text-2xl text-white mb-8 leading-relaxed">
                                    "{testimonials[activeTestimonial].content}"
                                </blockquote>

                                <div className="text-purple-400 font-semibold text-lg">
                                    {testimonials[activeTestimonial].name}
                                </div>
                                <div className="text-gray-400">
                                    {testimonials[activeTestimonial].role}
                                </div>
                            </div>

                            <div className="flex justify-center mt-8 space-x-2">
                                {testimonials.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveTestimonial(index)}
                                        className={`w-3 h-3 rounded-full transition-all ${index === activeTestimonial ? 'bg-purple-400' : 'bg-gray-600'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Ready to Get Started?
                        </h2>
                        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                            Join thousands of institutions and individuals already using our platform to secure and verify credentials.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => handleNavigation('/auth/register')}
                                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105"
                            >
                                Create Account
                            </button>
                            <button
                                onClick={() => handleNavigation('/verify')}
                                className="px-8 py-4 border-2 border-purple-500 text-purple-300 rounded-xl font-semibold hover:bg-purple-500/10 transition-all"
                            >
                                Verify Now
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-purple-500/20">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">CredVerify</span>
                        </div>

                        <div className="flex space-x-8 text-gray-400">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Support</a>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-purple-500/20 text-center text-gray-400">
                        <p>&copy; 2025 CredVerify. All rights reserved. Powered by blockchain technology.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;