-- ============================================================================
-- DYNAMO FITNESS CLUB — SEED DATA
-- Sample plans, settings, test members, memberships, payments & receipts
-- ============================================================================

-- 1. GYM SETTINGS
INSERT INTO public.gym_settings (
  id, gym_name, address, phone, email, currency, timezone,
  receipt_footer, receipt_number_prefix, partial_payments_enabled,
  operating_hours, social_links, tax_config
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Dynamo Fitness Club',
  'Plot 42, Sector 18, Commercial Belt, Kharghar, Navi Mumbai - 410210',
  '+91 98765 43210',
  'info@dynamofitness.in',
  'INR',
  'Asia/Kolkata',
  'Thank you for training with Dynamo Fitness Club! Consistent efforts yield champions.',
  'DFC',
  true,
  'Mon - Sat: 5:30 AM - 10:30 PM | Sun: 6:00 AM - 12:00 PM',
  '{"instagram": "dynamofitness_club", "facebook": "dynamofitnessclub", "whatsapp": "+919876543210"}'::jsonb,
  '{"enabled": true, "tax_name": "GST", "rate": 18, "registration_no": "27AABCS1429B1Z8"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 2. MEMBERSHIP PLANS
INSERT INTO public.membership_plans (id, name, duration_days, base_fee, is_active, sort_order)
VALUES
  ('11111111-1111-1111-1111-111111111111', '1 Month Kickstart', 30, 1500.00, true, 1),
  ('22222222-2222-2222-2222-222222222222', '3 Months Muscle Builder', 90, 4000.00, true, 2),
  ('33333333-3333-3333-3333-333333333333', '6 Months Pro Fitness', 180, 7500.00, true, 3),
  ('44444444-4444-4444-4444-444444444444', '12 Months Elite Annual', 365, 13500.00, true, 4)
ON CONFLICT (id) DO NOTHING;

-- 3. MEMBERS (20 Test Members)
INSERT INTO public.members (id, member_code, full_name, phone, email, date_of_birth, address, emergency_contact_name, emergency_contact_phone, notes, is_archived)
VALUES
  ('a0000001-0000-0000-0000-000000000001', 'DFC-M-0001', 'Aarav Sharma', '+91 98201 12345', 'aarav.sharma@example.com', '1995-04-12', 'Flat 402, Seawood Towers, Kharghar', 'Rohit Sharma', '+91 98201 54321', 'Focus on strength training and hypertrophy', false),
  ('a0000002-0000-0000-0000-000000000002', 'DFC-M-0002', 'Priya Deshmukh', '+91 98202 23456', 'priya.d@example.com', '1998-08-23', 'B-12, Green Acres, Vashi', 'Sunil Deshmukh', '+91 98202 65432', 'Goal: Weight loss and cardio endurance', false),
  ('a0000003-0000-0000-0000-000000000003', 'DFC-M-0003', 'Rohan Patel', '+91 98203 34567', 'rohan.patel@example.com', '1992-11-05', 'Plot 55, Sector 20, Nerul', 'Kavita Patel', '+91 98203 76543', 'Former athlete, knee rehab precautions', false),
  ('a0000004-0000-0000-0000-000000000004', 'DFC-M-0004', 'Ananya Verma', '+91 98204 45678', 'ananya.v@example.com', '2001-02-18', 'A-301, Palm Beach Residency, Sanpada', 'Manish Verma', '+91 98204 87654', 'Evening slots preferred', false),
  ('a0000005-0000-0000-0000-000000000005', 'DFC-M-0005', 'Vikram Malhotra', '+91 98205 56789', 'vikram.m@example.com', '1988-06-30', 'Flat 704, Skyline Heights, Kharghar', 'Pooja Malhotra', '+91 98205 98765', 'Corporate executive, early morning workouts', false),
  ('a0000006-0000-0000-0000-000000000006', 'DFC-M-0006', 'Sneha Kulkarni', '+91 98206 67890', 'sneha.k@example.com', '1996-12-14', 'C-104, Harmony Park, Belapur', 'Amit Kulkarni', '+91 98206 09876', 'Crossfit and functional training', false),
  ('a0000007-0000-0000-0000-000000000007', 'DFC-M-0007', 'Aditya Joshi', '+91 98207 78901', 'aditya.j@example.com', '1994-09-09', 'Shop 3, Sector 12, Kamothe', 'Suresh Joshi', '+91 98207 10987', 'Bodybuilding enthusiast', false),
  ('a0000008-0000-0000-0000-000000000008', 'DFC-M-0008', 'Neha Kapoor', '+91 98208 89012', 'neha.kapoor@example.com', '1997-03-27', 'Flat 1202, Royal Palms, Seawoods', 'Rajesh Kapoor', '+91 98208 21098', 'Yoga and strength fusion', false),
  ('a0000009-0000-0000-0000-000000000009', 'DFC-M-0009', 'Karan Singhania', '+91 98209 90123', 'karan.s@example.com', '1990-07-19', 'Row House 8, NRI Complex, Seawoods', 'Simran Singhania', '+91 98209 32109', 'Powerlifting competitor', false),
  ('a0000010-0000-0000-0000-000000000010', 'DFC-M-0010', 'Pooja Nair', '+91 98210 01234', 'pooja.nair@example.com', '1999-05-15', 'Flat 502, Lake View, Kharghar', 'Deepak Nair', '+91 98210 43210', 'High protein diet counseling requested', false),
  ('a0000011-0000-0000-0000-000000000011', 'DFC-M-0011', 'Siddharth Rao', '+91 98211 12345', 'sid.rao@example.com', '1993-10-02', 'B-501, Crystal Plaza, Vashi', 'Meera Rao', '+91 98211 54321', 'Regular gymgoer, HIIT fan', false),
  ('a0000012-0000-0000-0000-000000000012', 'DFC-M-0012', 'Tanvi Shinde', '+91 98212 23456', 'tanvi.shinde@example.com', '2000-01-25', 'Flat 203, Rose Villa, Panvel', 'Ganesh Shinde', '+91 98212 65432', 'Student discount applied', false),
  ('a0000013-0000-0000-0000-000000000013', 'DFC-M-0013', 'Gaurav Mehta', '+91 98213 34567', 'gaurav.mehta@example.com', '1987-11-11', 'Sector 15, Koparkhairane', 'Nidhi Mehta', '+91 98213 76543', 'Cardio + sauna recovery focus', false),
  ('a0000014-0000-0000-0000-000000000014', 'DFC-M-0014', 'Meera Iyer', '+91 98214 45678', 'meera.iyer@example.com', '1995-08-08', 'Sector 9, Ulwe', 'Venkatesh Iyer', '+91 98214 87654', 'Strength building & posture correction', false),
  ('a0000015-0000-0000-0000-000000000015', 'DFC-M-0015', 'Varun Shetty', '+91 98215 56789', 'varun.shetty@example.com', '1991-04-04', 'Sector 4, Airoli', 'Prashant Shetty', '+91 98215 98765', 'MMA and conditioning', false),
  ('a0000016-0000-0000-0000-000000000016', 'DFC-M-0016', 'Divya Chauhan', '+91 98216 67890', 'divya.c@example.com', '2002-09-17', 'Sector 21, Kharghar', 'Ajay Chauhan', '+91 98216 09876', 'New to fitness, guided orientation done', false),
  ('a0000017-0000-0000-0000-000000000017', 'DFC-M-0017', 'Kunal Rane', '+91 98217 78901', 'kunal.rane@example.com', '1989-03-03', 'Sector 8, Nerul', 'Archana Rane', '+91 98217 10987', 'Expiring within 3 days alert', false),
  ('a0000018-0000-0000-0000-000000000018', 'DFC-M-0018', 'Shruti Bose', '+91 98218 89012', 'shruti.bose@example.com', '1996-06-20', 'Sector 17, Vashi', 'Subhash Bose', '+91 98218 21098', 'Expired membership last week', false),
  ('a0000019-0000-0000-0000-000000000019', 'DFC-M-0019', 'Manish Tiwari', '+91 98219 90123', 'manish.t@example.com', '1985-05-05', 'Sector 19, Kharghar', 'Geeta Tiwari', '+91 98219 32109', 'Old member — inactive profile', false),
  ('a0000020-0000-0000-0000-000000000020', 'DFC-M-0020', 'Arjun Saxena', '+91 98220 01234', 'arjun.saxena@example.com', '1994-12-12', 'Sector 11, Belapur', 'Kavita Saxena', '+91 98220 43210', 'Archived account test case', true)
ON CONFLICT (id) DO NOTHING;

-- 4. MEMBERSHIPS
INSERT INTO public.memberships (id, member_id, plan_id, plan_name_snapshot, agreed_fee, start_date, expiry_date, status)
VALUES
  -- Active 12 months (Aarav)
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', '12 Months Elite Annual', 13500.00, '2026-01-01', '2026-12-31', 'active'),
  -- Active 6 months (Priya)
  ('b0000002-0000-0000-0000-000000000002', 'a0000002-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', '6 Months Pro Fitness', 7500.00, '2026-06-01', '2026-11-28', 'active'),
  -- Active 3 months (Rohan)
  ('b0000003-0000-0000-0000-000000000003', 'a0000003-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', '3 Months Muscle Builder', 4000.00, '2026-09-01', '2026-11-30', 'active'),
  -- Active 1 month (Ananya)
  ('b0000004-0000-0000-0000-000000000004', 'a0000004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', '1 Month Kickstart', 1500.00, '2026-10-01', '2026-10-31', 'active'),
  -- Expiring soon in 4 days (Kunal Rane)
  ('b0000017-0000-0000-0000-000000000017', 'a0000017-0000-0000-0000-000000000017', '11111111-1111-1111-1111-111111111111', '1 Month Kickstart', 1500.00, '2026-09-15', '2026-10-15', 'active'),
  -- Expired recently (Shruti Bose)
  ('b0000018-0000-0000-0000-000000000018', 'a0000018-0000-0000-0000-000000000018', '22222222-2222-2222-2222-222222222222', '3 Months Muscle Builder', 4000.00, '2026-07-01', '2026-09-29', 'expired')
ON CONFLICT (id) DO NOTHING;

-- 5. PAYMENTS & RECEIPTS
INSERT INTO public.payments (
  id, member_id, membership_id, receipt_number, amount_charged, discount,
  amount_received, balance_due, payment_method, transaction_reference,
  status, payment_date, idempotency_key
)
VALUES
  ('c0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001',
   'DFC-2026-00001', 13500.00, 500.00, 13000.00, 0.00, 'upi', 'UPI/PAYTM/6182749102', 'paid', '2026-01-01 10:30:00+05:30', 'idemp_seed_001'),
  ('c0000002-0000-0000-0000-000000000002', 'a0000002-0000-0000-0000-000000000002', 'b0000002-0000-0000-0000-000000000002',
   'DFC-2026-00002', 7500.00, 0.00, 5000.00, 2500.00, 'cash', NULL, 'partial', '2026-06-01 11:15:00+05:30', 'idemp_seed_002'),
  ('c0000003-0000-0000-0000-000000000003', 'a0000003-0000-0000-0000-000000000003', 'b0000003-0000-0000-0000-000000000003',
   'DFC-2026-00003', 4000.00, 0.00, 4000.00, 0.00, 'card', 'POS/HDFC/9921', 'paid', '2026-09-01 18:20:00+05:30', 'idemp_seed_003')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.receipts (
  id, receipt_number, payment_id, member_id, membership_id, status, snapshot_data, issued_at
)
VALUES
  ('d0000001-0000-0000-0000-000000000001', 'DFC-2026-00001', 'c0000001-0000-0000-0000-000000000001',
   'a0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'issued',
   '{
     "receipt_number": "DFC-2026-00001",
     "issued_at": "2026-01-01T05:00:00Z",
     "member": {"id": "a0000001-0000-0000-0000-000000000001", "code": "DFC-M-0001", "name": "Aarav Sharma", "phone": "+91 98201 12345", "email": "aarav.sharma@example.com"},
     "membership": {"plan_name": "12 Months Elite Annual", "start_date": "2026-01-01", "expiry_date": "2026-12-31"},
     "payment": {"amount_charged": 13500.00, "discount": 500.00, "amount_received": 13000.00, "balance_due": 0.00, "payment_method": "upi", "transaction_reference": "UPI/PAYTM/6182749102"},
     "gym": {"name": "Dynamo Fitness Club", "address": "Plot 42, Sector 18, Commercial Belt, Kharghar, Navi Mumbai - 410210", "phone": "+91 98765 43210", "footer": "Thank you for training with Dynamo Fitness Club!"}
   }'::jsonb,
   '2026-01-01 10:30:00+05:30'),

  ('d0000002-0000-0000-0000-000000000002', 'DFC-2026-00002', 'c0000002-0000-0000-0000-000000000002',
   'a0000002-0000-0000-0000-000000000002', 'b0000002-0000-0000-0000-000000000002', 'issued',
   '{
     "receipt_number": "DFC-2026-00002",
     "issued_at": "2026-06-01T05:45:00Z",
     "member": {"id": "a0000002-0000-0000-0000-000000000002", "code": "DFC-M-0002", "name": "Priya Deshmukh", "phone": "+91 98202 23456", "email": "priya.d@example.com"},
     "membership": {"plan_name": "6 Months Pro Fitness", "start_date": "2026-06-01", "expiry_date": "2026-11-28"},
     "payment": {"amount_charged": 7500.00, "discount": 0.00, "amount_received": 5000.00, "balance_due": 2500.00, "payment_method": "cash"},
     "gym": {"name": "Dynamo Fitness Club", "address": "Plot 42, Sector 18, Commercial Belt, Kharghar, Navi Mumbai - 410210", "phone": "+91 98765 43210", "footer": "Thank you for training with Dynamo Fitness Club!"}
   }'::jsonb,
   '2026-06-01 11:15:00+05:30')
ON CONFLICT (id) DO NOTHING;

-- 6. SAMPLE ENQUIRIES
INSERT INTO public.enquiries (id, name, phone, message, is_read, created_at)
VALUES
  ('e0000001-0000-0000-0000-000000000001', 'Sameer Sen', '+91 99112 23344', 'Interested in the 6-month muscle builder plan. Do you offer morning personal training?', false, now() - INTERVAL '2 hours'),
  ('e0000002-0000-0000-0000-000000000002', 'Ritu Mathur', '+91 99223 34455', 'Looking for women-specific batch timings and certified trainer guidance.', true, now() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- 7. ADVANCE SEQUENCES
SELECT setval('member_code_seq', 20, true);
SELECT setval('receipt_number_seq', 3, true);
