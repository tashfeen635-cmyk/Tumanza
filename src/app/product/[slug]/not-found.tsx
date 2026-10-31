import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="container" style={{ marginTop: 120, marginBottom: 80, textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 32 }}>Product not found</h1>
      <p style={{ margin: '12px 0 24px', color: '#666' }}>
        This product may have been removed or the link is outdated.
      </p>
      <Link href="/shop" className="btn btn-primary">
        Browse Shop
      </Link>
    </div>
  );
}
