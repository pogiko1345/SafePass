// utils/printUtils.js
import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";
import { Platform } from "react-native";
import { getPrintHTML } from "../styles/PrintStyles";

export const printUserList = async (users, title, activeMenu) => {
  if (!users || users.length === 0) {
    throw new Error("No users to print");
  }

  const htmlContent = getPrintHTML(users, title, activeMenu);

  try {
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    if (Platform.OS !== "web") {
      await shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Print Users List",
        UTI: "com.adobe.pdf",
      });
    } else {
      const printWindow = window.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
    
    return { success: true };
  } catch (error) {
    console.error("Print error:", error);
    throw error;
  }
};

// Web-only fallback print function
export const printUserListWeb = (users, title, activeMenu) => {
  if (!users || users.length === 0) {
    throw new Error("No users to print");
  }

  const htmlContent = getPrintHTML(users, title, activeMenu);
  
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title} - Sapphire Aviation</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          padding: 20px;
          background: white;
        }
        .print-header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #3B82F6;
        }
        .print-header h2 {
          color: #1E3A5F;
          font-size: 18px;
          margin-bottom: 4px;
        }
        .print-header p {
          color: #64748B;
          font-size: 11px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        th {
          background: #F1F5F9;
          color: #1E293B;
          padding: 10px 8px;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #E2E8F0;
        }
        td {
          padding: 8px;
          border-bottom: 1px solid #E2E8F0;
        }
        .role-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 600;
        }
        .role-admin { background: #EFF6FF; color: #3B82F6; }
        .role-staff { background: #D1FAE5; color: #10B981; }
        .role-guard { background: #FEF3C7; color: #F59E0B; }
        .role-visitor { background: #EDE9FE; color: #8B5CF6; }
        .status-active { color: #10B981; font-weight: 600; }
        .status-inactive { color: #EF4444; font-weight: 600; }
        .print-footer {
          margin-top: 20px;
          text-align: center;
          font-size: 10px;
          color: #94A3B8;
          padding-top: 10px;
          border-top: 1px solid #E2E8F0;
        }
        @media print {
          body { padding: 10px; }
        }
      </style>
    </head>
    <body>
      ${htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i)[1]}
    </body>
    </html>
  `);
  printWindow.document.close();
  
  printWindow.onload = () => {
    printWindow.print();
    setTimeout(() => printWindow.close(), 500);
  };
};