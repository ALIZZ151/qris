const merchants = {
  tmhr: {
    name: 'TOKO TMHR, MATERIAL BANGUNAN',
    nmid: 'ID1026530452378',
    number: '082325070335',
    image: 'assets/qris-tmhr.jpg',
    filename: 'qris-toko-tmhr-material-bangunan.jpg',
  },
  zabu: {
    name: 'Zabu Cloud',
    nmid: 'ID1025442134603',
    number: '082325070335',
    image: 'assets/qris-zabu-cloud.jpg',
    filename: 'qris-zabu-cloud.jpg',
  },
};

const tabButtons = document.querySelectorAll('.tab-btn');
const card = document.querySelector('.payment-card');
const merchantName = document.getElementById('merchantName');
const merchantNmid = document.getElementById('merchantNmid');
const paymentNumber = document.getElementById('paymentNumber');
const qrisImage = document.getElementById('qrisImage');
const copyNumberBtn = document.getElementById('copyNumberBtn');
const copyMerchantBtn = document.getElementById('copyMerchantBtn');
const downloadBtn = document.getElementById('downloadBtn');
const toast = document.getElementById('toast');

let activeMerchant = 'tmhr';
let toastTimer = null;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1900);
}

async function copyText(text, successMessage = 'Berhasil disalin') {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
    showToast(successMessage);
  } catch (error) {
    showToast('Gagal copy, coba manual');
  }
}

function setMerchant(key) {
  const selected = merchants[key];
  if (!selected) return;

  activeMerchant = key;
  merchantName.textContent = selected.name;
  merchantNmid.textContent = `NMID: ${selected.nmid}`;
  paymentNumber.textContent = selected.number;
  qrisImage.src = selected.image;
  qrisImage.alt = `QRIS ${selected.name}`;

  tabButtons.forEach((button) => {
    const isActive = button.dataset.target === key;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  card.classList.remove('is-changing');
  void card.offsetWidth;
  card.classList.add('is-changing');
}

function downloadQris() {
  const selected = merchants[activeMerchant];
  const link = document.createElement('a');
  link.href = selected.image;
  link.download = selected.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  showToast('QRIS mulai didownload');
}

function copyPaymentDetail() {
  const selected = merchants[activeMerchant];
  const detail = [
    `Payment QRIS`,
    `Nama: ${selected.name}`,
    `NMID: ${selected.nmid}`,
    `DANA/GOPAY: ${selected.number}`,
  ].join('\n');

  copyText(detail, 'Detail payment disalin');
}

tabButtons.forEach((button) => {
  button.addEventListener('click', () => setMerchant(button.dataset.target));
});

copyNumberBtn.addEventListener('click', () => {
  copyText(merchants[activeMerchant].number, 'Nomor berhasil disalin');
});

copyMerchantBtn.addEventListener('click', copyPaymentDetail);
downloadBtn.addEventListener('click', downloadQris);
