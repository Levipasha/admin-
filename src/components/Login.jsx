import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { Shield, Lock, User, Mail, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [step, setStep] = useState(1); // 1: username, 2: otp
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const otpInputs = React.useRef([]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Resend timer countdown
  useEffect(() => {
    let timer;
    if (otpSent && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, resendTimer]);

  const handleRequestOTP = async () => {
    if (username.trim() !== 'ARTLOVE') {
      toast.error('Invalid username. Please enter ARTLOVE');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.requestAdminOTP(username.trim());
      setMaskedEmail(response.email);
      setOtpSent(true);
      setStep(2);
      setResendTimer(60);
      toast.success('OTP sent to your email!');
      
      // Focus first OTP input
      setTimeout(() => {
        if (otpInputs.current[0]) {
          otpInputs.current[0].focus();
        }
      }, 100);
    } catch (error) {
      console.error('OTP request error:', error);
      toast.error(error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    try {
      setLoading(true);
      await authAPI.requestAdminOTP(username.trim());
      setResendTimer(60);
      toast.success('New OTP sent!');
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error(error.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter complete 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.verifyAdminOTP(username.trim(), otpString);
      
      // Store token and user
      localStorage.setItem('adminToken', response.token);
      localStorage.setItem('adminUser', JSON.stringify(response.user));
      
      // Update auth context
      await login(response.token, response.user);
      
      toast.success('Welcome to ARTLOVE Admin!');
      navigate('/');
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error(error.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
    // Handle enter
    if (e.key === 'Enter' && index === 5) {
      handleVerifyOTP();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    
    setOtp(newOtp);
    
    // Focus appropriate input
    const focusIndex = Math.min(pastedData.length, 5);
    otpInputs.current[focusIndex]?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-2xl shadow-lg mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ARTLOVE Admin</h1>
          <p className="text-gray-600">Secure Admin Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Progress Steps */}
          <div className="flex border-b">
            <div className={`flex-1 py-4 text-center text-sm font-medium ${
              step === 1 ? 'text-red-600 border-b-2 border-red-600 bg-red-50' : 'text-gray-500'
            }`}>
              <div className="flex items-center justify-center gap-2">
                <User className="w-4 h-4" />
                Username
              </div>
            </div>
            <div className={`flex-1 py-4 text-center text-sm font-medium ${
              step === 2 ? 'text-red-600 border-b-2 border-red-600 bg-red-50' : 'text-gray-500'
            }`}>
              <div className="flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                Verify OTP
              </div>
            </div>
          </div>

          <div className="p-8">
            {step === 1 ? (
              /* Step 1: Username Input */
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Enter Username</h2>
                  <p className="text-gray-500 text-sm">Please enter your admin username to continue</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleRequestOTP()}
                      placeholder="Enter ARTLOVE"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Hint: Username should be <span className="font-semibold text-red-600">ARTLOVE</span>
                  </p>
                </div>

                <button
                  onClick={handleRequestOTP}
                  disabled={loading || !username.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Request OTP
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Step 2: OTP Verification */
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Enter OTP</h2>
                  <p className="text-gray-500 text-sm">
                    We've sent a 6-digit code to<br />
                    <span className="font-medium text-gray-700">{maskedEmail}</span>
                  </p>
                </div>

                {/* OTP Input Boxes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                    Enter 6-digit OTP
                  </label>
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    OTP valid for 10 minutes
                  </p>
                </div>

                <button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Verify & Login
                    </>
                  )}
                </button>

                {/* Resend OTP */}
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Didn't receive the code?{' '}
                    {resendTimer > 0 ? (
                      <span className="text-gray-400">
                        Resend in {resendTimer}s
                      </span>
                    ) : (
                      <button
                        onClick={handleResendOTP}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                      >
                        Resend OTP
                      </button>
                    )}
                  </p>
                </div>

                {/* Back Button */}
                <button
                  onClick={() => {
                    setStep(1);
                    setOtp(['', '', '', '', '', '']);
                    setOtpSent(false);
                  }}
                  className="w-full text-gray-500 hover:text-gray-700 text-sm py-2"
                >
                  ← Back to username
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Protected by ARTLOVE Security<br />
            © {new Date().getFullYear()} ARTLOVE. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
