'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { useCart } from '@/contexts/CartContext';
import { ArrowLeft, CreditCard, MapPin, Check, Loader2, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { API_BASE_URL } from '@/lib/api';
import { getUserSession } from '@/lib/auth';

interface Address {
  id: number;
  name: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  is_default: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getCartTotal, clearCart, isLoaded } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const paymentFormRef = useRef<HTMLFormElement>(null);

  // Address State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [saveAsNew, setSaveAsNew] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  useEffect(() => {
    if (isLoaded && cart.length === 0 && !success) {
      router.push('/cart');
    }
  }, [isLoaded, cart.length, success, router]);

  // Fetch addresses on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      const session = getUserSession();
      if (!session) return;

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/user/addresses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAddresses(data.data);

          // Select default address if exists
          if (data.data.length > 0) {
            const defaultAddr = data.data.find((a: Address) => a.is_default) || data.data[0];
            selectAddress(defaultAddr);
          } else {
            setIsNewAddress(true);
            setSaveAsNew(true);
          }
        } else {
          setIsNewAddress(true);
        }
      } catch (error) {
        console.error('Failed to fetch addresses', error);
        setIsNewAddress(true);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, []);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', notes: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('online');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const selectAddress = (addr: Address) => {
    setFormData(prev => ({
      ...prev,
      name: addr.name,
      phone: addr.phone,
      address: addr.address_line,
      city: addr.city,
      state: addr.state || '',
      pincode: addr.pincode,
      // Keep email and notes as they might be user specific rather than address specific, 
      // but usually name/phone are tied to address in this context.
      // Email is likely from user profile, but let's keep it editable.
    }));
    setSelectedAddressId(addr.id);
    setIsNewAddress(false);
    setSaveAsNew(false);
  };

  const handleAddNew = () => {
    setFormData(prev => ({ ...prev, name: '', phone: '', address: '', city: '', state: '', pincode: '' }));
    setSelectedAddressId(null);
    setIsNewAddress(true);
    setSaveAsNew(true);
  };

  const handleDeleteAddress = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/user/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setAddresses(prev => prev.filter(a => a.id !== id));
      if (selectedAddressId === id) {
        handleAddNew();
      }
    } catch (error) {
      console.error('Failed to delete address', error);
    }
  };

  const saveAddress = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/user/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          address_line: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          phone: formData.phone,
          is_default: addresses.length === 0
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAddresses(prev => [data.data, ...prev]);
      }
    } catch (error) {
      console.error('Failed to save address', error);
    }
  };

  const handlePlaceOrder = async () => {
    const session = getUserSession();
    if (!session) {
      alert('Please login to place an order');
      router.push('/login');
      return;
    }

    // Validate form
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
      alert('Please fill in all required fields');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Auto-save address if requested
      if (isNewAddress && saveAsNew) {
        await saveAddress();
      }

      const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`;

      // Place orders for all items in cart
      const orderPromises = cart.map(item => {
        return fetch(`${API_BASE_URL}/orders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            artworkId: item.artworkId,
            quantity: item.quantity,
            deliveryAddress: fullAddress,
            notes: formData.notes
          })
        });
      });

      const results = await Promise.all(orderPromises);
      const failures = results.filter(r => !r.ok);

      if (failures.length > 0) {
        const errorData = await failures[0].json();
        throw new Error(errorData.error || 'Failed to place some orders');
      }

      // Get the first order ID for payment reference
      const firstOrderResponse = await results[0].json();
      const orderId = firstOrderResponse.data.id;

      // If COD, just show success
      if (paymentMethod === 'cod') {
        setSuccess(true);
        clearCart();
        setTimeout(() => {
          router.push('/dashboard?tab=orders');
        }, 3000);
      } else {
        // Initiate online payment
        await initiatePayment(orderId);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || 'Something went wrong while placing your order');
      setLoading(false);
    }
  };

  const initiatePayment = async (orderId: number) => {
    try {
      const token = localStorage.getItem('token');
      const totalAmount = getCartTotal();

      const response = await fetch(`${API_BASE_URL}/payment/initiate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          amount: totalAmount,
          productInfo: `ArtRoot Order #${orderId}`,
          firstName: formData.name,
          email: formData.email,
          phone: formData.phone
        })
      });

      const data = await response.json();

      if (data.success) {
        // Create and submit PayU form
        const form = paymentFormRef.current;
        if (form) {
          // Clear existing form fields
          form.innerHTML = '';

          // Add all PayU parameters as hidden fields
          Object.entries(data.data.paymentParams).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value as string;
            form.appendChild(input);
          });

          // Set form action and submit
          form.action = data.data.paymentUrl;
          form.method = 'POST';
          form.submit();
        }
      } else {
        throw new Error(data.error || 'Failed to initiate payment');
      }
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      alert(error.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  if (!isLoaded || (cart.length === 0 && !success)) {
    return (
      <div className="min-h-screen bg-[#E6E1DC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D2691E] animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#E6E1DC]">
        <Navbar />
        <div className="pt-32 pb-16 flex items-center justify-center">
          <div className="text-center space-y-6 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-[#D2691E]/10 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-[#D2691E]" />
            </div>
            <h2 className="font-serif text-4xl text-[#2B2B2B]">Order Confirmed</h2>
            <p className="font-sans text-[#2B2B2B]/60">Your masterpiece is being prepared for dispatch.</p>
            <p className="font-sans text-xs uppercase tracking-widest text-[#2B2B2B]/40">Redirecting to Dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E6E1DC]">
      <Navbar />
      <div className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <button onClick={() => router.back()} className="flex items-center text-[#2B2B2B]/60 hover:text-[#D2691E] mb-8 transition-colors font-sans text-sm uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </button>

          <h1 className="font-serif text-4xl text-[#2B2B2B] mb-12">Secure Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2 space-y-12">

              {/* Shipping */}
              <section>
                <div className="flex items-center mb-6 border-b border-[#2B2B2B]/10 pb-2">
                  <MapPin className="w-5 h-5 text-[#D2691E] mr-3" />
                  <h2 className="font-serif text-xl text-[#2B2B2B]">Shipping Details</h2>
                </div>

                {/* Saved Addresses */}
                {!loadingAddresses && addresses.length > 0 && (
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                      <div
                        key={addr.id}
                        onClick={() => selectAddress(addr)}
                        className={`p-4 border rounded cursor-pointer transition-all relative group ${selectedAddressId === addr.id ? 'border-[#D2691E] bg-[#D2691E]/5' : 'border-[#2B2B2B]/20 hover:border-[#D2691E]/50'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-[#2B2B2B]">{addr.name}</p>
                            <p className="text-sm text-[#2B2B2B]/70 mt-1">{addr.address_line}</p>
                            <p className="text-sm text-[#2B2B2B]/70">{addr.city}, {addr.pincode}</p>
                            <p className="text-xs text-[#2B2B2B]/50 mt-2">{addr.phone}</p>
                          </div>
                          {selectedAddressId === addr.id && <Check className="w-4 h-4 text-[#D2691E]" />}
                        </div>
                        <button
                          onClick={(e) => handleDeleteAddress(e, addr.id)}
                          className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div
                      onClick={handleAddNew}
                      className={`p-4 border border-dashed rounded cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${isNewAddress ? 'border-[#D2691E] bg-[#D2691E]/5' : 'border-[#2B2B2B]/20 hover:border-[#D2691E]/50'}`}
                    >
                      <Plus className="w-6 h-6 text-[#2B2B2B]/40 mb-2" />
                      <span className="text-sm text-[#2B2B2B]/60">Add New Address</span>
                    </div>
                  </div>
                )}

                {/* Fallback loading */}
                {loadingAddresses && (
                  <div className="mb-6 text-center text-[#2B2B2B]/50">Loading saved addresses...</div>
                )}

                <div className={`grid md:grid-cols-2 gap-6 transition-opacity duration-300 ${!isNewAddress && selectedAddressId ? 'opacity-75' : 'opacity-100'}`}>
                  <input type="text" name="name" placeholder="Full Name *" value={formData.name} onChange={handleInputChange} className="bg-transparent border-b border-[#2B2B2B]/20 py-3 px-2 focus:outline-none focus:border-[#D2691E] font-sans text-sm" required />
                  <input type="email" name="email" placeholder="Email Address *" value={formData.email} onChange={handleInputChange} className="bg-transparent border-b border-[#2B2B2B]/20 py-3 px-2 focus:outline-none focus:border-[#D2691E] font-sans text-sm" required />
                  <input type="tel" name="phone" placeholder="Phone Number *" value={formData.phone} onChange={handleInputChange} className="bg-transparent border-b border-[#2B2B2B]/20 py-3 px-2 focus:outline-none focus:border-[#D2691E] font-sans text-sm" required />
                  <input type="text" name="address" placeholder="Street Address *" value={formData.address} onChange={handleInputChange} className="md:col-span-2 bg-transparent border-b border-[#2B2B2B]/20 py-3 px-2 focus:outline-none focus:border-[#D2691E] font-sans text-sm" required />
                  <input type="text" name="city" placeholder="City *" value={formData.city} onChange={handleInputChange} className="bg-transparent border-b border-[#2B2B2B]/20 py-3 px-2 focus:outline-none focus:border-[#D2691E] font-sans text-sm" required />
                  <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleInputChange} className="bg-transparent border-b border-[#2B2B2B]/20 py-3 px-2 focus:outline-none focus:border-[#D2691E] font-sans text-sm" />
                  <input type="text" name="pincode" placeholder="PIN Code *" value={formData.pincode} onChange={handleInputChange} className="bg-transparent border-b border-[#2B2B2B]/20 py-3 px-2 focus:outline-none focus:border-[#D2691E] font-sans text-sm" required />
                  <textarea name="notes" placeholder="Order Notes (Optional)" value={formData.notes} onChange={handleInputChange} rows={3} className="md:col-span-2 bg-transparent border-b border-[#2B2B2B]/20 py-3 px-2 focus:outline-none focus:border-[#D2691E] font-sans text-sm resize-none" />
                </div>

                {isNewAddress && (
                  <div className="mt-4 flex items-center">
                    <input
                      type="checkbox"
                      id="saveAddress"
                      checked={saveAsNew}
                      onChange={(e) => setSaveAsNew(e.target.checked)}
                      className="mr-2 accent-[#D2691E]"
                    />
                    <label htmlFor="saveAddress" className="text-sm text-[#2B2B2B]/70 cursor-pointer">Save this address for future orders</label>
                  </div>
                )}
              </section>

              {/* Payment */}
              <section>
                <div className="flex items-center mb-6 border-b border-[#2B2B2B]/10 pb-2">
                  <CreditCard className="w-5 h-5 text-[#D2691E] mr-3" />
                  <h2 className="font-serif text-xl text-[#2B2B2B]">Payment Method</h2>
                </div>
                <div className="space-y-4">
                  <div onClick={() => setPaymentMethod('online')} className={`p-4 border cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-[#D2691E] bg-[#D2691E]/5' : 'border-[#2B2B2B]/10'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${paymentMethod === 'online' ? 'bg-[#D2691E]' : 'bg-gray-300'}`} />
                        <div>
                          <span className="font-sans text-sm font-medium text-[#2B2B2B] block">Pay Online</span>
                          <span className="text-xs text-[#2B2B2B]/60">UPI, Cards, Net Banking, Wallets</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <img src="/payu-logo.png" alt="PayU" className="h-6" onError={(e) => e.currentTarget.style.display = 'none'} />
                      </div>
                    </div>
                  </div>
                  <div onClick={() => setPaymentMethod('cod')} className={`p-4 border cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#D2691E] bg-[#D2691E]/5' : 'border-[#2B2B2B]/10'}`}>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${paymentMethod === 'cod' ? 'bg-[#D2691E]' : 'bg-gray-300'}`} />
                      <div>
                        <span className="font-sans text-sm font-medium text-[#2B2B2B] block">Cash on Delivery</span>
                        <span className="text-xs text-[#2B2B2B]/60">Pay when you receive</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#2B2B2B] text-[#E6E1DC] p-8 md:sticky md:top-32">
                <h3 className="font-serif text-xl mb-6">Order Summary</h3>
                <div className="space-y-4 max-h-60 overflow-y-auto mb-6 pr-2">
                  {cart.map(item => (
                    <div key={item.artworkId} className="flex gap-3 text-sm">
                      <div className="w-12 h-16 bg-[#E6E1DC]/10 relative flex-shrink-0">
                        {item.image && <Image src={item.image} alt={item.title} fill className="object-cover opacity-80" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-[#E6E1DC]/60 text-xs">x{item.quantity}</p>
                      </div>
                      <p>₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#E6E1DC]/20 pt-4 mb-8">
                  <div className="flex justify-between text-lg font-serif">
                    <span>Total</span>
                    <span className="text-[#C9A24D]">₹{getCartTotal().toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full bg-[#D2691E] hover:bg-[#C9A24D] text-[#E6E1DC] py-4 font-sans text-xs uppercase tracking-widest transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    paymentMethod === 'online' ? 'Proceed to Payment' : 'Place Order'
                  )}
                </button>
                <p className="text-xs text-[#E6E1DC]/60 text-center mt-4">
                  {paymentMethod === 'online' ? 'Secure payment powered by PayU' : 'Pay cash when you receive your order'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden PayU Form */}
      <form ref={paymentFormRef} style={{ display: 'none' }}></form>

      <Footer />
    </div>
  );
}
