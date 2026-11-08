import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import ProductDetailClient from '@/components/products/ProductDetailClient';
import { getProductBySlug } from '@/lib/products';
import { breadcrumbJsonLd, faqJsonLd, productJsonLd, productSlug, resolveProductImage } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: 'Product Not Found' };
  }

  const path = `/product/${productSlug(product)}`;
  const title = `${product.name}${product.urduName ? ` (${product.urduName})` : ''}`;
  const description =
    product.description?.slice(0, 155) ||
    `Buy ${product.name} online from Tumanza — organic ${product.category.toLowerCase()} from Gilgit-Baltistan, delivered across Pakistan.`;
  const mainImg = resolveProductImage(product);
  const extraImgs = Array.isArray(product.images) ? product.images : [];
  const allImgs = Array.from(new Set([mainImg, ...extraImgs].filter(Boolean)));
  const imageObjects = allImgs.map((img) => ({
    url: img.startsWith('http') ? img : absoluteUrl(img),
    alt: product.name,
  }));

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${product.name} | Tumanza`,
      description,
      url: absoluteUrl(path),
      type: 'website',
      images: imageObjects,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Tumanza`,
      description,
      images: imageObjects.map((io) => io.url),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const faqs = [
    {
      question: `What is ${product.name}?`,
      answer:
        product.description ||
        `${product.name} is a premium organic ${product.category.toLowerCase()} product sold by Tumanza in Pakistan.`,
    },
    {
      question: `How much does ${product.name} cost?`,
      answer: `${product.name} is priced at Rs.${product.price.toFixed(2)} on Tumanza.com.`,
    },
    {
      question: `Is ${product.name} available for delivery in Pakistan?`,
      answer: `Yes. Order ${product.name} on Tumanza for delivery across Pakistan. Current stock status: ${product.stock || 'In Stock'}.`,
    },
  ];

  return (
    <>
      <JsonLd
        data={[
          productJsonLd(product),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Products', path: '/products' },
            { name: product.name, path: `/product/${productSlug(product)}` },
          ]),
          faqJsonLd(faqs),
        ]}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
