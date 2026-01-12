import { headers } from 'next/headers';
import { verifyUserToken, isUserAdminOfCompany } from '@/lib/whop/client';

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ companyId: string }>;
}

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { companyId } = await params;
  const headersList = await headers();

// Get the user token from headers
const userToken = headersList.get("x-whop-user-token");

// Dev-only bypass for local testing
const devBypass =
  process.env.NODE_ENV === "development" &&
  process.env.DEV_BYPASS_WHOP_AUTH === "true";

if (!userToken && !devBypass) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="text-center p-8 max-w-md">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Authentication Required
        </h1>
        <p className="text-zinc-400">
          Please access this dashboard through Whop.
        </p>
      </div>
    </div>
  );
}

// Use a placeholder token in dev if needed downstream
const effectiveUserToken = userToken ?? "dev-bypass";


  // Create a mock request to verify the token
  const mockRequest = new Request('https://placeholder.com', {
    headers: { "x-whop-user-token": effectiveUserToken },
  });

  let tokenPayload: any = null;

  if (!devBypass) {
    // Create a mock request to verify the token
    const mockRequest = new Request("https://placeholder.com", {
      headers: { "x-whop-user-token": effectiveUserToken },
    });
  
    tokenPayload = await verifyUserToken(mockRequest);
  } else {
    // Dev bypass: skip verification
    tokenPayload = { devBypass: true };
  }

  if (!tokenPayload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center p-8 max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Invalid Token
          </h1>
          <p className="text-zinc-400">
            Your session has expired. Please refresh the page.
          </p>
        </div>
      </div>
    );
  }

  // Check if user has admin access to this company
  const isAdmin = devBypass
  ? true
  : await isUserAdminOfCompany(tokenPayload.userId, companyId);


  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center p-8 max-w-md">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Admin Access Required
          </h1>
          <p className="text-zinc-400">
            You need admin, owner, or manager permissions to access this dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AE</span>
              </div>
              <h1 className="text-lg font-semibold text-white">
                Access Enforcer
              </h1>
            </div>
            <div className="text-sm text-zinc-500">
              Company: <span className="text-zinc-300 font-mono">{companyId}</span>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
