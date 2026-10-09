import { AdminLayout } from '@/components/admin/AdminLayout';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <section className="max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">Sign in to continue</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in with your administrator account to open the dashboard.
          </p>
          <Link
            href="/login?redirect_url=%2Fadmin"
            className="mt-6 inline-flex rounded-lg bg-primary-600 px-5 py-2.5 font-medium text-white hover:bg-primary-700"
          >
            Sign in
          </Link>
        </section>
      </main>
    );
  }

  if (!(await getAuthenticatedAdmin())) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <section className="max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">Administrator access required</h1>
          <p className="mt-2 text-sm text-gray-600">
            This signed-in account is not authorized to access the admin dashboard.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-lg bg-gray-900 px-5 py-2.5 font-medium text-white hover:bg-gray-700"
          >
            Return to store
          </Link>
        </section>
      </main>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}