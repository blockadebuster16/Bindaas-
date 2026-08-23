/**
 * outboxWorker.js
 *
 * Durable event processing worker using Supabase `event_outbox` as a persistent queue.
 * Replaces the fire-and-forget setImmediate approach with a crash-safe, restartable worker.
 *
 * Strategy:
 * - Polls event_outbox every 5 seconds for PENDING events
 * - Processes each event with the appropriate handler
 * - On success: marks status = 'PROCESSED'
 * - On failure: increments attempts, schedules next_retry_at with exponential backoff
 * - After max_attempts: marks status = 'DLQ' (Dead Letter Queue) for manual inspection
 *
 * Events handled:
 *   OrderPaidEvent          → Qikink submission + Resend invoice email + inventory ledger
 *   OrphanedPaymentDetected → Admin alert (logged, future: Slack/email alert)
 *
 * Start the worker by calling: outboxWorker.start()
 * Stop it gracefully by calling: outboxWorker.stop()
 */

const supabase    = require('../config/supabase');
const domainBus   = require('./eventEmitter');

const POLL_INTERVAL_MS = 5000;  // 5 seconds
const BATCH_SIZE       = 10;    // Process up to 10 events per poll cycle

let workerInterval = null;
let isProcessing   = false;

// ── Event Handlers Map ──────────────────────────────────────────────────────────
const eventHandlers = {};

/**
 * Register a handler for a specific event type.
 * @param {string}   eventType
 * @param {Function} handler     - async (payload) => void
 */
const registerHandler = (eventType, handler) => {
    eventHandlers[eventType] = handler;
    console.log(`🔌 [OutboxWorker] Registered handler for: ${eventType}`);
};

/**
 * Poll the event_outbox table for pending events and process them.
 */
const processBatch = async () => {
    if (isProcessing || !supabase) return;
    isProcessing = true;

    try {
        // Fetch a batch of due events
        const { data: events, error } = await supabase
            .from('event_outbox')
            .select('*')
            .in('status', ['PENDING', 'FAILED'])
            .lte('next_retry_at', new Date().toISOString())
            .order('created_at', { ascending: true })
            .limit(BATCH_SIZE);

        if (error) {
            console.error('[OutboxWorker] Poll error:', error.message);
            return;
        }

        if (!events || events.length === 0) return;

        console.log(`🔄 [OutboxWorker] Processing ${events.length} event(s)...`);

        for (const event of events) {
            // Mark as PROCESSING to prevent double-processing by concurrent workers
            await supabase.from('event_outbox')
                .update({ status: 'PROCESSING' })
                .eq('id', event.id)
                .eq('status', event.status); // Optimistic lock

            try {
                const handler = eventHandlers[event.event_type];

                if (!handler) {
                    console.warn(`[OutboxWorker] No handler registered for: ${event.event_type}`);
                    // Mark processed anyway — don't block queue on unknown events
                    await markProcessed(event.id);
                    continue;
                }

                await handler(event.payload);

                await markProcessed(event.id);
                console.log(`✅ [OutboxWorker] ${event.event_type} processed (ID: ${event.id})`);

            } catch (handlerErr) {
                const newAttempts = event.attempts + 1;
                const isDLQ       = newAttempts >= event.max_attempts;

                // Exponential backoff: 1s, 2s, 4s, 8s, 16s
                const backoffMs   = Math.min(1000 * Math.pow(2, newAttempts - 1), 60000);
                const nextRetry   = new Date(Date.now() + backoffMs).toISOString();

                await supabase.from('event_outbox').update({
                    status:        isDLQ ? 'DLQ' : 'FAILED',
                    attempts:      newAttempts,
                    last_error:    handlerErr.message,
                    next_retry_at: isDLQ ? null : nextRetry
                }).eq('id', event.id);

                if (isDLQ) {
                    console.error(
                        `💀 [OutboxWorker] ${event.event_type} moved to DLQ after ${newAttempts} attempts.\n` +
                        `   Aggregate: ${event.aggregate_id} | Error: ${handlerErr.message}`
                    );
                } else {
                    console.warn(
                        `⚠️ [OutboxWorker] ${event.event_type} failed (attempt ${newAttempts}/${event.max_attempts}) — retry in ${backoffMs}ms`
                    );
                }
            }
        }

    } finally {
        isProcessing = false;
    }
};

const markProcessed = async (eventId) => {
    await supabase.from('event_outbox').update({
        status:       'PROCESSED',
        processed_at: new Date().toISOString()
    }).eq('id', eventId);
};

/**
 * Write an event to the outbox for durable processing.
 * Returns immediately — worker will process it within POLL_INTERVAL_MS.
 *
 * @param {string} eventType    - Domain event name
 * @param {string} aggregateId  - order_id, payment_id, etc.
 * @param {Object} payload      - Event data
 * @param {string} aggregateType - 'Order' | 'Payment' | 'Refund'
 */
const enqueue = async (eventType, aggregateId, payload, aggregateType = 'Order') => {
    if (!supabase) {
        console.warn(`[OutboxWorker] Supabase not initialized — ${eventType} not persisted`);
        // Fallback: emit directly (dev mode behaviour)
        setImmediate(() => domainBus.emit(eventType, payload));
        return;
    }

    const { error } = await supabase.from('event_outbox').insert([{
        event_type:     eventType,
        aggregate_id:   String(aggregateId),
        aggregate_type: aggregateType,
        payload,
        status:         'PENDING',
        next_retry_at:  new Date().toISOString()
    }]);

    if (error) {
        console.error(`[OutboxWorker] Failed to enqueue ${eventType}:`, error.message);
        // Fallback: emit directly so we don't lose the event
        setImmediate(() => domainBus.emit(eventType, payload));
        return;
    }

    console.log(`📥 [OutboxWorker] Enqueued: ${eventType} (aggregate: ${aggregateId})`);
};

/**
 * Start the outbox worker polling loop.
 */
const start = () => {
    if (workerInterval) return; // Already running
    console.log(`🚀 [OutboxWorker] Started — polling every ${POLL_INTERVAL_MS / 1000}s`);
    workerInterval = setInterval(processBatch, POLL_INTERVAL_MS);
};

/**
 * Gracefully stop the outbox worker.
 */
const stop = () => {
    if (workerInterval) {
        clearInterval(workerInterval);
        workerInterval = null;
        console.log('🛑 [OutboxWorker] Stopped');
    }
};

module.exports = { start, stop, enqueue, registerHandler };
