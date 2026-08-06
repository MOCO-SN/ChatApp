const E2EE = {
  ALG: {
    rsa: { name: "RSA-OAEP", hash: "SHA-256" },
    aes: { name: "AES-GCM", length: 256 },
    jwk: "jwk",
    spki: "spki",
    pkcs8: "pkcs8",
  },

  bufferToBase64(buf) {
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
  },

  base64ToBuffer(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  },

  arrayBufferToBase64(buf) {
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  },

  base64ToArrayBuffer(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  },

  async generateKeyPair() {
    const keyPair = await crypto.subtle.generateKey(
      { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
      true,
      ["encrypt", "decrypt"]
    );
    return keyPair;
  },

  async exportPublicKey(keyPair) {
    const exported = await crypto.subtle.exportKey("spki", keyPair.publicKey);
    return this.arrayBufferToBase64(exported);
  },

  async exportPrivateKey(keyPair) {
    const exported = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
    return this.arrayBufferToBase64(exported);
  },

  async importPublicKey(base64Key) {
    const binary = atob(base64Key);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return crypto.subtle.importKey("spki", bytes.buffer, { name: "RSA-OAEP", hash: "SHA-256" }, true, ["encrypt"]);
  },

  async importPrivateKey(base64Key) {
    const binary = atob(base64Key);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return crypto.subtle.importKey("pkcs8", bytes.buffer, { name: "RSA-OAEP", hash: "SHA-256" }, true, ["decrypt"]);
  },

  async encrypt(messageText, recipientPublicKeyBase64) {
    const recipientPublicKey = await this.importPublicKey(recipientPublicKeyBase64);
    const aesKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedMessage = new TextEncoder().encode(messageText);
    const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, encodedMessage);
    const rawWrappedKey = await crypto.subtle.wrapKey("raw", aesKey, recipientPublicKey, { name: "RSA-OAEP" });
    return {
      ct: this.arrayBufferToBase64(ciphertext),
      wk: this.arrayBufferToBase64(rawWrappedKey),
      iv: this.arrayBufferToBase64(iv.buffer),
    };
  },

  async decrypt(e2eePayload, privateKey) {
    try {
      const aesKeyBuffer = await crypto.subtle.unwrapKey("raw", this.base64ToArrayBuffer(e2eePayload.wk), privateKey, { name: "RSA-OAEP" }, { name: "AES-GCM", length: 256 }, ["encrypt", "decrypt"]);
      const ciphertext = this.base64ToArrayBuffer(e2eePayload.ct);
      const iv = new Uint8Array(this.base64ToArrayBuffer(e2eePayload.iv));
      const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, aesKeyBuffer, ciphertext);
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error("E2EE decryption failed:", error);
      return "[Encrypted message - unable to decrypt]";
    }
  },

  async getOrCreateKeyPair() {
    const stored = localStorage.getItem("e2ee_private_key");
    if (stored) {
      return await this.importPrivateKey(stored);
    }
    const keyPair = await this.generateKeyPair();
    const privateKey = await this.exportPrivateKey(keyPair);
    localStorage.setItem("e2ee_private_key", privateKey);
    return keyPair;
  },

  async getPublicKeyBase64() {
    const stored = localStorage.getItem("e2ee_public_key");
    if (stored) return stored;
    const keyPair = await this.getOrCreateKeyPair();
    const publicKey = await this.exportPublicKey(keyPair);
    localStorage.setItem("e2ee_public_key", publicKey);
    return publicKey;
  },
};

export default E2EE;
