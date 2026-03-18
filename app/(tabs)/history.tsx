import { useFocusEffect } from "expo-router";
import { useCallback, useMemo } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

import Screen from "@/components/Screen";
import {
  formatDuration,
  formatTime,
  useSystem,
} from "../../contexts/SystemContext";

export default function HistoryScreen() {
  const { history, reloadHistory, reloadAlters } = useSystem();

  useFocusEffect(
    useCallback(() => {
      reloadHistory();
      reloadAlters();
    }, [reloadHistory, reloadAlters])
  );

  const groupedHistory = useMemo(() => {
    return history.reduce((acc, entry) => {
      const existingDay = acc.find((day) => day.date === entry.date);

      if (existingDay) {
        existingDay.entries.push(entry);
      } else {
        acc.push({
          date: entry.date,
          entries: [entry],
        });
      }

      return acc;
    }, [] as { date: string; entries: typeof history }[]);
  }, [history]);

  return (
    <Screen style={styles.screen}>
      <Text style={styles.title}>History</Text>

      <FlatList
        data={groupedHistory}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No front history yet.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.daySection}>
            <Text style={styles.dayTitle}>{item.date}</Text>

            {item.entries.map((entry) => {
              const name = entry.name ?? "Unknown Alter";
              const avatar = entry.avatar || "https://placehold.co/100";

              return (
                <View key={entry.id} style={styles.card}>
                  <Image source={{ uri: avatar }} style={styles.avatar} />

                  <View style={styles.cardText}>
                    <Text style={styles.name}>{name}</Text>

                    {entry.allDay ? (
                      <Text style={styles.subtext}>Fronted all day</Text>
                    ) : entry.end ? (
                      <>
                        <Text style={styles.subtext}>
                          Fronted {formatDuration(entry.start, entry.end)}
                        </Text>
                        <Text style={styles.subtext}>
                          from {formatTime(entry.start)} to {formatTime(entry.end)}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.subtext}>Currently fronting</Text>
                        <Text style={styles.subtext}>
                          since {formatTime(entry.start)}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      />
    </Screen>
  );
}

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
  listContent: {
    paddingBottom: 24,
  },
  emptyText: {
    opacity: 0.7,
    marginTop: 12,
  },
  daySection: {
    marginBottom: 20,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
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
});