// whatsapp-util.js
/**
 * Bikin link whatsapp langsung ke nomor dengan text optional
 */
export function waHref(rawNumber, text = "") {
    let number = String(rawNumber || "").replace(/[^+\d]/g, "");
    number = number.startsWith("+62") ? number : `+62${parseInt(number)}`;
    const encodedText = encodeURIComponent(text);
    return `https://wa.me/${number}?text=${encodedText}`;
}

/**
 * Cek apakah string valid whatsapp number (versi sederhana)
 */
export function isWhatsappNumber(rawNumber) {
    if (!rawNumber) return false; // null/undefined/"" → langsung false

    const number = String(rawNumber).replace(/[^+\d]/g, "");
    if (!number) return false; // hasil bersih kosong

    // Validasi: prefix Indo + panjang 10–13 digit
    return /^(\+62|62|0)\d{10,13}$/.test(number);
}

// waHref(rawNumber) {
//   let number = String(rawNumber || '').replace(/[^+\d]/g, '');
//   number = number.startsWith('+62') ? number : `+62${parseInt(number)}`;
//   const text = encodeURIComponent(this.getCurrentUrl());
//   return `https://wa.me/${number}?text=${text}`;
// },
