import CryptoJS from "crypto-js";
import forge from "node-forge";
const generateRandomString = (length: number): string => {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = charset.length;
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
const encryptRequest = async (req: any) => {
  let charRandomString = "";
  let publicKey: any = process.env.REACT_APP_RSA_PUBLIC_KEY;
  charRandomString = generateRandomString(16);
  let fullCharString = charRandomString;
  let fullCharBase64 = Buffer.from(fullCharString).toString("base64");
  let aesKey = CryptoJS.MD5(fullCharBase64).toString();
  const encryptAES = (plainText, aesKey) => {
    const key = CryptoJS.enc.Utf8.parse(aesKey);
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
  };
  const rsaEnc = (fullCharBase64: string, publicKeyPem: string) => {
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    const encryptedBytes = publicKey.encrypt(
      fullCharBase64,
      forge.pki.oids.RSA_PKCS1_PADDING as any
    );
    return forge.util.encode64(encryptedBytes);
  };

  const requestDatata = encryptAES(req, aesKey);
  const encryptedData = rsaEnc(fullCharBase64, publicKey);

  let encryptedRequestData = {
    REQUEST: requestDatata,
    DATA: removeSpaces(encryptedData),
  };

  let encryptedDatas = {
    encryptedRequestData: encryptedRequestData,
    key: aesKey,
  };

  return encryptedDatas;
};
const removeSpaces = (text: any) => {
  if (
    text.indexOf(`\r`) !== -1 ||
    text.indexOf(`\n`) !== -1 ||
    text.indexOf(`\t`) !== -1
  ) {
    text = text.replace(/(?:\r\n|\r|\n|\t)/g, "");
  }
  return text;
};

const decryptResponse = async (decryptedResponse: any, key: string) => {
  const keyWordArray = CryptoJS.enc.Utf8.parse(key);
  let decryptedData = await CryptoJS.AES.decrypt(
    decryptedResponse,
    keyWordArray,
    {
      mode: CryptoJS.mode.ECB,
    }
  );
  if (decryptedData) {
    const originalText = decryptedData.toString(CryptoJS.enc.Utf8);
    return originalText;
  }
};

export { encryptRequest, decryptResponse };
