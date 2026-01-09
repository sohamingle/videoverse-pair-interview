"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { client } from "@/utils/hono-client";
import { Button } from "@workspace/ui/components/button";

export const DemosDisplay = () => {
  const queryClient = useQueryClient();

  const { data: demos } = useQuery({
    queryKey: ["demos"],
    queryFn: async () => {
      const response = await client.api.demo.$get({
        query: {
          page: 1,
          limit: 10,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch demos");
      }
      const data = await response.json();

      return data.data.demos;
    },
  });

  const mutation = useMutation({
    mutationFn: () => {
      return client.api.demo.$post({
        json: {
          title: "New Demo",
        },
      });
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["demos"] });
    },
  });

  return (
    <div>
      <h1>Demos Display</h1>
      <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>Create Demo</Button>
      <div>
        {demos?.map((demo) => (
          <div key={demo.id}>{demo.title}</div>
        ))}
      </div>
    </div>
  );
};

export default DemosDisplay;
