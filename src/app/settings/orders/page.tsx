import { CheckCircle, Truck, Clock } from "lucide-react";

type OrderStatus = "delivered" | "shipped" | "processing";

type Order = {
  id: string;
  productName: string;
  image: string;
  orderId: string;
  date: string;
  items: number;
  total: string;
  deliveryInfo?: string;
  status: OrderStatus;
};

const mockOrders: Order[] = [
  {
    id: "1",
    productName: "Modern Sofa Set",
    image: "https://images.unsplash.com/photo-1615874959474-d609969a20ed",
    orderId: "ORD-2024-001",
    date: "28/01/2024",
    items: 3,
    total: "₹4,599",
    deliveryInfo: "02/02/2024",
    status: "delivered",
  },
  {
    id: "2",
    productName: "Arc Floor Lamp",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c",
    orderId: "ORD-2024-002",
    date: "25/01/2024",
    items: 1,
    total: "₹1,299",
    deliveryInfo: "TRK789456123",
    status: "shipped",
  },
  {
    id: "3",
    productName: "Throw Pillows Set",
    image: "https://images.unsplash.com/photo-1616627987845-53c13a5c8c31",
    orderId: "ORD-2024-003",
    date: "20/01/2024",
    items: 2,
    total: "₹899",
    status: "processing",
  },
];

const statusConfig = {
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    badge: "bg-[#E6F4EA] text-[#2E7D32]",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    badge: "bg-[#E8F0FE] text-[#1A73E8]",
  },
  processing: {
    label: "Processing",
    icon: Clock,
    badge: "bg-[#FFF4E5] text-[#B26A00]",
  },
};

export default function OrderHistoryPage() {
  return (
    <div className="min-h-screen bg-[#F7F4EF] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-md space-y-6 sm:max-w-lg">

        {/* Page Title */}
        <h1 className="text-lg font-semibold text-neutral-900 sm:text-xl">
          Order History
        </h1>

        {/* Orders */}
        {mockOrders.map((order) => {
          const StatusIcon = statusConfig[order.status].icon;

          return (
            <div
              key={order.id}
              className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
            >
              {/* Image */}
              <img
                src={order.image}
                alt={order.productName}
                className="h-40 w-full object-cover"
              />

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Title + Status */}
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-neutral-900">
                    {order.productName}
                  </p>

                  <span
                    className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[order.status].badge}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {statusConfig[order.status].label}
                  </span>
                </div>

                {/* Meta */}
                <div className="space-y-1 text-xs text-neutral-600">
                  <p>Order ID: {order.orderId}</p>
                  <p>Date: {order.date}</p>
                  <p>Items: {order.items}</p>
                  <p>Total: {order.total}</p>

                  {order.status === "delivered" && (
                    <p>Delivery: {order.deliveryInfo}</p>
                  )}

                  {order.status === "shipped" && (
                    <p>Tracking Number: {order.deliveryInfo}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-2 text-xs font-medium">
                  <button className="text-neutral-600 hover:text-neutral-800">
                    View Details
                  </button>

                  {order.status === "delivered" && (
                    <button className="text-neutral-600 hover:text-neutral-800">
                      Write a Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}
