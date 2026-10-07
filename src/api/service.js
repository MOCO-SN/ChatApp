const API_BASE = 'https://chatapp-sachinpatel34241.wasmer.app';
const API_SECRET = 'super_secure_shared_secret_key_2026'; // Must match PHP

/**
 * Creates an HMAC SHA-256 signature using the Web Crypto API
 */
async function generateSignature(timestamp, bodyString) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(API_SECRET);
  const key = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const data = encoder.encode(timestamp + bodyString);
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, data);
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * A wrapper for fetch that automatically applies the security handshake
 */
async function secureFetch(endpoint, payload) {
  const bodyString = JSON.stringify(payload);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = await generateSignature(timestamp, bodyString);

  return fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Timestamp': timestamp,
      'X-Signature': signature
    },
    body: bodyString
  });
}

export const uploadDocument = async (base64Image) => {
  const res = await secureFetch(`/upload-cloudinary`, { image: base64Image });
  return res.json();
};

export const fetchFirebaseConfig = async () => {
  const res = await secureFetch(`/firebase-config`, {});
  return res.json();
};


