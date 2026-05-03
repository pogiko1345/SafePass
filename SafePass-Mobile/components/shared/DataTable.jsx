import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const getNestedValue = (record, key) =>
  String(key || "")
    .split(".")
    .reduce((value, segment) => (value == null ? value : value[segment]), record);

const renderDefaultCell = (record, column) => {
  const value = getNestedValue(record, column.key);
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
};

export default function DataTable({
  columns = [],
  data = [],
  keyExtractor,
  emptyTitle = "No records found",
  emptyMessage = "Records will appear here once data is available.",
  onRowPress,
  pagination,
  style,
}) {
  const hasRows = Array.isArray(data) && data.length > 0;
  const resolvedColumns = columns.filter(Boolean);

  return (
    <View style={[styles.shell, style]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            {resolvedColumns.map((column) => (
              <View
                key={column.key}
                style={[
                  styles.headerCell,
                  column.width ? { width: column.width } : { flex: column.flex || 1 },
                  column.align === "right" && styles.alignRight,
                  column.align === "center" && styles.alignCenter,
                ]}
              >
                <Text style={styles.headerText} numberOfLines={1}>
                  {column.title || column.label || column.key}
                </Text>
              </View>
            ))}
          </View>

          {hasRows ? (
            data.map((record, rowIndex) => {
              const rowKey = keyExtractor?.(record, rowIndex) || record?._id || record?.id || rowIndex;
              const rowContent = (
                <View style={[styles.row, rowIndex % 2 === 1 && styles.altRow]}>
                  {resolvedColumns.map((column) => (
                    <View
                      key={`${rowKey}-${column.key}`}
                      style={[
                        styles.cell,
                        column.width ? { width: column.width } : { flex: column.flex || 1 },
                        column.align === "right" && styles.alignRight,
                        column.align === "center" && styles.alignCenter,
                      ]}
                    >
                      {column.render ? (
                        column.render(record, rowIndex)
                      ) : (
                        <Text style={styles.cellText} numberOfLines={column.numberOfLines || 1}>
                          {renderDefaultCell(record, column)}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              );

              if (!onRowPress) {
                return <View key={rowKey}>{rowContent}</View>;
              }

              return (
                <TouchableOpacity
                  key={rowKey}
                  activeOpacity={0.86}
                  onPress={() => onRowPress(record, rowIndex)}
                >
                  {rowContent}
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="file-tray-outline" size={24} color="#94A3B8" />
              <Text style={styles.emptyTitle}>{emptyTitle}</Text>
              <Text style={styles.emptyMessage}>{emptyMessage}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {pagination ? <TablePagination {...pagination} /> : null}
    </View>
  );
}

export function TablePagination({
  page = 1,
  totalPages = 1,
  total = 0,
  pageSize,
  onPrevious,
  onNext,
}) {
  const safeTotalPages = Math.max(1, Number(totalPages) || 1);
  const safePage = Math.min(Math.max(1, Number(page) || 1), safeTotalPages);
  const start = pageSize ? (safePage - 1) * pageSize + 1 : null;
  const end = pageSize ? Math.min(total, safePage * pageSize) : null;

  return (
    <View style={styles.paginationRow}>
      <Text style={styles.paginationInfo}>
        {pageSize && total
          ? `Showing ${start}-${end} of ${total}`
          : `Page ${safePage} of ${safeTotalPages}`}
      </Text>
      <View style={styles.paginationActions}>
        <TouchableOpacity
          style={[styles.paginationButton, safePage <= 1 && styles.paginationButtonDisabled]}
          onPress={onPrevious}
          disabled={safePage <= 1}
          activeOpacity={0.84}
        >
          <Ionicons name="chevron-back" size={16} color={safePage <= 1 ? "#94A3B8" : "#0A3D91"} />
          <Text style={[styles.paginationButtonText, safePage <= 1 && styles.paginationButtonTextDisabled]}>
            Prev
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.paginationButton, safePage >= safeTotalPages && styles.paginationButtonDisabled]}
          onPress={onNext}
          disabled={safePage >= safeTotalPages}
          activeOpacity={0.84}
        >
          <Text
            style={[
              styles.paginationButtonText,
              safePage >= safeTotalPages && styles.paginationButtonTextDisabled,
            ]}
          >
            Next
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={safePage >= safeTotalPages ? "#94A3B8" : "#0A3D91"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      web: { boxShadow: "0px 12px 28px rgba(15, 23, 42, 0.06)" },
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 18,
      },
      android: { elevation: 2 },
    }),
  },
  table: {
    minWidth: 720,
    width: "100%",
  },
  headerRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FBFE",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerCell: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  headerText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
  },
  row: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
  },
  altRow: {
    backgroundColor: "#FBFDFF",
  },
  cell: {
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  cellText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },
  alignRight: {
    alignItems: "flex-end",
  },
  alignCenter: {
    alignItems: "center",
  },
  emptyState: {
    minHeight: 170,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  emptyMessage: {
    maxWidth: 320,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },
  paginationRow: {
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  paginationInfo: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  paginationActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  paginationButton: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EEF5FF",
  },
  paginationButtonDisabled: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
  },
  paginationButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0A3D91",
  },
  paginationButtonTextDisabled: {
    color: "#94A3B8",
  },
});
