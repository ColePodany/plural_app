import { FlashList } from "@shopify/flash-list";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import Screen from "@/components/Screen";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  formatDuration,
  formatTime,
  useSystem,
} from "../../contexts/SystemContext";

/* -------- MEMOIZED ROW -------- */
const HistoryItem = React.memo(({ item }: any) => {
  if (item.type === "header") {
    return <Text style={styles.dayTitle}>{item.date}</Text>;
  }

  const name = item.name ?? "Unknown Alter";
  const avatar = item.avatar || "https://placehold.co/100";

  return (
    <View style={styles.card}>
      <Image source={{ uri: avatar }} style={styles.avatar} />

      <View style={styles.cardText}>
        <Text style={styles.name}>{name}</Text>

        {item.allDay ? (
          <Text style={styles.subtext}>Fronted all day</Text>
        ) : item.end ? (
          <>
            <Text style={styles.subtext}>
              Fronted {formatDuration(item.start, item.end)}
            </Text>
            <Text style={styles.subtext}>
              from {formatTime(item.start)} to{" "}
              {formatTime(item.end)}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.subtext}>Currently fronting</Text>
            <Text style={styles.subtext}>
              since {formatTime(item.start)}
            </Text>
          </>
        )}
      </View>
    </View>
  );
});

export default function HistoryScreen() {
  const { history, reloadHistoryRange, reloadAlters } = useSystem();

const [startDate, setStartDate] = useState(() => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
});

const [endDate, setEndDate] = useState(new Date());

const [pickerMode, setPickerMode] = useState<"start" | "end" | null>(null);


const getRange = () => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

useFocusEffect(
  useCallback(() => {
    const load = async () => {
      const { start, end } = getRange();
      await reloadAlters();
      await reloadHistoryRange(start, end);
    };

    load();
  }, [startDate, endDate])
);

  /* -------- LABEL -------- */
  const { start, end } = getRange();
  const label = `${start.toDateString()} → ${end.toDateString()}`;

  /* -------- FLATTEN -------- */
  const flatData = useMemo(() => {
    const sorted = [...history].sort(
      (a, b) =>
        new Date(b.end ?? b.start).getTime() -
        new Date(a.end ?? a.start).getTime()
    );

    const result: any[] = [];
    let currentDate = "";

    for (const entry of sorted) {
      if (entry.date !== currentDate) {
        currentDate = entry.date;
        result.push({ type: "header", date: currentDate });
      }

      result.push({ type: "entry", ...entry });
    }

    return result;
  }, [history]);

  const renderItem = useCallback(({ item }: any) => {
    return <HistoryItem item={item} />;
  }, []);

  return (
    <Screen style={styles.screen}>
      <Text style={styles.title}>History</Text>



      <View style={styles.navRow}>
  <Text onPress={() => setPickerMode("start")}>
    {startDate.toDateString()}
  </Text>

  <Text> → </Text>

  <Text onPress={() => setPickerMode("end")}>
    {endDate.toDateString()}
  </Text>
</View>

{pickerMode && (
  <DateTimePicker
    value={pickerMode === "start" ? startDate : endDate}
    mode="date"
    display="calendar"
    onChange={(event, date) => {
      if (event.type === "dismissed") {
        setPickerMode(null);
        return;
      }

      if (date) {
        if (pickerMode === "start") {
          setStartDate(date);

          // prevent invalid range
          if (date > endDate) setEndDate(date);
        } else {
          setEndDate(date);

          if (date < startDate) setStartDate(date);
        }
      }

      setPickerMode(null);
    }}
  />
)}


      <FlashList
        data={flatData}
        renderItem={renderItem}
        keyExtractor={(item) =>
          item.type === "header" ? item.date : item.id
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No front history yet.</Text>
        }
      />
    </Screen>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  emptyText: {
    opacity: 0.7,
    marginTop: 12,
    textAlign: "center",
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#555",
    marginRight: 12,
  },
  cardText: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtext: {
    opacity: 0.75,
    marginTop: 2,
  },
  presetRow: {
  flexDirection: "row",
  justifyContent: "space-around",
  marginBottom: 10,
},
});