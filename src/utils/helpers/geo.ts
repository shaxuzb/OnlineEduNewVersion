export type GeoResponse = {
  country_code: string;
  country: string;
};

export const fetchGeoByIP = async (): Promise<GeoResponse> => {
  const res = await fetch('https://ipwho.is/');
  const data = await res.json();

  if (!data?.success) {
    throw new Error('Geo fetch failed');
  }

  return {
    country_code: data.country_code,
    country: data.country,
  };
};
