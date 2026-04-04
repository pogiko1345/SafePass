// utils/IDScannerService.js
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

class IDScannerService {
  constructor() {
    this.isAvailable = true;
    // Cache for scanned data to avoid re-scanning same image
    this.scanCache = new Map();
  }

  // Process the uploaded ID image and extract information
  async scanIDImage(imageUri) {
    console.log('🔍 Scanning ID card image...');
    
    // Check cache first
    if (this.scanCache.has(imageUri)) {
      console.log('📦 Returning cached scan result');
      return this.scanCache.get(imageUri);
    }
    
    try {
      // Step 1: Preprocess the image (resize, enhance)
      const processedImage = await this.preprocessImage(imageUri);
      
      // Step 2: Extract text from image using OCR
      const extractedText = await this.extractTextFromImage(processedImage);
      
      // Step 3: Parse the extracted text to get structured data
      const parsedData = this.parseExtractedText(extractedText);
      
      // Step 4: Validate the extracted data
      const validatedData = this.validateExtractedData(parsedData);
      
      // Cache the result
      this.scanCache.set(imageUri, validatedData);
      
      console.log('✅ ID scan completed:', validatedData);
      return validatedData;
      
    } catch (error) {
      console.error('ID scan error:', error);
      return null;
    }
  }

  // Preprocess image for better OCR results
  async preprocessImage(imageUri) {
    try {
      // Resize and enhance the image
      const manipulated = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 1024 } }, // Resize to reasonable size
          { rotate: 0 },
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      
      return manipulated.uri;
    } catch (error) {
      console.error('Image preprocessing error:', error);
      return imageUri;
    }
  }

  // Extract text from image using OCR
  async extractTextFromImage(imageUri) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, you would call an OCR API here
    // For demo, we'll generate consistent realistic OCR text
    
    // Generate a realistic OCR result based on common ID patterns
    return this.generateRealisticOCRText();
  }

  // Generate realistic OCR text for demo
  generateRealisticOCRText() {
    // Common Philippine ID formats
    const firstNames = ['Juan', 'Maria', 'Jose', 'Ana', 'Carlos', 'Rosa', 'Miguel', 'Isabella', 'Antonio', 'Elena'];
    const lastNames = ['Santos', 'Reyes', 'Cruz', 'Garcia', 'Dela Cruz', 'Mendoza', 'Lopez', 'Gonzales', 'Aquino', 'Fernandez'];
    
    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    // Generate random ID number
    const idTypes = ['PASSPORT', 'DRIVERS', 'NATIONAL', 'UMID'];
    const idType = idTypes[Math.floor(Math.random() * idTypes.length)];
    const idNumber = `${idType}-${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`;
    
    // Generate random date (between 1960-2000)
    const year = Math.floor(Math.random() * (2000 - 1960) + 1960);
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    const dateOfBirth = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
    
    // Philippine addresses
    const cities = ['Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig', 'Cebu City', 'Davao City'];
    const streets = ['Rizal Ave', 'Mabini St', 'EDSA', 'Ayala Ave', 'Bonifacio St', 'Lapu-Lapu St'];
    
    const city = cities[Math.floor(Math.random() * cities.length)];
    const street = streets[Math.floor(Math.random() * streets.length)];
    const address = `${Math.floor(Math.random() * 1000)} ${street}, ${city}`;
    
    // Create realistic OCR text
    return `GOVERNMENT IDENTIFICATION
----------------------------------------
FULL NAME: ${randomFirstName} ${randomLastName}
ID NUMBER: ${idNumber}
DATE OF BIRTH: ${dateOfBirth}
ADDRESS: ${address}
NATIONALITY: Filipino
SEX: ${Math.random() > 0.5 ? 'M' : 'F'}
BLOOD TYPE: ${['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'][Math.floor(Math.random() * 8)]}
ISSUED: ${new Date().getFullYear() - 5}
EXPIRES: ${new Date().getFullYear() + 5}
----------------------------------------`;
  }

  // Parse extracted text to structured data with improved pattern matching
  parseExtractedText(text) {
    const data = {
      fullName: '',
      idNumber: '',
      dateOfBirth: '',
      address: '',
      nationality: '',
      rawText: text
    };
    
    // Enhanced patterns for better extraction
    const patterns = {
      fullName: [
        /(?:full name|name)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
        /name[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
        /([A-Z][a-z]+)\s+([A-Z][a-z]+)(?:\s+[A-Z][a-z]+)?\s+(?:is|was|born)/i,
      ],
      idNumber: [
        /(?:id(?: number)?|passport|license|umid)[:\s]+([A-Z0-9\-]+)/i,
        /(?:id\s*no)[:\s]+([A-Z0-9\-]+)/i,
        /([A-Z]+-\d{9,})/i,
      ],
      dateOfBirth: [
        /(?:dob|birth|birthdate|date of birth)[:\s]+(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
        /(?:born on)[:\s]+(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
        /(\d{1,2}\/\d{1,2}\/\d{4})/i,
      ],
      address: [
        /(?:address|addr|residence)[:\s]+([A-Za-z0-9\s,\.]+)/i,
        /(\d+\s+[A-Za-z]+\s+[A-Za-z]+\s*,\s*[A-Za-z\s]+)/i,
      ],
      nationality: [
        /(?:nationality|citizenship)[:\s]+([A-Za-z]+)/i,
        /(?:country)[:\s]+([A-Za-z]+)/i,
      ],
    };
    
    // Apply patterns for each field
    for (const [key, patternList] of Object.entries(patterns)) {
      for (const pattern of patternList) {
        const match = text.match(pattern);
        if (match && match[1]) {
          data[key] = match[1].trim();
          break; // Stop once we find a match
        }
      }
    }
    
    // If full name wasn't found but we have name parts, try to construct
    if (!data.fullName && text.match(/[A-Z][a-z]+\s+[A-Z][a-z]+/)) {
      const nameMatch = text.match(/([A-Z][a-z]+\s+[A-Z][a-z]+)/);
      if (nameMatch) {
        data.fullName = nameMatch[1];
      }
    }
    
    return data;
  }

  // Validate and clean extracted data
  validateExtractedData(data) {
    const validated = { ...data };
    
    // Clean name (remove extra spaces, ensure proper capitalization)
    if (validated.fullName) {
      validated.fullName = validated.fullName
        .replace(/\s+/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      // Ensure at least first and last name (min 2 words)
      if (validated.fullName.split(' ').length < 2) {
        // Add a placeholder last name if only first name found
        validated.fullName = `${validated.fullName} [Last Name Not Detected]`;
      }
    }
    
    // Clean ID number
    if (validated.idNumber) {
      validated.idNumber = validated.idNumber.replace(/\s+/g, '');
      // Ensure ID number is uppercase
      validated.idNumber = validated.idNumber.toUpperCase();
    }
    
    // Format date of birth consistently
    if (validated.dateOfBirth) {
      // Try to standardize date format
      const dateParts = validated.dateOfBirth.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
      if (dateParts) {
        let year = dateParts[3];
        if (year.length === 2) {
          year = '19' + year;
        }
        validated.dateOfBirth = `${dateParts[1].padStart(2, '0')}/${dateParts[2].padStart(2, '0')}/${year}`;
      }
    }
    
    return validated;
  }

  // Enhanced method to check if the image likely contains an ID
  async isIDCard(imageUri) {
    try {
      // In production, you'd use ML to detect if the image is an ID card
      // For demo, we'll do basic checks:
      
      // Check image dimensions
      const info = await ImageManipulator.manipulateAsync(
        imageUri,
        [],
        { format: ImageManipulator.SaveFormat.JPEG }
      );
      
      // ID cards are usually rectangular with specific aspect ratios
      const aspectRatio = info.width / info.height;
      const isLikelyID = aspectRatio > 0.6 && aspectRatio < 0.8;
      
      console.log(`📐 Image dimensions: ${info.width}x${info.height}, aspect: ${aspectRatio}`);
      console.log(`🔍 Is likely ID: ${isLikelyID}`);
      
      return true; // For demo, always return true
    } catch (error) {
      console.error('ID detection error:', error);
      return true; // Default to true for demo
    }
  }

  // Clear cache (useful when user uploads a new image)
  clearCache() {
    this.scanCache.clear();
    console.log('🗑️ ID scanner cache cleared');
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.scanCache.size,
      keys: Array.from(this.scanCache.keys())
    };
  }
}

export default new IDScannerService();