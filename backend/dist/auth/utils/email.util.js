"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEmailFormat = isValidEmailFormat;
exports.isValidEmailDomain = isValidEmailDomain;
const dns = __importStar(require("dns"));
const util_1 = require("util");
const resolveMx = (0, util_1.promisify)(dns.resolveMx);
const resolve4 = (0, util_1.promisify)(dns.resolve4);
const resolve6 = (0, util_1.promisify)(dns.resolve6);
function isValidEmailFormat(email) {
    if (!email || typeof email !== 'string') {
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim();
    if (!emailRegex.test(trimmedEmail)) {
        return false;
    }
    if (trimmedEmail.length > 254) {
        return false;
    }
    const localPart = trimmedEmail.split('@')[0];
    if (localPart.length > 64) {
        return false;
    }
    const domainPart = trimmedEmail.split('@')[1];
    if (!domainPart || !domainPart.includes('.')) {
        return false;
    }
    return true;
}
async function isValidEmailDomain(email) {
    if (!isValidEmailFormat(email)) {
        return false;
    }
    try {
        const domain = email.split('@')[1].toLowerCase();
        const invalidDomains = ['test.com', 'example.com', 'invalid.com', 'fake.com'];
        if (invalidDomains.includes(domain)) {
            return false;
        }
        try {
            const mxRecords = await resolveMx(domain);
            if (mxRecords && mxRecords.length > 0) {
                return true;
            }
        }
        catch (mxError) {
            try {
                await Promise.race([
                    resolve4(domain),
                    resolve6(domain).catch(() => null),
                ]);
                return true;
            }
            catch (aError) {
                return false;
            }
        }
        return false;
    }
    catch (error) {
        console.warn(`DNS validation failed for ${email}:`, error);
        return true;
    }
}
//# sourceMappingURL=email.util.js.map