# Row Level Security (RLS) Policies — Dynamo Fitness Club

## Policy Matrix

| Table | Operation | Role | Policy Rule |
| :--- | :--- | :--- | :--- |
| `profiles` | SELECT | Admin / Own | `is_admin() OR auth.uid() = id` |
| `profiles` | UPDATE | Own | `auth.uid() = id` (name only) |
| `members` | ALL | Admin | `is_admin()` strictly enforced |
| `membership_plans` | SELECT | Public / Anon | `is_active = true OR is_admin()` |
| `membership_plans` | ALL | Admin | `is_admin()` |
| `memberships` | ALL | Admin | `is_admin()` |
| `payments` | ALL | Admin | `is_admin()` |
| `payment_adjustments` | ALL | Admin | `is_admin()` |
| `receipts` | ALL | Admin | `is_admin()` |
| `gym_settings` | SELECT | Public / Anon | `true` (public branding info) |
| `gym_settings` | UPDATE | Admin | `is_admin()` |
| `audit_logs` | SELECT | Admin | `is_admin()` (insert-only via system triggers) |
| `enquiries` | INSERT | Public / Anon | `honeypot_field IS NULL OR honeypot_field = ''` |
| `enquiries` | SELECT / UPDATE | Admin | `is_admin()` |
