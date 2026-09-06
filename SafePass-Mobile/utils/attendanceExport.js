export const ATTENDANCE_COLUMNS = ["Name", "User Type", "Location", "Status", "Check In", "Check Out", "Last Tap"];

const isoDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
};

export const attendanceExportRows = (records) => records.map((record) => [
  record.name || "", record.userType || "", record.location || "", record.status || "",
  isoDate(record.checkInTime), isoDate(record.checkOutTime), isoDate(record.lastTapTime),
]);

const csvCell = (value) => {
  let text = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

export const attendanceCsv = (records) => [ATTENDANCE_COLUMNS, ...attendanceExportRows(records)]
  .map((row) => row.map(csvCell).join(","))
  .join("\r\n");
