import { useEffect, useState } from "react";
import { fetchGeoByIP } from "../utils/helpers/geo";

type GeoResult = {
  country_code: string | null;
};

let geoCache: GeoResult | null = null;
let geoPromise: Promise<GeoResult> | null = null;

export const useGeo = () => {
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const resolveGeo = async () => {
      try {
        if (geoCache) {
          if (!isMounted) return;
          setCountryCode(geoCache.country_code);
          return;
        }

        if (!geoPromise) {
          geoPromise = fetchGeoByIP().then((data: any) => ({
            country_code: data?.country_code ?? null,
          }));
        }

        const data = await geoPromise;
        geoCache = data;

        if (!isMounted) return;
        setCountryCode(data.country_code);
      } catch {
        if (!isMounted) return;
        setError("Failed to detect country");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    resolveGeo();

    return () => {
      isMounted = false;
    };
  }, []);

  return { countryCode, loading, error };
};
