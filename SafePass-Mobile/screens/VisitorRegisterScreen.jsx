import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import visitorRegisterStyles from "../styles/VisitorRegisterStyles";
import ApiService from "../utils/ApiService";
import IDScannerService from "../utils/IDScannerService";

let DateTimePickerComponent = null;
if (Platform.OS !== 'web') {
  try {
    const DateTimePickerModule = require('@react-native-community/datetimepicker');
    DateTimePickerComponent = DateTimePickerModule.default;
  } catch (error) {
    console.warn('DateTimePicker not available:', error);
  }
}

const purposeOptions = [
  "Meeting with Staff",
  "Maintenance Work",
  "Package Delivery",
  "Guest Visit",
  "Tour of Campus",
  "Emergency",
  "Interview",
  "Event Participation",
  "Other"
];

// ================= SUCCESS MODAL COMPONENT =================
const SuccessModal = ({ visible, credentials, onConfirm }) => {
  const handleCopy = (text, type) => {
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(text);
    }
    Alert.alert("Copied", `${type} copied to clipboard`);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onConfirm}>
      <View style={visitorRegisterStyles.modalOverlay}>
        <View style={visitorRegisterStyles.successModalContainer}>
          <View style={visitorRegisterStyles.successIconContainer}>
            <LinearGradient colors={['#10B981', '#059669']} style={visitorRegisterStyles.successIconGradient}>
              <Ionicons name="checkmark-done" size={48} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Text style={visitorRegisterStyles.successTitle}>Registration Submitted!</Text>
          <Text style={visitorRegisterStyles.successMessage}>
            Your visitor registration has been submitted and is pending admin approval.
            You will receive an email once approved.
          </Text>
          <View style={visitorRegisterStyles.credentialsBox}>
            <Text style={visitorRegisterStyles.credentialsTitle}>
              <Ionicons name="mail-outline" size={16} color="#059669" /> Your Credentials
            </Text>
            <Text style={visitorRegisterStyles.credentialsInfo}>
              These credentials will be activated after admin approval.
            </Text>
            {credentials && (
              <>
                <View style={visitorRegisterStyles.credentialRow}>
                  <Text style={visitorRegisterStyles.credentialLabel}>Email:</Text>
                  <Text style={visitorRegisterStyles.credentialValue}>{credentials.email}</Text>
                  <TouchableOpacity onPress={() => handleCopy(credentials.email, "Email")} style={visitorRegisterStyles.copyButton}>
                    <Ionicons name="copy-outline" size={18} color="#059669" />
                  </TouchableOpacity>
                </View>
                <View style={visitorRegisterStyles.credentialRow}>
                  <Text style={visitorRegisterStyles.credentialLabel}>Password:</Text>
                  <Text style={visitorRegisterStyles.credentialValue}>{credentials.password}</Text>
                  <TouchableOpacity onPress={() => handleCopy(credentials.password, "Password")} style={visitorRegisterStyles.copyButton}>
                    <Ionicons name="copy-outline" size={18} color="#059669" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
          <TouchableOpacity style={visitorRegisterStyles.successButton} onPress={onConfirm} activeOpacity={0.7}>
            <LinearGradient colors={['#059669', '#047857']} style={visitorRegisterStyles.successGradient}>
              <Text style={visitorRegisterStyles.successButtonText}>Return to Login</Text>
              <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ================= DATA PRIVACY MODAL =================
const DataPrivacyModal = ({ visible, onAccept, onDecline }) => {
  const [accepted, setAccepted] = useState(false);

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onDecline}>
      <View style={visitorRegisterStyles.modalOverlay}>
        <View style={visitorRegisterStyles.privacyModalContainer}>
          <View style={visitorRegisterStyles.privacyModalHeader}>
            <View style={visitorRegisterStyles.privacyIconContainer}>
              <LinearGradient colors={['#059669', '#047857']} style={visitorRegisterStyles.privacyIconGradient}>
                <Ionicons name="shield-checkmark" size={28} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={visitorRegisterStyles.privacyModalTitle}>Data Privacy Agreement</Text>
            <Text style={visitorRegisterStyles.privacyModalSubtitle}>Please review and accept our data privacy policy</Text>
          </View>
          <ScrollView style={visitorRegisterStyles.privacyModalContent} showsVerticalScrollIndicator={false}>
            <View style={visitorRegisterStyles.privacySection}>
              <View style={visitorRegisterStyles.privacySectionHeader}>
                <Ionicons name="information-circle" size={20} color="#059669" />
                <Text style={visitorRegisterStyles.privacySectionTitle}>Information We Collect</Text>
              </View>
              <Text style={visitorRegisterStyles.privacySectionText}>• Full name and contact information (email, phone number)</Text>
              <Text style={visitorRegisterStyles.privacySectionText}>• Government-issued ID number and photo</Text>
              <Text style={visitorRegisterStyles.privacySectionText}>• Visit details including purpose, date, and time</Text>
              <Text style={visitorRegisterStyles.privacySectionText}>• Vehicle information (if applicable)</Text>
            </View>
            <View style={visitorRegisterStyles.privacySection}>
              <View style={visitorRegisterStyles.privacySectionHeader}>
                <Ionicons name="shield" size={20} color="#059669" />
                <Text style={visitorRegisterStyles.privacySectionTitle}>How We Use Your Data</Text>
              </View>
              <Text style={visitorRegisterStyles.privacySectionText}>• To verify your identity for campus access</Text>
              <Text style={visitorRegisterStyles.privacySectionText}>• To maintain security logs and access records</Text>
              <Text style={visitorRegisterStyles.privacySectionText}>• To contact you regarding your visit</Text>
              <Text style={visitorRegisterStyles.privacySectionText}>• For compliance with legal and regulatory requirements</Text>
            </View>
            <View style={visitorRegisterStyles.privacySection}>
              <View style={visitorRegisterStyles.privacySectionHeader}>
                <Ionicons name="lock-closed" size={20} color="#059669" />
                <Text style={visitorRegisterStyles.privacySectionTitle}>Data Protection</Text>
              </View>
              <Text style={visitorRegisterStyles.privacySectionText}>• Your data is encrypted using 256-bit encryption</Text>
              <Text style={visitorRegisterStyles.privacySectionText}>• We never share your information with third parties</Text>
              <Text style={visitorRegisterStyles.privacySectionText}>• You can request data deletion at any time</Text>
              <Text style={visitorRegisterStyles.privacySectionText}>• Records are automatically deleted after 30 days</Text>
            </View>
            <View style={visitorRegisterStyles.privacySection}>
              <View style={visitorRegisterStyles.privacySectionHeader}>
                <Ionicons name="time" size={20} color="#059669" />
                <Text style={visitorRegisterStyles.privacySectionTitle}>Retention Period</Text>
              </View>
              <Text style={visitorRegisterStyles.privacySectionText}>• Visitor records are kept for 30 days for security purposes</Text>
              <Text style={visitorRegisterStyles.privacySectionText}>• After 30 days, all personal data is automatically anonymized</Text>
            </View>
            <View style={visitorRegisterStyles.privacySection}>
              <View style={visitorRegisterStyles.privacySectionHeader}>
                <Ionicons name="document-text" size={20} color="#059669" />
                <Text style={visitorRegisterStyles.privacySectionTitle}>Your Rights</Text>
              </View>
              <Text style={visitorRegisterStyles.privacySectionText}>• Right to access your personal data</Text>
              <Text style={visitorRegisterStyles.privacySectionText}>• Right to rectification of inaccurate data</Text>
              <Text style={visitorRegisterStyles.privacySectionText}>• Right to erasure (right to be forgotten)</Text>
              <Text style={visitorRegisterStyles.privacySectionText}>• Right to restrict processing</Text>
            </View>
          </ScrollView>
          <TouchableOpacity style={visitorRegisterStyles.privacyCheckboxContainer} onPress={() => setAccepted(!accepted)} activeOpacity={0.7}>
            <View style={[visitorRegisterStyles.privacyCheckbox, accepted && visitorRegisterStyles.privacyCheckboxChecked]}>
              {accepted && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
            <Text style={visitorRegisterStyles.privacyCheckboxText}>
              I have read and agree to the{' '}
              <Text style={visitorRegisterStyles.privacyLinkText} onPress={() => Linking.openURL('https://example.com/privacy')}>
                Privacy Policy
              </Text>
            </Text>
          </TouchableOpacity>
          <View style={visitorRegisterStyles.privacyModalActions}>
            <TouchableOpacity style={visitorRegisterStyles.privacyDeclineButton} onPress={onDecline} activeOpacity={0.7}>
              <Text style={visitorRegisterStyles.privacyDeclineText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[visitorRegisterStyles.privacyAcceptButton, !accepted && visitorRegisterStyles.privacyAcceptButtonDisabled]} onPress={() => accepted && onAccept()} disabled={!accepted} activeOpacity={0.7}>
              <LinearGradient colors={accepted ? ['#059669', '#047857'] : ['#9CA3AF', '#9CA3AF']} style={visitorRegisterStyles.privacyAcceptGradient}>
                <Text style={visitorRegisterStyles.privacyAcceptText}>Accept & Continue</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ================= MAIN COMPONENT =================
export default function VisitorRegisterScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDataPrivacy, setShowDataPrivacy] = useState(false);
  const [showPurposePicker, setShowPurposePicker] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    idNumber: "",
  });

  const [visitData, setVisitData] = useState({
    purposeOfVisit: "",
    vehicleNumber: "",
    visitDate: new Date(),
    visitTime: new Date(),
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    idNumber: "",
    idImage: "",
    purposeOfVisit: "",
  });

  const [idImage, setIdImage] = useState(null);
  const [idImageBase64, setIdImageBase64] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const [completedFields, setCompletedFields] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [webDate, setWebDate] = useState(new Date().toISOString().split('T')[0]);
  const [webTime, setWebTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
  const [registeredVisitor, setRegisteredVisitor] = useState(null);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    if (Platform.OS !== 'web') {
      try {
        await ImagePicker.getCameraPermissionsAsync();
        await ImagePicker.getMediaLibraryPermissionsAsync();
      } catch (error) {
        console.error("Error checking permissions:", error);
      }
    }
  };

  const handleScanID = async () => {
    if (!idImage) {
      Alert.alert("No ID Photo", "Please upload an ID photo first to scan.");
      return;
    }
    setIsScanning(true);
    setScanProgress(0);
    try {
      const progressInterval = setInterval(() => {
        setScanProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      const scannedData = await IDScannerService.scanIDImage(idImage);
      clearInterval(progressInterval);
      setScanProgress(100);
      if (scannedData) {
        let filledFields = [];
        if (scannedData.fullName) {
          setFormData(prev => ({ ...prev, fullName: scannedData.fullName }));
          setCompletedFields(prev => ({ ...prev, fullName: true }));
          filledFields.push('Full Name');
        }
        if (scannedData.idNumber) {
          setFormData(prev => ({ ...prev, idNumber: scannedData.idNumber }));
          setCompletedFields(prev => ({ ...prev, idNumber: true }));
          filledFields.push('ID Number');
        }
        if (filledFields.length > 0) {
          Alert.alert("Scan Complete", `Extracted: ${filledFields.join(', ')}`);
        } else {
          Alert.alert("Could Not Read ID", "Please ensure the ID is clear and well-lit.");
        }
      } else {
        Alert.alert("Scan Failed", "Could not process the ID image. Please try again.");
      }
    } catch (error) {
      Alert.alert("Scan Error", "An error occurred while scanning.");
    } finally {
      setTimeout(() => {
        setIsScanning(false);
        setScanProgress(0);
      }, 500);
    }
  };

  const validateName = (name) => {
    if (!name.trim()) return "Full name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    return "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return "Email address is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\d+$/;
    if (!phone.trim()) return "Phone number is required";
    if (!phoneRegex.test(phone)) return "Phone number can only contain digits";
    if (phone.length !== 11) return "Phone number must be exactly 11 digits";
    return "";
  };

  const validateIdNumber = (id) => {
    if (!id.trim()) return "ID number is required";
    if (id.trim().length < 5) return "ID number must be at least 5 characters";
    return "";
  };

  const validateIdImage = (image) => {
    if (!image) return "Please upload a photo of your ID";
    return "";
  };

  const validatePurposeOfVisit = (purpose) => {
    if (!purpose || purpose.trim() === "") return "Purpose of visit is required";
    return "";
  };

  const handleInputChange = (field, value) => {
    let error = "";
    switch (field) {
      case "fullName":
        const filteredName = value.replace(/[^A-Za-z\s\-']/g, '');
        setFormData({ ...formData, [field]: filteredName });
        error = validateName(filteredName);
        break;
      case "email":
        setFormData({ ...formData, [field]: value });
        error = validateEmail(value);
        break;
      case "phoneNumber":
        const filteredPhone = value.replace(/[^\d]/g, '').slice(0, 11);
        setFormData({ ...formData, [field]: filteredPhone });
        error = validatePhoneNumber(filteredPhone);
        break;
      case "idNumber":
        setFormData({ ...formData, [field]: value });
        error = validateIdNumber(value);
        break;
      case "purposeOfVisit":
        setVisitData({ ...visitData, [field]: value });
        error = validatePurposeOfVisit(value);
        break;
      case "vehicleNumber":
        setVisitData({ ...visitData, [field]: value });
        error = "";
        break;
      default:
        setFormData({ ...formData, [field]: value });
    }
    setErrors({ ...errors, [field]: error });
    if (value && value.trim() && !error) {
      setCompletedFields({ ...completedFields, [field]: true });
    } else {
      setCompletedFields({ ...completedFields, [field]: false });
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Please allow gallery access.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        let uri = result.assets[0].uri;
        let base64 = result.assets[0].base64;
        if (Platform.OS === "android" && !uri.startsWith("file://")) {
          uri = "file://" + uri;
        }
        setIdImage(uri);
        setIdImageBase64(base64);
        setErrors(prev => ({ ...prev, idImage: "" }));
        setCompletedFields(prev => ({ ...prev, idImage: true }));
        Alert.alert("Success", "ID photo uploaded successfully!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open gallery.");
    }
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) setVisitData({ ...visitData, visitDate: selectedDate });
  };

  const onTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (selectedTime) setVisitData({ ...visitData, visitTime: selectedTime });
  };

  const handleWebDateChange = (text) => {
    setWebDate(text);
    if (text) {
      const newDate = new Date(text);
      if (!isNaN(newDate.getTime())) setVisitData({ ...visitData, visitDate: newDate });
    }
  };

  const handleWebTimeChange = (text) => {
    setWebTime(text);
    if (text) {
      const [hours, minutes] = text.split(':').map(Number);
      const newDate = new Date(visitData.visitTime);
      newDate.setHours(hours, minutes);
      setVisitData({ ...visitData, visitTime: newDate });
    }
  };

  const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  // Helper to show validation errors
  const showValidationAlert = (errorsList) => {
    Alert.alert(
      "Missing Information",
      `Please fix the following:\n\n${errorsList.join('\n')}`,
      [{ text: "OK" }]
    );
  };

  const validateStep1 = () => {
    const nameError = validateName(formData.fullName);
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhoneNumber(formData.phoneNumber);
    const idError = validateIdNumber(formData.idNumber);
    const imageError = validateIdImage(idImage);

    setErrors({
      ...errors,
      fullName: nameError,
      email: emailError,
      phoneNumber: phoneError,
      idNumber: idError,
      idImage: imageError,
    });

    const hasErrors = nameError || emailError || phoneError || idError || imageError;
    
    if (hasErrors) {
      const errorMessages = [];
      if (nameError) errorMessages.push(`• Full Name: ${nameError}`);
      if (emailError) errorMessages.push(`• Email: ${emailError}`);
      if (phoneError) errorMessages.push(`• Phone: ${phoneError}`);
      if (idError) errorMessages.push(`• ID Number: ${idError}`);
      if (imageError) errorMessages.push(`• ID Photo: ${imageError}`);
      showValidationAlert(errorMessages);
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const purposeError = validatePurposeOfVisit(visitData.purposeOfVisit);
    setErrors({ ...errors, purposeOfVisit: purposeError });

    if (purposeError) {
      showValidationAlert([`• Purpose of Visit: ${purposeError}`]);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    else navigation.goBack();
  };

  const handleEditPersonal = () => {
    setCurrentStep(1);
  };

  const handleEditVisit = () => {
    setCurrentStep(2);
  };

  const handleSubmit = async () => {
    // Final validation before showing privacy modal
    const isStep1Valid = validateStep1();
    const isStep2Valid = validateStep2();
    
    if (isStep1Valid && isStep2Valid) {
      setShowDataPrivacy(true);
    } else {
      Alert.alert("Incomplete Information", "Please complete all required fields before submitting.");
    }
  };

  const handlePrivacyAccept = async () => {
    setShowDataPrivacy(false);
    setIsSubmitting(true);
    try {
      if (!ApiService) {
        throw new Error("ApiService is not configured. Please check your utils/ApiService.js");
      }

      const emailExists = await ApiService.checkEmailExists(formData.email);
      if (emailExists) {
        Alert.alert(
          "Email Already Registered",
          "An account with this email already exists. Please login instead.",
          [
            { 
              text: "Go to Login", 
              onPress: () => {
                setIsSubmitting(false);
                navigation.navigate("Login", { role: "visitor" });
              }
            },
            { text: "OK", style: "cancel" }
          ]
        );
        return;
      }

      const visitorData = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        idNumber: formData.idNumber,
        idImage: idImageBase64 ? `data:image/jpeg;base64,${idImageBase64}` : null,
        purposeOfVisit: visitData.purposeOfVisit,
        vehicleNumber: visitData.vehicleNumber || "",
        visitDate: visitData.visitDate.toISOString(),
        visitTime: visitData.visitTime.toISOString(),
        privacyAccepted: true,
        privacyAcceptedAt: new Date().toISOString(),
      };

      console.log("Submitting visitor data:", visitorData);
      const response = await ApiService.registerVisitor(visitorData);

      if (response && response.success) {
        setRegisteredVisitor({
          fullName: formData.fullName,
          email: formData.email,
          userEmail: response.credentials?.email || formData.email,
          userPassword: response.credentials?.password || "Check your email",
        });
        setShowSuccess(true);
      } else {
        Alert.alert("Registration Error", response?.message || "Failed to register. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = error.message || "Failed to connect to server.";
      if (errorMessage.includes("already exists")) {
        Alert.alert(
          "Email Already Registered",
          "A visitor account with this email already exists. Please login or use a different email.",
          [
            { text: "Go to Login", onPress: () => navigation.navigate("Login", { role: "visitor" }) },
            { text: "OK", style: "cancel" }
          ]
        );
      } else if (errorMessage.includes("Network request failed")) {
        Alert.alert("Network Error", "Cannot connect to the server. Please check your internet connection.");
      } else {
        Alert.alert("Registration Error", errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrivacyDecline = () => {
    setShowDataPrivacy(false);
    Alert.alert("Privacy Policy Required", "You must accept the data privacy policy to continue.");
  };

  const handleSuccessConfirm = async () => {
    setShowSuccess(false);
    await AsyncStorage.removeItem('pendingVisitor');
    navigation.reset({
      index: 0,
      routes: [{ name: "RoleSelect", params: { registrationSuccess: true, message: "Registration submitted for approval." } }],
    });
  };

  const getProgressPercentage = () => {
    if (currentStep === 1) return 33;
    if (currentStep === 2) return 66;
    return 100;
  };

  const renderStep1 = () => (
    <>
      <View style={visitorRegisterStyles.idUploadSection}>
        <View style={visitorRegisterStyles.idCardContainer}>
          <Text style={visitorRegisterStyles.idCardTitle}>Government ID</Text>
          <Text style={visitorRegisterStyles.idCardSubtitle}>Upload a valid government-issued ID</Text>
        </View>
        <View style={[visitorRegisterStyles.formCard, errors.idImage && visitorRegisterStyles.formCardError]}>
          <View style={visitorRegisterStyles.cardHeader}>
            <View style={[visitorRegisterStyles.cardIcon, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="card" size={20} color="#059669" />
            </View>
            <Text style={visitorRegisterStyles.cardLabel}>ID Photo</Text>
            <Text style={visitorRegisterStyles.requiredBadge}>Required</Text>
          </View>
          <TouchableOpacity style={[visitorRegisterStyles.uploadArea, errors.idImage && visitorRegisterStyles.uploadAreaError]} onPress={pickImage} activeOpacity={0.7}>
            {idImage ? (
              <View style={visitorRegisterStyles.uploadPreview}>
                <Image source={{ uri: idImage }} style={visitorRegisterStyles.previewImage} resizeMode="cover" />
                <View style={visitorRegisterStyles.uploadOverlay}>
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={visitorRegisterStyles.uploadGradient}>
                    <Ionicons name="camera-reverse" size={24} color="#FFFFFF" />
                    <Text style={visitorRegisterStyles.changePhotoText}>Change Photo</Text>
                  </LinearGradient>
                </View>
              </View>
            ) : (
              <View style={visitorRegisterStyles.uploadPlaceholder}>
                <View style={visitorRegisterStyles.uploadIconContainer}>
                  <Ionicons name="cloud-upload" size={32} color="#059669" />
                </View>
                <Text style={visitorRegisterStyles.uploadTitle}>Upload ID</Text>
                <Text style={visitorRegisterStyles.uploadSubtitle}>Tap to select from gallery</Text>
              </View>
            )}
          </TouchableOpacity>
          {idImage && !isScanning && (
            <TouchableOpacity style={visitorRegisterStyles.scanButton} onPress={handleScanID} activeOpacity={0.8}>
              <LinearGradient colors={['#059669', '#047857']} style={visitorRegisterStyles.scanGradient}>
                <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
                <Text style={visitorRegisterStyles.scanButtonText}>Scan ID to Auto-Fill</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          {isScanning && (
            <View style={visitorRegisterStyles.scanningContainer}>
              <ActivityIndicator size="small" color="#059669" />
              <Text style={visitorRegisterStyles.scanningText}>Scanning ID Card... {scanProgress}%</Text>
              <View style={visitorRegisterStyles.scanProgressContainer}>
                <View style={[visitorRegisterStyles.scanProgressBar, { width: `${scanProgress}%` }]} />
              </View>
            </View>
          )}
          {errors.idImage && <Text style={visitorRegisterStyles.errorText}>{errors.idImage}</Text>}
        </View>
      </View>

      {["fullName", "email", "phoneNumber", "idNumber"].map((field) => {
        const labels = {
          fullName: { label: "Full Name", icon: "person", placeholder: "Enter your full name", keyboard: "default" },
          email: { label: "Email Address", icon: "mail", placeholder: "your@email.com", keyboard: "email-address" },
          phoneNumber: { label: "Phone Number", icon: "call", placeholder: "09123456789", keyboard: "phone-pad" },
          idNumber: { label: "ID Number", icon: "card", placeholder: "Enter your ID number", keyboard: "default" },
        };
        return (
          <View key={field} style={[visitorRegisterStyles.formCard, focusedField === field && visitorRegisterStyles.formCardFocused, errors[field] && visitorRegisterStyles.formCardError]}>
            <View style={visitorRegisterStyles.cardHeader}>
              <View style={[visitorRegisterStyles.cardIcon, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name={labels[field].icon} size={20} color="#059669" />
              </View>
              <Text style={visitorRegisterStyles.cardLabel}>{labels[field].label}</Text>
              <Text style={visitorRegisterStyles.requiredBadge}>Required</Text>
            </View>
            <View style={[visitorRegisterStyles.inputContainer, focusedField === field && visitorRegisterStyles.inputContainerFocused, errors[field] && visitorRegisterStyles.inputContainerError]}>
              <Ionicons name={`${labels[field].icon}-outline`} size={18} color={errors[field] ? "#EF4444" : "#9CA3AF"} />
              <TextInput
                style={visitorRegisterStyles.input}
                placeholder={labels[field].placeholder}
                placeholderTextColor="#9CA3AF"
                value={formData[field]}
                onChangeText={(text) => handleInputChange(field, text)}
                onFocus={() => setFocusedField(field)}
                onBlur={() => { setFocusedField(null); handleInputChange(field, formData[field]); }}
                keyboardType={labels[field].keyboard}
                autoCapitalize={field === "email" ? "none" : "words"}
              />
            </View>
            {errors[field] && <Text style={visitorRegisterStyles.errorText}>{errors[field]}</Text>}
          </View>
        );
      })}
    </>
  );

  const renderStep2 = () => (
    <>
      <View style={[visitorRegisterStyles.formCard, errors.purposeOfVisit && visitorRegisterStyles.formCardError]}>
        <View style={visitorRegisterStyles.cardHeader}>
          <View style={[visitorRegisterStyles.cardIcon, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="document-text" size={20} color="#059669" />
          </View>
          <Text style={visitorRegisterStyles.cardLabel}>Purpose of Visit</Text>
          <Text style={visitorRegisterStyles.requiredBadge}>Required</Text>
        </View>
        <TouchableOpacity style={visitorRegisterStyles.dropdownButton} onPress={() => setShowPurposePicker(true)} activeOpacity={0.7}>
          <Text style={[visitorRegisterStyles.dropdownButtonText, !visitData.purposeOfVisit && visitorRegisterStyles.dropdownButtonPlaceholder]}>
            {visitData.purposeOfVisit || "Select purpose of visit"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#64748B" />
        </TouchableOpacity>
        {errors.purposeOfVisit && <Text style={visitorRegisterStyles.errorText}>{errors.purposeOfVisit}</Text>}
      </View>

      <Modal visible={showPurposePicker} transparent={true} animationType="slide" onRequestClose={() => setShowPurposePicker(false)}>
        <View style={visitorRegisterStyles.pickerModalOverlay}>
          <View style={visitorRegisterStyles.pickerModalContainer}>
            <View style={visitorRegisterStyles.pickerModalHeader}>
              <Text style={visitorRegisterStyles.pickerModalTitle}>Select Purpose</Text>
              <TouchableOpacity onPress={() => setShowPurposePicker(false)}><Ionicons name="close" size={24} color="#6B7280" /></TouchableOpacity>
            </View>
            <ScrollView>
              {purposeOptions.map((option) => (
                <TouchableOpacity key={option} style={[visitorRegisterStyles.pickerModalOption, visitData.purposeOfVisit === option && visitorRegisterStyles.pickerModalOptionActive]} onPress={() => { handleInputChange("purposeOfVisit", option); setShowPurposePicker(false); }}>
                  <Text style={[visitorRegisterStyles.pickerModalOptionText, visitData.purposeOfVisit === option && visitorRegisterStyles.pickerModalOptionTextActive]}>{option}</Text>
                  {visitData.purposeOfVisit === option && <Ionicons name="checkmark" size={20} color="#059669" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Compact Date and Time Row */}
      <View style={visitorRegisterStyles.formRow}>
        <View style={[visitorRegisterStyles.formCard, visitorRegisterStyles.halfCard]}>
          <View style={visitorRegisterStyles.cardHeader}>
            <View style={[visitorRegisterStyles.cardIcon, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="calendar" size={18} color="#059669" />
            </View>
            <Text style={visitorRegisterStyles.cardLabelSmall}>Visit Date</Text>
          </View>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              value={webDate}
              onChange={(e) => handleWebDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={visitorRegisterStyles.webDateInputCompact}
            />
          ) : (
            <TouchableOpacity style={visitorRegisterStyles.datePickerButtonCompact} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={16} color="#059669" />
              <Text style={visitorRegisterStyles.datePickerTextCompact}>{visitData.visitDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={[visitorRegisterStyles.formCard, visitorRegisterStyles.halfCard]}>
          <View style={visitorRegisterStyles.cardHeader}>
            <View style={[visitorRegisterStyles.cardIcon, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="time" size={18} color="#059669" />
            </View>
            <Text style={visitorRegisterStyles.cardLabelSmall}>Visit Time</Text>
          </View>
          {Platform.OS === 'web' ? (
            <input
              type="time"
              value={webTime}
              onChange={(e) => handleWebTimeChange(e.target.value)}
              style={visitorRegisterStyles.webTimeInputCompact}
            />
          ) : (
            <TouchableOpacity style={visitorRegisterStyles.datePickerButtonCompact} onPress={() => setShowTimePicker(true)}>
              <Ionicons name="time-outline" size={16} color="#059669" />
              <Text style={visitorRegisterStyles.datePickerTextCompact}>{formatTime(visitData.visitTime)}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
            
      <View style={visitorRegisterStyles.formCard}>
        <View style={visitorRegisterStyles.cardHeader}>
          <View style={[visitorRegisterStyles.cardIcon, { backgroundColor: '#F3F4F6' }]}>
            <Ionicons name="car" size={20} color="#6B7280" />
          </View>
          <Text style={visitorRegisterStyles.cardLabel}>Vehicle Number</Text>
          <Text style={visitorRegisterStyles.optionalBadge}>Optional</Text>
        </View>
        <View style={visitorRegisterStyles.inputContainer}>
          <Ionicons name="car-outline" size={18} color="#9CA3AF" />
          <TextInput style={visitorRegisterStyles.input} placeholder="Enter vehicle number (if applicable)" placeholderTextColor="#9CA3AF" value={visitData.vehicleNumber} onChangeText={(text) => handleInputChange("vehicleNumber", text)} />
        </View>
      </View>

      {Platform.OS !== 'web' && showDatePicker && DateTimePickerComponent && (
        <DateTimePickerComponent value={visitData.visitDate} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onDateChange} minimumDate={new Date()} />
      )}
      {Platform.OS !== 'web' && showTimePicker && DateTimePickerComponent && (
        <DateTimePickerComponent value={visitData.visitTime} mode="time" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onTimeChange} />
      )}
    </>
  );

  const renderStep3 = () => (
    <>
      <View style={visitorRegisterStyles.reviewCard}>
        <View style={visitorRegisterStyles.reviewHeader}>
          <Ionicons name="person-circle" size={22} color="#059669" />
          <Text style={visitorRegisterStyles.reviewHeaderText}>Personal Information</Text>
          <TouchableOpacity style={visitorRegisterStyles.editButton} onPress={handleEditPersonal}>
            <Ionicons name="pencil" size={16} color="#059669" />
            <Text style={visitorRegisterStyles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={visitorRegisterStyles.reviewItem}><Text style={visitorRegisterStyles.reviewLabel}>Full Name</Text><Text style={visitorRegisterStyles.reviewValue}>{formData.fullName || '—'}</Text></View>
        <View style={visitorRegisterStyles.reviewItem}><Text style={visitorRegisterStyles.reviewLabel}>Email</Text><Text style={visitorRegisterStyles.reviewValue}>{formData.email || '—'}</Text></View>
        <View style={visitorRegisterStyles.reviewItem}><Text style={visitorRegisterStyles.reviewLabel}>Phone</Text><Text style={visitorRegisterStyles.reviewValue}>{formData.phoneNumber || '—'}</Text></View>
        <View style={visitorRegisterStyles.reviewItem}><Text style={visitorRegisterStyles.reviewLabel}>ID Number</Text><Text style={visitorRegisterStyles.reviewValue}>{formData.idNumber || '—'}</Text></View>
      </View>
      <View style={visitorRegisterStyles.reviewCard}>
        <View style={visitorRegisterStyles.reviewHeader}>
          <Ionicons name="calendar" size={22} color="#059669" />
          <Text style={visitorRegisterStyles.reviewHeaderText}>Visit Details</Text>
          <TouchableOpacity style={visitorRegisterStyles.editButton} onPress={handleEditVisit}>
            <Ionicons name="pencil" size={16} color="#059669" />
            <Text style={visitorRegisterStyles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={visitorRegisterStyles.reviewItem}><Text style={visitorRegisterStyles.reviewLabel}>Purpose</Text><Text style={visitorRegisterStyles.reviewValue}>{visitData.purposeOfVisit || '—'}</Text></View>
        <View style={visitorRegisterStyles.reviewItem}><Text style={visitorRegisterStyles.reviewLabel}>Date</Text><Text style={visitorRegisterStyles.reviewValue}>{visitData.visitDate.toLocaleDateString()}</Text></View>
        <View style={visitorRegisterStyles.reviewItem}><Text style={visitorRegisterStyles.reviewLabel}>Time</Text><Text style={visitorRegisterStyles.reviewValue}>{formatTime(visitData.visitTime)}</Text></View>
        {visitData.vehicleNumber && <View style={visitorRegisterStyles.reviewItem}><Text style={visitorRegisterStyles.reviewLabel}>Vehicle</Text><Text style={visitorRegisterStyles.reviewValue}>{visitData.vehicleNumber}</Text></View>}
      </View>
      {idImage && (
        <View style={visitorRegisterStyles.reviewCard}>
          <View style={visitorRegisterStyles.reviewHeader}>
            <Ionicons name="card" size={22} color="#059669" />
            <Text style={visitorRegisterStyles.reviewHeaderText}>ID Photo</Text>
            <TouchableOpacity style={visitorRegisterStyles.editButton} onPress={handleEditPersonal}>
              <Ionicons name="pencil" size={16} color="#059669" />
              <Text style={visitorRegisterStyles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Image source={{ uri: idImage }} style={visitorRegisterStyles.reviewImage} resizeMode="cover" />
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView style={visitorRegisterStyles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={visitorRegisterStyles.keyboardView}>
        <LinearGradient colors={['#059669', '#047857']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={visitorRegisterStyles.header}>
          <View style={visitorRegisterStyles.headerButtons}>
            <TouchableOpacity style={visitorRegisterStyles.backButton} onPress={handleBack} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            {/* X button removed */}
          </View>
          <View style={visitorRegisterStyles.headerContent}>
            <View style={visitorRegisterStyles.headerIconContainer}>
              <LinearGradient colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']} style={visitorRegisterStyles.headerIconGradient}>
                <Ionicons name="person-add" size={32} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={visitorRegisterStyles.headerTitle}>Visitor Registration</Text>
            <Text style={visitorRegisterStyles.headerSubtitle}>
              {currentStep === 1 && "Personal Information"}
              {currentStep === 2 && "Visit Details"}
              {currentStep === 3 && "Review & Submit"}
            </Text>
          </View>
        </LinearGradient>

        <View style={visitorRegisterStyles.progressContainer}>
          <View style={visitorRegisterStyles.progressHeader}>
            <Text style={visitorRegisterStyles.progressTitle}>Registration Progress</Text>
            <Text style={visitorRegisterStyles.progressPercentage}>{getProgressPercentage()}%</Text>
          </View>
          <View style={visitorRegisterStyles.progressBarContainer}>
            <View style={[visitorRegisterStyles.progressBar, { width: `${getProgressPercentage()}%` }]} />
          </View>
        </View>

        <View style={visitorRegisterStyles.stepIndicatorContainer}>
          <View style={visitorRegisterStyles.stepWrapper}>
            <View style={[visitorRegisterStyles.stepCircle, currentStep >= 1 && visitorRegisterStyles.stepCircleActive]}>
              <Text style={[visitorRegisterStyles.stepCircleText, currentStep >= 1 && visitorRegisterStyles.stepCircleTextActive]}>1</Text>
            </View>
            <View style={[visitorRegisterStyles.stepConnector, currentStep > 1 && visitorRegisterStyles.stepConnectorActive]} />
            <View style={[visitorRegisterStyles.stepCircle, currentStep >= 2 && visitorRegisterStyles.stepCircleActive]}>
              <Text style={[visitorRegisterStyles.stepCircleText, currentStep >= 2 && visitorRegisterStyles.stepCircleTextActive]}>2</Text>
            </View>
            <View style={[visitorRegisterStyles.stepConnector, currentStep > 2 && visitorRegisterStyles.stepConnectorActive]} />
            <View style={[visitorRegisterStyles.stepCircle, currentStep >= 3 && visitorRegisterStyles.stepCircleActive]}>
              <Text style={[visitorRegisterStyles.stepCircleText, currentStep >= 3 && visitorRegisterStyles.stepCircleTextActive]}>3</Text>
            </View>
          </View>
          <View style={visitorRegisterStyles.stepLabels}>
            <Text style={[visitorRegisterStyles.stepLabel, currentStep >= 1 && visitorRegisterStyles.stepLabelActive]}>Personal</Text>
            <Text style={[visitorRegisterStyles.stepLabel, currentStep >= 2 && visitorRegisterStyles.stepLabelActive]}>Visit</Text>
            <Text style={[visitorRegisterStyles.stepLabel, currentStep >= 3 && visitorRegisterStyles.stepLabelActive]}>Review</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={visitorRegisterStyles.scrollContainer}>
          <View style={visitorRegisterStyles.content}>
            <View style={visitorRegisterStyles.sectionHeader}>
              <Text style={visitorRegisterStyles.sectionTitle}>
                {currentStep === 1 && "Personal Information"}
                {currentStep === 2 && "Visit Details"}
                {currentStep === 3 && "Review & Submit"}
              </Text>
              <View style={visitorRegisterStyles.sectionBadge}>
                <Ionicons name="document-text" size={14} color="#059669" />
                <Text style={visitorRegisterStyles.sectionBadgeText}>Step {currentStep}/3</Text>
              </View>
            </View>
            <View style={visitorRegisterStyles.formGrid}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </View>
            <TouchableOpacity style={visitorRegisterStyles.continueButton} onPress={currentStep === 3 ? handleSubmit : handleNext} activeOpacity={0.8} disabled={isSubmitting}>
              <LinearGradient colors={['#059669', '#047857']} style={visitorRegisterStyles.gradientButton}>
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={visitorRegisterStyles.continueButtonText}>
                      {currentStep === 1 && "Continue"}
                      {currentStep === 2 && "Review"}
                      {currentStep === 3 && "Submit Registration"}
                    </Text>
                    <Ionicons name={currentStep === 3 ? "checkmark-circle" : "arrow-forward"} size={20} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <DataPrivacyModal visible={showDataPrivacy} onAccept={handlePrivacyAccept} onDecline={handlePrivacyDecline} />
      <SuccessModal visible={showSuccess} credentials={registeredVisitor ? { email: registeredVisitor.userEmail, password: registeredVisitor.userPassword } : null} onConfirm={handleSuccessConfirm} />
    </SafeAreaView>
  );
} 