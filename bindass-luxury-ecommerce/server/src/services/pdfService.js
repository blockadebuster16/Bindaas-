/**
 * pdfService.js
 *
 * On-demand PDF invoice generation using html-pdf-node.
 * Converts the existing luxury HTML invoice template to a PDF buffer.
 *
 * Usage:
 *   const { generateInvoicePDF } = require('./pdfService');
 *   const pdfBuffer = await generateInvoicePDF(invoiceHTML);
 *   res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="invoice.pdf"' });
 *   res.send(pdfBuffer);
 */

const htmlPdf = require('html-pdf-node');

/**
 * Generate a PDF from an HTML invoice string.
 * Returns a Buffer that can be sent directly as an HTTP response or stored.
 *
 * @param {string} invoiceHTML - Full HTML invoice string (from invoiceService.generateInvoiceHTML)
 * @param {Object} options     - Optional overrides for html-pdf-node options
 * @returns {Promise<Buffer>}  - PDF file buffer
 */
const generateInvoicePDF = async (invoiceHTML, options = {}) => {
    const file = { content: invoiceHTML };

    const pdfOptions = {
        format:          'A4',
        printBackground: true,
        margin: {
            top:    '20px',
            right:  '0px',
            bottom: '20px',
            left:   '0px'
        },
        ...options
    };

    try {
        const pdfBuffer = await htmlPdf.generatePdf(file, pdfOptions);
        console.log(`📄 [pdfService] PDF generated — ${Math.round(pdfBuffer.length / 1024)} KB`);
        return pdfBuffer;
    } catch (err) {
        console.error('[pdfService] PDF generation error:', err.message);
        throw new Error(`PDF generation failed: ${err.message}`);
    }
};

module.exports = { generateInvoicePDF };
