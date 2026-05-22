const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

class GoogleSheetsService {
    constructor() {
        this.sheetId = '1h_Ho_VRIDa4MZ2kibvJF2ZgEWWe09su7FtdUPydgobk';
        this.initialized = false;
        
        // Setup JWT authentication, checking if credentials actually exist
        if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
            this.jwtClient = new JWT({
                email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // handle newlines in env vars
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
            this.doc = new GoogleSpreadsheet(this.sheetId, this.jwtClient);
            this.initialized = true;
        } else {
            console.warn("⚠️ Google Sheets Sync is DISABLED: Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY in .env");
        }
    }

    async init() {
        if (!this.initialized) return false;
        try {
            await this.doc.loadInfo();
            return true;
        } catch (error) {
            console.error("Failed to load Google Sheet config", error);
            return false;
        }
    }

    async appendOrder(order) {
        if (!this.initialized) return;
        
        const isReady = await this.init();
        if (!isReady) return;

        try {
            const sheet = this.doc.sheetsByIndex[0]; // Assuming order rows go to the first sheet
            
            // Format data based on expected columns: OrderID, CustomerEmail, Status, TotalAmount, Date
            await sheet.addRow({
                OrderID: order._id.toString(),
                CustomerEmail: order.userEmail,
                TotalAmount: order.totalAmount,
                Status: order.status || 'Pending',
                Date: new Date(order.orderDate || Date.now()).toISOString(),
                TransactionID: order.transactionId || 'N/A'
            });
            console.log(`✅ Order ${order._id} synced to Google Sheets`);
        } catch (error) {
            console.error(`❌ Failed to sync Order ${order._id} to Sheets:`, error);
        }
    }

    async updateOrderStatus(orderId, newStatus) {
        if (!this.initialized) return;

        const isReady = await this.init();
        if (!isReady) return;

        try {
            const sheet = this.doc.sheetsByIndex[0];
            const rows = await sheet.getRows();

            const rowToUpdate = rows.find(row => row.get('OrderID') === orderId.toString());
            if (rowToUpdate) {
                rowToUpdate.set('Status', newStatus);
                await rowToUpdate.save();
                console.log(`✅ Order ${orderId} status synced in Google Sheets -> ${newStatus}`);
            } else {
                console.warn(`⚠️ Order ${orderId} not found in Google Sheets to update status.`);
            }
        } catch (error) {
            console.error(`❌ Failed to update status in Sheets for Order ${orderId}:`, error);
        }
    }
}

// Export as singleton to prevent reloading auth every time
module.exports = new GoogleSheetsService();
