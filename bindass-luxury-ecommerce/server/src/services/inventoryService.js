/**
 * inventoryService.js
 *
 * Atomic inventory management with pessimistic locking and full audit trail.
 *
 * Key responsibilities:
 * 1. Atomic stock decrements using MongoDB $gte guard (prevents oversell race conditions)
 * 2. Write every stock change to Supabase `inventory_ledger` for GST audit trail
 * 3. Restore stock on returns/cancellations
 */

const Product = require('../models/Product');
const supabase = require('../config/supabase');

/**
 * Atomically decrement stock for multiple order items.
 * Uses MongoDB findOneAndUpdate with $gte guard to prevent oversell under concurrent load.
 *
 * @param {Array}  items      - [{ product_id, name, quantity, price, size }]
 * @param {number} orderId    - Supabase order ID (for ledger reference)
 * @param {string} performer  - 'system' or admin email
 * @returns {Promise<Array>}  - Updated product documents
 * @throws {Error}            - If stock is insufficient for any item
 */
const decrementStock = async (items, orderId, performer = 'system') => {
    const results = [];

    for (const item of items) {
        // Atomic: only decrements if current stock >= required quantity
        const updated = await Product.findOneAndUpdate(
            {
                _id: item.product_id,
                stock_quantity: { $gte: item.quantity }
            },
            { $inc: { stock_quantity: -item.quantity } },
            { new: true }
        );

        if (!updated) {
            throw new Error(
                `Insufficient stock for "${item.name}" — ` +
                `${item.quantity} requested but not enough available.`
            );
        }

        results.push(updated);

        // Write to Supabase inventory_ledger (non-blocking, best-effort)
        writeLedgerEntry({
            product_id:   item.product_id,
            product_name: item.name || updated.name,
            sku:          item.sku || null,
            event_type:   'SALE',
            delta:        -item.quantity,
            qty_after:    updated.stock_quantity,
            order_id:     orderId,
            reason:       `Order #${orderId} placed`,
            performed_by: performer
        }).catch(e => console.error('[inventoryService] Ledger write error (SALE):', e.message));
    }

    return results;
};

/**
 * Restore stock for returned/cancelled items.
 * Used by returnService.js when a return is approved.
 *
 * @param {Array}  items      - [{ product_id, name, quantity }]
 * @param {number} orderId    - Supabase order ID
 * @param {number} returnId   - Supabase return ID (nullable)
 * @param {string} eventType  - 'RETURN' | 'RTO_RETURNED' | 'RESERVATION_RELEASED'
 * @param {string} performer  - admin email or 'system'
 */
const restoreStock = async (items, orderId, returnId = null, eventType = 'RETURN', performer = 'system') => {
    for (const item of items) {
        const updated = await Product.findOneAndUpdate(
            { _id: item.product_id },
            { $inc: { stock_quantity: item.quantity } },
            { new: true }
        );

        if (!updated) {
            console.warn(`[inventoryService] Could not restore stock for product ${item.product_id} — product not found`);
            continue;
        }

        // Write to ledger
        writeLedgerEntry({
            product_id:   item.product_id,
            product_name: item.name || updated.name,
            event_type:   eventType,
            delta:        +item.quantity,
            qty_after:    updated.stock_quantity,
            order_id:     orderId,
            return_id:    returnId,
            reason:       `Return #${returnId} approved for Order #${orderId}`,
            performed_by: performer
        }).catch(e => console.error('[inventoryService] Ledger write error (RETURN):', e.message));
    }
};

/**
 * Write an entry to the Supabase inventory_ledger table.
 * Non-blocking — callers should .catch() to avoid unhandled rejections.
 *
 * @param {Object} entry - Ledger record data
 */
const writeLedgerEntry = async (entry) => {
    if (!supabase) {
        console.warn('[inventoryService] Supabase not initialized — ledger entry skipped');
        return;
    }

    const { error } = await supabase.from('inventory_ledger').insert([{
        product_id:   String(entry.product_id),
        product_name: entry.product_name || null,
        sku:          entry.sku || null,
        event_type:   entry.event_type,
        delta:        entry.delta,
        qty_after:    entry.qty_after ?? null,
        order_id:     entry.order_id || null,
        return_id:    entry.return_id || null,
        reason:       entry.reason || null,
        performed_by: entry.performed_by || 'system'
    }]);

    if (error) {
        throw new Error(`Ledger insert failed: ${error.message}`);
    }
};

/**
 * Write a manual adjustment to the ledger (admin tool for stock corrections).
 * Does NOT modify MongoDB — only records the adjustment as an audit entry.
 *
 * @param {Object} entry
 */
const writeManualAdjustment = async (entry) => {
    return writeLedgerEntry({ ...entry, event_type: 'MANUAL' });
};

module.exports = {
    decrementStock,
    restoreStock,
    writeLedgerEntry,
    writeManualAdjustment
};
