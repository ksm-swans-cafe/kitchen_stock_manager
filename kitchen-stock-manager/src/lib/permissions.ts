// รายการ Permissions ทั้งหมดในระบบ
// รูปแบบ: action:resource
export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: "view:dashboard",
  
  // Orders
  VIEW_ORDERS: "view:orders",
  CREATE_ORDER: "create:orders",
  EDIT_ORDER: "edit:orders",
  DELETE_ORDER: "delete:orders",
  
  // Menu
  VIEW_MENU: "view:menu",
  CREATE_MENU: "create:menu",
  EDIT_MENU: "edit:menu",
  DELETE_MENU: "delete:menu",
  
  // Ingredients / Stock
  VIEW_INGREDIENTS: "view:ingredients",
  CREATE_INGREDIENTS: "create:ingredients",
  EDIT_INGREDIENTS: "edit:ingredients",
  DELETE_INGREDIENTS: "delete:ingredients",
  MANAGE_STOCK: "manage:stock",
  
  // Finance
  VIEW_FINANCE: "view:finance",
  
  // Summary / Reports
  VIEW_SUMMARY: "view:summary",
  
  // Image Settings
  VIEW_IMAGES: "view:images",
  EDIT_IMAGES: "edit:images",
  DELETE_IMAGES: "delete:images",
  
  // User Management
  VIEW_USERS: "view:users",
  CREATE_USERS: "create:users",
  EDIT_USERS: "edit:users",
  DELETE_USERS: "delete:users",
  
  // Role Management
  VIEW_ROLES: "view:roles",
  CREATE_ROLES: "create:roles",
  EDIT_ROLES: "edit:roles",
  DELETE_ROLES: "delete:roles",

  // Developer Only (admin ไม่เห็น)
  DEV_DEBUG: "dev:debug",
  DEV_LOGS: "dev:logs",
  DEV_DATABASE: "dev:database",
  DEV_IMAGES: "dev:images",
  DEV_ROLES: "dev:roles",
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// กลุ่ม Permissions สำหรับแสดงใน UI
export const PERMISSION_GROUPS = [
  {
    name: "แดชบอร์ด",
    resource: "dashboard",
    permissions: [
      { key: PERMISSIONS.VIEW_DASHBOARD, label: "ดูแดชบอร์ด", action: "view" },
    ],
  },
  {
    name: "ออเดอร์",
    resource: "orders",
    permissions: [
      { key: PERMISSIONS.VIEW_ORDERS, label: "ดูออเดอร์", action: "view" },
      { key: PERMISSIONS.CREATE_ORDER, label: "สร้างออเดอร์", action: "create" },
      { key: PERMISSIONS.EDIT_ORDER, label: "แก้ไขออเดอร์", action: "edit" },
      { key: PERMISSIONS.DELETE_ORDER, label: "ลบออเดอร์", action: "delete" },
    ],
  },
  {
    name: "เมนูอาหาร",
    resource: "menu",
    permissions: [
      { key: PERMISSIONS.VIEW_MENU, label: "ดูเมนู", action: "view" },
      { key: PERMISSIONS.CREATE_MENU, label: "สร้างเมนู", action: "create" },
      { key: PERMISSIONS.EDIT_MENU, label: "แก้ไขเมนู", action: "edit" },
      { key: PERMISSIONS.DELETE_MENU, label: "ลบเมนู", action: "delete" },
    ],
  },
  {
    name: "วัตถุดิบ / สต็อก",
    resource: "ingredients",
    permissions: [
      { key: PERMISSIONS.VIEW_INGREDIENTS, label: "ดูวัตถุดิบ", action: "view" },
      { key: PERMISSIONS.CREATE_INGREDIENTS, label: "เพิ่มวัตถุดิบ", action: "create" },
      { key: PERMISSIONS.EDIT_INGREDIENTS, label: "แก้ไขวัตถุดิบ", action: "edit" },
      { key: PERMISSIONS.DELETE_INGREDIENTS, label: "ลบวัตถุดิบ", action: "delete" },
      { key: PERMISSIONS.MANAGE_STOCK, label: "จัดการสต็อก", action: "manage" },
    ],
  },
  {
    name: "การเงิน",
    resource: "finance",
    permissions: [
      { key: PERMISSIONS.VIEW_FINANCE, label: "ดูข้อมูลการเงิน", action: "view" },
    ],
  },
  {
    name: "รายงาน",
    resource: "summary",
    permissions: [
      { key: PERMISSIONS.VIEW_SUMMARY, label: "ดูรายงานสรุป", action: "view" },
    ],
  },
  {
    name: "รูปภาพ",
    resource: "images",
    permissions: [
      { key: PERMISSIONS.VIEW_IMAGES, label: "ดูรูปภาพ", action: "view" },
      { key: PERMISSIONS.EDIT_IMAGES, label: "แก้ไขรูปภาพ", action: "edit" },
      { key: PERMISSIONS.DELETE_IMAGES, label: "ลบรูปภาพ", action: "delete" },
    ],
  },
  {
    name: "ผู้ใช้งาน",
    resource: "users",
    permissions: [
      { key: PERMISSIONS.VIEW_USERS, label: "ดูรายชื่อผู้ใช้", action: "view" },
      { key: PERMISSIONS.CREATE_USERS, label: "สร้างผู้ใช้", action: "create" },
      { key: PERMISSIONS.EDIT_USERS, label: "แก้ไขผู้ใช้", action: "edit" },
      { key: PERMISSIONS.DELETE_USERS, label: "ลบผู้ใช้", action: "delete" },
    ],
  },
  {
    name: "Role",
    resource: "roles",
    permissions: [
      { key: PERMISSIONS.VIEW_ROLES, label: "ดู Role", action: "view" },
      { key: PERMISSIONS.CREATE_ROLES, label: "สร้าง Role", action: "create" },
      { key: PERMISSIONS.EDIT_ROLES, label: "แก้ไข Role", action: "edit" },
      { key: PERMISSIONS.DELETE_ROLES, label: "ลบ Role", action: "delete" },
    ],
  },
  {
    name: "Developer (เฉพาะ Developer เท่านั้น)",
    resource: "dev",
    developerOnly: true,
    permissions: [
      { key: PERMISSIONS.DEV_DEBUG, label: "Debug Mode", action: "dev" },
      { key: PERMISSIONS.DEV_LOGS, label: "ดู Logs", action: "dev" },
      { key: PERMISSIONS.DEV_DATABASE, label: "จัดการ Database", action: "dev" },
    ],
  },
];

// Developer permissions ที่ admin ไม่เห็น
export const DEVELOPER_ONLY_PERMISSIONS = [
  PERMISSIONS.DEV_DEBUG,
  PERMISSIONS.DEV_LOGS,
  PERMISSIONS.DEV_DATABASE,
  PERMISSIONS.DEV_IMAGES,
  PERMISSIONS.DEV_ROLES,
];

// Default permissions สำหรับแต่ละ role
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  // admin ได้ทุกสิทธิ์ ยกเว้น developer permissions
  admin: Object.values(PERMISSIONS).filter(p => !DEVELOPER_ONLY_PERMISSIONS.includes(p as any)),
  // developer ได้ทุกสิทธิ์รวม developer permissions
  developer: Object.values(PERMISSIONS),
  employee: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.CREATE_ORDER,
    PERMISSIONS.EDIT_ORDER,
    PERMISSIONS.VIEW_MENU,
    PERMISSIONS.VIEW_INGREDIENTS,
    PERMISSIONS.VIEW_SUMMARY,
  ],
  customer: [
    PERMISSIONS.VIEW_MENU,
  ],
};

// Helper function to check permission
export const hasPermission = (userPermissions: string[], permission: string): boolean => {
  return userPermissions.includes(permission);
};

// Helper function to check if user has any of the permissions
export const hasAnyPermission = (userPermissions: string[], permissions: string[]): boolean => {
  return permissions.some(p => userPermissions.includes(p));
};

// Helper function to get all permissions for a resource
export const getResourcePermissions = (resource: string): string[] => {
  const group = PERMISSION_GROUPS.find(g => g.resource === resource);
  return group ? group.permissions.map(p => p.key) : [];
};
