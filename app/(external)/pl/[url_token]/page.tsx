import PriceListExternalComponent from "./_components/price-list-external-component";

interface PageProps {
  params: Promise<{ url_token: string }>;
}

export default async function PriceListExternalPage({ params }: PageProps) {
  const { url_token } = await params;

  return <PriceListExternalComponent urlToken={url_token} />;
}
