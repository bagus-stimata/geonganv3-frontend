// src/helpers/crypto-helper.js
import { useStore } from 'vuex'
import CryptoJS from 'crypto-js'

export function cryptoHelper(storeOverride) {
    // Options API: pass this.$store; Composition API: boleh kosong -> useStore()
    const store = storeOverride || useStore?.()
    const mySecretKey=  'DESGREEN#1'
    const readKey = () =>
        store?.state?.secretKey?.hashSecretKey || mySecretKey || ''

    const encryptText = (plain) => {
        const secretKey = readKey()
        const ciphertext = CryptoJS.AES.encrypt(String(plain), secretKey).toString()
        return ciphertext.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    }

    const decryptText = (cipher) => {
        const secretKey = readKey()
        let base64 = String(cipher).replace(/-/g, '+').replace(/_/g, '/')
        while (base64.length % 4 !== 0) base64 += '='
        const bytes = CryptoJS.AES.decrypt(base64, secretKey)
        return bytes.toString(CryptoJS.enc.Utf8)
    }

    return { encryptText, decryptText }
}