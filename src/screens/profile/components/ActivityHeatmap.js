import { useEffect, useState, useCallback } from "react";
import { View, Text } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { useAuth } from "../../../contexts/AuthContext";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { getStudyLogs } from "../../../supabase/studyLogs";

const CELL_SIZE = 10;
const CELL_GAP = 3;

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
  const cols = Math.ceil(daysInMonth / 7);
  const columns = Array.from({ length: cols }, (_, col) =>
    Array.from({ length: 7 }, (_, row) => {
      const day = col * 7 + row + 1;
      if (day > daysInMonth) return null;
      const dateStr = `${year}-${month}-${String(day).padStart(2, "0")}`;
      return { day, count: activeDays[dateStr] || 0 };
    })
  );

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
          BU AYIKI AKTİVİTEN
        </Text>
        <Text style={{ ...TYPOGRAPHY.caption, color: C.muted }}>
          {activeCount} aktif gün
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: CELL_GAP }}>
        {columns.map((col, ci) => (
          <View key={ci} style={{ gap: CELL_GAP }}>
            {col.map((cell, ri) => (
              <View
                key={ri}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  borderRadius: 3,
                  backgroundColor: cell
                    ? intensityColor(cell.count, C.accent)
                    : "transparent",
                }}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
