import { useQuery } from '@tanstack/react-query';
import api from '../lib/api.js';
import { sampleTours } from '../data/sampleTours.js';

export function useTours(filters) {
  return useQuery({
    queryKey: ['tours', filters],
    queryFn: async () => {
      const { data } = await api.get('/tours', { params: { ...filters, limit: 12 } });
      return data.items;
    },
    initialData: sampleTours,
    initialDataUpdatedAt: 0,
    select: tours => tours.filter(tour => {
      const matchesCategory = !filters.category || tour.category === filters.category;
      const searchText = `${tour.title} ${tour.destination} ${tour.summary}`.toLowerCase();
      const matchesSearch = !filters.q || searchText.includes(filters.q.toLowerCase());
      return matchesCategory && matchesSearch;
    })
  });
}