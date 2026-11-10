import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    if (!query || query.length < 2) {
      return NextResponse.json({ query: "", firms: [], pros: [], total: 0 });
    }

    const cleanedQuery = query.toLowerCase();

    // Search law firms by firm name, partner name, email, partnerEmail, website, city, practice area
    const firms = await prisma.lawFirm.findMany({
      where: {
        OR: [
          { name: { contains: cleanedQuery, mode: "insensitive" } },
          { managingPartnerName: { contains: cleanedQuery, mode: "insensitive" } },
          { email: { contains: cleanedQuery, mode: "insensitive" } },
          { partnerEmail: { contains: cleanedQuery, mode: "insensitive" } },
          { websiteUrl: { contains: cleanedQuery, mode: "insensitive" } },
          { city: { name: { contains: cleanedQuery, mode: "insensitive" } } },
          {
            practiceAreas: {
              some: {
                practiceArea: {
                  name: { contains: cleanedQuery, mode: "insensitive" },
                },
              },
            },
          },
        ],
      },
      include: {
        city: true,
        county: true,
        practiceAreas: {
          include: {
            practiceArea: true,
          },
        },
      },
      take: 20,
      orderBy: [
        { tier: "desc" }, // FEATURED_SPONSOR first, then VERIFIED_BOUTIQUE, then FREE
        { name: "asc" },
      ],
    });

    // Also search associated pros by business name, email, city, category
    const pros = await prisma.associatedPro.findMany({
      where: {
        OR: [
          { businessName: { contains: cleanedQuery, mode: "insensitive" } },
          { email: { contains: cleanedQuery, mode: "insensitive" } },
          { city: { name: { contains: cleanedQuery, mode: "insensitive" } } },
          { category: { contains: cleanedQuery, mode: "insensitive" } },
        ],
      },
      include: {
        city: true,
        county: true,
      },
      take: 10,
    });

    const formattedFirms = firms.map((f) => ({
      id: f.id,
      name: f.name,
      slug: f.slug,
      managingPartnerName: f.managingPartnerName,
      email: f.partnerEmail || f.email,
      websiteUrl: f.websiteUrl,
      phone: f.phone,
      attorneyCount: f.attorneyCount,
      tier: f.tier,
      cityName: f.city.name,
      citySlug: f.city.slug,
      countySlug: f.county.slug,
      practiceAreas: f.practiceAreas.map((p) => ({
        name: p.practiceArea.name,
        slug: p.practiceArea.slug,
      })),
      profileUrl: `/firm/${f.slug}`,
      directoryUrl: `/${f.county.slug}/${f.city.slug}/${f.practiceAreas[0]?.practiceArea.slug || "family-law"}`,
    }));

    const formattedPros = pros.map((p) => ({
      id: p.id,
      businessName: p.businessName,
      slug: p.slug,
      category: p.category,
      email: p.email,
      phone: p.phone,
      websiteUrl: p.websiteUrl,
      cityName: p.city.name,
      linkedPracticeSlug: p.linkedPracticeSlug,
    }));

    return NextResponse.json({
      query,
      firms: formattedFirms,
      pros: formattedPros,
      total: formattedFirms.length + formattedPros.length,
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
