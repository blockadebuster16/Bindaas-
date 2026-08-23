/**
 * eventEmitter.js
 *
 * Domain Event Bus for Bindaas Luxury E-Commerce.
 * A thin wrapper around Node's built-in EventEmitter for typed domain events.
 *
 * Domain Events emitted:
 *   OrderPaidEvent           { orderId, ticketId, userEmail, totalAmount, items, invoiceHTML }
 *   InvoiceGeneratedEvent    { orderId, invoiceId, invoiceNumber, userEmail }
 *   InvoiceSentEvent         { orderId, invoiceId, userEmail, resendMessageId }
 *   QikinkSubmittedEvent     { orderId, qikinkOrderId, shipmentId }
 *   DeliveryFailedEvent      { orderId, qikinkOrderId, reason }           (future)
 *   OrderCancelledEvent      { orderId, userEmail, refundAmount }          (future)
 *   ReturnRequestedEvent     { orderId, returnId, userEmail, items }       (future)
 *   RTOInitiatedEvent        { orderId, qikinkOrderId }                    (future)
 *   OrphanedPaymentDetected  { paymentId, customerEmail, amountPaise }
 *
 * Usage:
 *   const bus = require('./eventEmitter');
 *   bus.emit('OrderPaidEvent', { orderId: 42, ... });
 *   bus.on('OrderPaidEvent', async (payload) => { ... });
 */

const EventEmitter = require('events');

class DomainEventBus extends EventEmitter {
    /**
     * Emit a domain event with structured logging.
     * @param {string} eventType - The domain event name
     * @param {Object} payload   - Event payload (must include aggregate_id or orderId)
     */
    emit(eventType, payload) {
        const aggregateId = payload?.orderId || payload?.paymentId || payload?.returnId || 'unknown';
        console.log(`📡 [DomainBus] ${eventType} → aggregate: ${aggregateId}`);
        return super.emit(eventType, payload);
    }

    /**
     * Subscribe to a domain event. The handler is called asynchronously
     * to prevent one subscriber from blocking others.
     * @param {string} eventType
     * @param {Function} handler - async (payload) => void
     */
    on(eventType, handler) {
        return super.on(eventType, async (payload) => {
            try {
                await handler(payload);
            } catch (err) {
                console.error(`❌ [DomainBus] Handler error for ${eventType}:`, err.message);
            }
        });
    }
}

const domainBus = new DomainEventBus();
domainBus.setMaxListeners(50); // Allow up to 50 listeners (future microservice expansion)

module.exports = domainBus;
