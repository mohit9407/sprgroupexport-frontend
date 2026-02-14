export const navItems = [
  {
    name: 'HOME',
    href: '/',
  },
  {
    name: 'CATALOG',
    href: '/catalog',
    hasDropdown: true,
    subItems: [
      { name: 'All Products', href: '/catalog/all' },
      { name: 'New Arrivals', href: '/catalog/new' },
      { name: 'Featured', href: '/catalog/featured' },
    ],
  },
  {
    name: 'ABOUT US',
    href: '/about-us',
  },
  {
    name: 'CONTACT US',
    href: '/contact-us',
  },
]
