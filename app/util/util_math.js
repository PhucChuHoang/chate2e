export function makeNewPrime(number) {
    const bitLength = number.toString(2).length;
    const byteLength = Math.ceil(bitLength / 8);

    // Create a buffer to hold the random bytes
    const buffer = new Uint8Array(byteLength);
    window.crypto.getRandomValues(buffer);

    // Convert bytes to a BigInt
    let randomBigInt = BigInt('0x' + [...buffer].map(b => b.toString(16).padStart(2, '0')).join(''));
    
    // Ensure the BigInt is within the range [0, max)
    randomBigInt = randomBigInt % number;

    return randomBigInt;
}
  
export function makeNewKey(number) {
    const random = require('crypto');
  
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer);
    //Get the value from each byte of the key
    
    for (let i = 15; i >= 0; i--) {
      view.setUint8(i, Number(number & BigInt(0xff)));
      number >>= BigInt(8);
    }
    return new Uint8Array(buffer);
}

export function exponetional(number, pow, mod) {
    let result = BigInt(1);
    number = number % mod;
    while (pow > 0) {
        if (pow % BigInt(2) == BigInt(1)) {
            result = (result * number) % mod;
        }
        pow = pow >> BigInt(1);
        number = (number * number) % mod;
    }
    return result;

}