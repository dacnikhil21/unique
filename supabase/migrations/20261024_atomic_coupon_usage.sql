-- ==============================================================================
-- UNIQUE EXPRESSIONS: ATOMIC COUPON USAGE TRACKING
-- Increment and decrement coupon times_used atomically in Supabase
-- ==============================================================================

create or replace function increment_coupon_usage(p_code text)
returns void language plpgsql security definer as $$
begin
  update coupons
  set times_used = coalesce(times_used, 0) + 1,
      updated_at = now()
  where lower(trim(code)) = lower(trim(p_code));
end;
$$;

create or replace function decrement_coupon_usage(p_code text)
returns void language plpgsql security definer as $$
begin
  update coupons
  set times_used = greatest(0, coalesce(times_used, 0) - 1),
      updated_at = now()
  where lower(trim(code)) = lower(trim(p_code));
end;
$$;
