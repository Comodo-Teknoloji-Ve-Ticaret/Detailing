// İşletme iletişim bilgileri — tek kaynak.
export const CONTACT = {
  phoneDisplay: '0507 850 52 87',
  phoneTel: 'tel:+905078505287',
  whatsappNumber: '905078505287',
  city: 'Antalya',
  hours: 'Pzt–Cmt 09:00–18:00',
}

/** Hazır mesajlı WhatsApp bağlantısı */
export function whatsappLink(message = 'Merhaba, detailing / seramik kaplama / PPF hakkında bilgi almak istiyorum.') {
  return `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`
}
