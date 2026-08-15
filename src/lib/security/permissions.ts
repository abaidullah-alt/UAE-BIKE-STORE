// Canonical list of permission keys. Each maps to a Permission row in the
// database (seeded below) and is assigned to roles via RolePermission.
export const PERMISSIONS = {
  PRODUCTS_VIEW: "products.view",
  PRODUCTS_EDIT: "products.edit",
  PRODUCTS_DELETE: "products.delete",
  ORDERS_VIEW: "orders.view",
  ORDERS_EDIT: "orders.edit",
  ORDERS_REFUND: "orders.refund",
  CUSTOMERS_VIEW: "customers.view",
  CUSTOMERS_EDIT: "customers.edit",
  INVENTORY_VIEW: "inventory.view",
  INVENTORY_EDIT: "inventory.edit",
  MARKETING_EDIT: "marketing.edit",
  REPORTS_VIEW: "reports.view",
  SETTINGS_EDIT: "settings.edit",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Default role → permission mapping used by the seed script.
export const ROLE_PERMISSION_PRESETS: Record<string, PermissionKey[]> = {
  "Super Admin": Object.values(PERMISSIONS),
  "Store Admin": Object.values(PERMISSIONS).filter((p) => p !== "settings.edit"),
  "Product Manager": [PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.PRODUCTS_EDIT, PERMISSIONS.PRODUCTS_DELETE, PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_EDIT],
  "Inventory Manager": [PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_EDIT, PERMISSIONS.PRODUCTS_VIEW],
  "Order Manager": [PERMISSIONS.ORDERS_VIEW, PERMISSIONS.ORDERS_EDIT, PERMISSIONS.ORDERS_REFUND, PERMISSIONS.CUSTOMERS_VIEW],
  "Customer Support": [PERMISSIONS.ORDERS_VIEW, PERMISSIONS.CUSTOMERS_VIEW, PERMISSIONS.CUSTOMERS_EDIT],
  "Content Manager": [PERMISSIONS.MARKETING_EDIT, PERMISSIONS.PRODUCTS_VIEW],
};
