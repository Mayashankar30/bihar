import { useQuery } from '@tanstack/react-query';

export function usePlaces(query, enabled) {
  return useQuery({
    queryKey: ['places', query],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams({
        q: `${query}, Bihar, India`,
        format: 'jsonv2',
        addressdetails: '1',
        limit: '6',
        countrycodes: 'in',
        viewbox: '83.3,27.5,88.3,24.3',
        bounded: '1'
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { signal });
      if (!response.ok) throw new Error(`Place search returned ${response.status}`);

      const results = await response.json();
      return results.map(place => ({
        id: place.place_id,
        name: place.name || place.display_name.split(',')[0],
        address: place.display_name,
        type: place.type,
        latitude: Number(place.lat),
        longitude: Number(place.lon)
      }));
    },
    enabled: enabled && query.length >= 2,
    staleTime: 5 * 60 * 1000
  });
}