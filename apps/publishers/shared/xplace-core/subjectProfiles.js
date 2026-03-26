import { asObject, readString } from "./runtime.js";

function slugToIdPrefix(workspaceName) {
  return (
    String(workspaceName || "xplace")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "xplace"
  );
}

export function createDemoPublisherSubjectProfiles({ workspaceName, displayPrefix = "Demo" }) {
  const idPrefix = slugToIdPrefix(workspaceName);
  return [
    {
      id: `${idPrefix}_demo_identity`,
      label: `${displayPrefix} Identity`,
      profile_family: "identity_basic",
      is_default: false,
      data: {
        profile_family: "identity_basic",
        name: `${displayPrefix} User`,
        email: "user@xplace-demo.test",
        phone: "+40 723 200 200",
      },
      source_meta: {
        publisher_workspace: workspaceName,
        derived_from: "sample_catalog",
      },
    },
    {
      id: `${idPrefix}_demo_business`,
      label: `${displayPrefix} Business`,
      profile_family: "billing_business",
      is_default: true,
      data: {
        profile_family: "billing_business",
        company_name: `${displayPrefix} SRL`,
        company_identification_number: "33441356",
        vat_code: "RO33441356",
        company_registration_number: "J40/9988/2021",
        address: "Bd. Unirii 12",
        city: "Bucuresti",
        country: "Romania",
        country_code: "RO",
        email: "billing@xplace-demo.test",
        phone: "+40 723 100 100",
        linked_profiles: [
          {
            target_profile_id: `${idPrefix}_demo_identity`,
            relation_type: "delegate",
            label: "Operations contact",
            is_primary: true,
          },
        ],
      },
      source_meta: {
        publisher_workspace: workspaceName,
        derived_from: "sample_catalog",
      },
    },
    {
      id: `${idPrefix}_demo_individual`,
      label: `${displayPrefix} Individual`,
      profile_family: "billing_individual",
      is_default: false,
      data: {
        profile_family: "billing_individual",
        name: `${displayPrefix} User`,
        address: "Bd. Unirii 12",
        city: "Bucuresti",
        country: "Romania",
        country_code: "RO",
        email: "user@xplace-demo.test",
        phone: "+40 723 200 200",
      },
      source_meta: {
        publisher_workspace: workspaceName,
        derived_from: "sample_catalog",
      },
    },
  ];
}

export function createPublisherSubjectProfilesEnvelopeBuilder({ workspaceName, profiles }) {
  const catalog = Array.isArray(profiles) ? profiles : [];
  return async function buildPublisherSubjectProfilesEnvelope(payload) {
    const guardContext = asObject(payload.guard_context || payload.guardContext);
    const subjectId = readString(payload.subjectId, payload.subject_id, guardContext.subjectId);
    const requestedFamily = readString(payload.profile_family, payload.profileFamily) || null;
    const toolName = readString(payload.tool_name, payload.toolName);
    const xappSlug = readString(payload.xapp_slug, payload.xappSlug);

    if (!subjectId) {
      return {
        ok: true,
        selected_profile_id: null,
        profiles: [],
        source: "publisher_subject_profile",
        metadata: {
          workspace: workspaceName,
          reason: "subject_id_missing",
          requested_family: requestedFamily,
        },
      };
    }

    const matchedProfiles = catalog
      .filter((candidate) => !requestedFamily || candidate.profile_family === requestedFamily)
      .slice(0, 2)
      .map((candidate) => ({
        ...candidate,
        source_meta: {
          ...candidate.source_meta,
          subject_id: subjectId,
          tool_name: toolName || null,
          xapp_slug: xappSlug || null,
        },
      }));

    return {
      ok: true,
      selected_profile_id: matchedProfiles[0]?.id || null,
      profiles: matchedProfiles,
      source: "publisher_subject_profile",
      metadata: {
        workspace: workspaceName,
        requested_family: requestedFamily,
        xapp_slug: xappSlug || null,
        tool_name: toolName || null,
        subject_id: subjectId,
        profile_count: matchedProfiles.length,
        default_catalog: true,
      },
    };
  };
}
