#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build the static WINDCHIC site in three languages.

    python3 tools/build.py

Outputs:  /*.html (English), /fr/*.html (Français), /zh/*.html (中文),
          sitemap.xml. All copy lives in tools/content.py.
"""
import html
import json
import os
import sys
from urllib.parse import quote

sys.path.insert(0, os.path.dirname(__file__))
from content import LANGS, S, t as _t  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://windchic.com"
VERSION = "6.0"
PHONE = "+33782654082"
PHONE_H = "+33 7 82 65 40 82"
EMAIL = "info@windchic.com"
WECHAT = "Contact-Windchic"

PAGES = [  # slug, nav key
    ("index", "nav.home"),
    ("services", "nav.services"),
    ("projects", "nav.projects"),
    ("about", "nav.about"),
    ("journal", "nav.journal"),
    ("contact", "nav.contact"),
]

SERVICES = [  # id, key prefix, image
    ("staff", "svc.staff", "svc-staff"),
    ("design", "svc.design", "svc-design"),
    ("catering", "svc.catering", "svc-catering"),
    ("brunch", "svc.brunch", "svc-brunch"),
    ("team-building", "svc.team", "svc-teambuilding"),
    ("entertainment", "svc.ent", "svc-entertainment"),
    ("artistic", "svc.art", "svc-artistic"),
    ("audiovisual", "svc.av", "svc-audiovisual"),
    ("exhibitions", "svc.expo", "svc-exhibitions"),
    ("delegations", "svc.deleg", "svc-concierge"),
]

PARTNERS = [  # name, logo file or None (wordmark), subtitle
    ("SB Service", "sbservice.webp", None),
    ("VFormations", "vformations.webp", None),
    ("Serrurerie Vidal", "serrurerie-vidal.svg", None),
    ("Caffè Panis", "caffe-panis.webp", None),
    ("Da Squad", "dasquad.webp", None),
    ("Wingstar", None, "GROUP"),
    ("LPF", None, "TRADING"),
    ("Aiper", None, None),
    ("Trend Tents", None, None),
]


class Page:
    def __init__(self, lang, slug):
        self.lang, self.slug = lang, slug
        self.pre = "" if lang == "en" else "../"

    def t(self, key):
        return _t(key, self.lang)

    def e(self, key):  # escaped, for attributes / plain text
        return html.escape(self.t(key), quote=True)

    def lst(self, key):
        return self.t(key).split("|")

    def img(self, name):
        return f"{self.pre}assets/img/{name}.webp"

    def href(self, slug, lang=None):
        lang = lang or self.lang
        file = "index.html" if slug == "index" else f"{slug}.html"
        if slug == "404":
            return f"/{'' if lang == 'en' else lang + '/'}"
        if lang == self.lang:
            return file
        if self.lang == "en":
            return f"{lang}/{file}"
        return f"../{file}" if lang == "en" else f"../{lang}/{file}"

    def url(self, slug, lang=None):
        lang = lang or self.lang
        file = "" if slug == "index" else f"{slug}.html"
        return f"{SITE}/{'' if lang == 'en' else lang + '/'}{file}"


def picture(p, name, alt_key, cls="", pos=None, eager=False, sizes=None):
    style = f' style="object-position:{pos}"' if pos else ""
    loading = 'fetchpriority="high"' if eager else 'loading="lazy" decoding="async"'
    alt = p.e(alt_key) if alt_key else ""
    return (f'<img class="{cls}" src="{p.img(name)}" alt="{alt}" {loading}{style}>')


# ── Layout pieces ───────────────────────────────────────────────────────

def head(p, title_key, desc_key):
    alts = "".join(
        f'<link rel="alternate" hreflang="{"zh-Hans" if l == "zh" else l}" href="{p.url(p.slug, l)}">'
        for l in LANGS) + f'<link rel="alternate" hreflang="x-default" href="{p.url(p.slug, "en")}">'
    fonts = "family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600"
    if p.lang == "zh":
        fonts += "&family=Noto+Sans+SC:wght@400;500&family=Noto+Serif+SC:wght@500;600"
    html_lang = {"en": "en", "fr": "fr", "zh": "zh-Hans"}[p.lang]
    og_locale = {"en": "en_GB", "fr": "fr_FR", "zh": "zh_CN"}[p.lang]
    return f"""<!DOCTYPE html>
<html lang="{html_lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{p.e(title_key)}</title>
<meta name="description" content="{p.e(desc_key)}">
<meta name="theme-color" content="#0b1420">
<link rel="canonical" href="{p.url(p.slug)}">
{alts}
<meta property="og:type" content="website">
<meta property="og:site_name" content="WINDCHIC">
<meta property="og:locale" content="{og_locale}">
<meta property="og:title" content="{p.e(title_key)}">
<meta property="og:description" content="{p.e(desc_key)}">
<meta property="og:url" content="{p.url(p.slug)}">
<meta property="og:image" content="{SITE}/assets/img/segovia-kiosks.webp">
<link rel="icon" href="{p.pre}assets/logos/windchic-mark.png" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?{fonts}&display=swap">
<link rel="stylesheet" href="{p.pre}assets/css/site.css?v={VERSION}">
<script defer src="{p.pre}assets/js/site.js?v={VERSION}"></script>
</head>"""


def lang_switch(p, cls=""):
    labels = {"en": ("EN", "English"), "fr": ("FR", "Français"), "zh": ("中文", "中文")}
    items = []
    for l in LANGS:
        short, full = labels[l]
        cur = ' aria-current="true"' if l == p.lang else ""
        items.append(f'<a href="{p.href(p.slug, l)}" hreflang="{"zh-Hans" if l == "zh" else l}" '
                     f'lang="{"zh-Hans" if l == "zh" else l}" data-lang="{l}" title="{full}"{cur}>{short}</a>')
    return f'<nav class="lang {cls}" aria-label="{p.e("nav.lang")}">{"".join(items)}</nav>'


def header(p, overlay=True):
    links = "".join(
        f'<a href="{p.href(s)}"{" aria-current=\"page\"" if s == p.slug else ""}>{p.t(k)}</a>'
        for s, k in PAGES[1:])
    mlinks = "".join(
        f'<a href="{p.href(s)}"{" aria-current=\"page\"" if s == p.slug else ""}>{p.t(k)}</a>'
        for s, k in PAGES)
    return f"""<body class="page-{p.slug} lang-{p.lang}">
<a class="skip" href="#main">{p.t("nav.skip")}</a>
<header class="site-header{' is-overlay' if overlay else ''}" data-header>
  <div class="header-inner">
    <a class="brand" href="{p.href('index')}" aria-label="WINDCHIC — {p.e('nav.home')}">
      <img src="{p.pre}assets/logos/windchic-white.png" alt="WINDCHIC" width="164" height="48">
    </a>
    <nav class="main-nav" aria-label="Main">{links}</nav>
    <div class="header-actions">
      {lang_switch(p)}
      <a class="btn btn-gold btn-sm header-cta" href="{p.href('contact')}">{p.t("nav.quote")}</a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-menu"
        data-open-label="{p.e('nav.menu')}" data-close-label="{p.e('nav.close')}" aria-label="{p.e('nav.menu')}"><span></span><span></span></button>
    </div>
  </div>
</header>
<div class="mobile-menu" id="mobile-menu" hidden>
  <nav class="menu-links" aria-label="Mobile">{mlinks}</nav>
  {lang_switch(p, 'lang-lg')}
  <a class="btn btn-gold" href="{p.href('contact')}">{p.t("nav.quote")}</a>
</div>
<main id="main">"""


def wa_link(p):
    return f"https://wa.me/{PHONE.lstrip('+')}?text={quote(p.t('wa.text'))}"


def footer(p):
    svc = "".join(f'<li><a href="{p.href("services")}#{sid}">{p.t(k + ".t")}</a></li>' for sid, k, _ in SERVICES[:6])
    nav = "".join(f'<li><a href="{p.href(s)}">{p.t(k)}</a></li>' for s, k in PAGES)
    wa_svg = ('<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3a13 13 0 0 0-11.2 19.7L3 29l6.5-1.7A13 13 0 1 0 16 3Z" '
              'fill="none" stroke="currentColor" stroke-width="2"/><path d="M11.2 9.4c-.5-.6-1.2-.4-1.5.2-.5 1.1-.7 2.1 0 3.5 1.6 3.5 4.8 6.8 8.1 8 .9.4 2.2.5 3.1 0 .7-.4 1.6-1.2 1.7-1.9l-3.4-1.5-1.4 1.4c-1.8-.7-3.3-2.1-4.2-3.9l1.2-1.5-1.5-3.4Z" fill="currentColor"/></svg>')
    return f"""</main>
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-cta">
      <div><p class="eyebrow">{p.t("footer.cta.eyebrow")}</p><h2 class="display">{p.t("footer.cta.title")}</h2></div>
      <a class="btn btn-gold" href="{p.href('contact')}">{p.t("nav.quote")} <span aria-hidden="true">→</span></a>
    </div>
    <div class="footer-grid">
      <div class="footer-brand">
        <img src="{p.pre}assets/logos/windchic-white.png" alt="WINDCHIC" width="190" height="56" loading="lazy">
        <p>{p.t("footer.pitch")}</p>
      </div>
      <div><h3>{p.t("footer.explore")}</h3><ul>{nav}</ul></div>
      <div><h3>{p.t("footer.services")}</h3><ul>{svc}</ul></div>
      <div><h3>{p.t("footer.reach")}</h3><ul>
        <li><a href="{wa_link(p)}" target="_blank" rel="noopener">WhatsApp</a></li>
        <li><a href="{p.href('contact')}#wechat">WeChat · {WECHAT}</a></li>
        <li><a href="mailto:{EMAIL}">{EMAIL}</a></li>
        <li><a href="tel:{PHONE}">{PHONE_H}</a></li>
      </ul></div>
    </div>
    <div class="footer-bottom">
      <span>{p.t("footer.rights")}</span>
      <span>{p.t("footer.regions")}</span>
      {lang_switch(p, 'lang-footer')}
    </div>
  </div>
</footer>
<a class="wa-float" href="{wa_link(p)}" target="_blank" rel="noopener" aria-label="{p.e('wa.label')}" title="{p.e('wa.label')}">{wa_svg}</a>
</body>
</html>
"""


def subhero(p, prefix, image, pos="center"):
    return f"""<section class="subhero">
  {picture(p, image, prefix + '.alt', 'subhero-img', pos, eager=True)}
  <div class="subhero-shade" aria-hidden="true"></div>
  <div class="wrap subhero-content">
    <p class="eyebrow">{p.t(prefix + '.eyebrow')}</p>
    <h1 class="display">{p.t(prefix + '.title')}</h1>
    <p class="lead">{p.t(prefix + '.lead')}</p>
  </div>
</section>"""


def cta_band(p):
    return f"""<section class="cta-band">
  <div class="wrap cta-inner reveal">
    <h2 class="display">{p.t("cta.title")}</h2>
    <p class="lead">{p.t("cta.lead")}</p>
    <div class="btn-row">
      <a class="btn btn-gold" href="{p.href('contact')}">{p.t("nav.quote")} <span aria-hidden="true">→</span></a>
      <a class="btn btn-ghost" href="{wa_link(p)}" target="_blank" rel="noopener">WhatsApp</a>
      <a class="btn btn-ghost" href="{p.href('contact')}#wechat">{p.t("cta.wechat")}</a>
    </div>
  </div>
</section>"""


# ── Pages ───────────────────────────────────────────────────────────────

def page_index(p):
    slides = [("hero-paris", "home.hero.alt1", "50% 55%", "62% 50%"),
              ("hero-celebration", "home.hero.alt2", "50% 40%", "50% 40%"),
              ("hero-barcelona", "home.hero.alt3", "55% 50%", "68% 50%")]
    slide_html = "".join(
        f'<div class="hero-slide{" is-active" if i == 0 else ""}" style="--pos:{pd};--pos-m:{pm}">'
        f'<img src="{p.img(n)}" alt="{p.e(a)}" {"fetchpriority=high" if i == 0 else "loading=lazy decoding=async"}></div>'
        for i, (n, a, pd, pm) in enumerate(slides))
    pillars = "".join(
        f'<article class="pillar reveal"><span class="pillar-num">0{i}</span><h3>{p.t(f"home.p{i}.t")}</h3><p>{p.t(f"home.p{i}.d")}</p></article>'
        for i in (1, 2, 3))
    svc_cards = "".join(
        f'<a class="svc-card reveal" href="{p.href("services")}#{sid}"><span class="svc-num">{i:02d}</span>'
        f'<h3>{p.t(k + ".t")}</h3><p>{p.t(k + ".s")}</p><span class="svc-arrow" aria-hidden="true">→</span></a>'
        for i, (sid, k, _) in enumerate(SERVICES, 1))
    reasons = "".join(
        f'<li class="reason reveal"><span class="reason-num">{i}</span><div><h3>{p.t(f"reasons.r{i}.t")}</h3><p>{p.t(f"reasons.r{i}.d")}</p></div></li>'
        for i in range(1, 6))
    steps = "".join(
        f'<li class="step-item reveal"><span class="step-num">0{i}</span><h3>{p.t(f"process.s{i}.t")}</h3><p>{p.t(f"process.s{i}.d")}</p></li>'
        for i in range(1, 5))
    stats = "".join(
        f'<div><strong>{p.t(f"home.case.s{i}")}</strong><span>{p.t(f"home.case.s{i}l")}</span></div>' for i in (1, 2, 3))
    return f"""
<section class="hero" aria-roledescription="carousel">
  <div class="hero-slides" data-slides>{slide_html}</div>
  <div class="hero-shade" aria-hidden="true"></div>
  <div class="wrap hero-content">
    <p class="eyebrow eyebrow-line">{p.t("home.hero.eyebrow")}</p>
    <h1 class="display hero-title">{p.t("home.hero.title")}</h1>
    <p class="lead hero-lead">{p.t("home.hero.lead")}</p>
    <div class="btn-row">
      <a class="btn btn-gold" href="{p.href('contact')}">{p.t("nav.quote")} <span aria-hidden="true">→</span></a>
      <a class="btn btn-ghost" href="{p.href('services')}">{p.t("home.hero.cta2")}</a>
    </div>
  </div>
  <div class="wrap hero-bar">
    <div class="hero-controls">
      <button type="button" class="hero-prev" aria-label="{p.e('home.hero.prev')}">←</button>
      <span class="hero-count" aria-live="polite"><b>01</b> / 03</span>
      <button type="button" class="hero-next" aria-label="{p.e('home.hero.next')}">→</button>
      <span class="hero-progress" aria-hidden="true"><i></i></span>
    </div>
    <a class="hero-scroll" href="#bridge">{p.t("home.hero.scroll")} <span aria-hidden="true">↓</span></a>
  </div>
</section>

<section class="section bridge" id="bridge">
  <div class="wrap">
    <div class="split">
      <div class="reveal"><p class="eyebrow">{p.t("home.bridge.eyebrow")}</p><h2 class="display">{p.t("home.bridge.title")}</h2></div>
      <p class="lead reveal">{p.t("home.bridge.lead")}</p>
    </div>
    <div class="pillars">{pillars}</div>
  </div>
</section>

<section class="section section-sand">
  <div class="wrap">
    <div class="section-head reveal">
      <div><p class="eyebrow">{p.t("home.services.eyebrow")}</p><h2 class="display">{p.t("home.services.title")}</h2></div>
      <a class="link-arrow" href="{p.href('services')}">{p.t("home.services.all")} <span aria-hidden="true">→</span></a>
    </div>
    <div class="svc-grid">{svc_cards}</div>
  </div>
</section>

<section class="feature-case">
  <div class="feature-media">{picture(p, 'home-segovia', 'home.case.alt', '', '50% 45%')}</div>
  <div class="feature-copy reveal">
    <p class="eyebrow">{p.t("home.case.eyebrow")}</p>
    <h2 class="display">{p.t("home.case.title")}</h2>
    <p>{p.t("home.case.text")}</p>
    <div class="stats">{stats}</div>
    <a class="link-arrow" href="{p.href('projects')}#segovia">{p.t("home.case.cta")} <span aria-hidden="true">→</span></a>
  </div>
</section>

<section class="section reasons">
  {picture(p, 'reasons-bg', None, 'reasons-bg', '50% 60%')}
  <div class="wrap reasons-inner">
    <div class="section-head reveal"><div><p class="eyebrow">{p.t("reasons.eyebrow")}</p><h2 class="display">{p.t("reasons.title")}</h2></div></div>
    <ol class="reason-list">{reasons}</ol>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head reveal"><div><p class="eyebrow">{p.t("process.eyebrow")}</p><h2 class="display">{p.t("process.title")}</h2></div></div>
    <ol class="steps">{steps}</ol>
  </div>
</section>

{partners_block(p)}
{cta_band(p)}
"""


def partners_block(p):
    tiles = []
    for name, logo, sub in PARTNERS:
        if logo:
            tiles.append(f'<li class="logo-tile"><img src="{p.pre}assets/logos/{logo}" alt="{html.escape(name)}" loading="lazy" decoding="async"></li>')
        else:
            small = f"<small>{sub}</small>" if sub else ""
            tiles.append(f'<li class="logo-tile logo-word"><span>{html.escape(name)}{small}</span></li>')
    return f"""<section class="section partners">
  <div class="wrap">
    <div class="partners-head reveal"><p class="eyebrow">{p.t("partners.eyebrow")}</p><p>{p.t("partners.lead")}</p></div>
    <ul class="logo-wall">{''.join(tiles)}</ul>
  </div>
</section>"""


def page_services(p):
    blocks = []
    for i, (sid, k, image) in enumerate(SERVICES, 1):
        items = "".join(f"<li>{x}</li>" for x in p.lst(k + ".l"))
        blocks.append(f"""<section class="svc-block{' is-alt' if i % 2 == 0 else ''}" id="{sid}">
  <div class="svc-media">{picture(p, image, k + '.t', '')}</div>
  <div class="svc-copy reveal">
    <p class="eyebrow">{i:02d} / {len(SERVICES)}</p>
    <h2 class="display">{p.t(k + '.t')}</h2>
    <p class="svc-lede">{p.t(k + '.s')}</p>
    <p>{p.t(k + '.d')}</p>
    <h3 class="mini">{p.t('services.included')}</h3>
    <ul class="checks">{items}</ul>
    <a class="link-arrow" href="{p.href('contact')}?service={sid}">{p.t('services.ask')} <span aria-hidden="true">→</span></a>
  </div>
</section>""")
    chips = "".join(f'<a href="#{sid}">{p.t(k + ".t")}</a>' for sid, k, _ in SERVICES)
    who = "".join(
        f'<article class="who reveal"><h3>{p.t(f"services.for.{x}.t")}</h3><p>{p.t(f"services.for.{x}.d")}</p></article>'
        for x in "abcd")
    return f"""{subhero(p, 'services.hero', 'services-hero', '50% 55%')}
<nav class="chips wrap" aria-label="{p.e('nav.services')}">{chips}</nav>
{''.join(blocks)}
<section class="section section-sand">
  <div class="wrap">
    <div class="section-head reveal"><div><p class="eyebrow">{p.t('services.for.eyebrow')}</p><h2 class="display">{p.t('services.for.title')}</h2></div></div>
    <div class="who-grid">{who}</div>
  </div>
</section>
{cta_band(p)}"""


def page_projects(p):
    projects = [("lyon", "pj.lyon", "proj-lyon", "status.progress", "50% 40%"),
                ("montpellier", "pj.mtp", "proj-montpellier", "status.delivered", "50% 55%"),
                ("madrid", "pj.mad", "proj-madrid", "status.prep", "50% 50%"),
                ("barcelona", "pj.bcn", "proj-barcelona", "status.prep", "50% 60%"),
                ("paris", "pj.par", "proj-paris-sales", "status.team", "35% 40%")]
    cards = "".join(f"""<article class="proj-card reveal" id="{pid}">
  <div class="proj-media">{picture(p, img, k + '.t', '', pos)}<span class="badge">{p.t(st)}</span></div>
  <p class="proj-loc">{p.t(k + '.loc')}</p>
  <h3>{p.t(k + '.t')}</h3>
  <details><summary>{p.t('projects.details')}</summary><p>{p.t(k + '.d')}</p></details>
</article>""" for pid, k, img, st, pos in projects)
    exp = "".join(f"<li>{x}</li>" for x in p.lst("projects.exp.l"))
    return f"""{subhero(p, 'projects.hero', 'projects-hero', '50% 40%')}
<section class="section case" id="segovia">
  <div class="wrap">
    <div class="case-head reveal">
      <p class="eyebrow">{p.t('case.eyebrow')} · <span class="badge badge-inline">{p.t('status.delivered')}</span></p>
      <h2 class="display">{p.t('case.title')}</h2>
      <p class="lead">{p.t('case.sub')}</p>
    </div>
    <div class="case-gallery">
      <figure class="g-main">{picture(p, 'segovia-kiosks', 'case.alt1', '', '50% 50%')}</figure>
      <figure>{picture(p, 'segovia-detail', 'case.alt2', '', '60% 45%')}</figure>
      <figure>{picture(p, 'segovia-room', 'case.alt3', '', '50% 50%')}</figure>
    </div>
    <div class="case-cols">
      <div class="reveal"><h3>{p.t('case.challenge.t')}</h3><p>{p.t('case.challenge.d')}</p></div>
      <div class="reveal"><h3>{p.t('case.approach.t')}</h3><p>{p.t('case.approach.d')}</p></div>
      <div class="reveal"><h3>{p.t('case.result.t')}</h3><p>{p.t('case.result.d')}</p></div>
    </div>
  </div>
</section>
<section class="section section-sand">
  <div class="wrap">
    <div class="section-head reveal"><div><p class="eyebrow">{p.t('projects.more.eyebrow')}</p><h2 class="display">{p.t('projects.more.title')}</h2></div></div>
    <div class="proj-grid">{cards}</div>
  </div>
</section>
<section class="section">
  <div class="wrap narrow reveal">
    <p class="eyebrow">{p.t('projects.exp.eyebrow')}</p>
    <p class="lead">{p.t('projects.exp.lead')}</p>
    <ul class="checks checks-lg">{exp}</ul>
  </div>
</section>
{cta_band(p)}"""


def page_about(p):
    small = "".join(
        f'<article class="pillar reveal"><span class="pillar-num">0{i}</span><h3>{p.t(f"about.small.{x}.t")}</h3><p>{p.t(f"about.small.{x}.d")}</p></article>'
        for i, x in enumerate("abc", 1))
    return f"""{subhero(p, 'about.hero', 'about-hero', '55% 50%')}
<section class="section">
  <div class="wrap split">
    <div class="reveal"><p class="eyebrow">{p.t('about.story.eyebrow')}</p><h2 class="display">{p.t('about.story.title')}</h2></div>
    <div class="prose reveal"><p>{p.t('about.story.p1')}</p><p>{p.t('about.story.p2')}</p></div>
  </div>
</section>
<section class="founders">
  <div class="founders-media">{picture(p, 'founders', 'about.founders.alt', '', '50% 22%')}</div>
  <div class="founders-copy reveal">
    <p class="eyebrow">{p.t('about.founders.eyebrow')}</p>
    <h2 class="display">{p.t('about.founders.title')}</h2>
    <p>{p.t('about.founders.w')}</p>
    <p>{p.t('about.founders.t')}</p>
    <p class="muted-light">{p.t('about.founders.lang')}</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="section-head reveal"><div><p class="eyebrow">{p.t('about.small.eyebrow')}</p><h2 class="display">{p.t('about.small.title')}</h2></div></div>
    <div class="pillars">{small}</div>
  </div>
</section>
{cta_band(p)}"""


def page_journal(p):
    arts = [("a2", "blog-delegations", "a.alt2"), ("a1", "blog-brief", "a.alt1"),
            ("a3", "blog-backstage", "a.alt3"), ("a4", "blog-catering", "a.alt4")]
    cards = "".join(f"""<article class="article reveal">
  <div class="article-media">{picture(p, img, alt, '')}</div>
  <p class="eyebrow">{p.t(a + '.tag')}</p>
  <h2>{p.t(a + '.t')}</h2>
  <p class="article-excerpt">{p.t(a + '.x')}</p>
  <details><summary>{p.t('journal.read')}</summary><p>{p.t(a + '.b')}</p></details>
</article>""" for a, img, alt in arts)
    return f"""{subhero(p, 'journal.hero', 'blog-hero', '50% 50%')}
<section class="section"><div class="wrap article-grid">{cards}</div></section>
{cta_band(p)}"""


def page_contact(p):
    types = "".join(f"<option>{html.escape(x)}</option>" for x in p.lst("form.type.o"))
    guests = "".join(f"<option>{html.escape(x)}</option>" for x in p.lst("form.guests.o"))
    budget = "".join(f'<option{" value=\"\"" if i == 0 else ""}>{html.escape(x)}</option>' for i, x in enumerate(p.lst("form.budget.o")))
    svc_checks = "".join(
        f'<label class="chip-check"><input type="checkbox" name="services" value="{p.e(k + ".t")}" data-service="{sid}"><span>{p.t(k + ".t")}</span></label>'
        for sid, k, _ in SERVICES)
    i18n = json.dumps({k: p.t(k) for k in ("form.copied", "form.copyfail", "form.required", "form.subject", "form.notset",
                                           "form.type", "form.services", "form.location", "form.desc", "form.date",
                                           "form.guests", "form.budget", "form.name", "form.company", "form.mail",
                                           "form.messenger", "form.step")}, ensure_ascii=False)
    return f"""{subhero(p, 'contact.hero', 'contact-hero', '50% 45%')}
<section class="section">
  <div class="wrap contact-grid">
    <div class="contact-direct reveal">
      <p class="eyebrow">{p.t('contact.direct.eyebrow')}</p>
      <h2 class="display">{p.t('contact.direct.title')}</h2>
      <a class="contact-line" href="{wa_link(p)}" target="_blank" rel="noopener"><span>WhatsApp</span><strong>{p.t('contact.wa')}</strong><i aria-hidden="true">→</i></a>
      <a class="contact-line" href="tel:{PHONE}"><span>{p.t('contact.call')}</span><strong>{PHONE_H}</strong><i aria-hidden="true">→</i></a>
      <a class="contact-line" href="mailto:{EMAIL}"><span>{p.t('contact.email')}</span><strong>{EMAIL}</strong><i aria-hidden="true">→</i></a>
      <div class="wechat" id="wechat">
        <div>
          <p class="eyebrow">WeChat · 微信</p>
          <p class="wechat-id">{WECHAT}</p>
          <p class="small">{p.t('contact.wechat.t')}</p>
          <button class="link-arrow" type="button" data-copy="{WECHAT}">{p.t('contact.wechat.copy')}</button>
          <p class="small status" role="status" aria-live="polite"></p>
        </div>
        <img src="{p.pre}assets/img/wechat-qr.webp" alt="{p.e('contact.wechat.alt')}" width="150" height="150" loading="lazy">
      </div>
    </div>
    <div class="form-card reveal">
      <div class="form-top"><p class="eyebrow">{p.t('form.eyebrow')}</p><p class="form-progress" aria-live="polite">01 / 03</p></div>
      <h2 class="display">{p.t('form.title')}</h2>
      <p class="small">{p.t('form.note')}</p>
      <form id="brief-form" novalidate>
        <fieldset class="form-step is-active" data-step="1">
          <legend>{p.t('form.s1')}</legend>
          <label for="f-type">{p.t('form.type')}</label>
          <select id="f-type" name="type" required><option value="">{p.t('form.type.ph')}</option>{types}</select>
          <p class="label">{p.t('form.services')}</p>
          <div class="chip-checks">{svc_checks}</div>
          <label for="f-location">{p.t('form.location')}</label>
          <input id="f-location" name="location" required placeholder="{p.e('form.location.ph')}" autocomplete="address-level2">
          <div class="form-nav"><button class="btn btn-dark" type="button" data-next>{p.t('form.next')} <span aria-hidden="true">→</span></button></div>
        </fieldset>
        <fieldset class="form-step" data-step="2">
          <legend>{p.t('form.s2')}</legend>
          <label for="f-date">{p.t('form.date')}</label>
          <input id="f-date" name="date" type="date">
          <label for="f-guests">{p.t('form.guests')}</label>
          <select id="f-guests" name="guests">{guests}</select>
          <label for="f-budget">{p.t('form.budget')}</label>
          <select id="f-budget" name="budget">{budget}</select>
          <label for="f-desc">{p.t('form.desc')}</label>
          <textarea id="f-desc" name="description" rows="4" placeholder="{p.e('form.desc.ph')}"></textarea>
          <div class="form-nav"><button class="btn btn-line" type="button" data-back>← {p.t('form.back')}</button><button class="btn btn-dark" type="button" data-next>{p.t('form.next')} <span aria-hidden="true">→</span></button></div>
        </fieldset>
        <fieldset class="form-step" data-step="3">
          <legend>{p.t('form.s3')}</legend>
          <label for="f-name">{p.t('form.name')}</label>
          <input id="f-name" name="name" required autocomplete="name">
          <label for="f-company">{p.t('form.company')}</label>
          <input id="f-company" name="company" autocomplete="organization">
          <label for="f-email">{p.t('form.mail')}</label>
          <input id="f-email" name="email" type="email" required autocomplete="email" placeholder="name@company.com">
          <label for="f-msg">{p.t('form.messenger')}</label>
          <input id="f-msg" name="messenger" placeholder="{p.e('form.messenger.ph')}">
          <div class="form-nav"><button class="btn btn-line" type="button" data-back>← {p.t('form.back')}</button><button class="btn btn-gold" type="submit">{p.t('form.submit')} <span aria-hidden="true">→</span></button></div>
        </fieldset>
      </form>
      <div class="form-result" id="form-result" hidden tabindex="-1">
        <h3>{p.t('form.ready')}</h3>
        <p>{p.t('form.ready.d')}</p>
        <pre id="brief-output"></pre>
        <div class="form-nav"><a class="btn btn-gold" id="send-email" href="#">{p.t('form.send')}</a><button class="btn btn-line" type="button" id="copy-brief">{p.t('form.copy')}</button></div>
        <p class="small status" id="copy-status" role="status" aria-live="polite"></p>
      </div>
      <script type="application/json" id="form-i18n">{i18n}</script>
    </div>
  </div>
</section>"""


def page_404(p):
    return f"""<section class="nf"><div class="wrap"><p class="eyebrow">404</p><h1 class="display">{p.t('nf.h')}</h1>
<a class="btn btn-gold" href="/{'' if p.lang == 'en' else p.lang + '/'}">{p.t('nf.back')}</a></div></section>"""


def org_jsonld():
    data = {"@context": "https://schema.org", "@type": "Organization", "name": "WINDCHIC", "url": SITE,
            "logo": f"{SITE}/assets/logos/windchic-mark.png", "email": EMAIL, "telephone": PHONE,
            "areaServed": "Europe", "knowsLanguage": ["zh", "fr", "en", "es", "de"]}
    return f'<script type="application/ld+json">{json.dumps(data, ensure_ascii=False)}</script>'


RENDER = {
    "index": (page_index, "home.title", "home.desc", True),
    "services": (page_services, "services.title", "services.desc", True),
    "projects": (page_projects, "projects.title", "projects.desc", True),
    "about": (page_about, "about.title", "about.desc", True),
    "journal": (page_journal, "journal.title", "journal.desc", True),
    "contact": (page_contact, "contact.title", "contact.desc", True),
}


def build():
    # sanity: every key has three non-empty values
    for k, v in S.items():
        assert len(v) == 3 and all(x.strip() for x in v), k
    written = []
    for lang in LANGS:
        outdir = ROOT if lang == "en" else os.path.join(ROOT, lang)
        os.makedirs(outdir, exist_ok=True)
        for slug, (fn, tk, dk, overlay) in RENDER.items():
            p = Page(lang, slug)
            body = fn(p)
            doc = head(p, tk, dk) + header(p, overlay) + body + footer(p)
            if slug == "index":
                doc = doc.replace("</head>", org_jsonld() + "\n</head>", 1)
            path = os.path.join(outdir, "index.html" if slug == "index" else f"{slug}.html")
            with open(path, "w", encoding="utf-8") as f:
                f.write(doc)
            written.append(path)
    # 404 (GitHub Pages serves /404.html for every language)
    p = Page("en", "404")
    p.pre = "/"
    doc = head(p, "nf.title", "home.desc").replace(f'<link rel="canonical" href="{p.url("404")}">', "")
    doc += header(p, False) + page_404(p) + footer(p)
    with open(os.path.join(ROOT, "404.html"), "w", encoding="utf-8") as f:
        f.write(doc.replace('<meta name="description"', '<meta name="robots" content="noindex"><meta name="description"', 1))
    # sitemap
    urls = []
    for slug in RENDER:
        p = Page("en", slug)
        alts = "".join(f'<xhtml:link rel="alternate" hreflang="{"zh-Hans" if l == "zh" else l}" href="{p.url(slug, l)}"/>' for l in LANGS)
        for l in LANGS:
            urls.append(f"<url><loc>{p.url(slug, l)}</loc>{alts}</url>")
    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
                'xmlns:xhtml="http://www.w3.org/1999/xhtml">' + "".join(urls) + "</urlset>\n")
    print(f"Built {len(written)} pages + 404.html + sitemap.xml")


if __name__ == "__main__":
    build()
