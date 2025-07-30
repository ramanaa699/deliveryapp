import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { lightTheme } from '../../theme';
import { loginUser } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';
import { validateEmail, validateRequired } from '../../utils/validation';
import { authAPI } from '../../utils/api';

type Props = StackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = lightTheme;

  const [loginMode, setLoginMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (loginMode === 'email') {
      const emailError = validateRequired(email, 'Email');
      if (emailError) newErrors.email = emailError;
      else if (!validateEmail(email)) newErrors.email = 'Please enter a valid email';

      const passwordError = validateRequired(password, 'Password');
      if (passwordError) newErrors.password = passwordError;
    } else {
      const phoneError = validateRequired(phone, 'Phone');
      if (phoneError) newErrors.phone = phoneError;
      else if (!/^[6-9]\d{9}$/.test(phone)) newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (loginMode === 'email') {
        await dispatch(loginUser({ email, password })).unwrap();
      } else {
        // Send OTP first
        const response = await authAPI.sendOTP(phone);
        if (response.success) {
          navigation.navigate('OTP', { phone });
        } else {
          Alert.alert('Error', response.error || 'Failed to send OTP');
        }
      }
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Please check your credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            Welcome Back
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Sign in to continue delivering
          </Text>
        </View>

        <Card style={styles.formCard}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                loginMode === 'email' && { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setLoginMode('email')}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: loginMode === 'email' ? '#FFFFFF' : theme.colors.onSurface },
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                loginMode === 'phone' && { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setLoginMode('phone')}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: loginMode === 'phone' ? '#FFFFFF' : theme.colors.onSurface },
                ]}
              >
                Phone
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {loginMode === 'email' ? (
              <>
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: theme.colors.onSurface }]}>
                    Email
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        borderColor: errors.email ? theme.colors.error : theme.colors.border,
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.onSurface,
                      },
                    ]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor={theme.colors.placeholder}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {errors.email && (
                    <Text style={[styles.errorText, { color: theme.colors.error }]}>
                      {errors.email}
                    </Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: theme.colors.onSurface }]}>
                    Password
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        borderColor: errors.password ? theme.colors.error : theme.colors.border,
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.onSurface,
                      },
                    ]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={theme.colors.placeholder}
                    secureTextEntry
                  />
                  {errors.password && (
                    <Text style={[styles.errorText, { color: theme.colors.error }]}>
                      {errors.password}
                    </Text>
                  )}
                </View>
              </>
            ) : (
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.colors.onSurface }]}>
                  Phone Number
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: errors.phone ? theme.colors.error : theme.colors.border,
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.onSurface,
                    },
                  ]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter your phone number"
                  placeholderTextColor={theme.colors.placeholder}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                {errors.phone && (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {errors.phone}
                  </Text>
                )}
              </View>
            )}

            <Button
              title={loginMode === 'email' ? 'Sign In' : 'Send OTP'}
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />

            {loginMode === 'email' && (
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotPasswordButton}
              >
                <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: lightTheme.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: lightTheme.spacing.xxl,
  },
  title: {
    fontSize: lightTheme.typography.h1.fontSize,
    fontWeight: lightTheme.typography.h1.fontWeight,
    marginBottom: lightTheme.spacing.sm,
  },
  subtitle: {
    fontSize: lightTheme.typography.body.fontSize,
    textAlign: 'center',
  },
  formCard: {
    padding: lightTheme.spacing.lg,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: lightTheme.colors.surfaceVariant,
    borderRadius: lightTheme.borderRadius.md,
    padding: lightTheme.spacing.xs,
    marginBottom: lightTheme.spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: lightTheme.spacing.md,
    borderRadius: lightTheme.borderRadius.sm,
    alignItems: 'center',
  },
  tabText: {
    fontSize: lightTheme.typography.button.fontSize,
    fontWeight: lightTheme.typography.button.fontWeight,
  },
  form: {
    gap: lightTheme.spacing.lg,
  },
  inputContainer: {
    gap: lightTheme.spacing.sm,
  },
  label: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: lightTheme.borderRadius.md,
    paddingHorizontal: lightTheme.spacing.md,
    paddingVertical: lightTheme.spacing.md,
    fontSize: lightTheme.typography.body.fontSize,
  },
  errorText: {
    fontSize: lightTheme.typography.caption.fontSize,
  },
  loginButton: {
    marginTop: lightTheme.spacing.md,
  },
  forgotPasswordButton: {
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: lightTheme.typography.bodySmall.fontSize,
  },
});

export default LoginScreen;