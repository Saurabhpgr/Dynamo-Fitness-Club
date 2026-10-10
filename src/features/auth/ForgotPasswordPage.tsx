// ============================================================================
// Forgot Password Page
// ============================================================================
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Dumbbell, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validators';
import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    const result = await resetPassword(data.email);
    if (result.error) {
      setError(result.error);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-gym-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-muted mb-4">
            <Dumbbell className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Reset Password</h1>
          <p className="text-text-secondary mt-1">
            We'll send you a link to reset your password
          </p>
        </div>

        <div className="bg-gym-surface border border-gym-border rounded-2xl p-8">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-status-active mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-text-primary mb-2">Check your email</h2>
              <p className="text-sm text-text-secondary mb-6">
                If an account exists with that email, we've sent password reset instructions.
              </p>
              <Link to="/auth/login">
                <Button variant="secondary">
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {error && (
                <div className="bg-status-expired-bg border border-status-expired/20 rounded-xl p-4 text-sm text-status-expired" role="alert">
                  {error}
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                placeholder="admin@dynamofitness.com"
                leftAddon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                autoComplete="email"
                {...register('email')}
              />

              <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
                Send Reset Link
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          <Link to="/auth/login" className="hover:text-text-secondary transition-colors">
            <ArrowLeft className="w-3 h-3 inline mr-1" />
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
