// Tek kareyi ?p=ios|android&s=01 parametreleriyle çizer. Tüm ölçüler genişliğin yüzdesi (u).
(function () {
  const q = new URLSearchParams(location.search);
  const P = window.PLATFORMS[q.get('p') || 'ios'];
  const S = { ...window.SLIDES.find((x) => x.id === (q.get('s') || '01')) };
  if (P.device === 'android') { S.shot = S.shotAndroid || S.shot; S.sub = S.subAndroid || S.sub; }
  const W = P.w, H = P.h, u = W / 100;
  const c = document.getElementById('c');
  c.style.width = W + 'px';
  c.style.height = H + 'px';
  const px = (n) => n * u + 'px';
  const el = (tag, cls, css, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    Object.assign(e.style, css || {});
    if (html != null) e.innerHTML = html;
    return e;
  };

  // Marka
  const brand = el('div', 'brand', { left: px(7.5), top: px(7.5), gap: px(2), fontSize: px(2.6) });
  brand.append(el('img', null, { height: px(4.2) }));
  brand.firstChild.src = '../../../assets/brand/mark.png';
  brand.append(el('span', null, { fontFamily: 'Unbounded', letterSpacing: '.04em', color: '#ECE8E4', fontSize: px(3.6) }, 'MARATON'));
  c.append(brand);

  // Başlık + alt satır
  const tall = H / W > 2;
  const headTop = tall ? 20 : 17;
  const h1 = el('h1', null, { left: px(7.5), top: px(headTop), fontSize: px(12.6), whiteSpace: 'nowrap' },
    `${S.a}<em>${S.b}</em>`);
  c.append(h1);
  document.fonts.ready.then(() => {
    const max = 85 * u;
    if (h1.offsetWidth > max) h1.style.fontSize = 12.6 * u * (max / h1.offsetWidth) + 'px';
  });
  c.append(el('p', 'sub', { left: px(7.5), top: px(headTop + 27.5), fontSize: px(3.9), width: px(80) }, S.sub));

  // Telefon
  const phoneTop = tall ? 61 : 57;
  const phoneW = 74, phoneL = (100 - phoneW) / 2, bez = 2.1;
  const phone = el('div', 'phone', {
    left: px(phoneL), top: px(phoneTop), width: px(phoneW), height: px(phoneW * 2.17),
    borderRadius: px(11.5), boxShadow: `0 0 0 ${px(0.5)} #2A2A31`,
  });
  const screen = el('div', 'screen', {
    left: px(bez), top: px(bez), right: px(bez), bottom: px(bez), borderRadius: px(9.6),
  });
  const img = new Image();
  img.onerror = () => {
    img.remove();
    screen.append(el('div', 'missing', { fontSize: px(3) }, `shots/${S.shot}<br>bekleniyor`));
    window.__ready = true;
  };
  img.onload = () => { window.__ready = true; };
  img.src = 'shots/' + S.shot;
  screen.append(img);
  phone.append(screen);
  if (P.device === 'ios') {
    phone.append(el('div', 'island', { top: px(bez + 1.6), width: px(17), height: px(5), borderRadius: px(3) }));
  } else {
    phone.append(el('div', 'island', { top: px(bez + 1.8), width: px(3.2), height: px(3.2), borderRadius: '50%' }));
  }
  c.append(phone);

  // Rota çizgisi: kenardan gelip telefonun kenarına bağlanan ince kırmızı hat
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'route');
  svg.setAttribute('width', W);
  svg.setAttribute('height', H);
  svg.style.top = 0;
  const y0 = (phoneTop - 3.2) * u;
  const pts = S.route === 'mid'
    ? [[-2, -1.5], [12, 1], [30, -1], [50, 0.5]]
    : [[-2, 1], [20, -1], [62, 0.8], [86, -1]];
  const P2 = pts.map(([x, dy]) => [x * u, y0 + dy * u]);
  let d = `M${P2[0][0]},${P2[0][1]}`;
  for (let i = 1; i < P2.length; i++) {
    const [x0, yA] = P2[i - 1], [x1, yB] = P2[i], mx = (x0 + x1) / 2;
    d += ` C${mx},${yA} ${mx},${yB} ${x1},${yB}`;
  }
  const ns = 'http://www.w3.org/2000/svg';
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', '#E5343F');
  path.setAttribute('stroke-width', 0.42 * u);
  path.setAttribute('stroke-linecap', 'round');
  svg.append(path);
  P2.slice(1).forEach(([x, y], i, arr) => {
    const last = i === arr.length - 1;
    const n = document.createElementNS(ns, 'circle');
    n.setAttribute('cx', x);
    n.setAttribute('cy', y);
    n.setAttribute('r', (last ? 1.5 : 1.15) * u);
    n.setAttribute('fill', last ? '#FF6A72' : '#1C1C23');
    n.setAttribute('stroke', last ? '#FF6A72' : '#E5343F');
    n.setAttribute('stroke-width', 0.42 * u);
    svg.append(n);
  });
  c.insertBefore(svg, phone);
})();
