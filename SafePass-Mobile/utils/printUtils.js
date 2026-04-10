// utils/printUtils.js
import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";
import { Image, Platform } from "react-native";
import { getPrintHTML } from "../styles/PrintStyles";

const getSchoolLogoSource = () => {
  try {
    return (
      Image.resolveAssetSource(require("../assets/LogoSapphire.jpg"))?.uri || ""
    );
  } catch (error) {
    console.warn("Unable to resolve school logo for print:", error);
    return "";
  }
};

const convertAssetToDataUrl = async (assetUri) => {
  if (!assetUri || Platform.OS !== "web" || typeof fetch === "undefined") {
    return assetUri;
  }

  try {
    const response = await fetch(assetUri);
    const blob = await response.blob();

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result || assetUri);
      reader.onerror = () => reject(new Error("Failed to convert logo to data URL."));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("Unable to convert print logo to embedded data URL:", error);
    return assetUri;
  }
};

export const printUserList = async (users, title, activeMenu) => {
  if (!users || users.length === 0) {
    throw new Error("No users to print");
  }

  const schoolLogoSource = await convertAssetToDataUrl(getSchoolLogoSource());
  const htmlContent = getPrintHTML(users, title, activeMenu, schoolLogoSource);

  try {
    if (Platform.OS === "web") {
      await printUserListWeb(users, title, activeMenu);
    } else {
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });
      await shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Print Users List",
        UTI: "com.adobe.pdf",
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error("Print error:", error);
    throw error;
  }
};

// Web-only fallback print function
export const printUserListWeb = async (users, title, activeMenu) => {
  if (!users || users.length === 0) {
    throw new Error("No users to print");
  }

  if (typeof document === "undefined") {
    throw new Error("Print preview is only available in a browser.");
  }

  const startPrintPreview = async () => {
    const schoolLogoSource = await convertAssetToDataUrl(getSchoolLogoSource());
    const htmlContent = getPrintHTML(users, title, activeMenu, schoolLogoSource);

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.setAttribute("aria-hidden", "true");

    document.body.appendChild(iframe);

    const frameDocument =
      iframe.contentWindow?.document || iframe.contentDocument || null;

    if (!frameDocument) {
      document.body.removeChild(iframe);
      throw new Error("Unable to create print preview.");
    }

    frameDocument.open();
    frameDocument.write(htmlContent);
    frameDocument.close();

    const cleanup = () => {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1200);
    };

    const triggerPrint = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      cleanup();
    };

    const waitForImagesThenPrint = () => {
      const images = Array.from(frameDocument.images || []);
      const pendingImages = images.filter((image) => !image.complete);

      if (pendingImages.length === 0) {
        triggerPrint();
        return;
      }

      let remaining = pendingImages.length;
      const finish = () => {
        remaining -= 1;
        if (remaining <= 0) {
          triggerPrint();
        }
      };

      pendingImages.forEach((image) => {
        image.addEventListener("load", finish, { once: true });
        image.addEventListener("error", finish, { once: true });
      });

      setTimeout(() => {
        if (remaining > 0) {
          triggerPrint();
        }
      }, 1500);
    };

    iframe.onload = () => {
      waitForImagesThenPrint();
    };

    if (frameDocument.readyState === "complete") {
      waitForImagesThenPrint();
    }
  };

  return startPrintPreview();
};
