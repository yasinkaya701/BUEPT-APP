import { launchImageLibrary } from 'react-native-image-picker';
import { getRuntimeApiKey, getAiHeaders } from './runtimeApi';

const OCR_ENDPOINT =
  typeof process !== 'undefined' && process.env && process.env.BUEPT_OCR_API_URL
    ? process.env.BUEPT_OCR_API_URL
    : 'https://api.ocr.space/parse/image';

const OCR_API_KEY =
  typeof process !== 'undefined' && process.env && process.env.BUEPT_OCR_API_KEY
    ? process.env.BUEPT_OCR_API_KEY
    : 'helloworld';

// authHeaders is now handled by getAiHeaders from runtimeApi.js

function isOcrSpaceEndpoint(url = '') {
  return /ocr\.space/i.test(String(url || ''));
}

function cleanOcrText(value = '') {
  return String(value || '')
    .replace(/\r\n?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseOcrSpaceResponse(payload = {}) {
  if (!payload || payload.IsErroredOnProcessing) {
    const err = Array.isArray(payload?.ErrorMessage) ? payload.ErrorMessage.join(' ') : 'OCR failed';
    throw new Error(err || 'OCR failed');
  }

  const results = Array.isArray(payload.ParsedResults) ? payload.ParsedResults : [];
  const text = cleanOcrText(results.map((item) => item?.ParsedText || '').join('\n'));
  if (!text) throw new Error('No text found in image');

  return {
    text,
    source: 'ocr.space',
    meta: {
      lineCount: text.split(/\n+/).filter(Boolean).length,
      charCount: text.length,
    },
  };
}

function parseGenericResponse(payload = {}) {
  const text = cleanOcrText(payload?.text || payload?.ocrText || payload?.content || '');
  if (!text) throw new Error('No OCR text returned');
  return {
    text,
    source: String(payload?.source || 'custom-ocr-api'),
    meta: {
      lineCount: text.split(/\n+/).filter(Boolean).length,
      charCount: text.length,
    },
  };
}

export async function pickPhotoFromGallery() {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: 1,
    includeBase64: true,
    quality: 0.85,
  });

  if (result?.didCancel) return null;
  if (result?.errorCode) {
    const msg = result?.errorMessage || result.errorCode;
    throw new Error(`Image picker error: ${msg}`);
  }

  const asset = Array.isArray(result?.assets) ? result.assets[0] : null;
  if (!asset?.uri) throw new Error('No photo selected');
  if (!asset?.base64) throw new Error('Image data unavailable. Please try another photo.');
  return asset;
}

export async function runPhotoOcr(asset) {
  if (!asset?.base64) throw new Error('Image data unavailable');

  if (isOcrSpaceEndpoint(OCR_ENDPOINT)) {
    const params = new URLSearchParams();
    params.append('apikey', OCR_API_KEY || 'helloworld');
    params.append('language', 'eng');
    params.append('isOverlayRequired', 'false');
    params.append('OCREngine', '2');
    params.append('base64Image', `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`);

    const res = await fetch(OCR_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `OCR request failed (${res.status})`);
    }

    const payload = await res.json();
    return parseOcrSpaceResponse(payload);
  }

  const res = await fetch(OCR_ENDPOINT, {
    method: 'POST',
    headers: getAiHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      imageBase64: asset.base64,
      mimeType: asset.type || 'image/jpeg',
      fileName: asset.fileName || 'photo.jpg',
      language: 'en',
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `OCR request failed (${res.status})`);
  }

  const payload = await res.json();
  return parseGenericResponse(payload);
}
