const paymentData = {
  tmhr: {
    label: 'Toko TMHR',
    merchant: 'TOKO TMHR, MATERIAL BANGUNAN',
    nmid: 'ID1026530452378',
    image: 'assets/qris-tmhr.jpg',
    alt: 'QRIS TOKO TMHR, MATERIAL BANGUNAN'
  },
  zabu: {
    label: 'Zabu Cloud',
    merchant: 'Zabu Cloud',
    nmid: 'ID1025442134603',
    image: 'assets/qris-zabu-cloud.jpg',
    alt: 'QRIS Zabu Cloud'
  }
};

const paymentNumber = '082325070335';
const waNumber = '6282325070335';
let activeKey = 'tmhr';
let toastTimer;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const qrisCard = $('#qrisCard');
const qrisImage = $('#qrisImage');
const merchantName = $('#merchantName');
const merchantNmid = $('#merchantNmid');
const modalTitle = $('#modalTitle');
const modalImage = $('#modalImage');
const tabIndicator = $('#tabIndicator');
const qrModal = $('#qrModal');
const toast = $('#toast');
const whatsappBtn = $('#whatsappBtn');

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

async function copyText(text, successMessage = 'Berhasil disalin') {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMessage);
  } catch (error) {
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    document.execCommand('copy');
    helper.remove();
    showToast(successMessage);
  }
}

function getActivePayment() {
  return paymentData[activeKey];
}

function buildDetail() {
  const data = getActivePayment();
  return [
    'DETAIL PAYMENT',
    `Merchant: ${data.merchant}`,
    `NMID: ${data.nmid}`,
    `DANA/GOPAY: ${paymentNumber}`,
    'Silakan scan QRIS atau transfer ke nomor di atas.'
  ].join('\n');
}

function updateWhatsappLink() {
  const data = getActivePayment();
  const message = encodeURIComponent(`Halo, saya ingin konfirmasi pembayaran ke ${data.merchant}.`);
  whatsappBtn.href = `https://wa.me/${waNumber}?text=${message}`;
}

function switchPayment(key) {
  if (!paymentData[key] || key === activeKey) return;
  activeKey = key;
  const data = getActivePayment();

  $$('.qris-tab').forEach((button) => {
    const active = button.dataset.key === key;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });

  tabIndicator.classList.toggle('right', key === 'zabu');
  qrisCard.classList.remove('switching');
  void qrisCard.offsetWidth;
  qrisCard.classList.add('switching');

  qrisImage.style.opacity = '0';
  setTimeout(() => {
    merchantName.textContent = data.merchant;
    merchantNmid.textContent = `NMID: ${data.nmid}`;
    qrisImage.src = data.image;
    qrisImage.alt = data.alt;
    modalTitle.textContent = data.merchant;
    modalImage.src = data.image;
    modalImage.alt = data.alt;
    qrisImage.style.opacity = '1';
    updateWhatsappLink();
  }, 140);
}

function downloadQris() {
  const data = getActivePayment();
  const link = document.createElement('a');
  link.href = data.image;
  link.download = `QRIS-${data.label.replace(/\s+/g, '-')}.jpg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  showToast('QRIS mulai di-download');
}

function openModal() {
  const data = getActivePayment();
  modalTitle.textContent = data.merchant;
  modalImage.src = data.image;
  modalImage.alt = data.alt;

  if (typeof qrModal.showModal === 'function') {
    qrModal.showModal();
  } else {
    window.open(data.image, '_blank', 'noopener');
  }
}

function closeModal() {
  if (qrModal.open) qrModal.close();
}

async function sharePage() {
  const data = getActivePayment();
  const shareData = {
    title: 'Take Me Home - Official Payment',
    text: `Payment QRIS ${data.merchant}`,
    url: window.location.href
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }
  copyText(window.location.href, 'Link website disalin');
}

function initParticles() {
  const canvas = $('#particleCanvas');
  const ctx = canvas.getContext('2d');
  let width;
  let height;
  let particles;
  let raf;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  function resize() {
    width = canvas.width = window.innerWidth * window.devicePixelRatio;
    height = canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    const count = Math.min(62, Math.max(28, Math.floor(window.innerWidth / 18)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - .5) * .22 * window.devicePixelRatio,
      vy: (Math.random() - .5) * .22 * window.devicePixelRatio,
      r: (Math.random() * 1.8 + .7) * window.devicePixelRatio,
      a: Math.random() * .42 + .16
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (const particle of particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x < 0 || particle.x > width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > height) particle.vy *= -1;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(159, 218, 255, ${particle.a})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    resize();
    draw();
  }, { passive: true });
}

$$('.qris-tab').forEach((button) => {
  button.addEventListener('click', () => switchPayment(button.dataset.key));
});

$('#copyNumberBtn').addEventListener('click', () => copyText(paymentNumber, 'Nomor DANA/GOPAY disalin'));
$('#heroCopyBtn').addEventListener('click', () => copyText(paymentNumber, 'Nomor DANA/GOPAY disalin'));
$('#mobileCopyBtn').addEventListener('click', () => copyText(paymentNumber, 'Nomor DANA/GOPAY disalin'));
$('#modalCopyBtn').addEventListener('click', () => copyText(paymentNumber, 'Nomor DANA/GOPAY disalin'));

$('#copyDetailBtn').addEventListener('click', () => copyText(buildDetail(), 'Detail payment disalin'));
$('#copyDetailTopBtn').addEventListener('click', () => copyText(buildDetail(), 'Detail payment disalin'));

$('#downloadBtn').addEventListener('click', downloadQris);
$('#mobileDownloadBtn').addEventListener('click', downloadQris);
$('#modalDownloadBtn').addEventListener('click', downloadQris);

$('#zoomBtn').addEventListener('click', openModal);
$('#openPreviewBtn').addEventListener('click', openModal);
$('#heroZoomBtn').addEventListener('click', openModal);
$('#closeModalBtn').addEventListener('click', closeModal);
$('#shareBtn').addEventListener('click', sharePage);

qrModal.addEventListener('click', (event) => {
  if (event.target === qrModal) closeModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeModal();
});

updateWhatsappLink();
initParticles();
