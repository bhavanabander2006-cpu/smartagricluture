
import { GoogleGenAI, Type } from "@google/genai";
import { CropReport, YieldPrediction, Advisory, FarmAlert } from "../types";

export const analyzeCropImage = async (base64Image: string): Promise<CropReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: "Analyze this crop image for diseases. Provide the disease name, confidence level (0-1), severity level (Low, Moderate, High, Critical), list of symptoms, treatment steps, and prevention tips in JSON format." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          diseaseName: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          severity: { type: Type.STRING, enum: ['Low', 'Moderate', 'High', 'Critical'] },
          symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
          treatment: { type: Type.ARRAY, items: { type: Type.STRING } },
          prevention: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["diseaseName", "confidence", "severity", "symptoms", "treatment", "prevention"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const getSmartAdvisory = async (cropType: string, region: string, growthStage: string): Promise<Advisory> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Provide irrigation and fertilizer advice for ${cropType} in ${region} at ${growthStage} stage. Categorize risk level as Safe, Watch, or Danger based on typical pests/weather for this stage. Return in JSON.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          irrigation: { type: Type.STRING },
          fertilizer: { type: Type.STRING },
          pestAlert: { type: Type.STRING },
          riskLevel: { type: Type.STRING, enum: ['Safe', 'Watch', 'Danger'] }
        },
        required: ["irrigation", "fertilizer", "pestAlert", "riskLevel"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const predictYield = async (data: { crop: string, area: number, soil: string, location: string }): Promise<YieldPrediction> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Predict crop yield for ${data.area} hectares of ${data.crop} in ${data.location} with ${data.soil} soil. Provide expected yield as a range (e.g., "12 - 15"), unit (e.g., Tons), key growth factors, and 3 recommendations. Return in JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          yieldRange: { type: Type.STRING },
          unit: { type: Type.STRING },
          factors: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          confidenceScore: { type: Type.NUMBER }
        },
        required: ["yieldRange", "unit", "factors", "recommendations", "confidenceScore"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const getDailyFarmAlerts = async (context: string): Promise<FarmAlert[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Generate 3 real-time daily farm alerts for ${context} as of today. Include type (Weather, Pest, Market, Task), title, short description, and urgency (Normal, Urgent). Return as a JSON array. Use Google Search for current news.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['Weather', 'Pest', 'Market', 'Task'] },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            urgency: { type: Type.STRING, enum: ['Normal', 'Urgent'] }
          },
          required: ["type", "title", "description", "urgency"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const searchNearbyFertilizers = async (searchParam: { lat?: number; lng?: number; district?: string }) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = searchParam.district 
    ? `List the top agricultural input centers, fertilizer shops, and Krishi Seva Kendras in ${searchParam.district}. For each store, clearly state its Name, full Address, and Phone Number. Provide a comprehensive list.`
    : "List the nearest agricultural input centers and fertilizer shops around my current location. For each store, clearly state its Name, full Address, and Phone Number.";

  const config: any = { 
    tools: [{ googleMaps: {} }, { googleSearch: {} }] 
  };
  
  if (searchParam.lat !== undefined && searchParam.lng !== undefined) {
    config.toolConfig = { retrievalConfig: { latLng: { latitude: searchParam.lat, longitude: searchParam.lng } } };
  }

  // Maps grounding is only supported in Gemini 2.5 series models.
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: config,
  });
  
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const places = groundingChunks.map((chunk: any) => {
    if (chunk.maps) return { title: chunk.maps.title, uri: chunk.maps.uri };
    if (chunk.web) return { title: chunk.web.title, uri: chunk.web.uri };
    return null;
  }).filter(Boolean);

  return {
    text: response.text || "No detailed directory found for this location.",
    places: places
  };
};

export const getRealtimeWeather = async (lat: number, lng: number) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Get current real-time weather as of today for coordinates ${lat}, ${lng}. Return temp (C), humidity (%), wind (km/h), and summary in JSON. Use Google Search for the most up-to-date data.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          temp: { type: Type.NUMBER },
          humidity: { type: Type.NUMBER },
          wind: { type: Type.NUMBER },
          summary: { type: Type.STRING }
        },
        required: ["temp", "humidity", "wind", "summary"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const getAllCommodityPrices = async () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Get latest real-time agricultural mandi prices in India for today. Include Wheat, Rice, Tomato, Onion. Return JSON with price, trend, and a short 'sentiment' for farmers (e.g., 'Sell now' or 'Hold'). Use Google Search for live data.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          prices: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING },
                price: { type: Type.STRING },
                change: { type: Type.STRING },
                up: { type: Type.BOOLEAN },
                sentiment: { type: Type.STRING }
              },
              required: ["item", "price", "change", "up", "sentiment"]
            }
          }
        },
        required: ["prices"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};
