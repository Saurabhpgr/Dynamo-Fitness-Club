// ============================================================================
// Settings Page — Gym identity, tax config, receipt footer & operational hours
// ============================================================================
import { useState, useEffect } from 'react';
import { Save, CheckCircle, Shield, Building, Receipt } from 'lucide-react';
import { dataService } from '@/services/dataService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

export function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form Fields
  const [gymName, setGymName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [receiptFooter, setReceiptFooter] = useState('');
  const [receiptPrefix, setReceiptPrefix] = useState('DFC');
  const [partialPayments, setPartialPayments] = useState(true);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstNumber, setGstNumber] = useState('');
  const [gstRate, setGstRate] = useState('18');

  useEffect(() => {
    dataService.getGymSettings().then((s) => {
      setGymName(s.gym_name);
      setAddress(s.address);
      setPhone(s.phone);
      setEmail(s.email);
      setOperatingHours(s.operating_hours || '');
      setReceiptFooter(s.receipt_footer || '');
      setReceiptPrefix(s.receipt_number_prefix || 'DFC');
      setPartialPayments(s.partial_payments_enabled);
      setGstEnabled(s.tax_config?.enabled ?? false);
      setGstNumber(s.tax_config?.gst_number ?? '');
      setGstRate(String(s.tax_config?.gst_rate ?? 18));
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await dataService.updateGymSettings({
        gym_name: gymName.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        operating_hours: operatingHours.trim(),
        receipt_footer: receiptFooter.trim(),
        receipt_number_prefix: receiptPrefix.trim(),
        partial_payments_enabled: partialPayments,
        tax_config: {
          enabled: gstEnabled,
          gst_number: gstNumber.trim(),
          gst_rate: parseFloat(gstRate) || 18,
          label: 'GST',
        },
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-text-muted">Loading gym settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary">Club Settings</h1>
        <p className="text-sm text-text-secondary">
          Configure business details, receipt formatting, and operational rules for Dynamo Fitness Club.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-sm text-emerald-400 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /> Settings updated successfully and synced across receipt generation.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: Gym Identity */}
        <div className="p-6 bg-gym-surface border border-gym-border rounded-xl space-y-4">
          <h2 className="text-base font-semibold text-text-primary flex items-center gap-2 border-b border-gym-border pb-3">
            <Building className="w-4 h-4 text-accent" /> Club Identity & Contact
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Gym Name *"
              value={gymName}
              onChange={(e) => setGymName(e.target.value)}
              required
            />
            <Input
              label="Official Contact Phone *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="Official Email Address *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Operating Hours"
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
            />
          </div>

          <Textarea
            label="Full Physical Address *"
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>

        {/* SECTION 2: Receipt & Billing Rules */}
        <div className="p-6 bg-gym-surface border border-gym-border rounded-xl space-y-4">
          <h2 className="text-base font-semibold text-text-primary flex items-center gap-2 border-b border-gym-border pb-3">
            <Receipt className="w-4 h-4 text-accent" /> Receipt & Billing Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Receipt Number Prefix (e.g. DFC) *"
              value={receiptPrefix}
              onChange={(e) => setReceiptPrefix(e.target.value)}
              required
            />

            <div className="flex flex-col justify-end pb-2">
              <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={partialPayments}
                  onChange={(e) => setPartialPayments(e.target.checked)}
                  className="rounded border-gym-border text-accent focus:ring-accent"
                />
                Allow Partial Installment Payments
              </label>
            </div>
          </div>

          <Textarea
            label="Receipt Footer / Terms Note"
            rows={2}
            value={receiptFooter}
            onChange={(e) => setReceiptFooter(e.target.value)}
          />
        </div>

        {/* SECTION 3: Tax & GST */}
        <div className="p-6 bg-gym-surface border border-gym-border rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-gym-border pb-3">
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent" /> Goods & Services Tax (GST)
            </h2>
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={gstEnabled}
                onChange={(e) => setGstEnabled(e.target.checked)}
                className="rounded border-gym-border text-accent focus:ring-accent"
              />
              Enable GST on Receipts
            </label>
          </div>

          {gstEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="GSTIN / Registration Number"
                placeholder="27AABCS1429B1Z8"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
              />
              <Input
                label="GST Rate (%)"
                type="number"
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={saving} className="gap-2 px-6">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
