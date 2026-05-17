import {
  MONITORING_MAP_LABELS,
  MONITORING_MAP_OFFICES,
  MONITORING_MAP_OFFICE_POSITIONS,
} from "./monitoringMapConfig";

export const formatRoomMapLabelText = (roomId, roomName) => {
  const labelText = String(roomName || "").trim();
  if (roomId === "ground-storage-small" && labelText.toLowerCase() === "storage room") {
    return "Storage\nRoom";
  }
  return labelText;
};

export const normalizeMapRooms = (rooms = [], { includeDefaultMissing = false } = {}) => {
  const parsedRooms = Array.isArray(rooms) ? rooms : [];
  const validRooms = parsedRooms
    .map((room) => ({
      id: String(room?.id || "").trim(),
      name: String(room?.name || "").trim(),
      floor: String(room?.floor || "").trim(),
      icon: String(room?.icon || "business-outline").trim() || "business-outline",
    }))
    .filter((room) => room.id && room.name && room.floor);

  if (validRooms.length === 0) {
    return MONITORING_MAP_OFFICES;
  }

  if (!includeDefaultMissing) {
    return validRooms;
  }

  const savedRoomIds = new Set(validRooms.map((room) => room.id));
  const newDefaultRooms = MONITORING_MAP_OFFICES.filter((room) => !savedRoomIds.has(room.id));
  return [...validRooms, ...newDefaultRooms];
};

export const normalizeMapRoomPositions = (positions = {}, { includeDefaultMissing = false } = {}) => {
  const source = positions && typeof positions === "object" ? positions : {};
  const normalizedPositions = Object.entries(source).reduce((nextPositions, [roomId, position]) => {
    const x = Number(position?.x);
    const y = Number(position?.y);
    if (roomId && Number.isFinite(x) && Number.isFinite(y)) {
      nextPositions[roomId] = {
        x: Math.max(0, Math.min(100, Math.round(x * 10) / 10)),
        y: Math.max(0, Math.min(100, Math.round(y * 10) / 10)),
      };
    }
    return nextPositions;
  }, {});

  if (!includeDefaultMissing) {
    return normalizedPositions;
  }

  return {
    ...MONITORING_MAP_OFFICE_POSITIONS,
    ...normalizedPositions,
  };
};

export const normalizeMapSettingsPayload = (payload = {}) => {
  const source = payload?.mapSettings || payload?.settings || payload || {};
  const hasSavedRooms = Array.isArray(source.rooms) && source.rooms.length > 0;
  const hasSavedPositions =
    (source.roomPositions && typeof source.roomPositions === "object" && Object.keys(source.roomPositions).length > 0) ||
    (source.positions && typeof source.positions === "object" && Object.keys(source.positions).length > 0);
  return {
    rooms: normalizeMapRooms(source.rooms, { includeDefaultMissing: !hasSavedRooms }),
    roomPositions: normalizeMapRoomPositions(source.roomPositions || source.positions, {
      includeDefaultMissing: !hasSavedPositions,
    }),
  };
};

export const buildManagedMapLabels = (rooms = MONITORING_MAP_OFFICES, roomPositions = MONITORING_MAP_OFFICE_POSITIONS) => {
  const roomNameById = normalizeMapRooms(rooms).reduce((lookup, room) => {
    if (room?.id && room?.name) {
      lookup[room.id] = formatRoomMapLabelText(room.id, room.name);
    }
    return lookup;
  }, {});

  return Object.entries(MONITORING_MAP_LABELS).reduce((nextLabels, [floorId, labels]) => {
    nextLabels[floorId] = labels.map((label) => {
      const renamedText = roomNameById[label.id];
      const position = roomPositions?.[label.id];
      return {
        ...label,
        ...(renamedText ? { text: renamedText } : null),
        ...(position
          ? {
              x: Number(position.x),
              y: Number(position.y),
            }
          : null),
      };
    });
    return nextLabels;
  }, {});
};
