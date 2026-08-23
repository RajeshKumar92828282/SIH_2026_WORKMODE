import { z } from 'zod';

export const IndexHistoryQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.coerce.number().min(1).max(500).default(50),
});

export const RouteQuerySchema = z.object({
  routeId: z.string().optional(),
});

export const ObservationsQuerySchema = z.object({
  route: z.string().optional(),
  carrier: z.string().optional(),
  leadTime: z.enum(['T+1', 'T+15']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(200).default(50),
});

export const CreateApiKeySchema = z.object({
  orgId: z.string().min(2),
  scope: z.string().default('read:index'),
  rateTier: z.enum(['standard', 'institutional', 'unlimited']).default('standard'),
});

export const CreateOrgSchema = z.object({
  name: z.string().min(2),
  contactEmail: z.string().email(),
});
