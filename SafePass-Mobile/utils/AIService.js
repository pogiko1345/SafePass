// utils/AIService.js
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

class AIService {
  constructor() {
    // Mock AI service - In production, you'd connect to OpenAI, Google Vision, or a custom API
    this.isAvailable = true;
  }

  // Extract text from ID card image (OCR)
  async extractTextFromID(imageUri) {
    console.log('🔍 Analyzing ID card image...');
    
    // In production, you'd use:
    // - Google Cloud Vision API
    // - Tesseract.js for OCR
    // - Custom ML model
    
    // For demo, simulate AI extraction
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          fullName: this.generateRandomName(),
          idNumber: this.generateRandomID(),
          isValid: true
        });
      }, 2000);
    });
  }

  // Smart form filler with questions
  async smartFillForm(userInput) {
    // Parse user input using simple NLP
    const input = userInput.toLowerCase();
    
    const patterns = {
      name: /(?:my name is|i am|name's?)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
      email: /(?:email is?)\s+([^\s@]+@[^\s@]+\.[^\s@]+)/i,
      phone: /(?:phone|mobile|number is?)\s+(\d{11}|\d{4}\s?\d{3}\s?\d{4})/i,
      id: /(?:id|passport|license)\s+([A-Z0-9\-]+)/i,
      purpose: /(?:purpose|visiting for|here for)\s+(.+?)(?:\s+and|\s+to|$)/i,
    };

    const extracted = {};
    
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = input.match(pattern);
      if (match) {
        extracted[key] = match[1].trim();
      }
    }

    return extracted;
  }

  // Generate sample data for demo
  generateRandomName() {
    const firstNames = ['John', 'Maria', 'David', 'Sarah', 'Michael', 'Jessica', 'Robert', 'Jennifer'];
    const lastNames = ['Smith', 'Garcia', 'Johnson', 'Brown', 'Wilson', 'Lee', 'Martinez', 'Davis'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }

  generateRandomID() {
    const types = ['PASSPORT', 'DRIVERS', 'NATIONAL'];
    const type = types[Math.floor(Math.random() * types.length)];
    const number = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    return `${type}-${number}`;
  }

  // Ask AI assistant questions
  async askQuestion(context, field) {
    const questions = {
      fullName: "What's your full name?",
      email: "What's your email address?",
      phoneNumber: "What's your mobile number?",
      idNumber: "What's your ID number (passport/driver's license)?",
      purposeOfVisit: "What's the purpose of your visit?",
      vehicleNumber: "Do you have a vehicle? If yes, what's the plate number?",
    };
    
    return questions[field] || `Please provide your ${field}`;
  }

  // Validate extracted data
  validateExtractedData(data) {
    const errors = [];
    
    if (!data.fullName || data.fullName.length < 2) {
      errors.push('Name seems invalid. Please check.');
    }
    
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Email format is invalid.');
    }
    
    if (!data.phoneNumber || !/^\d{11}$/.test(data.phoneNumber.replace(/\D/g, ''))) {
      errors.push('Phone number should be 11 digits.');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default new AIService();