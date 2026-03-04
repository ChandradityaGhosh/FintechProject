import React, { useMemo, useState } from "react";
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Contacts from "expo-contacts";
import { api } from "./src/api/client";

const roleTabs = ["admin", "teacher", "guardian", "student"];

export default function App() {
  const [token, setToken] = useState("");
  const [role, setRole] = useState("guardian");
  const [email, setEmail] = useState("guardian@school.local");
  const [password, setPassword] = useState("guardian123");
  const [studentId, setStudentId] = useState("s-1");
  const [status, setStatus] = useState(null);
  const [posts, setPosts] = useState([]);
  const [buses, setBuses] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [audienceType, setAudienceType] = useState("class");
  const [audience, setAudience] = useState("Class 8-A");

  const actions = useMemo(
    () => ({
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }),
    [token]
  );

  const login = async () => {
    try {
      const data = await api.post("/auth/login", { email, password });
      setToken(data.token);
      setRole(data.role);
      if (data.linkedStudentId) setStudentId(data.linkedStudentId);
      Alert.alert("Login success", `Role: ${data.role}`);
    } catch (e) {
      Alert.alert("Login failed", String(e.message));
    }
  };

  const loadPayments = async () => {
    const data = await api.get(`/payments/status/${studentId}`, actions.headers);
    setStatus(data);
  };

  const loadPosts = async () => setPosts(await api.get("/posts", actions.headers));
  const loadBuses = async () => setBuses(await api.get("/buses", actions.headers));

  const createTeacherPost = async () => {
    const image = selectedImage || null;
    await api.post(
      "/posts",
      {
        title: "Class Activity",
        content: "Students completed science project today.",
        imageUrl: image,
        audienceType,
        audience: audience.split(",").map((v) => v.trim())
      },
      actions.headers
    );
    Alert.alert("Submitted", "Post sent for admin approval");
  };

  const approveFirstPost = async () => {
    if (posts.length === 0) return;
    await api.post(`/posts/${posts[0].id}/approve`, {}, actions.headers);
    Alert.alert("Approved", posts[0].title);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert("Permission required", "Please allow photo access.");
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) setSelectedImage(result.assets[0].uri);
  };

  const shareContacts = async () => {
    const p = await Contacts.requestPermissionsAsync();
    if (p.status !== "granted") return Alert.alert("Permission required", "Contacts permission denied.");
    const data = await Contacts.getContactsAsync({ fields: [Contacts.Fields.PhoneNumbers] });
    await api.post(
      "/contacts/consent-upload",
      {
        consentGranted: true,
        contacts: data.data.slice(0, 10).map((c) => ({ name: c.name, phone: c.phoneNumbers?.[0]?.number || "" }))
      },
      actions.headers
    );
    Alert.alert("Uploaded", "Contacts shared with explicit consent");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>School Management Mobile App (Expo)</Text>

        <View style={styles.card}>
          <Text style={styles.title}>Login</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" />
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" />
          <TouchableOpacity style={styles.button} onPress={login}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <Text style={styles.meta}>Current role: {role}</Text>
          <View style={styles.tabRow}>
            {roleTabs.map((item) => (
              <Text key={item} style={[styles.tab, item === role && styles.activeTab]}>
                {item}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Payments Dashboard (Guardian/Student/Admin)</Text>
          <TouchableOpacity style={styles.button} onPress={loadPayments}>
            <Text style={styles.buttonText}>Load Payment Status</Text>
          </TouchableOpacity>
          {status && <Text style={styles.meta}>Due: ₹{status.totalDue} | Paid: ₹{status.paid}</Text>}
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Teacher Posts + Admin Approval</Text>
          <TextInput style={styles.input} value={audienceType} onChangeText={setAudienceType} placeholder="audienceType: class|student|school" />
          <TextInput style={styles.input} value={audience} onChangeText={setAudience} placeholder="audience comma separated" />
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>Pick Photo (Teacher)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={createTeacherPost}>
            <Text style={styles.buttonText}>Submit Post for Approval</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={loadPosts}>
            <Text style={styles.buttonText}>Load Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={approveFirstPost}>
            <Text style={styles.buttonText}>Approve First Post (Admin)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Bus Monitoring</Text>
          <TouchableOpacity style={styles.button} onPress={loadBuses}>
            <Text style={styles.buttonText}>Fetch Live Bus + ETA</Text>
          </TouchableOpacity>
          {buses.map((bus) => (
            <Text key={bus.id} style={styles.meta}>
              {bus.name}: ETA {bus.etaMinutes ?? "-"} min, {bus.distanceKm ?? "-"} km away
            </Text>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Optional Contact Sharing (Consent Driven)</Text>
          <TouchableOpacity style={styles.button} onPress={shareContacts}>
            <Text style={styles.buttonText}>Share Contacts with Consent</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7ff" },
  content: { padding: 16, gap: 12 },
  heading: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  card: { backgroundColor: "white", borderRadius: 12, padding: 12, gap: 8, elevation: 2 },
  title: { fontSize: 16, fontWeight: "700" },
  input: { borderWidth: 1, borderColor: "#ccd", borderRadius: 8, padding: 10 },
  button: { backgroundColor: "#2244dd", borderRadius: 8, padding: 10 },
  buttonText: { color: "white", fontWeight: "700" },
  meta: { color: "#333", fontSize: 13 },
  tabRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  tab: { borderWidth: 1, borderColor: "#ccd", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  activeTab: { backgroundColor: "#dbe3ff", borderColor: "#2244dd" }
});
