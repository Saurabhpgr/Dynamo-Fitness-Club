// ============================================================================
// Login Page
// ============================================================================
import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail, Dumbbell } from 'lucide-react';
import { loginSchema, type LoginFormData } from '@/lib/validators';
import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    const result = await signIn(data.email, data.password);
    if (result.error) {
      setError(result.error);
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gym-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-muted mb-4">
            <Dumbbell className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-display font-bold text-text-primary">
            DYNAMO FITNESS CLUB
          </h1>
          <p className="text-text-secondary mt-1">Owner Dashboard Login</p>
        </div>

        {/* Login Form */}
        <div className="bg-gym-surface border border-gym-border rounded-2xl p-8">
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

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftAddon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              autoComplete="current-password"
              {...register('password')}
            />

            <div className="flex justify-end">
              <Link
                to="/auth/forgot-password"
                className="text-sm text-accent hover:text-accent-hover transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          <Link to="/" className="hover:text-text-secondary transition-colors">
            ← Back to website
          </Link>
        </p>
      </div>
    </div>
  );
}
