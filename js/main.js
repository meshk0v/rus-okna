/* ===== Русские окна — главная ===== */
(function () {
	'use strict';

	// Куда отправляются заявки (см. send.php)
	var LEAD_ENDPOINT = 'send.php';

	/*
	 * Профили REHAU. Чтобы поменять цену или характеристики — правьте здесь,
	 * карточки профилей, вкладки цен и калькулятор пересчитаются сами.
	 *   priceFrom  — «цена от» за глухое окно без установки (блок «Профильные системы»)
	 *   base       — цена окна 1100×1400 без монтажа (база для блока «Цены» и калькулятора)
	 */
	var PROFILES = [
		{ id: 'blitz', name: 'Blitz New', ru: 'Блиц', url: '/plastikovye-okna-rehau/plastikovye-okna-rehau-blitz-new', img: 'img/profile-blitz.png', stars: 4, priceFrom: 4500, base: 9500, chambers: 3, depth: 60, glass: 32, heat: '0,70', fittings: 'Roto', tip: 'Базовый профиль REHAU для городских квартир: высокое качество по доступной цене.' },
		{ id: 'constanta', name: 'Constanta', ru: 'Константа', url: '/plastikovye-okna-rehau/plastikovoe-okno-rehau-euro-60', img: 'img/profile-constanta.png', stars: 4, priceFrom: 5000, base: 10000, chambers: 4, depth: 60, glass: 32, heat: '0,74', fittings: 'Roto', tip: 'Профиль Thermo 60: повышенная взломобезопасность и выбор цвета створки.' },
		{ id: 'grazio', name: 'Grazio', ru: 'Грацио', url: '/plastikovye-okna-rehau/rehau-grazio', img: 'img/profile-grazio.png', stars: 5, priceFrom: 5500, base: 10800, chambers: 5, depth: 70, glass: 40, heat: '0,85', fittings: 'Roto', tip: 'Средний ценовой сегмент: 70 мм и 5 камер, заметно теплее базовых систем.' },
		{ id: 'delight', name: 'Delight-Design', ru: 'Делайт', url: '/plastikovye-okna-rehau/plastikovye-okna-rehau-delight', img: 'img/profile-delight.png', stars: 5, priceFrom: 5900, base: 11500, chambers: 5, depth: 70, glass: 44, heat: '0,80', fittings: 'Roto', tip: 'Узкая рама — больше света без потери тепло- и шумоизоляции.' },
		{ id: 'intelio', name: 'Intelio', ru: 'Интелио', url: '/plastikovye-okna-rehau/rehau-intelio', img: 'img/profile-intelio.png', stars: 5, priceFrom: 8000, base: 15500, chambers: 6, depth: 80, glass: 50, heat: '0,95', fittings: 'Siegenia', tip: 'Премиум: очень тепло и очень тихо — шумоизоляция до 45 дБ.' }
	];
	var BASE_AREA = 1.1 * 1.4;

	// Типовые конструкции для блока «Цены»
	var WINDOW_TYPES = [
		{ id: 'single', title: 'Одностворчатое пластиковое окно', w: 700, h: 1200, k: 1.2 },
		{ id: 'double', title: 'Двухстворчатое пластиковое окно', w: 1300, h: 1400, k: 1 },
		{ id: 'triple', title: 'Трёхстворчатое пластиковое окно', w: 2000, h: 1400, k: 0.95 },
		{ id: 'balcony', title: 'Балконный блок', w: 2000, h: 2150, area: 0.7 * 2.15 + 1.3 * 1.4, k: 1.05 }
	];

	var $ = function (s, r) { return (r || document).querySelector(s); };
	var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
	var fmt = function (n) { return Math.round(n).toLocaleString('ru-RU').replace(/,/g, ' ') + ' ₽'; };
	var perM2 = function (p) { return p.base / BASE_AREA; };
	var roundUp = function (n) { return Math.ceil(n / 100) * 100; };
	var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

	/* ---------- Меню ---------- */
	var burger = $('#burger'), nav = $('#nav');
	burger.addEventListener('click', function () {
		var open = nav.classList.toggle('is-open');
		burger.setAttribute('aria-expanded', open);
	});
	$$('a', nav).forEach(function (a) {
		a.addEventListener('click', function () { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', false); });
	});

	/* ---------- Профильные системы ---------- */
	$('#profilesList').innerHTML = PROFILES.map(function (p) {
		var stars = '★★★★★'.slice(0, p.stars) + '<i>' + '★★★★★'.slice(p.stars) + '</i>';
		return '<article class="profile">' +
			'<div class="profile__top"><span class="profile__brand">REHAU</span>' +
			'<a class="info" href="' + p.url + '" data-tip="' + esc(p.tip) + '" aria-label="Подробнее о профиле ' + esc(p.name) + '">i</a></div>' +
			'<a href="' + p.url + '"><img class="profile__img" src="' + p.img + '" alt="Профиль REHAU ' + esc(p.name) + ' в разрезе" loading="lazy" width="200" height="260"></a>' +
			'<a class="profile__name" href="' + p.url + '">' + esc(p.name) + '</a>' +
			'<div class="stars" aria-label="Класс ' + p.stars + ' из 5">' + stars + '</div>' +
			'<div class="profile__price"><span>Цена<br>от:</span><b>' + fmt(p.priceFrom) + '</b></div>' +
			'<ul class="specs">' +
				'<li>Число камер<b>' + p.chambers + '</b></li>' +
				'<li>Глубина<b>' + p.depth + ' мм</b></li>' +
				'<li>Стеклопакет<b>до ' + p.glass + ' мм</b></li>' +
				'<li title="Сопротивление теплопередаче, м²·°C/Вт">Теплоизоляция<b>' + p.heat + '</b></li>' +
				'<li>Фурнитура<b>' + p.fittings + '</b></li>' +
			'</ul>' +
			'<button class="btn btn--dark" data-modal="callback" data-subject="Профиль ' + esc(p.name) + '">Уточнить стоимость</button>' +
		'</article>';
	}).join('');

	/* ---------- Цены (вкладки) ---------- */
	function windowSvg(type) {
		var frame = function (x, y, w, h, handle) {
			return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="2" fill="url(#sky)" stroke="#fff" stroke-width="7"/>' +
				'<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="2" fill="none" stroke="#cfcac2" stroke-width="1"/>' +
				(handle ? '<rect x="' + (handle === 'r' ? x + w - 9 : x + 4) + '" y="' + (y + h / 2 - 12) + '" width="5" height="24" rx="2.5" fill="#bdb7ad"/>' : '');
		};
		var defs = '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fc7ea"/><stop offset=".65" stop-color="#d8ebf7"/><stop offset=".66" stop-color="#9ec29a"/><stop offset="1" stop-color="#7ba776"/></linearGradient></defs>';
		var body;
		if (type === 'single') body = '<rect x="0" y="0" width="120" height="200" fill="#fff" stroke="#d8d3ca"/>' + frame(10, 10, 100, 180, 'r');
		else if (type === 'double') body = '<rect x="0" y="0" width="220" height="230" fill="#fff" stroke="#d8d3ca"/>' + frame(10, 10, 95, 210) + frame(115, 10, 95, 210, 'l');
		else if (type === 'triple') body = '<rect x="0" y="0" width="320" height="220" fill="#fff" stroke="#d8d3ca"/>' + frame(10, 10, 95, 200, 'r') + frame(113, 10, 95, 200) + frame(216, 10, 95, 200, 'l');
		else body = '<rect x="0" y="40" width="220" height="190" fill="#fff" stroke="#d8d3ca"/>' + frame(10, 50, 95, 170) + frame(115, 50, 95, 170, 'l') +
			'<rect x="226" y="0" width="100" height="330" fill="#fff" stroke="#d8d3ca"/>' + frame(236, 10, 80, 190, 'l') +
			'<rect x="236" y="208" width="80" height="112" fill="#f4f2ee" stroke="#d8d3ca"/>';
		var vb = { single: '0 0 120 200', double: '0 0 220 230', triple: '0 0 320 220', balcony: '0 0 326 330' }[type];
		return '<svg viewBox="-2 -2 ' + vb.split(' ').slice(2).map(function (n) { return +n + 4; }).join(' ') + '" aria-hidden="true">' + defs + body + '</svg>';
	}

	function renderPrices(p) {
		$('#priceCards').innerHTML = WINDOW_TYPES.map(function (t) {
			var area = t.area || (t.w * t.h / 1e6);
			var price = roundUp(perM2(p) * area * t.k);
			return '<article class="price">' +
				'<div class="price__media"><span class="price__tag price__tag--l">🇩🇪 Немецкий<br>профиль</span><span class="price__tag price__tag--r">Гарантия<br>3 года</span>' + windowSvg(t.id) + '</div>' +
				'<div class="price__body"><h3>' + t.title + ' REHAU ' + esc(p.name) + '</h3>' +
				'<span class="price__label">Цена за окно:</span>' +
				'<div class="price__value"><small>от </small>' + fmt(price) + '</div>' +
				'<ul class="specs">' +
					'<li>Размеры<b>' + t.w + ' × ' + t.h + ' мм</b></li>' +
					'<li>Профиль<b>' + esc(p.name) + ', ' + p.chambers + ' кам., ' + p.depth + ' мм</b></li>' +
					'<li>Стеклопакет<b>до ' + p.glass + ' мм</b></li>' +
					'<li>Фурнитура<b>' + p.fittings + '</b></li>' +
				'</ul>' +
				'<button class="btn btn--dark" data-calc-profile="' + p.id + '" data-calc-type="' + t.id + '" data-w="' + t.w + '" data-h="' + t.h + '">Рассчитать</button>' +
			'</div></article>';
		}).join('');
	}

	var tabs = $('#priceTabs');
	tabs.innerHTML = PROFILES.map(function (p, i) {
		return '<button class="tab" role="tab" aria-selected="' + (i === 0) + '" data-id="' + p.id + '">' + esc(p.name) + '</button>';
	}).join('');
	tabs.addEventListener('click', function (e) {
		var b = e.target.closest('.tab'); if (!b) return;
		$$('.tab', tabs).forEach(function (t) { t.setAttribute('aria-selected', t === b); });
		renderPrices(PROFILES.filter(function (p) { return p.id === b.dataset.id; })[0]);
	});
	renderPrices(PROFILES[0]);

	/* ---------- Калькулятор ---------- */
	var form = $('#calcForm');
	var step = 1, LAST = 4;
	var stepItems = $$('.calc__steps li');
	var btnNext = $('.calc__next', form), btnBack = $('.calc__back', form), btnSubmit = $('.calc__submit', form);

	$('#calcProfiles').innerHTML = PROFILES.map(function (p, i) {
		return '<label class="chip"><input type="radio" name="profile" value="' + p.id + '"' + (i === 0 ? ' checked' : '') + '><span>' + esc(p.name) + '</span></label>';
	}).join('');

	function calcState() {
		var fd = new FormData(form);
		var p = PROFILES.filter(function (x) { return x.id === fd.get('profile'); })[0] || PROFILES[0];
		var w = Math.min(Math.max(+fd.get('width') || 0, 300), 6000);
		var h = Math.min(Math.max(+fd.get('height') || 0, 300), 3000);
		var qty = Math.min(Math.max(parseInt(fd.get('qty'), 10) || 1, 1), 50);
		var objK = +$('input[name="object"]:checked', form).dataset.k;
		var sashInput = $('input[name="sash"]:checked', form);
		var total = roundUp(perM2(p) * (w * h / 1e6) * qty * objK * +sashInput.dataset.k);
		return {
			total: total,
			summary: fd.get('object') + ' · ' + w + '×' + h + ' мм × ' + qty + ' шт. · створок: ' + sashInput.value + ' · REHAU ' + p.name +
				(fd.getAll('opt').length ? ' · ' + fd.getAll('opt').join(', ') : '')
		};
	}

	function goTo(n) {
		step = n;
		$$('.calc__pane', form).forEach(function (el) { el.classList.toggle('is-active', +el.dataset.step === n); });
		stepItems.forEach(function (li, i) {
			li.classList.toggle('is-active', i + 1 === n);
			li.classList.toggle('is-done', i + 1 < n);
		});
		btnBack.hidden = n === 1;
		btnNext.hidden = n === LAST;
		btnSubmit.hidden = n !== LAST;
		if (n === LAST) {
			var s = calcState();
			$('#calcTotal').textContent = 'от ' + fmt(s.total);
			$('#calcSummary').textContent = s.summary + '. Без учёта монтажа и доп. опций.';
		}
	}
	btnNext.addEventListener('click', function () { goTo(Math.min(step + 1, LAST)); });
	btnBack.addEventListener('click', function () { goTo(Math.max(step - 1, 1)); });

	// «Рассчитать» в блоке цен — подставляем профиль и размеры в калькулятор
	document.addEventListener('click', function (e) {
		var b = e.target.closest('[data-calc-profile]'); if (!b) return;
		$('input[name="profile"][value="' + b.dataset.calcProfile + '"]', form).checked = true;
		form.width.value = b.dataset.w;
		form.height.value = b.dataset.h;
		var sash = { single: '1', double: '2', triple: '3', balcony: 'Балконный блок' }[b.dataset.calcType];
		$('input[name="sash"][value="' + sash + '"]', form).checked = true;
		goTo(LAST);
		$('#calc').scrollIntoView({ behavior: 'smooth', block: 'center' });
	});

	/* ---------- Модалка ---------- */
	var modal = $('#modal-callback'), lastFocus = null;
	function openModal(subject) {
		lastFocus = document.activeElement;
		modal.hidden = false;
		$('input[name="subject"]', modal).value = subject || '';
		setTimeout(function () { $('input[name="name"]', modal).focus(); }, 30);
		document.body.style.overflow = 'hidden';
	}
	function closeModal() {
		modal.hidden = true;
		document.body.style.overflow = '';
		if (lastFocus) lastFocus.focus();
	}
	document.addEventListener('click', function (e) {
		var t = e.target.closest('[data-modal]');
		if (t) { e.preventDefault(); openModal(t.dataset.subject); }
		if (e.target.closest('[data-close]')) closeModal();
	});
	document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

	/* ---------- Маска телефона ---------- */
	function maskPhone(input) {
		input.addEventListener('input', function () {
			var d = input.value.replace(/\D/g, '');
			if (!d) { input.value = ''; return; }
			if (d[0] === '8') d = '7' + d.slice(1);
			if (d[0] !== '7') d = '7' + d;
			d = d.slice(0, 11);
			var r = '+7';
			if (d.length > 1) r += ' (' + d.slice(1, 4);
			if (d.length >= 4) r += ')';
			if (d.length > 4) r += ' ' + d.slice(4, 7);
			if (d.length > 7) r += '-' + d.slice(7, 9);
			if (d.length > 9) r += '-' + d.slice(9, 11);
			input.value = r;
		});
	}
	$$('input[type="tel"]').forEach(maskPhone);

	/* ---------- Отправка форм ---------- */
	var toast = $('#toast'), toastTimer;
	function showToast(msg, isError) {
		toast.textContent = msg;
		toast.classList.toggle('is-error', !!isError);
		toast.classList.add('is-show');
		clearTimeout(toastTimer);
		toastTimer = setTimeout(function () { toast.classList.remove('is-show'); }, 5000);
	}

	function sendLead(f, extra) {
		var phone = f.querySelector('input[type="tel"]');
		var field = phone.closest('.field');
		if (phone.value.replace(/\D/g, '').length < 11) {
			field.classList.add('is-error');
			phone.focus();
			showToast('Проверьте номер телефона', true);
			return;
		}
		field.classList.remove('is-error');

		var fd = new FormData(f);
		fd.append('form', f.dataset.form || 'Расчёт в калькуляторе');
		fd.append('page', location.href);
		Object.keys(extra || {}).forEach(function (k) { fd.append(k, extra[k]); });

		var btn = f.querySelector('[type="submit"]');
		btn.disabled = true;
		fetch(LEAD_ENDPOINT, { method: 'POST', body: fd })
			.then(function (r) { return r.json(); })
			.then(function (res) {
				if (!res.ok) throw new Error(res.error || 'error');
				f.reset();
				if (f === form) goTo(1);
				if (!modal.hidden) closeModal();
				showToast('Спасибо! Заявка отправлена — перезвоним в ближайшее время.');
				if (window.ym) window.ym(90301814, 'reachGoal', 'lead');
			})
			.catch(function () {
				showToast('Не удалось отправить. Позвоните нам: +7 (978) 830-55-53', true);
			})
			.then(function () { btn.disabled = false; });
	}

	form.addEventListener('submit', function (e) {
		e.preventDefault();
		var s = calcState();
		sendLead(form, { calc: s.summary + ' · ориентировочно от ' + fmt(s.total) });
	});
	$$('form[data-form]').forEach(function (f) {
		f.addEventListener('submit', function (e) { e.preventDefault(); sendLead(f); });
	});

	// Имя выбранных файлов
	$$('.file input').forEach(function (inp) {
		var label = inp.nextElementSibling, initial = label.textContent;
		inp.addEventListener('change', function () {
			if (inp.files.length > 5) { showToast('Можно прикрепить не более 5 файлов', true); inp.value = ''; }
			label.textContent = inp.files.length ? '📎 ' + Array.prototype.map.call(inp.files, function (x) { return x.name; }).join(', ') : initial;
		});
	});

	$('#year').textContent = new Date().getFullYear();
})();
