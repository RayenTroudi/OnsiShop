'use client';

import Price from '@/components/common/price';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useState } from 'react';

interface CartItem {
  id: string;
  quantity: number;
  cost: {
    totalAmount: { amount: string; currencyCode: string };
  };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: any[];
    product: {
      id: string;
      handle: string;
      title: string;
      featuredImage: {
        url: string;
        altText: string;
      };
    };
  };
}

interface CartData {
  lines: CartItem[];
  totalQuantity: number;
  cost: {
    totalAmount: { amount: string; currencyCode: string };
    totalTaxAmount: { amount: string; currencyCode: string };
  };
  checkoutUrl: string;
}

interface DatabaseCartModalProps {
  cart: CartData | null;
  isOpen: boolean;
  onClose: () => void;
  onCartUpdate: () => void;
}

export default function DatabaseCartModal({
  cart,
  isOpen,
  onClose,
  onCartUpdate
}: DatabaseCartModalProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    setIsUpdating(itemId);
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (response.ok) {
        onCartUpdate();
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setIsUpdating(itemId);
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        onCartUpdate();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <Transition show={isOpen}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="transition-all ease-in-out duration-300"
          enterFrom="opacity-0 backdrop-blur-none"
          enterTo="opacity-100 backdrop-blur-[.5px]"
          leave="transition-all ease-in-out duration-200"
          leaveFrom="opacity-100 backdrop-blur-[.5px]"
          leaveTo="opacity-0 backdrop-blur-none"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </Transition.Child>
        
        <Transition.Child
          as={Fragment}
          enter="transition-all ease-in-out duration-300"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transition-all ease-in-out duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <Dialog.Panel className="fixed bottom-0 right-0 top-0 flex h-full w-full flex-col border-l border-lightPurple bg-white/70 px-4 pb-6 pt-2 text-darkPurple backdrop-blur-lg md:w-[390px]">
            <div className="flex items-center justify-between">
              <p className="font-lora text-[28px] font-bold">My Cart</p>
              <button
                aria-label="Close cart"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {!cart || cart.lines.length === 0 ? (
              <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                  <path
                    d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V16.5M9 19.5C9.8 19.5 10.5 20.2 10.5 21S9.8 22.5 9 22.5 7.5 21.8 7.5 21 8.2 19.5 9 19.5ZM20 19.5C20.8 19.5 21.5 20.2 21.5 21S20.8 22.5 20 22.5 18.5 21.8 18.5 21 19.2 19.5 20 19.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-6 text-center font-quicksand text-2xl font-bold">
                  Your cart is empty.
                </p>
              </div>
            ) : (
              <div className="flex h-full flex-col justify-between overflow-hidden p-1">
                <ul className="flex-grow overflow-auto py-4">
                  {cart.lines.map((item) => (
                    <li key={item.id} className="flex w-full flex-col border-b border-purple">
                      <div className="relative flex w-full flex-row justify-between px-1 py-4">
                        <div className="absolute z-40 -mt-2 ml-[55px]">
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={isUpdating === item.id}
                            className="h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                        
                        <Link
                          href={`/product/${item.merchandise.product.handle}`}
                          onClick={onClose}
                          className="z-30 flex flex-row space-x-4"
                        >
                          <div className="relative h-16 w-16 cursor-pointer overflow-hidden rounded-md bg-neutral-300">
                            <Image
                              className="h-full w-full object-cover"
                              width={64}
                              height={64}
                              alt={item.merchandise.product.featuredImage.altText}
                              src={item.merchandise.product.featuredImage.url}
                            />
                          </div>
                          
                          <div className="flex flex-1 flex-col">
                            <span className="font-lora text-base font-bold leading-tight">
                              {item.merchandise.product.title}
                            </span>
                          </div>
                        </Link>
                        
                        <div className="flex h-16 flex-col justify-between">
                          <Price
                            className="flex justify-end space-y-2 text-right text-sm font-medium"
                            amount={item.cost.totalAmount.amount}
                            currencyCode={item.cost.totalAmount.currencyCode}
                          />
                          
                          <div className="ml-auto flex h-9 flex-row items-center rounded-[8px] bg-lightPurple">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={isUpdating === item.id}
                              className="h-9 w-9 flex items-center justify-center hover:bg-purple/20 rounded-l-[8px]"
                            >
                              −
                            </button>
                            <span className="w-6 border-x-2 border-purple/50 text-center font-lora font-bold leading-[1]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={isUpdating === item.id}
                              className="h-9 w-9 flex items-center justify-center hover:bg-purple/20 rounded-r-[8px]"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <div className="py-4 font-lora text-sm font-bold">
                  <div className="mb-3 flex items-center justify-between border-b border-purple pb-1">
                    <p>Taxes</p>
                    <Price
                      className="text-right text-base"
                      amount={cart.cost.totalTaxAmount.amount}
                      currencyCode={cart.cost.totalTaxAmount.currencyCode}
                    />
                  </div>
                  <div className="mb-3 flex items-center justify-between border-b border-purple pb-1 pt-1">
                    <p>Shipping</p>
                    <p className="text-right">Calculated at checkout</p>
                  </div>
                  <div className="mb-3 flex items-center justify-between border-b border-purple pb-1 pt-1">
                    <p>Total</p>
                    <Price
                      className="text-right text-base"
                      amount={cart.cost.totalAmount.amount}
                      currencyCode={cart.cost.totalAmount.currencyCode}
                    />
                  </div>
                </div>
                
                <Link
                  href={cart.checkoutUrl}
                  className="btn-dark text-center block"
                  onClick={onClose}
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
