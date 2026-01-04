
import { GoogleGenAI, Type } from "@google/genai";

// Helper to check if API key exists
const isApiKeyAvailable = !!process.env.API_KEY && process.env.API_KEY !== 'undefined';

// Conditional initialization
const ai = isApiKeyAvailable ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;

/**
 * Polishes technical findings and actions.
 * Fallback: Simple text formatting if AI is unavailable.
 */
export const polishServiceReport = async (findings: string, actions: string) => {
  if (!ai) {
    console.warn("Gemini API key missing. Using local fallback for report polishing.");
    // Simulate a "polished" look by ensuring capitalization and adding professional prefixes
    const localPolish = (text: string) => {
      if (!text) return "";
      const trimmed = text.trim();
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    };
    
    return {
      polishedFindings: `Observed: ${localPolish(findings)}`,
      polishedActions: `Resolved: ${localPolish(actions)}`
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As a professional technician for SMART CITY TECHNOLOGIES, polish the following service report notes into professional technical documentation.
      
      Original Findings: ${findings}
      Original Actions: ${actions}
      
      Provide a polished version of both 'Findings' and 'Actions Taken' in a structured format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            polishedFindings: { type: Type.STRING },
            polishedActions: { type: Type.STRING }
          },
          required: ["polishedFindings", "polishedActions"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Polish Error:", error);
    return { polishedFindings: findings, polishedActions: actions };
  }
};

/**
 * Suggests invoice line items based on report content.
 * Fallback: Standard technical service fees if AI is unavailable.
 */
export const generateInvoiceSummary = async (serviceReportContent: string) => {
  if (!ai) {
    console.warn("Gemini API key missing. Using local fallback for invoice generation.");
    return [
      { description: "Standard Site Attendance & Diagnostics", amount: 80.00 },
      { description: "Technical Corrective Maintenance", amount: 120.00 },
      { description: "System Testing & Commissioning", amount: 50.00 }
    ];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on this service report: "${serviceReportContent}", suggest 3 line items for an invoice with approximate professional service charges in SGD.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              amount: { type: Type.NUMBER }
            },
            required: ["description", "amount"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Invoice Suggestion Error:", error);
    return [{ description: "General technical service fee", amount: 150 }];
  }
};
