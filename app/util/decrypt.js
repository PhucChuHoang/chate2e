Nk =  4        // The number of 32 bit words in a key.
Nr =  10       // The number of rounds in AES Cipher.
Nb = 4          // The number of columns comprising a state in AES. This is a constant in AES. Value=4

const Rcon = new Uint8Array([
    0x8d, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40,
    0x80, 0x1b, 0x36
])

const s_box = [
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

const inv_s_box = [
    0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81, 0xf3, 0xd7, 0xfb,
    0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb,
    0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
    0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25,
    0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92,
    0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
    0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06,
    0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b,
    0x3a, 0x91, 0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
    0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8, 0x1c, 0x75, 0xdf, 0x6e,
    0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b,
    0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
    0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
    0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef,
    0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
    0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d];

function AddRoundKey(round, state, roundKey) {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            state[i][j] ^= roundKey[(round * Nb * 4) + (i * Nb) + j];
        }
    }
}

function InvShiftRows(state) {
    let temp;

    //Rotate first row 1 columns to right
    temp = state[3][1];
    state[3][1] = state[2][1];
    state[2][1] = state[1][1];
    state[1][1] = state[0][1];
    state[0][1] = temp;

    //Rotate second row 2 columns to right
    temp = state[0][2];
    state[0][2] = state[2][2];
    state[2][2] = temp;

    temp = state[1][2];
    state[1][2] = state[3][2];
    state[3][2] = temp;

    //Rotate third row 3 columns to right
    temp = state[0][3];
    state[0][3] = state[1][3];
    state[1][3] = state[2][3];
    state[2][3] = state[3][3];
    state[3][3] = temp;
}

function InvSubBytes(state) {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            state[i][j] = inv_s_box[state[i][j]];
        }
    }
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


function InvCipher(state, roundKey) {
    state = to2DArray(state);

    let round = 0;

    AddRoundKey(10, state, roundKey);

    for (round = 9; ; round--) {
        InvShiftRows(state);
        InvSubBytes(state);
        AddRoundKey(round, state, roundKey);
        if (round == 0) break;
        InvMixColumns(state);
    }
    state = to1DArray(state);
    return state;
}

function InvMixColumns(state) {
    for (let i = 0; i < 4; i++) {
        let a = state[i][0];
        let b = state[i][1];
        let c = state[i][2];
        let d = state[i][3];

        state[i][0] = mul(a, 0x0e) ^ mul(b, 0x0b) ^ mul(c, 0x0d) ^ mul(d, 0x09);
        state[i][1] = mul(a, 0x09) ^ mul(b, 0x0e) ^ mul(c, 0x0b) ^ mul(d, 0x0d);
        state[i][2] = mul(a, 0x0d) ^ mul(b, 0x09) ^ mul(c, 0x0e) ^ mul(d, 0x0b);
        state[i][3] = mul(a, 0x0b) ^ mul(b, 0x0d) ^ mul(c, 0x09) ^ mul(d, 0x0e);
    }
}

function mul(x, y) {
    return (
      ((y & 1) * x) ^
      ((y >> 1 & 1) * xtime(x)) ^
      ((y >> 2 & 1) * xtime(xtime(x))) ^
      ((y >> 3 & 1) * xtime(xtime(xtime(x)))) ^
      ((y >> 4 & 1) * xtime(xtime(xtime(xtime(x)))))
    );
}

function xtime(x) {
    return ((x << 1) ^ (((x >> 7) & 1) * 0x1b)) & 0xFF;
}
  

function decrypt(cipherText, key) {
    let plainText = '';
    const ctx = { RoundKey: new Uint8Array(176) };
    keyExpansion(ctx.RoundKey, key);
    for (let i = 0; i < 4; i++) {
        let plainText_i = InvCipher(cipherText.slice(i * 16, (i + 1) * 16), ctx.RoundKey); 
        plainText += phex(plainText_i);
    }
    return plainText;
}

function phex(data) {
    return Array.from(data).map(b => ('00' + b.toString(16)).slice(-2)).join(' ');
}

function RotWord(word) {
    let temp = word[0];
    word[0] = word[1];
    word[1] = word[2];
    word[2] = word[3];
    word[3] = temp;
}

function SubWord(word) {
    for (let i = 0; i < 4; i++) {
        word[i] = s_box[word[i]];
    }
}

function keyExpansion(roundKey, key) {
    let temp = new Array(4);
    let i, j, k;

    for (i = 0; i < Nk; i++) {
        roundKey[(i * 4) + 0] = key[(i * 4) + 0];
        roundKey[(i * 4) + 1] = key[(i * 4) + 1];
        roundKey[(i * 4) + 2] = key[(i * 4) + 2];
        roundKey[(i * 4) + 3] = key[(i * 4) + 3];
    }

    for (let i = Nk; i < Nb * (Nr + 1); i++) {
        for (let t = 0; t < 4; t++) {
            temp[t] = roundKey[(i - 1) * 4 + t];
        }
        if (i % Nk == 0) {
            RotWord(temp);
            SubWord(temp);
            temp[0] ^= Rcon[Math.floor(i / Nk)];
        }

        for (let t = 0; t < 4; t++) {
            roundKey[i * 4 + t] = roundKey[(i - Nk) * 4 + t] ^ temp[t];
        }
    }
}

function uint8ArrayToAsciiString(byteArray) {
    if (!(byteArray instanceof Uint8Array)) {
      throw new TypeError('Input must be a Uint8Array');
    }
    return String.fromCharCode.apply(null, byteArray);
}

function hexStringToUint8Array(hexString) {
    // Remove all whitespace characters from the input string
    const cleanedHexString = hexString.replace(/\s+/g, '');
    
    // Split the cleaned string into pairs of two characters
    const hexPairs = cleanedHexString.match(/.{1,2}/g);
    
    // Convert each hex pair to a number and store in a new Uint8Array
    const uint8Array = new Uint8Array(hexPairs.map(hex => parseInt(hex, 16)));
    
    return uint8Array;
}

function DoDecrypt(cipher, key) {
    const buffer = new ArrayBuffer(64);
    let cipherText = new Uint8Array(buffer);
    let cnt = 0;
    for (let i = 0; i < cipher.length; i += 2) {
        cipherText.set([parseInt(cipher.substring(i, i + 2), 16)], cnt);
        cnt++;
    }
    plainTextByteInString = decrypt(cipherText, key);
    return uint8ArrayToAsciiString(hexStringToUint8Array(plainTextByteInString));
}



function getDecryptedData(encryptedArray, key) {
    // Variable to store the complete decrypted text
    let decryptedText = '';

    // Loop through each encrypted string in the array
    for (const encryptedChunk of encryptedArray) {
        // Decrypt each chunk using DoDecrypt
        const decryptedChunk = DoDecrypt(encryptedChunk, key);
        
        // Concatenate the decrypted chunk to the result string
        decryptedText += decryptedChunk;
    }

    return decryptedText;
}

let cipher = [
    '35041d6ffa875ddb778493d3627d2a2cb18f2522b43eb6ee2e437c56ade730ebf080beac189a0d6c9a413093b66af635be0b05d1aac229021d10b67b6182bd31',
    'f19aec021bccf12f4ef530358aa2c3f0dd64ed9293bef576cbd2b64a048bbd10c1a0f7488b96904433e7fa0df1f0bdba32bbbf13b1f1c53e8e1d6b0211ebbcab',
    'e0383436d59f62b86a45aa787a11475b9439fc27c4a0189387f9fb01ab0aad4cf5ea46f45e20f007eade40670b53ebad7caad5e672e39e3ab7346ed141e24810',
    '776ac18304c824c3a28b0a0200f065cb6e2e7e2f30e734b6bb3b333da2877058f6d3c0c4d52735d761944241b33d16e0badbb6045640fa07a749374494c4322d',
    '8aafe2fd292dc1385c26333566e0100fa0487bafad8b5fedef215dc53a33911f50d7b5645e9a8923c2bb8fd511a7b240c5e810a77f8c4ff07155accc680701f0',
    '2fbca259c106690236332aeaf75057d5f2cc3a476528d79455f1732e6debe1f45a86e10ecee7b0815e93114fc39dfe9a1bfeea60d04994b44cbd8fa82b2711fe',
    'aff8f6c0337a9e52bce48a5abf1929ad834192fd296158dd408919b0a493eecedbbc4c3506a1a5ad739292929b66efcf85ba751a382874e2f65e6f8248af982e',
    '02f10163d6aaf83bf497c93aceb19cd5a29085c574b0a2de85223faccfbe644a32c2d9df08633774978d4ca9762053b5077233a83f50a10a47060077a6395aeb',
    '2f581fdf634938cdcc7d52b4a9f90a80aff34498a441a123559c44c7ef9a4fc1f8b1b40fc04b215575eb3df4ca1c71d0dcdc5a107d7064bf26b102f051ecb30a',
    '1019efc951ed955fb6d966cbcbe325da52192ffaab87a8782403ecdd65ff2b4608cf2e6790db883e3bda728dd5e18ddd02a862dd0783677b44a9a77dd71f911f',
    'a2b1d857cf61c4fc3348f5a9dfd921576be15095ae7b19dd62d7660bde5cd114363f9bfce61f756c582adda93240ea99ea4909be592c3eed473c447716eacbbf',
    '0b1d336c9c04c596e18fb9190733660185f524d5c1e0d2199b734ae0acb61c0bd70b0779be2cde37fced33dc40356ebb562a49e507c4492c992b1e9f82ac5a0b',
    '7ba89309a80b601466c4161572237e1eac3aad055c90df6f10412c40b62db60ef76b0cfcab4f14901b1660e25d901c466a8a1d5592ff28d290d52664afc4ace0',
    '118aa1d1c3a4befb7c8275a7d3161ac45fcd4555675b26b9900696b4773fda1b36217b3986ab309604d0e79aeb35abbae76aa37d4a8ac5e96e94ad4cb49a710e',
    '35274199e6ce8e32ef270b6497c132f6a568a3a2395282288285cab8fc7eeae8701c2d0da5e02ddcb2ab57c1786e7f9e24150b57ab14cb5bccd1bcc03d7e23af',
    '5c97900842fef76376b9c5340dd4441d0859cc32450b919490fd782918a4325128cee89aeaf6548c00b88d6ef8e3f79ab7eedb99954e3855fdcd0e3cfc55557c',
    'b1133357801f5d349c5931d96bd5fe43c8d65ad8a7daec596f29ec62ee3bddd4d936f352e374a323cc2f5a4a3035d2c696f3414d6dedb574e90a7d01320e7935',
    '98b6726d3e96a2e8f23ce94cec415db698c70ce8f4cf570e68bc1ac81c9bfaa7b36580ff3089d5c2835a155bfb1c93e0db9cdcb1983554ed750f5a7afde03737',
    'cb7e9bb8e34f8548b764d1202a6a908f0890e83075bd16533b0dbf9473704cc2355849b339c1ea8336545654405f851fe9bf8a3a8e8aa0fd8328ef8649d962c5',
    '66bdc48df89a05f457cf29a4fe371bfd4e7bef7c90346a8802c09861570a5cfb06c0f96affbb713612a2bb8838b007c7f3914f8ef602dc856498cd5b96188573',
    'f0a16090d2614fb55b46d03aee4e291943ea1c25ddde7715e9aeb349dd4ac17bda6df03e826f67d5fc6626857351690b67ff9fdd40b5b7b7b1e2eaf1bb1bc93b',
    'e98201f3a43f9cf12aa463207df9b9776563eea1c79586a19bea6db00781dd1fe6b6162359950e080d26887a4e1e17058559f566a71ccb54e3e985e1c7bd43ad',
    'fb67122953020b55d595223a15729a30ba35c4f67cb2c8adc43bb678f6ff7109db6994053de884591f827f6fd5b7c89ad86aa7292f6268eaa7c1ff7b1545063f',
    '2e2b5e60d5c646fd0f7576bb37df84b0d70f22c6b8ee968675d93eaccebd94f08cd401d3a7235dbfb23c3a3908ad9af08cd401d3a7235dbfb23c3a3908ad9af0'
  ];
const key = new Uint8Array([
    0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6,
    0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c
]);

console.log(getDecryptedData(cipher, key));