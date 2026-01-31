import CartList from "@/components/order/CartList";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PERMISSIONS } from "@/lib/permissions";

export default function Cart() {
  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.VIEW_ORDERS}>
      <CartList />
    </ProtectedRoute>
  );
}
