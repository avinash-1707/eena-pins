export const BRAND_APPLICATION_PREFIX = "brand_application::";

export type BrandApplicationPayload = {
  brandName: string;
  description: string | null;
  logoUrl: string | null;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  categories: string[];
};

type BrandRequestEnvelope = {
  adminNote: string | null;
  application: BrandApplicationPayload;
};

function cleanString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function sanitizeBrandApplicationPayload(
  application: unknown,
): BrandApplicationPayload | null {
  if (!application || typeof application !== "object") return null;
  const data = application as Record<string, unknown>;
  const brandName = cleanString(data.brandName);
  if (!brandName) return null;

  const categoriesInput = Array.isArray(data.categories) ? data.categories : [];
  const categories = categoriesInput
    .map((item) => cleanString(item))
    .filter((item): item is string => Boolean(item));

  return {
    brandName,
    description: cleanString(data.description),
    logoUrl: cleanString(data.logoUrl),
    contactName: cleanString(data.contactName),
    email: cleanString(data.email),
    phone: cleanString(data.phone),
    street: cleanString(data.street),
    city: cleanString(data.city),
    state: cleanString(data.state),
    zip: cleanString(data.zip),
    categories,
  };
}

export function encodeBrandRequestMessage(params: {
  adminNote?: string | null;
  application?: BrandApplicationPayload | null;
}): string | null {
  const adminNote = cleanString(params.adminNote);
  if (!params.application) {
    return adminNote;
  }

  const payload: BrandRequestEnvelope = {
    adminNote,
    application: params.application,
  };
  return `${BRAND_APPLICATION_PREFIX}${JSON.stringify(payload)}`;
}

export function decodeBrandRequestMessage(message: string | null): {
  plainMessage: string | null;
  adminNote: string | null;
  application: BrandApplicationPayload | null;
} {
  if (!message) {
    return { plainMessage: null, adminNote: null, application: null };
  }

  if (!message.startsWith(BRAND_APPLICATION_PREFIX)) {
    const plain = cleanString(message);
    return { plainMessage: plain, adminNote: plain, application: null };
  }

  const json = message.slice(BRAND_APPLICATION_PREFIX.length);
  try {
    const parsed = JSON.parse(json) as Partial<BrandRequestEnvelope>;
    const application = sanitizeBrandApplicationPayload(parsed.application);
    const adminNote = cleanString(parsed.adminNote);

    if (!application) {
      const plain = cleanString(message);
      return { plainMessage: plain, adminNote: plain, application: null };
    }

    return {
      plainMessage: adminNote,
      adminNote,
      application,
    };
  } catch {
    const plain = cleanString(message);
    return { plainMessage: plain, adminNote: plain, application: null };
  }
}
