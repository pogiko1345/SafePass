// styles/PrintStyles.js
const escapeHTML = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const getPrintTableHTML = (
  {
    title = "Records",
    subtitle = "",
    columns = [],
    rows = [],
    totalLabel = "records",
  },
  logoSrc = "",
) => {
  const safeColumns = Array.isArray(columns) ? columns : [];
  const safeRows = Array.isArray(rows) ? rows : [];

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${escapeHTML(title)} - Sapphire International Aviation Academy</title>
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
          color: #0F172A;
        }
        .print-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #1C6DD0;
        }
        .print-header-brand {
          width: 56px;
          height: 56px;
          border-radius: 28px;
          border: 1px solid #EEF5FF;
          object-fit: cover;
          flex-shrink: 0;
        }
        .print-header-copy {
          text-align: left;
        }
        .print-header h2 {
          color: #1E3A5F;
          font-size: 18px;
          margin-bottom: 4px;
        }
        .print-header p {
          color: #64748B;
          font-size: 11px;
          line-height: 1.5;
        }
        .print-subtitle {
          margin: 0 0 14px 0;
          font-size: 12px;
          line-height: 1.6;
          color: #475569;
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
          font-weight: 700;
          border-bottom: 2px solid #E2E8F0;
        }
        td {
          padding: 9px 8px;
          border-bottom: 1px solid #E2E8F0;
          vertical-align: top;
        }
        tr:nth-child(even) td {
          background: #FAFCFF;
        }
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
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="print-header">
        ${logoSrc ? `<img src="${logoSrc}" alt="Sapphire International Aviation Academy Logo" class="print-header-brand" />` : ""}
        <div class="print-header-copy">
          <h2>Sapphire International Aviation Academy</h2>
          <p>${escapeHTML(title)} | Generated: ${escapeHTML(new Date().toLocaleString())}</p>
        </div>
      </div>

      ${subtitle ? `<p class="print-subtitle">${escapeHTML(subtitle)}</p>` : ""}

      <table>
        <thead>
          <tr>
            ${safeColumns.map((column) => `<th>${escapeHTML(column.label || "")}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${
            safeRows.length > 0
              ? safeRows
                  .map(
                    (row) => `
                      <tr>
                        ${safeColumns
                          .map((column) => `<td>${escapeHTML(row?.[column.key] ?? "-")}</td>`)
                          .join("")}
                      </tr>
                    `,
                  )
                  .join("")
              : `
                <tr>
                  <td colspan="${Math.max(1, safeColumns.length)}">No records available.</td>
                </tr>
              `
          }
        </tbody>
      </table>

      <div class="print-footer">
        <p>Total: ${safeRows.length} ${escapeHTML(totalLabel)} | Printed on ${escapeHTML(new Date().toLocaleString())}</p>
      </div>
    </body>
    </html>
  `;
};

export const getPrintHTML = (users, title, activeMenu, logoSrc = "") => {
  const resolvedTitle =
    activeMenu === "staff"
      ? "Staff Members List"
      : activeMenu === "guards"
        ? "Security Guards List"
        : title || "Users List";

  return getPrintTableHTML(
    {
      title: resolvedTitle,
      subtitle: "Generated from the SafePass admin records table.",
      totalLabel: "users",
      columns: [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "role", label: "Role" },
        { key: "status", label: "Status" },
        { key: "createdAt", label: "Date Created" },
      ],
      rows: (users || []).map((userItem) => ({
        name: `${userItem?.firstName || ""} ${userItem?.lastName || ""}`.trim() || "User",
        email: userItem?.email || "-",
        role: userItem?.role ? String(userItem.role).toUpperCase() : "VISITOR",
        status: userItem?.status === "active" || userItem?.isActive ? "ACTIVE" : "INACTIVE",
        createdAt: userItem?.createdAt ? new Date(userItem.createdAt).toLocaleDateString() : "-",
      })),
    },
    logoSrc,
  );
};
