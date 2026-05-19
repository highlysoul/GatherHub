import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../services/api";

export default function Participants() {
  const params = useLocalSearchParams();

  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
  try {
    setLoading(true);

    const { data: participantsData, error: participantsError } =
      await supabase
        .from("event_participants")
        .select("*")
        .eq("event_id", Number(params.eventId));

    if (participantsError) {
      console.log("Participants error:", participantsError);
      setParticipants([]);
      return;
    }

    if (!participantsData || participantsData.length === 0) {
      setParticipants([]);
      return;
    }

    const userIds = participantsData.map((p: any) => p.user_id);

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds);

    const { data: ticketsData } = await supabase
      .from("tickets")
      .select("*")
      .eq("event_id", Number(params.eventId));

    const mergedData = participantsData.map((participant: any, index: number) => {
      const profile = profilesData?.find(
        (p: any) => String(p.id) === String(participant.user_id)
      );
      const ticket = ticketsData?.find(
        (t: any) => String(t.user_id) === String(participant.user_id)
      );

      return {
        ...participant,
        full_name: profile?.full_name || profile?.email || ticket?.user_email || `Participant ${index + 1}`,
        email: profile?.email || ticket?.user_email || "-",
        ticket_code: ticket?.ticket_code || "-",
        status: ticket?.status || "active",
      };
    });

    setParticipants(mergedData);
  } catch (error) {
    console.log("Fetch participants catch:", error);
    setParticipants([]);
  } finally {
    setLoading(false);
  }
};

  const exportCSV = async () => {
    try {
      if (participants.length === 0) {
        Alert.alert("No Data", "There are no participants to export.");
        return;
      }

      let csv = "No,Name,Email,Ticket Code,Status,Joined At\n";

      participants.forEach((item: any, index: number) => {
        csv += `${index + 1},"${item.full_name}","${item.email}","${
          item.ticket_code
        }","${item.status}","${new Date(item.joined_at).toLocaleString()}"\n`;
      });

      const fileUri = `${FileSystem.documentDirectory}${params.eventName}-participants.csv`;

      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: "utf8",
      });

      const canShare = await Sharing.isAvailableAsync();

      if (!canShare) {
        Alert.alert("Success", "CSV file created successfully.");
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: "text/csv",
        dialogTitle: "Export Participants CSV",
        UTI: "public.comma-separated-values-text",
      });
    } catch (error) {
      console.log("Export CSV error:", error);
      Alert.alert("Error", "Failed to export CSV.");
    }
  };

  // GANTI renderItem dengan kode ini

  const renderItem = ({ item, index }: any) => (
    <View style={styles.card}>
      <Text style={styles.name}>
        {index + 1}. {item.full_name}
      </Text>

      <Text style={styles.detail}>Email: {item.email}</Text>

      <Text style={styles.detail}>Ticket Code: {item.ticket_code}</Text>

      <Text style={styles.detail}>Status: {item.status}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Participants</Text>

        <View style={{ width: 38 }} />
      </View>

      {/* EVENT NAME */}
      <Text style={styles.eventName}>{params.eventName}</Text>

      {/* TOTAL */}
      <Text style={styles.total}>
        Total Participants: {participants.length}
      </Text>

      {/* EXPORT BUTTON */}
      {participants.length > 0 && (
        <TouchableOpacity
          onPress={exportCSV}
          style={{
            marginHorizontal: 20,
            marginBottom: 16,
          }}
        >
          <LinearGradient
            colors={["#A9E5BC", "#3FA16F"]}
            style={styles.exportButton}
          >
            <Ionicons
              name="download-outline"
              size={18}
              color="#fff"
              style={{
                marginRight: 8,
              }}
            />
            <Text style={styles.exportText}>Export CSV</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* CONTENT */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : participants.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={70} color="#A9E5BC" />
          <Text style={styles.emptyTitle}>No Participants Yet</Text>
          <Text style={styles.emptyText}>
            No one has purchased tickets for this event.
          </Text>
        </View>
      ) : (
        <FlatList
          data={participants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 30,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2F6B4F",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  eventName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },

  total: {
    color: "#D1FAE5",
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
  },

  exportButton: {
    height: 52,
    borderRadius: 999,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  exportText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  },

  name: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 6,
  },

  detail: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 2,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },

  emptyText: {
    color: "#D1FAE5",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
});
