import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Image,
  Platform,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const CHILD_PROFILE_KEY = "bitzaChildProfile";
const EXTRA_CHILD_PROFILES_KEY = "bitzaChildProfiles";

const childHeader = require("../assets/icons/child-profile-header-illustration.png");

const months = [
  { label: "January", value: "01" },
  { label: "February", value: "02" },
  { label: "March", value: "03" },
  { label: "April", value: "04" },
  { label: "May", value: "05" },
  { label: "June", value: "06" },
  { label: "July", value: "07" },
  { label: "August", value: "08" },
  { label: "September", value: "09" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

const communicationOptions = [
  "Verbal",
  "Mostly verbal",
  "Uses short phrases",
  "Minimally speaking",
  "Nonverbal",
  "Uses gestures",
  "Uses pointing",
  "Uses PECS / picture cards",
  "Uses AAC device",
  "Uses sign language",
  "Uses sounds / vocalizations",
  "Uses behavior to communicate needs",
  "Mixed communication style",
  "Other / Custom",
  "Prefer not to add yet",
];

function calculateAgeFromDob(dob) {
  if (!dob) return "";

  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age >= 0 ? String(age) : "";
}

export default function ChildProfileSetupScreen({ navigation, route }) {
  const childIndex = route?.params?.childIndex || 0;
  const isAddingExtraChild = childIndex > 0;

  const [childName, setChildName] = useState("");
  const [dob, setDob] = useState("");
  const [communicationStyle, setCommunicationStyle] = useState("");
  const [customCommunication, setCustomCommunication] = useState("");

  const [isCustomCommunicationOpen, setIsCustomCommunicationOpen] =
    useState(false);

  const [dobModalVisible, setDobModalVisible] = useState(false);
  const [communicationModalVisible, setCommunicationModalVisible] =
    useState(false);

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const list = [];

    for (let year = currentYear; year >= currentYear - 25; year -= 1) {
      list.push(String(year));
    }

    return list;
  }, []);

  const days = useMemo(() => {
    const list = [];

    for (let day = 1; day <= 31; day += 1) {
      list.push(String(day).padStart(2, "0"));
    }

    return list;
  }, []);

  const dobDisplay = useMemo(() => {
    if (!dob) return "";

    const [year, month, day] = dob.split("-");
    const monthName = months.find((item) => item.value === month)?.label;

    return `${monthName} ${Number(day)}, ${year}`;
  }, [dob]);

  const calculatedAge = useMemo(() => calculateAgeFromDob(dob), [dob]);

  const saveDob = () => {
    if (!selectedMonth || !selectedDay || !selectedYear) {
      Alert.alert("Almost there", "Please choose a month, day, and year.");
      return;
    }

    const selectedDate = new Date(
      Number(selectedYear),
      Number(selectedMonth) - 1,
      Number(selectedDay)
    );

    const isValidDate =
      selectedDate.getFullYear() === Number(selectedYear) &&
      selectedDate.getMonth() === Number(selectedMonth) - 1 &&
      selectedDate.getDate() === Number(selectedDay);

    if (!isValidDate) {
      Alert.alert("Check the date", "That date doesn’t look quite right.");
      return;
    }

    const today = new Date();

    if (selectedDate > today) {
      Alert.alert("Check the date", "Birthdate cannot be in the future.");
      return;
    }

    setDob(`${selectedYear}-${selectedMonth}-${selectedDay}`);
    setDobModalVisible(false);
  };

  const clearDob = () => {
    setDob("");
    setSelectedMonth("");
    setSelectedDay("");
    setSelectedYear("");
    setDobModalVisible(false);
  };

  const openCommunicationModal = () => {
    setCommunicationModalVisible(true);

    if (
      communicationStyle &&
      !communicationOptions.includes(communicationStyle)
    ) {
      setIsCustomCommunicationOpen(true);
      setCustomCommunication(communicationStyle);
    }
  };

  const chooseCommunication = (option) => {
    if (option === "Other / Custom") {
      setCommunicationStyle("Other / Custom");
      setIsCustomCommunicationOpen(true);
      return;
    }

    setCommunicationStyle(option);
    setCustomCommunication("");
    setIsCustomCommunicationOpen(false);
    setCommunicationModalVisible(false);
  };

  const saveCustomCommunication = () => {
    const trimmed = customCommunication.trim();

    if (!trimmed) {
      Alert.alert("Add a custom style", "Type how your child communicates.");
      return;
    }

    setCommunicationStyle(trimmed);
    setIsCustomCommunicationOpen(false);
    setCommunicationModalVisible(false);
  };

  const closeCommunicationModal = () => {
    if (communicationStyle === "Other / Custom") {
      setCommunicationStyle("");
    }

    setIsCustomCommunicationOpen(false);
    setCommunicationModalVisible(false);
  };

  const buildChildProfile = () => {
    const finalCommunication =
      communicationStyle === "Prefer not to add yet" ||
      communicationStyle === "Other / Custom" ||
      !communicationStyle
        ? "Not added yet"
        : communicationStyle;

    return {
      childName: childName.trim() || "Child 1",
      age: calculatedAge || "",
      dob: dob || "",
      communicationStyle: finalCommunication,
      avatar: "01",
      supportNeeds: [],
      notes: "",
      updatedAt: new Date().toISOString(),
    };
  };

  const saveExtraChildProfile = async (childProfile) => {
    const savedExtras = await AsyncStorage.getItem(EXTRA_CHILD_PROFILES_KEY);
    const extras = savedExtras ? JSON.parse(savedExtras) : [];

    extras[childIndex - 1] = childProfile;

    await AsyncStorage.setItem(
      EXTRA_CHILD_PROFILES_KEY,
      JSON.stringify(extras.filter(Boolean))
    );
  };

  const handleContinue = async () => {
    const childProfile = buildChildProfile();

    try {
      if (isAddingExtraChild) {
        await saveExtraChildProfile(childProfile);
        navigation.navigate("ChildrenList");
        return;
      }

      await AsyncStorage.setItem(
        CHILD_PROFILE_KEY,
        JSON.stringify(childProfile)
      );

      navigation.navigate("SensorySupport");
    } catch (error) {
      console.log("Error saving child profile:", error);
      Alert.alert("Oops", "Something went wrong. Please try again.");
    }
  };

  const handleSkip = async () => {
    const childProfile = {
      childName: "Child 1",
      age: "",
      dob: "",
      communicationStyle: "Not added yet",
      avatar: "01",
      supportNeeds: [],
      notes: "",
      updatedAt: new Date().toISOString(),
    };

    try {
      if (isAddingExtraChild) {
        navigation.navigate("ChildrenList");
        return;
      }

      await AsyncStorage.setItem(
        CHILD_PROFILE_KEY,
        JSON.stringify(childProfile)
      );

      navigation.navigate("SensorySupport");
    } catch (error) {
      console.log("Error skipping child profile:", error);
      navigation.navigate("SensorySupport");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9F3" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        {/* Top Row */}
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#2D2357" />
          </TouchableOpacity>

          <View style={styles.brandRow}>
            <Ionicons name="heart" size={24} color="#8C35F6" />
            <Text style={styles.brandText}>
              Bitza<Text style={styles.brandAccent}>Hugs</Text>
            </Text>
          </View>

          <View style={styles.topSpacer} />
        </View>

        {/* Progress */}
        <View style={styles.progressRow}>
          <View style={[styles.progressDot, styles.progressActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>

        <Text style={styles.stepLabel}>Step 1 of 4</Text>

        <Text style={styles.title}>Let's get to know{"\n"}your child</Text>

        <Text style={styles.subtitle}>
          This helps us personalize their experience with care.
        </Text>

        {/* Header illustration */}
        <View style={styles.headerCard}>
          <Image
            source={childHeader}
            style={styles.headerIllustration}
            resizeMode="cover"
          />
        </View>

        {/* Child Name */}
        <View style={styles.formCard}>
          <View style={styles.fieldIconBox}>
            <Ionicons name="person-outline" size={22} color="#8C55F6" />
          </View>

          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>Child's Name</Text>

            <TextInput
              value={childName}
              onChangeText={setChildName}
              placeholder="Enter name"
              placeholderTextColor="#A99BB8"
              style={styles.input}
              returnKeyType="done"
              accessibilityLabel="Child name"
            />
          </View>
        </View>

        {/* Date of Birth */}
        <TouchableOpacity
          style={styles.formCard}
          activeOpacity={0.85}
          onPress={() => setDobModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Date of birth"
          accessibilityHint="Opens date of birth picker"
        >
          <View style={styles.fieldIconBox}>
            <Ionicons name="calendar-outline" size={22} color="#8C55F6" />
          </View>

          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>Date of Birth</Text>

            <View style={styles.fakeInputRow}>
              <Text
                style={[
                  styles.fakeInputText,
                  dob && styles.selectedInputText,
                ]}
                numberOfLines={1}
              >
                {dobDisplay || "You can add this later"}
              </Text>

              <Ionicons name="chevron-down" size={18} color="#2D2357" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Communication Style */}
        <TouchableOpacity
          style={styles.formCard}
          activeOpacity={0.85}
          onPress={openCommunicationModal}
          accessibilityRole="button"
          accessibilityLabel="Communication style"
          accessibilityHint="Opens communication style options"
        >
          <View style={styles.fieldIconBox}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={22}
              color="#8C55F6"
            />
          </View>

          <View style={styles.fieldContent}>
            <Text style={styles.fieldLabel}>Communication Style</Text>

            <View style={styles.fakeInputRow}>
              <Text
                style={[
                  styles.fakeInputText,
                  communicationStyle &&
                    communicationStyle !== "Other / Custom" &&
                    styles.selectedInputText,
                ]}
                numberOfLines={1}
              >
                {communicationStyle && communicationStyle !== "Other / Custom"
                  ? communicationStyle
                  : "You can add this later"}
              </Text>

              <Ionicons name="chevron-down" size={18} color="#2D2357" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Note */}
        <View style={styles.noteCard}>
          <Ionicons name="heart-outline" size={20} color="#8C55F6" />

          <Text style={styles.noteText}>
            You can always edit this later in settings.
          </Text>
        </View>

        {/* Continue */}
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.86}
          onPress={handleContinue}
          accessibilityRole="button"
          accessibilityLabel="Continue"
          accessibilityHint="Saves child profile and continues setup"
        >
          <Text style={styles.buttonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity
          style={styles.skipButton}
          activeOpacity={0.75}
          onPress={handleSkip}
          accessibilityRole="button"
          accessibilityLabel="Skip for now"
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* DOB Modal */}
      <Modal
        visible={dobModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDobModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Date of Birth</Text>

            <Text style={styles.modalSubtitle}>
              Choose your child's birth month, day, and year.
            </Text>

            <View style={styles.pickerColumns}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Month</Text>

                <ScrollView
                  style={styles.pickerScroll}
                  keyboardShouldPersistTaps="always"
                >
                  {months.map((month) => (
                    <TouchableOpacity
                      key={month.value}
                      style={[
                        styles.pickerOption,
                        selectedMonth === month.value &&
                          styles.pickerOptionSelected,
                      ]}
                      onPress={() => setSelectedMonth(month.value)}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          selectedMonth === month.value &&
                            styles.pickerOptionTextSelected,
                        ]}
                      >
                        {month.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumnSmall}>
                <Text style={styles.pickerLabel}>Day</Text>

                <ScrollView
                  style={styles.pickerScroll}
                  keyboardShouldPersistTaps="always"
                >
                  {days.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.pickerOption,
                        selectedDay === day && styles.pickerOptionSelected,
                      ]}
                      onPress={() => setSelectedDay(day)}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          selectedDay === day &&
                            styles.pickerOptionTextSelected,
                        ]}
                      >
                        {Number(day)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumnSmall}>
                <Text style={styles.pickerLabel}>Year</Text>

                <ScrollView
                  style={styles.pickerScroll}
                  keyboardShouldPersistTaps="always"
                >
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.pickerOption,
                        selectedYear === year && styles.pickerOptionSelected,
                      ]}
                      onPress={() => setSelectedYear(year)}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          selectedYear === year &&
                            styles.pickerOptionTextSelected,
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalSecondaryButton}
                onPress={clearDob}
              >
                <Text style={styles.modalSecondaryText}>Add Later</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={saveDob}
              >
                <Text style={styles.modalPrimaryText}>Save</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setDobModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Communication Modal */}
      <Modal
        visible={communicationModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeCommunicationModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Communication Style</Text>

            <Text style={styles.modalSubtitle}>
              Choose what fits best right now.
            </Text>

            {isCustomCommunicationOpen && (
              <View style={styles.customBoxTop}>
                <Text style={styles.customLabel}>
                  Custom communication style
                </Text>

                <TextInput
                  value={customCommunication}
                  onChangeText={setCustomCommunication}
                  placeholder="Type how your child communicates"
                  placeholderTextColor="#A99BB8"
                  style={styles.customInput}
                  autoFocus
                />

                <TouchableOpacity
                  style={styles.customSaveButton}
                  onPress={saveCustomCommunication}
                >
                  <Text style={styles.customSaveText}>
                    Save Custom Style
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <ScrollView
              style={styles.communicationScroll}
              keyboardShouldPersistTaps="always"
            >
              {communicationOptions.map((option) => {
                const selected =
                  communicationStyle === option ||
                  (option === "Other / Custom" &&
                    isCustomCommunicationOpen);

                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.communicationOption,
                      selected && styles.communicationOptionSelected,
                    ]}
                    onPress={() => chooseCommunication(option)}
                  >
                    <Text
                      style={[
                        styles.communicationOptionText,
                        selected && styles.communicationOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>

                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color="#8C35F6"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={closeCommunicationModal}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF9F3",
  },

  scroll: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1E5FF",
    alignItems: "center",
    justifyContent: "center",
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  brandText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#20204F",
  },

  brandAccent: {
    color: "#F1768E",
  },

  topSpacer: {
    width: 44,
  },

  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 4,
  },

  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#D9D4D0",
  },

  progressActive: {
    backgroundColor: "#8C55F6",
    width: 24,
  },

  stepLabel: {
    textAlign: "center",
    color: "#837E96",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 12,
  },

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    color: "#111A4D",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#3C365F",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 14,
  },

  headerCard: {
    width: "100%",
    height: 110,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#F1E5FF",
    marginBottom: 14,
  },

  headerIllustration: {
    width: "100%",
    height: "100%",
  },

  formCard: {
    minHeight: 70,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E7DF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 10,
    shadowColor: "#D8C6B8",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  fieldIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#F3EAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  fieldContent: {
    flex: 1,
    paddingVertical: 10,
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111A4D",
    marginBottom: 6,
  },

  input: {
    height: 34,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#E4D9F0",
    backgroundColor: "#FFF9F3",
    paddingHorizontal: 11,
    fontSize: 14,
    color: "#2D2357",
    fontWeight: "600",
  },

  fakeInputRow: {
    height: 34,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#E4D9F0",
    backgroundColor: "#FFF9F3",
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  fakeInputText: {
    flex: 1,
    fontSize: 14,
    color: "#A99BB8",
    fontWeight: "600",
    marginRight: 6,
  },

  selectedInputText: {
    color: "#2D2357",
  },

  noteCard: {
    borderRadius: 16,
    backgroundColor: "#F5E9FF",
    borderWidth: 1,
    borderColor: "#E4CFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    gap: 10,
  },

  noteText: {
    flex: 1,
    fontSize: 13,
    color: "#3C365F",
    fontWeight: "600",
  },

  button: {
    width: "100%",
    height: 58,
    borderRadius: 22,
    backgroundColor: "#8C35F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#8C55F6",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    marginBottom: 12,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  skipButton: {
    alignItems: "center",
    paddingVertical: 8,
  },

  skipText: {
    color: "#837E96",
    fontSize: 13,
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(45,35,87,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  modalCard: {
    width: "100%",
    maxHeight: "84%",
    borderRadius: 28,
    backgroundColor: "#FFF9F3",
    padding: 18,
    borderWidth: 1,
    borderColor: "#E4CFFF",
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111A4D",
    marginBottom: 4,
  },

  modalSubtitle: {
    fontSize: 13,
    color: "#6C6284",
    fontWeight: "600",
    marginBottom: 14,
  },

  pickerColumns: {
    flexDirection: "row",
    gap: 8,
  },

  pickerColumn: {
    flex: 1.35,
  },

  pickerColumnSmall: {
    flex: 1,
  },

  pickerLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: "#4F3B68",
    marginBottom: 6,
    textAlign: "center",
  },

  pickerScroll: {
    height: 220,
  },

  pickerOption: {
    minHeight: 40,
    borderRadius: 13,
    backgroundColor: "#F3EAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    paddingHorizontal: 6,
  },

  pickerOptionSelected: {
    backgroundColor: "#8C35F6",
  },

  pickerOptionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#4F3B68",
    textAlign: "center",
  },

  pickerOptionTextSelected: {
    color: "#FFFFFF",
  },

  modalButtonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  modalSecondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F3EAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  modalSecondaryText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#6F4BCB",
  },

  modalPrimaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#8C35F6",
    alignItems: "center",
    justifyContent: "center",
  },

  modalPrimaryText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  modalCancelButton: {
    height: 46,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E4D9F0",
  },

  modalCancelText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#4F3B68",
  },

  communicationScroll: {
    maxHeight: 340,
  },

  communicationOption: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E7DF",
    paddingHorizontal: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  communicationOptionSelected: {
    backgroundColor: "#F3EAFE",
    borderColor: "#B99AE8",
  },

  communicationOptionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    color: "#4F3B68",
    marginRight: 8,
  },

  communicationOptionTextSelected: {
    color: "#2D2357",
    fontWeight: "900",
  },

  customBoxTop: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E4D9F0",
    marginBottom: 10,
  },

  customLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111A4D",
    marginBottom: 7,
  },

  customInput: {
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E4D9F0",
    backgroundColor: "#FFF9F3",
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#2D2357",
    fontWeight: "600",
    marginBottom: 8,
  },

  customSaveButton: {
    height: 44,
    borderRadius: 14,
    backgroundColor: "#8C35F6",
    alignItems: "center",
    justifyContent: "center",
  },

  customSaveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});