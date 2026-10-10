// ============================================================================
// Reset Password Page
// ============================================================================
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Dumbbell, CheckCircle2 } from 'lucide-react';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validators';
import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(null);
    const result = await updatePassword(data.password);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/auth/login'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gym-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-muted mb-4">
            <Dumbbell className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Set New Password</h1>
        </div>

        <div className="bg-gym-surface border border-gym-border rounded-2xl p-8">
          {success ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-status-active mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-text-primary mb-2">Password Updated</h2>
              <p className="text-sm text-text-secondary">
                Redirecting you to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {error && (
                <div className="bg-status-expired-bg border border-status-expired/20 rounded-xl p-4 text-sm text-status-expired" role="alert">
                  {error}
                </div>
              )}

              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                leftAddon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                helpText="Minimum 8 characters"
                autoComplete="new-password"
                {...register('password')}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                leftAddon={<Lock className="w-4 h-4" />}
                error={errors.confirmPassword?.message}
                autoComplete="new-password"
                {...register('confirmPassword')}
              />

              <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
                Update Password
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          <Link to="/auth/login" className="hover:text-text-secondary transition-colors">
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
