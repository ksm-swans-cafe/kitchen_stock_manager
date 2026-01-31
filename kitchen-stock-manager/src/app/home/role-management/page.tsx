"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { toast } from "sonner";
import {
  Shield,
  Users,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  Search,
  UserCog,
  Settings,
} from "lucide-react";
import { PERMISSION_GROUPS, PERMISSIONS } from "@/lib/permissions";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { usePermission } from "@/lib/hooks/usePermission";

interface Role {
  id: string;
  role_name: string;
  role_display: string;
  role_color: string;
  permissions: string[];
  is_default: boolean;
}

interface Employee {
  id: string;
  employee_id: string;
  employee_username: string;
  employee_firstname: string;
  employee_lastname: string;
  employee_roles: string[];
  employee_pin?: string;
}

// Role priority for sorting and permission checks
const ROLE_PRIORITY: Record<string, number> = {
  customer: 1,
  employee: 2,
  admin: 3,
  developer: 4,
  dev: 4,
};

// Get highest role priority from roles array
const getHighestRolePriority = (roles: string[]): number => {
  if (!roles || roles.length === 0) return 0;
  return Math.max(...roles.map(r => ROLE_PRIORITY[r.toLowerCase()] || 0));
};

function RoleManagementContent() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, userRole, userRoles } = useAuth();
  const { hasPermission, canCreate, canEdit, canDelete, isDeveloper, isAdmin } = usePermission();

  // Current user's highest role priority
  const currentUserPriority = getHighestRolePriority(userRoles);

  const [activeTab, setActiveTab] = useState<"roles" | "users">("roles");
  const [roles, setRoles] = useState<Role[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "newest" | "role">("name");

  // Role Modal States
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({
    role_name: "",
    role_display: "",
    role_color: "#6B7280",
    permissions: [] as string[],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // User Role Modal States
  const [showUserRoleModal, setShowUserRoleModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // Create Employee Modal States
  const [showCreateEmployeeModal, setShowCreateEmployeeModal] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    employee_username: "",
    employee_firstname: "",
    employee_lastname: "",
    employee_pin: "",
    employee_roles: [] as string[],
  });

  // Delete Employee Modal
  const [showDeleteEmployeeModal, setShowDeleteEmployeeModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  // Edit Employee Modal
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editEmployeeForm, setEditEmployeeForm] = useState({
    employee_username: "",
    employee_firstname: "",
    employee_lastname: "",
    employee_pin: "",
    employee_roles: [] as string[],
  });

  // Delete Confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await fetch("/api/get/roles");
      const data = await response.json();
      if (data.success) {
        setRoles(data.data);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("ไม่สามารถโหลดข้อมูล Role ได้");
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await fetch("/api/get/employees");
      const data = await response.json();
      if (data.success) {
        setEmployees(data.data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("ไม่สามารถโหลดข้อมูลพนักงานได้");
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchRoles(), fetchEmployees()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchRoles, fetchEmployees]);

  const handleOpenRoleModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setRoleForm({
        role_name: role.role_name,
        role_display: role.role_display,
        role_color: role.role_color || "#6B7280",
        permissions: role.permissions || [],
      });
    } else {
      setEditingRole(null);
      setRoleForm({
        role_name: "",
        role_display: "",
        role_color: "#6B7280",
        permissions: [],
      });
    }
    setExpandedGroups([]);
    setShowRoleModal(true);
  };

  const handleCloseRoleModal = () => {
    setShowRoleModal(false);
    setEditingRole(null);
    setRoleForm({
      role_name: "",
      role_display: "",
      role_color: "#6B7280",
      permissions: [],
    });
  };

  const handleSaveRole = async () => {
    if (!roleForm.role_display.trim()) {
      toast.error("กรุณาระบุชื่อ Role");
      return;
    }

    setIsSaving(true);
    try {
      if (editingRole) {
        // Update existing role
        const response = await fetch(`/api/edit/role/${editingRole.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role_display: roleForm.role_display,
            role_color: roleForm.role_color,
            permissions: roleForm.permissions,
          }),
        });

        const data = await response.json();
        if (data.success) {
          toast.success("อัปเดต Role สำเร็จ");
          await fetchRoles();
          handleCloseRoleModal();
        } else {
          toast.error(data.error || "เกิดข้อผิดพลาด");
        }
      } else {
        // Create new role
        if (!roleForm.role_name.trim()) {
          toast.error("กรุณาระบุ Role Name");
          setIsSaving(false);
          return;
        }

        const response = await fetch("/api/post/role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(roleForm),
        });

        const data = await response.json();
        if (data.success) {
          toast.success("สร้าง Role สำเร็จ");
          await fetchRoles();
          handleCloseRoleModal();
        } else {
          toast.error(data.error || "เกิดข้อผิดพลาด");
        }
      }
    } catch (error) {
      console.error("Error saving role:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/edit/role/${roleToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        toast.success("ลบ Role สำเร็จ");
        await fetchRoles();
        setShowDeleteModal(false);
        setRoleToDelete(null);
      } else {
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error("เกิดข้อผิดพลาดในการลบ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenUserRoleModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSelectedRoles(employee.employee_roles || []);
    setShowUserRoleModal(true);
  };

  const handleSaveUserRole = async () => {
    if (!selectedEmployee) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/edit/employee/${selectedEmployee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_roles: selectedRoles }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("อัปเดต Role พนักงานสำเร็จ");
        await fetchEmployees();
        setShowUserRoleModal(false);
        setSelectedEmployee(null);
      } else {
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error updating employee role:", error);
      toast.error("เกิดข้อผิดพลาดในการอัปเดต");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSelectedRole = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName]
    );
  };

  // Create Employee handlers
  const handleOpenCreateEmployeeModal = () => {
    setEmployeeForm({
      employee_username: "",
      employee_firstname: "",
      employee_lastname: "",
      employee_pin: "",
      employee_roles: [],
    });
    setShowCreateEmployeeModal(true);
  };

  const handleCreateEmployee = async () => {
    if (!employeeForm.employee_username || !employeeForm.employee_firstname) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน (Username และ ชื่อ)");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/post/employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeForm),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("สร้างพนักงานสำเร็จ");
        await fetchEmployees();
        setShowCreateEmployeeModal(false);
      } else {
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error creating employee:", error);
      toast.error("เกิดข้อผิดพลาดในการสร้างพนักงาน");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Employee handlers
  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/edit/employee/${employeeToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        toast.success("ลบพนักงานสำเร็จ");
        await fetchEmployees();
        setShowDeleteEmployeeModal(false);
        setEmployeeToDelete(null);
      } else {
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("เกิดข้อผิดพลาดในการลบพนักงาน");
    } finally {
      setIsSaving(false);
    }
  };

  // Edit Employee handlers
  const handleOpenEditEmployeeModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setEditEmployeeForm({
      employee_username: employee.employee_username,
      employee_firstname: employee.employee_firstname,
      employee_lastname: employee.employee_lastname,
      employee_pin: employee.employee_pin || "",
      employee_roles: employee.employee_roles || [],
    });
    setShowEditEmployeeModal(true);
  };

  // Check if current user can edit this employee (based on role priority)
  const canEditEmployee = (employee: Employee): boolean => {
    const employeePriority = getHighestRolePriority(employee.employee_roles || []);
    // Can edit if current user has higher or equal priority (developer can edit all)
    return isDeveloper || currentUserPriority > employeePriority;
  };

  // Check if current user can see/edit PIN of this employee
  const canEditPin = (employee: Employee): boolean => {
    const employeePriority = getHighestRolePriority(employee.employee_roles || []);
    // Can see/edit PIN only if current user has higher priority
    return isDeveloper || currentUserPriority > employeePriority;
  };

  const handleEditEmployee = async () => {
    if (!editingEmployee || !editEmployeeForm.employee_username || !editEmployeeForm.employee_firstname) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน (Username และ ชื่อ)");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/edit/employee/${editingEmployee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editEmployeeForm),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("แก้ไขข้อมูลพนักงานสำเร็จ");
        await fetchEmployees();
        setShowEditEmployeeModal(false);
        setEditingEmployee(null);
      } else {
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error editing employee:", error);
      toast.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
    } finally {
      setIsSaving(false);
    }
  };

  const togglePermission = (permission: string) => {
    setRoleForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupName)
        ? prev.filter((g) => g !== groupName)
        : [...prev, groupName]
    );
  };

  const toggleAllPermissionsInGroup = (groupPermissions: { key: string; label: string }[]) => {
    const groupKeys = groupPermissions.map((p) => p.key);
    const allSelected = groupKeys.every((key) => roleForm.permissions.includes(key));

    setRoleForm((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((p) => !groupKeys.includes(p))
        : [...new Set([...prev.permissions, ...groupKeys])],
    }));
  };

  const filteredEmployees = employees
    .filter((emp) => {
      const query = searchQuery.toLowerCase();
      return (
        emp.employee_username.toLowerCase().includes(query) ||
        emp.employee_firstname.toLowerCase().includes(query) ||
        emp.employee_lastname.toLowerCase().includes(query) ||
        emp.employee_roles.some((r) => r.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          // A-Z by firstname
          return a.employee_firstname.localeCompare(b.employee_firstname, "th");
        case "newest":
          // Newest first (by employee_id descending)
          return b.employee_id.localeCompare(a.employee_id);
        case "role":
          // Sort by highest role priority (highest first)
          const aPriority = getHighestRolePriority(a.employee_roles || []);
          const bPriority = getHighestRolePriority(b.employee_roles || []);
          return bPriority - aPriority;
        default:
          return 0;
      }
    });

  const getRoleColor = (roleName: string) => {
    const role = roles.find((r) => r.role_name === roleName);
    return role?.role_color || "#6B7280";
  };

  const getRoleDisplay = (roleName: string) => {
    const role = roles.find((r) => r.role_name === roleName);
    return role?.role_display || roleName;
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">จัดการ Role & สิทธิ์</h1>
              <p className="text-purple-200 text-sm">กำหนดสิทธิ์การเข้าถึงของผู้ใช้งาน</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("roles")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "roles"
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Settings className="w-4 h-4" />
            จัดการ Role
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "users"
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Users className="w-4 h-4" />
            กำหนด Role ผู้ใช้
          </button>
        </div>

        {/* Roles Tab */}
        {activeTab === "roles" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">รายการ Role</h2>
              <button
                onClick={() => handleOpenRoleModal()}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                สร้าง Role ใหม่
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {roles.length === 0 ? (
                <div className="p-12 text-center">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">ยังไม่มี Role</p>
                  <button
                    onClick={() => handleOpenRoleModal()}
                    className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                  >
                    สร้าง Role แรก
                  </button>
                </div>
              ) : (
                roles.map((role) => (
                  <div
                    key={role.id}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: role.role_color || "#6B7280" }}
                      >
                        {role.role_display.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{role.role_display}</div>
                        <div className="text-sm text-gray-500">
                          {role.role_name} • {role.permissions?.length || 0} สิทธิ์
                          {role.is_default && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenRoleModal(role)}
                        className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {!role.is_default && (
                        <button
                          onClick={() => {
                            setRoleToDelete(role);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">รายชื่อผู้ใช้งาน</h2>
                <button
                  onClick={handleOpenCreateEmployeeModal}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่มพนักงาน
                </button>
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหาผู้ใช้..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "name" | "newest" | "role")}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white text-sm"
                >
                  <option value="name">เรียงตาม: ชื่อ A-Z</option>
                  <option value="newest">เรียงตาม: ใหม่ไปเก่า</option>
                  <option value="role">เรียงตาม: ลำดับ Role</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredEmployees.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">ไม่พบผู้ใช้งาน</p>
                </div>
              ) : (
                filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                        {employee.employee_firstname.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">
                          {employee.employee_firstname} {employee.employee_lastname}
                        </div>
                        <div className="text-sm text-gray-500">@{employee.employee_username}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Show PIN if user has permission */}
                      {canEditPin(employee) && employee.employee_pin && (
                        <div className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-600">
                          PIN: {employee.employee_pin}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {employee.employee_roles.length > 0 ? (
                          employee.employee_roles.map((roleName) => (
                            <span
                              key={roleName}
                              className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: getRoleColor(roleName) }}
                            >
                              {getRoleDisplay(roleName)}
                            </span>
                          ))
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-300 text-gray-700">
                            ไม่มี Role
                          </span>
                        )}
                      </div>
                      {canEditEmployee(employee) && (
                        <button
                          onClick={() => handleOpenEditEmployeeModal(employee)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="แก้ไขข้อมูล"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {canEditEmployee(employee) && (
                        <button
                          onClick={() => handleOpenUserRoleModal(employee)}
                          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="แก้ไข Role"
                        >
                          <UserCog className="w-4 h-4" />
                        </button>
                      )}
                      {canEditEmployee(employee) && (
                        <button
                          onClick={() => {
                            setEmployeeToDelete(employee);
                            setShowDeleteEmployeeModal(true);
                          }}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="ลบพนักงาน"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  {editingRole ? "แก้ไข Role" : "สร้าง Role ใหม่"}
                </h3>
                <button
                  onClick={handleCloseRoleModal}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Role Name */}
              {!editingRole && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name (ภาษาอังกฤษ)
                  </label>
                  <input
                    type="text"
                    value={roleForm.role_name}
                    onChange={(e) =>
                      setRoleForm((prev) => ({
                        ...prev,
                        role_name: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                      }))
                    }
                    placeholder="เช่น manager, supervisor"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              )}

              {/* Role Display */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อที่แสดง
                </label>
                <input
                  type="text"
                  value={roleForm.role_display}
                  onChange={(e) =>
                    setRoleForm((prev) => ({ ...prev, role_display: e.target.value }))
                  }
                  placeholder="เช่น ผู้จัดการ, หัวหน้างาน"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              {/* Role Color */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สี
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={roleForm.role_color}
                    onChange={(e) =>
                      setRoleForm((prev) => ({ ...prev, role_color: e.target.value }))
                    }
                    className="w-12 h-12 rounded-lg cursor-pointer border-0"
                  />
                  <div
                    className="px-4 py-2 rounded-full text-white text-sm font-medium"
                    style={{ backgroundColor: roleForm.role_color }}
                  >
                    {roleForm.role_display || "ตัวอย่าง"}
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  สิทธิ์การเข้าถึง
                </label>
                <div className="space-y-2">
                  {PERMISSION_GROUPS.map((group) => (
                    <div
                      key={group.name}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.name)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={group.permissions.every((p) =>
                              roleForm.permissions.includes(p.key)
                            )}
                            onChange={() => toggleAllPermissionsInGroup(group.permissions)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <span className="font-medium text-gray-700">{group.name}</span>
                          <span className="text-xs text-gray-500">
                            ({group.permissions.filter((p) => roleForm.permissions.includes(p.key)).length}/{group.permissions.length})
                          </span>
                        </div>
                        {expandedGroups.includes(group.name) ? (
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                      {expandedGroups.includes(group.name) && (
                        <div className="p-4 space-y-2 bg-white">
                          {group.permissions.map((permission) => (
                            <label
                              key={permission.key}
                              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={roleForm.permissions.includes(permission.key)}
                                onChange={() => togglePermission(permission.key)}
                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                              />
                              <span className="text-gray-700">{permission.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-gray-100 flex gap-3 flex-shrink-0">
              <button
                onClick={handleSaveRole}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
                <span>บันทึก</span>
              </button>
              <button
                onClick={handleCloseRoleModal}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5" />
                <span>ยกเลิก</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Role Modal */}
      {showUserRoleModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">กำหนด Role</h3>
                <button
                  onClick={() => setShowUserRoleModal(false)}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg">
                  {selectedEmployee.employee_firstname.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-gray-800">
                    {selectedEmployee.employee_firstname} {selectedEmployee.employee_lastname}
                  </div>
                  <div className="text-sm text-gray-500">@{selectedEmployee.employee_username}</div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เลือก Role (สามารถเลือกได้หลาย Role)
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {roles.length > 0 ? (
                    roles.map((role) => (
                      <label
                        key={role.id}
                        className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                          selectedRoles.includes(role.role_name)
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role.role_name)}
                          onChange={() => toggleSelectedRole(role.role_name)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: role.role_color }}
                        >
                          {role.role_display.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{role.role_display}</div>
                          <div className="text-xs text-gray-500">{role.permissions?.length || 0} สิทธิ์</div>
                        </div>
                      </label>
                    ))
                  ) : (
                    <>
                      {["admin", "employee", "customer"].map((roleName) => (
                        <label
                          key={roleName}
                          className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                            selectedRoles.includes(roleName)
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 hover:border-purple-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedRoles.includes(roleName)}
                            onChange={() => toggleSelectedRole(roleName)}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <span className="font-medium text-gray-800 capitalize">{roleName}</span>
                        </label>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveUserRole}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  <span>บันทึก</span>
                </button>
                <button
                  onClick={() => setShowUserRoleModal(false)}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                  <span>ยกเลิก</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && roleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">ยืนยันการลบ Role</h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-gray-700">
                  คุณต้องการลบ Role <strong>{roleToDelete.role_display}</strong>?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  การดำเนินการนี้ไม่สามารถย้อนกลับได้
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteRole}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                  <span>ลบ</span>
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                  <span>ยกเลิก</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Employee Modal */}
      {showCreateEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">เพิ่มพนักงานใหม่</h3>
                <button
                  onClick={() => setShowCreateEmployeeModal(false)}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={employeeForm.employee_username}
                    onChange={(e) => setEmployeeForm((prev) => ({ ...prev, employee_username: e.target.value }))}
                    placeholder="username"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
                    <input
                      type="text"
                      value={employeeForm.employee_firstname}
                      onChange={(e) => setEmployeeForm((prev) => ({ ...prev, employee_firstname: e.target.value }))}
                      placeholder="ชื่อ"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
                    <input
                      type="text"
                      value={employeeForm.employee_lastname}
                      onChange={(e) => setEmployeeForm((prev) => ({ ...prev, employee_lastname: e.target.value }))}
                      placeholder="นามสกุล"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PIN (4 หลัก)</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={employeeForm.employee_pin}
                    onChange={(e) => setEmployeeForm((prev) => ({ ...prev, employee_pin: e.target.value.replace(/\D/g, "") }))}
                    placeholder="0000"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {roles.length > 0 ? (
                      roles.map((role) => (
                        <label
                          key={role.id}
                          className={`flex items-center gap-3 p-2 border rounded-lg cursor-pointer transition-colors ${
                            employeeForm.employee_roles.includes(role.role_name)
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 hover:border-green-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={employeeForm.employee_roles.includes(role.role_name)}
                            onChange={() => {
                              setEmployeeForm((prev) => ({
                                ...prev,
                                employee_roles: prev.employee_roles.includes(role.role_name)
                                  ? prev.employee_roles.filter((r) => r !== role.role_name)
                                  : [...prev.employee_roles, role.role_name],
                              }));
                            }}
                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                          />
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: role.role_color }}
                          >
                            {role.role_display}
                          </span>
                        </label>
                      ))
                    ) : (
                      ["admin", "employee", "customer"].map((roleName) => (
                        <label
                          key={roleName}
                          className={`flex items-center gap-3 p-2 border rounded-lg cursor-pointer transition-colors ${
                            employeeForm.employee_roles.includes(roleName)
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 hover:border-green-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={employeeForm.employee_roles.includes(roleName)}
                            onChange={() => {
                              setEmployeeForm((prev) => ({
                                ...prev,
                                employee_roles: prev.employee_roles.includes(roleName)
                                  ? prev.employee_roles.filter((r) => r !== roleName)
                                  : [...prev.employee_roles, roleName],
                              }));
                            }}
                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                          />
                          <span className="font-medium text-gray-800 capitalize">{roleName}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateEmployee}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  <span>สร้าง</span>
                </button>
                <button
                  onClick={() => setShowCreateEmployeeModal(false)}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                  <span>ยกเลิก</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditEmployeeModal && editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">แก้ไขข้อมูลพนักงาน</h3>
                <button
                  onClick={() => setShowEditEmployeeModal(false)}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={editEmployeeForm.employee_username}
                    onChange={(e) => setEditEmployeeForm((prev) => ({ ...prev, employee_username: e.target.value }))}
                    placeholder="username"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่อ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editEmployeeForm.employee_firstname}
                      onChange={(e) => setEditEmployeeForm((prev) => ({ ...prev, employee_firstname: e.target.value }))}
                      placeholder="ชื่อ"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
                    <input
                      type="text"
                      value={editEmployeeForm.employee_lastname}
                      onChange={(e) => setEditEmployeeForm((prev) => ({ ...prev, employee_lastname: e.target.value }))}
                      placeholder="นามสกุล (ไม่บังคับ)"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
                {/* PIN field - only show if user can edit PIN */}
                {editingEmployee && canEditPin(editingEmployee) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">รหัส PIN (4 หลัก)</label>
                    <input
                      type="text"
                      value={editEmployeeForm.employee_pin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                        setEditEmployeeForm((prev) => ({ ...prev, employee_pin: value }));
                      }}
                      placeholder="รหัส PIN 4 หลัก"
                      maxLength={4}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {roles.length > 0 ? (
                      roles.map((role) => (
                        <label
                          key={role.id}
                          className={`flex items-center gap-3 p-2 border rounded-lg cursor-pointer transition-colors ${
                            editEmployeeForm.employee_roles.includes(role.role_name)
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={editEmployeeForm.employee_roles.includes(role.role_name)}
                            onChange={() => {
                              setEditEmployeeForm((prev) => ({
                                ...prev,
                                employee_roles: prev.employee_roles.includes(role.role_name)
                                  ? prev.employee_roles.filter((r) => r !== role.role_name)
                                  : [...prev.employee_roles, role.role_name],
                              }));
                            }}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: role.role_color }}
                          >
                            {role.role_display}
                          </span>
                        </label>
                      ))
                    ) : (
                      ["admin", "employee", "customer"].map((roleName) => (
                        <label
                          key={roleName}
                          className={`flex items-center gap-3 p-2 border rounded-lg cursor-pointer transition-colors ${
                            editEmployeeForm.employee_roles.includes(roleName)
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={editEmployeeForm.employee_roles.includes(roleName)}
                            onChange={() => {
                              setEditEmployeeForm((prev) => ({
                                ...prev,
                                employee_roles: prev.employee_roles.includes(roleName)
                                  ? prev.employee_roles.filter((r) => r !== roleName)
                                  : [...prev.employee_roles, roleName],
                              }));
                            }}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="font-medium text-gray-800 capitalize">{roleName}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleEditEmployee}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  <span>บันทึก</span>
                </button>
                <button
                  onClick={() => setShowEditEmployeeModal(false)}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                  <span>ยกเลิก</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Employee Modal */}
      {showDeleteEmployeeModal && employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">ยืนยันการลบพนักงาน</h3>
                <button
                  onClick={() => setShowDeleteEmployeeModal(false)}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-gray-700">
                  คุณต้องการลบพนักงาน <strong>{employeeToDelete.employee_firstname} {employeeToDelete.employee_lastname}</strong>?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  การดำเนินการนี้ไม่สามารถย้อนกลับได้
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteEmployee}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                  <span>ลบ</span>
                </button>
                <button
                  onClick={() => setShowDeleteEmployeeModal(false)}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                  <span>ยกเลิก</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap with ProtectedRoute - Developer only
export default function RoleManagementPage() {
  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.DEV_ROLES}>
      <RoleManagementContent />
    </ProtectedRoute>
  );
}
