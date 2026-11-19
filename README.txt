WINDCHIC — website v6 (November 2026)

STRUCTURE
- Static site for GitHub Pages (CNAME windchic.com, .nojekyll kept).
- English at the root, French in /fr/, Chinese in /zh/ — real pages, no client-side translation.
- All copy lives in tools/content.py (one entry = English, French, Chinese).
- Page templates live in tools/build.py. Never edit the generated .html files by hand.

BUILD
  python3 tools/build.py        # regenerates 18 pages + 404.html + sitemap.xml
  python3 -m http.server 8765   # preview at http://localhost:8765

ASSETS
- assets/css/site.css   single stylesheet (design tokens at the top)
- assets/js/site.js     menu, hero carousel, language memory, contact form
- assets/img/           one file per photo, each used once on the site
- assets/logos/         partner logos + WINDCHIC logo

PHOTO CREDITS
- Segovia photos: WINDCHIC / DJI Enterprise event, 17 Nov 2026 (user-provided).
- svc-*, hero-celebration, services-hero, projects-hero, blog-*, contact-hero,
  reasons-bg, proj-montpellier: Unsplash (Unsplash License, free commercial use).
- City photos, founders, trade-show photos: previously supplied by WINDCHIC.

TO VALIDATE BEFORE LAUNCH
- Permission to name DJI Enterprise and show its branding in the Segovia case.
- Partner logos (SB Service, VFormations, Serrurerie Vidal, Caffè Panis, Da Squad).
- Contact form prepares an email (mailto); connect a form service for automatic sending.
