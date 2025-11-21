import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function withAuth(
  request: NextRequest,
  allowedRoles: string[] = ['ADMIN', 'EDITOR']
) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const userRole = token.role as string
  if (!userRole || !allowedRoles.includes(userRole)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden' },
      { status: 403 }
    )
  }

  return null // No error, continue
}

// Role-specific auth helpers
export async function withAdminAuth(request: NextRequest) {
  return withAuth(request, ['ADMIN', 'SUPER_ADMIN'])
}

export async function withEditorAuth(request: NextRequest) {
  return withAuth(request, ['ADMIN', 'EDITOR'])
}

export async function withAuthorAuth(request: NextRequest) {
  return withAuth(request, ['ADMIN', 'AUTHOR'])
}

export async function withUserAuth(request: NextRequest) {
  return withAuth(request, ['ADMIN', 'EDITOR', 'AUTHOR', 'USER'])
}