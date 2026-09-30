/* ============================================================
   PhoneSoft — общий скрипт для всех страниц
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Год в подвале ---------- */
  document.querySelectorAll('.js-year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Тень шапки при прокрутке ---------- */
  var header = document.getElementById('header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Меню-бургер ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    var closeNav = function () {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    };

    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (!nav.contains(e.target) && !burger.contains(e.target)) closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ---------- Подсветка текущей страницы в меню ---------- */
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__list a[href]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === here || (here === 'index.html' && href === './')) {
      a.classList.add('is-active');
      a.setAttribute('aria-current', 'page');
    }
  });

  /* ---------- Подстановка услуги из ссылки (?service=...) ---------- */
  var params = new URLSearchParams(location.search);
  var presetService = params.get('service');
  if (presetService) {
    var select = document.querySelector('select[name="service"]');
    if (select) {
      var ok = Array.prototype.some.call(select.options, function (o) {
        if (o.value.toLowerCase() === presetService.toLowerCase() ||
            o.textContent.trim().toLowerCase() === presetService.toLowerCase()) {
          select.value = o.value;
          return true;
        }
        return false;
      });
      if (!ok) {
        // услуги нет в списке — записываем её в комментарий
        var text = document.querySelector('textarea[name="problem"]');
        if (text && !text.value) text.value = 'Услуга: ' + presetService + '\n';
      }
    }
  }

  /* ---------- Формы заявки ---------- */
  document.querySelectorAll('form.js-form').forEach(function (form) {
    var ok = form.querySelector('.form-ok');
    var err = form.querySelector('.form-err');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = form.querySelector('[name="name"]');
      var phone = form.querySelector('[name="phone"]');
      var missing = null;

      if (name && !name.value.trim()) missing = name;
      else if (phone && !phone.value.trim()) missing = phone;

      if (missing) {
        if (err) {
          err.textContent = 'Заполни имя и телефон — иначе я не смогу ответить.';
          err.classList.add('is-visible');
        }
        missing.focus();
        return;
      }
      if (err) err.classList.remove('is-visible');

      // Заглушка: данные никуда не отправляются.
      // Чтобы форма работала по-настоящему, смотри README.md.
      if (ok) {
        ok.classList.add('is-visible');
        ok.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
      form.reset();
      if (presetService && form.querySelector('select[name="service"]')) {
        form.querySelector('select[name="service"]').selectedIndex = 0;
      }
    });
  });

  /* ---------- Плавный переход между страницами ----------
     Клик по внутренней ссылке: страница сначала плавно уходит,
     потом открывается следующая (там её так же плавно показывает anim.js).
     Если анимации отключены (класса .anim нет) — обычный переход. */
  var root = document.documentElement;

  if (root.classList.contains('anim')) {
    document.addEventListener('click', function (e) {
      // не мешаем: другая кнопка мыши, Ctrl/Cmd/Shift, отменённый клик
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      var link = e.target && e.target.closest ? e.target.closest('a') : null;
      if (!link) return;

      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;              // якорь на этой же странице
      if (link.target && link.target !== '_self') return;        // открывается в новой вкладке
      if (link.hasAttribute('download')) return;
      if (/^(mailto:|tel:|https?:)/i.test(href)) return;         // почта, звонок, чужие сайты

      var url;
      try {
        url = new URL(link.href, location.href);
      } catch (err) {
        return;
      }
      if (url.origin !== location.origin) return;
      // та же страница с якорем или параметром — пусть браузер обработает сам
      if (url.pathname === location.pathname && url.search === location.search) return;

      e.preventDefault();
      root.classList.add('is-leaving');
      setTimeout(function () {
        location.href = url.href;
      }, 220);
    });

    // если страницу вернули назад — снимаем «уход», она снова видна
    window.addEventListener('pageshow', function () {
      root.classList.remove('is-leaving');
    });
  }
})();
