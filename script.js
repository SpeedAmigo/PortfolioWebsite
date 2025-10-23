document.addEventListener('DOMContentLoaded', () => {
  // Skill tilt effect
  const cards = document.querySelectorAll('.Skill-item');
  cards.forEach((card) => {
    card.addEventListener('mousemove', (ev) => {
      const rect = card.getBoundingClientRect();
      const x = ev.clientX - rect.left;   // mouse X within card
      const y = ev.clientY - rect.top;    // mouse Y within card

      const px = (x / rect.width) - 0.5;  // -0.5 .. 0.5
      const py = (y / rect.height) - 0.5; // -0.5 .. 0.5

      const rotateY = px * 30;            // degrees
      const rotateX = -py * 30;           // degrees

      // Apply to the card itself; include perspective for 3D and a slight scale
      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.1)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  });

  // Lightbox logic for project images (guard if markup absent)
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    function openLightbox(src) {
      if (!lightboxImg) return;
      lightboxImg.src = src;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      try { if (lightbox.requestFullscreen) lightbox.requestFullscreen(); } catch (e) {}
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      if (lightboxImg) lightboxImg.src = '';
      if (document.fullscreenElement) {
        try { if (document.exitFullscreen) document.exitFullscreen(); } catch (e) {}
      }
    }

    document.querySelectorAll('.Project-Images img').forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => openLightbox(img.src));
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
  }

  // Copy-to-clipboard for email and phone
  document.querySelectorAll('.copy-btn[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-copy') || '';
      let ok = false;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
          ok = true;
        } else {
          // Fallback
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.setAttribute('readonly', '');
          ta.style.position = 'absolute';
          ta.style.left = '-9999px';
          document.body.appendChild(ta);
          ta.select();
          try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
          document.body.removeChild(ta);
        }
      } catch (e) { ok = false; }

      // Visual feedback
      const originalHTML = btn.innerHTML;
      if (ok) {
        btn.classList.add('copied');
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
      } else {
        btn.classList.remove('copied');
        btn.innerHTML = '<i class="fa-solid fa-xmark"></i> Failed';
      }
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = originalHTML;
      }, 1200);
    });
  });

    function copyText(text) {
      return (navigator.clipboard && navigator.clipboard.writeText)
        ? navigator.clipboard.writeText(text)
        : new Promise((resolve, reject) => {
            try {
              const ta = document.createElement('textarea');
              ta.value = text;
              ta.setAttribute('readonly', '');
              ta.style.position = 'absolute';
              ta.style.left = '-9999px';
              document.body.appendChild(ta);
              ta.select();
              const ok = document.execCommand('copy');
              document.body.removeChild(ta);
              ok ? resolve() : reject(new Error('execCommand failed'));
            } catch (e) { reject(e); }
          });
    }

    function flashCopied(el, label) {
      const original = el.innerHTML;
      el.classList.add('copied');
      el.innerHTML = `<i class="fa-solid fa-check"></i> ${label || 'Copied'}`;
      setTimeout(() => {
        el.classList.remove('copied');
        el.innerHTML = original;
      }, 1200);
    }

    const emailLink = document.querySelector('.Links-About a[href^="mailto:"]');
    if (emailLink) {
      emailLink.addEventListener('click', (e) => {
        e.preventDefault();
        const email = (emailLink.getAttribute('href') || '').replace(/^mailto:/, '').trim();
        if (!email) return;
        copyText(email).then(() => flashCopied(emailLink, 'Email copied'));
      });
    }

    const phoneLink = document.querySelector('.Links-About a[href^="tel:"]');
    if (phoneLink) {
      phoneLink.addEventListener('click', (e) => {
        e.preventDefault();
        // Copy the human-readable number shown in the link
        const phone = phoneLink.textContent.trim();
        if (!phone) return;
        copyText(phone).then(() => flashCopied(phoneLink, 'Phone copied'));
      });
    }
});
