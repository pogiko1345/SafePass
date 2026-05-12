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

  generateAnalyticsInsights(data = {}) {
    const topOffice = data.topVisitedOffice || null;
    const offices = Array.isArray(data.mostVisitedOfficeItems) ? data.mostVisitedOfficeItems : [];
    const stats = data.stats || {};
    const distributionItems = Array.isArray(data.distributionItems) ? data.distributionItems : [];
    const approvalRate = Number(data.approvalRate || 0);
    const chartPeakLabel = data.chartPeakLabel || "the current period";
    const chartPeakValue = Number(data.chartPeakValue || 0);
    const attendanceCount = Number(data.attendanceCount || 0);
    const visitorCount = Number(data.visitorCount || 0);
    const pendingRequests = Number(stats.pendingRequests || 0);
    const todayVisits = Number(stats.todayVisits || 0);
    const upcomingVisits = Number(stats.upcomingVisits || 0);
    const topStatus = [...distributionItems].sort((left, right) => (right.value || 0) - (left.value || 0))[0];

    const observations = [];
    const actions = [];

    if (topOffice) {
      const studentShare = topOffice.total ? Math.round(((topOffice.students || 0) / topOffice.total) * 100) : 0;
      const visitorShare = topOffice.total ? Math.round(((topOffice.visitors || 0) / topOffice.total) * 100) : 0;
      const staffShare = topOffice.total ? Math.round(((topOffice.staff || 0) / topOffice.total) * 100) : 0;
      observations.push(`${topOffice.label} is the busiest office with ${topOffice.total} recorded interaction${topOffice.total === 1 ? "" : "s"}.`);
      observations.push(`Traffic mix there is ${studentShare}% student, ${visitorShare}% visitor, and ${staffShare}% staff.`);

      if ((topOffice.visitors || 0) >= Math.max(topOffice.students || 0, topOffice.staff || 0)) {
        actions.push(`Prepare visitor assistance at ${topOffice.label} and check appointment staffing for that area.`);
      } else if ((topOffice.students || 0) >= Math.max(topOffice.visitors || 0, topOffice.staff || 0)) {
        actions.push(`Review student tap flow near ${topOffice.label} to avoid queueing during peak class movement.`);
      } else {
        actions.push(`Check staff coverage and reader availability around ${topOffice.label}.`);
      }
    } else {
      observations.push("There is not enough office traffic yet to rank the busiest office.");
      actions.push("Keep NFC taps and visitor office assignments active so the analytics can learn useful patterns.");
    }

    if (pendingRequests > 0) {
      observations.push(`${pendingRequests} request${pendingRequests === 1 ? "" : "s"} still need admin or staff review.`);
      actions.push("Clear pending requests before peak arrival periods so visitor cards can activate on time.");
    }

    if (approvalRate < 60 && (stats.totalRequests || 0) > 0) {
      observations.push(`Approval rate is ${approvalRate}%, which may indicate slow review or incomplete requests.`);
      actions.push("Check rejected or pending requests for common missing details.");
    } else if ((stats.totalRequests || 0) > 0) {
      observations.push(`Approval rate is stable at ${approvalRate}%.`);
    }

    if (chartPeakValue > 0) {
      observations.push(`${chartPeakLabel} is the busiest trend window with ${chartPeakValue} recorded request${chartPeakValue === 1 ? "" : "s"}.`);
    }

    if (todayVisits > 0 || upcomingVisits > 0) {
      actions.push(`Coordinate with security for ${todayVisits} visit${todayVisits === 1 ? "" : "s"} today and ${upcomingVisits} upcoming approved visit${upcomingVisits === 1 ? "" : "s"}.`);
    }

    const confidence =
      offices.length >= 3 && attendanceCount + visitorCount >= 10
        ? "High"
        : offices.length > 0
          ? "Medium"
          : "Low";

    return {
      confidence,
      summary: topOffice
        ? `AI summary: ${topOffice.label} is currently the strongest traffic signal. Watch pending approvals and make sure the area has enough support.`
        : "AI summary: Not enough traffic data yet. The system will improve once more taps and office assignments are recorded.",
      observations: observations.slice(0, 4),
      actions: actions.slice(0, 3),
      topStatusLabel: topStatus?.label || "No status leader",
    };
  }
}

export default new AIService();
