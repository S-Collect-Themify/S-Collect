export const campaignKeys = {
  all: ['vendor-campaigns'] as const,
  lists: () => [...campaignKeys.all, 'list'] as const,
  list: (params?: Record<string, unknown>) =>
    [...campaignKeys.lists(), params ?? {}] as const,
};
