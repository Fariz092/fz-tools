const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

async function copyText(text, feedbackEl) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    if (feedbackEl) {
      const original = feedbackEl.textContent;
      feedbackEl.textContent = 'COPIED';
      setTimeout(() => { feedbackEl.textContent = original; }, 1400);
    }
  } catch (err) {
    console.warn('Clipboard unavailable', err);
  }
}

function downloadCanvas(canvas, filename) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

// Inisialisasi Custom Select
function initCustomSelects() {
  $$('.custom-select').forEach(wrapper => {
    const select = wrapper.querySelector('select');
    if (!select) return;

    // Pastikan select native benar-benar hilang dari pandangan dan interaksi
    select.style.display = 'none';
    select.style.visibility = 'hidden';
    select.style.position = 'absolute';
    select.style.pointerEvents = 'none';

    // Buat Trigger
    const trigger = document.createElement('button');
    trigger.className = 'select-trigger';
    trigger.type = 'button';
    
    // Ambil teks opsi yang terpilih
    const updateTriggerText = () => {
      trigger.innerHTML = `<span>${select.options[select.selectedIndex].text}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square">
          <path d="M6 9l6 6 6-6"/>
        </svg>`;
    };
    updateTriggerText();

    // Buat Container Opsi
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'select-options';

    // Isi Opsi
    Array.from(select.options).forEach(opt => {
      const div = document.createElement('div');
      div.className = 'select-option';
      div.textContent = opt.text;
      
      div.addEventListener('click', () => {
        select.selectedIndex = opt.index;
        updateTriggerText();
        wrapper.classList.remove('open');
        
        // Trigger event 'change' agar logika di halaman tool berjalan
        select.dispatchEvent(new Event('change', { bubbles: true }));
        select.dispatchEvent(new Event('input', { bubbles: true }));
      });
      
      optionsContainer.appendChild(div);
    });

    // Susun DOM
    wrapper.appendChild(trigger);
    wrapper.appendChild(optionsContainer);

    // Toggle Buka/Tutup
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Tutup semua dropdown lain
      $$('.custom-select.open').forEach(el => {
        if (el !== wrapper) el.classList.remove('open');
      });
      wrapper.classList.toggle('open');
    });
  });

  // Tutup dropdown jika klik di luar area
  document.addEventListener('click', (e) => {
    $$('.custom-select.open').forEach(wrapper => {
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove('open');
      }
    });
  });
}

// Jalankan saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
  initCustomSelects();
});

// --- Sidebar Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('open-menu');
  const closeBtn = document.getElementById('close-menu');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (!menuBtn || !sidebar || !overlay) return;

  function toggleSidebar() {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    // Cegah scroll body saat sidebar terbuka
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
  }

  menuBtn.addEventListener('click', toggleSidebar);
  closeBtn.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', toggleSidebar);
});
