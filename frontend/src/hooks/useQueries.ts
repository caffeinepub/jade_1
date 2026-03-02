import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Category, type Product, type OrderT, type OrderItem, OrderStatus } from '../backend';

export function useInitializeProducts() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not ready');
      return actor.initializeProducts();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useAllProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      // Fetch all categories in parallel
      const [tops, bottoms, dresses, accessories] = await Promise.all([
        actor.getProductsByCategory(Category.tops),
        actor.getProductsByCategory(Category.bottoms),
        actor.getProductsByCategory(Category.dresses),
        actor.getProductsByCategory(Category.accessories),
      ]);
      return [...tops, ...bottoms, ...dresses, ...accessories];
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 5,
  });
}

export function useProductsByCategory(category: Category | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'category', category],
    queryFn: async () => {
      if (!actor || category === null) return [];
      return actor.getProductsByCategory(category);
    },
    enabled: !!actor && !isFetching && category !== null,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSearchProducts(searchTerm: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'search', searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm.trim()) return [];
      return actor.searchProducts(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.trim().length > 0,
    staleTime: 1000 * 30,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: OrderItem[]) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.placeOrder(items);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useGetOrder(orderId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<OrderT>({
    queryKey: ['orders', orderId?.toString()],
    queryFn: async () => {
      if (!actor || orderId === null) throw new Error('No order ID');
      return actor.getOrder(orderId);
    },
    enabled: !!actor && !isFetching && orderId !== null,
    retry: false,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: bigint; status: OrderStatus }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['orders', orderId.toString()] });
    },
  });
}
