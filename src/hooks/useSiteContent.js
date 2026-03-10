import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { DEFAULT_SITE_CONTENT } from "@/lib/defaultSiteContent";

const SENTINEL_TITLE = "__SITE_CONFIG__";

function deepMerge(defaults, overrides) {
  if (!overrides || typeof overrides !== "object") return defaults;
  const result = { ...defaults };
  for (const key of Object.keys(overrides)) {
    if (
      overrides[key] !== null &&
      typeof overrides[key] === "object" &&
      !Array.isArray(overrides[key]) &&
      typeof defaults[key] === "object" &&
      !Array.isArray(defaults[key])
    ) {
      result[key] = deepMerge(defaults[key], overrides[key]);
    } else {
      result[key] = overrides[key];
    }
  }
  return result;
}

export function useSiteContent() {
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["site-content"],
    queryFn: () =>
      base44.entities.Announcement.filter(
        { title: SENTINEL_TITLE },
        "-created_date",
        1
      ),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const record = records[0];
  let content = DEFAULT_SITE_CONTENT;

  if (record?.content) {
    try {
      const parsed = JSON.parse(record.content);
      content = deepMerge(DEFAULT_SITE_CONTENT, parsed);
    } catch {
      content = DEFAULT_SITE_CONTENT;
    }
  }

  return { content, recordId: record?.id, isLoading };
}

export function useSiteContentMutation() {
  const queryClient = useQueryClient();

  const { data: records = [] } = useQuery({
    queryKey: ["site-content"],
    queryFn: () =>
      base44.entities.Announcement.filter(
        { title: SENTINEL_TITLE },
        "-created_date",
        1
      ),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const record = records[0];

  const mutation = useMutation({
    mutationFn: async (newContent) => {
      const payload = {
        title: SENTINEL_TITLE,
        content: JSON.stringify(newContent),
        is_active: false,
        target_audience: "system",
      };
      if (record?.id) {
        return base44.entities.Announcement.update(record.id, payload);
      } else {
        return base44.entities.Announcement.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
    },
  });

  return {
    save: mutation.mutateAsync,
    isSaving: mutation.isPending,
    isError: mutation.isError,
  };
}
