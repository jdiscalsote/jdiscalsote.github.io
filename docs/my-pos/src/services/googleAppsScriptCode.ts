/**
 * Ready-to-deploy Google Apps Script Code template
 * Store owners can paste this directly into Google Sheets > Extensions > Apps Script
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ====================================================================
 * TINDAHAN POS & INVENTORY - GOOGLE APPS SCRIPT BACKEND
 * ====================================================================
 * Instructions:
 * 1. Open Google Sheets.
 * 2. Create 2 sheets:
 *    - "Products" (Row 1 Headers: SKU, Name, Category, UnitPrice, CostPrice, Stock, ReorderLevel, Unit, UpdatedAt)
 *    - "Transactions" (Row 1 Headers: TransactionID, Timestamp, Type, TotalAmount, CashTendered, Change, PaymentMethod, CustomerName, ItemsJSON)
 * 3. In Google Sheets, click "Extensions" > "Apps Script".
 * 4. Replace the entire code with this script.
 * 5. Click "Deploy" > "New deployment".
 * 6. Select type: "Web app".
 *    - Description: "Tindahan API v1"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone" (crucial so your POS can connect without OAuth blockers)
 * 7. Click "Deploy" and copy the Web App URL.
 * 8. Paste the Web App URL into your Tindahan POS Settings!
 */

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Fetch Products
    const prodSheet = getOrCreateSheet(ss, "Products", [
      "SKU", "Name", "Category", "UnitPrice", "CostPrice", "Stock", "ReorderLevel", "Unit", "UpdatedAt"
    ]);
    const prodData = prodSheet.getDataRange().getValues();
    const products = [];
    if (prodData.length > 1) {
      for (let i = 1; i < prodData.length; i++) {
        const row = prodData[i];
        if (row[0]) {
          products.push({
            sku: String(row[0]),
            name: String(row[1]),
            category: String(row[2]),
            unitPrice: Number(row[3]) || 0,
            costPrice: Number(row[4]) || 0,
            stock: Number(row[5]) || 0,
            reorderLevel: Number(row[6]) || 0,
            unit: String(row[7] || "pc"),
            updatedAt: row[8] ? new Date(row[8]).toISOString() : new Date().toISOString()
          });
        }
      }
    }

    // 2. Fetch Transactions
    const trxSheet = getOrCreateSheet(ss, "Transactions", [
      "TransactionID", "Timestamp", "Type", "TotalAmount", "CashTendered", "Change", "PaymentMethod", "CustomerName", "ItemsJSON"
    ]);
    const trxData = trxSheet.getDataRange().getValues();
    const transactions = [];
    if (trxData.length > 1) {
      for (let i = 1; i < trxData.length; i++) {
        const row = trxData[i];
        if (row[0]) {
          let parsedItems = [];
          try {
            parsedItems = JSON.parse(row[8] || "[]");
          } catch (err) {
            parsedItems = [];
          }
          transactions.push({
            id: String(row[0]),
            timestamp: row[1] ? new Date(row[1]).toISOString() : new Date().toISOString(),
            type: String(row[2] || "SALE"),
            totalAmount: Number(row[3]) || 0,
            cashTendered: Number(row[4]) || 0,
            changeAmount: Number(row[5]) || 0,
            paymentMethod: String(row[6] || "CASH"),
            customerName: String(row[7] || ""),
            items: parsedItems
          });
        }
      }
    }

    const response = {
      status: "success",
      products: products,
      transactions: transactions.reverse() // latest first
    };

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const rawContent = e.postData.contents;
    const payload = JSON.parse(rawContent);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const prodSheet = getOrCreateSheet(ss, "Products", [
      "SKU", "Name", "Category", "UnitPrice", "CostPrice", "Stock", "ReorderLevel", "Unit", "UpdatedAt"
    ]);
    const trxSheet = getOrCreateSheet(ss, "Transactions", [
      "TransactionID", "Timestamp", "Type", "TotalAmount", "CashTendered", "Change", "PaymentMethod", "CustomerName", "ItemsJSON"
    ]);

    const action = payload.action;

    // Action 1: RECORD_SALE
    if (action === "RECORD_SALE") {
      const items = payload.items || [];
      const now = new Date();
      const trxId = payload.transactionId || "TRX-" + Utilities.formatDate(now, "GMT+8", "yyyyMMdd-HHmmss");
      
      // Update inventory stock for each sold item
      const prodData = prodSheet.getDataRange().getValues();
      for (let k = 0; k < items.length; k++) {
        const item = items[k];
        for (let r = 1; r < prodData.length; r++) {
          if (String(prodData[r][0]) === String(item.sku)) {
            const currentStock = Number(prodData[r][5]) || 0;
            const newStock = Math.max(0, currentStock - (Number(item.quantity) || 1));
            prodSheet.getRange(r + 1, 6).setValue(newStock);
            prodSheet.getRange(r + 1, 9).setValue(now);
            break;
          }
        }
      }

      // Append transaction row
      trxSheet.appendRow([
        trxId,
        now,
        "SALE",
        payload.totalAmount || 0,
        payload.cashTendered || 0,
        payload.changeAmount || 0,
        payload.paymentMethod || "CASH",
        payload.customerName || "Walk-in",
        JSON.stringify(items)
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "RECORD_SALE",
        transactionId: trxId,
        message: "Sale recorded and stock deducted successfully"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Action 2: ADD_PRODUCT
    if (action === "ADD_PRODUCT") {
      const now = new Date();
      prodSheet.appendRow([
        payload.sku,
        payload.name,
        payload.category || "General",
        Number(payload.unitPrice) || 0,
        Number(payload.costPrice) || 0,
        Number(payload.stock) || 0,
        Number(payload.reorderLevel) || 5,
        payload.unit || "pc",
        now
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "ADD_PRODUCT",
        sku: payload.sku,
        message: "Product added successfully"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Action 3: UPDATE_STOCK
    if (action === "UPDATE_STOCK") {
      const sku = String(payload.sku);
      const newStock = Number(payload.newStock);
      const prodData = prodSheet.getDataRange().getValues();
      let found = false;

      for (let r = 1; r < prodData.length; r++) {
        if (String(prodData[r][0]) === sku) {
          prodSheet.getRange(r + 1, 6).setValue(newStock);
          prodSheet.getRange(r + 1, 9).setValue(new Date());
          found = true;
          break;
        }
      }

      // If restock log is requested
      if (payload.logRestock && found) {
        trxSheet.appendRow([
          "RST-" + Utilities.formatDate(new Date(), "GMT+8", "yyyyMMdd-HHmmss"),
          new Date(),
          "RESTOCK",
          payload.restockCost || 0,
          0,
          0,
          "INVENTORY",
          "Supplier Restock",
          JSON.stringify([{
            sku: sku,
            name: payload.name || sku,
            quantity: payload.addedQuantity || 0,
            price: payload.costPrice || 0
          }])
        ]);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: found ? "success" : "error",
        action: "UPDATE_STOCK",
        sku: sku,
        newStock: newStock,
        message: found ? "Stock updated" : "Product SKU not found"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Action 4: INITIALIZE_CATALOG (Bulk upload products from Tindahan POS to Google Sheets)
    if (action === "INITIALIZE_CATALOG" || action === "BULK_ADD") {
      const prods = payload.products || [];
      if (prods.length > 0) {
        const now = new Date();
        const rows = prods.map(function(item) {
          return [
            item.sku,
            item.name,
            item.category || "General",
            Number(item.unitPrice) || 0,
            Number(item.costPrice) || 0,
            Number(item.stock) || 0,
            Number(item.reorderLevel) || 5,
            item.unit || "pc",
            now
          ];
        });
        const lastRow = prodSheet.getLastRow();
        const startRow = Math.max(2, lastRow + 1);
        prodSheet.getRange(startRow, 1, rows.length, 9).setValues(rows);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "INITIALIZE_CATALOG",
        count: prods.length,
        message: "Populated " + prods.length + " products into Google Sheets!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Unrecognized action: " + action
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    const allSheets = ss.getSheets();
    if (allSheets.length === 1 && allSheets[0].getLastRow() <= 1 && name === "Products") {
      sheet = allSheets[0];
      sheet.setName(name);
    } else {
      sheet = ss.insertSheet(name);
    }
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e2e8f0");
    sheet.setFrozenRows(1);
  }
  return sheet;
}
`;
