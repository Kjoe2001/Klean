/* Zelvoo Video Download Studio — iframe client.
   Talks to the AppShell wrapper over postMessage (ns: 'zelvoo-download').
   The parent holds the Supabase session and performs every API call, so no
   access token is ever handed into this frame. */
(function () {
  'use strict';

  var NS = 'zelvoo-download';
  var DISP = '"Unbounded",system-ui,sans-serif';
  var $ = function (s) { return document.querySelector(s); };
  var canvas = $('#view'), ctx = canvas.getContext('2d');

  var PLATFORMS = {
    tiktok:    { label: 'TikTok',    ab: 'TT', bg: '#0b0b0b', re: /(^|\.)tiktok\.com$/i,
                 clip: { a: '#1b2a4a', b: '#0b1220', accent: '#25f4ee', subject: '#f5c6a5' } },
    instagram: { label: 'Instagram', ab: 'IG', bg: 'linear-gradient(135deg,#f9ce34,#ee2a7b 55%,#6228d7)', re: /(^|\.)instagram\.com$/i,
                 clip: { a: '#3a1f42', b: '#160d1c', accent: '#ee2a7b', subject: '#e8b48c' } },
    youtube:   { label: 'YouTube',   ab: 'YT', bg: '#ff0033', re: /(^|\.)(youtube\.com|youtu\.be)$/i,
                 clip: { a: '#2b1414', b: '#120808', accent: '#ff4d4d', subject: '#dda67e' } },
    facebook:  { label: 'Facebook',  ab: 'f',  bg: '#1877f2', re: /(^|\.)(facebook\.com|fb\.watch)$/i,
                 clip: { a: '#14243f', b: '#0a1220', accent: '#4a9bff', subject: '#e3b892' } },
    linkedin:  { label: 'LinkedIn',  ab: 'in', bg: '#0a66c2', re: /(^|\.)linkedin\.com$/i,
                 clip: { a: '#0f2436', b: '#07141d', accent: '#5eb0f0', subject: '#dcae87' } }
  };
  var ORDER = ['tiktok', 'instagram', 'youtube', 'facebook', 'linkedin'];
  var ASPECT_RATIO = { '9:16': 0.5625, '1:1': 1, '4:5': 0.8, '16:9': 1.7778, 'source': 0.5625 };

  var S = {
    plat: 'tiktok', mode: 'link', aspect: '9:16', quality: '1080p',
    style: 'badge', pos: 'tr', scale: 6.5, opacity: 92, drift: false, safeInset: true,
    acked: false, links: [], enforceBranding: true, plan: 'trial', credits: 0,
    logoImg: null, logoUrl: null, playing: true, t: 0, video: null, duration: 34
  };

  /* ---------------------------------------------------------------- bridge */
  var pending = {}, reqSeq = 0;
  function call(type, payload) {
    return new Promise(function (resolve) {
      var reqId = ++reqSeq;
      pending[reqId] = resolve;
      parent.postMessage(Object.assign({ ns: NS, type: type, reqId: reqId }, payload || {}), '*');
      setTimeout(function () {
        if (pending[reqId]) { delete pending[reqId]; resolve({ ok: false, error: 'timeout' }); }
      }, 30000);
    });
  }
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || d.ns !== NS) return;
    if (d.type === 'config') {
      S.enforceBranding = !!d.enforceBranding;
      S.plan = d.plan || 'trial';
      S.credits = d.credits != null ? d.credits : 0;
      applyPlan();
      return;
    }
    if (d.reqId && pending[d.reqId]) { pending[d.reqId](d); delete pending[d.reqId]; }
  });

  function applyPlan() {
    $('#planTag').textContent = S.plan;
    if (S.enforceBranding) {
      $('#planCopy').textContent = 'Free and trial exports carry the Zelvoo badge. Upgrade to use your own logo instead.';
      $('#logoBtn').style.opacity = '.45';
    } else {
      $('#planCopy').textContent = 'Your plan includes custom branding — upload a PNG and it replaces the Zelvoo badge on every export.';
      $('#upgradeBtn').style.display = 'none';
      $('#logoBtn').style.opacity = '';
    }
    refreshMsg();
  }

  /* ------------------------------------------------------------ source bar */
  var srcbar = $('#srcbar');
  ORDER.forEach(function (k) {
    var p = PLATFORMS[k];
    var b = document.createElement('button');
    b.className = 'srcchip' + (k === S.plat ? ' on' : '');
    b.dataset.plat = k;
    b.innerHTML = '<span class="pip" style="background:' + p.bg + '">' + p.ab + '</span>' + p.label;
    b.addEventListener('click', function () { setPlat(k); });
    srcbar.appendChild(b);
  });
  function setPlat(k) {
    S.plat = k;
    Array.prototype.forEach.call(document.querySelectorAll('[data-plat]'), function (e) {
      e.classList.toggle('on', e.dataset.plat === k);
    });
  }

  /* ------------------------------------------------------------------ tabs */
  Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (t) {
    t.addEventListener('click', function () {
      Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (x) { x.classList.remove('on'); });
      Array.prototype.forEach.call(document.querySelectorAll('.panel'), function (x) { x.classList.remove('on'); });
      t.classList.add('on');
      document.querySelector('[data-panel="' + t.dataset.tab + '"]').classList.add('on');
      if (t.dataset.tab === 'queue') pollQueue();
    });
  });

  /* ------------------------------------------------------------ intake mode */
  Array.prototype.forEach.call(document.querySelectorAll('#modeSeg button'), function (b) {
    b.addEventListener('click', function () {
      S.mode = b.dataset.mode;
      Array.prototype.forEach.call(document.querySelectorAll('#modeSeg button'), function (x) {
        x.classList.toggle('on', x === b);
      });
      $('#modeLink').style.display = S.mode === 'link' ? '' : 'none';
      $('#modeUpload').style.display = S.mode === 'upload' ? '' : 'none';
      refreshMsg();
    });
  });

  $('#terms').addEventListener('click', function () {
    S.acked = !S.acked;
    $('#terms').classList.toggle('on', S.acked);
    refreshMsg();
  });

  /* ------------------------------------------------------- link detection */
  function detect() {
    var box = $('#detected');
    box.innerHTML = '';
    var lines = $('#linkInput').value.split(/[\n\r]+/).map(function (l) { return l.trim(); })
      .filter(Boolean).slice(0, 20);
    var first = null, valid = [];

    lines.forEach(function (line) {
      var host = null;
      try { host = new URL(/^https?:\/\//i.test(line) ? line : 'https://' + line).hostname; } catch (err) { host = null; }
      var key = host && ORDER.filter(function (k) { return PLATFORMS[k].re.test(host); })[0];
      var tag = document.createElement('span');
      if (key) {
        if (!first) first = key;
        valid.push(line);
        tag.className = 'dtag';
        tag.innerHTML = '<span class="pip" style="background:' + PLATFORMS[key].bg + '">' +
          PLATFORMS[key].ab + '</span>' + PLATFORMS[key].label;
      } else {
        tag.className = 'dtag bad';
        tag.textContent = 'Unrecognised link';
      }
      box.appendChild(tag);
    });

    S.links = valid;
    if (first) setPlat(first);
    refreshMsg();
  }
  $('#linkInput').addEventListener('input', detect);

  /* ------------------------------------------------------------- controls */
  function chipGroup(sel, key, after) {
    Array.prototype.forEach.call(document.querySelectorAll(sel + ' .chip'), function (c) {
      c.addEventListener('click', function () {
        Array.prototype.forEach.call(document.querySelectorAll(sel + ' .chip'), function (x) { x.classList.remove('on'); });
        c.classList.add('on');
        S[key] = c.dataset.a || c.dataset.q || c.dataset.style;
        if (after) after();
      });
    });
  }
  chipGroup('#aspectChips', 'aspect', resize);
  chipGroup('#qualChips', 'quality');
  chipGroup('#styleChips', 'style');

  Array.prototype.forEach.call(document.querySelectorAll('#posGrid button'), function (b) {
    b.addEventListener('click', function () {
      Array.prototype.forEach.call(document.querySelectorAll('#posGrid button'), function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      S.pos = b.dataset.pos;
      S.drift = false;
      $('#driftTog').classList.remove('on');
    });
  });
  function toggle(sel, key) {
    $(sel).addEventListener('click', function () {
      S[key] = !S[key];
      $(sel).classList.toggle('on', S[key]);
    });
  }
  toggle('#driftTog', 'drift');
  toggle('#safeTog', 'safeInset');

  $('#sizeR').addEventListener('input', function (e) { S.scale = +e.target.value; $('#sizeVal').textContent = S.scale + '%'; });
  $('#opR').addEventListener('input', function (e) { S.opacity = +e.target.value; $('#opVal').textContent = S.opacity + '%'; });

  /* ---------------------------------------------------------- custom logo */
  $('#logoBtn').addEventListener('click', function () {
    if (S.enforceBranding) { call('openPricing'); return; }
    $('#logoFile').click();
  });
  $('#logoClear').addEventListener('click', function () {
    S.logoImg = null; S.logoUrl = null; $('#logoName').textContent = 'Using the Zelvoo badge.';
  });
  $('#logoFile').addEventListener('change', function (e) {
    var f = e.target.files[0]; if (!f) return;
    var img = new Image();
    img.onload = function () { S.logoImg = img; $('#logoName').textContent = f.name; };
    img.src = URL.createObjectURL(f);
    call('uploadLogo', { name: f.name }).then(function (r) { if (r && r.url) S.logoUrl = r.url; });
  });

  /* ------------------------------------------------------- file preview */
  var dz = $('#dropzone');
  dz.addEventListener('click', function () { $('#videoFile').click(); });
  ['dragenter', 'dragover'].forEach(function (ev) {
    dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('hot'); });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('hot'); });
  });
  dz.addEventListener('drop', function (e) {
    if (e.dataTransfer.files && e.dataTransfer.files[0]) loadVideo(e.dataTransfer.files[0]);
  });
  $('#videoFile').addEventListener('change', function (e) {
    if (e.target.files[0]) loadVideo(e.target.files[0]);
  });
  function loadVideo(f) {
    var v = document.createElement('video');
    v.src = URL.createObjectURL(f);
    v.muted = true; v.loop = true; v.playsInline = true;
    v.addEventListener('loadedmetadata', function () {
      S.video = v; S.duration = v.duration || 34; v.play();
      $('#uploadName').textContent = f.name + ' · ' + (f.size / 1048576).toFixed(1) + ' MB';
      $('#stageNote').textContent = 'Previewing your own footage with the mark composited live.';
      resize(); refreshMsg();
    });
  }

  /* ------------------------------------------------------------- actions */
  function refreshMsg() {
    var n = S.mode === 'link' ? S.links.length : (S.video ? 1 : 0);
    var blocked = !S.acked || n === 0;
    $('#goBtn').disabled = blocked;
    $('#goBtn').textContent = n > 1 ? 'Brand & download ' + n + ' videos' : 'Brand & download';
    var m = $('#msg');
    m.className = 'msg';
    if (!S.acked) { m.textContent = 'Confirm your reuse rights to continue.'; return; }
    if (n === 0) { m.textContent = S.mode === 'link' ? 'Paste at least one supported link.' : 'Choose a file to continue.'; return; }
    var cost = n * 3;
    m.textContent = cost + (cost === 1 ? ' credit' : ' credits') + ' for this batch · ' + S.credits + ' left';
  }

  function brandSpec() {
    return {
      style: S.style, position: S.pos, scale: S.scale, opacity: S.opacity,
      drift: S.drift, safeInset: S.safeInset,
      logoUrl: S.enforceBranding ? null : S.logoUrl,
      zelvoo: S.enforceBranding
    };
  }

  function errorText(code, r) {
    switch (code) {
      case 'insufficient_credits':
        return 'Not enough credits — need ' + r.needed + ', you have ' + r.balance + '.';
      case 'trial_expired':           return 'Your trial has ended. Upgrade to keep downloading.';
      case 'rights_not_acknowledged': return 'Confirm your reuse rights to continue.';
      case 'no_valid_links':          return 'None of those links are from a supported platform.';
      case 'unauthorized':            return 'Session expired — refresh the page and sign in again.';
      case 'timeout':                 return 'That took too long. Check the Queue before retrying.';
      default:                        return 'Could not queue that batch. Try again in a moment.';
    }
  }

  function openQueue() {
    var tab = document.querySelector('.tab[data-tab="queue"]');
    if (tab) tab.click();
  }

  $('#goBtn').addEventListener('click', function () {
    var m = $('#msg');
    $('#goBtn').disabled = true;
    m.className = 'msg'; m.textContent = 'Queueing…';

    call('createJobs', {
      payload: {
        links: S.links, quality: S.quality, aspect: S.aspect,
        brand: brandSpec(), rightsAck: S.acked
      }
    }).then(function (r) {
      if (!r || !r.ok) {
        m.className = 'msg bad';
        m.textContent = errorText(r && r.error, r || {});
        refreshMsg();
        return;
      }
      S.credits = r.balance != null ? r.balance : S.credits;
      m.className = 'msg good';
      m.textContent = (r.jobs || []).length + ' queued. Track them under Queue.';
      $('#linkInput').value = ''; detect();
      openQueue();
    });
  });

  $('#upgradeBtn').addEventListener('click', function () { call('openPricing'); });
  $('#presetBtn').addEventListener('click', function () {
    call('savePreset', { preset: Object.assign({ aspect: S.aspect, quality: S.quality }, brandSpec()) })
      .then(function (r) {
        var m = $('#msg');
        m.className = r && r.ok ? 'msg good' : 'msg bad';
        m.textContent = r && r.ok ? 'Preset saved to your Brand Kit.' : 'Could not save that preset.';
        setTimeout(refreshMsg, 2600);
      });
  });

  /* --------------------------------------------------------------- queue */
  var STATUS_CLASS = {
    ready: 'ready', queued: 'idle', resolving: 'work', branding: 'work',
    failed: 'hold', cancelled: 'hold', expired: 'hold'
  };
  var STATUS_TEXT = {
    ready: 'Ready', queued: 'Queued', resolving: 'Fetching', branding: 'Branding',
    failed: 'Failed', cancelled: 'Cancelled', expired: 'Expired'
  };
  var FAIL_TEXT = {
    unavailable: 'Video is private, deleted or age-restricted. Credit refunded.',
    unsupported: 'That post type is not supported yet. Credit refunded.',
    too_long:    'Clip is longer than the 20-minute limit. Credit refunded.',
    resolver:    'Could not retrieve this video. Credit refunded.'
  };

  function shortUrl(u) {
    try { var x = new URL(u); return x.hostname.replace(/^www\./, '') + x.pathname.slice(0, 28) + '…'; }
    catch (e) { return u; }
  }
  function expiryText(iso) {
    var days = Math.max(0, Math.round((new Date(iso) - Date.now()) / 86400000));
    return days <= 0 ? 'today' : 'in ' + days + (days === 1 ? ' day' : ' days');
  }
  function fmt(t) {
    t = Math.max(0, t || 0);
    var m = Math.floor(t / 60), s = Math.floor(t % 60);
    return m + ':' + String(s).padStart(2, '0');
  }

  function renderQueue(jobs) {
    var list = $('#queueList');
    $('#qCount').textContent = jobs.length ? String(jobs.length) : '0';
    if (!jobs.length) {
      list.innerHTML = '<p class="empty">Nothing queued yet.<br>Paste a link and hit download.</p>';
      return;
    }
    list.innerHTML = '';
    jobs.forEach(function (j) {
      var p = PLATFORMS[j.platform] || PLATFORMS.tiktok;
      var el = document.createElement('div');
      el.className = 'qitem';

      var sub = j.status === 'ready'
        ? (j.duration_s ? fmt(j.duration_s) + ' · ' : '') + j.aspect + ' · ' + j.quality
        : (j.status === 'failed' ? 'Fetch failed' : j.quality + ' · ' + j.aspect);

      var foot = j.status === 'ready'
        ? (j.output_bytes ? (j.output_bytes / 1048576).toFixed(1) + ' MB · ' : '') + 'expires ' + expiryText(j.expires_at)
        : j.status === 'failed'
          ? (FAIL_TEXT[j.error_code] || 'Could not retrieve this video. Credit refunded.')
          : j.status === 'cancelled' ? 'Cancelled. Credit refunded.'
          : 'Working…';

      el.innerHTML =
        '<div class="head"><div class="pip" style="background:' + p.bg + '">' + p.ab + '</div>' +
        '<div class="meta"><b></b><small></small></div>' +
        '<span class="status ' + (STATUS_CLASS[j.status] || 'idle') + '">' + (STATUS_TEXT[j.status] || j.status) + '</span></div>' +
        '<div class="bar"><i style="width:' + (j.status === 'ready' ? 100 : j.progress || 0) + '%"></i></div>' +
        '<div class="foot"><small></small></div>';

      el.querySelector('.meta b').textContent = j.title || shortUrl(j.source_url);
      el.querySelector('.meta small').textContent = sub;
      el.querySelector('.foot small').textContent = foot;

      var footEl = el.querySelector('.foot');
      if (j.status === 'ready') {
        var dl = document.createElement('button');
        dl.className = 'mini'; dl.textContent = 'Download';
        dl.addEventListener('click', function () {
          dl.disabled = true; dl.textContent = 'Preparing…';
          call('jobUrl', { id: j.id }).then(function (r) {
            dl.disabled = false; dl.textContent = 'Download';
            if (r && r.downloadUrl) window.open(r.downloadUrl, '_blank', 'noopener');
          });
        });
        footEl.appendChild(dl);
      } else if (j.status === 'queued' || j.status === 'resolving') {
        var cancel = document.createElement('button');
        cancel.className = 'mini'; cancel.textContent = 'Cancel';
        cancel.addEventListener('click', function () {
          cancel.disabled = true;
          call('cancelJob', { id: j.id }).then(pollQueue);
        });
        footEl.appendChild(cancel);
      }
      list.appendChild(el);
    });
  }

  var pollTimer = null;
  function pollQueue() {
    call('listJobs').then(function (r) {
      if (!r || !r.jobs) return;
      renderQueue(r.jobs);
      var busy = r.jobs.some(function (j) {
        return j.status === 'queued' || j.status === 'resolving' || j.status === 'branding';
      });
      clearTimeout(pollTimer);
      if (busy) pollTimer = setTimeout(pollQueue, 4000);
    });
  }

  /* -------------------------------------------------------------- canvas */
  function resize() {
    var L = 780, ar = ASPECT_RATIO[S.aspect] || 0.5625, w, h;
    if (S.video && S.aspect === 'source' && S.video.videoHeight) {
      ar = S.video.videoWidth / S.video.videoHeight;
    }
    if (ar >= 1) { w = L; h = Math.round(L / ar); } else { h = L; w = Math.round(L * ar); }
    canvas.width = w; canvas.height = h;
  }
  function rr(x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function cover(cw, ch, vw, vh) {
    var s = Math.max(cw / vw, ch / vh);
    return { x: (cw - vw * s) / 2, y: (ch - vh * s) / 2, w: vw * s, h: vh * s };
  }

  function drawPlaceholder(W, H, time) {
    var c = PLATFORMS[S.plat].clip;
    var g = ctx.createLinearGradient(0, 0, W * 0.4, H);
    g.addColorStop(0, c.a); g.addColorStop(1, c.b);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    for (var i = 0; i < 3; i++) {
      var px = W * (0.25 + 0.3 * Math.sin(time * 0.28 + i * 2.1));
      var py = H * (0.3 + 0.22 * Math.cos(time * 0.21 + i * 1.7));
      var rad = Math.min(W, H) * (0.42 + 0.1 * Math.sin(time * 0.4 + i));
      var rg = ctx.createRadialGradient(px, py, 0, px, py, rad);
      rg.addColorStop(0, c.accent + '2e'); rg.addColorStop(1, 'transparent');
      ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    }

    var bob = Math.sin(time * 1.6) * H * 0.004;
    var cx = W * 0.5, headR = Math.min(W, H) * 0.115, headY = H * 0.44 + bob;
    ctx.fillStyle = 'rgba(0,0,0,.28)';
    ctx.beginPath(); ctx.ellipse(cx, H * 0.92, W * 0.42, H * 0.09, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#101a17';
    ctx.beginPath(); ctx.moveTo(cx - W * 0.34, H);
    ctx.quadraticCurveTo(cx - W * 0.30, headY + headR * 1.35, cx, headY + headR * 1.3);
    ctx.quadraticCurveTo(cx + W * 0.30, headY + headR * 1.35, cx + W * 0.34, H);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.subject;
    ctx.beginPath(); ctx.ellipse(cx, headY, headR * 0.86, headR, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.34)';
    ctx.beginPath(); ctx.ellipse(cx, headY - headR * 0.42, headR * 0.9, headR * 0.52, 0, Math.PI, 0); ctx.fill();

    var v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.72);
    v.addColorStop(0, 'transparent'); v.addColorStop(1, 'rgba(0,0,0,.55)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }

  function markGeom(W, H, time) {
    var inset = S.safeInset && S.aspect === '9:16' ? 0.085 : 0.035;
    var m = Math.max(14, Math.round(Math.min(W, H) * inset));
    var bottom = S.safeInset && S.aspect === '9:16' ? H * 0.20 : m;
    var pts = {
      tl: [m, m, 'l', 't'], tr: [W - m, m, 'r', 't'],
      bl: [m, H - bottom, 'l', 'b'], br: [W - m, H - bottom, 'r', 'b'],
      bc: [W / 2, H - bottom, 'c', 'b']
    };
    if (!S.drift) return pts[S.pos];
    var order = ['tl', 'tr', 'br', 'bl'], k = (time / 4) % order.length;
    var i = Math.floor(k), f = k - i, u = f * f * (3 - 2 * f);
    var a = pts[order[i]], b = pts[order[(i + 1) % order.length]];
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, 'c', a[3]];
  }

  function drawMark(W, H, time) {
    var geo = markGeom(W, H, time);
    var ax = geo[0], ay = geo[1], anchor = geo[2], vert = geo[3];
    var h = Math.max(24, Math.round(Math.min(W, H) * (S.scale / 100)));
    ctx.save();
    ctx.globalAlpha = S.opacity / 100;

    if (S.logoImg) {
      var iw = h * (S.logoImg.width / S.logoImg.height), ih = h;
      var lx = anchor === 'r' ? ax - iw : anchor === 'c' ? ax - iw / 2 : ax;
      var ly = vert === 'b' ? ay - ih : ay;
      ctx.drawImage(S.logoImg, lx, ly, iw, ih);
      ctx.restore();
      return;
    }

    var icon = Math.round(h * 0.72), pad = Math.round(h * 0.2), text = 'Zelvoo';
    ctx.font = '700 ' + Math.round(h * 0.38) + 'px ' + DISP;
    var tw = ctx.measureText(text).width;
    var w = S.style === 'badge' ? pad * 3 + icon + tw : S.style === 'wordmark' ? pad * 2 + tw : pad * 2 + icon;
    var x = anchor === 'r' ? ax - w : anchor === 'c' ? ax - w / 2 : ax;
    var y = vert === 'b' ? ay - h : ay;

    ctx.fillStyle = 'rgba(4,22,13,.72)';
    rr(x, y, w, h, Math.round(h * 0.35)); ctx.fill();

    if (S.style !== 'wordmark') {
      ctx.fillStyle = '#00DF81';
      rr(x + pad, y + (h - icon) / 2, icon, icon, Math.round(icon * 0.28)); ctx.fill();
      ctx.fillStyle = '#032414'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '800 ' + Math.round(icon * 0.52) + 'px ' + DISP;
      ctx.fillText('Z', x + pad + icon / 2, y + h / 2 + 1);
    }
    if (S.style !== 'icon') {
      ctx.fillStyle = '#eaf4ee'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.font = '700 ' + Math.round(h * 0.38) + 'px ' + DISP;
      ctx.fillText(text, S.style === 'wordmark' ? x + pad : x + pad * 2 + icon, y + h / 2 + 1);
    }
    ctx.restore();
  }

  function drawSafeGuides(W, H) {
    if (!S.safeInset || S.aspect !== '9:16') return;
    ctx.save();
    ctx.strokeStyle = 'rgba(0,223,129,.22)';
    ctx.setLineDash([7, 9]); ctx.lineWidth = 2;
    ctx.strokeRect(W * 0.05, H * 0.06, W * 0.9, H * 0.78);
    ctx.restore();
  }

  var last = performance.now();
  function loop(now) {
    var dt = (now - last) / 1000; last = now;
    var W = canvas.width, H = canvas.height;

    if (S.video && S.video.readyState >= 2) {
      var f = cover(W, H, S.video.videoWidth, S.video.videoHeight);
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      ctx.drawImage(S.video, f.x, f.y, f.w, f.h);
      S.t = S.video.currentTime;
      S.duration = S.video.duration || S.duration;
    } else {
      if (S.playing) S.t = (S.t + dt) % S.duration;
      drawPlaceholder(W, H, S.t);
    }

    drawSafeGuides(W, H);
    drawMark(W, H, S.t);

    $('#time').textContent = fmt(S.t) + ' / ' + fmt(S.duration);
    $('#scrub').value = Math.round((S.t / S.duration) * 1000);
    requestAnimationFrame(loop);
  }

  $('#playBtn').addEventListener('click', function () {
    S.playing = !S.playing;
    if (S.video) { if (S.playing) { S.video.play(); } else { S.video.pause(); } }
    $('#playBtn').textContent = S.playing ? '❚❚' : '▶';
  });
  $('#scrub').addEventListener('input', function (e) {
    var t = (e.target.value / 1000) * S.duration;
    S.t = t;
    if (S.video) S.video.currentTime = t;
  });

  resize();
  refreshMsg();
  requestAnimationFrame(loop);
  parent.postMessage({ ns: NS, type: 'ready' }, '*');
  pollQueue();
})();
