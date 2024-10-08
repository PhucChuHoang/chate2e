const Nk =  4        // The number of 32 bit words in a key.
const Nr =  10       // The number of rounds in AES Cipher.
const Nb = 4          // The number of columns comprising a state in AES. This is a constant in AES. Value=4

const sbox = [
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16];

    const Rcon = new Uint8Array([
      0x8d, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40,
      0x80, 0x1b, 0x36
    ])

    
function getSBoxValue(num) {
    return sbox[num];
}

function keyExpansion(roundKey, key) {
    let tempa = new Array(4); // Used for the column/row operations
    let i, j, k;
  
    // The first round key is the key itself.
    for (i = 0; i < Nk; ++i) {
      roundKey[(i * 4) + 0] = key[(i * 4) + 0];
      roundKey[(i * 4) + 1] = key[(i * 4) + 1];
      roundKey[(i * 4) + 2] = key[(i * 4) + 2];
      roundKey[(i * 4) + 3] = key[(i * 4) + 3];
    }
  
    // All other round keys are found from the previous round keys.
    for (i = Nk; i < Nb * (Nr + 1); ++i) {
      k = (i - 1) * 4;
      tempa[0] = roundKey[k + 0];
      tempa[1] = roundKey[k + 1];
      tempa[2] = roundKey[k + 2];
      tempa[3] = roundKey[k + 3];
  
      if (i % Nk === 0) {
        // Rotate the word
        const temp = tempa[0];
        tempa[0] = tempa[1];
        tempa[1] = tempa[2];
        tempa[2] = tempa[3];
        tempa[3] = temp;
  
        // Apply S-Box to each byte
        tempa[0] = getSBoxValue(tempa[0]);
        tempa[1] = getSBoxValue(tempa[1]);
        tempa[2] = getSBoxValue(tempa[2]);
        tempa[3] = getSBoxValue(tempa[3]);
  
        // XOR the first byte with the round constant
        tempa[0] ^= Rcon[Math.floor(i / Nk)];
      }
    
      j = i * 4;
      k = (i - Nk) * 4;
      roundKey[j + 0] = roundKey[k + 0] ^ tempa[0];
      roundKey[j + 1] = roundKey[k + 1] ^ tempa[1];
      roundKey[j + 2] = roundKey[k + 2] ^ tempa[2];
      roundKey[j + 3] = roundKey[k + 3] ^ tempa[3];
    }
  }
  
// This function adds the round key to the state by applying an XOR operation.
function addRoundKey(round, state, roundKey) {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      state[i][j] ^= roundKey[(round * Nb * 4) + (i * Nb) + j];
    }
  }
}

// The SubBytes function substitutes the values in the state matrix with values from an S-box.
function subBytes(state) {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      state[j][i] = getSBoxValue(state[j][i]);
    }
  }
}


// The ShiftRows function shifts the rows in the state to the left.
// Each row is shifted with a different offset. Offset = Row number.
function shiftRows(state) {
  let temp;

  // Rotate first row 1 column to the left
  temp = state[0][1];
  state[0][1] = state[1][1];
  state[1][1] = state[2][1];
  state[2][1] = state[3][1];
  state[3][1] = temp;

  // Rotate second row 2 columns to the left
  temp = state[0][2];
  state[0][2] = state[2][2];
  state[2][2] = temp;

  temp = state[1][2];
  state[1][2] = state[3][2];
  state[3][2] = temp;

  // Rotate third row 3 columns to the left
  temp = state[0][3];
  state[0][3] = state[3][3];
  state[3][3] = state[2][3];
  state[2][3] = state[1][3];
  state[1][3] = temp;
}

// Function to perform finite field multiplication by 2 in GF(2^8)
function xtime(x) {
  return ((x << 1) ^ (((x >> 7) & 1) * 0x1b)) & 0xFF;
}


// The MixColumns function mixes the columns of the state matrix
function mixColumns(state) {
  let Tmp, Tm, t;

  for (let i = 0; i < 4; i++) {  
    t = state[i][0];
    Tmp = state[i][0] ^ state[i][1] ^ state[i][2] ^ state[i][3];

    Tm = state[i][0] ^ state[i][1];
    Tm = xtime(Tm);
    state[i][0] ^= Tm ^ Tmp;

    Tm = state[i][1] ^ state[i][2];
    Tm = xtime(Tm);
    state[i][1] ^= Tm ^ Tmp;

    Tm = state[i][2] ^ state[i][3];
    Tm = xtime(Tm);
    state[i][2] ^= Tm ^ Tmp;

    Tm = state[i][3] ^ t;
    Tm = xtime(Tm);
    state[i][3] ^= Tm ^ Tmp;
  }
}

// Function to perform multiplication in GF(2^8) as defined by the AES standard
function multiply(x, y) {
  return (
    ((y & 1) * x) ^
    ((y >> 1 & 1) * xtime(x)) ^
    ((y >> 2 & 1) * xtime(xtime(x))) ^
    ((y >> 3 & 1) * xtime(xtime(xtime(x)))) ^
    ((y >> 4 & 1) * xtime(xtime(xtime(xtime(x)))))
  );
}

function to2DArray(arr) {
  if (arr.length !== 16) {
      throw new Error("Input array must have 16 elements.");
  }

  let matrix = [];
  for (let i = 0; i < 4; i++) {
      matrix.push(arr.slice(i * 4, (i + 1) * 4));
  }

  return matrix;
}

function to1DArray(matrix) {
  let newArr = [];
  for(var i = 0; i < matrix.length; i++)
    {
      for (var j = 0; j < matrix[i].length; j++)
      {
        newArr.push(matrix[i][j]);
      }
    }
    return newArr;
}

// Cipher is the main function that encrypts the PlainText
function cipher(state, roundKey) {
  state = to2DArray(state);

  let round = 0;

  // Add the first round key to the state before starting the rounds
  addRoundKey(0, state, roundKey);

  // There will be Nr rounds
  // The first Nr-1 rounds are identical
  // These Nr rounds are executed in the loop below
  // Last one without MixColumns()
  for (round = 1; ; ++round) {
    subBytes(state);
    shiftRows(state);
    if (round === Nr) {
      break;
    }
    mixColumns(state);
    addRoundKey(round, state, roundKey);
  }
  // Add round key to last round
  addRoundKey(Nr, state, roundKey);
  state = to1DArray(state);
  return state;
}

// Function to initialize the AES context
function AES_init_ctx(ctx, key) {
  keyExpansion(ctx.RoundKey, key);
}

// Helper function to print the hex representation
function phex(data) {
  return Array.from(data)
    .map(b => ('00' + b.toString(16)).slice(-2))
    .join('');
}

function uint8ArrayToAsciiString(byteArray) {
  if (!(byteArray instanceof Uint8Array)) {
    throw new TypeError('Input must be a Uint8Array');
  }
  return String.fromCharCode.apply(null, byteArray);
}


function asciiStringToUint8Array(asciiString) {
  while (asciiString.length % 64 !== 0) {
    asciiString += ' ';
  }
  // Convert ASCII string to Uint8Array
  const byteArray = new Uint8Array(asciiString.length);
  for (let i = 0; i < asciiString.length; i++) {
    byteArray[i] = asciiString.charCodeAt(i);
  }
  return byteArray;
}


function DoEncrypt(plaintext, key) {
  //console.log("The encryption key is: ", key);
  let plainTextHex = asciiStringToUint8Array(plaintext);

  const ctx = { RoundKey: new Uint8Array(176) };
  AES_init_ctx(ctx, key);

  let ciphertextHex = '';
  for (let i = 0; i < 4; ++i) {
    let cipher_text_i = cipher(plainTextHex.slice(i * 16, (i + 1) * 16), ctx.RoundKey);
    ciphertextHex += phex(cipher_text_i);
  }
  return ciphertextHex;
}

export function getEncryptData(plainText, key) {
  // Array to store encrypted strings
  const encryptedArray = [];

  // Loop through the plainText in 64-character chunks
  for (let i = 0; i < plainText.length; i += 64) {
      // Extract a 64-character substring from plainText
      const chunk = plainText.substring(i, i + 64);
      
      // Encrypt the chunk using DoEncrypt and store in the array
      const encryptedChunk = DoEncrypt(chunk, key);
      encryptedArray.push(encryptedChunk);
  }

  return encryptedArray;
}

//128-bit key
// const key = new Uint8Array([
//     0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6,
//     0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c
//   ]);

  
/** s = "In the realm of human knowledge, one of the most fascinating aspects of our existence is the ability to learn, adapt, and innovate. This perpetual journey of discovery and understanding has been the cornerstone of human civilization, driving us from the rudimentary tools of early man to the complex technologies that define the modern world. The evolution of our capacity to think critically, to question the unknown, and to solve complex problems is a testament to our enduring spirit and determination.We stand on the shoulders of giants, benefiting from the accumulated wisdom of countless generations who have explored the mysteries of nature, deciphered the laws of physics, and uncovered the secrets of the universe. Yet, there is still so much to learn, so many challenges to overcome, and so many frontiers to explore. From the depths of the oceans to the farthest reaches of space, humanity's quest for knowledge is far from complete.In this ever-changing world, education remains a vital force, shaping the minds of the next generation, empowering individuals, and fostering a culture of innovation and creativity. It is through education that we gain the tools to understand our world, to express our ideas, and to make meaningful contributions to society. As we move forward into an uncertain future, the importance of learning, curiosity, and a relentless pursuit of truth cannot be overstated. Our journey continues, guided by the light of knowledge and the promise of discovery." **/

// result = getEncryptData(s, key);
// console.log(result);


// -------------------------------------- test convert from uint8Array to string 
// tmp = new Uint8Array([120, 105, 110, 32, 99, 104, 97, 111, 32, 118, 105, 101, 116, 32, 110, 97, 109, 44, 32, 120, 105, 110, 32, 99, 104, 97, 111, 32, 118, 105, 110, 104, 44, 32, 120, 105, 110, 32, 99, 104, 97, 111, 32, 112, 104, 117, 99, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32]);
// tmp = uint8ArrayToAsciiString(tmp);
// console.log(tmp);


// tmp should be "xin chao viet nam, xin chao vinh, xin chao phuc"

// --------------------------------------
/*

3a d7 7b b4 0d 7a 36 60 a8 9e ca f3 24 66 ef 97
f5 d3 d5 85 03 b9 69 9d e7 85 89 5a 96 fd ba af
43 b1 cd 7f 59 8e ce 23 88 1b 00 e3 ed 03 06 88
7b 0c 78 5e 27 e8 ad 3f 82 23 20 71 04 72 5d d4




*/