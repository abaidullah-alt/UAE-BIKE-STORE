import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PERMISSIONS, ROLE_PERMISSION_PRESETS } from "../src/lib/security/permissions";

// Prisma 7 requires a driver adapter at runtime — same as src/lib/db/prisma.ts
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // --- Permissions ---
  const permissionRecords = new Map<string, string>(); // key -> id
  for (const key of Object.values(PERMISSIONS)) {
    const permission = await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key, label: key.replace(".", " · ") },
    });
    permissionRecords.set(key, permission.id);
  }

  // --- Roles + their permission presets (Super Admin gets everything) ---
  for (const [roleName, permissionKeys] of Object.entries(ROLE_PERMISSION_PRESETS)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, description: `${roleName} role` },
    });

    for (const key of permissionKeys) {
      const permissionId = permissionRecords.get(key);
      if (!permissionId) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId } },
        update: {},
        create: { roleId: role.id, permissionId },
      });
    }
  }

  const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { name: "Super Admin" } });

  const adminPasswordHash = await bcrypt.hash("Admin1234", 12);
  await prisma.user.upsert({
    where: { email: "admin@cycleuae.com" },
    update: {},
    create: {
      email: "admin@cycleuae.com",
      fullName: "Store Admin",
      passwordHash: adminPasswordHash,
      status: "ACTIVE",
      roleId: superAdminRole.id,
    },
  });
  console.log("Seeded admin login: admin@cycleuae.com / Admin1234 (change this immediately in production)");

  // --- Categories ---
  const mountainBikes = await prisma.category.upsert({
    where: { slug: "mountain-bikes" },
    update: {},
    create: { name: "Mountain Bikes", slug: "mountain-bikes", sortOrder: 1 },
  });
  const roadBikes = await prisma.category.upsert({
    where: { slug: "road-bikes" },
    update: {},
    create: { name: "Road Bikes", slug: "road-bikes", sortOrder: 2 },
  });
  const eBikes = await prisma.category.upsert({
    where: { slug: "e-bikes" },
    update: {},
    create: { name: "E-Bikes", slug: "e-bikes", sortOrder: 3 },
  });
  const cityBikes = await prisma.category.upsert({
    where: { slug: "city-bikes" },
    update: {},
    create: { name: "City Bikes", slug: "city-bikes", sortOrder: 4 },
  });
  const kidsBikes = await prisma.category.upsert({
    where: { slug: "kids-bikes" },
    update: {},
    create: { name: "Kids Bikes", slug: "kids-bikes", sortOrder: 5 },
  });
  const accessories = await prisma.category.upsert({
    where: { slug: "accessories" },
    update: {},
    create: { name: "Accessories", slug: "accessories", sortOrder: 6 },
  });

  // --- Brands ---
  const trailforge = await prisma.brand.upsert({
    where: { slug: "trailforge" },
    update: {},
    create: { name: "TrailForge", slug: "trailforge" },
  });
  const velocura = await prisma.brand.upsert({
    where: { slug: "velocura" },
    update: {},
    create: { name: "Velocura", slug: "velocura" },
  });

  // --- Attributes ---
  const frameSize = await prisma.productAttribute.upsert({
    where: { key: "frame_size" },
    update: {},
    create: { key: "frame_size", label: "Frame Size", inputType: "TEXT" },
  });
  const wheelSize = await prisma.productAttribute.upsert({
    where: { key: "wheel_size" },
    update: {},
    create: { key: "wheel_size", label: "Wheel Size", inputType: "TEXT", unit: "in" },
  });
  const gearCount = await prisma.productAttribute.upsert({
    where: { key: "gear_count" },
    update: {},
    create: { key: "gear_count", label: "Gears", inputType: "NUMBER" },
  });
  const batteryCapacity = await prisma.productAttribute.upsert({
    where: { key: "battery_capacity" },
    update: {},
    create: { key: "battery_capacity", label: "Battery Capacity", inputType: "TEXT", unit: "Wh" },
  });
  const range = await prisma.productAttribute.upsert({
    where: { key: "range" },
    update: {},
    create: { key: "range", label: "Range", inputType: "TEXT", unit: "km" },
  });

  // --- Products ---
  const products = [
    {
      sku: "MTB-TF-001",
      slug: "trailforge-summit-pro",
      image: "https://images.unsplash.com/photo-1760462167813-25d35e87630f?fm=jpg&q=80&w=1600&auto=format&fit=crop",
      name: "TrailForge Summit Pro",
      brandId: trailforge.id,
      categoryId: mountainBikes.id,
      shortDescription: "Full-suspension mountain bike built for UAE desert trails.",
      description:
        "The Summit Pro is engineered for serious off-road riding — lightweight aluminum frame, responsive front suspension, and reliable disc brakes for control on loose terrain.",
      price: 2499,
      isFeatured: true,
      attrs: [
        { attr: frameSize, value: "M" },
        { attr: wheelSize, value: "29" },
        { attr: gearCount, value: "21" },
      ],
    },
    {
      sku: "ROAD-VC-001",
      slug: "velocura-road-elite",
      image: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?fm=jpg&q=80&w=1600&auto=format&fit=crop",
      name: "Velocura Road Elite",
      brandId: velocura.id,
      categoryId: roadBikes.id,
      shortDescription: "Lightweight carbon road bike for speed and long-distance rides.",
      description:
        "Built for riders who want to go fast and go far. Carbon frame, aero geometry, and a smooth drivetrain designed for UAE's long coastal and desert roads.",
      price: 3899,
      isFeatured: true,
      attrs: [
        { attr: frameSize, value: "56cm" },
        { attr: wheelSize, value: "700c" },
        { attr: gearCount, value: "22" },
      ],
    },
    {
      sku: "EBIKE-TF-001",
      slug: "trailforge-urbanvolt-x2",
      image: "https://images.unsplash.com/photo-1666359692855-676ac6c8df4c?fm=jpg&q=80&w=1600&auto=format&fit=crop",
      name: "TrailForge UrbanVolt X2",
      brandId: trailforge.id,
      categoryId: eBikes.id,
      shortDescription: "Electric commuter bike with a 60km range on a single charge.",
      description:
        "The UrbanVolt X2 makes daily commuting effortless with pedal-assist power, a comfortable upright riding position, and a battery built for UAE's heat.",
      price: 5299,
      isFeatured: true,
      attrs: [
        { attr: batteryCapacity, value: "500" },
        { attr: range, value: "60" },
        { attr: wheelSize, value: "27.5" },
      ],
    },
    {
      sku: "ACC-HEL-001",
      slug: "aero-pro-cycling-helmet",
      image: "https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?fm=jpg&q=80&w=1600&auto=format&fit=crop",
      name: "Aero Pro Cycling Helmet",
      brandId: velocura.id,
      categoryId: accessories.id,
      shortDescription: "Lightweight, ventilated helmet with adjustable fit.",
      description:
        "Certified for safety and designed for airflow in hot climates — an essential for every UAE rider.",
      price: 249,
      isFeatured: true,
      attrs: [],
    },
    {
      sku: "CITY-VC-001",
      slug: "velocura-city-cruiser",
      image: "https://images.unsplash.com/photo-1558170019-fafc41195d9f?fm=jpg&q=80&w=1600&auto=format&fit=crop",
      name: "Velocura City Cruiser",
      brandId: velocura.id,
      categoryId: cityBikes.id,
      shortDescription: "Comfortable upright city bike for everyday commuting.",
      description:
        "Built for smooth city rides — a relaxed upright riding position, a comfortable saddle, and a low step-through frame that makes hopping on and off effortless.",
      price: 1199,
      isFeatured: false,
      attrs: [
        { attr: wheelSize, value: "26" },
        { attr: gearCount, value: "7" },
      ],
    },
    {
      sku: "KIDS-TF-001",
      slug: "trailforge-junior-explorer",
      image: "https://images.unsplash.com/photo-1681567012634-85b6b73f091b?fm=jpg&q=80&w=1600&auto=format&fit=crop",
      name: "TrailForge Junior Explorer",
      brandId: trailforge.id,
      categoryId: kidsBikes.id,
      shortDescription: "A confidence-building first bike for young riders.",
      description:
        "Lightweight frame, easy-to-reach brakes, and training wheels included — designed to help kids build confidence and graduate to bigger bikes safely.",
      price: 549,
      isFeatured: false,
      attrs: [
        { attr: wheelSize, value: "16" },
      ],
    },
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        sku: p.sku,
        slug: p.slug,
        name: p.name,
        brandId: p.brandId,
        categoryId: p.categoryId,
        shortDescription: p.shortDescription,
        description: p.description,
        price: p.price,
        status: "PUBLISHED",
        isFeatured: p.isFeatured,
        seoTitle: p.name,
        seoDescription: p.shortDescription,
      },
    });

    const existingImage = await prisma.productImage.findFirst({ where: { productId: product.id } });
    if (!existingImage) {
      await prisma.productImage.create({
        data: { productId: product.id, url: p.image, altText: p.name, sortOrder: 0 },
      });
    }

    for (const a of p.attrs) {
      await prisma.productAttributeValue.upsert({
        where: { productId_attributeId: { productId: product.id, attributeId: a.attr.id } },
        update: { value: a.value },
        create: { productId: product.id, attributeId: a.attr.id, value: a.value },
      });
    }

    const variant = await prisma.productVariant.upsert({
      where: { sku: `${p.sku}-DEFAULT` },
      update: {},
      create: {
        productId: product.id,
        sku: `${p.sku}-DEFAULT`,
        optionLabel: "Standard",
        isDefault: true,
      },
    });

    await prisma.inventory.upsert({
      where: { variantId: variant.id },
      update: {},
      create: { variantId: variant.id, quantityOnHand: 25, lowStockThreshold: 5 },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
