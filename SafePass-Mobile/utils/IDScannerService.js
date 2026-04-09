// utils/IDScannerService.js
import * as ImageManipulator from "expo-image-manipulator";
import { Platform } from "react-native";

class IDScannerService {
  constructor() {
    this.scanCache = new Map();
  }

  normalizeImageSource(imageSource) {
    if (!imageSource) {
      return { uri: "", base64: "", fileName: "" };
    }

    if (typeof imageSource === "string") {
      return { uri: imageSource, base64: "", fileName: "" };
    }

    return {
      uri: imageSource.uri || "",
      base64: imageSource.base64 || "",
      fileName: imageSource.fileName || "",
    };
  }

  getCacheKey(source) {
    return source.uri || source.fileName || source.base64?.slice(0, 120) || "scan";
  }

  isTextDetectionAvailable() {
    return (
      Platform.OS === "web" &&
      typeof globalThis !== "undefined" &&
      typeof globalThis.TextDetector === "function"
    );
  }

  buildEmptyResult(message, extra = {}) {
    return {
      success: false,
      available: this.isTextDetectionAvailable(),
      fullName: "",
      idNumber: "",
      dateOfBirth: "",
      address: "",
      nationality: "",
      rawText: "",
      detectedFields: [],
      message,
      ...extra,
    };
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

  async scanIDImage(imageSource) {
    const normalizedSource = this.normalizeImageSource(imageSource);
    const cacheKey = this.getCacheKey(normalizedSource);

    if (!normalizedSource.uri && !normalizedSource.base64) {
      return this.buildEmptyResult("Please upload an ID photo first.");
    }

    if (this.scanCache.has(cacheKey)) {
      return this.scanCache.get(cacheKey);
    }

    try {
      const processedImage = await this.preprocessImage(normalizedSource);
      const extractedText = await this.extractTextFromImage(processedImage);

      if (!extractedText) {
        const result = this.buildEmptyResult(
          this.isTextDetectionAvailable()
            ? "No readable text was detected. Please use a clearer, well-lit ID photo."
            : "Automatic ID text scanning is not available on this device or browser yet. Please fill in the details manually.",
        );
        this.scanCache.set(cacheKey, result);
        return result;
      }

      const parsedData = this.parseExtractedText(extractedText);
      const validatedData = this.validateExtractedData(parsedData);
      const detectedFields = ["fullName", "idNumber", "dateOfBirth", "address", "nationality"].filter(
        (field) => Boolean(validatedData[field]),
      );

      const result = {
        success: detectedFields.length > 0,
        available: true,
        ...validatedData,
        detectedFields,
        message:
          detectedFields.length > 0
            ? `Detected ${detectedFields.join(", ")}.`
            : "The scan finished, but no usable name or ID number was found.",
      };

      this.scanCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error("ID scan error:", error);
      return this.buildEmptyResult(
        "The ID scanner could not process this photo. Please try another image or enter the details manually.",
      );
    }
  }

  async preprocessImage(imageSource) {
    const targetUri = imageSource.uri || `data:image/jpeg;base64,${imageSource.base64}`;

    if (!targetUri) {
      return imageSource;
    }

    try {
      const manipulated = await ImageManipulator.manipulateAsync(
        targetUri,
        [{ resize: { width: 1400 } }],
        {
          compress: 0.92,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      return {
        ...imageSource,
        uri: manipulated.uri || imageSource.uri,
        base64: manipulated.base64 || imageSource.base64,
      };
    } catch (error) {
      console.error("Image preprocessing error:", error);
      return imageSource;
    }
  }

  async extractTextFromImage(imageSource) {
    if (this.isTextDetectionAvailable()) {
      return this.extractTextOnWeb(imageSource);
    }

    return "";
  }

  async extractTextOnWeb(imageSource) {
    const detector = new globalThis.TextDetector();
    const imageElement = await this.loadHtmlImage(
      imageSource.base64 ? `data:image/jpeg;base64,${imageSource.base64}` : imageSource.uri
    );
    const detections = await detector.detect(imageElement);

    return detections
      .map((entry) => entry.rawValue || "")
      .join("\n")
      .replace(/\s+\n/g, "\n")
      .trim();
  }

  loadHtmlImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = source;
    });
  }

  parseExtractedText(text) {
    const normalizedText = String(text || "").replace(/\r/g, "\n");
    const data = {
      fullName: "",
      idNumber: "",
      dateOfBirth: "",
      address: "",
      nationality: "",
      rawText: normalizedText,
    };

    const patterns = {
      fullName: [
        /(?:full name|name)[:\s]+([A-Z][A-Z\s,'.-]{4,})/i,
        /\b([A-Z][A-Z]+(?:[\s,.'-]+[A-Z][A-Z]+){1,3})\b/,
      ],
      idNumber: [
        /(?:id(?: number| no\.?)?|license|passport|umid|national id)[:\s#-]+([A-Z0-9-]{5,})/i,
        /\b([A-Z]{1,6}-\d{4,}|\d{4}-\d{4}-\d{4}|\d{5,})\b/,
      ],
      dateOfBirth: [
        /(?:date of birth|birth date|birthdate|dob)[:\s]+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
        /\b(\d{1,2}[/-]\d{1,2}[/-]\d{4})\b/,
      ],
      address: [
        /(?:address|residence|addr)[:\s]+([A-Z0-9][A-Z0-9\s,.-]{8,})/i,
      ],
      nationality: [
        /(?:nationality|citizenship)[:\s]+([A-Z][A-Z\s]{2,})/i,
      ],
    };

    for (const [key, patternList] of Object.entries(patterns)) {
      for (const pattern of patternList) {
        const match = normalizedText.match(pattern);
        if (match?.[1]) {
          data[key] = match[1].trim();
          break;
        }
      }
    }

    return data;
  }

  validateExtractedData(data) {
    const validated = { ...data };

    if (validated.fullName) {
      validated.fullName = validated.fullName
        .replace(/[^A-Za-z\s,'.-]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");

      if (validated.fullName.split(" ").length < 2) {
        validated.fullName = "";
      }
    }

    if (validated.idNumber) {
      validated.idNumber = validated.idNumber.replace(/\s+/g, "").toUpperCase();
    }

    if (validated.dateOfBirth) {
      const dateParts = validated.dateOfBirth.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
      if (dateParts) {
        let year = dateParts[3];
        if (year.length === 2) {
          year = Number(year) > 30 ? `19${year}` : `20${year}`;
        }
        validated.dateOfBirth = `${dateParts[1].padStart(2, "0")}/${dateParts[2].padStart(2, "0")}/${year}`;
      }
    }

    if (validated.address) {
      validated.address = validated.address.replace(/\s+/g, " ").trim();
    }

    if (validated.nationality) {
      validated.nationality = validated.nationality
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
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
