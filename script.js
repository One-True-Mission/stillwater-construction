/* =========================================================
   STILLWATER CONSTRUCTION & ROOFING
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Active Nav State ---------- */
  var currentPage = document.body.dataset.page;
  if (currentPage) {
    var pageToHref = {
      'home': 'index.html',
      'services': 'services.html',
      'about': 'about.html',
      'contact': 'contact.html'
    };
    var activeHref = pageToHref[currentPage];
    if (activeHref) {
      document.querySelectorAll('.nav-links a').forEach(function (a) {
        if (a.getAttribute('href') === activeHref) {
          a.classList.add('is-active');
        }
      });
    }
  }

  /* ---------- Hamburger ---------- */
  var hamburger = document.querySelector('.hamburger');
  var navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      hamburger.classList.toggle('is-open', open);
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        hamburger.classList.remove('is-open');
      });
    });
  }

  /* ---------- Gallery Carousel (3-up center stage with clone wrap) ---------- */
  var carousel = document.querySelector('.carousel');
  if (carousel) {
    var track = carousel.querySelector('.carousel-track');
    var prevBtn = carousel.querySelector('.carousel-prev');
    var nextBtn = carousel.querySelector('.carousel-next');
    var dotsWrap = carousel.querySelector('.carousel-dots');

    var realSlides = Array.prototype.slice.call(track.querySelectorAll('.carousel-slide'));
    var total = realSlides.length;
    var CLONE_COUNT = 2;

    // clone first CLONE_COUNT slides to END, and last CLONE_COUNT to START
    for (var i = 0; i < CLONE_COUNT; i++) {
      var endClone = realSlides[i].cloneNode(true);
      endClone.classList.add('is-clone');
      track.appendChild(endClone);
    }
    for (var j = CLONE_COUNT - 1; j >= 0; j--) {
      var startClone = realSlides[total - 1 - j].cloneNode(true);
      startClone.classList.add('is-clone');
      track.insertBefore(startClone, track.firstChild);
    }

    var allSlides = Array.prototype.slice.call(track.querySelectorAll('.carousel-slide'));
    var extendedTotal = allSlides.length;

    var slidesPerView = 3;
    var centerIndex = CLONE_COUNT;
    var autoplayId = null;
    var AUTOPLAY_MS = 4000;
    var inTransition = false;

    function getSlidesPerView() {
      return window.matchMedia('(max-width: 700px)').matches ? 1 : 3;
    }

    function sizeSlides() {
      slidesPerView = getSlidesPerView();
      var viewportWidth = carousel.clientWidth;
      var slideWidth = viewportWidth / slidesPerView;
      allSlides.forEach(function (s) { s.style.width = slideWidth + 'px'; });
      track.style.width = (slideWidth * extendedTotal) + 'px';
      applyTransform(false);
    }

    function applyTransform(animate) {
      if (!animate) {
        track.style.transition = 'none';
      } else {
        track.style.transition = 'transform 0.6s cubic-bezier(0.65, 0, 0.35, 1)';
      }
      var slideWidth = carousel.clientWidth / slidesPerView;
      var halfOffset = (slidesPerView - 1) / 2;
      var x = -(centerIndex - halfOffset) * slideWidth;
      track.style.transform = 'translateX(' + x + 'px)';

      allSlides.forEach(function (s, i) {
        s.classList.toggle('is-center', i === centerIndex);
      });

      var realIdx = ((centerIndex - CLONE_COUNT) % total + total) % total;
      var allDots = dotsWrap.querySelectorAll('.carousel-dot');
      allDots.forEach(function (d, i) { d.classList.toggle('is-active', i === realIdx); });

      if (!animate) {
        void track.offsetWidth;
      }
    }

    function go(direction) {
      if (inTransition) return;
      inTransition = true;
      centerIndex += direction;
      applyTransform(true);
    }

    function snapIfNeeded() {
      var realLastIndex = CLONE_COUNT + total - 1;
      var realFirstIndex = CLONE_COUNT;
      if (centerIndex > realLastIndex) {
        centerIndex = realFirstIndex + (centerIndex - realLastIndex - 1);
        applyTransform(false);
      } else if (centerIndex < realFirstIndex) {
        centerIndex = realLastIndex - (realFirstIndex - centerIndex - 1);
        applyTransform(false);
      }
      inTransition = false;
    }

    track.addEventListener('transitionend', snapIfNeeded);

    // build dots
    for (var k = 0; k < total; k++) {
      var dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', 'Go to slide ' + (k + 1));
      dot.dataset.index = k;
      dotsWrap.appendChild(dot);
    }
    var dots = dotsWrap.querySelectorAll('.carousel-dot');

    function goToReal(realIdx) {
      if (inTransition) return;
      inTransition = true;
      centerIndex = CLONE_COUNT + realIdx;
      applyTransform(true);
    }

    function startAuto() {
      stopAuto();
      autoplayId = setInterval(function () { go(1); }, AUTOPLAY_MS);
    }
    function stopAuto() {
      if (autoplayId) { clearInterval(autoplayId); autoplayId = null; }
    }

    prevBtn.addEventListener('click', function () { go(-1); stopAuto(); startAuto(); });
    nextBtn.addEventListener('click', function () { go(1); stopAuto(); startAuto(); });
    dots.forEach(function (d) {
      d.addEventListener('click', function () {
        goToReal(parseInt(d.dataset.index, 10));
        stopAuto(); startAuto();
      });
    });

    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);

    // touch swipe
    var startX = 0;
    var deltaX = 0;
    carousel.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      deltaX = 0;
      stopAuto();
    }, { passive: true });
    carousel.addEventListener('touchmove', function (e) {
      deltaX = e.touches[0].clientX - startX;
    }, { passive: true });
    carousel.addEventListener('touchend', function () {
      if (Math.abs(deltaX) > 40) {
        go(deltaX < 0 ? 1 : -1);
      }
      startAuto();
    });

    window.addEventListener('resize', sizeSlides);
    sizeSlides();
    applyTransform(false);
    startAuto();
  }

  /* ---------- Smooth-scroll offset for fixed nav ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length > 1) {
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          var navHeight = document.querySelector('.nav').offsetHeight || 0;
          var top = target.getBoundingClientRect().top + window.pageYOffset - navHeight + 1;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      }
    });
  });

});
