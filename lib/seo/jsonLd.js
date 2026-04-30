const BASE_URL = 'https://yunkhngn.dev';

export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Khoa Nguyễn',
    alternateName: 'yun.khngn',
    url: BASE_URL,
    image: `${BASE_URL}/image/thumbnail.jpg`,
    jobTitle: 'Software Engineer',
    sameAs: [
      'https://github.com/yunkhngn',
      'https://instagram.com/yun.khngn',
      'https://facebook.com/yunkhngn',
    ],
  };
}

export function webSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Khoa Nguyễn',
    url: BASE_URL,
    author: { '@type': 'Person', name: 'Khoa Nguyễn' },
  };
}

export function articleJsonLd({ title, description, slug, datePublished, dateModified, image }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: `${BASE_URL}/blog/${slug}`,
    datePublished,
    dateModified: dateModified || datePublished,
    image: image || `${BASE_URL}/image/thumbnail.jpg`,
    author: { '@type': 'Person', name: 'Khoa Nguyễn', url: BASE_URL },
    publisher: { '@type': 'Person', name: 'Khoa Nguyễn', url: BASE_URL },
  };
}

export function projectJsonLd({ title, description, slug, image }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: title,
    description,
    url: `${BASE_URL}/project/${slug}`,
    image: image || `${BASE_URL}/image/thumbnail.jpg`,
    author: { '@type': 'Person', name: 'Khoa Nguyễn', url: BASE_URL },
  };
}

export function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
