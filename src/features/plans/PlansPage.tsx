// ============================================================================
// Plans Management Page — Plan CRUD, Activation toggle, and pricing tiers
// ============================================================================
import { useState, useEffect } from 'react';
import { Plus, Edit2, Clock } from 'lucide-react';
import { dataService } from '@/services/dataService';
import type { MembershipPlan } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/money';

export function PlansPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('30');
  const [baseFee, setBaseFee] = useState('1500');
  const [sortOrder, setSortOrder] = useState('1');
  const [isActive, setIsActive] = useState(true);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await dataService.getPlans();
      setPlans(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setName('');
    setDuration('30');
    setBaseFee('1500');
    setSortOrder(String(plans.length + 1));
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setDuration(String(plan.duration_days));
    setBaseFee(plan.base_fee);
    setSortOrder(String(plan.sort_order || 1));
    setIsActive(plan.is_active);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingPlan) {
      await dataService.updatePlan(editingPlan.id, {
        name: name.trim(),
        duration_days: parseInt(duration, 10) || 30,
        base_fee: parseFloat(baseFee).toFixed(2),
        sort_order: parseInt(sortOrder, 10) || 1,
        is_active: isActive,
      });
    } else {
      await dataService.createPlan({
        name: name.trim(),
        duration_days: parseInt(duration, 10) || 30,
        base_fee: parseFloat(baseFee).toFixed(2),
        sort_order: parseInt(sortOrder, 10) || 1,
        is_active: isActive,
      });
    }

    setModalOpen(false);
    fetchPlans();
  };

  const handleToggleActive = async (plan: MembershipPlan) => {
    await dataService.updatePlan(plan.id, { is_active: !plan.is_active });
    fetchPlans();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Membership Plans</h1>
          <p className="text-sm text-text-secondary">
            Configure membership duration packages, standard fees, and public landing page visibility.
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="w-4 h-4" /> Create Plan
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-text-muted">Loading plans...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-5 rounded-xl border transition-all ${
                plan.is_active
                  ? 'bg-gym-surface border-gym-border hover:border-accent/40'
                  : 'bg-gym-card/40 border-gym-border opacity-70'
              } flex flex-col justify-between`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={plan.is_active ? 'success' : 'neutral'}>
                    {plan.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <span className="text-xs text-text-muted">Order: #{plan.sort_order}</span>
                </div>

                <div>
                  <h3 className="font-display font-bold text-lg text-text-primary">{plan.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-1">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    <span>{plan.duration_days} Days validity</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-2xl font-display font-black text-text-primary">
                    {formatCurrency(plan.base_fee)}
                  </span>
                  <span className="text-xs text-text-muted block">Standard Base Fee</span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gym-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleActive(plan)}
                  className={`text-xs font-medium hover:underline ${
                    plan.is_active ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {plan.is_active ? 'Deactivate' : 'Activate'}
                </button>

                <Button variant="ghost" size="sm" onClick={() => openEditModal(plan)} className="gap-1.5 text-xs">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan Edit / Create Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPlan ? 'Edit Membership Plan' : 'Create New Membership Plan'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Plan Name *"
            placeholder="e.g. 3 Months Muscle Builder"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duration (Days) *"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
            <Input
              label="Base Fee (₹) *"
              type="number"
              value={baseFee}
              onChange={(e) => setBaseFee(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Sort Order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
            <div className="flex flex-col justify-end pb-2">
              <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-gym-border text-accent focus:ring-accent"
                />
                Active & Visible on Site
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gym-border">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingPlan ? 'Save Changes' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
