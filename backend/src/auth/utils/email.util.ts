import * as dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);
const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns true if email format is valid, false otherwise
 */
export function isValidEmailFormat(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // RFC 5322 compliant email regex (simplified version)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Additional checks
  const trimmedEmail = email.trim();
  
  // Basic format check
  if (!emailRegex.test(trimmedEmail)) {
    return false;
  }

  // Check length constraints (most email services limit to 254 characters)
  if (trimmedEmail.length > 254) {
    return false;
  }

  // Check local part (before @) is not too long (max 64 characters)
  const localPart = trimmedEmail.split('@')[0];
  if (localPart.length > 64) {
    return false;
  }

  // Check domain part has at least one dot
  const domainPart = trimmedEmail.split('@')[1];
  if (!domainPart || !domainPart.includes('.')) {
    return false;
  }

  return true;
}

/**
 * Validates if email domain has valid MX or A records
 * This checks if the domain can actually receive emails
 * @param email - Email address to validate
 * @returns Promise<boolean> - true if domain is valid and can receive emails
 */
export async function isValidEmailDomain(email: string): Promise<boolean> {
  if (!isValidEmailFormat(email)) {
    return false;
  }

  try {
    const domain = email.split('@')[1].toLowerCase();
    
    // Check for common invalid domains
    const invalidDomains = ['test.com', 'example.com', 'invalid.com', 'fake.com'];
    if (invalidDomains.includes(domain)) {
      return false;
    }

    // Try to resolve MX records first (mail exchange records)
    try {
      const mxRecords = await resolveMx(domain);
      if (mxRecords && mxRecords.length > 0) {
        return true; // Domain has MX records, can receive email
      }
    } catch (mxError) {
      // No MX records found, try A records (some servers use A records instead)
      try {
        await Promise.race([
          resolve4(domain),
          resolve6(domain).catch(() => null), // IPv6 is optional
        ]);
        return true; // Domain resolves, might be able to receive email
      } catch (aError) {
        return false; // Domain doesn't resolve, invalid
      }
    }

    // If we got here but no MX records were found, domain is invalid
    return false;
  } catch (error) {
    // If DNS lookup fails, we'll allow it (might be temporary DNS issue)
    // But log it for debugging
    console.warn(`DNS validation failed for ${email}:`, error);
    return true; // Allow it to proceed, let SMTP handle the actual delivery
  }
}
