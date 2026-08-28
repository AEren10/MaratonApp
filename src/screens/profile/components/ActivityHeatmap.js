import { useEffect, useState, useCallback } from "react";
import { View, Text } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { useAuth } from "../../../contexts/AuthContext";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { getStudyLogs } from "../../../supabase/studyLogs";

const CELL_GAP = 4;
const WEEKDAYS = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pa"];

function intensityColor(count, accent) {
  if (count === 0) return accent + "14";
  if (count === 1) return accent + "40";
  if (count === 2) return accent + "70";
  if (count <= 4) return accent + "AA";
  return accent;
}

export function ActivityHeatmap() {
  const C = useC();
  const { user } = useAuth();
  const [activeDays, setActiveDays] = useState({});
  const [activeCount, setActiveCount] = useState(0);
  const [gridWidth, setGridWidth] = useState(0);

  const load = useCallback(async () => {
    if (!user?.id || user.id === "dev") return;
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString().slice(0, 10);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString().slice(0, 10);
    try {
      const logs = await getStudyLogs(user.id, { from, to });
      const map = {};
      logs.forEach((l) => {
        const d = (l.study_date || l.created_at || "").slice(0, 10);
        if (d) map[d] = (map[d] || 0) + 1;
      });
      setActiveDays(map);
      setActiveCount(Object.keys(map).length);
    } catch {}
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstWeekday = (new Date(now.getFullYear(), now.getMonth(), 1).getDay() + 6) % 7;

  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${year}-${month}-${String(day).padStart(2, "0")}`;
      return { day, count: activeDays[dateStr] || 0 };
    }),
  ];
  const rowCount = Math.ceil(cells.length / 7);
  const rows = Array.from({ length: rowCount }, (_, r) => cells.slice(r * 7, r * 7 + 7));

  const cellSize = gridWidth > 0 ? (gridWidth - CELL_GAP * 6) / 7 : 0;

  return (
    <View style={{ marginBottom: SPACING.xxl }}>
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: SPACING.md,
        paddingHorizontal: SPACING.xs,
      }}>
        <Text style={[TYPOGRAPHY.label, { color: C.sec, letterSpacing: 1.3 }]}>
          BU AYKİ AKTİVİTEN
        </Text>
        <Text style={{ ...TYPOGRAPHY.caption, color: C.muted }}>
          {activeCount} aktif gün
        </Text>
      </View>

      <View onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}>
        <View style={{ flexDirection: "row", gap: CELL_GAP, marginBottom: CELL_GAP }}>
          {WEEKDAYS.map((d) => (
            <Text
              key={d}
              style={{
                ...TYPOGRAPHY.caption,
                color: C.muted,
                width: cellSize,
                textAlign: "center",
              }}
            >
              {d}
            </Text>
          ))}
        </View>

        {cellSize > 0 && rows.map((row, ri) => (
          <View key={ri} style={{ flexDirection: "row", gap: CELL_GAP, marginBottom: CELL_GAP }}>
            {Array.from({ length: 7 }, (_, ci) => {
              const cell = row[ci];
              return (
                <View
                  key={ci}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    borderRadius: RADIUS.sm,
                    backgroundColor: cell
                      ? intensityColor(cell.count, C.accent)
                      : "transparent",
                  }}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
