import ContactClient from './ContactClient';

export const metadata = {
  title: 'Contact',
  description: 'Reach out to Khoa Nguyễn for collaboration, freelance work, or just to say hello.',
  alternates: { canonical: 'https://yunkhngn.dev/contact' },
  openGraph: {
    title: 'Contact — Khoa Nguyễn',
    description: 'Reach out to Khoa Nguyễn for collaboration, freelance work, or just to say hello.',
    url: 'https://yunkhngn.dev/contact',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
