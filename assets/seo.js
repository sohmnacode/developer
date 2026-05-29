/**
 * seo.js — Injects canonical, Open Graph, and Twitter Card meta tags
 * from the page's existing <title> and <meta name="description">.
 * Skips gracefully if tags already exist (e.g. index.html).
 */
(function () {
  'use strict';
  var BASE = 'https://reincarnatedai.com';
  var IMG  = BASE + '/og-image.jpg';
  var SITE = 'ReincarnatedAI';
  var path = window.location.pathname.replace(/\/+$/, '') || '/';
  var url  = BASE + path;
  var title = document.title;
  var descEl = document.querySelector('meta[name="description"]');
  var desc = descEl ? descEl.getAttribute('content') :
    'The science of consciousness, near-death experience, reincarnation, and the soul — rigorously explored by ReincarnatedAI.';

  function injectMeta(attrs) {
    var key = attrs.property || attrs.name;
    var sel = attrs.property ? 'meta[property="' + key + '"]' : 'meta[name="' + key + '"]';
    if (document.querySelector(sel)) return;
    var el = document.createElement('meta');
    Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    document.head.appendChild(el);
  }
  function injectLink(attrs) {
    if (document.querySelector('link[rel="' + attrs.rel + '"]')) return;
    var el = document.createElement('link');
    Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    document.head.appendChild(el);
  }

  injectLink({ rel: 'canonical', href: url });
  injectMeta({ property: 'og:type',         content: 'website' });
  injectMeta({ property: 'og:url',          content: url });
  injectMeta({ property: 'og:site_name',    content: SITE });
  injectMeta({ property: 'og:title',        content: title });
  injectMeta({ property: 'og:description',  content: desc });
  injectMeta({ property: 'og:image',        content: IMG });
  injectMeta({ property: 'og:image:width',  content: '1200' });
  injectMeta({ property: 'og:image:height', content: '630' });
  injectMeta({ property: 'og:image:alt',    content: SITE + ' — Soul Science Research' });
  injectMeta({ name: 'twitter:card',        content: 'summary_large_image' });
  injectMeta({ name: 'twitter:title',       content: title });
  injectMeta({ name: 'twitter:description', content: desc });
  injectMeta({ name: 'twitter:image',       content: IMG });
})();
