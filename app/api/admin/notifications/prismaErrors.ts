import { Prisma } from '@prisma/client'

function getPrismaErrorCode(err: unknown): string | null {
  if (err instanceof Error && 'code' in err) {
    const code = (err as Prisma.PrismaClientKnownRequestError).code
    return typeof code === 'string' ? code : null
  }
  return null
}

export function isNotificationTableMissingError(err: unknown): boolean {
  return getPrismaErrorCode(err) === 'P2021'
}

export function isPrismaDatabaseUnavailableError(err: unknown): boolean {
  const code = getPrismaErrorCode(err)
  return code === 'P1001' || code === 'P1008'
}
