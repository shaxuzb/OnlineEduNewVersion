import { useEffect, useState } from 'react';
import { fetchGeoByIP } from '../utils/helpers/geo';

export const useGeo = () => {
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGeoByIP()
      .then(data => {
        setCountryCode(data.country_code);
      })
      .catch(() => {
        setError('Failed to detect country');
      })
      .finally(() => setLoading(false));
  }, []);

  return { countryCode, loading, error };
};
