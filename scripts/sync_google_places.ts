import { PrismaClient } from "@prisma/client";
import { fetchGooglePlaceData } from "../src/lib/google-places";

const prisma = new PrismaClient();

async function main() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.warn(
      "⚠️  GOOGLE_PLACES_API_KEY is not set in your environment.\n" +
      "Add GOOGLE_PLACES_API_KEY=... to .env or Vercel to run automated live Google Places rating syncing."
    );
    return;
  }

  console.log("=== SYNCING GOOGLE PLACE IDs & STAR RATINGS ===");

  const firms = await prisma.lawFirm.findMany({
    include: { city: true },
  });

  let updatedCount = 0;

  for (const firm of firms) {
    const match = await fetchGooglePlaceData({
      name: firm.name,
      address: firm.address,
      city: firm.city.name,
    });

    if (match) {
      await prisma.lawFirm.update({
        where: { id: firm.id },
        data: {
          googlePlaceId: match.placeId,
          googleRating: match.rating,
          googleReviewCount: match.reviewCount,
          googleReviewsSyncedAt: new Date(),
        },
      });
      updatedCount++;
      console.log(
        `[SYNCED] ${firm.name} (${firm.city.name}) => ${match.rating || "N/A"} ★ (${match.reviewCount || 0} reviews) | Place ID: ${match.placeId}`
      );
    } else {
      console.log(`[SKIP] No exact Place match for ${firm.name}`);
    }

    // Small rate-limit delay
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log(`\nSync Complete! Updated ${updatedCount} of ${firms.length} firms with live Google Place data.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
