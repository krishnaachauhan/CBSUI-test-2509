import CryptoJS from "crypto-js";

const decryptString = (encryptString: string) => {
  var secretKey = "SUPERACUTE@MKS";
  var keyBytes = CryptoJS.PBKDF2(secretKey, "Ivan Medvedev", {
    keySize: 48 / 4,
    iterations: 1000,
  });
  console.log(keyBytes.toString());

  // take first 32 bytes as key (like in C# code)
  var key = new CryptoJS.lib.WordArray.init(keyBytes.words, 32);

  // // skip first 32 bytes and take next 16 bytes as IV
  var iv = new CryptoJS.lib.WordArray.init(keyBytes.words.splice(32 / 4), 16);

  // console.log(key.toString());
  //console.log(encryptString, CryptoJS.enc.Base64.parse(encryptString));

  var dec = CryptoJS.AES.decrypt(
    {
      ciphertext: CryptoJS.enc.Base64.parse(
        CryptoJS.enc.Base64.parse(encryptString).toString(CryptoJS.enc.Utf8)
      ),
    },
    key,
    {
      iv: iv,
    }
  );
  console.log("CryptoJS.AES.decrypt", dec);
  return dec.toString(CryptoJS.enc.Utf8).split(String.fromCharCode(0)).join("");
  return dec.toString();
};

export const matchFinger = async (rows: any, captureFinger: string) => {
  var promise = new Promise((resolve, reject) => {
    //console.log("matchFinger", rows, typeof rows);
    if (typeof rows === "string") {
      rows = JSON.parse(rows);
    }
    rows.forEach(async (element: any, i: number) => {
      try {
        var galleryTemplate = decryptString(element.IMG_DATA);
        var MFS100Request = {
          GalleryTemplate: galleryTemplate,
          ProbTemplate: captureFinger,
          BioType: "Iso",
        };
        var jsondata = JSON.stringify(MFS100Request);
        await fetch("http://localhost:8004/mfs100/verify", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: jsondata,
        })
          .then((response: any) => response.json())
          .then((response: any) => {
            if (response?.ErrorCode === "0" && response["Status"]) {
              resolve({
                status: true,
                errorCode: "0",
                errorMessage: "",
                isError: false,
                sr_cd: element.SR_CD,
              });
              return;
            }

            if (rows.length === i + 1) {
              resolve({
                status: false,
                errorCode: response.ErrorCode,
                errorMessage: response.ErrorMessage,
                isError: false,
              });
              return;
            }
          })
          .catch((reason) => {
            resolve({
              status: false,
              errorCode: "999",
              errorMessage: reason,
              isError: true,
            });
          });
      } catch (err) {
        console.log(err);
        resolve({
          status: false,
          errorCode: "999",
          errorMessage: "Something went wrong!",
          isError: true,
        });
      }
    });
  });
  return promise;
};
