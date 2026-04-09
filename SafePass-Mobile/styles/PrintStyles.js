// styles/PrintStyles.js
export const getPrintHTML = (users, title, activeMenu) => {
  const getTitle = () => {
    switch (activeMenu) {
      case "staff":
        return "Staff Members List";
      case "guards":
        return "Security Guards List";
      default:
        return title || "Users List";
    }
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${getTitle()} - Sapphire International Aviation Academy</title>
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
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="print-header">
        <h2>Sapphire International Aviation Academy</h2>
        <p>${getTitle()} | Generated: ${new Date().toLocaleDateString()}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Date Created</th>
          </tr>
        </thead>
        <tbody>
          ${users
            .map(
              (userItem) => `
            <tr>
              <td><strong>${userItem.firstName} ${userItem.lastName}</strong></td>
              <td>${userItem.email}</td>
              <td>
                <span class="role-badge role-${userItem.role}">
                  ${userItem.role?.toUpperCase() || "VISITOR"}
                </span>
              </td>
              <td class="${userItem.status === "active" || userItem.isActive ? "status-active" : "status-inactive"}">
                ${userItem.status === "active" || userItem.isActive ? "ACTIVE" : "INACTIVE"}
              </td>
              <td>${new Date(userItem.createdAt).toLocaleDateString()}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <div class="print-footer">
        <p>Total: ${users.length} users | Printed on ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;
};
