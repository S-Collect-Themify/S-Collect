export const attributeKeys = {
  all: ['vendor-attributes'] as const,
  lists: () => [...attributeKeys.all, 'list'] as const,
  details: () => [...attributeKeys.all, 'detail'] as const,
  detail: (id: string) => [...attributeKeys.details(), id] as const,
};
