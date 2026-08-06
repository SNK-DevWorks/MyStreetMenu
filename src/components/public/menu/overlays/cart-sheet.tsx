'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, Trash2, ShoppingBag, Tag, ChevronRight, CheckCircle, User, Phone, Utensils, MessageSquare } from 'lucide-react';
import type { FoodCardItem } from '@/components/shared/item';
import type { CartSummary, ActiveOrder } from '../types';
import { QuantityStepper } from '../ui/quantity-stepper';
import { getCategoryEmoji, getItemUnitPrice, formatSavings } from '../utils';

interface CartItem {
  item: FoodCardItem;
  quantity: number;
}

interface CartSheetProps {
  cartItems: CartItem[];
  cartSummary: CartSummary;
  vendorName: string;
  vendorAddress: string;
  whatsapp?: string | null;
  phone?: string | null;
  onClose: () => void;
  onIncrement: (itemId: string) => void;
  onDecrement: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  onClearCart: () => void;
  onOrderPlaced?: (order: ActiveOrder) => void;
  initialOrderStatus?: OrderStatus;
  activeOrder?: ActiveOrder | null;
  ordersList?: ActiveOrder[];
}

type Step = 'cart' | 'details';
type OrderStatus = 'idle' | 'placing' | 'success';

const QUICK_INSTRUCTION_PILLS = [
  'Less spicy',
  'No onion',
  'Extra sauce',
  'Make it hot',
  'Jain food',
];

export function CartSheet({
  cartItems,
  cartSummary,
  vendorName,
  vendorAddress,
  whatsapp,
  phone,
  onClose,
  onIncrement,
  onDecrement,
  onRemove,
  onClearCart,
  onOrderPlaced,
  initialOrderStatus = 'idle',
  activeOrder = null,
  ordersList = [],
}: CartSheetProps) {
  const [step, setStep] = useState<Step>('cart');
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(initialOrderStatus);
  const [tokenNumber] = useState(() => activeOrder?.tokenNumber || ('A' + Math.floor(20 + Math.random() * 70)));

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [nameError, setNameError] = useState(false);

  // Auto-fill table number from URL if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTable = params.get('table');
      if (urlTable) {
        setTableNumber(urlTable);
      }
    }
  }, []);

  const handlePlaceOrder = () => {
    if (!customerName.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);

    const placedOrder: ActiveOrder = {
      tokenNumber,
      itemsCount: cartSummary.totalItemsCount,
      totalPrice: cartSummary.totalPrice,
      totalSavings: cartSummary.totalSavings,
      lastAddedItem: cartSummary.lastAddedItem,
      items: cartItems,
      customerName: customerName.trim() || undefined,
      tableNumber: tableNumber.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      specialInstructions: specialInstructions.trim() || undefined,
    };

    setOrderStatus('placing');
    setTimeout(() => {
      setOrderStatus('success');
      if (onOrderPlaced) {
        onOrderPlaced(placedOrder);
      }
    }, 300);
  };

  const handlePillClick = (pill: string) => {
    setSpecialInstructions(prev => {
      if (!prev.trim()) return pill;
      if (prev.includes(pill)) return prev;
      return `${prev}, ${pill}`;
    });
  };

  // ── Success / View Order Screen ──────────────────────────────────────────
  if (orderStatus === 'success') {
    const allOrders = ordersList.length > 0
      ? ordersList
      : (activeOrder ? [activeOrder] : [{
          tokenNumber,
          itemsCount: cartSummary.totalItemsCount,
          totalPrice: cartSummary.totalPrice,
          totalSavings: cartSummary.totalSavings,
          lastAddedItem: cartSummary.lastAddedItem,
          items: cartItems,
          customerName: customerName.trim() || undefined,
          tableNumber: tableNumber.trim() || undefined,
          specialInstructions: specialInstructions.trim() || undefined,
        }]);

    const latestOrder = allOrders[allOrders.length - 1];
    const grandTotal = allOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    return (
      <div className="fixed inset-0 z-50 bg-[#FDFBF7] flex flex-col overflow-y-auto animate-in fade-in duration-300 p-4 sm:p-6">
        <div className="flex flex-col items-center text-center max-w-md w-full mx-auto my-auto py-4">
          {/* Flipkart-Style Solid Success Checkmark Badge */}
          <div className="relative w-16 h-16 rounded-full bg-[#00B56A] shadow-[0_6px_20px_rgba(0,181,106,0.3)] flex items-center justify-center mb-3 animate-in zoom-in-50 duration-300 shrink-0">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-9 h-9 text-white"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-1">
            {allOrders.length > 1 ? `${allOrders.length} Orders Placed` : 'Order Placed'}
          </h2>

          {/* Tokens Row */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center my-1">
            {allOrders.map((ord, idx) => (
              <div
                key={`tok-${idx}`}
                className="inline-flex items-center gap-1 bg-orange-50 border border-orange-200 text-[#FF6B00] px-3 py-1 rounded-full text-xs font-bold"
              >
                <span>Token #{ord.tokenNumber}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 font-medium mt-0.5 mb-4">
            Estimated time: 15 mins
          </p>

          {/* All Placed Order Breakdown Cards */}
          <div className="w-full space-y-4 mb-4 text-left">
            {allOrders.map((ord, orderIdx) => {
              const name = ord.customerName;
              const table = ord.tableNumber;
              const instructions = ord.specialInstructions;

              return (
                <div key={`order-card-${orderIdx}`} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-gray-900">
                        Token #{ord.tokenNumber}
                      </span>
                      {allOrders.length > 1 && (
                        <span className="text-[10px] text-gray-400 font-semibold">
                          (Order {orderIdx + 1})
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Confirmed
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2.5 mb-3 divide-y divide-gray-50">
                    {ord.items.map(({ item, quantity }, itemIdx) => {
                      const unitPrice = getItemUnitPrice(item);
                      const lineTotal = unitPrice * quantity;

                      return (
                        <div key={`item-${orderIdx}-${itemIdx}`} className="flex items-center gap-3 pt-2 first:pt-0">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 flex items-center justify-center">
                            {item.image ? (
                              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-base">
                                {getCategoryEmoji(item.category || '')}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-xs text-gray-900 leading-tight truncate">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                              Qty: {quantity} × ₹{unitPrice}
                            </p>
                          </div>

                          <span className="font-extrabold text-xs text-gray-900 shrink-0">
                            ₹{lineTotal}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Customer details if present */}
                  {(name || table || instructions) && (
                    <div className="bg-gray-50/80 rounded-xl p-2.5 border border-gray-100 text-[11.5px] space-y-1 mb-3 text-gray-700 font-medium">
                      {name && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Customer:</span>
                          <span className="font-bold text-gray-900">{name}</span>
                        </div>
                      )}
                      {table && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Table:</span>
                          <span className="font-bold text-gray-900">{table}</span>
                        </div>
                      )}
                      {instructions && (
                        <div className="pt-1 border-t border-gray-200/50">
                          <span className="text-gray-400 block mb-0.5">Instructions:</span>
                          <span className="font-semibold text-gray-800 italic">"{instructions}"</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Subtotal */}
                  <div className="border-t border-gray-100 pt-2 flex justify-between items-center text-xs font-bold text-gray-900">
                    <span className="text-gray-500">Order Subtotal</span>
                    <span className="text-gray-900">₹{ord.totalPrice}</span>
                  </div>
                </div>
              );
            })}

            {/* Grand Total Row */}
            <div className="bg-orange-50/80 border border-orange-200/80 rounded-2xl p-3.5 flex justify-between items-center">
              <div>
                <span className="font-extrabold text-sm text-gray-900 block leading-tight">Total Placed</span>
                <span className="text-[11px] text-gray-500 font-medium">Pay at Counter</span>
              </div>
              <span className="font-black text-[#FF6B00] text-lg">₹{grandTotal}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (cartItems.length > 0) onClearCart();
              onClose();
            }}
            className="w-full bg-gradient-to-r from-[#FF6B00] via-[#FF7A1A] to-[#FF8C33] hover:opacity-95 text-white font-extrabold text-sm rounded-xl py-3 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // ── Step 2: Customer Details Form ──────────────────────────────────────────
  if (step === 'details') {
    return (
      <div className="fixed inset-0 z-50 bg-[#FDFBF7] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep('cart')}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-all active:scale-90 cursor-pointer"
              aria-label="Back to cart"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            <div>
              <h1 className="font-extrabold text-lg text-gray-900 leading-tight">Customer Details</h1>
              <p className="text-xs text-gray-500 font-medium">Ask only what is required.</p>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Name (Required) */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs space-y-1.5">
            <label className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <User size={14} className="text-[#FF6B00]" />
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              value={customerName}
              onChange={e => {
                setCustomerName(e.target.value);
                if (e.target.value.trim()) setNameError(false);
              }}
              className={`w-full bg-gray-50 border ${nameError ? 'border-red-500 focus:ring-red-400' : 'border-gray-200 focus:border-[#FF6B00]'} rounded-xl px-3.5 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white transition-all font-medium`}
            />
            {nameError && (
              <p className="text-xs font-semibold text-red-500 mt-1">Please enter your name to proceed</p>
            )}
          </div>

          {/* Table Number */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs space-y-1.5">
            <label className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Utensils size={14} className="text-[#FF6B00]" />
              Table Number
            </label>
            <input
              type="text"
              placeholder="e.g. 5, T-12"
              value={tableNumber}
              onChange={e => setTableNumber(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-[#FF6B00] rounded-xl px-3.5 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Phone (Optional) */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs space-y-1.5">
            <label className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Phone size={14} className="text-[#FF6B00]" />
              Phone <span className="text-gray-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="tel"
              placeholder="Enter mobile number"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-[#FF6B00] rounded-xl px-3.5 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Special Instructions (Optional) */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs space-y-2">
            <label className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare size={14} className="text-[#FF6B00]" />
              Special instructions <span className="text-gray-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Example: Less spicy, No onion, Extra sauce..."
              value={specialInstructions}
              onChange={e => setSpecialInstructions(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-[#FF6B00] rounded-xl p-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white transition-all font-medium resize-none"
            />

            {/* Quick Pills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {QUICK_INSTRUCTION_PILLS.map((pill, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePillClick(pill)}
                  className="text-xs font-bold text-gray-600 bg-gray-100 hover:bg-orange-50 hover:text-[#FF6B00] border border-gray-200 hover:border-orange-200 px-3 py-1 rounded-full transition-all cursor-pointer"
                >
                  + {pill}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Bottom Action Bar — Place Order */}
        <div className="shrink-0 bg-white border-t border-gray-100 px-4 pt-3 pb-5 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={orderStatus === 'placing'}
            className="w-full flex items-center justify-between bg-gradient-to-r from-[#FF6B00] via-[#FF7A1A] to-[#FF8C33] hover:opacity-95 text-white font-extrabold text-base sm:text-lg rounded-2xl px-5 h-13 sm:h-14 shadow-md active:scale-98 transition-all cursor-pointer disabled:opacity-70"
          >
            <span className="font-extrabold text-base sm:text-lg">Place Order</span>
            <div className="flex items-center gap-1">
              <span className="font-black text-base sm:text-lg">₹{cartSummary.totalPrice}</span>
              {orderStatus === 'placing' ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin ml-1" />
              ) : (
                <ChevronRight size={20} strokeWidth={3} />
              )}
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ── Step 1: Cart Review Screen ─────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-[#FDFBF7] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-all active:scale-90 cursor-pointer"
            aria-label="Back to menu"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="font-extrabold text-lg text-gray-900 leading-tight">Your Cart</h1>
            <p className="text-xs text-gray-500 font-medium">{cartSummary.totalItemsCount} {cartSummary.totalItemsCount === 1 ? 'item' : 'items'} • {vendorName}</p>
          </div>
        </div>

        {cartItems.length > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-all cursor-pointer active:scale-95"
          >
            <Trash2 size={13} strokeWidth={2.5} />
            Clear
          </button>
        )}
      </div>

      {/* Empty State */}
      {cartItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center">
          <div className="w-24 h-24 rounded-full bg-orange-50 border-2 border-orange-100 flex items-center justify-center">
            <ShoppingBag size={42} className="text-[#FF6B00]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-extrabold text-lg text-gray-900 mb-1">Your cart is empty</p>
            <p className="text-sm text-gray-400 font-medium">Add items from the menu to get started</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-gradient-to-r from-[#FF6B00] via-[#FF7A1A] to-[#FF8C33] text-white font-extrabold text-sm px-8 py-3 rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <>
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto pb-4">
            {/* Cart Items List */}
            <div className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden divide-y divide-gray-50">
              {cartItems.map(({ item, quantity }) => {
                const unitPrice = getItemUnitPrice(item);
                const lineTotal = unitPrice * quantity;

                return (
                  <div key={item.id} className="flex items-center gap-3 p-4">
                    {/* Image */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 relative">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl bg-orange-50/50">
                          {getCategoryEmoji(item.category || '')}
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[14px] text-gray-900 leading-tight truncate">{item.title}</p>
                      {item.category && (
                        <p className="text-[11px] text-gray-400 font-medium mt-0.5">{item.category}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-extrabold text-sm text-gray-900">₹{lineTotal}</span>
                        {item.hasDiscount && item.priceOriginal != null && (
                          <span className="text-[11px] text-gray-400 line-through">₹{item.priceOriginal * quantity}</span>
                        )}
                        {quantity > 1 && (
                          <span className="text-[10px] text-[#FF6B00] font-bold">
                            (₹{unitPrice} each)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stepper + Remove */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <QuantityStepper
                        quantity={quantity}
                        onDecrement={() => onDecrement(item.id)}
                        onIncrement={() => onIncrement(item.id)}
                        className="w-24"
                        size="sm"
                      />
                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="text-[10px] text-red-400 hover:text-red-500 font-semibold flex items-center gap-0.5 cursor-pointer"
                      >
                        <Trash2 size={10} /> Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add More Items */}
            <button
              type="button"
              onClick={onClose}
              className="mx-4 mt-3 w-[calc(100%-2rem)] flex items-center justify-center gap-2 bg-white border border-[#FF6B00]/40 text-[#FF6B00] font-bold text-sm py-3 rounded-2xl hover:bg-orange-50 active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-[18px] font-light leading-none">+</span>
              Add more items
            </button>

            {/* Offer / Savings Banner */}
            {cartSummary.totalSavings > 0 && (
              <div className="mx-4 mt-4 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 font-extrabold text-xs">
                  <Tag size={14} />
                </div>
                <p className="text-sm font-bold text-green-700">
                  You're saving <span className="text-green-800 font-black">₹{formatSavings(cartSummary.totalSavings)}</span> on this order 🎉
                </p>
              </div>
            )}

            {/* Bill Details */}
            <div className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-gray-900">Bill Details</h3>
                <span className="text-[11px] font-bold text-[#FF6B00] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">Pay at Counter</span>
              </div>
              <div className="px-4 py-3 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">Item Total</span>
                  <span className="font-bold text-gray-900">₹{cartSummary.totalPrice}</span>
                </div>
                {cartSummary.totalSavings > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600 font-medium">Discount</span>
                    <span className="font-bold text-green-600">− ₹{formatSavings(cartSummary.totalSavings)}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                  <span className="font-extrabold text-base text-gray-900">Estimated Total</span>
                  <span className="font-black text-lg text-gray-900">₹{cartSummary.totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Microcopy Note */}
            <p className="mx-4 mt-3 text-[11px] text-gray-400 font-medium leading-relaxed">
              Payment will be collected after order confirmation.
            </p>
          </div>

          {/* Sticky Bottom Action Bar — Confirm */}
          <div className="shrink-0 bg-white border-t border-gray-100 px-4 pt-3 pb-5 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
            <button
              type="button"
              onClick={() => setStep('details')}
              className="w-full flex items-center justify-between bg-gradient-to-r from-[#FF6B00] via-[#FF7A1A] to-[#FF8C33] hover:opacity-95 text-white font-extrabold text-base sm:text-lg rounded-2xl px-5 h-13 sm:h-14 shadow-md active:scale-98 transition-all cursor-pointer"
            >
              <span className="font-extrabold text-base sm:text-lg">Confirm</span>
              <div className="flex items-center gap-1">
                <span className="font-black text-base sm:text-lg">₹{cartSummary.totalPrice}</span>
                <ChevronRight size={20} strokeWidth={3} />
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
