# RPC & API Documentation — Dynamo Fitness Club

## Stored Procedures (PostgreSQL / Supabase RPCs)

### 1. `register_member_with_membership`
Registers a new gym member, computes duration expiry, assigns plan, and optionally settles first payment and issues official receipt atomically.

**Parameters:**
- `p_full_name` (TEXT, required): Athlete full name
- `p_phone` (TEXT, required): Athlete primary mobile number
- `p_email` (TEXT, optional): Email address
- `p_date_of_birth` (DATE, optional): Date of birth
- `p_address` (TEXT, optional): Residential address
- `p_emergency_contact_name` (TEXT, optional): Emergency contact name
- `p_emergency_contact_phone` (TEXT, optional): Emergency contact phone
- `p_notes` (TEXT, optional): Medical or training notes
- `p_plan_id` (UUID, optional): Membership plan UUID
- `p_start_date` (DATE, default `CURRENT_DATE`): Start date
- `p_agreed_fee` (NUMERIC, optional): Agreed fee
- `p_payment_method` (TEXT, optional): Payment channel (`cash`, `upi`, `card`, etc.)
- `p_amount_received` (NUMERIC, optional): Amount collected
- `p_discount` (NUMERIC, default 0): Discount granted
- `p_transaction_reference` (TEXT, optional): Bank or POS reference number
- `p_idempotency_key` (TEXT, optional): Unique submission identifier

**Returns:**
JSON object with `member_id`, `member_code`, `membership_id`, `payment_id`, `receipt_number`.

---

### 2. `record_payment_and_issue_receipt`
Records fee collection against an athlete's membership, calculates outstanding dues, generates sequential receipt number (`DFC-YYYY-XXXXX`), and freezes a snapshot of receipt data.

**Parameters:**
- `p_member_id` (UUID, required)
- `p_membership_id` (UUID, required)
- `p_amount_charged` (NUMERIC, required)
- `p_amount_received` (NUMERIC, required)
- `p_discount` (NUMERIC, default 0)
- `p_payment_method` (TEXT, required)
- `p_transaction_reference` (TEXT, optional)
- `p_notes` (TEXT, optional)
- `p_idempotency_key` (TEXT, required)

---

### 3. `cancel_and_reissue_receipt`
Audited receipt cancellation procedure requiring mandatory reasoning. Marks original receipt with `CANCELLED` status and optionally issues a linked replacement receipt.

**Parameters:**
- `p_receipt_id` (UUID, required): Target receipt UUID
- `p_reason` (TEXT, required): Justification for cancellation
- `p_reissue` (BOOLEAN, default false): Whether to generate replacement receipt
- `p_new_amount_received` (NUMERIC, optional): Updated amount if reissued

---

### 4. `submit_enquiry`
Public lead submission endpoint. Validates input, applies spam defense via honeypot traps, and rate limits submission to 10 per minute.
