// ============================================================================
// Landing Page — High-quality, conversion-focused public page
// ============================================================================
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Dumbbell,
  Users,
  Trophy,
  Clock,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Star,
  Zap,
  Heart,
  Target,
  Shield,
  ArrowRight,
  Menu,
  X,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { enquirySchema, type EnquiryFormValues } from '@/lib/validators';
import { supabase } from '@/lib/supabase';

// ============================================================================
// Animated Counter Hook
// ============================================================================
function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !started.current) {
          started.current = true;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(end * eased));
            if (progress < 1) requestAnimationFrame(animate);
          };
          animate();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return { count, ref };
}

// ============================================================================
// Section Components
// ============================================================================

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { label: 'About', href: '#about' },
    { label: 'Facilities', href: '#facilities' },
    { label: 'Plans', href: '#plans' },
    { label: 'Trainers', href: '#trainers' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled ? 'bg-gym-surface/95 backdrop-blur-xl shadow-lg border-b border-gym-border' : 'bg-transparent'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-accent" />
            </div>
            <div>
              <span className="text-lg font-display font-bold text-text-primary tracking-wide">DYNAMO</span>
              <span className="hidden sm:inline text-lg font-display font-bold text-accent tracking-wide ml-1">FITNESS</span>
            </div>
          </a>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-text-secondary hover:text-accent transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA + Login */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/auth/login"
              className="text-sm text-text-muted hover:text-text-secondary transition-colors"
            >
              Owner Login
            </Link>
            <a href="#contact">
              <Button size="sm">
                Join Now
                <ChevronRight className="w-4 h-4" />
              </Button>
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-text-primary"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden pb-6 animate-slide-up">
            <div className="flex flex-col gap-1 py-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 rounded-xl text-text-secondary hover:text-text-primary hover:bg-gym-surface-hover transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-2 pt-4 border-t border-gym-border">
              <a href="#contact" onClick={() => setIsOpen(false)}>
                <Button fullWidth>Join Now</Button>
              </a>
              <Link to="/auth/login" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" fullWidth>Owner Login</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function HeroSection() {
  const membersCounter = useCounter(500);
  const trainersCounter = useCounter(12);
  const yearsCounter = useCounter(8);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gym-bg via-gym-bg to-gym-surface" />
      
      {/* Neon glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
      
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center pt-24 pb-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-muted border border-accent/20 mb-8 animate-fade-in">
          <Zap className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-accent">Transform Your Body, Transform Your Life</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold text-text-primary mb-6 animate-slide-up">
          Train Hard.
          <br />
          <span className="text-gradient">Stay Dynamo.</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          State-of-the-art equipment, expert trainers, and a community that pushes you to be your best.
          Your fitness journey starts here.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <a href="#contact">
            <Button size="lg" className="min-w-[200px]">
              Join Now
              <ArrowRight className="w-5 h-5" />
            </Button>
          </a>
          <a href="#plans">
            <Button variant="outline" size="lg" className="min-w-[200px]">
              View Plans
            </Button>
          </a>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div ref={membersCounter.ref} className="text-center">
            <p className="text-3xl sm:text-4xl font-display font-bold text-accent">{membersCounter.count}+</p>
            <p className="text-xs sm:text-sm text-text-muted mt-1">Active Members</p>
          </div>
          <div ref={trainersCounter.ref} className="text-center">
            <p className="text-3xl sm:text-4xl font-display font-bold text-accent">{trainersCounter.count}+</p>
            <p className="text-xs sm:text-sm text-text-muted mt-1">Expert Trainers</p>
          </div>
          <div ref={yearsCounter.ref} className="text-center">
            <p className="text-3xl sm:text-4xl font-display font-bold text-accent">{yearsCounter.count}+</p>
            <p className="text-xs sm:text-sm text-text-muted mt-1">Years Experience</p>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gym-bg to-transparent" />
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="text-accent text-sm font-semibold uppercase tracking-widest">About Us</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-text-primary mt-3 mb-6">
              More Than a Gym — A <span className="text-gradient">Movement</span>
            </h2>
            <p className="text-text-secondary leading-relaxed mb-6">
              Dynamo Fitness Club was founded with one simple mission: to make world-class fitness
              accessible to everyone. We believe that fitness is not just about lifting weights — it's
              about building discipline, confidence, and a community that supports your journey.
            </p>
            <p className="text-text-secondary leading-relaxed mb-8">
              With state-of-the-art equipment, certified trainers, and a welcoming environment,
              we've helped hundreds of people transform their bodies and lives. Whether you're a
              beginner or a seasoned athlete, Dynamo is your home.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Target className="w-5 h-5" />, label: 'Goal-Oriented Training' },
                { icon: <Heart className="w-5 h-5" />, label: 'Supportive Community' },
                { icon: <Shield className="w-5 h-5" />, label: 'Safe Environment' },
                { icon: <Trophy className="w-5 h-5" />, label: 'Proven Results' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-sm text-text-secondary">
                  <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center text-accent flex-shrink-0">
                    {item.icon}
                  </div>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-accent/10 via-gym-surface to-gym-surface-hover border border-gym-border overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Dumbbell className="w-20 h-20 text-accent/30 mx-auto mb-4" />
                  <p className="text-text-muted text-sm">Gym Interior</p>
                </div>
              </div>
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-gym-surface border border-gym-border rounded-2xl p-4 shadow-card animate-pulse-glow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-status-active-bg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-status-active" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">500+ Members</p>
                  <p className="text-xs text-text-muted">Trust Dynamo Fitness</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FacilitiesSection() {
  const facilities = [
    { icon: <Dumbbell className="w-7 h-7" />, title: 'Strength Training', description: 'Full range of free weights, machines, and functional training equipment.' },
    { icon: <Heart className="w-7 h-7" />, title: 'Cardio Zone', description: 'Treadmills, ellipticals, bikes, and rowing machines with personal screens.' },
    { icon: <Users className="w-7 h-7" />, title: 'Personal Training', description: 'One-on-one sessions with certified trainers tailored to your goals.' },
    { icon: <Zap className="w-7 h-7" />, title: 'Group Classes', description: 'High-energy group sessions: HIIT, yoga, Zumba, and functional fitness.' },
    { icon: <Target className="w-7 h-7" />, title: 'CrossFit Area', description: 'Dedicated space for CrossFit WODs with bumper plates and pull-up rigs.' },
    { icon: <Shield className="w-7 h-7" />, title: 'Locker & Shower', description: 'Clean, secure locker rooms with hot showers and complimentary towels.' },
  ];

  return (
    <section id="facilities" className="py-20 sm:py-28 bg-gym-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-accent text-sm font-semibold uppercase tracking-widest">Our Facilities</span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-text-primary mt-3 mb-4">
            Everything You Need to <span className="text-gradient">Succeed</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            World-class equipment and facilities designed to help you achieve any fitness goal.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((item) => (
            <div
              key={item.title}
              className="group bg-gym-surface border border-gym-border rounded-2xl p-6 transition-all duration-300 hover:border-accent/30 hover:shadow-glow hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent-muted flex items-center justify-center text-accent mb-5 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">{item.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlansSection() {
  // In production, these will be fetched from membership_plans table
  const plans = [
    { name: 'Monthly', duration: '1 Month', price: '1,500', popular: false },
    { name: 'Quarterly', duration: '3 Months', price: '4,000', popular: false },
    { name: 'Half-Yearly', duration: '6 Months', price: '7,000', popular: true },
    { name: 'Annual', duration: '12 Months', price: '12,000', popular: false },
  ];

  return (
    <section id="plans" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-accent text-sm font-semibold uppercase tracking-widest">Membership Plans</span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-text-primary mt-3 mb-4">
            Choose Your <span className="text-gradient">Plan</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Flexible plans designed to fit your lifestyle and budget. All plans include full access to all facilities.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`
                relative bg-gym-surface border rounded-2xl p-6 text-center
                transition-all duration-300 hover:-translate-y-2
                ${plan.popular
                  ? 'border-accent shadow-glow'
                  : 'border-gym-border hover:border-accent/30'
                }
              `}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-gym-bg text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-xl font-display font-bold text-text-primary mb-1">{plan.name}</h3>
              <p className="text-sm text-text-muted mb-6">{plan.duration}</p>
              <div className="mb-6">
                <span className="text-sm text-text-muted">₹</span>
                <span className="text-4xl font-display font-bold text-accent ml-1">{plan.price}</span>
              </div>
              <ul className="text-sm text-text-secondary space-y-3 mb-8 text-left">
                {['Full gym access', 'Locker & shower', 'Fitness assessment', 'Diet consultation'].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="#contact">
                <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  fullWidth
                >
                  Get Started
                </Button>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyChooseSection() {
  const reasons = [
    { number: '01', title: 'Expert Trainers', description: 'Certified professionals who create personalized workout plans.' },
    { number: '02', title: 'Latest Equipment', description: 'Premium machines and gear from world-leading fitness brands.' },
    { number: '03', title: 'Flexible Hours', description: 'Open early morning to late night, 7 days a week. Train on your schedule.' },
    { number: '04', title: 'Affordable Plans', description: 'Premium fitness experience without the premium price tag.' },
  ];

  return (
    <section className="py-20 sm:py-28 bg-gym-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-accent text-sm font-semibold uppercase tracking-widest">Why Choose Us</span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-text-primary mt-3">
            The Dynamo <span className="text-gradient">Difference</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {reasons.map((r) => (
            <div key={r.number} className="flex gap-5 p-6 rounded-2xl bg-gym-surface border border-gym-border hover:border-accent/30 transition-all duration-300">
              <span className="text-3xl font-display font-bold text-accent/20">{r.number}</span>
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">{r.title}</h3>
                <p className="text-sm text-text-secondary">{r.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrainersSection() {
  const trainers = [
    { name: 'Rahul Sharma', role: 'Head Trainer / Strength', initials: 'RS' },
    { name: 'Priya Patel', role: 'Yoga & Flexibility', initials: 'PP' },
    { name: 'Arjun Singh', role: 'CrossFit / HIIT', initials: 'AS' },
    { name: 'Sneha Desai', role: 'Nutrition & Wellness', initials: 'SD' },
  ];

  return (
    <section id="trainers" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-accent text-sm font-semibold uppercase tracking-widest">Our Team</span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-text-primary mt-3 mb-4">
            Meet Your <span className="text-gradient">Trainers</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trainers.map((trainer) => (
            <div
              key={trainer.name}
              className="group bg-gym-surface border border-gym-border rounded-2xl overflow-hidden hover:border-accent/30 transition-all duration-300"
            >
              <div className="aspect-[3/4] bg-gradient-to-b from-accent/5 to-gym-surface-hover flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-accent-muted flex items-center justify-center">
                  <span className="text-2xl font-display font-bold text-accent">{trainer.initials}</span>
                </div>
              </div>
              <div className="p-5 text-center">
                <h3 className="font-semibold text-text-primary">{trainer.name}</h3>
                <p className="text-sm text-accent mt-1">{trainer.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GallerySection() {
  const items = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    label: ['Weight Room', 'Cardio Floor', 'CrossFit Area', 'Yoga Studio', 'Reception', 'Group Class'][i]!,
  }));

  return (
    <section id="gallery" className="py-20 sm:py-28 bg-gym-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-accent text-sm font-semibold uppercase tracking-widest">Gallery</span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-text-primary mt-3">
            Take a <span className="text-gradient">Tour</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-accent/5 via-gym-surface to-gym-surface-hover border border-gym-border hover:border-accent/30 transition-all duration-300"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Dumbbell className="w-12 h-12 text-accent/10 group-hover:scale-110 transition-transform" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gym-bg/90 to-transparent">
                <p className="text-sm font-medium text-text-primary">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    { name: 'Amit K.', text: 'Dynamo completely changed my fitness journey. Lost 15 kg in 6 months with their guidance!', rating: 5 },
    { name: 'Neha S.', text: 'Best gym in the area. The trainers are incredibly knowledgeable and supportive.', rating: 5 },
    { name: 'Raj M.', text: 'Clean facilities, great equipment, and the community here is amazing. Highly recommend!', rating: 5 },
  ];

  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-accent text-sm font-semibold uppercase tracking-widest">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-text-primary mt-3">
            What Our <span className="text-gradient">Members Say</span>
          </h2>
        </div>

        <div className="bg-gym-surface border border-gym-border rounded-2xl p-8 sm:p-12 text-center">
          <div className="flex justify-center gap-1 mb-6">
            {Array.from({ length: testimonials[active]!.rating }).map((_, i) => (
              <Star key={i} className="w-5 h-5 text-status-expiring fill-status-expiring" />
            ))}
          </div>
          <p className="text-lg sm:text-xl text-text-primary leading-relaxed mb-8 italic">
            "{testimonials[active]!.text}"
          </p>
          <p className="font-semibold text-accent">{testimonials[active]!.name}</p>
          <p className="text-xs text-text-muted mt-1">Sample Testimonial</p>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === active ? 'bg-accent w-6' : 'bg-gym-border hover:bg-gym-border-light'
                }`}
                aria-label={`View testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquirySchema),
  });

  const onSubmit = async (data: EnquiryFormValues) => {
    if (data.honeypot) return; // Bot detected

    setSubmitError(null);
    try {
      const { error } = await supabase.from('enquiries').insert({
        name: data.name,
        phone: data.phone,
        message: data.message,
      });
      if (error) throw error;
      setSubmitted(true);
      reset();
      setTimeout(() => setSubmitted(false), 10000);
    } catch {
      setSubmitError('Unable to submit your enquiry. Please call us directly.');
    }
  };

  return (
    <section id="contact" className="py-20 sm:py-28 bg-gym-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-accent text-sm font-semibold uppercase tracking-widest">Get In Touch</span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-text-primary mt-3 mb-4">
            Start Your <span className="text-gradient">Journey</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Have questions? Drop us a message or visit us at the gym. We'd love to help you get started.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            {[
              { icon: <MapPin className="w-5 h-5" />, label: 'Address', value: '123 Fitness Street, Near City Center, Pune 411001' },
              { icon: <Phone className="w-5 h-5" />, label: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210' },
              { icon: <Mail className="w-5 h-5" />, label: 'Email', value: 'info@dynamofitness.com', href: 'mailto:info@dynamofitness.com' },
              { icon: <Clock className="w-5 h-5" />, label: 'Hours', value: 'Mon-Sat: 5:30 AM – 10:30 PM | Sun: 7:00 AM – 1:00 PM' },
            ].map((item) => (
              <div key={item.label} className="flex gap-4 items-start">
                <div className="w-11 h-11 rounded-xl bg-accent-muted flex items-center justify-center text-accent flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm text-text-muted mb-0.5">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-text-primary hover:text-accent transition-colors">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-text-primary text-sm">{item.value}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Map placeholder */}
            <div className="aspect-video rounded-2xl bg-gym-surface border border-gym-border flex items-center justify-center mt-6">
              <div className="text-center text-text-muted">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-accent/30" />
                <p className="text-sm">Map Embed Placeholder</p>
              </div>
            </div>
          </div>

          {/* Enquiry Form */}
          <div className="bg-gym-surface border border-gym-border rounded-2xl p-8">
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-14 h-14 text-status-active mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">Thank You!</h3>
                <p className="text-text-secondary">
                  We've received your enquiry and will get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Send us a message</h3>

                {submitError && (
                  <div className="bg-status-expired-bg border border-status-expired/20 rounded-xl p-4 text-sm text-status-expired">
                    {submitError}
                  </div>
                )}

                <div>
                  <label htmlFor="enquiry-name" className="block text-sm font-medium text-text-secondary mb-1.5">
                    Full Name *
                  </label>
                  <input
                    id="enquiry-name"
                    {...register('name')}
                    className="w-full bg-gym-bg border border-gym-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                    placeholder="Your name"
                  />
                  {errors.name && <p className="text-sm text-status-expired mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label htmlFor="enquiry-phone" className="block text-sm font-medium text-text-secondary mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    id="enquiry-phone"
                    {...register('phone')}
                    className="w-full bg-gym-bg border border-gym-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                    placeholder="+91 98765 43210"
                  />
                  {errors.phone && <p className="text-sm text-status-expired mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <label htmlFor="enquiry-message" className="block text-sm font-medium text-text-secondary mb-1.5">
                    Message *
                  </label>
                  <textarea
                    id="enquiry-message"
                    {...register('message')}
                    rows={4}
                    className="w-full bg-gym-bg border border-gym-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent resize-y"
                    placeholder="I'm interested in joining the gym..."
                  />
                  {errors.message && <p className="text-sm text-status-expired mt-1">{errors.message.message}</p>}
                </div>

                {/* Honeypot — hidden from humans */}
                <div className="absolute -left-[9999px]" aria-hidden="true">
                  <input type="text" tabIndex={-1} autoComplete="off" {...register('honeypot')} />
                </div>

                <Button type="submit" fullWidth size="lg" isLoading={isSubmitting} leftIcon={<Send className="w-4 h-4" />}>
                  Send Enquiry
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gym-surface border-t border-gym-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-accent" />
              </div>
              <span className="text-lg font-display font-bold text-text-primary">DYNAMO FITNESS</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              Your partner in fitness. Building stronger bodies and stronger minds since 2018.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {['About', 'Facilities', 'Plans', 'Trainers', 'Contact'].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    className="text-sm text-text-secondary hover:text-accent transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent" />
                <a href="tel:+919876543210" className="hover:text-accent transition-colors">+91 98765 43210</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent" />
                <a href="mailto:info@dynamofitness.com" className="hover:text-accent transition-colors">info@dynamofitness.com</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <span>123 Fitness St, Pune 411001</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Follow Us</h4>
            <div className="flex gap-3">
              {[
                {
                  label: 'Instagram',
                  icon: (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  ),
                },
                {
                  label: 'Facebook',
                  icon: (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                    </svg>
                  ),
                },
                {
                  label: 'YouTube',
                  icon: (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  ),
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl bg-gym-surface-hover flex items-center justify-center text-text-secondary hover:text-accent hover:bg-accent-muted transition-all"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gym-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Dynamo Fitness Club. All rights reserved.
          </p>
          <Link
            to="/auth/login"
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            Owner Login
          </Link>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// Main Landing Page Component
// ============================================================================
export function LandingPage() {
  return (
    <>
      {/* SEO Meta is set in index.html and via the head section */}
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <FacilitiesSection />
        <PlansSection />
        <WhyChooseSection />
        <TrainersSection />
        <GallerySection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            '@id': '#dynamo-fitness',
            name: 'Dynamo Fitness Club',
            image: '',
            telephone: '+919876543210',
            email: 'info@dynamofitness.com',
            address: {
              '@type': 'PostalAddress',
              streetAddress: '123 Fitness Street',
              addressLocality: 'Pune',
              postalCode: '411001',
              addressCountry: 'IN',
            },
            openingHours: ['Mo-Sa 05:30-22:30', 'Su 07:00-13:00'],
            priceRange: '₹1,500 - ₹12,000',
          }),
        }}
      />
    </>
  );
}
