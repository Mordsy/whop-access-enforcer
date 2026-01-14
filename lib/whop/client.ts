import { Whop } from '@whop/sdk';

/**
 * Whop SDK client for API operations
 * 
 * Requires:
 * - WHOP_API_KEY: Your app's API key from the Whop developer dashboard
 * - WHOP_APP_ID: Your app's ID (required for verifying user tokens)
 * - WHOP_WEBHOOK_SECRET: Your app's webhook secret (required for webhook signature verification)
 */

const apiKey = process.env.WHOP_API_KEY;
const appId = process.env.WHOP_APP_ID;
const webhookSecret = process.env.WHOP_WEBHOOK_SECRET;

if (!apiKey) {
  throw new Error('Missing WHOP_API_KEY environment variable');
}

if (!appId) {
  throw new Error('Missing WHOP_APP_ID environment variable');
}

if (!webhookSecret) {
  throw new Error('Missing WHOP_WEBHOOK_SECRET environment variable');
}

/**
 * Whop SDK client instance
 * Use this for all Whop API operations
 */
export const whop = new Whop({
  apiKey,
  appID: appId,
  webhookKey: btoa(webhookSecret),
});

/**
 * Verify a user token from the x-whop-user-token header
 * Returns the user ID if valid, null if invalid
 */
export async function verifyUserToken(
  request: Request
): Promise<{ userId: string; appId: string } | null> {
  try {
    const result = await whop.verifyUserToken(request, { dontThrow: true });
    return result;
  } catch {
    return null;
  }
}

/**
 * Check if a user has admin access to a company
 * Returns true if user is owner, admin, or manager
 */
export async function isUserAdminOfCompany(
  userId: string,
  companyId: string
): Promise<boolean> {
  try {
    const authorizedUsers = await whop.authorizedUsers.list({
      company_id: companyId,
      user_id: userId,
      first: 1,
    });

    // If we get any result, user is authorized
    // Check if their role grants admin-level access
    for await (const user of authorizedUsers) {
      const adminRoles = ['owner', 'admin', 'manager'];
      if (adminRoles.includes(user.role)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
}
