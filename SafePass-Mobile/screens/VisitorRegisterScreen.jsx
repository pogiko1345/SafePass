// VisitorRegisterScreen.jsx - Complete with Purpose Dropdown
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

// Purpose options array
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
  const [isWeb] = useState(Platform.OS === 'web');

  const handleCopyEmail = () => {
    if (credentials?.email) {
      if (Platform.OS === 'web') {
        navigator.clipboard.writeText(credentials.email);
      } else {
        Alert.alert("Copied", "Email copied to clipboard");
      }
      Alert.alert("Success", "Email copied to clipboard!");
    }
  };

  const handleCopyPassword = () => {
    if (credentials?.password) {
      if (Platform.OS === 'web') {
        navigator.clipboard.writeText(credentials.password);
      } else {
        Alert.alert("Copied", "Password copied to clipboard");
      }
      Alert.alert("Success", "Password copied to clipboard!");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onConfirm}
    >
      <View style={visitorRegisterStyles.modalOverlay}>
        <View style={visitorRegisterStyles.successModalContainer}>
          <View style={visitorRegisterStyles.successIconContainer}>
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              style={visitorRegisterStyles.successIconGradient}
            >
              <Ionicons name="time-outline" size={48} color="#FFFFFF" />
            </LinearGradient>
          </View>

          <Text style={visitorRegisterStyles.successTitle}>Registration Submitted!</Text>
          
          <Text style={visitorRegisterStyles.successMessage}>
            Your visitor registration has been submitted and is pending admin approval.
            You will receive an email once your registration is approved.
          </Text>

          <View style={visitorRegisterStyles.credentialsBox}>
            <Text style={visitorRegisterStyles.credentialsTitle}>
              <Ionicons name="mail-outline" size={16} color="#4F46E5" /> Your Credentials
            </Text>
            <Text style={visitorRegisterStyles.credentialsInfo}>
              These credentials will be activated after admin approval. 
              You'll receive an email confirmation once approved.
            </Text>
            
            {credentials && (
              <>
                <View style={visitorRegisterStyles.credentialRow}>
                  <Text style={visitorRegisterStyles.credentialLabel}>Email:</Text>
                  <Text style={visitorRegisterStyles.credentialValue}>{credentials.email}</Text>
                  <TouchableOpacity onPress={handleCopyEmail} style={visitorRegisterStyles.copyButton}>
                    <Ionicons name="copy-outline" size={18} color="#4F46E5" />
                  </TouchableOpacity>
                </View>
                
                <View style={visitorRegisterStyles.credentialRow}>
                  <Text style={visitorRegisterStyles.credentialLabel}>Password:</Text>
                  <Text style={visitorRegisterStyles.credentialValue}>{credentials.password}</Text>
                  <TouchableOpacity onPress={handleCopyPassword} style={visitorRegisterStyles.copyButton}>
                    <Ionicons name="copy-outline" size={18} color="#4F46E5" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          <Text style={visitorRegisterStyles.noteText}>
            <Ionicons name="information-circle-outline" size={14} color="#6B7280" /> 
            Please save these credentials. You'll be notified once approved.
          </Text>

          <TouchableOpacity
            style={visitorRegisterStyles.successButton}
            onPress={onConfirm}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#4F46E5', '#7C3AED']}
              style={visitorRegisterStyles.successGradient}
            >
              <Text style={visitorRegisterStyles.successButtonText}>Return to Login</Text>
              <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ================= COMPONENT =================
export default function VisitorRegisterScreen({ navigation }) {
  // ============ STATE MANAGEMENT ============
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDataPrivacy, setShowDataPrivacy] = useState(false);
  const [showPurposePicker, setShowPurposePicker] = useState(false);
  
  // ID Scanner States
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  
  // Step 1: Personal Information
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    idNumber: "",
  });

  // Step 2: Visit Details
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
  
  // Web-specific date/time input states
  const [webDate, setWebDate] = useState(new Date().toISOString().split('T')[0]);
  const [webTime, setWebTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  );

  // ============ REGISTRATION RESPONSE ============
  const [registeredVisitor, setRegisteredVisitor] = useState(null);

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    if (Platform.OS !== 'web') {
      try {
        const camera = await ImagePicker.getCameraPermissionsAsync();
        const library = await ImagePicker.getMediaLibraryPermissionsAsync();
        console.log("Camera permission:", camera.status);
        console.log("Library permission:", library.status);
      } catch (error) {
        console.error("Error checking permissions:", error);
      }
    }
  };

  const checkEmailExists = async (email) => {
    try {
      const response = await ApiService.checkEmailExists(email);
      return response.exists;
    } catch (error) {
      console.error('Email check error:', error);
      return false;
    }
  };

  // ============ ID SCANNER HANDLER ============
  const handleScanID = async () => {
    if (!idImage) {
      Alert.alert(
        "No ID Photo",
        "Please upload an ID photo first to scan.",
        [{ text: "OK" }]
      );
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
        
        if (scannedData.dateOfBirth) {
          console.log('Date of Birth detected:', scannedData.dateOfBirth);
        }
        
        if (filledFields.length > 0) {
          Alert.alert(
            "✅ ID Scan Complete",
            `Successfully extracted:\n${filledFields.map(f => `• ${f}`).join('\n')}\n\nPlease review and complete the remaining fields.`,
            [{ text: "OK" }]
          );
        } else {
          Alert.alert(
            "⚠️ Could Not Read ID",
            "Unable to extract information from the image. Please ensure the ID is clear and well-lit, then try again.",
            [{ text: "OK" }]
          );
        }
      } else {
        Alert.alert(
          "Scan Failed",
          "Could not process the ID image. Please try again with a clearer photo.",
          [{ text: "OK" }]
        );
      }
      
    } catch (error) {
      console.error("ID scan error:", error);
      Alert.alert(
        "Scan Error",
        "An error occurred while scanning the ID. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setTimeout(() => {
        setIsScanning(false);
        setScanProgress(0);
      }, 500);
    }
  };

  // ============ VALIDATION FUNCTIONS ============
  const validateName = (name) => {
    const nameRegex = /^[A-Za-z\s\-']+$/;
    if (!name.trim()) {
      return "Full name is required";
    } else if (!nameRegex.test(name)) {
      return "Name can only contain letters, spaces, hyphens and apostrophes";
    } else if (name.trim().length < 2) {
      return "Name must be at least 2 characters";
    }
    return "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return "Email address is required";
    } else if (!emailRegex.test(email)) {
      return "Please enter a valid email address (e.g., name@domain.com)";
    }
    return "";
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\d+$/;
    if (!phone.trim()) {
      return "Phone number is required";
    } else if (!phoneRegex.test(phone)) {
      return "Phone number can only contain digits";
    } else if (phone.length !== 11) {
      return "Phone number must be exactly 11 digits";
    }
    return "";
  };

  const validateIdNumber = (id) => {
    if (!id.trim()) {
      return "ID number is required";
    } else if (id.trim().length < 5) {
      return "ID number must be at least 5 characters";
    }
    return "";
  };

  const validateIdImage = (image) => {
    if (!image) {
      return "Please upload a photo of your ID";
    }
    return "";
  };

  const validatePurposeOfVisit = (purpose) => {
    if (!purpose || purpose.trim() === "") {
      return "Purpose of visit is required";
    }
    return "";
  };

  // ============ HANDLE INPUT CHANGE ============
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

  // ============ IMAGE PICKER ============
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
      console.log("Gallery error:", error);
      Alert.alert("Error", "Failed to open gallery.");
    }
  };

  // ============ DATE/TIME HANDLERS ============
  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setVisitData({ ...visitData, visitDate: selectedDate });
    }
  };

  const onTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      setVisitData({ ...visitData, visitTime: selectedTime });
    }
  };

  const handleWebDateChange = (text) => {
    setWebDate(text);
    if (text) {
      const newDate = new Date(text);
      if (!isNaN(newDate.getTime())) {
        setVisitData({ ...visitData, visitDate: newDate });
      }
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

  const showDatepicker = () => {
    if (Platform.OS !== 'web') {
      setShowDatePicker(true);
    }
  };

  const showTimepicker = () => {
    if (Platform.OS !== 'web') {
      setShowTimePicker(true);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // ============ STEP VALIDATION ============
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

    return !nameError && !emailError && !phoneError && !idError && !imageError;
  };

  const validateStep2 = () => {
    const purposeError = validatePurposeOfVisit(visitData.purposeOfVisit);

    setErrors({
      ...errors,
      purposeOfVisit: purposeError,
    });

    return !purposeError;
  };

  // ============ NAVIGATION ============
  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleExit = () => {
    Alert.alert(
      "Exit Registration",
      "Are you sure you want to exit? Your progress will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Exit", onPress: () => navigation.navigate("RoleSelect") }
      ]
    );
  };

  // ============ SUBMIT TO DATABASE WITH ADMIN NOTIFICATION ============
  const handleSubmit = async () => {
    setShowDataPrivacy(true);
  };

  const handlePrivacyAccept = async () => {
    setShowDataPrivacy(false);
    setIsSubmitting(true);

    try {
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

      if (!ApiService) {
        throw new Error("ApiService is not configured");
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

      console.log("Submitting visitor data for approval:", visitorData);

      const response = await ApiService.registerVisitor(visitorData);

      if (response && response.success) {
        setRegisteredVisitor({
          fullName: formData.fullName,
          email: formData.email,
          userEmail: response.credentials?.email || formData.email,
          userPassword: response.credentials?.password || "Check your email",
          status: 'pending'
        });
        
        setShowSuccess(true);
      } else {
        Alert.alert(
          "Registration Error", 
          response?.message || "Failed to register. Please try again."
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      
      if (error.message.includes("already exists")) {
        Alert.alert(
          "Email Already Registered",
          "A visitor account with this email already exists. Please login or use a different email.",
          [
            { 
              text: "Go to Login", 
              onPress: () => navigation.navigate("Login", { role: "visitor" })
            },
            { text: "OK", style: "cancel" }
          ]
        );
      } else if (error.message.includes("Network request failed")) {
        Alert.alert(
          "Network Error",
          "Cannot connect to the server. Please check your internet connection and try again."
        );
      } else {
        Alert.alert(
          "Registration Error", 
          error.message || "Failed to connect to server. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrivacyDecline = () => {
    setShowDataPrivacy(false);
    Alert.alert(
      "Privacy Policy Required",
      "You must accept the data privacy policy to continue with registration.",
      [{ text: "OK" }]
    );
  };

  // ============ HANDLE SUCCESS CONFIRM ============
  const handleSuccessConfirm = async () => {
    setShowSuccess(false);
    await AsyncStorage.removeItem('pendingVisitor');
    
    navigation.reset({
      index: 0,
      routes: [
        { 
          name: "RoleSelect",
          params: { 
            registrationSuccess: true,
            message: "✅ Registration Submitted!\n\nYour visitor registration has been sent for admin approval. You will receive an email once approved.\n\nPlease save your credentials and wait for approval before logging in."
          }
        }
      ],
    });
  };

  // ============ PROGRESS ============
  const getProgressPercentage = () => {
    if (currentStep === 1) return 33;
    if (currentStep === 2) return 66;
    return 100;
  };

  // ============ RENDER FUNCTIONS ============
  const renderStep1 = () => (
    <>
      {/* ID Upload Section */}
      <View style={visitorRegisterStyles.idUploadSection}>
        <View style={visitorRegisterStyles.idCardContainer}>
          <Text style={visitorRegisterStyles.idCardTitle}>📸 Government ID</Text>
          <Text style={visitorRegisterStyles.idCardSubtitle}>
            Upload your valid government ID (Passport, Driver's License, UMID, etc.)
          </Text>
        </View>
        
        <View style={[
          visitorRegisterStyles.formCard,
          visitorRegisterStyles.uploadCard,
          completedFields.idImage && visitorRegisterStyles.formCardCompleted,
          errors.idImage && visitorRegisterStyles.formCardError
        ]}>
          <View style={visitorRegisterStyles.cardHeader}>
            <View style={[visitorRegisterStyles.cardIcon, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="camera" size={20} color="#7C3AED" />
            </View>
            <View style={visitorRegisterStyles.cardTitleContainer}>
              <Text style={visitorRegisterStyles.cardLabel}>ID Photo</Text>
              {completedFields.idImage && !errors.idImage && (
                <View style={visitorRegisterStyles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                </View>
              )}
            </View>
            <Text style={visitorRegisterStyles.requiredBadge}>Required</Text>
          </View>
          
          <TouchableOpacity
            style={[
              visitorRegisterStyles.uploadArea,
              errors.idImage && visitorRegisterStyles.uploadAreaError
            ]}
            onPress={pickImage}
            activeOpacity={0.7}
          >
            {idImage ? (
              <View style={visitorRegisterStyles.uploadPreview}>
                <Image 
                  source={{ uri: idImage }} 
                  style={visitorRegisterStyles.previewImage}
                  resizeMode="cover"
                />
                <View style={visitorRegisterStyles.uploadOverlay}>
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={visitorRegisterStyles.uploadGradient}
                  >
                    <Ionicons name="camera-reverse" size={24} color="#FFFFFF" />
                    <Text style={visitorRegisterStyles.changePhotoText}>Change Photo</Text>
                  </LinearGradient>
                </View>
              </View>
            ) : (
              <View style={visitorRegisterStyles.uploadPlaceholder}>
                <View style={visitorRegisterStyles.uploadIconContainer}>
                  <Ionicons name="cloud-upload" size={32} color="#7C3AED" />
                </View>
                <Text style={visitorRegisterStyles.uploadTitle}>Upload Government ID</Text>
                <Text style={visitorRegisterStyles.uploadSubtitle}>
                  Tap to choose from gallery
                </Text>
                <View style={visitorRegisterStyles.uploadBadge}>
                  <Ionicons name="shield-checkmark" size={14} color="#7C3AED" />
                  <Text style={visitorRegisterStyles.uploadBadgeText}>Secure & Encrypted</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>

          {idImage && !isScanning && (
            <TouchableOpacity
              style={visitorRegisterStyles.scanButton}
              onPress={handleScanID}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4F46E5', '#7C3AED']}
                style={visitorRegisterStyles.scanGradient}
              >
                <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
                <Text style={visitorRegisterStyles.scanButtonText}>Scan ID to Auto-Fill</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {isScanning && (
            <View style={visitorRegisterStyles.scanningContainer}>
              <View style={visitorRegisterStyles.scanningHeader}>
                <ActivityIndicator size="small" color="#4F46E5" />
                <Text style={visitorRegisterStyles.scanningText}>Scanning ID Card...</Text>
              </View>
              <View style={visitorRegisterStyles.scanProgressContainer}>
                <View 
                  style={[
                    visitorRegisterStyles.scanProgressBar,
                    { width: `${scanProgress}%` }
                  ]} 
                />
              </View>
              <Text style={visitorRegisterStyles.scanHint}>
                Extracting information from your ID...
              </Text>
            </View>
          )}

          {idImage && (
            <View style={visitorRegisterStyles.imageActions}>
              <View style={visitorRegisterStyles.imageInfo}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={visitorRegisterStyles.imageInfoText}>
                  Image ready for upload
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => {
                  setIdImage(null);
                  setIdImageBase64(null);
                  setCompletedFields({ ...completedFields, idImage: false });
                  setErrors({ ...errors, idImage: "Please upload a photo of your ID" });
                }}
                style={visitorRegisterStyles.removeImageButton}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                <Text style={visitorRegisterStyles.removeImageText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {errors.idImage ? (
            <Text style={visitorRegisterStyles.errorText}>
              <Ionicons name="alert-circle" size={12} /> {errors.idImage}
            </Text>
          ) : (
            <Text style={visitorRegisterStyles.inputHint}>
              Accepted formats: JPG, PNG (Max 5MB) - Upload ID to auto-fill form
            </Text>
          )}
        </View>
      </View>

      {/* Personal Information Cards */}
      {["fullName", "email", "phoneNumber", "idNumber"].map((field) => {
        const labels = {
          fullName: { label: "Full Name", icon: "person", placeholder: "Enter your full name", hint: "Letters, spaces, hyphens only" },
          email: { label: "Email Address", icon: "mail", placeholder: "your@email.com", hint: "We'll send confirmation", keyboard: "email-address" },
          phoneNumber: { label: "Phone Number", icon: "call", placeholder: "09123456789", hint: "11 digits - numbers only", keyboard: "phone-pad", maxLength: 11 },
          idNumber: { label: "Government ID Number", icon: "card", placeholder: "Passport / Driver's License", hint: "Enter without spaces" },
        };
        return (
          <View key={field} style={[
            visitorRegisterStyles.formCard,
            focusedField === field && visitorRegisterStyles.formCardFocused,
            completedFields[field] && visitorRegisterStyles.formCardCompleted,
            errors[field] && visitorRegisterStyles.formCardError
          ]}>
            <View style={visitorRegisterStyles.cardHeader}>
              <View style={[visitorRegisterStyles.cardIcon, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name={labels[field].icon} size={20} color="#4F46E5" />
              </View>
              <View style={visitorRegisterStyles.cardTitleContainer}>
                <Text style={visitorRegisterStyles.cardLabel}>{labels[field].label}</Text>
                {completedFields[field] && !errors[field] && (
                  <View style={visitorRegisterStyles.completedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  </View>
                )}
              </View>
              <Text style={visitorRegisterStyles.requiredBadge}>Required</Text>
            </View>
            
            <View style={[
              visitorRegisterStyles.inputContainer,
              focusedField === field && visitorRegisterStyles.inputContainerFocused,
              errors[field] && visitorRegisterStyles.inputContainerError
            ]}>
              <Ionicons name={`${labels[field].icon}-outline`} size={20} color={errors[field] ? "#EF4444" : "#9CA3AF"} />
              <TextInput
                style={visitorRegisterStyles.input}
                placeholder={labels[field].placeholder}
                placeholderTextColor="#9CA3AF"
                value={formData[field]}
                onChangeText={(text) => handleInputChange(field, text)}
                onFocus={() => setFocusedField(field)}
                onBlur={() => {
                  setFocusedField(null);
                  handleInputChange(field, formData[field]);
                }}
                keyboardType={labels[field].keyboard || "default"}
                autoCapitalize={field === "email" ? "none" : "words"}
                maxLength={labels[field].maxLength}
              />
            </View>
            {errors[field] ? (
              <Text style={visitorRegisterStyles.errorText}>{errors[field]}</Text>
            ) : (
              <Text style={visitorRegisterStyles.inputHint}>{labels[field].hint}</Text>
            )}
          </View>
        );
      })}
    </>
  );

  const renderStep2 = () => (
    <>
      {/* Purpose of Visit Card - Custom Dropdown */}
      <View style={[
        visitorRegisterStyles.formCard,
        focusedField === 'purposeOfVisit' && visitorRegisterStyles.formCardFocused,
        completedFields.purposeOfVisit && visitorRegisterStyles.formCardCompleted,
        errors.purposeOfVisit && visitorRegisterStyles.formCardError
      ]}>
        <View style={visitorRegisterStyles.cardHeader}>
          <View style={[visitorRegisterStyles.cardIcon, { backgroundColor: '#F0FDF4' }]}>
            <Ionicons name="document-text" size={20} color="#059669" />
          </View>
          <View style={visitorRegisterStyles.cardTitleContainer}>
            <Text style={visitorRegisterStyles.cardLabel}>Purpose of Visit</Text>
            {completedFields.purposeOfVisit && !errors.purposeOfVisit && (
              <View style={visitorRegisterStyles.completedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              </View>
            )}
          </View>
          <Text style={visitorRegisterStyles.requiredBadge}>Required</Text>
        </View>
        
        <TouchableOpacity
          style={visitorRegisterStyles.dropdownButton}
          onPress={() => setShowPurposePicker(true)}
          activeOpacity={0.7}
        >
          <Text style={[
            visitorRegisterStyles.dropdownButtonText,
            !visitData.purposeOfVisit && visitorRegisterStyles.dropdownButtonPlaceholder
          ]}>
            {visitData.purposeOfVisit || "Select purpose of visit"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#64748B" />
        </TouchableOpacity>
        
        {errors.purposeOfVisit && (
          <Text style={visitorRegisterStyles.errorText}>
            <Ionicons name="alert-circle" size={12} /> {errors.purposeOfVisit}
          </Text>
        )}
      </View>

      {/* Purpose Picker Modal */}
      <Modal
        visible={showPurposePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPurposePicker(false)}
      >
        <View style={visitorRegisterStyles.pickerModalOverlay}>
          <View style={visitorRegisterStyles.pickerModalContainer}>
            <View style={visitorRegisterStyles.pickerModalHeader}>
              <Text style={visitorRegisterStyles.pickerModalTitle}>Select Purpose</Text>
              <TouchableOpacity onPress={() => setShowPurposePicker(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={visitorRegisterStyles.pickerModalOptions}>
              {purposeOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    visitorRegisterStyles.pickerModalOption,
                    visitData.purposeOfVisit === option && visitorRegisterStyles.pickerModalOptionActive
                  ]}
                  onPress={() => {
                    handleInputChange("purposeOfVisit", option);
                    setShowPurposePicker(false);
                  }}
                >
                  <Text style={[
                    visitorRegisterStyles.pickerModalOptionText,
                    visitData.purposeOfVisit === option && visitorRegisterStyles.pickerModalOptionTextActive
                  ]}>
                    {option}
                  </Text>
                  {visitData.purposeOfVisit === option && (
                    <Ionicons name="checkmark" size={20} color="#4F46E5" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date and Time Row */}
      <View style={visitorRegisterStyles.formRow}>
        <View style={[visitorRegisterStyles.formCard, { flex: 1, marginRight: 4 }]}>
          <View style={visitorRegisterStyles.cardHeader}>
            <View style={[visitorRegisterStyles.cardIcon, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="calendar" size={20} color="#4F46E5" />
            </View>
            <Text style={visitorRegisterStyles.cardLabel}>Visit Date</Text>
          </View>
          
          {Platform.OS === 'web' ? (
            <input
              type="date"
              value={webDate}
              onChange={(e) => handleWebDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={visitorRegisterStyles.webDateInput}
            />
          ) : (
            <TouchableOpacity
              style={visitorRegisterStyles.datePickerButton}
              onPress={showDatepicker}
            >
              <Ionicons name="calendar-outline" size={20} color="#4F46E5" />
              <Text style={visitorRegisterStyles.datePickerText}>
                {visitData.visitDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[visitorRegisterStyles.formCard, { flex: 1, marginLeft: 4 }]}>
          <View style={visitorRegisterStyles.cardHeader}>
            <View style={[visitorRegisterStyles.cardIcon, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="time" size={20} color="#7C3AED" />
            </View>
            <Text style={visitorRegisterStyles.cardLabel}>Visit Time</Text>
          </View>
          
          {Platform.OS === 'web' ? (
            <input
              type="time"
              value={webTime}
              onChange={(e) => handleWebTimeChange(e.target.value)}
              style={visitorRegisterStyles.webTimeInput}
            />
          ) : (
            <TouchableOpacity
              style={visitorRegisterStyles.datePickerButton}
              onPress={showTimepicker}
            >
              <Ionicons name="time-outline" size={20} color="#7C3AED" />
              <Text style={visitorRegisterStyles.datePickerText}>
                {formatTime(visitData.visitTime)}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Vehicle Number Card (Optional) */}
      <View style={[
        visitorRegisterStyles.formCard,
        focusedField === 'vehicleNumber' && visitorRegisterStyles.formCardFocused,
      ]}>
        <View style={visitorRegisterStyles.cardHeader}>
          <View style={[visitorRegisterStyles.cardIcon, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="car" size={20} color="#7C3AED" />
          </View>
          <View style={visitorRegisterStyles.cardTitleContainer}>
            <Text style={visitorRegisterStyles.cardLabel}>Vehicle Number</Text>
          </View>
          <Text style={visitorRegisterStyles.optionalBadge}>Optional</Text>
        </View>
        
        <View style={[
          visitorRegisterStyles.inputContainer,
          focusedField === 'vehicleNumber' && visitorRegisterStyles.inputContainerFocused,
        ]}>
          <Ionicons name="car-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={visitorRegisterStyles.input}
            placeholder="Enter vehicle number (if applicable)"
            placeholderTextColor="#9CA3AF"
            value={visitData.vehicleNumber}
            onChangeText={(text) => handleInputChange("vehicleNumber", text)}
            onFocus={() => setFocusedField('vehicleNumber')}
            onBlur={() => setFocusedField(null)}
          />
        </View>
        <Text style={visitorRegisterStyles.inputHint}>
          For parking access
        </Text>
      </View>

      {Platform.OS !== 'web' && showDatePicker && DateTimePickerComponent && (
        <DateTimePickerComponent
          value={visitData.visitDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {Platform.OS !== 'web' && showTimePicker && DateTimePickerComponent && (
        <DateTimePickerComponent
          value={visitData.visitTime}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onTimeChange}
        />
      )}
    </>
  );

  const renderStep3 = () => (
    <>
      <View style={visitorRegisterStyles.reviewCard}>
        <View style={visitorRegisterStyles.reviewHeader}>
          <Ionicons name="person-circle" size={24} color="#4F46E5" />
          <Text style={visitorRegisterStyles.reviewHeaderText}>Personal Information</Text>
        </View>
        <View style={visitorRegisterStyles.reviewItem}>
          <Text style={visitorRegisterStyles.reviewLabel}>Full Name:</Text>
          <Text style={visitorRegisterStyles.reviewValue}>{formData.fullName || '—'}</Text>
        </View>
        <View style={visitorRegisterStyles.reviewItem}>
          <Text style={visitorRegisterStyles.reviewLabel}>Email:</Text>
          <Text style={visitorRegisterStyles.reviewValue}>{formData.email || '—'}</Text>
        </View>
        <View style={visitorRegisterStyles.reviewItem}>
          <Text style={visitorRegisterStyles.reviewLabel}>Phone:</Text>
          <Text style={visitorRegisterStyles.reviewValue}>{formData.phoneNumber || '—'}</Text>
        </View>
        <View style={visitorRegisterStyles.reviewItem}>
          <Text style={visitorRegisterStyles.reviewLabel}>ID Number:</Text>
          <Text style={visitorRegisterStyles.reviewValue}>{formData.idNumber || '—'}</Text>
        </View>
      </View>

      <View style={visitorRegisterStyles.reviewCard}>
        <View style={visitorRegisterStyles.reviewHeader}>
          <Ionicons name="calendar" size={24} color="#7C3AED" />
          <Text style={visitorRegisterStyles.reviewHeaderText}>Visit Details</Text>
        </View>
        <View style={visitorRegisterStyles.reviewItem}>
          <Text style={visitorRegisterStyles.reviewLabel}>Purpose:</Text>
          <Text style={visitorRegisterStyles.reviewValue}>{visitData.purposeOfVisit || '—'}</Text>
        </View>
        <View style={visitorRegisterStyles.reviewItem}>
          <Text style={visitorRegisterStyles.reviewLabel}>Date:</Text>
          <Text style={visitorRegisterStyles.reviewValue}>
            {visitData.visitDate.toLocaleDateString()}
          </Text>
        </View>
        <View style={visitorRegisterStyles.reviewItem}>
          <Text style={visitorRegisterStyles.reviewLabel}>Time:</Text>
          <Text style={visitorRegisterStyles.reviewValue}>
            {formatTime(visitData.visitTime)}
          </Text>
        </View>
        {visitData.vehicleNumber ? (
          <View style={visitorRegisterStyles.reviewItem}>
            <Text style={visitorRegisterStyles.reviewLabel}>Vehicle:</Text>
            <Text style={visitorRegisterStyles.reviewValue}>{visitData.vehicleNumber}</Text>
          </View>
        ) : null}
      </View>

      {idImage && (
        <View style={visitorRegisterStyles.reviewCard}>
          <View style={visitorRegisterStyles.reviewHeader}>
            <Ionicons name="image" size={24} color="#4F46E5" />
            <Text style={visitorRegisterStyles.reviewHeaderText}>ID Photo</Text>
          </View>
          <View style={visitorRegisterStyles.reviewImageContainer}>
            <Image source={{ uri: idImage }} style={visitorRegisterStyles.reviewImage} />
          </View>
        </View>
      )}
    </>
  );

  // ============ DATA PRIVACY MODAL ============
  const DataPrivacyModal = ({ visible, onAccept, onDecline }) => {
    const [accepted, setAccepted] = useState(false);

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onDecline}
      >
        <View style={visitorRegisterStyles.modalOverlay}>
          <View style={visitorRegisterStyles.privacyModalContainer}>
            <View style={visitorRegisterStyles.privacyModalHeader}>
              <View style={visitorRegisterStyles.privacyIconContainer}>
                <LinearGradient
                  colors={['#4F46E5', '#7C3AED']}
                  style={visitorRegisterStyles.privacyIconGradient}
                >
                  <Ionicons name="shield-checkmark" size={28} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={visitorRegisterStyles.privacyModalTitle}>Data Privacy Agreement</Text>
              <Text style={visitorRegisterStyles.privacyModalSubtitle}>
                Please review and accept our data privacy policy
              </Text>
            </View>

            <ScrollView 
              style={visitorRegisterStyles.privacyModalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={visitorRegisterStyles.privacySection}>
                <View style={visitorRegisterStyles.privacySectionHeader}>
                  <Ionicons name="information-circle" size={20} color="#4F46E5" />
                  <Text style={visitorRegisterStyles.privacySectionTitle}>Information We Collect</Text>
                </View>
                <Text style={visitorRegisterStyles.privacySectionText}>
                  • Full name and contact information (email, phone number)
                </Text>
                <Text style={visitorRegisterStyles.privacySectionText}>
                  • Government-issued ID number and photo
                </Text>
                <Text style={visitorRegisterStyles.privacySectionText}>
                  • Visit details including purpose, date, and time
                </Text>
                <Text style={visitorRegisterStyles.privacySectionText}>
                  • Vehicle information (if applicable)
                </Text>
              </View>

              <View style={visitorRegisterStyles.privacySection}>
                <View style={visitorRegisterStyles.privacySectionHeader}>
                  <Ionicons name="shield" size={20} color="#4F46E5" />
                  <Text style={visitorRegisterStyles.privacySectionTitle}>How We Use Your Data</Text>
                </View>
                <Text style={visitorRegisterStyles.privacySectionText}>
                  • To verify your identity for campus access
                </Text>
                <Text style={visitorRegisterStyles.privacySectionText}>
                  • To maintain security logs and access records
                </Text>
                <Text style={visitorRegisterStyles.privacySectionText}>
                  • To contact you regarding your visit
                </Text>
                <Text style={visitorRegisterStyles.privacySectionText}>
                  • For compliance with legal and regulatory requirements
                </Text>
              </View>

              <View style={visitorRegisterStyles.privacySection}>
                <View style={visitorRegisterStyles.privacySectionHeader}>
                  <Ionicons name="lock-closed" size={20} color="#4F46E5" />
                  <Text style={visitorRegisterStyles.privacySectionTitle}>Data Protection</Text>
                </View>
                <Text style={visitorRegisterStyles.privacySectionText}>
                  • Your data is encrypted using 256-bit encryption
                </Text>
                <Text style={visitorRegisterStyles.privacySectionText}>
                  • We never share your information with third parties
                </Text>
                <Text style={visitorRegisterStyles.privacySectionText}>
                  • You can request data deletion at any time
                </Text>
                <Text style={visitorRegisterStyles.privacySectionText}>
                  • Records are automatically deleted after 30 days
                </Text>
              </View>

              <View style={visitorRegisterStyles.privacySection}>
                <View style={visitorRegisterStyles.privacySectionHeader}>
                  <Ionicons name="time" size={20} color="#4F46E5" />
                  <Text style={visitorRegisterStyles.privacySectionTitle}>Retention Period</Text>
                </View>
                <Text style={visitorRegisterStyles.privacySectionText}>
                  • Visitor records are kept for 30 days for security purposes
                </Text>
                <Text style={visitorRegisterStyles.privacySectionText}>
                  • After 30 days, all personal data is automatically anonymized
                </Text>
              </View>

              <View style={visitorRegisterStyles.privacySection}>
                <View style={visitorRegisterStyles.privacySectionHeader}>
                  <Ionicons name="document-text" size={20} color="#4F46E5" />
                  <Text style={visitorRegisterStyles.privacySectionTitle}>Your Rights</Text>
                </View>
                <Text style={visitorRegisterStyles.privacySectionText}>
                  • Right to access your personal data
                </Text>
                <Text style={visitorRegisterStyles.privacySectionText}>
                  • Right to rectification of inaccurate data
                </Text>
                <Text style={visitorRegisterStyles.privacySectionText}>
                  • Right to erasure (right to be forgotten)
                </Text>
                <Text style={visitorRegisterStyles.privacySectionText}>
                  • Right to restrict processing
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={visitorRegisterStyles.privacyCheckboxContainer}
              onPress={() => setAccepted(!accepted)}
              activeOpacity={0.7}
            >
              <View style={[
                visitorRegisterStyles.privacyCheckbox,
                accepted && visitorRegisterStyles.privacyCheckboxChecked
              ]}>
                {accepted && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </View>
              <Text style={visitorRegisterStyles.privacyCheckboxText}>
                I have read and agree to the{' '}
                <Text 
                  style={visitorRegisterStyles.privacyLinkText}
                  onPress={() => Linking.openURL('https://sapphireaviation.edu/privacy')}
                >
                  Privacy Policy
                </Text>
              </Text>
            </TouchableOpacity>

            <View style={visitorRegisterStyles.privacyModalActions}>
              <TouchableOpacity
                style={visitorRegisterStyles.privacyDeclineButton}
                onPress={onDecline}
                activeOpacity={0.7}
              >
                <Text style={visitorRegisterStyles.privacyDeclineText}>Decline</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  visitorRegisterStyles.privacyAcceptButton,
                  !accepted && visitorRegisterStyles.privacyAcceptButtonDisabled
                ]}
                onPress={() => accepted && onAccept()}
                disabled={!accepted}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={accepted ? ['#4F46E5', '#7C3AED'] : ['#9CA3AF', '#9CA3AF']}
                  style={visitorRegisterStyles.privacyAcceptGradient}
                >
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

  return (
    <SafeAreaView style={visitorRegisterStyles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={visitorRegisterStyles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <LinearGradient
          colors={['#4F46E5', '#7C3AED', '#9333EA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={visitorRegisterStyles.header}
        >
          <View style={visitorRegisterStyles.headerButtons}>
            <TouchableOpacity
              style={visitorRegisterStyles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={visitorRegisterStyles.exitButton}
              onPress={handleExit}
              activeOpacity={0.7}
            >
              <Ionicons name="close-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <View style={visitorRegisterStyles.headerContent}>
            <View style={visitorRegisterStyles.headerIconContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={visitorRegisterStyles.headerIconGradient}
              >
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

          <View style={visitorRegisterStyles.headerDeco1} />
          <View style={visitorRegisterStyles.headerDeco2} />
          <View style={visitorRegisterStyles.headerDeco3} />
        </LinearGradient>

        <View style={visitorRegisterStyles.progressContainer}>
          <View style={visitorRegisterStyles.progressHeader}>
            <Text style={visitorRegisterStyles.progressTitle}>Registration Progress</Text>
            <Text style={visitorRegisterStyles.progressPercentage}>
              {getProgressPercentage()}%
            </Text>
          </View>
          <View style={visitorRegisterStyles.progressBarContainer}>
            <View 
              style={[
                visitorRegisterStyles.progressBar,
                { width: `${getProgressPercentage()}%` }
              ]} 
            />
          </View>
        </View>

        <View style={visitorRegisterStyles.stepIndicatorContainer}>
          <View style={visitorRegisterStyles.stepWrapper}>
            <View style={[
              visitorRegisterStyles.stepCircle,
              currentStep >= 1 && visitorRegisterStyles.stepCircleActive
            ]}>
              <Text style={[
                visitorRegisterStyles.stepCircleText,
                currentStep >= 1 && visitorRegisterStyles.stepCircleTextActive
              ]}>1</Text>
            </View>
            <View style={[
              visitorRegisterStyles.stepConnector,
              currentStep > 1 && visitorRegisterStyles.stepConnectorActive
            ]} />
            <View style={[
              visitorRegisterStyles.stepCircle,
              currentStep >= 2 && visitorRegisterStyles.stepCircleActive
            ]}>
              <Text style={[
                visitorRegisterStyles.stepCircleText,
                currentStep >= 2 && visitorRegisterStyles.stepCircleTextActive
              ]}>2</Text>
            </View>
            <View style={[
              visitorRegisterStyles.stepConnector,
              currentStep > 2 && visitorRegisterStyles.stepConnectorActive
            ]} />
            <View style={[
              visitorRegisterStyles.stepCircle,
              currentStep >= 3 && visitorRegisterStyles.stepCircleActive
            ]}>
              <Text style={[
                visitorRegisterStyles.stepCircleText,
                currentStep >= 3 && visitorRegisterStyles.stepCircleTextActive
              ]}>3</Text>
            </View>
          </View>
          <View style={visitorRegisterStyles.stepLabels}>
            <Text style={[
              visitorRegisterStyles.stepLabel,
              currentStep >= 1 && visitorRegisterStyles.stepLabelActive
            ]}>Personal</Text>
            <Text style={[
              visitorRegisterStyles.stepLabel,
              currentStep >= 2 && visitorRegisterStyles.stepLabelActive
            ]}>Visit</Text>
            <Text style={[
              visitorRegisterStyles.stepLabel,
              currentStep >= 3 && visitorRegisterStyles.stepLabelActive
            ]}>Review</Text>
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={visitorRegisterStyles.scrollContainer}
        >
          <View style={visitorRegisterStyles.content}>
            <View style={visitorRegisterStyles.sectionHeader}>
              <View>
                <Text style={visitorRegisterStyles.sectionTitle}>
                  {currentStep === 1 && "Personal Information"}
                  {currentStep === 2 && "Visit Details"}
                  {currentStep === 3 && "Review & Submit"}
                </Text>
                <Text style={visitorRegisterStyles.sectionSubtitle}>
                  {currentStep === 1 && "Please provide your details for verification"}
                  {currentStep === 2 && "Tell us about your visit"}
                  {currentStep === 3 && "Please review your information before submitting"}
                </Text>
              </View>
              <View style={visitorRegisterStyles.sectionBadge}>
                <Ionicons name="document-text" size={16} color="#4F46E5" />
                <Text style={visitorRegisterStyles.sectionBadgeText}>
                  Step {currentStep}/3
                </Text>
              </View>
            </View>

            <View style={visitorRegisterStyles.formGrid}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </View>

            <TouchableOpacity
              style={visitorRegisterStyles.continueButton}
              onPress={currentStep === 3 ? handleSubmit : handleNext}
              activeOpacity={0.8}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={currentStep === 3 ? ['#10B981', '#059669'] : ['#4F46E5', '#7C3AED']}
                style={visitorRegisterStyles.gradientButton}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={visitorRegisterStyles.continueButtonText}>
                      {currentStep === 1 && "Continue to Visit Details"}
                      {currentStep === 2 && "Continue to Review"}
                      {currentStep === 3 && "Submit Registration"}
                    </Text>
                    <Ionicons 
                      name={currentStep === 3 ? "checkmark-circle" : "arrow-forward-circle"} 
                      size={22} 
                      color="#FFFFFF" 
                    />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={visitorRegisterStyles.footerNote}>
              <Ionicons name="time-outline" size={16} color="#9CA3AF" />
              <Text style={visitorRegisterStyles.footerNoteText}>
                Estimated time: 2-3 minutes
              </Text>   
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <DataPrivacyModal
        visible={showDataPrivacy}
        onAccept={handlePrivacyAccept}
        onDecline={handlePrivacyDecline}
      />

      <SuccessModal
        visible={showSuccess}
        credentials={registeredVisitor ? {
          email: registeredVisitor.userEmail,
          password: registeredVisitor.userPassword
        } : null}
        onConfirm={handleSuccessConfirm}
      />
    </SafeAreaView>
  );
}