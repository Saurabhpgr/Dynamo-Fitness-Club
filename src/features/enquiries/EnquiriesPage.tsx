// ============================================================================
// Enquiries Page — Public website leads, inquiries & customer outreach
// ============================================================================
import { useState, useEffect } from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { dataService } from '@/services/dataService';
import type { Enquiry } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/date-utils';

export function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const data = await dataService.getEnquiries();
      setEnquiries(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleMarkRead = async (id: string) => {
    await dataService.markEnquiryRead(id);
    fetchEnquiries();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Website Enquiries</h1>
          <p className="text-sm text-text-secondary">
            Prospective gym athletes and leads generated from your public landing page.
          </p>
        </div>
        <div className="text-xs text-text-muted">
          Total: <span className="font-bold text-text-primary">{enquiries.length}</span> | Unread:{' '}
          <span className="font-bold text-blue-400">{enquiries.filter((e) => !e.is_read).length}</span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-text-muted">Loading website enquiries...</div>
      ) : enquiries.length === 0 ? (
        <div className="p-12 text-center bg-gym-surface border border-dashed border-gym-border rounded-xl text-text-muted">
          No enquiries received yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {enquiries.map((enq) => (
            <div
              key={enq.id}
              className={`p-5 rounded-xl border transition-all ${
                !enq.is_read
                  ? 'bg-gym-surface border-blue-500/30 shadow-sm shadow-blue-500/5'
                  : 'bg-gym-card/40 border-gym-border'
              } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-base text-text-primary">{enq.name}</span>
                  <Badge variant={!enq.is_read ? 'info' : 'neutral'}>
                    {!enq.is_read ? 'NEW LEAD' : 'READ'}
                  </Badge>
                  <span className="text-xs text-text-muted font-mono">{formatDateTime(enq.created_at)}</span>
                </div>

                <div className="text-sm text-text-secondary flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-accent" />
                  <span className="font-mono">{enq.phone}</span>
                </div>

                {enq.message && (
                  <p className="text-xs text-text-secondary bg-gym-bg/60 p-3 rounded-lg border border-gym-border italic">
                    "{enq.message}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 sm:self-center flex-shrink-0">
                <a
                  href={`https://wa.me/${enq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${enq.name}, thank you for reaching out to Dynamo Fitness Club!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="gap-1.5 text-emerald-400 border-emerald-500/30 text-xs">
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </Button>
                </a>

                <a href={`tel:${enq.phone.replace(/[^0-9+]/g, '')}`}>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Phone className="w-3.5 h-3.5" /> Call
                  </Button>
                </a>

                {!enq.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkRead(enq.id)}
                    className="text-xs text-text-muted hover:text-text-primary"
                  >
                    Mark as Read
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
