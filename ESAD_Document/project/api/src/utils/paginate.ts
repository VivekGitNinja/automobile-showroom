export interface PaginationMeta {
  page:       number
  perPage:    number
  total:      number
  totalPages: number
}

export function getPagination(page = 1, perPage = 20) {
  const p     = Math.max(1, page)
  const pp    = Math.min(50, Math.max(1, perPage))
  const skip  = (p - 1) * pp
  return { skip, take: pp, page: p, perPage: pp }
}

export function buildMeta(page: number, perPage: number, total: number): PaginationMeta {
  return { page, perPage, total, totalPages: Math.ceil(total / perPage) }
}
