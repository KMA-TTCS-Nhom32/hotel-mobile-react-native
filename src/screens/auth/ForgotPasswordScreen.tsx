import { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Input } from '@/components/ui';
import { authService } from '@/services/auth/authService';

type Step = 'email' | 'otp-reset';

/**
 * Forgot Password screen với OTP flow
 */
export const ForgotPasswordScreen = () => {
    const router = useRouter();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    // Countdown timer for resend
    useEffect(() => {
        if (step === 'otp-reset' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setCanResend(true);
        }
    }, [countdown, step]);

    const handleSendOTP = async () => {
        if (!email.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập email');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Lỗi', 'Email không hợp lệ');
            return;
        }

        setIsProcessing(true);
        try {
            await authService.initiateForgotPassword(email.trim().toLowerCase());

            Alert.alert('Thành công', 'Mã OTP đã được gửi đến email của bạn');
            setStep('otp-reset');
            setCountdown(60);
            setCanResend(false);
        } catch (error: any) {
            Alert.alert('Gửi mã thất bại', error.message || 'Không thể gửi mã OTP');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOtpChange = (raw: string, index: number) => {
        const digits = raw.replace(/\D/g, '');
        if (digits.length === 0) {
            setOtp(prev => {
                const next = [...prev];
                next[index] = '';
                return next;
            });
            return;
        }
        setOtp(prev => {
            const next = [...prev];
            const chars = digits.split('');
            next[index] = chars[0]!;
            for (let i = 1; i < chars.length && index + i < 6; i++) {
                next[index + i] = chars[i]!;
            }
            return next;
        });
        const nextIndex = Math.min(index + digits.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleResetPassword = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mã OTP');
            return;
        }

        if (!newPassword) {
            Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu mới');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu không khớp');
            return;
        }

        setIsProcessing(true);
        try {
            await authService.resetPasswordWithOTP(email, otpCode, newPassword);

            Alert.alert(
                'Thành công!',
                'Mật khẩu đã được đặt lại. Bạn có thể đăng nhập ngay bây giờ.',
                [
                    {
                        text: 'Đăng nhập',
                        onPress: () => router.replace('/auth/login'),
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert('Đặt lại mật khẩu thất bại', error.message);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsProcessing(false);
        }
    };

    const handleResendOTP = async () => {
        if (!canResend) return;

        setIsProcessing(true);
        try {
            await authService.initiateForgotPassword(email);
            Alert.alert('Thành công', 'Mã OTP mới đã được gửi');

            setCountdown(60);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (error: any) {
            Alert.alert('Gửi lại thất bại', error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <KeyboardAvoidingView
            className='flex-1'
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                className='flex-1 bg-orange-50'
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps='handled'
            >
                <View className='flex-1 justify-center px-6 py-12'>
                    {/* Logo */}
                    <View className='mb-8 items-center'>
                        <Image
                            source={require('@/assets/logos/logo-light.webp')}
                            className='mb-4 h-16 w-16'
                            resizeMode='contain'
                        />
                        <Text className='text-center text-lg font-medium text-orange-600'>
                            {step === 'email' ? 'Quên Mật Khẩu' : 'Đặt Lại Mật Khẩu'}
                        </Text>
                        <Text className='mt-2 text-center text-sm text-orange-500'>
                            {step === 'email'
                                ? 'Nhập email để nhận mã OTP'
                                : 'Nhập mã OTP và mật khẩu mới'}
                        </Text>
                    </View>

                    {/* Step 1: Enter Email */}
                    {step === 'email' && (
                        <View className='space-y-4'>
                            <View>
                                <Text className='mb-2 text-sm font-medium text-orange-800'>
                                    Địa chỉ Email
                                </Text>
                                <Input
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder='Nhập email của bạn'
                                    keyboardType='email-address'
                                    autoCapitalize='none'
                                    autoComplete='email'
                                    editable={!isProcessing}
                                    className='border-orange-200 bg-white focus:border-orange-400'
                                />
                            </View>

                            <Button
                                title={isProcessing ? 'Đang gửi...' : 'Gửi Mã OTP'}
                                onPress={handleSendOTP}
                                variant='primary'
                                fullWidth
                                disabled={isProcessing}
                                style={{ marginTop: 16, backgroundColor: '#f97316' }}
                            />

                            <TouchableOpacity
                                onPress={() => router.back()}
                                disabled={isProcessing}
                                className='mt-4'
                            >
                                <Text className='text-center text-sm font-medium text-orange-600'>
                                    Quay lại Đăng nhập
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Step 2: OTP + New Password */}
                    {step === 'otp-reset' && (
                        <View className='space-y-4'>
                            {/* OTP Input */}
                            <View>
                                <Text className='mb-2 text-sm font-medium text-orange-800'>
                                    Mã OTP
                                </Text>
                                <Text className='mb-4 text-center text-xs text-orange-600'>
                                    Đã gửi đến: {email}
                                </Text>
                                <View className='mb-4 flex-row justify-center space-x-3'>
                                    {otp.map((digit, index) => (
                                        <TextInput
                                            key={index}
                                            ref={ref => {
                                                inputRefs.current[index] = ref;
                                            }}
                                            value={digit}
                                            onChangeText={value => handleOtpChange(value, index)}
                                            onKeyPress={({ nativeEvent }) =>
                                                handleKeyPress(nativeEvent.key, index)
                                            }
                                            keyboardType='numeric'
                                            maxLength={6}
                                            editable={!isProcessing}
                                            className='h-12 w-12 rounded-lg border-2 border-orange-200 bg-white text-center text-lg font-bold text-orange-800 focus:border-orange-400'
                                        />
                                    ))}
                                </View>

                                {/* Resend */}
                                <View className='items-center'>
                                    <TouchableOpacity
                                        onPress={handleResendOTP}
                                        disabled={!canResend || isProcessing}
                                    >
                                        <Text
                                            className={`text-sm font-semibold ${canResend && !isProcessing
                                                    ? 'text-orange-600'
                                                    : 'text-orange-300'
                                                }`}
                                        >
                                            {canResend
                                                ? 'Gửi lại mã'
                                                : `Gửi lại sau ${countdown}s`}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* New Password */}
                            <View>
                                <Text className='mb-2 text-sm font-medium text-orange-800'>
                                    Mật Khẩu Mới
                                </Text>
                                <View className='relative'>
                                    <Input
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        placeholder='Nhập mật khẩu mới'
                                        secureTextEntry={!showPassword}
                                        editable={!isProcessing}
                                        className='border-orange-200 bg-white pr-12 focus:border-orange-400'
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        disabled={isProcessing}
                                        className='absolute right-3 top-1/2 -translate-y-1/2'
                                    >
                                        <Text className='text-sm font-medium text-orange-600'>
                                            {showPassword ? 'Ẩn' : 'Hiện'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Confirm Password */}
                            <View>
                                <Text className='mb-2 text-sm font-medium text-orange-800'>
                                    Xác Nhận Mật Khẩu
                                </Text>
                                <View className='relative'>
                                    <Input
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        placeholder='Nhập lại mật khẩu'
                                        secureTextEntry={!showConfirmPassword}
                                        editable={!isProcessing}
                                        className='border-orange-200 bg-white pr-12 focus:border-orange-400'
                                    />
                                    <TouchableOpacity
                                        onPress={() =>
                                            setShowConfirmPassword(!showConfirmPassword)
                                        }
                                        disabled={isProcessing}
                                        className='absolute right-3 top-1/2 -translate-y-1/2'
                                    >
                                        <Text className='text-sm font-medium text-orange-600'>
                                            {showConfirmPassword ? 'Ẩn' : 'Hiện'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Button
                                title={isProcessing ? 'Đang xử lý...' : 'Đặt Lại Mật Khẩu'}
                                onPress={handleResetPassword}
                                variant='primary'
                                fullWidth
                                disabled={isProcessing}
                                style={{ marginTop: 16, backgroundColor: '#f97316' }}
                            />

                            <TouchableOpacity
                                onPress={() => {
                                    setStep('email');
                                    setOtp(['', '', '', '', '', '']);
                                    setNewPassword('');
                                    setConfirmPassword('');
                                }}
                                disabled={isProcessing}
                                className='mt-4'
                            >
                                <Text className='text-center text-sm font-medium text-orange-600'>
                                    Quay lại
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};
