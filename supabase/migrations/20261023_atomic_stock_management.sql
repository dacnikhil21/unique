-- ==============================================================================
-- Migration: Atomic Server-Side Stock Decrement & Restore (DATA-03)
-- Created: 2026-10-23
-- Description:
--   Provides transactional, atomic inventory locking, stock decrementing,
--   and cancellation restoration functions directly inside PostgreSQL.
--   Prevents inventory overselling and race conditions across simultaneous checkouts.
-- ==============================================================================

-- 1. Function: decrement_product_stock
-- Takes an array of order items: [{"id": "68", "qty": 1}, ...]
-- Locks each row FOR UPDATE, validates stock sufficiency, and decrements stock atomically.
CREATE OR REPLACE FUNCTION decrement_product_stock(order_items jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item jsonb;
  v_item_id text;
  v_qty int;
  v_current_stock int;
  v_title text;
BEGIN
  IF order_items IS NULL OR jsonb_array_length(order_items) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'No order items provided');
  END IF;

  -- Phase 1: Validate stock with FOR UPDATE lock on each product row
  FOR item IN SELECT * FROM jsonb_array_elements(order_items)
  LOOP
    v_item_id := item->>'id';
    v_qty := GREATEST(1, COALESCE((item->>'qty')::int, (item->>'quantity')::int, 1));

    SELECT stock_qty, title
    INTO v_current_stock, v_title
    FROM products
    WHERE id::text = v_item_id
    FOR UPDATE;

    IF NOT FOUND THEN
      -- Product may be legacy/fallback catalog only; continue without blocking
      CONTINUE;
    END IF;

    IF v_current_stock < v_qty THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', format('Insufficient stock for "%s". Only %s units available (requested %s).', v_title, v_current_stock, v_qty)
      );
    END IF;
  END LOOP;

  -- Phase 2: Perform atomic decrement
  FOR item IN SELECT * FROM jsonb_array_elements(order_items)
  LOOP
    v_item_id := item->>'id';
    v_qty := GREATEST(1, COALESCE((item->>'qty')::int, (item->>'quantity')::int, 1));

    UPDATE products
    SET
      stock_qty = GREATEST(0, stock_qty - v_qty),
      in_stock = (stock_qty - v_qty > 0)
    WHERE id::text = v_item_id;
  END LOOP;

  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 2. Function: restore_product_stock
-- Takes an array of order items: [{"id": "68", "qty": 1}, ...]
-- Restores stock on order cancellation or payment failure.
CREATE OR REPLACE FUNCTION restore_product_stock(order_items jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item jsonb;
  v_item_id text;
  v_qty int;
BEGIN
  IF order_items IS NULL OR jsonb_array_length(order_items) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'No order items provided');
  END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(order_items)
  LOOP
    v_item_id := item->>'id';
    v_qty := GREATEST(1, COALESCE((item->>'qty')::int, (item->>'quantity')::int, 1));

    UPDATE products
    SET
      stock_qty = COALESCE(stock_qty, 0) + v_qty,
      in_stock = true
    WHERE id::text = v_item_id;
  END LOOP;

  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION decrement_product_stock(jsonb) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION restore_product_stock(jsonb) TO anon, authenticated, service_role;
